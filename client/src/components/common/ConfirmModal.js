import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ConfirmModal = ({ show, onHide, onSuccess, message, buttonLabel }) => {
  return (
    <Modal centered
      show={show ? true : false}
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>&nbsp;</Modal.Header>
      <Modal.Body>
        <p className="text-lg text-info mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={onSuccess}>{buttonLabel ? buttonLabel : 'OK'}</Button>
      </Modal.Footer>
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
  onHide: PropTypes.func,
  /**
   * The function to be called when the callback is successful
   */
  onSuccess: PropTypes.func,
  /**
   * The confirm message
   */
  message: PropTypes.string
};

export default ConfirmModal;
