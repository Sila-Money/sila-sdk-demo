import React, { useState, useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import KYBFormFieldType from '../../components/kyb/KYBFormFieldType';

import { KYB_REGISTER_FIELDS_ARRAY } from '../../constants';


const AddDataForm = ({ errors, entityuuid, onLoaded, onErrors, onUpdateUuid }) => {
  const [activeRow, setActiveRow] = useState({ isAdding: false, fldName: '', fldValue: '' });
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const entityFields = ['entity_name', 'doing_business_as', 'business_website']
  const phoneFields = ['phone']
  const emailFields = ['email']
  const identityFields = ['ein']
  const addressFields = ['address', 'city', 'state', 'zip']
  let isLoading = useRef(false);
  let updatedEntityData = {};
  let updatedResponses = [];
  let validationErrors = {};
  let result = {};
  let appData = {};
  let ApiEndpoint;

  const onEditing = (e) => {
    setActiveRow({...activeRow, fldValue: e.target.value.trim() || undefined});
  }

  const onSave = async (fieldName) => {
    if (activeRow.isAdding && !activeRow.fldValue) return;
    if (app.activeUser && app.activeUser.handle) {
      if (onLoaded) onLoaded(false);
      let updateSuccess = false;
      if (entityFields.includes(fieldName)) {
        try {
          const entityUpdateData = {};
          if (fieldName === 'entity_name') entityUpdateData.entity_name = activeRow.fldValue;
          if (fieldName === 'business_website') entityUpdateData.business_website = activeRow.fldValue;
          if (fieldName === 'doing_business_as') entityUpdateData.doing_business_as = activeRow.fldValue;

          const entityUpdateRes = await api.updateEntity(app.activeUser.handle, app.activeUser.private_key, entityUpdateData);
          updatedResponses = [ ...updatedResponses, { endpoint: '/update/entity', result: JSON.stringify(entityUpdateRes, null, '\t') } ];

          if (entityUpdateRes.data.success) {
            updateSuccess = true;
            if (fieldName === 'entity_name') updatedEntityData = { ...updatedEntityData, entity_name: activeRow.fldValue };
            if (fieldName === 'business_website') updatedEntityData = { ...updatedEntityData, business_website: activeRow.fldValue };
            if (fieldName === 'doing_business_as') updatedEntityData = { ...updatedEntityData, doing_business_as: activeRow.fldValue };
          } else {
            validationErrors = { entity: entityUpdateRes.data.validation_details ? entityUpdateRes.data.validation_details : entityUpdateRes.data.message }
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (phoneFields.includes(fieldName)) {
        try {
          const phoneRes = await api.addPhone(app.activeUser.handle, app.activeUser.private_key, activeRow.fldValue);
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/phone', result: JSON.stringify(phoneRes, null, '\t') } ];

          if (phoneRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, phone: activeRow.fldValue };
            if(phoneRes.data.phone && phoneRes.data.phone.uuid && onUpdateUuid) onUpdateUuid({ phone: phoneRes.data.phone.uuid});
          } else {
            validationErrors.contact = Object.assign({phone: phoneRes.data.validation_details ? phoneRes.data.validation_details.phone : phoneRes.data.message}, validationErrors.contact);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (emailFields.includes(fieldName)) {
        try {
          const emailRes = await api.addEmail(app.activeUser.handle, app.activeUser.private_key, activeRow.fldValue);
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/email', result: JSON.stringify(emailRes, null, '\t') } ];

          if (emailRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, email: activeRow.fldValue };
            if(emailRes.data.email && emailRes.data.email.uuid && onUpdateUuid) onUpdateUuid({ email: emailRes.data.email.uuid});
          } else {
            validationErrors.contact = Object.assign({email: emailRes.data.validation_details ? emailRes.data.validation_details.email : emailRes.data.message}, validationErrors.contact);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (identityFields.includes(fieldName)) {
        try {
          const einRes = await api.addIdentity(app.activeUser.handle, app.activeUser.private_key, {
            alias: 'EIN',
            value: activeRow.fldValue
          });
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/identity', result: JSON.stringify(einRes, null, '\t') } ];

          if (einRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, ein: activeRow.fldValue };
            if(einRes.data.identity && einRes.data.identity.uuid && onUpdateUuid) onUpdateUuid({ identity: einRes.data.identity.uuid});
          } else {
            validationErrors = { identity: einRes.data.validation_details ? einRes.data.validation_details : einRes.data.message }
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
          if (activeRow.isAdding && !app.activeUser.address) {
            ApiEndpoint = '/add/address';
            if (app.activeUser.address) addressUpdateData.street_address_1 = app.activeUser.address;
            addressRes = await api.addAddress(app.activeUser.handle, app.activeUser.private_key, addressUpdateData);
          } else {
            ApiEndpoint = '/update/address';
            addressUpdateData.uuid = entityuuid.uuid.address;
            addressRes = await api.updateAddress(app.activeUser.handle, app.activeUser.private_key, addressUpdateData);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(addressRes, null, '\t') } ];

          if (addressRes.data.success) {
            updateSuccess = true;
            if (fieldName === 'address') updatedEntityData = { ...updatedEntityData, address: activeRow.fldValue };
            if (fieldName === 'city') updatedEntityData = { ...updatedEntityData, city: activeRow.fldValue };
            if (fieldName === 'state') updatedEntityData = { ...updatedEntityData, state: activeRow.fldValue };
            if (fieldName === 'zip') updatedEntityData = { ...updatedEntityData, zip: activeRow.fldValue };

            if (activeRow.isAdding && fieldName === 'address' ) {
              if(addressRes.data.address && addressRes.data.address.uuid && onUpdateUuid) onUpdateUuid({ address: addressRes.data.address.uuid});
            }
          } else if (addressRes.data.validation_details) {
            if (addressRes.data.validation_details.address instanceof Object) {
              validationErrors = { address: addressRes.data.validation_details.address }
            } else {
              if (!app.activeUser.address && fieldName === 'address') {
                validationErrors.address = Object.assign({street_address_1: addressRes.data.validation_details.street_address_1}, validationErrors.address);
              } else if (!app.activeUser.address && fieldName !== 'address') {
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
          const activeUser = app.users.find(u => u.handle === app.activeUser.handle);
          updatedEntityData = { ...activeUser, ...updatedEntityData, kybLevel: app.settings.preferredKybLevel }
          result = {
            activeUser: { ...activeUser, ...updatedEntityData },
            alert: { message: activeRow.isAdding ? 'Registration data was successfully added.' : 'Registration data was successfully updated and saved.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === app.activeUser.handle ? { ...u, ...updatedEntityData } : u),
          };
          if (Object.keys(errors).length || Object.keys(validationErrors).length) onErrors({});
          setActiveRow({...activeRow, fldName: '', fldValue: ''});
        } else if ( Object.keys(validationErrors).length ) {
          onErrors(validationErrors);
        }

        setAppData({
          ...appData,
          responses: [...updatedResponses, ...app.responses]
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

  const onAddDataToggle = (e) => {
    setActiveRow({...activeRow, isAdding: !activeRow.isAdding ? true : false, fldName: '', fldValue: '' })
  }

  const onChooseAddDataToggle = (e) => {
    setActiveRow({...activeRow, fldName: e.target.value ? e.target.value : '', fldValue: '' })
  }
  
  useEffect(() => {
    async function fetchEntity() {
      try {
        if (isLoading.current) return;
        isLoading.current = true;
        if (onLoaded) onLoaded(false);
        const entityRes = await api.getEntity(app.activeUser.handle, app.activeUser.private_key);
        if (entityRes.data.success) {
          if(onUpdateUuid) onUpdateUuid({ 
            email: entityRes.data.emails[0] ? entityRes.data.emails[0]['uuid'] : '',
            phone: entityRes.data.phones[0] ? entityRes.data.phones[0]['uuid'] : '',
            identity: entityRes.data.identities[0] ? entityRes.data.identities[0]['uuid'] : '',
            address: entityRes.data.addresses[0] ? entityRes.data.addresses[0]['uuid'] : ''
          });
        }
      } catch (err) {
        console.log('  ... unable to get entity info, looks like we ran into an issue!');
      }
      if (onLoaded) onLoaded(true);
      isLoading.current = false;
    }
    if (app.activeUser && (!Object.keys(entityuuid.uuid).length || !entityuuid.isFetchedUUID)) {
      fetchEntity();
    }
  }, [entityuuid, api, app, onLoaded, onUpdateUuid])

  return (
    <div>
      {app.activeUser && !activeRow.isAdding && Object.keys(KYB_REGISTER_FIELDS_ARRAY.filter(option => app.activeUser && !app.activeUser[option.value])).length !== 0 && <div className="row mx-2">
        <div className="p-0 text-right col-md-12 col-sm-12">
          {(!activeRow.isAdding && Object.keys(KYB_REGISTER_FIELDS_ARRAY.filter(option => app.activeUser && !app.activeUser[option.value])).length) ? <Button variant="link" className="p-0 new-registration shadow-none" onClick={onAddDataToggle}>Add new registration data+</Button> : null}
        </div>
      </div>}

      {activeRow.isAdding && <div className="add-data">
        <h2 className="mb-2">Add Data</h2>
        {!activeRow.fldName && <Form.Group controlId="chooseData" className="select">
          <Form.Control placeholder="Choose a data point to add" as="select" name="choose_data" onChange={onChooseAddDataToggle}>
            <option value="">Choose a data point to add</option>
            {KYB_REGISTER_FIELDS_ARRAY.filter(option => app.activeUser && !app.activeUser[option.value]).map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
          </Form.Control>
        </Form.Group>}

        {activeRow.fldName && <Form.Group controlId="addData" className="required">
          <KYBFormFieldType fieldType={activeRow.fldName} errors={errors} app={app} onEditing={onEditing} onSave={onSave} />
        </Form.Group>}

        <div className="text-right">
          {activeRow.fldName && <Button variant="outline-light" className="ml-auto p-2 px-4" onClick={onChooseAddDataToggle}>Done</Button>}
          {activeRow.fldName && <Button className="text-decoration-none ml-3 p-2  px-4" disabled={!Boolean(activeRow.fldValue)} onClick={(e) => onSave(activeRow.fldName)}>Add</Button>}
          {!activeRow.fldName && <Button variant="outline-light" className="p-2 px-4" onClick={onAddDataToggle}>Cancel</Button>}
        </div>
      </div>}
    </div>
  )
};

export default AddDataForm;
