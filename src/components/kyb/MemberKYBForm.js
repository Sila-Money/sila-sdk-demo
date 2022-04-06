import React, { useState } from 'react';
import { Form, Col, InputGroup, Button } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { STATES_ARRAY } from '../../constants';

import { useAppContext } from '../../components/context/AppDataProvider';

import Loader from '../../components/common/Loader';
import AddDataForm from '../../components/register/AddDataForm';

const MemberKYBForm = ({ handle, activeMember, currentRole, moreInfoNeeded, action, onConfirm, onError, onSuccess, onMoreInfoNeeded }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  activeMember = activeMember ? app.users.find(u => u.handle === activeMember.user_handle) : undefined;
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(true);
  const [entityuuid, setEntityuuid] = useState({ isFetchedUUID: false, uuid: {} });
  const [activeDeleteField, setActiveDeleteField] = useState(undefined);
  const [showUpdateBtn, setShowUpdateBtn] = useState(action && action === 'update-member' ? false : true);
  const identityFields = ['ssn']
  const addressFields = ['address', 'city', 'state', 'zip']

  let updatedEntityData = {};
  let updatedResponses = [];
  let validationErrors = {};
  let result = {};
  let appData = {};
  let ApiEndpoint;

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER USER ***');
    e.preventDefault();
    console.log('Waking up the API service ...');

    let isValidated = true;
    let validationErrors = {};
    if (e.target.firstName && e.target.firstName.value) e.target.firstName.value = e.target.firstName.value.trim();
    if (e.target.lastName && e.target.lastName.value) e.target.lastName.value = e.target.lastName.value.trim();
    if (e.target.ssn && e.target.ssn.value) e.target.ssn.value = e.target.ssn.value.trim();
    if (e.target.address && e.target.address.value) e.target.address.value = e.target.address.value.trim();
    if (e.target.city && e.target.city.value) e.target.city.value = e.target.city.value.trim();
    if (e.target.zip && e.target.zip.value) e.target.zip.value = e.target.zip.value.trim();

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
    let successUuid = {
      email: entityuuid.uuid.email ? entityuuid.uuid.email : '',
      phone: entityuuid.uuid.phone ? entityuuid.uuid.phone : '',
      identity: entityuuid.uuid.identity ? entityuuid.uuid.identity : '',
      address: entityuuid.uuid.address ? entityuuid.uuid.address : ''
    };

    if (moreInfoNeeded && activeMember) {
      const entityUpdateData = {};
      if (e.target.firstName && e.target.firstName.value !== activeMember.firstName) entityUpdateData.first_name = e.target.firstName.value;
      if (e.target.lastName && e.target.lastName.value !== activeMember.lastName) entityUpdateData.last_name = e.target.lastName.value;
      if (e.target.dateOfBirth && e.target.dateOfBirth.value !== activeMember.dateOfBirth) entityUpdateData.birthdate = e.target.dateOfBirth ? e.target.dateOfBirth.value : '';
      if (Object.keys(entityUpdateData).length) {
        try {
          const entityUpdateRes = await api.updateEntity(activeMember.handle, activeMember.private_key, entityUpdateData);
          updatedResponses = [ ...updatedResponses, { endpoint: '/update/entity', result: JSON.stringify(entityUpdateRes, null, '\t') } ];

          if (entityUpdateRes.data.success) {
            updatedEntityData = { ...updatedEntityData, firstName: e.target.firstName.value, lastName: e.target.lastName.value, dateOfBirth: e.target.dateOfBirth ? e.target.dateOfBirth.value : activeMember.dateOfBirth};
            successStatus = {...successStatus, entity: true};
          } else {
            successStatus = {...successStatus, entity: false};
            validationErrors = { ...validationErrors, entity: entityUpdateRes.data.validation_details ? entityUpdateRes.data.validation_details : entityUpdateRes.data.message }
            if(action && action === 'update-member' && entityUpdateRes.data && entityUpdateRes.data.message) result.alert = { message: entityUpdateRes.data.message, type: 'danger' };
          }
        } catch (err) {
          console.log('  ... unable to update entity, looks like we ran into an issue!');
          handleError(err);
        }
      }
      
      validationErrors = { ...validationErrors, contact: {} }
      if (e.target.email && e.target.email.value !== activeMember.email) {
        try {
          ApiEndpoint = '/add/email';
          let emailRes = {};
          if (entityuuid.uuid.email && entityuuid.uuid.email.length) {
            ApiEndpoint = '/update/email';
            emailRes = await api.updateEmail(activeMember.handle, activeMember.private_key, {
              email: e.target.email.value,
              uuid: entityuuid.uuid.email
            });
          } else {
            emailRes = await api.addEmail(activeMember.handle, activeMember.private_key, e.target.email.value);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(emailRes, null, '\t') } ];

          if (emailRes.data.success) {
            updatedEntityData = { ...updatedEntityData, email: e.target.email.value }
            successStatus = {...successStatus, email: true };
            successUuid = {...successUuid, email: emailRes.data && emailRes.data.email ? emailRes.data.email.uuid : entityuuid.uuid.email ? entityuuid.uuid.email : '' };
          } else {
            successStatus = {...successStatus, email: false };
            validationErrors.contact = Object.assign({email: emailRes.data.validation_details ? emailRes.data.validation_details.email : emailRes.data.message}, validationErrors.contact);
          }
        } catch (err) {
          console.log('  ... unable to update email, looks like we ran into an issue!');
          handleError(err);
        }
      }

      if (e.target.phone && e.target.phone.value !== activeMember.phone) {
        try {
          ApiEndpoint = '/add/phone';
          let phoneRes = {};
          if (entityuuid.uuid.phone && entityuuid.uuid.phone.length) {
            ApiEndpoint = '/update/phone';
            phoneRes = await api.updatePhone(activeMember.handle, activeMember.private_key, {
              phone: e.target.phone.value,
              uuid: entityuuid.uuid.phone
            });
          } else {
            phoneRes = await api.addPhone(activeMember.handle, activeMember.private_key, e.target.phone.value);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(phoneRes, null, '\t') } ];

          if (phoneRes.data.success) {
            updatedEntityData = { ...updatedEntityData, phone: e.target.phone.value }
            successStatus = {...successStatus, phone: true};
            successUuid = {...successUuid, phone: phoneRes.data && phoneRes.data.phone ? phoneRes.data.phone.uuid : entityuuid.uuid.phone ? entityuuid.uuid.phone : '' };
          } else {
            successStatus = {...successStatus, phone: false};
            validationErrors.contact = Object.assign({phone: phoneRes.data.validation_details ? phoneRes.data.validation_details.phone : phoneRes.data.message}, validationErrors.contact);
          }
        } catch (err) {
          console.log('  ... unable to update phone, looks like we ran into an issue!');
          handleError(err);
        }
      }
      
      if (e.target.ssn && e.target.ssn.value !== activeMember.ssn) {
        const identityUpdateData = {};
        identityUpdateData.alias = 'SSN';
        identityUpdateData.value = e.target.ssn ? e.target.ssn.value : '';
        try {
          ApiEndpoint = '/add/identity';
          let ssnRes = {};
          if (entityuuid.uuid.identity && entityuuid.uuid.identity.length) {
            identityUpdateData.uuid = entityuuid.uuid.identity;
            ssnRes = await api.updateIdentity(activeMember.handle, activeMember.private_key, identityUpdateData);
            ApiEndpoint = '/update/identity';
          } else {
            ssnRes = await api.addIdentity(activeMember.handle, activeMember.private_key, identityUpdateData);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(ssnRes, null, '\t') } ];

          if (ssnRes.data.success) {
            updatedEntityData = { ...updatedEntityData, ssn: e.target.ssn.value }
            successStatus = {...successStatus, identity: true};
            successUuid = {...successUuid, identity: ssnRes.data && ssnRes.data.identity ? ssnRes.data.identity.uuid : entityuuid.uuid.identity ? entityuuid.uuid.identity : '' };
          } else {
            successStatus = {...successStatus, identity: false};
            validationErrors = { ...validationErrors, identity: ssnRes.data.validation_details ? ssnRes.data.validation_details : ssnRes.data.message }
            if(action && action === 'update-member' && ssnRes.data && ssnRes.data.message) result.alert = { message: ssnRes.data.message, type: 'danger' };
          }
        } catch (err) {
          console.log('  ... unable to update identity, looks like we ran into an issue!');
          handleError(err);
        }
      }

      const addressUpdateData = {};
      if (e.target.address && e.target.address.value !== activeMember.address) addressUpdateData.street_address_1 = e.target.address ? e.target.address.value : '';
      if (e.target.city && e.target.city.value !== activeMember.city) addressUpdateData.city = e.target.city ? e.target.city.value : '';
      if (e.target.state && e.target.state.value !== activeMember.state) addressUpdateData.state = e.target.state ? e.target.state.value : '';
      if (e.target.zip && e.target.zip.value !== activeMember.zip) addressUpdateData.postal_code = e.target.zip ? e.target.zip.value : '';
      if (Object.keys(addressUpdateData).length) {
        try {
          ApiEndpoint = '/add/address';
          let addressRes = {};
          if (entityuuid.uuid.address && entityuuid.uuid.address.length) {
            addressUpdateData.uuid = entityuuid.uuid.address
            addressRes = await api.updateAddress(activeMember.handle, activeMember.private_key, addressUpdateData);
            ApiEndpoint = '/update/address';
          } else {
            addressRes = await api.addAddress(activeMember.handle, activeMember.private_key, addressUpdateData);
          }

          updatedResponses = [ ...updatedResponses, { endpoint: ApiEndpoint, result: JSON.stringify(addressRes, null, '\t') } ];

          if (addressRes.data.success) {
            updatedEntityData = {
              ...updatedEntityData,
              address: e.target.address ? e.target.address.value : activeMember.address,
              city: e.target.city ? e.target.city.value : activeMember.city,
              state: e.target.state ? e.target.state.value : activeMember.state,
              zip: e.target.zip ? e.target.zip.value : activeMember.zip
            }
            successStatus = {...successStatus, address: true};
            successUuid = {...successUuid, address: addressRes.data && addressRes.data.address ? addressRes.data.address.uuid : entityuuid.uuid.address ? entityuuid.uuid.address : '' };
          } else {
            successStatus = {...successStatus, address: false};
            validationErrors = { ...validationErrors, address: addressRes.data.validation_details ? addressRes.data.validation_details.address ? addressRes.data.validation_details.address : addressRes.data.validation_details : addressRes.data.message }
          }
        } catch (err) {
          console.log('  ... unable to update address, looks like we ran into an issue!');
          handleError(err);
        }
      }

      try {
        console.log('  ... update completed!');
        let updateSuccess = false;
        setEntityuuid({...entityuuid, uuid: successUuid })

        if (successStatus.entity && successStatus.email && successStatus.phone && successStatus.identity && successStatus.address) {
          updateSuccess = true;
        }
        
        if (updateSuccess) {
          refreshApp();
          const appUser = app.users.find(u => u.handle === activeMember.handle);
          updatedEntityData = { ...appUser, ...updatedEntityData, kycLevel: false, active: true }
          if(action && action === 'update-member') {
            result = {
              alert: { message: 'Registration data was successfully updated.', type: 'success' }
            };
          } else {
            result = {
              activeUser: { ...appUser, ...updatedEntityData },
              alert: { message: 'Registration data was successfully added.', type: 'success' }
            };
          }

          appData = {
            users: app.users.map(u => u.handle === activeMember.handle ? { ...u, ...updatedEntityData } : u)
          };
          if (Object.keys(errors).length) setErrors({});
          if(action && action === 'update-member') setShowUpdateBtn(false);
        } else if ( Object.keys(validationErrors).length ) {
          setErrors(validationErrors);
          setValidated(true);
          if (onError) onError(validationErrors);
        }

        setAppData({
          ...appData,
          responses: [...updatedResponses, ...app.responses]
        }, () => {
          updateApp({ ...result });
          if (updateSuccess && onSuccess) onSuccess(currentRole, updatedEntityData);
          if (action !== 'update-member' && updateSuccess && onMoreInfoNeeded) onMoreInfoNeeded(false);
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
      if (e.target.dateOfBirth) entity.dateOfBirth = e.target.dateOfBirth ? e.target.dateOfBirth.value : '';
      entity.ssn = e.target.ssn ? e.target.ssn.value : '';
      entity.cryptoAddress = wallet.address;
      entity.flow = app.settings.flow;

      try {
        const res = await api.register(entity);
        console.log('  ... completed!');
        if (res.data.success) {
          refreshApp();
          entity.private_key = wallet.privateKey;
          entity.active = true;
          entity.kycLevel = false;
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
          setValidated(true);
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
          if (res.data.success && onSuccess) onSuccess(currentRole, entity);
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
    }
    setLoaded(true);
  }

  const onDelete = async (fieldName, fieldLabel) => {
    setActiveDeleteField(fieldName);
    onConfirm({ show: true, message: `Are you sure you want to delete the ${fieldLabel} data point from the registered data?`, onSuccess: async () => {
      let deleteSuccess = false;
      let deleteRes = {};
      setLoaded(false);
      onConfirm({show: false, message: ''});
      try {
        if (identityFields.includes(fieldName)) {
          ApiEndpoint = 'identity';
          deleteRes = await api.deleteIdentity(activeMember.handle, activeMember.private_key, entityuuid.uuid.identity);
        } else if (addressFields.includes(fieldName)) {
          ApiEndpoint = 'address';
          deleteRes = await api.deleteAddress(activeMember.handle, activeMember.private_key, entityuuid.uuid.address);
        } else {
          validationErrors = Object.assign({error: "Registration data can not be deleted because it is required for this KYC level."}, validationErrors.error);
        }

        if (ApiEndpoint) updatedResponses = [ ...updatedResponses, { endpoint: `/delete/${ApiEndpoint}`, result: JSON.stringify(deleteRes, null, '\t') } ];

        if (deleteRes.data && deleteRes.data.success) {
          deleteSuccess = true;
          if (identityFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, ssn: '' };
          if (addressFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, address: '', city: '', state: '', zip: '' };
        }  else if (deleteRes.data && !deleteRes.data.success) {
          validationErrors = Object.assign({error: deleteRes.data.validation_details ? deleteRes.data.validation_details.uuid : deleteRes.data.message }, validationErrors.error);
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
          const appUser = app.users.find(u => u.handle === activeMember.handle);
          updatedEntityData = { ...appUser, ...updatedEntityData, active: true }
          result = {
            alert: { message: 'Registration data was successfully deleted.', type: 'success' }
          };
          appData = {
            users: app.users.map(u => u.handle === activeMember.handle ? { ...u, ...updatedEntityData } : u)
          };

          setAppData({
            ...appData,
            responses: [...updatedResponses, ...app.responses]
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

      setLoaded(true);
    }, onHide: () => {
      onConfirm({show: false, message: ''});
    } })
    setActiveDeleteField(undefined);
  }

  const onChange = (e) => {
    if (action && action === 'update-member' && activeMember && e.target.name && activeMember[e.target.name] && activeMember[e.target.name] !== e.target.value) setShowUpdateBtn(true);
  }

  const updateUuid = (uuidObj) => {
    setEntityuuid({...entityuuid, isFetchedUUID: true, uuid: {
      email: uuidObj && uuidObj.email ? uuidObj.email : entityuuid.uuid.email ? entityuuid.uuid.email : '',
      phone: uuidObj && uuidObj.phone ? uuidObj.phone : entityuuid.uuid.phone ? entityuuid.uuid.phone : '',
      identity: uuidObj && uuidObj.identity ? uuidObj.identity : entityuuid.uuid.identity ? entityuuid.uuid.identity : '',
      address: uuidObj && uuidObj.address ? uuidObj.address : entityuuid.uuid.address ? entityuuid.uuid.address : ''
    } })
  }
  
  return (
    <>
      <Form className="mt-2" noValidate validated={validated} autoComplete="off" onSubmit={register}>
        {!loaded && <Loader overlay />}

        <p className="text-muted mb-1">Please fill out the below fields for this business member.</p>

        <p className="text-right text-lg text-warning mb-2">All fields are required for this Business Member.</p>

        <Form.Row>
          <Form.Group as={Col} md="6" controlId="registerFirstName" className="required">
            <Form.Control required placeholder="First Name" name="firstName" onChange={onChange} defaultValue={activeMember ? activeMember.firstName : undefined} isInvalid={Boolean(errors.entity && errors.entity.first_name)} />
            {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="registerLastName" className="required">
            <Form.Control required placeholder="Last Name" name="lastName" onChange={onChange} defaultValue={activeMember ? activeMember.lastName : undefined} isInvalid={Boolean(errors.entity && errors.entity.last_name)} />
            {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>

        {currentRole && currentRole.name !== 'administrator' && action !== 'update-member' && <>
          <Form.Group controlId="registerAddress" className="required">
            <Form.Control required placeholder="Home Address" name="address" onChange={onChange} defaultValue={activeMember ? activeMember.address : undefined} isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
            {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Row>
            <Form.Group as={Col} md="4" controlId="registerCity" className="required">
              <Form.Control required placeholder="City" name="city" onChange={onChange} defaultValue={activeMember ? activeMember.city : undefined} isInvalid={Boolean(errors.address && errors.address.city)} />
              {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="registerState" className="select required">
              <Form.Control required as="select" name="state" onChange={onChange} defaultValue={activeMember ? activeMember.state : undefined} isInvalid={Boolean(errors.address && errors.address.state)}>
                <option value="">State</option>
                {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
              </Form.Control>
              {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="registerZip" className="required">
              <Form.Control required placeholder="Zip" name="zip" onChange={onChange} defaultValue={activeMember ? activeMember.zip : undefined} isInvalid={Boolean(errors.address && errors.address.postal_code)} />
              {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md="6" controlId="registerSSN" className="required">
              <Form.Control required placeholder="Social Security Number 123-34-5678" name="ssn" onChange={onChange} defaultValue={activeMember ? activeMember.ssn : undefined} isInvalid={errors.identity} />
              {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="registerDateOfBirth" className="required">
              <Form.Control required type="date" placeholder="Date of Birth" name="dateOfBirth" onChange={onChange} defaultValue={activeMember ? activeMember.dateOfBirth : undefined} isInvalid={Boolean(errors.entity && errors.entity.birthdate)} />
              {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
            </Form.Group>
          </Form.Row>
        </>}

        <Form.Row>
          <Form.Group as={Col} md="6" controlId="registerEmail" className="required">
            <Form.Control required type="email" placeholder="Email" name="email" onChange={onChange} defaultValue={activeMember ? activeMember.email : undefined} isInvalid={Boolean(errors.contact && errors.contact.email)} />
            {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="registerPhone" className="required">
            <Form.Control required name="phone" type="tel" onChange={onChange} defaultValue={activeMember ? activeMember.phone : undefined} as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors.contact && errors.contact.phone)} />
            {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>

        {action && action === 'update-member' && <>
          {activeMember && activeMember.address && <Form.Group controlId="registerAddress" className={currentRole && currentRole.name !== 'administrator' ? 'required' : ''}>
            <InputGroup className="mb-2">
              <Form.Control
                required={currentRole && currentRole.name !== 'administrator' ? true : false}
                placeholder="Home Address"
                name="address"
                onChange={onChange}
                defaultValue={activeMember.address}
                isInvalid={Boolean(errors.address || (errors.address && errors.address.street_address_1))} />
              {currentRole && currentRole.name === 'administrator' && <InputGroup.Append className="d-flex justify-content-between align-items-center">
                <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('address', 'Home Address')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'address' ? 'text-primary' : undefined }`}></i></Button>
              </InputGroup.Append>}
              {errors.address && <Form.Control.Feedback type="invalid">{errors.address.street_address_1 ? errors.address.street_address_1 : errors.address}</Form.Control.Feedback>}
            </InputGroup>
          </Form.Group>}

          {activeMember && (activeMember.city || activeMember.state || activeMember.zip) && <Form.Row>
            {activeMember.city && <Form.Group as={Col} md="4" controlId="registerCity" className={currentRole && currentRole.name !== 'administrator' ? 'required' : ''}>
              <InputGroup className="mb-0">
                <Form.Control
                  required={currentRole && currentRole.name !== 'administrator' ? true : false}
                  placeholder="City"
                  name="city"
                  onChange={onChange}
                  defaultValue={activeMember.city}
                  isInvalid={Boolean(errors.address && errors.address.city)} />
                {currentRole && currentRole.name === 'administrator' && <InputGroup.Append className="d-flex justify-content-between align-items-center">
                  <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('city', 'City')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'city' ? 'text-primary' : undefined }`}></i></Button>
                </InputGroup.Append>}
                {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
              </InputGroup>
            </Form.Group>}

            {activeMember.state && <Form.Group as={Col} md="4" controlId="registerState" className={`select ${currentRole && currentRole.name !== 'administrator' ? 'required' : ''}`}>
              <InputGroup className="mb-0">
                <Form.Control
                  required={currentRole && currentRole.name !== 'administrator' ? true : false}
                  as="select"
                  name="state"
                  onChange={onChange}
                  defaultValue={activeMember.state}
                  isInvalid={Boolean(errors.address && errors.address.state)}>
                  <option value="">State</option>
                  {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
                </Form.Control>
                {currentRole && currentRole.name === 'administrator' && <InputGroup.Append className="d-flex justify-content-between align-items-center">
                  <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('state', 'State')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'state' ? 'text-primary' : undefined }`}></i></Button>
                </InputGroup.Append>}
                {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
              </InputGroup>
            </Form.Group>}

            {activeMember.zip && <Form.Group as={Col} md="4" controlId="registerZip" className={currentRole && currentRole.name !== 'administrator' ? 'required' : ''}>
              <InputGroup className="mb-0">
                <Form.Control
                  required={currentRole && currentRole.name !== 'administrator' ? true : false}
                  placeholder="Zip"
                  name="zip"
                  onChange={onChange}
                  defaultValue={activeMember.zip}
                  isInvalid={Boolean(errors.address && errors.address.postal_code)} />
                {currentRole && currentRole.name === 'administrator' && <InputGroup.Append className="d-flex justify-content-between align-items-center">
                  <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('zip', 'Zip')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'zip' ? 'text-primary' : undefined }`}></i></Button>
                </InputGroup.Append>}
                {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
              </InputGroup>
            </Form.Group>}
          </Form.Row>}

          {activeMember && (activeMember.ssn || activeMember.dateOfBirth) && <Form.Row>
            {activeMember.ssn && <Form.Group as={Col} md="6" controlId="registerSSN" className={currentRole && currentRole.name !== 'administrator' ? 'required' : ''}>
              <InputGroup className="mb-0">
                <Form.Control
                  required={currentRole && currentRole.name !== 'administrator' ? true : false}
                  placeholder="Social Security Number 123-34-5678"
                  name="ssn"
                  onChange={onChange}
                  defaultValue={activeMember.ssn}
                  isInvalid={errors.identity ? errors.identity : false} />
                {currentRole && currentRole.name === 'administrator' && <InputGroup.Append className="d-flex justify-content-between align-items-center">
                  <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('ssn', 'Social Security Number')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'ssn' ? 'text-primary' : undefined }`}></i></Button>
                </InputGroup.Append>}
                {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
              </InputGroup>
            </Form.Group>}

            {activeMember.dateOfBirth && <Form.Group as={Col} md="6" controlId="registerDateOfBirth" className={currentRole && currentRole.name !== 'administrator' ? 'required' : ''}>
              <InputGroup className="mb-0">
                <Form.Control
                  required={currentRole && currentRole.name !== 'administrator' ? true : false}
                  type="date"
                  placeholder="Date of Birth"
                  name="dateOfBirth"
                  onChange={onChange}
                  defaultValue={activeMember.dateOfBirth}
                  isInvalid={Boolean(errors.entity && errors.entity.birthdate)} />
                {currentRole && currentRole.name === 'administrator' && <InputGroup.Append className="d-flex justify-content-between align-items-center">
                  <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('dateOfBirth', 'Date of Birth')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'dateOfBirth' ? 'text-primary' : undefined }`}></i></Button>
                </InputGroup.Append>}
                {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
              </InputGroup>
            </Form.Group>}
          </Form.Row>}
        </>}

        {action !== 'update-member' && <div className="d-flex">
          <Button type="submit" className="ml-auto" disabled={!handle}>{currentRole && currentRole.name === 'controlling_officer' ? 'Link as Controlling Officer' : currentRole && currentRole.name === 'beneficial_owner' ? 'Link as Beneficial Owner' : 'Register'}</Button>
          {onMoreInfoNeeded && <Button variant="outline-light" className="ml-3 text-muted text-uppercase" onClick={() => { onMoreInfoNeeded(false) }}>Cancel</Button>}
        </div>}
        {action && action === 'update-member' && showUpdateBtn && <Button type="submit" className="ml-auto d-flex mt-2">Update data</Button>}
      </Form>

      {activeMember && action && action === 'update-member' && <AddDataForm errors={errors} entityuuid={entityuuid} onLoaded={(isLoaded) => setLoaded(isLoaded)} onErrors={(errorsObj) => { setErrors(errorsObj); setValidated(true); } } onUpdateUuid={(uuidObj) => updateUuid(uuidObj)} activeMember={activeMember} action={action} />}
    </>
  )
};

export default MemberKYBForm;
