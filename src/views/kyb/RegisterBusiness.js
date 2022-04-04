import React, { useState } from 'react';
import { Container, Alert, Button, Modal, Card, CardGroup } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import RegisterBusinessForm from '../../components/kyb/RegisterBusinessForm';
import KybModal from '../../components/home/KybModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';

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
        <p className="text-center mb-4">Create a new business or individual user and attach information that will be used to verify their identity. This does not start verification of the KYC data; it only adds the data to be verified.</p>
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
  const [showKybModal, setShowKybModal] = useState(false);
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState({ show: false, message: '', onSuccess: () => { }, onHide: () => { } });
  const { app, setAppData, updateApp } = useAppContext();

  const registerUser = (user) => {
    setAppData({
      success: !isActive ? [...app.success, { handle: user.handle, page }] : app.success,
      users: [...app.users, user]
    }, () => {
      updateApp({ activeUser: user });
    });
  };

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">{app.activeUser ? 'Registered Business' : 'Business Information'}</h1>

      <p className="mb-1 text-muted text-lg">{app.activeUser ? "We've gathered some information to see if you meet KYB guidelines. If you'd like to add, update or delete information, you can do so here." : "We need to gather some information to see if this business meets KYB guidelines."}</p>

      <p className="mb-1 text-muted text-lg">To register a new end-user as a business instead of an individual, the following must be sent in the request:</p>

      {app.activeUser && <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/addregistration-data" target="_blank" rel="noopener noreferrer">/add</a>, <a href="https://docs.silamoney.com/docs/updateregistration-data" target="_blank" rel="noopener noreferrer">/update,</a> and <a href="https://docs.silamoney.com/docs/deleteregistration-data" target="_blank" rel="noopener noreferrer">/delete</a> functionality.</p>}

      {!app.activeUser && <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/register" target="_blank" rel="noopener noreferrer">/register</a> functionality.</p>}

      {!app.activeUser && <p className="text-right mb-2"><Button variant="link" className="text-muted font-italic p-0 text-decoration-none" onClick={() => setShow(true)}><span className="lnk">What's the difference between registering an individual and a business?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>}

      <RegisterBusinessForm handle={app.settings.kybHandle} onSuccess={registerUser} onShowKybModal={(showKybModal) => setShowKybModal(showKybModal)} onConfirm={setConfirm}>

        {app.settings.preferredKybLevel && !app.activeUser && <Alert variant="info" className="mt-1 mb-3">A wallet is automatically generated for you using the generateWallet() function upon registration.</Alert>}

        {app.settings.preferredKybLevel && !app.activeUser && <Button type="submit" className="ml-auto float-right" disabled={!app.settings.kybHandle || (app.activeUser && app.activeUser.handle === app.settings.kybHandle)}>Register Business</Button>}

      </RegisterBusinessForm>

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />

      <KybModal show={showKybModal} onHide={() => setShowKybModal(false)} />
      <RegisterBusinessModal show={show} onHide={() => setShow(false)} />
      <ConfirmModal show={confirm.show} message={confirm.message} onHide={confirm.onHide} buttonLabel="Delete" onSuccess={confirm.onSuccess} />

    </Container>
  );
};

export default RegisterBusiness;

