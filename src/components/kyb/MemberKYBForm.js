import React, { useState } from 'react';
import { Form, Col, Button } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { STATES_ARRAY } from '../../constants';

import { useAppContext } from '../../components/context/AppDataProvider';

import Loader from '../../components/common/Loader';

const MemberKYBForm = ({ handle, activeMember, currentRole, linkBeneficialOwner, onError, onSuccess }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(true);
  activeMember = activeMember ? app.users.find(u => u.handle === activeMember.user_handle) : undefined;

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
    let updatedEntityData = {};
    let updatedResponses = [];
    let successStatus = { entity: true, email: true, phone: true, identity: true, address: true };

    if (linkBeneficialOwner && activeMember) {
      const entityUpdateData = {};
      if (e.target.firstName && e.target.firstName.value !== activeMember.firstName) entityUpdateData.first_name = e.target.firstName.value;
      if (e.target.lastName && e.target.lastName.value !== activeMember.lastName) entityUpdateData.last_name = e.target.lastName.value;
      if (e.target.dateOfBirth && e.target.dateOfBirth.value !== activeMember.dateOfBirth) entityUpdateData.birthdate = e.target.dateOfBirth ? e.target.dateOfBirth.value : '';
      if (Object.keys(entityUpdateData).length) {
        try {
          const entityUpdateRes = await api.updateEntity(activeMember.handle, activeMember.private_key, entityUpdateData);
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
      
      validationErrors = { ...validationErrors, contact: {} }
      if (e.target.email && e.target.email.value !== activeMember.email) {
        try {
          const emailRes = await api.addEmail(activeMember.handle, activeMember.private_key, e.target.email.value);
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/email', result: JSON.stringify(emailRes, null, '\t') } ];

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

      if (e.target.phone && e.target.phone.value !== activeMember.phone) {
        try {
          const phoneRes = await api.addPhone(activeMember.handle, activeMember.private_key, e.target.phone.value);
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/phone', result: JSON.stringify(phoneRes, null, '\t') } ];

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
      
      if (e.target.ssn && e.target.ssn.value !== activeMember.ssn) {
        try {
          const ssnRes = await api.addIdentity(activeMember.handle, activeMember.private_key, {
            alias: 'SSN',
            value: e.target.ssn.value
          });
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/identity', result: JSON.stringify(ssnRes, null, '\t') } ];

          if (ssnRes.data.success) {
            updatedEntityData = { ...updatedEntityData, ssn: e.target.ssn.value }
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
      if (e.target.address && e.target.address.value !== activeMember.address) addressUpdateData.street_address_1 = e.target.address ? e.target.address.value : '';
      if (e.target.city && e.target.city.value !== activeMember.city) addressUpdateData.city = e.target.city ? e.target.city.value : '';
      if (e.target.state && e.target.state.value !== activeMember.state) addressUpdateData.state = e.target.state ? e.target.state.value : '';
      if (e.target.zip && e.target.zip.value !== activeMember.zip) addressUpdateData.postal_code = e.target.zip ? e.target.zip.value : '';
      if (Object.keys(addressUpdateData).length) {
        try {
          const addressRes = await api.addAddress(activeMember.handle, activeMember.private_key, addressUpdateData);
          updatedResponses = [ ...updatedResponses, { endpoint: '/add/address', result: JSON.stringify(addressRes, null, '\t') } ];

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

      try {
        console.log('  ... update completed!');
        let result = {};
        let appData = {};
        let updateSuccess = false;

        if (successStatus.entity && successStatus.email && successStatus.phone && successStatus.identity && successStatus.address) {
          updateSuccess = true;
        }
        
        if (updateSuccess) {
          refreshApp();
          const appUser = app.users.find(u => u.handle === activeMember.handle);
          updatedEntityData = { ...appUser, ...updatedEntityData, kycLevel: false }
          result = {
            activeUser: { ...appUser, ...updatedEntityData },
            alert: { message: 'Registration data was successfully added.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === activeMember.handle ? { ...u, ...updatedEntityData } : u),
          };
          if (Object.keys(errors).length) setErrors({});
        } else if ( Object.keys(validationErrors).length ) {
          setErrors(validationErrors);
          setValidated(true);
          if (onError) onError(validationErrors);
        }
        setAppData({
          ...appData,
          responses: [...app.responses, ...updatedResponses]
        }, () => {
          updateApp({ ...result });
          if (updateSuccess) onSuccess(updatedEntityData);
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
        let result = {};
        let appData = {};
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
          if (res.data.success && onSuccess) onSuccess(entity);
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
    }
    setLoaded(true);
  }
  
  return (
    <Form className="mt-4" noValidate validated={validated} autoComplete="off" onSubmit={register}>
      {!loaded && <Loader overlay />}

      <p className="text-muted">Please fill out the below fields for this business member.</p>

      <p className="text-right text-lg text-warning">All fields are required for this Business Member.</p>

      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerFirstName" className="required">
          <Form.Control required placeholder="First Name" name="firstName" defaultValue={activeMember ? activeMember.firstName : undefined} isInvalid={Boolean(errors.entity && errors.entity.first_name)} />
          {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerLastName" className="required">
          <Form.Control required placeholder="Last Name" name="lastName" defaultValue={activeMember ? activeMember.lastName : undefined} isInvalid={Boolean(errors.entity && errors.entity.last_name)} />
          {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>

      {(!currentRole || (currentRole && currentRole.name !== 'administrator')) && <>
        <Form.Group controlId="registerAddress" className="required">
          <Form.Control required placeholder="Home Address" name="address" defaultValue={activeMember ? activeMember.address : undefined} isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
          {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} md="4" controlId="registerCity" className="required">
            <Form.Control required placeholder="City" name="city" defaultValue={activeMember ? activeMember.city : undefined} isInvalid={Boolean(errors.address && errors.address.city)} />
            {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="registerState" className="select required">
            <Form.Control required as="select" name="state" defaultValue={activeMember ? activeMember.state : undefined} isInvalid={Boolean(errors.address && errors.address.state)}>
              <option value="">State</option>
              {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
            </Form.Control>
            {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="registerZip" className="required">
            <Form.Control required placeholder="Zip" name="zip" defaultValue={activeMember ? activeMember.zip : undefined} isInvalid={Boolean(errors.address && errors.address.postal_code)} />
            {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} md="6" controlId="registerSSN" className="required">
            <Form.Control required placeholder="Social Security Number 123-34-5678" name="ssn" defaultValue={activeMember ? activeMember.ssn : undefined} isInvalid={errors.identity} />
            {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="registerDateOfBirth" className="required">
            <Form.Control required type="date" placeholder="Date of Birth" name="dateOfBirth" defaultValue={activeMember ? activeMember.dateOfBirth : undefined} isInvalid={Boolean(errors.entity && errors.entity.birthdate)} />
            {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>
      </>}

      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerEmail" className="required">
          <Form.Control required type="email" placeholder="Email" name="email" defaultValue={activeMember ? activeMember.email : undefined} isInvalid={Boolean(errors.contact && errors.contact.email)} />
          {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerPhone" className="required">
          <Form.Control required name="phone" type="tel" defaultValue={activeMember ? activeMember.phone : undefined} as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors.contact && errors.contact.phone)} />
          {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>

      <div className="d-flex mt-4">
        <Button type="submit" className="ml-auto" disabled={!handle}>{linkBeneficialOwner ? 'Link as Beneficial Owner' : 'Register'}</Button>
      </div>

    </Form>
  )
};

export default MemberKYBForm;
