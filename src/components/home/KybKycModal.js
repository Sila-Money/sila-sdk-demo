import React from 'react';
import { Modal, CardGroup, Card } from 'react-bootstrap';

const KybVsKycModal = ({ show, onHide }) => {
  return (
    <Modal centered
      show={show}
      size="xl"
      aria-labelledby="about-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="about-modal-title">KYC vs KYB</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center mb-4">Know Your Customer (KYC) is a federally-mandated process to verify the identity of users of financial products and services (ie, your end users) and assess their perceived risk of committing fraud. Sila supports KYC on individual end users and KYB (Know Your Business) on business end users. To that end, Sila is required to perform KYC/KYB validation on all (individual and business) end users of any app that uses the Sila API. Registered users who have not met KYC/KYB requirements won’t be able to make transactions on the Sila platform.</p>
        <CardGroup>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">KYC</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <ul>
                  <li>Information about the individual is reviewed, including full name, home address, SSN, phone number, birthdate, and email.</li>
                  <li>We and our banking partner need this information to perform legally-required checks against federal fraud and terrorism databases. Any financial application that connects with US bank accounts or uses the US ACH networks will be subject to these compliance requirements.</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">KYB</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <ul>
                  <li className="mb-3">Information about the business is reviewed, including business address, EIN, business category, incorporation state, and more.</li>
                  <li className="mb-3">KYB standards require that controlling officers and beneficial owners of the business establish a record of their link to their business. Individual end users who are subject to this requirement are called “Members.”</li>
                  <li>
                    KYB standards additionally require that each Member’s role in the business be defined. A given Member can only be associated with one of the below roles at a time via the /link_business_role endpoint:
                    <ul className="mt-2">
                      <li className="mb-2">Beneficial Owner</li>
                      <li className="mb-2">Controlling Officer</li>
                      <li className="mb-2">Administrator</li>
                    </ul>
                  </li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </CardGroup>
      </Modal.Body>
    </Modal>
  );
};

export default KybVsKycModal;