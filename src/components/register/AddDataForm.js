import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import KYCFormFieldType from '../../components/register/KYCFormFieldType';

import { KYC_REGISTER_FIELDS_ARRAY, INSTANT_ACH_KYC } from '../../constants';


const AddDataForm = ({ errors, entityuuid, onLoaded, onErrors, onUpdateUuid, activeMember, action }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const activeUser = activeMember ? app.users.find(u => u.handle === activeMember.handle) : app.activeUser;
  const [activeRow, setActiveRow] = useState({ isAdding: false, fldName: '', fldValue: '', smsOptInCheck: activeUser && activeUser.smsOptIn ? true : false });
  const [deviceFingerprint, setDeviceFingerprint] = useState(undefined);
  const entityFields = ['firstName', 'lastName', 'dateOfBirth']
  const phoneFields = ['phone']
  const emailFields = ['email']
  const identityFields = ['ssn']
  const addressFields = ['address', 'city', 'state', 'zip']
  
  let isLoading = useRef(false);
  let updatedEntityData = {};
  let updatedResponses = [];
  let validationErrors = {};
  let result = {};
  let appData = {};
  let ApiEndpoint;

  const onSMSChange = (e) => {
    setActiveRow({...activeRow, isAdding: false, fldName: 'smsOptIn', fldValue: e.target.checked ? true : false, smsOptInCheck : e.target.checked ? true : false });
  }
  const onEditing = (e) => {
    setActiveRow({...activeRow, fldValue: e.target.value.trim() || undefined});
  }
  const onSave = async (fieldName) => {
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
          const phoneRes = await api.addPhone(activeUser.handle, activeUser.private_key, activeRow.fldValue);
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
          const emailRes = await api.addEmail(activeUser.handle, activeUser.private_key, activeRow.fldValue);
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/email', result: JSON.stringify(emailRes, null, '\t') } ];

          if (emailRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, email: activeRow.fldValue };
            if(emailRes.data.email && emailRes.data.email.uuid && onUpdateUuid) onUpdateUuid({ email: emailRes.data.email.uuid});
          }  else {
            validationErrors.contact = Object.assign({email: emailRes.data.validation_details ? emailRes.data.validation_details.email : emailRes.data.message}, validationErrors.contact);
          }
        } catch (err) {
          console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
          handleError(err);
        }
      }

      if (identityFields.includes(fieldName)) {
        try {
          const ssnRes = await api.addIdentity(activeUser.handle, activeUser.private_key, {
            alias: 'SSN',
            value: activeRow.fldValue
          });

          updatedResponses = [ ...updatedResponses, { endpoint: '/add/identity', result: JSON.stringify(ssnRes, null, '\t') } ];

          if (ssnRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, ssn: activeRow.fldValue };
            if(ssnRes.data.identity && ssnRes.data.identity.uuid && onUpdateUuid) onUpdateUuid({ identity: ssnRes.data.identity.uuid});
          } else {
            validationErrors = { identity: ssnRes.data.validation_details ? ssnRes.data.validation_details : ssnRes.data.message }
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
            addressUpdateData.uuid = entityuuid.uuid.address;
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
              if(addressRes.data.address && addressRes.data.address.uuid && onUpdateUuid) onUpdateUuid({ address: addressRes.data.address.uuid});
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

      if (fieldName === 'smsOptIn' && activeRow.fldValue) {
        if (!activeUser.phone || !deviceFingerprint) {
          validationErrors.device = Object.assign({device_fingerprint: !activeUser.phone ? "Please add phone number first!" : !deviceFingerprint ? "This field should contain a valid Iovation device fingerprint string." : '' }, validationErrors.device);
        }

        if (!Object.keys(validationErrors).length) {
          try {
            const phoneRes = await api.updatePhone(activeUser.handle, activeUser.private_key, {
              smsOptIn: activeRow.fldValue ? true : false,
              phone: activeUser.phone,
              uuid: entityuuid.uuid.phone
            });

            updatedResponses = [ ...updatedResponses, { endpoint: '/update/phone', result: JSON.stringify(phoneRes, null, '\t') } ];

            if (phoneRes.data.success) {
              updateSuccess = true;
              updatedEntityData = { ...updatedEntityData, smsOptIn: activeRow.fldValue ? true : false };
            } else if (phoneRes.data.validation_details) {
              validationErrors.device = Object.assign({device_fingerprint: phoneRes.data.validation_details.phone}, validationErrors.device);
            } else {
              console.log(`... update entity ${fieldName} failed!`, phoneRes);
            }
          } catch (err) {
            console.log(`  ... unable to update entity ${fieldName}, looks like we ran into an issue!`);
            handleError(err);
          }

          try {
            const deviceRes = await api.addDevice(activeUser.handle, activeUser.private_key, { deviceFingerprint: deviceFingerprint });
            updatedResponses = [ ...updatedResponses, { endpoint: '/add/device', result: JSON.stringify(deviceRes, null, '\t') } ];

            if (deviceRes.data.success) {
              updateSuccess = true;
              updatedEntityData = { ...updatedEntityData, deviceFingerprint: deviceFingerprint };
            }  else if (deviceRes.data.validation_details) {
              validationErrors = { device: deviceRes.data.validation_details }
            } else {
              console.log(`... add device failed failed!`, deviceRes);
            }
          } catch (err) {
            console.log('  ... unable to add device, looks like we ran into an issue!');
            handleError(err);
          }
        }
      }

      try {
        console.log(`  ... update ${fieldName} field completed!`);
        if (updateSuccess) {
          refreshApp();
          const appUser = app.users.find(u => u.handle === activeUser.handle);
          if (action && action === 'update-member') {
            updatedEntityData = { ...appUser, ...updatedEntityData, active: true }
            result = {
              alert: { message: activeRow.isAdding ? 'Registration data was successfully added.' : 'Registration data was successfully updated and saved.', type: 'success' }
            };
            appData = {
              users: app.users.map(u => u.handle === activeMember.handle ? { ...u, ...updatedEntityData } : u)
            };
          } else {
            updatedEntityData = { ...appUser, ...updatedEntityData, kycLevel: app.settings.preferredKycLevel }
            result = {
              activeUser: { ...appUser, ...updatedEntityData } ,
              alert: { message: activeRow.isAdding ? 'Registration data was successfully added.' : 'Registration data was successfully updated and saved.', type: 'success' }
            };
            appData = {
              users: app.users.map(({ active, ...u }) => u.handle === activeUser.handle ? { ...u, ...updatedEntityData } : u),
            };
          }
          if ((Object.keys(errors).length || Object.keys(validationErrors).length) && onErrors) onErrors({});
          setActiveRow({...activeRow, fldName: '', fldValue: '' });
        } else if ( Object.keys(validationErrors).length ) {
          if(onErrors) onErrors(validationErrors);
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
    setActiveRow({...activeRow, isAdding: !activeRow.isAdding ? true : false, fldName: '', fldValue: '', smsOptInCheck: false })
  }
  const onChooseAddDataToggle = (e) => {
    setActiveRow({...activeRow, fldName: e.target.value ? e.target.value : '', fldValue: '' })
  }
  const getRefreshSMSstatus = async () => {
    if (onLoaded) onLoaded(false);
    try {
      const entitySmsRes = await api.getEntity(activeUser.handle, activeUser.private_key);
      if (entitySmsRes.data.success && entitySmsRes.data.phones && entitySmsRes.data.phones[0]) {
        setAppData({
          users: app.users.map(({ active, ...u }) => u.handle === activeUser.handle ? { ...u, smsConfirmed: entitySmsRes.data.phones[0]['sms_confirmed'] } : u),
          responses: [{
            endpoint: '/get_entity',
            result: JSON.stringify(entitySmsRes, null, '\t')
          }, ...app.responses]
        }, () => {
          updateApp({ activeUser: { ...activeUser, smsConfirmed: entitySmsRes.data.phones[0]['sms_confirmed'] } });
        });
      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!, unable to refresh SMS status');
      handleError(err);
    }
    if (onLoaded) onLoaded(true);
  };

  useEffect(() => {
    async function fetchEntity() {
      try {
        if (isLoading.current) return;
        isLoading.current = true;
        if (onLoaded) onLoaded(false);
        const entityRes = await api.getEntity(activeUser.handle, activeUser.private_key);
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
    if (activeUser && (!Object.keys(entityuuid.uuid).length || !entityuuid.isFetchedUUID)) {
      fetchEntity();
    }

    if (app.settings.flow === 'kyc' && app.settings.preferredKycLevel === INSTANT_ACH_KYC && !activeUser.deviceFingerprint) {
      try {
        window.IGLOO = window.IGLOO || {
          "enable_rip" : true,
          "enable_flash" : false,
          "install_flash" : false,
          "loader" : {
            "version" : "general5",
            "fp_static" : false
          }
        };

        const scriptElem = document.getElementById('iovation');
        if (scriptElem) scriptElem.remove();
        const script = document.createElement('script');
        script.src = "/iovation.js";
        script.id = 'iovation';
        script.async = true;
        document.body.appendChild(script);

        let timeoutId;
        function useBlackboxString(intervalCount) {
          if (typeof window.IGLOO.getBlackbox !== 'function') {return;}
          const bbData = window.IGLOO.getBlackbox();
          if (bbData.finished) {
            clearTimeout(timeoutId);
            setDeviceFingerprint(bbData.blackbox);
          }
        }
        timeoutId = setInterval(useBlackboxString, 500);
      } catch (err) {
        console.log('  ... device-fingerprint looks like we ran into an issue!', err);
      }
    }
  }, [entityuuid, api, app, activeUser, onLoaded, onUpdateUuid])

  return (
    <div className="mt-1">
      {app.settings.flow === 'kyc' && activeUser && (activeUser.smsOptIn || Object.keys(KYC_REGISTER_FIELDS_ARRAY.filter(option => activeUser && !activeUser[option.value])).length !== 0)  && <div className="row mx-2">
        <div className="sms-notifications p-0 col-md-6 col-sm-12">
          {(activeUser && activeUser.smsOptIn) && <div className="text-left">
            SMS Notifications: <span className="text-primary">{activeUser.smsConfirmed ? 'Confirmed' : 'Requested'}</span>
            <Button variant="link" disabled={activeUser.smsConfirmed} className="ml-3 p-0 text-reset text-decoration-none loaded" onClick={getRefreshSMSstatus}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh</span></Button>
          </div>}
        </div>
        <div className="p-0 text-right col-sm-12 col-md-6">
          {(!activeRow.isAdding && Object.keys(KYC_REGISTER_FIELDS_ARRAY.filter(option => activeUser && !activeUser[option.value])).length) ? <Button variant="link" className="p-0 new-registration shadow-none" onClick={onAddDataToggle}>Add new registration data+</Button> : null}
        </div>
      </div>}

      {app.settings.flow === 'kyb' && activeUser && Object.keys(KYC_REGISTER_FIELDS_ARRAY.filter(option => activeUser && !activeUser[option.value])).length !== 0 && <div className="p-0 text-right col-sm-12 col-md-12 mb-3">
        {(!activeRow.isAdding && Object.keys(KYC_REGISTER_FIELDS_ARRAY.filter(option => activeUser && !activeUser[option.value])).length) ? <Button variant="link" className="p-0 new-registration shadow-none" onClick={onAddDataToggle}>Add new registration data+</Button> : null}
      </div>}

      {activeRow.isAdding && <div className="add-data">
        <h2 className="mb-3 mt-0">Add Data</h2>
        {!activeRow.fldName && <Form.Group controlId="chooseData" className="select mb-3">
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

      {app.settings.flow === 'kyc' && app.settings.preferredKycLevel === INSTANT_ACH_KYC && !activeUser.deviceFingerprint && <>
        <h2 className="mb-2 mt-0">Device Fingerprint</h2>
        <p className="text-muted mb-2">Your device fingerprint is a unique string of numbers used to identify your desktop or mobile device. You must opt-in to accept SMS notifications about all instant-ACH transactions. SMS notifications will be sent to the registered phone number of the user.</p>
        <Form.Group controlId="registerDeviceFingerprint" className="readonly mb-2">
          <Form.Control required placeholder="Loading..." name="deviceFingerprint" defaultValue={activeUser.deviceFingerprint ? activeUser.deviceFingerprint : deviceFingerprint} readOnly={true} isInvalid={Boolean(errors.device && errors.device.device_fingerprint)} />
          {errors.device && errors.device.device_fingerprint && <Form.Control.Feedback type="invalid">{errors.device.device_fingerprint}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group controlId="registerSms" className="mb-1 registerSms">
          <Form.Check custom id="registerSms" className="mb-2 ml-n2" type="checkbox">
            <Form.Check.Input type="checkbox" name="smsOptIn" onChange={onSMSChange} checked={activeRow.smsOptInCheck} />
            <Form.Check.Label className="text-muted ml-2">Yes, opt-in to receive SMS notifications about all instant ACH transactions.</Form.Check.Label>
          </Form.Check>
        </Form.Group>
        <div className="text-right">
          <Button className="text-decoration-none ml-3 p-2 px-4" disabled={!activeRow.smsOptInCheck} onClick={(e) => onSave('smsOptIn')}>Add Device</Button>
        </div>
      </>}
    </div>
  )
};

export default AddDataForm;
