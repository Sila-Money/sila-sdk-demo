import React from 'react';
import { Modal, CardGroup, Card, Button } from 'react-bootstrap';

const KybModal = ({ show, onHide }) => {
  return (
    <Modal centered
      show={show}
      size="xl"
      aria-labelledby="about-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title as="h3" id="about-modal-title">What's the difference between the KYB levels?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sila offers various KYB levels for our customers to assign to their businesses. <span className="text-primary font-weight-bold">Most businesses are in standard level. </span>Unlike with KYC, with KYB the KYC_LEVEL does not need to be specified explicitly by your API request. Instead, KYB levels are applied to the business entity based on the business type.</p>
        <ul className="mb-4">
          <li>
            <p><span className="font-weight-bold">If it's your first time using the demo,</span> we recommend you start with KYB Standard to gain a proper understanding of the process. <Button variant="link" className="p-0 new-registration shadow-none btn btn-link" href="https://docs.silamoney.com/docs/kyckyb-levels#kyb" target="_blank" rel="noopener noreferrer"><span className="lnk text-lg">Read more about the KYB levels in our docs!</span></Button></p>
          </li>
        </ul>
        <CardGroup className="mb-4">
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">KYB Standard</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <p>With KYB Standard, information about the business is reviewed, including business address, EIN, business category, and more. Depending on the business type, various individuals holding key roles within the business (i.e., Controlling Officer, Beneficial Owner) are required to pass individual KYC. This must be certified by an Administrator of the business.</p>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">KYB Lite</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <p>With this KYB level, EINs and certification are not required (but can still be provided) for the following business types: sole proprietorships, trusts, unincorporated associations. If the business is one of these types, it will go through the KYB-LITE flow.</p>
                <ul className="pl-3">
                  <li className="text-warning">Only Sole Proprietorships, Trusts, and Unincorporated Associations qualify for KYB Lite</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="text-center bg-light">
              <Card.Title className="text-primary mb-0">Receive Only</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <p>Oftentimes customers need to onboard an entity that exists solely to receive payments. In this instance the business does not need to pass KYB, as long as they are receiving payment from a fully KYC’d/KYB’d entity. This level allows you to skip third party verification and only provide the minimal amount of information. This entity is limited to receiving funds only from a full KYC/KYB source, they may not issue or transfer.</p>
                <ul className="pl-3">
                  <li className="text-warning">KYB Receive Only requires special approval</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </CardGroup>
        <p className="text-center mb-0"><Button href="https://docs.silamoney.com/docs/limits-overview" target="_blank" rel="noopener noreferrer" variant="outline-primary" size="sm">See API Limits in our docs</Button></p>
      </Modal.Body>
    </Modal>
  );
};

export default KybModal;
