import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ConfirmModal = ({ show, onHide, onSuccess, message }) => {
  return (
    <Modal
      show={show ? true : false}
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>&nbsp;</Modal.Header>
      <Modal.Body className="text-center">
        <p className="text-lg mb-4">{message}</p>
        <p>
          <Button variant="outline-primary" size="sm" className="mr-3" style={{ width: '100px' }} onClick={onHide}>Cancel</Button>
          <Button variant="primary" size="sm" style={{ width: '100px' }} onClick={onSuccess}>OK</Button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  /**
   * The visibility boolean to hide or show the modal
   */
  show: PropTypes.bool.isRequired,
  /**
   * The funciton to be called when the modal is closed
   */
  onHide: PropTypes.func.isRequired,
  /**
   * The function to be called when the callback is successful
   */
  onSuccess: PropTypes.func.isRequired,
  /**
   * The confirm message
   */
  message: PropTypes.string.isRequired
};

export default ConfirmModal;