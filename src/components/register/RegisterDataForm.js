import React, { useState, useRef, useEffect } from 'react';
import { Accordion, Table, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import AccordionItem from '../../components/common/AccordionItem';
import KYCFormFieldType from '../../components/register/KYCFormFieldType';

import { KYC_REGISTER_FIELDS_ARRAY, STATES_ARRAY } from '../../constants';


const RegisterDataForm = ({ errors, onConfirm, onLoaded, onErrors }) => {
  const [expanded, setExpanded] = useState(1);
  const [activeKey, setActiveKey] = useState(1);
  const [activeRow, setActiveRow] = useState({isEditing: false, isDeleting: false, fldName: '', fldValue: '', entityuuid: {} });
  const tbodyRef = useRef()
  const registeredItemRef = useRef(null);
  const accordionItemProps = { expanded, onSetExpanded: setExpanded }
  const entityFields = ['firstName', 'lastName', 'dateOfBirth']
  const phoneFields = ['phone']
  const emailFields = ['email']
  const identityFields = ['ssn']
  const addressFields = ['address', 'city', 'state', 'zip']

  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();

  let updatedEntityData = {};
  let updatedResponses = [];
  let validationErrors = {};
  let result = {};
  let appData = {};

  const onEditToggle = (fieldName, fieldValue) => {
    setActiveRow({
      ...activeRow,
      isEditing: (activeRow.isEditing && activeRow.fldName === fieldName) ? false : true,
      fldName: (activeRow.isEditing && activeRow.fldName === fieldName) ? '' : fieldName,
      fldValue: (activeRow.isEditing && activeRow.fldName === fieldName) ? '' : fieldValue
    });
  }
  const onEditing = (e) => {
    if (activeRow.isEditing) {
      setActiveRow({...activeRow, fldValue: e.target.value});
    }
  }
  const onSave = async (fieldName) => {
    if (!activeRow.fldValue || activeRow.fldValue === app.activeUser[fieldName]) return;

    if (app.activeUser && app.activeUser.handle) {
      onLoaded(false);
      let updateSuccess = false;
      if (entityFields.includes(fieldName)) {
        try {
          const entityUpdateData = {};
          if (fieldName === 'firstName') entityUpdateData.first_name = activeRow.fldValue;
          if (fieldName === 'lastName') entityUpdateData.last_name = activeRow.fldValue;
          if (fieldName === 'dateOfBirth') entityUpdateData.birthdate = activeRow.fldValue;

          const entityUpdateRes = await api.updateEntity(app.activeUser.handle, app.activeUser.private_key, entityUpdateData);
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
          const phoneRes = await api.updatePhone(app.activeUser.handle, app.activeUser.private_key, {
            phone: activeRow.fldValue,
            uuid: activeRow.entityuuid.phone
          });

          updatedResponses = [ ...updatedResponses, { endpoint: '/update/phone', result: JSON.stringify(phoneRes, null, '\t') } ];

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
          const emailRes = await api.updateEmail(app.activeUser.handle, app.activeUser.private_key, {
            email: activeRow.fldValue,
            uuid: activeRow.entityuuid.email
          });

          updatedResponses = [ ...updatedResponses, { endpoint: '/update/email', result: JSON.stringify(emailRes, null, '\t') } ];

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
          const ssnRes = await api.updateIdentity(app.activeUser.handle, app.activeUser.private_key, {
            alias: 'SSN',
            value: activeRow.fldValue,
            uuid: activeRow.entityuuid.identity
          });

          updatedResponses = [ ...updatedResponses, { endpoint: '/update/identity', result: JSON.stringify(ssnRes, null, '\t') } ];

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
          if (Object.keys(addressUpdateData).length) addressUpdateData.uuid = activeRow.entityuuid.address;

          const addressRes = await api.updateAddress(app.activeUser.handle, app.activeUser.private_key, addressUpdateData);
          updatedResponses = [ ...updatedResponses, { endpoint: '/update/address', result: JSON.stringify(addressRes, null, '\t') } ];

          if (addressRes.data.success) {
            updateSuccess = true;
            if (fieldName === 'address') updatedEntityData = { ...updatedEntityData, address: activeRow.fldValue };
            if (fieldName === 'city') updatedEntityData = { ...updatedEntityData, city: activeRow.fldValue };
            if (fieldName === 'state') updatedEntityData = { ...updatedEntityData, state: activeRow.fldValue };
            if (fieldName === 'zip') updatedEntityData = { ...updatedEntityData, zip: activeRow.fldValue };
          }  else if (addressRes.data.validation_details) {
            validationErrors = { address: addressRes.data.validation_details.address }
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
          const activeUser = app.users.find(u => u.handle === app.activeUser.handle);
          updatedEntityData = { ...activeUser, ...updatedEntityData, kycLevel: app.settings.preferredKycLevel }
          result = {
            activeUser: { ...activeUser, ...updatedEntityData } ,
            alert: { message: 'Registration data was successfully updated and saved.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === app.activeUser.handle ? { ...u, ...updatedEntityData } : u),
          };
          if (Object.keys(errors).length || Object.keys(validationErrors).length) onErrors({});
          setActiveRow({...activeRow, isEditing: false, fldName: '', fldValue: '' });
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
      onLoaded(true);
    }
  }

  const onDelete = async (fieldName, fieldLabel) => {
    setActiveRow({...activeRow, isDeleting: true, fldName: fieldName });

    onConfirm({ show: true, message: `Are you sure you want to delete the ${fieldLabel} data point from the registered data?`, onSuccess: async () => {
      let ApiEndpoint;
      let deleteSuccess = false;
      let deleteRes = {};
      onLoaded(false);
      onConfirm({show: false, message: ''});
      try {
        if (emailFields.includes(fieldName)) {
          ApiEndpoint = 'email';
          deleteRes = await api.deleteEmail(app.activeUser.handle, app.activeUser.private_key, activeRow.entityuuid.email);
        } else if (phoneFields.includes(fieldName)) {
          ApiEndpoint = 'phone';
          deleteRes = await api.deletePhone(app.activeUser.handle, app.activeUser.private_key, activeRow.entityuuid.phone);
        } else if (identityFields.includes(fieldName)) {
          ApiEndpoint = 'identity';
          deleteRes = await api.deleteIdentity(app.activeUser.handle, app.activeUser.private_key, activeRow.entityuuid.identity);
          console.info(deleteRes);
        } else if (addressFields.includes(fieldName)) {
          ApiEndpoint = 'address';
          deleteRes = await api.deleteAddress(app.activeUser.handle, app.activeUser.private_key, activeRow.entityuuid.address);
        } else {
          validationErrors = Object.assign({error: "Required registration data can not be deleted!"}, validationErrors.error);
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
          const activeUser = app.users.find(u => u.handle === app.activeUser.handle);
          updatedEntityData = { ...activeUser, ...updatedEntityData, kycLevel: app.settings.preferredKycLevel }
          result = {
            activeUser: { ...activeUser, ...updatedEntityData } ,
            alert: { message: 'Registration data was successfully deleted.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === app.activeUser.handle ? { ...u, ...updatedEntityData } : u),
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

  useEffect(() => {
    async function fetchEntity() {
      try {
        const entityRes = await api.getEntity(app.activeUser.handle, app.activeUser.private_key);
        if (entityRes.data.success) {
          setActiveRow({...activeRow, entityuuid: {
            email: entityRes.data.emails[0] ? entityRes.data.emails[0]['uuid'] : '',
            phone: entityRes.data.phones[0] ? entityRes.data.phones[0]['uuid'] : '',
            identity: entityRes.data.identities[0] ? entityRes.data.identities[0]['uuid'] : '',
            address: entityRes.data.addresses[0] ? entityRes.data.addresses[0]['uuid'] : ''
          } })
        }
      } catch (err) {
        console.log('  ... unable to get entity info, looks like we ran into an issue!');
      }
    }
    if (!Object.keys(activeRow.entityuuid).length) {
      fetchEntity();
    }

    const checkIfClickedOutside = (e) => {
      if (activeRow.isEditing && tbodyRef.current && !tbodyRef.current.contains(e.target)) {
        setActiveRow({...activeRow, isEditing: false, fldName: '', fldValue: ''});
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [activeRow, api, app.activeUser.handle, app.activeUser.private_key])

  return (
    <Accordion className="mb-3 mb-md-5" defaultActiveKey={expanded ? expanded : undefined} onSelect={e => setActiveKey(e)}>
      <AccordionItem className="registered-data" eventKey={1} label="Registered Data" activeKey={activeKey} itemRef={registeredItemRef} {...accordionItemProps}>
        <Table responsive hover>
          <thead>
            <tr>
              <th className="font-weight-bold">Registration Field</th>
              <th className="font-weight-bold">Data</th>
              <th className="font-weight-bold">Action</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {KYC_REGISTER_FIELDS_ARRAY.filter(fieldsOption => app.activeUser && app.activeUser[fieldsOption.value]).map((fieldsOption, index) => {
              return (<tr key={index}>
                <td>{fieldsOption.label}</td>
                <td>{activeRow.isEditing && activeRow.fldName === fieldsOption.value  ? <KYCFormFieldType fieldType={fieldsOption.value} errors={errors} app={app} onEditing={onEditing} onSave={onSave} /> : (fieldsOption.label === 'State') ? STATES_ARRAY.map((s) => { return s.value === app.activeUser[fieldsOption.value] ? s.label : '' }) : app.activeUser[fieldsOption.value]}</td>
                <td>
                  <div className="d-flex">
                    <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none" onClick={() => onEditToggle(fieldsOption.value, app.activeUser[fieldsOption.value])}>
                      <i className={`sila-icon sila-icon-edit text-lg ${activeRow.isEditing && activeRow.fldName === fieldsOption.value ? 'text-primary' : ''}`}></i>
                    </Button>
                    {(activeRow.isEditing && activeRow.fldName === fieldsOption.value) ? <Button className="p-1 text-decoration-none mx-3 px-3" onClick={(e) => onSave(fieldsOption.value)} disabled={(!activeRow.fldValue || activeRow.fldValue === app.activeUser[fieldsOption.value]) ? true : false }>Save</Button> : <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-4 px-3" onClick={(e) => onDelete(fieldsOption.value, fieldsOption.label)}><i className={`sila-icon sila-icon-delete text-lg ${(activeRow.isDeleting && activeRow.fldName === fieldsOption.value) ? 'text-primary' : undefined }`}></i></Button>}
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
            {(app.activeUser && app.activeUser.smsOptIn) && <div className="text-left">SMS Notifications: <span className="text-primary">Requested</span></div>}
          </div>
          <div className="p-0 text-right col-md-3 col-sm-12">
            <Button variant="link" className="p-0 new-registration shadow-none">Add new registration data+</Button>
          </div>
        </div>
      </div>
    </Accordion>
  )
};

export default RegisterDataForm;
