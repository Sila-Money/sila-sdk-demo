import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import AlertMessage from '../../components/common/AlertMessage';
import Loader from '../../components/common/Loader';
import SelectMenu from '../../components/common/SelectMenu';
import StandardKYBForm from '../../components/kyb/StandardKYBForm';
import LiteKYBForm from '../../components/kyb/LiteKYBForm';
import ReceiveOnlyKYBForm from '../../components/kyb/ReceiveOnlyKYBForm';
import AddDataForm from '../../components/kyb/AddDataForm';
import UpdateKYBForm from '../../components/kyb/UpdateKYBForm';

import { KYB_STANDARD, KYB_LITE, KYB_RECEIVE_ONLY, KYB_ARRAY } from '../../constants';

const RegisterBusinessForm = ({ className, children, onSuccess, onShowKybModal, onConfirm }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(true);
  const [preferredKyb, setPreferredKyb] = useState(app.settings.preferredKybLevel || app.activeUser.kybLevel);
  const [showUpdateBtn, setShowUpdateBtn] = useState(false);
  const [entityuuid, setEntityuuid] = useState({ isFetchedUUID: false, uuid: {} });
  const businessTypes = ['sole_proprietorship', 'trust', 'unincorporated_association'];
  let result = {};

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER BUSINESS ***');
    e.preventDefault();

    let isValidated = true;
    let validationErrors = {};
    if (e.target.entity_name && e.target.entity_name.value) e.target.entity_name.value = e.target.entity_name.value.trim();
    if (e.target.address && e.target.address.value) e.target.address.value = e.target.address.value.trim();
    if (e.target.city && e.target.city.value) e.target.city.value = e.target.city.value.trim();
    if (e.target.zip && e.target.zip.value) e.target.zip.value = e.target.zip.value.trim();
    if (e.target.ein && e.target.ein.value) e.target.ein.value = e.target.ein.value.trim();

    if (e.target.entity_name && !e.target.entity_name.value) {
      isValidated = false;
      validationErrors.entity = Object.assign({entity_name: "This field may not be blank."}, validationErrors.entity);
    }
    if (preferredKyb !== KYB_RECEIVE_ONLY && e.target.email && !e.target.email.value) {
      isValidated = false;
      validationErrors.contact = Object.assign({email: "This field may not be blank."}, validationErrors.contact);
    }
    if (preferredKyb !== KYB_RECEIVE_ONLY && e.target.address && !e.target.address.value) {
      isValidated = false;
      validationErrors.address = Object.assign({street_address_1: "This field may not be blank."}, validationErrors.address);
    }
    if (preferredKyb !== KYB_RECEIVE_ONLY && e.target.city && !e.target.city.value) {
      isValidated = false;
      validationErrors.address = Object.assign({city: "This field may not be blank."}, validationErrors.address);
    }
    if (preferredKyb !== KYB_RECEIVE_ONLY && e.target.state && !e.target.state.value) {
      isValidated = false;
      validationErrors.address = Object.assign({state: "This field may not be blank."}, validationErrors.address);
    }
    if (preferredKyb !== KYB_RECEIVE_ONLY && e.target.zip && !e.target.zip.value) {
      isValidated = false;
      validationErrors.address = Object.assign({postal_code: "This field may not be blank."}, validationErrors.address);
    }
    if (preferredKyb !== KYB_RECEIVE_ONLY && e.target.phone && !e.target.phone.value) {
      isValidated = false;
      validationErrors.contact = Object.assign({phone: "This field may not be blank."}, validationErrors.contact);
    }
    if (preferredKyb !== KYB_RECEIVE_ONLY && preferredKyb !== KYB_LITE && e.target.ein && !e.target.ein.value) {
      if (e.target.ein && businessTypes && !businessTypes.includes(app.settings.kybBusinessType)) {
        isValidated = false;
        validationErrors.identity = "This field may not be blank.";
      }
    }

    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    console.log('Waking up the API service ...');
    setLoaded(false);
    if (app.activeUser && app.activeUser.handle) {
      setShowUpdateBtn(false);
      let ApiEndpoint;
      let updatedEntityData = {};
      let updatedResponses = [];
      let entityRes = {};
      let updateSuccess = false;
      try {
        entityRes = await api.getEntity(app.activeUser.handle, app.activeUser.private_key);
        if (!entityRes.data.success) {
          console.log('... fetched entity info but success status false!', entityRes);
        }
      } catch (err) {
        console.log('  ... unable to get entity info, looks like we ran into an issue!');
        handleError(err);
      }

      const entityUpdateData = {};
      if (e.target.entity_name && e.target.entity_name.value && e.target.entity_name.value !== app.activeUser.entity_name) entityUpdateData.entity_name = e.target.entity_name.value;
      if (e.target.doing_business_as && e.target.doing_business_as.value !== app.activeUser.doing_business_as) entityUpdateData.doing_business_as = e.target.doing_business_as.value;
      if (e.target.business_website && e.target.business_website.value !== app.activeUser.business_website) entityUpdateData.business_website = e.target.business_website.value;
      if (Object.keys(entityUpdateData).length) {
        try {
          const entityUpdateRes = await api.updateEntity(app.activeUser.handle, app.activeUser.private_key, entityUpdateData);
          updatedResponses = [ ...updatedResponses, { endpoint: '/update/entity', result: JSON.stringify(entityUpdateRes, null, '\t') } ];

          if (entityUpdateRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, ...entityUpdateData };
          } else {
            if(entityUpdateRes.data && entityUpdateRes.data.message) result.alert = { message: entityUpdateRes.data.message, type: 'danger' };
            validationErrors = { ...validationErrors, entity: entityUpdateRes.data.validation_details ? entityUpdateRes.data.validation_details : entityUpdateRes.data.message }
          }
        } catch (err) {
          console.log('  ... unable to update entity, looks like we ran into an issue!');
          handleError(err);
        }
      }

      if (e.target.email && e.target.email.value && e.target.email.value !== app.activeUser.email) {
        try {
          ApiEndpoint = '/add/email';
          let emailRes = {};
          if (entityRes.data.emails.length) {
            ApiEndpoint = '/update/email';
            emailRes = await api.updateEmail(app.activeUser.handle, app.activeUser.private_key, {
              email: e.target.email.value,
              uuid: entityRes.data.emails[0] ? entityRes.data.emails[0]['uuid'] : ''
            });
          } else {
            emailRes = await api.addEmail(app.activeUser.handle, app.activeUser.private_key, e.target.email.value);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(emailRes, null, '\t') } ];

          if (emailRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, email: e.target.email.value }
          } else {
            validationErrors = { ...validationErrors, contact: {} }
            validationErrors.contact = Object.assign({email: emailRes.data.validation_details ? emailRes.data.validation_details.email : emailRes.data.message}, validationErrors.contact);
          }
        } catch (err) {
          console.log('  ... unable to update email, looks like we ran into an issue!');
          handleError(err);
        }
      }

      if (e.target.phone && e.target.phone.value && e.target.phone.value !== app.activeUser.phone) {
        try {
          ApiEndpoint = '/add/phone';
          let phoneRes = {};
          if (entityRes.data.phones.length) {
            ApiEndpoint = '/update/phone';
            phoneRes = await api.updatePhone(app.activeUser.handle, app.activeUser.private_key, {
              phone: e.target.phone.value,
              uuid: entityRes.data.phones[0] ? entityRes.data.phones[0]['uuid'] : ''
            });
          } else {
            phoneRes = await api.addPhone(app.activeUser.handle, app.activeUser.private_key, e.target.phone.value);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(phoneRes, null, '\t') } ];

          if (phoneRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, phone: e.target.phone.value }
          } else {
            if (!validationErrors.contact) validationErrors = { ...validationErrors, contact: {} }
            validationErrors.contact = Object.assign({phone: phoneRes.data.validation_details ? phoneRes.data.validation_details.phone : phoneRes.data.message }, validationErrors.contact);
          }
        } catch (err) {
          console.log('  ... unable to update phone, looks like we ran into an issue!');
          handleError(err);
        }
      }

      const addressUpdateData = {};
      if (e.target.address && e.target.address.value && e.target.address.value !== app.activeUser.address) addressUpdateData.street_address_1 = e.target.address ? e.target.address.value : '';
      if (e.target.city && e.target.city.value && e.target.city.value !== app.activeUser.city) addressUpdateData.city = e.target.city ? e.target.city.value : '';
      if (e.target.state && e.target.state.value && e.target.state.value !== app.activeUser.state) addressUpdateData.state = e.target.state ? e.target.state.value : '';
      if (e.target.zip && e.target.zip.value && e.target.zip.value !== app.activeUser.zip) addressUpdateData.postal_code = e.target.zip ? e.target.zip.value : '';
      if (Object.keys(addressUpdateData).length) {
        try {
          ApiEndpoint = '/add/address';
          let addressRes = {};
          if (entityRes.data.addresses.length) {
            ApiEndpoint = '/update/address';
            addressUpdateData.uuid = entityRes.data.addresses[0] ? entityRes.data.addresses[0]['uuid'] : '';
            addressRes = await api.updateAddress(app.activeUser.handle, app.activeUser.private_key, addressUpdateData);
          } else {
            addressRes = await api.addAddress(app.activeUser.handle, app.activeUser.private_key, addressUpdateData);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(addressRes, null, '\t') } ];

          if (addressRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, address: e.target.address.value, city: e.target.city.value, state: e.target.state.value, zip: e.target.zip.value }
          } else {
            validationErrors = { ...validationErrors, address: addressRes.data.validation_details ? addressRes.data.validation_details.address : addressRes.data.message }
          }
        } catch (err) {
          console.log('  ... unable to update address, looks like we ran into an issue!');
          handleError(err);
        }
      }

      if (e.target.ein && e.target.ein.value && e.target.ein.value !== app.activeUser.ein) {
        const identityUpdateData = {};
        identityUpdateData.alias = 'EIN';
        identityUpdateData.value = e.target.ein ? e.target.ein.value : '';
        try {
          ApiEndpoint = '/add/identity';
          let einRes = {};
          if (entityRes.data.identities.length) {
            ApiEndpoint = '/update/identity';
            identityUpdateData.uuid = entityRes.data.identities[0] ? entityRes.data.identities[0]['uuid'] : '';
            einRes = await api.updateIdentity(app.activeUser.handle, app.activeUser.private_key, identityUpdateData);
          } else {
            einRes = await api.addIdentity(app.activeUser.handle, app.activeUser.private_key, identityUpdateData);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(einRes, null, '\t') } ];

          if (einRes.data.success) {
            updateSuccess = true;
            updatedEntityData = { ...updatedEntityData, ein: identityUpdateData.value }
          } else {
            if(einRes.data && einRes.data.message) result.alert = { message: einRes.data.message, type: 'danger' };
            validationErrors = { ...validationErrors, identity: einRes.data.validation_details ? einRes.data.validation_details : einRes.data.message }
          }
        } catch (err) {
          console.log('  ... unable to update identity, looks like we ran into an issue!');
          handleError(err);
        }
      }

      try {
        console.log('  ... update completed!');
        
        let appData = {};
        if (updateSuccess) {
          refreshApp();
          const activeUser = app.users.find(u => u.handle === app.activeUser.handle);
          updatedEntityData = { ...activeUser, ...updatedEntityData, kybLevel: preferredKyb }
          result = {
            activeUser: { ...activeUser, ...updatedEntityData } ,
            alert: { message: 'Registration data was successfully added.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === app.activeUser.handle ? { ...u, ...updatedEntityData } : u),
          };
          if (Object.keys(errors).length) setErrors({});
        } else if ( Object.keys(validationErrors).length ) {
          if (validationErrors.identity && validationErrors.identity === "Input did not match EIN regex pattern ^\\d{2}-?\\d{7}$") validationErrors.identity = 'EIN acceptable format: xx-xxxxxxx';
          setShowUpdateBtn(true);
          setErrors(validationErrors);
          setValidated(true);
        }
        setAppData({
          ...appData,
          responses: [...updatedResponses, ...app.responses],
          settings: { ...app.settings, preferredKybLevel: preferredKyb }
        }, () => {
          updateApp({ ...result });
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
    } else {
      const wallet = api.generateWallet();
      const entity = {};
      entity.type = 'business';
      entity.identity_alias = 'EIN';
      entity.handle = app.settings.kybHandle;
      if (e.target.entity_name) entity.entity_name = e.target.entity_name ? e.target.entity_name.value : '';
      if (e.target.address) entity.address = e.target.address ? e.target.address.value : '';
      if (e.target.address) entity.addresAlias = 'primary';
      if (e.target.city) entity.city = e.target.city ? e.target.city.value : '';
      if (e.target.state) entity.state = e.target.state ? e.target.state.value : '';
      if (e.target.zip) entity.zip = e.target.zip ? e.target.zip.value : '';
      if (e.target.phone) entity.phone = e.target.phone ? e.target.phone.value : '';
      if (e.target.email) entity.email = e.target.email ? e.target.email.value : '';
      if (e.target.ein) entity.ein = e.target.ein ? e.target.ein.value : '';
      if (e.target.business_website) entity.business_website = e.target.business_website ? e.target.business_website.value : '';
      if (e.target.doing_business_as) entity.doing_business_as = e.target.doing_business_as ? e.target.doing_business_as.value : '';
      entity.cryptoAddress = wallet.address;
      entity.business_type = app.settings.kybBusinessType;
      entity.naics_code = app.settings.kybNaicsCode;
      entity.flow = app.settings.flow;

      try {
        const res = await api.register(entity);
        let result = {};
        let appData = {};
        console.log('  ... completed!');
        if (res.data.status === 'SUCCESS') {
          refreshApp();
          entity.private_key = wallet.privateKey;
          entity.active = true;
          entity.business = true;
          entity.kybLevel = preferredKyb;
          result = {
            activeUser: entity,
            alert: { message: `Success! ${entity.handle} is now registered.`, type: 'success' }
          };
          appData = {
            settings: { ...app.settings, kybBusinessType: false, kybNaicsCode: false, kybNaicsCategory: false },
            users: [...app.users.map(({ active, ...u }) => u), entity],
            wallets: [...app.wallets, {
              handle: entity.handle,
              blockchain_address: wallet.address,
              private_key: wallet.privateKey,
              nickname: 'My Wallet',
              default: true
            }]
          };
          if (Object.keys(errors).length) setErrors({});
        } else if (res.data.validation_details) {
          if (res.data.validation_details.identity) res.data.validation_details.identity = 'EIN acceptable format: xx-xxxxxxx';
          setErrors(res.data.validation_details);
        }
        setAppData({
          ...appData,
          responses: [{
            endpoint: '/register',
            result: JSON.stringify(res, null, '\t')
          }, ...app.responses]
        }, () => {
          updateApp({ ...result });
          if (res.data.status === 'SUCCESS' && onSuccess) onSuccess(entity);
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
      setValidated(true);
    }
    setLoaded(true);
  }

  const onKybLevelChange = (value) => {
    setPreferredKyb(value || undefined)
    setAppData({
      settings: { ...app.settings, preferredKybLevel: value || undefined }
    }, () => {
      if (app.activeUser && app.activeUser.handle) {
        const activeUser = app.users.find(u => u.handle === app.activeUser.handle);
        updateApp({ activeUser: app.activeUser ? { ...activeUser, kybLevel: value } : false });
      }
    });
  }

  const updateUuid = (uuidObj) => {
    setEntityuuid({...entityuuid, isFetchedUUID: true, uuid: {
      email: uuidObj && uuidObj.email ? uuidObj.email : entityuuid.uuid.email ? entityuuid.uuid.email : '',
      phone: uuidObj && uuidObj.phone ? uuidObj.phone : entityuuid.uuid.phone ? entityuuid.uuid.phone : '',
      identity: uuidObj && uuidObj.identity ? uuidObj.identity : entityuuid.uuid.identity ? entityuuid.uuid.identity : '',
      address: uuidObj && uuidObj.address ? uuidObj.address : entityuuid.uuid.address ? entityuuid.uuid.address : ''
    } })
  }

  useEffect(() => {
    if (app.activeUser && app.activeUser.business_handle) {
      updateApp({ activeUser: app.users.find(user => app.activeUser.business_handle === user.handle) });
    }
  }, [app, updateApp])

  return (
    <>
      <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={register}>
        {!loaded && <Loader overlay fixed />}

        <Form.Label className="text-muted mr-5">Please choose your preferred KYB level, if you are a first time user, we suggest the KYB Standard flow:</Form.Label>
        <SelectMenu fullWidth
          title={preferredKyb ? KYB_ARRAY.find(option => option.value === preferredKyb).label : 'Choose KYB level'}
          onChange={(value) => onKybLevelChange(value)}
          className="types mb-2"
          value={preferredKyb}
          options={KYB_ARRAY}
          disabledOptions={(businessTypes && businessTypes.includes(app.settings.kybBusinessType)) ? ['KYB-STANDARD'] : []} />

        <p className="text-right text-muted mb-1"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none" onClick={() => onShowKybModal(true)}><span className="lnk">What's the difference between the KYB levels?</span><i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>
        {preferredKyb === KYB_STANDARD && !app.activeUser && <StandardKYBForm errors={errors} app={app} />}
        {preferredKyb === KYB_LITE && !app.activeUser && <LiteKYBForm businessTypes={businessTypes} errors={errors} app={app} />}
        {preferredKyb === KYB_RECEIVE_ONLY && !app.activeUser && <ReceiveOnlyKYBForm errors={errors} app={app} />}
        {app.activeUser && app.activeUser.handle && <UpdateKYBForm errors={errors} preferredKyb={preferredKyb} entityuuid={entityuuid} onLoaded={(isLoaded) => setLoaded(isLoaded)} onConfirm={onConfirm} onShowUpdate={(isUpdated) => setShowUpdateBtn(isUpdated)} />}
        {preferredKyb && app.activeUser && showUpdateBtn && <Button type="submit" className="ml-auto d-flex mt-2">Update data</Button>}
        {children}
      </Form>
      <>
        {app.activeUser && app.activeUser.handle && <AddDataForm errors={errors} entityuuid={entityuuid} onLoaded={(isLoaded) => setLoaded(isLoaded)} onErrors={(errorsObj) => { setErrors(errorsObj); setValidated(true); } } onUpdateUuid={(uuidObj) => updateUuid(uuidObj)} />}
        {app.alert.message && <div className="d-flex mt-2"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}
      </>
    </>
  )
};

export default RegisterBusinessForm;
