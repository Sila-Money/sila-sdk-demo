import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';

const InstitutionsModal = ({ show, onClose }) => {
  const [validated, setValidated] = useState(false);

  const searchInstitution = (e) => {}

  return (
    <Modal centered
      show={show}
      size="lg"
      aria-labelledby="institution-modal-title"
      onHide={onClose}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="institution-modal-title">Routing Number Directory</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} autoComplete="off" onSubmit={searchInstitution}>
        <Modal.Body>

          <Form.Group className="mb-3">
            <Form.Control
              id="institutionName"
              placeholder="Search by institution name"
              aria-label="Search by institution name"
              name="institutionName"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              id="RoutingNumber"
              placeholder="Search by routing number"
              aria-label="Search by routing number"
              name="RoutingNumber"
            />
          </Form.Group>

        </Modal.Body>
      </Form>
    </Modal>
  );
};

export default InstitutionsModal;