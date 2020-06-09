import React from 'react';
import { Modal, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

const PlaidFaqModal = ({ show, onHide }) => (
  <Modal
    show={show}
    size="lg"
    aria-labelledby="plaid-faq-modal-title"
    onHide={onHide}>
    <Modal.Header className="text-center" closeButton>
      <Modal.Title id="plaid-faq-modal-title">Plaid login credentials</Modal.Title>
    </Modal.Header>
    <Modal.Body>

      <p className="text-lg text-center text-meta mb-4">There are three different ways Plaid can link your bank account. These different methods each require different login credentials for this demo.</p>

      <p className="mb-3"><strong className="text-primary">Instant Authorization:</strong> User enters their credentials and are authenticated immedietly</p>

      <Table bordered>
        <tbody>
          <tr>
            <td width="50%"><strong className="text-primary">Username:</strong> user_good</td>
            <td width="50%"><strong className="text-primary">Password:</strong> pass_good</td>
          </tr>
        </tbody>
      </Table>

      <p className="my-3"><strong className="text-primary">Automated Micro-deposits:</strong> User enters their credentials and account/routing numbers. Plaid makes 1 micro-deposit and automatically verifies the deposit withing 1-2 business days.</p>

      <Table bordered>
        <tbody>
          <tr>
            <td width="50%"><strong className="text-primary">Username:</strong> user_good</td>
            <td width="50%"><strong className="text-primary">Password:</strong> microdeposits_good</td>
          </tr>
        </tbody>
      </Table>

      <p className="my-3"><strong className="text-primary">Same-day Microdeposits:</strong> User enters account and routing numbers. Plaid makes 2 Same Day ACH micro-deposits and user manually verifies the deposits within 1 business day.</p>

      <Table bordered>
        <tbody>
          <tr>
            <td width="50%"><strong className="text-primary">Micro-deposit #1:</strong> $0.01</td>
            <td width="50%"><strong className="text-primary">Micro-deposit #2:</strong> $0.02</td>
          </tr>
        </tbody>
      </Table>

    </Modal.Body>
  </Modal>
);

PlaidFaqModal.propTypes = {
  /**
   * The visibility boolean to hide or show the modal
   */
  show: PropTypes.bool.isRequired,
  /**
   * The funciton to be called when the modal is closed
   */
  onHide: PropTypes.func.isRequired
};

export default PlaidFaqModal;