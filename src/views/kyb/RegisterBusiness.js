import React, { useState } from 'react';
import { Container, Form, Col, Button, Alert, Modal, Card, CardGroup } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { useAppContext } from '../../components/context/AppDataProvider';

import AlertMessage from '../../components/common/AlertMessage';
import Pagination from '../../components/common/Pagination';

import { STATES_ARRAY } from '../../constants';

const RegisterBusinessModal = ({ show, onHide }) => {
  return (
    <Modal centered
      show={show}
      size="xl"
      aria-labelledby="about-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="about-modal-title">Register Individuals vs Businesses</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center mb-5">Create a new business or individual user and attach information that will be used to verify their identity. This does not start verification of the KYC data; it only adds the data to be verified.</p>
        <CardGroup>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">Individuals</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">For individuals, KYC data includes:</p>
              <ul>
                <li className="mb-2">Full legal name</li>
                <li className="mb-2">U.S. Social Security Number (SSN)</li>
                <li className="mb-2">Date of birth</li>
                <li className="mb-2">A valid street address</li>
                <li className="mb-2">An email address</li>
                <li className="mb-2">A phone number</li>
              </ul>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">Businesses</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">For businesses, KYB data includes:</p>
              <ul className="mb-4">
                <li className="mb-2">Legal business name</li>
                <li className="mb-2">Doing-business-as (business alias)</li>
                <li className="mb-2">Business website</li>
                <li className="mb-2">Business EIN</li>
                <li className="mb-2">Date of incorporation</li>
                <li className="mb-2">Business address</li>
                <li className="mb-2">Business email address</li>
                <li className="mb-2">Business phone number</li>
              </ul>
              <p className="mb-3">Information about the business is reviewed, including business address, EIN, business category, incorporation state, and more.</p>
              <p className="mb-3">KYB standards require that controlling officers and beneficial owners of the business establish a record of their link to their business. Individual end users who are subject to this requirement are called “Members.”</p>
              <p className="mb-4">KYB standards additionally require that each Member’s role in the business be defined. A given Member can only be associated with one of the below roles at a time via the /link_business_role endpoint:</p>
              <ul className="mt-4">
                <li className="mb-2">Beneficial Owner</li>
                <li className="mb-2">Controlling Officer</li>
                <li className="mb-2">Administrator</li>
              </ul>
              <ul className="mb-4">
                <li className="mb-2">entity.type is “business” (to register an individual, this can be omitted or sent as “individual”).</li>
                <li className="mb-2">entity.entity_name is the legal name of the business and must not be blank.</li>
                <li className="mb-2">entity.business_type is the business type name and entity.business_type_uuid is the business type UUID (see /get_business_types). One of these fields must be populated with valid data, but not both.</li>
                <li className="mb-2">entity.naics_code is the integer code that describes the business’s category and is a required field.</li>
              </ul>
              <p className="mb-4">Other things to note:</p>
              <ul className="mb-4">
                <li className="mb-2">identity.identity_alias must be “EIN” for businesses and the identity.identity_value a US employer identification number (EIN). However, for some business types (sole proprietorships, trusts, and unincorporated associations), the identity object will not be required to pass KYB verification and can actually be omitted in this endpoint altogether.</li>
                <li className="mb-2">entity.doing_business_as is an optional field that can contain a business name if it differs from its legally registered name.</li>
                <li className="mb-2">entity.business_website is an optional field containing a business’s website. If KYB fails, this can be used to help complete manual review.</li>
              </ul>
            </Card.Body>
          </Card>
        </CardGroup>
      </Modal.Body>

    </Modal>
  );
};

const RegisterBusiness = ({ page, previous, next, isActive }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER BUSINESS ***');
    e.preventDefault();
    const wallet = api.generateWallet();
    const entity = {};
    entity.type = 'business';
    entity.identity_alias = 'EIN';
    entity.handle = app.settings.kybHandle;
    entity.entity_name = e.target.entity_name.value;
    entity.address = e.target.address.value;
    entity.addresAlias = 'primary';
    entity.city = e.target.city.value;
    entity.state = e.target.state.value;
    entity.zip = e.target.zip.value;
    entity.phone = e.target.phone.value;
    entity.email = e.target.email.value;
    entity.ein = e.target.ein.value;
    entity.cryptoAddress = wallet.address
    entity.business_type = app.settings.kybBusinessType;
    entity.naics_code = app.settings.kybNaicsCode;
    entity.flow = app.settings.flow;
    if (e.target.business_website.value) entity.business_website = e.target.business_website.value;
    if (e.target.doing_business_as.value) entity.doing_business_as = e.target.doing_business_as.value;
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
        setErrors(res.data.validation_details);
      }
      setAppData({
        ...appData,
        success: res.data.status === 'SUCCESS' && !isActive ? [...app.success, { handle: entity.handle, page }] : app.success,
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

      <h1 className="mb-4">Business Information</h1>

      <p className="mb-4 text-muted text-lg">We need to gather some information to see if this business meets KYB guidelines.</p>

      <p className="mb-4 text-muted text-lg">To register a new end-user as a business instead of an individual, the following must be sent in the request:</p>

      <div className="d-lg-flex justify-content-lg-between mb-2">
        <p className="text-muted mb-0">This page represents <a href="https://docs.silamoney.com/docs/register" target="_blank" rel="noopener noreferrer">/register</a> functionality.</p>
        <p className="text-right"><Button variant="link" className="text-muted font-italic p-0 text-decoration-none" onClick={() => setShow(true)}><span className="lnk">What’s the difference between registering an individual and a business?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>
      </div>

      <p className="text-right text-sm text-primary ml-auto position-relative"><span className="text-lg">*</span> Required field.</p>

      <Form noValidate validated={validated} autoComplete="off" onSubmit={register}>
        <Form.Row>
          <Form.Group as={Col} md="6" controlId="businessName" className="required">
            <Form.Control required placeholder="Legal Company Name" name="entity_name" isInvalid={Boolean(errors.entity && errors.entity.entity_name)} />
            <Form.Control.Feedback type="invalid">{errors.entity && errors.entity.entity_name ? errors.entity.entity_name : 'This field may not be blank.'}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="businessDBA">
            <Form.Control placeholder="DBA (If Applicable)" name="doing_business_as" isInvalid={Boolean(errors.entity && errors.entity.doing_business_as)} />
            {errors.entity && errors.entity.doing_business_as && <Form.Control.Feedback type="invalid">{errors.entity.doing_business_as}</Form.Control.Feedback>}
            <Form.Text className="text-muted">Optional business name if it differs from the legally registered name.</Form.Text>
          </Form.Group>
        </Form.Row>
        <Form.Group controlId="businessAddress" className="required">
          <Form.Control required placeholder="Business Address" name="address" isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
          <Form.Control.Feedback type="invalid">{errors.address && errors.address.street_address_1 ? errors.address.street_address_1 : 'This field may not be blank.'}</Form.Control.Feedback>
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} md="4" controlId="businessCity" className="required">
            <Form.Control required  placeholder="City" name="city" isInvalid={Boolean(errors.address && errors.address.city)} />
            <Form.Control.Feedback type="invalid">{errors.address && errors.address.city ? errors.address.city : 'This field may not be blank.'}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="businessState" className="select required">
            <Form.Control required as="select" name="state" isInvalid={Boolean(errors.address && errors.address.state)}>
              <option value="">State</option>
              {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
            </Form.Control>
            <Form.Control.Feedback type="invalid">{errors.address && errors.address.state ? errors.address.state : 'This field may not be blank.'}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="businessZip" className="required">
            <Form.Control required placeholder="Zip" name="zip" isInvalid={Boolean(errors.address && errors.address.postal_code)} />
            <Form.Control.Feedback type="invalid">{errors.address && errors.address.postal_code ? errors.address.postal_code : 'This field may not be blank.'}</Form.Control.Feedback>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} md="6" controlId="businessPhone" className="required">
            <Form.Control required name="phone" type="tel" as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors.contact && errors.contact.phone)} />
            <Form.Control.Feedback type="invalid">{errors.contact && errors.contact.phone ? errors.contact.phone : 'This field may not be blank.'}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="businessEIN" className="required">
            <Form.Control required placeholder="Employer ID Number (EIN)" name="ein" isInvalid={Boolean(errors.identity)} />
            <Form.Control.Feedback type="invalid">{errors.identity ? (errors.identity.identity_value || errors.identity) : 'This field may not be blank.'}</Form.Control.Feedback>
            <Form.Text className="text-muted">EIN format: 11-2223333</Form.Text>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} md="6" controlId="businessEmail" className="required">
            <Form.Control required type="email" placeholder="Business Email" name="email" isInvalid={Boolean(errors.contact && errors.contact.email)} />
            <Form.Control.Feedback type="invalid">{errors.contact && errors.contact.email ? errors.contact.email : 'This field may not be blank.'}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="businessWebsite">
            <Form.Control type="url" placeholder="Business Website" name="business_website" isInvalid={Boolean(errors.entity && errors.entity.business_website)} />
            {errors.entity && errors.entity.business_website && <Form.Control.Feedback type="invalid">{errors.entity.business_website}</Form.Control.Feedback>}
          </Form.Group>
        </Form.Row>

        <Alert variant="info" className="mt-4 mb-5">A wallet is automatically generated for you using the generateWallet() function upon registration.</Alert>

        <div className="d-flex">
          {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
          <Button type="submit" className="ml-auto" disabled={!app.settings.kybHandle}>Register Business</Button>
        </div>

      </Form>

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />

      <RegisterBusinessModal show={show} onHide={() => setShow(false)} />

    </Container>
  );
};

export default RegisterBusiness;

