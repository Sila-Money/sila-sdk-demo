import React from 'react';
import { Modal, CardGroup, Card } from 'react-bootstrap';

const KybModal = ({ show, onHide }) => {
  return (
    <Modal centered
      show={show}
      size="xl"
      aria-labelledby="about-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="about-modal-title">What's the difference between the KYB levels?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center mb-5">Sila offers various KYB levels for our customers to assign to their businesses. A KYB level determines the verification requirements and transaction limits for a business. A level with more thorough verification requirements will allow a business to make larger transactions, whereas a level with less thorough verification requirements will restrict the business to smaller transaction amounts. Most businesses are in standard level.</p>
        <CardGroup>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">KYB Standard</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                With KYB Standard, information about the business is reviewed, including business address, EIN, business category, and more. Depending on the business type, various individuals holding key roles within the business (i.e., Controlling Officer, Beneficial Owner) are required to pass individual KYC. This must be certified by an Administrator of the business. 
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">KYB Lite</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                With this KYB level, EINs and certification are not required (but can still be provided) for the following business types: sole proprietorships, trusts, unincorporated associations. If the business is one of these types, it will go through the KYB-LITE flow. 
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">Receive Only</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Oftentimes customers need to onboard an entity that exists solely to receive payments. In this instance the business does not need to pass KYB, as long as they are receiving payment from a fully KYC’d/KYB’d entity. This level allows you to skip third party verification and only provide the minimal amount of information. This entity is limited to receiving funds only from a full KYC/KYB source, they may not issue or transfer.
              </Card.Text>
            </Card.Body>
          </Card>
        </CardGroup>
      </Modal.Body>
    </Modal>
  );
};

export default KybModal;
