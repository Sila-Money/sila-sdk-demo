import React from 'react';
import { Modal, Container, Row, Col, Button } from 'react-bootstrap';

const ProcessorTokenFlowModal = ({ show, onShowProcessorTokenModal, onHide }) => {
  return (
    <Modal centered
      show={show}
      size="lg"
      aria-labelledby="processor-token-flow-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-left border-bottom p-4" closeButton>
        <Modal.Title id="processor-token-flow-modal-title" className="text-lgr">Choose you preferred method:</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="mb-4 text-muted">We've provided a few different options here for the processor token flow, depending on where you are at in your process with Plaid, and what you would like to learn! Please choose one of the three options below:</p>
        <Container className="bg-lightblue p-4">
          <Row className="mb-4 align-items-center">
            <Col sm={4}><Button block className="mb-2 p-3">Processor Token Tutorial</Button></Col>
            <Col sm={8}>
              <p className="text-muted">Here we will walk you through step-by-step how to set up your Plaid account for integration and how to generate a processor token to link your bank account. This flow will be entirely simulated, and will provide you with a mock processor token at the end.</p>
            </Col>
          </Row>
          <Row className="mb-4 align-items-center">
            <Col sm={4}><Button block className="mb-2 p-3">Generate Processor Token</Button></Col>
            <Col sm={8}>
              <p className="text-muted">With this flow, you will be able to generate your own processor token using your Plaid Sandbox credentials. Your credentials are held locally, and are completely secure. We will make calls on your behalf, which allows you to see the API responses in real-time. </p>
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={4}><Button onClick={onShowProcessorTokenModal} block className="mb-2 p-3">Provide Processor Token</Button></Col>
            <Col sm={8}>
              <p className="text-muted">If you already have a processor token, all you need to do is supply the information and we can connect your bank account instantly.</p>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default ProcessorTokenFlowModal;