import React, { useState, useRef, useEffect } from 'react';
import { Accordion, Table, Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import AccordionItem from '../../components/common/AccordionItem';
import KYCFormFieldType from '../../components/register/KYCFormFieldType';

import { KYC_REGISTER_FIELDS_ARRAY, STATES_ARRAY } from '../../constants';


const RegisterDataForm = ({ errors, onConfirm, onLoaded, onErrors, activeMember }) => {
  const [expanded, setExpanded] = useState(1);
  const [activeKey, setActiveKey] = useState(1);
  const [activeRow, setActiveRow] = useState({ isEditing: false, isDeleting: false, isAdding: false, fldName: '', fldValue: '', isFetchedUUID: false, entityuuid: {} });
  const tbodyRef = useRef()
  const registeredItemRef = useRef(null);
  const accordionItemProps = { expanded, onSetExpanded: setExpanded }
  const entityFields = ['firstName', 'lastName', 'dateOfBirth']
  const phoneFields = ['phone']
  const emailFields = ['email']
  const identityFields = ['ssn']
  const addressFields = ['address', 'city', 'state', 'zip']

  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const activeUser = activeMember ? app.users.find(u => u.handle === activeMember.user_handle) : app.activeUser;

  let updatedEntityData = {};
  let updatedResponses = [];
  let validationErrors = {};
  let result = {};
  let appData = {};
  let ApiEndpoint;

  const onEditToggle = (fieldName, fieldValue) => {
    setActiveRow({
      ...activeRow,
      isEditing: (activeRow.isEditing && activeRow.fldName === fieldName) ? false : true,
      fldName: (activeRow.isEditing && activeRow.fldName === fieldName) ? '' : fieldName,
      fldValue: (activeRow.isEditing && activeRow.fldName === fieldName) ? '' : fieldValue
    });
  }
  const onEditing = (e) => {
    setActiveRow({...activeRow, fldValue: e.target.value || undefined});
  }
  const onSave = async (fieldName) => {
    if (activeRow.isEditing && (!activeRow.fldValue || activeRow.fldValue === activeUser[fieldName])) return;
    if (activeRow.isAdding && !activeRow.fldValue) return;

    if (activeUser && activeUser.handle) {
      if (onLoaded) onLoaded(false);
      let updateSuccess = false;
      if (entityFields.includes(fieldName)) {
        try {
          const entityUpdateData = {};
          if (fieldName === 'firstName') entityUpdateData.first_name = activeRow.fldValue;
          if (fieldName === 'lastName') entityUpdateData.last_name = activeRow.fldValue;
          if (fieldName === 'dateOfBirth') entityUpdateData.birthdate = activeRow.fldValue;

          const entityUpdateRes = await api.updateEntity(activeUser.handle, activeUser.private_key, entityUpdateData);
          updatedResponses = [ ...updatedResponses, { endpoint: '/update/entity', result: JSON.stringify(entityUpdateRes, null, '\t') } ];

          if (entityUpdateRes.data.success) {
            updateSuccess = true;
            if (fieldName === 'firstName') updatedEntityData = { ...updatedEntityData, firstName: activeRow.fldValue };
            if (fieldName === 'lastName') updatedEntityData = { ...updatedEntityData, lastName: activeRow.fldValue };
            if (fieldName === 'dateOfBirth') updatedEntityData = { ...updatedEntityData, dateOfBirth: activeRow.fldValue };
          }  else if (entityUpdateRes.data.validation_details) {
            validationErrors = { entity: entityUpdateRes.data.validation_details }
          } else {
            console.log(`... update entity ${fieldName} failed!`, entityUpdateRes);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (phoneFields.includes(fieldName)) {
        try {
          let phoneRes = {}
          if (activeRow.isAdding) {
            ApiEndpoint = '/add/phone';
            phoneRes = await api.addPhone(activeUser.handle, activeUser.private_key, activeRow.fldValue, {});
          } else {
            ApiEndpoint = '/update/phone';
            phoneRes = await api.updatePhone(activeUser.handle, activeUser.private_key, {
              phone: activeRow.fldValue,
              uuid: activeRow.entityuuid.phone
            });
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(phoneRes, null, '\t') } ];

          if (phoneRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, phone: activeRow.fldValue };
          }  else if (phoneRes.data.validation_details) {
            validationErrors.contact = Object.assign({phone: phoneRes.data.validation_details.phone}, validationErrors.contact);
          } else {
            console.log(`... update entity ${fieldName} failed!`, phoneRes);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (emailFields.includes(fieldName)) {
        try {
          let emailRes = {}
          if (activeRow.isAdding) {
            ApiEndpoint = '/add/email';
            emailRes = await api.addEmail(activeUser.handle, activeUser.private_key, activeRow.fldValue);
          } else {
            ApiEndpoint = '/update/email';
            emailRes = await api.updateEmail(activeUser.handle, activeUser.private_key, {
              email: activeRow.fldValue,
              uuid: activeRow.entityuuid.email
            });
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(emailRes, null, '\t') } ];

          if (emailRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, email: activeRow.fldValue };
          }  else if (emailRes.data.validation_details) {
            validationErrors.contact = Object.assign({email: emailRes.data.validation_details.email}, validationErrors.contact);
          } else {
            console.log(`... update entity ${fieldName} failed!`, emailRes);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (identityFields.includes(fieldName)) {
        try {
          let ssnRes = {}
          let identityUpdateData = {
            alias: 'SSN',
            value: activeRow.fldValue
          };

          if (activeRow.isAdding) {
            ApiEndpoint = '/add/identity';
            ssnRes = await api.addIdentity(activeUser.handle, activeUser.private_key, identityUpdateData);
          } else {
            ApiEndpoint = '/update/identity';
            identityUpdateData.uuid = activeRow.entityuuid.identity;
            ssnRes = await api.updateIdentity(activeUser.handle, activeUser.private_key, identityUpdateData);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(ssnRes, null, '\t') } ];

          if (ssnRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, ssn: activeRow.fldValue };
          }  else if (ssnRes.data.validation_details) {
            validationErrors = { identity: ssnRes.data.validation_details }
          } else {
            console.log(`... update entity ${fieldName} failed!`, ssnRes);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (addressFields.includes(fieldName)) {
        try {
          const addressUpdateData = {};
          if (fieldName === 'address') addressUpdateData.street_address_1 = activeRow.fldValue;
          if (fieldName === 'city') addressUpdateData.city = activeRow.fldValue;
          if (fieldName === 'state') addressUpdateData.state = activeRow.fldValue;
          if (fieldName === 'zip') addressUpdateData.postal_code = activeRow.fldValue;

          let addressRes = {};
          if (activeRow.isAdding && !activeUser.address) {
            ApiEndpoint = '/add/address';
            if (activeUser.address) addressUpdateData.street_address_1 = activeUser.address;
            addressRes = await api.addAddress(activeUser.handle, activeUser.private_key, addressUpdateData);
          } else {
            ApiEndpoint = '/update/address';
            addressUpdateData.uuid = activeRow.entityuuid.address;
            addressRes = await api.updateAddress(activeUser.handle, activeUser.private_key, addressUpdateData);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(addressRes, null, '\t') } ];

          if (addressRes.data.success) {
            updateSuccess = true;
            if (fieldName === 'address') updatedEntityData = { ...updatedEntityData, address: activeRow.fldValue };
            if (fieldName === 'city') updatedEntityData = { ...updatedEntityData, city: activeRow.fldValue };
            if (fieldName === 'state') updatedEntityData = { ...updatedEntityData, state: activeRow.fldValue };
            if (fieldName === 'zip') updatedEntityData = { ...updatedEntityData, zip: activeRow.fldValue };

            if (activeRow.isAdding && fieldName === 'address' ) {
              setActiveRow({...activeRow, entityuuid: {
                email: activeRow.entityuuid.email ? activeRow.entityuuid.email : '',
                phone: activeRow.entityuuid.phone ? activeRow.entityuuid.phone : '',
                identity: activeRow.entityuuid.identity ? activeRow.entityuuid.identity : '',
                address: addressRes.data.address.uuid
              } })
            }
          }  else if (addressRes.data.validation_details) {
            if (addressRes.data.validation_details.address instanceof Object) {
              validationErrors = { address: addressRes.data.validation_details.address }
            } else {
              if (!activeUser.address && fieldName === 'address') {
                validationErrors.address = Object.assign({street_address_1: addressRes.data.validation_details.street_address_1}, validationErrors.address);
              } else if (!activeUser.address && fieldName !== 'address') {
                if (fieldName === 'city') validationErrors.address = Object.assign({city: "Please add address first!"}, validationErrors.address);
                if (fieldName === 'state') validationErrors.address = Object.assign({state: "Please add address first!"}, validationErrors.address);
                if (fieldName === 'zip') validationErrors.address = Object.assign({postal_code: "Please add address first!"}, validationErrors.address);
              } else {
                if (fieldName === 'address') validationErrors.address = Object.assign({street_address_1: addressRes.data.validation_details.street_address_1}, validationErrors.address);
                if (fieldName === 'city') validationErrors.address = Object.assign({city: addressRes.data.validation_details.city}, validationErrors.address);
                if (fieldName === 'state') validationErrors.address = Object.assign({state: addressRes.data.validation_details.state}, validationErrors.address);
                if (fieldName === 'zip') validationErrors.address = Object.assign({postal_code: addressRes.data.validation_details.postal_code}, validationErrors.address);
              }
            }
          } else {
            console.log(`... update entity ${fieldName} failed!`, addressRes);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      try {
        console.log(`  ... update ${fieldName} field completed!`);
        if (updateSuccess) {
          refreshApp();
          const appUser = app.users.find(u => u.handle === activeUser.handle);
          updatedEntityData = { ...appUser, ...updatedEntityData, kycLevel: app.settings.preferredKycLevel }
          result = {
            activeUser: { ...appUser, ...updatedEntityData } ,
            alert: { message: activeRow.isAdding ? 'Registration data was successfully added.' : 'Registration data was successfully updated and saved.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === activeUser.handle ? { ...u, ...updatedEntityData } : u),
          };
          if (Object.keys(errors).length || Object.keys(validationErrors).length) onErrors({});
          setActiveRow({...activeRow, isEditing: activeRow.isEditing ? false : activeRow.isEditing, isDeleting: false, fldName: '', fldValue: '', isFetchedUUID: activeRow.isAdding ? false :  activeRow.isFetchedUUID });
        } else if ( Object.keys(validationErrors).length ) {
          onErrors(validationErrors);
        }

        setAppData({
          ...appData,
          responses: [...app.responses, ...updatedResponses]
        }, () => {
          updateApp({ ...result });
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
      if (onLoaded) onLoaded(true);
    }
  }
  const onDelete = async (fieldName, fieldLabel) => {
    setActiveRow({...activeRow, isDeleting: true, fldName: fieldName, isAdding: false });

    onConfirm({ show: true, message: `Are you sure you want to delete the ${fieldLabel} data point from the registered data?`, onSuccess: async () => {
      let deleteSuccess = false;
      let deleteRes = {};
      onLoaded(false);
      onConfirm({show: false, message: ''});
      try {
        if (emailFields.includes(fieldName)) {
          ApiEndpoint = 'email';
          deleteRes = await api.deleteEmail(activeUser.handle, activeUser.private_key, activeRow.entityuuid.email);
        } else if (phoneFields.includes(fieldName)) {
          ApiEndpoint = 'phone';
          deleteRes = await api.deletePhone(activeUser.handle, activeUser.private_key, activeRow.entityuuid.phone);
        } else if (identityFields.includes(fieldName)) {
          ApiEndpoint = 'identity';
          deleteRes = await api.deleteIdentity(activeUser.handle, activeUser.private_key, activeRow.entityuuid.identity);
        } else if (addressFields.includes(fieldName)) {
          ApiEndpoint = 'address';
          deleteRes = await api.deleteAddress(activeUser.handle, activeUser.private_key, activeRow.entityuuid.address);
        } else {
          validationErrors = Object.assign({error: "Registration data can not be deleted because it is required for this KYC level."}, validationErrors.error);
        }

        if (ApiEndpoint) updatedResponses = [ ...updatedResponses, { endpoint: `/delete/${ApiEndpoint}`, result: JSON.stringify(deleteRes, null, '\t') } ];

        if (deleteRes.data && deleteRes.data.success) {
          deleteSuccess = true;
          if (emailFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, email: '' };
          if (phoneFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, phone: '' };
          if (identityFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, ssn: '' };
          if (addressFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, address: '', city: '', state: '', zip: '' };
        }  else if (deleteRes.data && deleteRes.data.validation_details) {
          validationErrors = Object.assign({error: deleteRes.data.validation_details.uuid}, validationErrors.error);
        } else {
          console.log(`... delete entity ${fieldName} failed!`, deleteRes);
        }
      } catch (err) {
        console.log(`  ... unable to delete entity ${fieldName}, looks like we ran into an issue!`);
        handleError(err);
      }

      try {
        if (deleteSuccess) {
          console.log(`  ... delete ${fieldName} field completed!`);

          refreshApp();
          const appUser = app.users.find(u => u.handle === activeUser.handle);
          updatedEntityData = { ...appUser, ...updatedEntityData, kycLevel: app.settings.preferredKycLevel }
          result = {
            activeUser: { ...appUser, ...updatedEntityData },
            alert: { message: 'Registration data was successfully deleted.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === activeUser.handle ? { ...u, ...updatedEntityData } : u),
          };

          setAppData({
            ...appData,
            responses: [...app.responses, ...updatedResponses]
          }, () => {
            updateApp({ ...result });
          });
        } else if ( Object.keys(validationErrors).length ) {
          updateApp({ ...app, alert: { message: validationErrors.error, type: 'danger' } });
        }
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }

      setActiveRow({...activeRow, isDeleting: false, fldName: '' });
      onLoaded(true);
    }, onHide: () => {
      onConfirm({show: false, message: ''});
      setActiveRow({...activeRow, isDeleting: false, fldName: '' });
    } })
  }
  const onAddDataToggle = (e) => {
    setActiveRow({...activeRow, isAdding: !activeRow.isAdding ? true : false, isEditing: false, isDeleting: false, fldName: '', fldValue: '' })
  }
  const onChooseAddDataToggle = (e) => {
    setActiveRow({...activeRow, fldName: e.target.value ? e.target.value : '', fldValue: '', isEditing: false, isDeleting: false })
  }

  useEffect(() => {
    async function fetchEntity() {
      try {
        if (onLoaded) onLoaded(false);
        const entityRes = await api.getEntity(activeUser.handle, activeUser.private_key);
        if (entityRes.data.success) {
          setActiveRow({...activeRow, isFetchedUUID: true, entityuuid: {
            email: entityRes.data.emails[0] ? entityRes.data.emails[0]['uuid'] : '',
            phone: entityRes.data.phones[0] ? entityRes.data.phones[0]['uuid'] : '',
            identity: entityRes.data.identities[0] ? entityRes.data.identities[0]['uuid'] : '',
            address: entityRes.data.addresses[0] ? entityRes.data.addresses[0]['uuid'] : ''
          } })
          if (onLoaded) onLoaded(true);
        }
      } catch (err) {
        console.log('  ... unable to get entity info, looks like we ran into an issue!');
      }
    }
    if (!Object.keys(activeRow.entityuuid).length || !activeRow.isFetchedUUID) {
      fetchEntity();
    }

    const checkIfClickedOutside = (e) => {
      if (activeRow.isEditing && tbodyRef.current && !tbodyRef.current.contains(e.target)) {
        setActiveRow({...activeRow, isEditing: false, fldName: '', fldValue: ''});
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [activeRow, api, activeUser, onLoaded, activeMember])

  return (
    <Accordion className="mb-3 mb-md-5" defaultActiveKey={expanded ? expanded : undefined} onSelect={e => setActiveKey(e)}>
      <AccordionItem className="registered-data" eventKey={1} label="Registered Data" activeKey={activeKey} itemRef={registeredItemRef} {...accordionItemProps}>
        <Table responsive hover>
          <thead>
            <tr>
              <th className="font-weight-bold">Description</th>
              <th className="font-weight-bold">Value</th>
              <th className="font-weight-bold">Action</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {KYC_REGISTER_FIELDS_ARRAY.filter(fieldsOption => activeUser && activeUser[fieldsOption.value]).map((fieldsOption, index) => {
              return (<tr key={index}>
                <td>{fieldsOption.label}</td>
                <td>{activeRow.isEditing && activeRow.fldName === fieldsOption.value  ? <KYCFormFieldType fieldType={fieldsOption.value} errors={errors} activeUser={activeUser} onEditing={onEditing} onSave={onSave} /> : (fieldsOption.label === 'State') ? STATES_ARRAY.map((s) => { return s.value === activeUser[fieldsOption.value] ? s.label : '' }) : (fieldsOption.label === 'Social Security Number') ? `*****${activeUser[fieldsOption.value].substr(activeUser[fieldsOption.value].length - 4)}` : activeUser[fieldsOption.value]}</td>
                <td>
                  <div className="d-flex py-2">
                    <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none" onClick={() => onEditToggle(fieldsOption.value, activeUser[fieldsOption.value])}>
                      <i className={`sila-icon sila-icon-edit text-lg ${activeRow.isEditing && activeRow.fldName === fieldsOption.value ? 'text-primary' : ''}`}></i>
                    </Button>
                    {(activeRow.isEditing && activeRow.fldName === fieldsOption.value) ? <Button className="p-1 text-decoration-none mx-3 px-3" onClick={(e) => onSave(fieldsOption.value)} disabled={(activeRow.isEditing && (!activeRow.fldValue || activeRow.fldValue === activeUser[fieldsOption.value])) ? true : false }>Save</Button> : <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-4 px-3" onClick={(e) => onDelete(fieldsOption.value, fieldsOption.label)}><i className={`sila-icon sila-icon-delete text-lg ${(activeRow.isDeleting && activeRow.fldName === fieldsOption.value) ? 'text-primary' : undefined }`}></i></Button>}
                  </div>
                </td>
              </tr>)
            })}
          </tbody>
        </Table>
      </AccordionItem>
      <div className="mt-3">
        <div className="row mx-2">
          <div className="sms-notifications p-0 col-md-9 col-sm-12">
            {(activeUser && activeUser.smsOptIn) && <div className="text-left">SMS Notifications: <span className="text-primary">Requested</span></div>}
          </div>
          <div className="p-0 text-right col-md-3 col-sm-12">
            {(!activeRow.isAdding && Object.keys(KYC_REGISTER_FIELDS_ARRAY.filter(option => activeUser && !activeUser[option.value])).length) ? <Button variant="link" className="p-0 new-registration shadow-none" onClick={onAddDataToggle}>Add new registration data+</Button> : null}
          </div>
        </div>

        {!activeRow.isEditing && !activeRow.isDeleting && activeRow.isAdding && <div className="add-data">
          <h2 className="mb-4 mt-4">Add Data</h2>
          {!activeRow.fldName && <Form.Group controlId="chooseData" className="select">
            <Form.Control placeholder="Choose a data point to add" as="select" name="choose_data" onChange={onChooseAddDataToggle}>
              <option value="">Choose a data point to add</option>
              {KYC_REGISTER_FIELDS_ARRAY.filter(option => activeUser && !activeUser[option.value]).map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
            </Form.Control>
          </Form.Group>}

          {activeRow.fldName && <Form.Group controlId="addData" className="required">
            <KYCFormFieldType fieldType={activeRow.fldName} errors={errors} activeUser={activeUser} onEditing={onEditing} onSave={onSave} />
          </Form.Group>}

          <div className="text-right">
            {activeRow.fldName && <Button variant="outline-light" className="ml-auto p-2 px-4" onClick={onChooseAddDataToggle}>Done</Button>}
            {activeRow.fldName && <Button className="text-decoration-none ml-3 p-2  px-4" disabled={!Boolean(activeRow.fldValue)} onClick={(e) => onSave(activeRow.fldName)}>Add</Button>}
            {!activeRow.fldName && <Button variant="outline-light" className="p-2 px-4" onClick={onAddDataToggle}>Cancel</Button>}
          </div>
        </div>}

      </div>
    </Accordion>
  )
};

export default RegisterDataForm;
