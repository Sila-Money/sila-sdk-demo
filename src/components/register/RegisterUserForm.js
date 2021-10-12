import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import Loader from '../../components/common/Loader';
import SelectMenu from '../../components/common/SelectMenu';
import DefaultKYCForm from '../../components/register/DefaultKYCForm';
import KYCLiteForm from '../../components/register/KYCLiteForm';
import ReceiveOnlyKYCForm from '../../components/register/ReceiveOnlyKYCForm';
import InstantAchKYCForm from '../../components/register/InstantAchKYCForm';
import RegisterDataForm from '../../components/register/RegisterDataForm';

import { DEFAULT_KYC, LITE_KYC, RECEIVE_ONLY_KYC, INSTANT_ACH_KYC, KYC_ARRAY } from '../../constants';

const RegisterUserForm = ({ className, handle, children, onError, onSuccess, onShowKycModal, onConfirm }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(true);
  const [preferredKyc, setPreferredKyc] = useState(app.activeUser.kycLevel || app.settings.preferredKycLevel);

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER USER ***');
    e.preventDefault();
    console.log('Waking up the API service ...');

    let isValidated = true;
    let validationErrors = {};
    if (e.target.firstName && !e.target.firstName.value) {
      isValidated = false;
      validationErrors.entity = Object.assign({first_name: "This field may not be blank."}, validationErrors.entity);
    }
    if (e.target.lastName && !e.target.lastName.value) {
      isValidated = false;
      validationErrors.entity = Object.assign({last_name: "This field may not be blank."}, validationErrors.entity);
    }
    if (e.target.email && !e.target.email.value) {
      isValidated = false;
      validationErrors.contact = Object.assign({email: "This field may not be blank."}, validationErrors.contact);
    }
    if (e.target.phone && !e.target.phone.value) {
      isValidated = false;
      validationErrors.contact = Object.assign({phone: "This field may not be blank."}, validationErrors.contact);
    }
    if (e.target.dateOfBirth && !e.target.dateOfBirth.value) {
      isValidated = false;
      validationErrors.entity = Object.assign({birthdate: "This field may not be blank."}, validationErrors.entity);
    }
    if (e.target.ssn && !e.target.ssn.value) {
      isValidated = false;
      validationErrors.identity = "This field may not be blank.";
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
    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    setLoaded(false);
    let ApiEndpoint;
    let updatedEntityData = {};
    let updatedResponses = [];
    let successStatus = { entity: true, email: true, phone: true, identity: true, address: true };
    if (app.activeUser && app.activeUser.handle) {
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

      const entityUpdateData = {};
      if (e.target.firstName.value !== app.activeUser.firstName) entityUpdateData.first_name = e.target.firstName.value;
      if (e.target.lastName.value !== app.activeUser.lastName) entityUpdateData.last_name = e.target.lastName.value;
      if (preferredKyc !== RECEIVE_ONLY_KYC && e.target.dateOfBirth.value !== app.activeUser.dateOfBirth) entityUpdateData.birthdate = e.target.dateOfBirth ? e.target.dateOfBirth.value : '';
      if (Object.keys(entityUpdateData).length) {
        try {
          const entityUpdateRes = await api.updateEntity(app.activeUser.handle, app.activeUser.private_key, entityUpdateData);
          updatedResponses = [ ...updatedResponses, { endpoint: '/update/entity', result: JSON.stringify(entityUpdateRes, null, '\t') } ];

          if (entityUpdateRes.data.success) {
            updatedEntityData = { ...updatedEntityData, firstName: e.target.firstName.value, lastName: e.target.lastName.value, dateOfBirth: e.target.dateOfBirth.value};
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

      if(preferredKyc !== RECEIVE_ONLY_KYC) {
        validationErrors = { ...validationErrors, contact: {} }
        if (e.target.email.value !== app.activeUser.email) {
          try {
            const emailUpdateData = {};
            emailUpdateData.email = e.target.email ? e.target.email.value : '';
            emailUpdateData.uuid = entityRes.data.emails[0] ? entityRes.data.emails[0]['uuid'] : '';

            ApiEndpoint = '/add/email';
            let emailRes = {};
            if (entityRes.data.emails.length) {
              emailRes = await api.updateEmail(app.activeUser.handle, app.activeUser.private_key, emailUpdateData);
              ApiEndpoint = '/update/email';
            } else {
              emailRes = await api.addEmail(app.activeUser.handle, app.activeUser.private_key, emailUpdateData.email);
            }

            updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(emailRes, null, '\t') } ];

            if (emailRes.data.success) {
              delete emailUpdateData.uuid;
              updatedEntityData = { ...updatedEntityData, ...emailUpdateData }
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

        const phoneUpdateData = {};
        if (e.target.phone.value !== app.activeUser.phone) phoneUpdateData.phone = e.target.phone ? e.target.phone.value : '';
        if (preferredKyc === INSTANT_ACH_KYC && e.target.smsOptIn && e.target.smsOptIn.checked !== app.activeUser.smsOptIn) phoneUpdateData.smsOptIn = (e.target.smsOptIn && e.target.smsOptIn.checked) ? true : false
        if (Object.keys(phoneUpdateData).length) {
          try {
            ApiEndpoint = '/add/phone';
            let phoneRes = {};
            if (entityRes.data.phones.length) {
              phoneUpdateData.phone = e.target.phone ? e.target.phone.value : '';
              phoneUpdateData.uuid = entityRes.data.phones[0] ? entityRes.data.phones[0]['uuid'] : '';
              phoneRes = await api.updatePhone(app.activeUser.handle, app.activeUser.private_key, phoneUpdateData);
              ApiEndpoint = '/update/phone';
            } else {
              phoneRes = await api.addPhone(app.activeUser.handle, app.activeUser.private_key, phoneUpdateData.phone, {
                smsOptIn: (e.target.smsOptIn && e.target.smsOptIn.checked) ? true : false
              });
            }

            updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(phoneRes, null, '\t') } ];

            if (phoneRes.data.success) {
              updatedEntityData = { ...updatedEntityData, phone: e.target.phone.value, smsOptIn: (e.target.smsOptIn && e.target.smsOptIn.checked) ? true : false }
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
      }

      if(preferredKyc === DEFAULT_KYC || preferredKyc === INSTANT_ACH_KYC) {
        if (e.target.ssn.value !== app.activeUser.ssn) {
          const identityUpdateData = {};
          identityUpdateData.alias = 'SSN';
          identityUpdateData.value = e.target.ssn ? e.target.ssn.value : '';
          try {
            ApiEndpoint = '/add/identity';
            let ssnRes = {};
            if (entityRes.data.identities.length) {
              identityUpdateData.uuid = entityRes.data.identities[0] ? entityRes.data.identities[0]['uuid'] : '';
              ssnRes = await api.updateIdentity(app.activeUser.handle, app.activeUser.private_key, identityUpdateData);
              ApiEndpoint = '/update/identity';
            } else {
              ssnRes = await api.addIdentity(app.activeUser.handle, app.activeUser.private_key, identityUpdateData);
            }

            updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(ssnRes, null, '\t') } ];

            if (ssnRes.data.success) {
              updatedEntityData = { ...updatedEntityData, ssn: identityUpdateData.value }
            } else if (ssnRes.data.validation_details) {
              successStatus = {...successStatus, identity: false};
              validationErrors = { ...validationErrors, identity: ssnRes.data.validation_details }
            } else {
              console.log('... update identity failed!', ssnRes);
            }
          } catch (err) {
            console.log('  ... unable to update identity, looks like we ran into an issue!');
            handleError(err);
          }
        }

        const addressUpdateData = {};
        if (e.target.address.value !== app.activeUser.address) addressUpdateData.street_address_1 = e.target.address ? e.target.address.value : '';
        if (e.target.city.value !== app.activeUser.city) addressUpdateData.city = e.target.city ? e.target.city.value : '';
        if (e.target.state.value !== app.activeUser.state) addressUpdateData.state = e.target.state ? e.target.state.value : '';
        if (e.target.zip.value !== app.activeUser.zip) addressUpdateData.postal_code = e.target.zip ? e.target.zip.value : '';
        if (Object.keys(addressUpdateData).length) {
          try {
            ApiEndpoint = '/add/address';
            let addressRes = {};
            if (entityRes.data.addresses.length) {
              addressUpdateData.uuid = entityRes.data.addresses[0] ? entityRes.data.addresses[0]['uuid'] : '';
              addressRes = await api.updateAddress(app.activeUser.handle, app.activeUser.private_key, addressUpdateData);
              ApiEndpoint = '/update/address';
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
      }

      try {
        console.log('  ... update completed!');
        let result = {};
        let appData = {};
        let updateSuccess = false;

        if (preferredKyc === DEFAULT_KYC || preferredKyc === INSTANT_ACH_KYC) {
          if (successStatus.entity && successStatus.email && successStatus.phone && successStatus.identity && successStatus.address) {
            updateSuccess = true;
          }
        } else if (preferredKyc === LITE_KYC) {
          if (successStatus.entity && successStatus.email && successStatus.phone) {
            updateSuccess = true;
          }
        } else if (preferredKyc === RECEIVE_ONLY_KYC) {
          if (successStatus.entity) {
            updateSuccess = true;
          }
        }

        if (updateSuccess) {
          refreshApp();
          const activeUser = app.users.find(u => u.handle === app.activeUser.handle);
          updatedEntityData = { ...activeUser, ...updatedEntityData, kycLevel: preferredKyc }
          result = {
            activeUser: { ...activeUser, ...updatedEntityData } ,
            alert: { message: 'Registration data was successfully added.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === app.activeUser.handle ? { ...u, ...updatedEntityData } : u),
          };
          if (Object.keys(errors).length) setErrors({});
        } else if ( Object.keys(validationErrors).length ) {
          setErrors(validationErrors);
          setValidated(true);
          if (onError) onError(validationErrors);
        }
        setAppData({
          ...appData,
          responses: [...app.responses, ...updatedResponses],
          settings: { ...app.settings, preferredKycLevel: preferredKyc }
        }, () => {
          updateApp({ ...result });
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
    } else {
      const wallet = api.generateWallet();
      const entity = new api.User();
      entity.handle = handle;
      entity.firstName = e.target.firstName.value;
      entity.lastName = e.target.lastName.value;
      entity.address = e.target.address ? e.target.address.value : '';
      entity.city = e.target.city ? e.target.city.value : '';
      entity.state = e.target.state ? e.target.state.value : '';
      entity.zip = e.target.zip ? e.target.zip.value : '';
      entity.phone = e.target.phone ? e.target.phone.value : '';
      entity.email = e.target.email ? e.target.email.value : '';
      if(preferredKyc !== RECEIVE_ONLY_KYC) entity.dateOfBirth = e.target.dateOfBirth ? e.target.dateOfBirth.value : '';
      entity.ssn = e.target.ssn ? e.target.ssn.value : '';
      entity.cryptoAddress = wallet.address;
      entity.flow = app.settings.flow;
      if(preferredKyc === INSTANT_ACH_KYC) {
        entity.smsOptIn = e.target.smsOptIn.checked ? true : false;
        entity.deviceFingerprint = e.target.deviceFingerprint ? e.target.deviceFingerprint.value : '';
      }

      try {
        const res = await api.register(entity);
        let result = {};
        let appData = {};
        console.log('  ... completed!');
        if (res.data.success) {
          refreshApp();
          entity.private_key = wallet.privateKey;
          entity.active = true;
          entity.kycLevel = preferredKyc;
          result = {
            alert: { message: `Success! ${handle} is now registered.`, type: 'success' }
          };
          appData = {
            settings: { ...app.settings, kycHandle: false },
            users: [...app.users, entity],
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
          if (res.data.success && onSuccess) onSuccess(entity);
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
      setValidated(true);
    }
    setLoaded(true);
  }

  const onKycLevelChange = (value) => {
    setPreferredKyc(value || undefined)
    setAppData({
      settings: { ...app.settings, preferredKycLevel: value || undefined }
    });
  }

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={register}>
      {!loaded && <Loader overlay />}

      <Form.Label className="text-muted mr-5">Please choose your preferred KYC level:</Form.Label>
      <SelectMenu fullWidth
        title={preferredKyc ? KYC_ARRAY.find(option => option.value === preferredKyc).label : 'Choose KYC'}
        onChange={(value) => onKycLevelChange(value)}
        className="types mb-4"
        value={preferredKyc}
        options={KYC_ARRAY} />

      {!preferredKyc ? <p className="text-right text-muted"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none" onClick={() => onShowKycModal(true)}><span className="lnk">What's the difference between these KYC levels?</span><i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p> : ''}
      {preferredKyc === DEFAULT_KYC && <DefaultKYCForm errors={errors} app={app} isHide={(app.activeUser && app.activeUser.kycLevel === DEFAULT_KYC)} />}
      {preferredKyc === LITE_KYC && <KYCLiteForm errors={errors} app={app} isHide={(app.activeUser && app.activeUser.kycLevel === LITE_KYC)} />}
      {preferredKyc === RECEIVE_ONLY_KYC && <ReceiveOnlyKYCForm errors={errors} app={app} isHide={(app.activeUser && app.activeUser.kycLevel === RECEIVE_ONLY_KYC)} />}
      {preferredKyc === INSTANT_ACH_KYC && <InstantAchKYCForm errors={errors} app={app} isHide={(app.activeUser && app.activeUser.kycLevel === INSTANT_ACH_KYC)} />}
      {preferredKyc && (app.activeUser && app.activeUser.kycLevel !== preferredKyc) && <div className="d-flex mb-md-5"><Button type="submit" className="ml-auto" disabled={!(app.activeUser && app.activeUser.kycLevel !== app.settings.preferredKycLevel)}>Add data</Button></div>}
      {app.activeUser && app.activeUser.handle && <RegisterDataForm errors={errors} onConfirm={onConfirm} onLoaded={(isLoaded) => setLoaded(isLoaded)} onErrors={(errorsObj) => { setErrors(errorsObj); setValidated(true); } } />}

      {children}
    </Form>
  )
};

export default RegisterUserForm;
