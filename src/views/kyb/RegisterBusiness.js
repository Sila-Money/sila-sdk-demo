import React, { useState } from 'react';
import { Container, Form, Col, Button, Alert } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import AlertMessage from '../../components/common/AlertMessage';
import Pagination from '../../components/common/Pagination';

import { STATES_ARRAY } from '../../constants';

const RegisterBusiness = ({ page, previous, next, isActive }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER BUSINESS ***');
    e.preventDefault();
    console.log(app.settings.kybBusinessType);
    const wallet = api.generateWallet();
    const user = new api.User();
    user.handle = app.settings.kybHandle;
    user.entity_name = e.target.entity_name.value;
    user.address = e.target.address.value;
    user.city = e.target.city.value;
    user.state = e.target.state.value;
    user.zip = e.target.zip.value;
    user.phone = e.target.phone.value;
    user.email = e.target.email.value;
    user.ein = e.target.ein.value;
    user.cryptoAddress = wallet.address
    user.business_type = app.settings.kybBusinessType;
    user.naics_code = app.settings.kybNaicsCode;
    if (e.target.business_website.value) user.business_website = e.target.business_website.value;
    if (e.target.doing_business_as.value) user.doing_business_as = e.target.doing_business_as.value;
    try {
      const res = await api.register(user);
      let result = {};
      let appData = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        refreshApp();
        user.private_key = wallet.privateKey;
        user.active = true;
        user.business = true;
        result = {
          activeUser: user,
          alert: { message: `Success! ${user.handle} is now registered.`, type: 'success' }
        };
        appData = {
          settings: { ...app.settings, kybBusinessType: false, kybNaicsCode: false, kybNaicsCategory: false },
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
      } else if (res.data.validation_details) {
        setErrors(res.data.validation_details);
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
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Company Information</h1>

      <p className="mb-4 text-meta text-lg">We need to gather some information to see if this business meets KYB guidelines. </p>

      <Alert variant="info" className="mb-4">A wallet is automatically generated for you using the generateWallet() function upon registration.</Alert>

      <div className="d-flex mb-5">
        <p className="text-meta mb-0">This page represents <a href="https://docs.silamoney.com/docs/register" target="_blank" rel="noopener noreferrer">/register</a> functionality.</p>
        <p className="text-right text-sm text-primary ml-auto position-relative" style={{ top: '2rem' }}><span className="text-lg">*</span> Required field.</p>
      </div>

      <Form noValidate validated={validated} autoComplete="off" onSubmit={register}>
        <Form.Row>
          <Form.Group as={Col} controlId="businessName" className="required">
            <Form.Control required placeholder="Legal Company Name" name="entity_name" />
            {errors.entity && errors.entity.entity_name && <Form.Control.Feedback type="invalid">{errors.entity.entity_name}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="businessDBA">
            <Form.Control placeholder="DBA (If Applicable)" name="doing_business_as" />
            {errors.entity && errors.entity.doing_business_as && <Form.Control.Feedback type="invalid">{errors.entity.doing_business_as}</Form.Control.Feedback>}
            <Form.Text className="text-meta">Optional business name if it differs from the legally registered name.</Form.Text>
          </Form.Group>
        </Form.Row>
        <Form.Group controlId="businessAddress" className="required">
          <Form.Control required placeholder="Business Address" name="address" />
          {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} controlId="businessCity" className="required">
            <Form.Control required  placeholder="City" name="city" />
            {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="businessState" className="select required">
            <Form.Control required as="select" name="state">
              <option value="">State</option>
              {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
            </Form.Control>
            {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="businessZip" className="required">
            <Form.Control required placeholder="Zip" name="zip" />
            {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="businessPhone" className="required">
            <Form.Control required type="phone" placeholder="Business Phone" name="phone" />
            {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="businessEIN" className="required">
            <Form.Control required placeholder="EIN" name="ein" isInvalid={errors.identity} />
            {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="businessEmail" className="required">
            <Form.Control required type="email" placeholder="Business Email" name="email" />
            {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group as={Col} controlId="businessWebsite">
            <Form.Control type="url" placeholder="Business Website" name="business_website" />
            {errors.entity && errors.entity.business_website && <Form.Control.Feedback type="invalid">{errors.entity.business_website}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>

        <div className="d-flex mt-5">
          {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
          <Button type="submit" className="ml-auto" disabled={!app.settings.kybHandle || (app.activeUser && app.activeUser.handle === app.settings.kybHandle)}>Register Business</Button>
        </div>

      </Form>

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />
    </Container>
  );
};

export default RegisterBusiness;

