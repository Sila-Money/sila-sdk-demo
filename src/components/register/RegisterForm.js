import React, { useState } from 'react';
import { Form, Col, Button } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from '../common/AlertMessage';
import Pagination from '../common/Pagination';

const RegisterForm = ({ page, onPrevious }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();

  const handleChange = (e) => {
    updateApp({ handle: e.target.value });
  }

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER USER ***');
    updateApp({ response: 'Getting response from the Sila API ...', loaded: false });
    e.preventDefault();
    const wallet = api.generateWallet();
    console.log('Waking up the API service ...');
    const user = {
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      handle: e.target.handle.value,
      address: e.target.address.value,
      addresAlias: 'primary',
      city: e.target.city.value,
      state: e.target.state.value,
      zip: e.target.zip.value,
      ssn: e.target.ssn.value,
      dateOfBirth: e.target.dob.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      cryptoAddress: wallet.address,
    };
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
          alert: { message: `Success! ${app.handle} is now registered.`, style: 'success' }
        };
        appData = {
          users: [...app.users.map(({ active, ...u }) => u), user],
          wallets: [...app.wallets, {
            handle: user.handle,
            blockchain_address: wallet.address,
            private_key: wallet.privateKey,
            nickname: 'Default Wallet'
          }]
        };
        if (Object.keys(errors).length) setErrors({});
        setSuccess(true);
      } else if (res.data.validation_details) {
        setErrors(res.data.validation_details);
        setSuccess(false);
      }
      setAppData({
        ...appData,
        success: res.data.status === 'SUCCESS' && !app.success.includes(page) ? [...app.success, page] : app.success.filter(p => p !== page),
        responses: [...app.responses, {
          endpoint: '/register',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result, loaded: true });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setValidated(true);
  }

  return (
    <div className="d-flex flex-column flex-grow-1 h-100 loaded">

      <h1 className="mb-4">
        Register User
        {/* {app.kycType[0].toUpperCase() + app.kycType.slice(1)} KYC */}
      </h1>

      <p className="mb-4 text-meta text-lg">We need to gather some information to see if you meet KYC guidelines.</p>

      <div className="d-flex mb-4">
        <p className="text-meta mb-0">This page represents <a href="https://docs.silamoney.com/#register" target="_blank" rel="noopener noreferrer">/register</a> functionality.</p>
        <p className="text-right text-sm text-primary ml-auto position-relative" style={{ top: '3rem' }}><span className="text-lg">*</span> {app.kycType === 'default' ? 'All fields required.' : `Required field.`}</p>
      </div>

      <Form noValidate validated={validated} autoComplete="off" onSubmit={register}>
        <Form.Row>
          <Form.Group as={Col} controlId="registerFirstName" className={app.kycType === 'light' ? 'required' : undefined}>
            <Form.Control required placeholder="First Name" name="firstName" />
            {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="registerLastName" className={app.kycType === 'light' ? 'required' : undefined}>
            <Form.Control required placeholder="Last Name" name="lastName" />
            {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>
        <Form.Group controlId="registerHandle" className={app.kycType === 'light' ? 'required' : undefined}>
          <Form.Control required
            placeholder="Handle"
            aria-label="Handle"
            onChange={handleChange}
            name="handle"
            value={app.handle}
          />
          <Form.Text className="text-meta">Handle must be unique.  This was autopopulated from the handle you checked prevously.</Form.Text>
        </Form.Group>
        <Form.Group controlId="registerAddress">
          <Form.Control required={app.kycType === 'default'} placeholder="Street Address" name="address" />
          {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} controlId="registerCity">
            <Form.Control required={app.kycType === 'default'} placeholder="City" name="city" />
            {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="registerState" className="select">
            <Form.Control required={app.kycType === 'default'} as="select" name="state">
              <option value="">State</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="DC">District Of Columbia</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
            </Form.Control>
            {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
          </Form.Group>

          <Form.Group as={Col} controlId="registerZip">
            <Form.Control required={app.kycType === 'default'} placeholder="Zip" name="zip" />
            {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="registerSSN">
            <Form.Control required={app.kycType === 'default'} placeholder="SSN" name="ssn" isInvalid={errors.identity} />
            {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="registerDOB">
            <Form.Control required={app.kycType === 'default'} type="date" placeholder="DOB" name="dob" />
            {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="registerEmail" className={app.kycType === 'light' ? 'required' : undefined}>
            <Form.Control required type="email" placeholder="Email" name="email" />
            {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="registerPhone">
            <Form.Control required={app.kycType === 'default'} type="phone" placeholder="Phone" name="phone" />
            {errors.phone && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>

        <div className="d-flex mt-4">
          {app.alert.message && <AlertMessage message={app.alert.message} style={app.alert.style} />}
          <Button type="submit" className="ml-auto" disabled={!app.handle || app.activeUser.handle === app.handle}>Register user</Button>
        </div>

      </Form>

      <Pagination
        className="mt-auto pt-4"
        previous="/check_handle"
        // previousOnClick={onPrevious}
        next={success ? '/request_kyc' : undefined}
        currentPage={page} />

    </div>
  );
};

export default RegisterForm;
