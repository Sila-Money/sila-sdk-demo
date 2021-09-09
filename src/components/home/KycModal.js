import React from 'react';
import { Modal, CardGroup, Card } from 'react-bootstrap';

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
        <p className="text-center mb-5">Sila offers various KYC levels for our customers to assign to their end-users. A KYC level determines the verification requirements and transaction limits for an end-user. A level with more thorough verification requirements will allow an end-user to make larger transactions, whereas a level with less thorough verification requirements will restrict the end-user's to smaller transaction amounts. Levels other than our default level are currently granted on a case-by case basis.</p>
        <CardGroup>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">Default KYC</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                This level contains full KYC, meaning information about the indivudal is reviewed, including full name, home address, SSN, phone number, birthdate, and email. With this level of KYC, an end-user can send up to $499.99 a day, and there are no limits on receiving.
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">KYC Lite</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                This level allows you to skip third party verification and only provide the minimal amount of information (name, email, phone number, date of birth). These entities have limited transaction capabilities in regards to amounts, funds held, and funds flow. The transaction limit is $299.99 per end-user per week. This level is great for P2P and PFM apps who want to streamline onboarding.
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">Receive Only</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Oftentimes customers need to onboard an entity that exists solely to receive payments. In this instance the individual does not need to pass KYC, as long as they are receiving payment from a fully KYC’d/KYB’d entity. This level allows you to skip third party verification and only provide the minimal amount of information. This entity is limited to receiving funds only from a full KYC/KYB source, they may not issue or transfer.
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">Instant ACH</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                This level allows for speedy ACH transactions to trusted end-users. It contains full KYC and requires an end-user to have a Plaid-linked bank account and undergo device registration and SMS opt-in and confirmation. Each transaction will also go through a risk assessment to estimate the risk of an ACH return. With this level, transactions have limits of $299.99.
              </Card.Text>
            </Card.Body>
          </Card>
        </CardGroup>
      </Modal.Body>
    </Modal>
  );
};

export default KycModal;