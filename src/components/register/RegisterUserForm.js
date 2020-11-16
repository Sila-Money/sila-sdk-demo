import React, { useState } from 'react';
import { Form, Col } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { useAppContext } from '../../components/context/AppDataProvider';

import { STATES_ARRAY } from '../../constants';

const RegisterUserForm = ({ className, handle, page, isActive, children, onError, onSuccess, description }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER USER ***');
    e.preventDefault();
    console.log('Waking up the API service ...');
    const wallet = api.generateWallet();
    const user = new api.User();
    user.handle = handle;
    user.firstName = e.target.firstName.value;
    user.lastName = e.target.lastName.value;
    user.address = e.target.address.value;
    user.city = e.target.city.value;
    user.state = e.target.state.value;
    user.zip = e.target.zip.value;
    user.phone = e.target.phone.value;
    user.email = e.target.email.value;
    user.dateOfBirth = e.target.dateOfBirth.value;
    user.ssn = e.target.ssn.value;
    user.cryptoAddress = wallet.address;
    try {
      const res = await api.register(user);
      let result = {};
      let appData = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        refreshApp();
        user.private_key = wallet.privateKey;
        user.active = true;
        result = {
          activeUser: user,
          alert: { message: `Success! ${app.settings.kycHandle} is now registered.`, type: 'success' }
        };
        appData = {
          settings: { ...app.settings, kycHandle: false },
          users: [...app.users.map(({ active, ...u }) => u), user],
          wallets: [...app.wallets, {
            handle: user.handle,
            blockchain_address: wallet.address,
            private_key: wallet.privateKey,
            nickname: 'My Wallet',
            default: true
          }]
        };
        if (Object.keys(errors).length) setErrors({});
        if (onSuccess) onSuccess(user);
      } else if (res.data.validation_details) {
        setErrors(res.data.validation_details);
        if (onError) onError(res.data.validation_details);
      }
      setAppData({
        ...appData,
        success: res.data.status === 'SUCCESS' && !isActive ? [...app.success, { handle: user.handle, page }] : app.success,
        responses: [{
          endpoint: '/register',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setValidated(true);
  }

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={register}>

      <p className="text-muted mb-4">{description || 'Please fill out the fields below.'}</p>

      <p className="text-right text-sm text-primary ml-auto"><span className="text-lg">*</span> Required field</p>

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
        <Form.Control required placeholder="Street Address" name="address" />
        {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Row>
        <Form.Group as={Col} md="4" controlId="registerCity" className="required">
          <Form.Control required placeholder="City" name="city" />
          {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="registerState" className="select required">
          <Form.Control required as="select" name="state">
            <option value="">State</option>
            {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
          </Form.Control>
          {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="registerZip" className="required">
          <Form.Control required placeholder="Zip" name="zip" />
          {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerSSN" className="required">
          <Form.Control required placeholder="Social Security Number 111223333" name="ssn" isInvalid={errors.identity} />
          {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerDateOfBirth" className="required">
          <Form.Control required type="date" placeholder="Date of Birth" name="dateOfBirth" />
          {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerEmail" className="required">
          <Form.Control required type="email" placeholder="Email" name="email" />
          {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerPhone" className="required">
          <Form.Control required name="phone" type="tel" as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" />
          {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      {children}
    </Form>
  )
};

export default RegisterUserForm;
