import React, { useState } from 'react';
import { Form, Col } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { useAppContext } from '../../components/context/AppDataProvider';

import { STATES_ARRAY } from '../../constants';

const RegisterUserForm = ({ className, handle, children, onError, onSuccess, description }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER USER ***');
    e.preventDefault();
    console.log('Waking up the API service ...');
    const wallet = api.generateWallet();
    const entity = new api.User();
    entity.handle = handle;
    entity.firstName = e.target.firstName.value;
    entity.lastName = e.target.lastName.value;
    entity.address = e.target.address.value;
    entity.city = e.target.city.value;
    entity.state = e.target.state.value;
    entity.zip = e.target.zip.value;
    entity.phone = e.target.phone.value;
    entity.email = e.target.email.value;
    entity.dateOfBirth = e.target.dateOfBirth.value;
    entity.ssn = e.target.ssn.value;
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

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={register}>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <p className="text-muted mr-5">{description || 'Please fill out the fields below.'}</p>
        <p className="text-right text-sm text-primary"><span className="text-lg">*</span> Required field</p>
      </div>

      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerFirstName" className="required">
          <Form.Control required placeholder="First Name" name="firstName" />
          {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerLastName" className="required">
          <Form.Control required placeholder="Last Name" name="lastName" />
          {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Group controlId="registerAddress" className="required">
        <Form.Control required placeholder="Street Address" name="address" isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
        {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Row>
        <Form.Group as={Col} md="4" controlId="registerCity" className="required">
          <Form.Control required placeholder="City" name="city" isInvalid={Boolean(errors.address && errors.address.city)} />
          {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="registerState" className="select required">
          <Form.Control required as="select" name="state" isInvalid={Boolean(errors.address && errors.address.state)}>
            <option value="">State</option>
            {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
          </Form.Control>
          {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="registerZip" className="required">
          <Form.Control required placeholder="Zip" name="zip" isInvalid={Boolean(errors.address && errors.address.postal_code)} />
          {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerSSN" className="required">
          <Form.Control required placeholder="Social Security Number 111-22-3333" name="ssn" isInvalid={errors.identity} />
          {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
          <Form.Text className="text-muted">SSN format: 111-22-3333</Form.Text>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerDateOfBirth" className="required">
          <Form.Control required type="date" placeholder="Date of Birth" name="dateOfBirth" isInvalid={Boolean(errors.entity && errors.entity.birthdate)} />
          {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerEmail" className="required">
          <Form.Control required type="email" placeholder="Email" name="email" isInvalid={Boolean(errors.contact && errors.contact.email)} />
          {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerPhone" className="required">
          <Form.Control required name="phone" type="tel" as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors.contact && errors.contact.phone)} />
          {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      {children}
    </Form>
  )
};

export default RegisterUserForm;
