import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import Loader from '../../components/common/Loader';
import SelectMenu from '../../components/common/SelectMenu';
import StandardKYBForm from '../../components/kyb/StandardKYBForm';
import LiteKYBForm from '../../components/kyb/LiteKYBForm';
import ReceiveOnlyKYBForm from '../../components/kyb/ReceiveOnlyKYBForm';
import RegisterBusinessDataForm from '../../components/kyb/RegisterBusinessDataForm';

import { KYB_STANDARD, KYB_LITE, KYB_RECEIVE_ONLY, KYB_ARRAY } from '../../constants';

const RegisterBusinessForm = ({ className, children, onError, onSuccess, onShowKybModal, onConfirm }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(true);
  const [preferredKyb, setPreferredKyb] = useState(app.activeUser.kybLevel || app.settings.preferredKybLevel);
  const [reloadUUID, setReloadUUID] = useState(false);
  const businessTypes = ['sole_proprietorship', 'trust', 'unincorporated_association'];

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
    if (e.target.email && !e.target.email.value) {
      isValidated = false;
      validationErrors.contact = Object.assign({email: "This field may not be blank."}, validationErrors.contact);
    }
    if (e.target.address && !e.target.address.value) {
      isValidated = false;
      validationErrors.address = Object.assign({street_address_1: "This field may not be blank."}, validationErrors.address);
    }
    if (e.target.city && !e.target.city.value) {
      isValidated = false;
      validationErrors.address = Object.assign({city: "This field may not be blank."}, validationErrors.address);
    }
    if (e.target.state && !e.target.state.value) {
      isValidated = false;
      validationErrors.address = Object.assign({state: "This field may not be blank."}, validationErrors.address);
    }
    if (e.target.zip && !e.target.zip.value) {
      isValidated = false;
      validationErrors.address = Object.assign({postal_code: "This field may not be blank."}, validationErrors.address);
    }
    if (e.target.phone && !e.target.phone.value) {
      isValidated = false;
      validationErrors.contact = Object.assign({phone: "This field may not be blank."}, validationErrors.contact);
    }
    if (e.target.ein && !e.target.ein.value) {
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
      let ApiEndpoint;
      let updatedEntityData = {};
      let updatedResponses = [];
      let successStatus = { entity: true, email: true, address: true, phone: true, identity: true };
      let entityRes = {};
      try {
        entityRes = await api.getEntity(app.activeUser.handle, app.activeUser.private_key);
        if (!entityRes.data.success) {
          console.log('... fetched entity info but success status false!', entityRes);
        }
      } catch (err) {
        console.log('  ... unable to get entity info, looks like we ran into an issue!');
        handleError(err);
      }

      if (e.target.entity_name && e.target.entity_name.value && e.target.entity_name.value !== app.activeUser.entity_name) {
        try {
          const entityUpdateRes = await api.updateEntity(app.activeUser.handle, app.activeUser.private_key, { entity_name: e.target.entity_name.value });
          updatedResponses = [ ...updatedResponses, { endpoint: '/update/entity', result: JSON.stringify(entityUpdateRes, null, '\t') } ];

          if (entityUpdateRes.data.success) {
            updatedEntityData = { ...updatedEntityData, entity_name: e.target.entity_name.value};
          }  else if (entityUpdateRes.data.validation_details) {
            successStatus = {...successStatus, entity: false};
            validationErrors = { ...validationErrors, entity: entityUpdateRes.data.validation_details }
          } else {
            console.log('... update entity failed!', entityUpdateRes);
          }
        } catch (err) {
          console.log('  ... unable to update entity, looks like we ran into an issue!');
          handleError(err);
        }
      }

      validationErrors = { ...validationErrors, contact: {} }
      if (e.target.email && e.target.email.value !== app.activeUser.email) {
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
            updatedEntityData = { ...updatedEntityData, email: e.target.email.value }
          } else if (emailRes.data.validation_details) {
            successStatus = {...successStatus, email: false };
            validationErrors.contact = Object.assign({email: emailRes.data.validation_details.email}, validationErrors.contact);
          } else {
            console.log('... update email failed!', emailRes);
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
            updatedEntityData = { ...updatedEntityData, phone: e.target.phone.value }
          } else if (phoneRes.data.validation_details) {
            successStatus = {...successStatus, phone: false};
            validationErrors.contact = Object.assign({phone: phoneRes.data.validation_details.phone}, validationErrors.contact);
          } else {
            console.log('... update phone failed!', phoneRes);
          }
        } catch (err) {
          console.log('  ... unable to update phone, looks like we ran into an issue!');
          handleError(err);
        }
      }

      const addressUpdateData = {};
      if (e.target.address && e.target.address.value !== app.activeUser.address) addressUpdateData.street_address_1 = e.target.address ? e.target.address.value : '';
      if (e.target.city && e.target.city.value !== app.activeUser.city) addressUpdateData.city = e.target.city ? e.target.city.value : '';
      if (e.target.state && e.target.state.value !== app.activeUser.state) addressUpdateData.state = e.target.state ? e.target.state.value : '';
      if (e.target.zip && e.target.zip.value !== app.activeUser.zip) addressUpdateData.postal_code = e.target.zip ? e.target.zip.value : '';
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
            updatedEntityData = { ...updatedEntityData, address: e.target.address.value, city: e.target.city.value, state: e.target.state.value, zip: e.target.zip.value }
          } else if (addressRes.data.validation_details) {
            successStatus = {...successStatus, address: false};
            validationErrors = { ...validationErrors, address: addressRes.data.validation_details.address }
          } else {
            console.log('... update address failed!', addressRes);
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
            updatedEntityData = { ...updatedEntityData, ein: identityUpdateData.value }
          } else if (einRes.data.validation_details) {
            successStatus = {...successStatus, identity: false};
            validationErrors = { ...validationErrors, identity: einRes.data.validation_details }
          } else {
            console.log('... update identity failed!', einRes);
          }
        } catch (err) {
          console.log('  ... unable to update identity, looks like we ran into an issue!');
          handleError(err);
        }
      }

      try {
        console.log('  ... update completed!');
        let result = {};
        let appData = {};
        let updateSuccess = false;

        if (preferredKyb === KYB_STANDARD) {
          if (successStatus.entity && successStatus.email && successStatus.address && successStatus.phone && successStatus.identity) {
            updateSuccess = true;
          }
        } else if (preferredKyb === KYB_LITE) {
          if (successStatus.entity && successStatus.email && successStatus.address && successStatus.phone) {
            updateSuccess = true;
            if(!successStatus.identity) updateSuccess = false;
          }
        } else if (preferredKyb === KYB_RECEIVE_ONLY) {
          if (successStatus.entity) {
            updateSuccess = true;
          }
        }

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
          setReloadUUID(true);
          if (Object.keys(errors).length) setErrors({});
        } else if ( Object.keys(validationErrors).length ) {
          if (validationErrors.identity) validationErrors.identity = 'EIN acceptable format: xx-xxxxxxx';
          setErrors(validationErrors);
          setValidated(true);
          if (onError) onError(validationErrors);
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
          if (onError) onError(res.data.validation_details);
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
    });
  }

  useEffect(() => {
    if (app.activeUser && app.activeUser.business_handle) {
      updateApp({ activeUser: app.users.find(user => app.activeUser.business_handle === user.handle) });
    }
  }, [app, updateApp])

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={register}>
      {!loaded && <Loader overlay fixed />}

      <Form.Label className="text-muted mr-5">Please choose your preferred KYB level:</Form.Label>
      <SelectMenu fullWidth
        title={preferredKyb ? KYB_ARRAY.find(option => option.value === preferredKyb).label : 'Choose KYB level'}
        onChange={(value) => onKybLevelChange(value)}
        className="types mb-4"
        value={preferredKyb}
        options={KYB_ARRAY}
        disabledOptions={(businessTypes && businessTypes.includes(app.settings.kybBusinessType)) ? ['KYB-STANDARD'] : []} />

      {!preferredKyb ? <p className="text-right text-muted"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none" onClick={() => onShowKybModal(true)}><span className="lnk">What's the difference between the KYB levels?</span><i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p> : ''}
      {preferredKyb === KYB_STANDARD && <StandardKYBForm errors={errors} app={app} isHide={(app.activeUser && app.activeUser.kybLevel === KYB_STANDARD)} />}
      {preferredKyb === KYB_LITE && <LiteKYBForm businessTypes={businessTypes} errors={errors} app={app} isHide={(app.activeUser && app.activeUser.kybLevel === KYB_LITE)} />}
      {preferredKyb === KYB_RECEIVE_ONLY && <ReceiveOnlyKYBForm errors={errors} app={app} isHide={(app.activeUser && app.activeUser.kybLevel === KYB_RECEIVE_ONLY)} />}
      {preferredKyb && (app.activeUser && app.activeUser.kybLevel !== preferredKyb) && <div className="d-flex mb-md-5"><Button type="submit" className="ml-auto" disabled={!(app.activeUser && app.activeUser.kybLevel !== app.settings.preferredKybLevel)}>Add data</Button></div>}
      {app.activeUser && app.activeUser.handle && <RegisterBusinessDataForm errors={errors} onConfirm={onConfirm} onLoaded={(isLoaded) => setLoaded(isLoaded)} onErrors={(errorsObj) => { setErrors(errorsObj); setValidated(true); } } reloadUUID={reloadUUID} onReloadedUUID={(isReloaded) => setReloadUUID(isReloaded)} />}

      {children}
    </Form>
  )
};

export default RegisterBusinessForm;
