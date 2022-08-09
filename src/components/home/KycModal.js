import React from 'react';
import { Modal, CardGroup, Card, Button } from 'react-bootstrap';

const KycModal = ({ show, onHide }) => {
  return (
    <Modal centered
      show={show}
      size="xl"
      aria-labelledby="about-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="about-modal-title">What's the difference between the KYC levels?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sila offers various KYC levels for our customers to assign to their end-users. A KYC level determines the verification requirements and transaction limits for an end-user. A level with more thorough verification requirements will allow an end-user to make larger transactions, whereas a level with less thorough verification requirements will restrict the end-user's to smaller transaction amounts. <span className="text-primary font-weight-bold">Levels other than our DOC KYC level are currently granted on a case-by case basis.</span></p>
        <ul className="mb-4">
          <li>
            <p><span className="font-weight-bold">If it's your first time using the demo,</span> we recommend you start with DOC KYC to gain a proper understanding of the process. <Button variant="link" className="p-0 new-registration shadow-none btn btn-link ml-auto" href="https://docs.silamoney.com/docs/kyckyb-levels#kyc" target="_blank" rel="noopener noreferrer"><span className="lnk text-lg">Read more about the KYC levels on our docs!</span></Button></p>
          </li>
        </ul>
        <CardGroup className="mb-4 border-0 rounded overflow-hidden">
          <Card className="border">
            <Card.Header className="text-center bg-info">
              <Card.Title className="text-primary mb-0">DOC_KYC</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <p>This level contains full KYC, meaning information about the individual is reviewed, including full name, home address, SSN, phone number, birthdate, and email.</p>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="border">
            <Card.Header className="text-center bg-info">
              <Card.Title className="text-primary mb-0">KYC Lite</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <p>This level allows you to skip third party verification and only provide the minimal amount of information (name, email, phone number, date of birth). These entities have limited transaction capabilities in regards to amounts, funds held, and funds flow.  This level is great for P2P and PFM apps who want to streamline onboarding.</p>
                <ul className="pl-3">
                  <li className="text-warning">KYC Lite is not authorized for crypto or international use cases, and it requires approval from Sila's compliance team</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="border">
            <Card.Header className="text-center bg-info">
              <Card.Title className="text-primary mb-0">Instant ACH</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <p>This level allows for speedy ACH transactions to trusted end-users. It contains full KYC and requires an end-user to have a Plaid-linked bank account and undergo device registration and SMS opt-in and confirmation. Each transaction will also go through a risk assessment to estimate the risk of an ACH return.</p>
                <ul className="pl-3">
                  <li className="text-warning">Instant ACH is in closed beta and requires approval</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="border">
            <Card.Header className="text-center bg-info">
              <Card.Title className="text-primary mb-0">Receive Only</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <p>Oftentimes customers need to onboard an entity that exists solely to receive payments. In this instance the individual does not need to pass KYC, as long as they are receiving payment from a fully KYC’d/KYB’d entity. This level allows you to skip third party verification and only provide the minimal amount of information. This entity is limited to receiving funds only from a full KYC/KYB source, they may not issue or transfer.</p>
                <ul className="pl-3">
                  <li className="text-warning">KYC Receive Only requires special approval</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </CardGroup>
        <p className="text-center mb-0"><Button href="https://docs.silamoney.com/docs/limits-overview" target="_blank" rel="noopener noreferrer" variant="outline-light">See API Limits in our docs</Button></p>
      </Modal.Body>
    </Modal>
  );
};

export default KycModal;