import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import { useAppContext } from '../context/AppDataProvider';

const ResetModal = () => {
  const { app, resetApp, updateApp } = useAppContext();
  const history = useHistory();

  const handleHide = () => {
    updateApp({ manageReset: false });
  };

  const handleReset = () => {
    resetApp();
    history.push('/');
    handleHide();
    window.location.reload();
  };

  return (
    <Modal centered id="reset-app-modal"
      show={app.manageReset}
      aria-labelledby="reset-app-modal-title"
      onHide={() => handleHide()}>
      <Modal.Header as="h4" closeButton>
        <Modal.Title as="h3" id="reset-app-modal-title">Reset App?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-lg text-info mb-0">This will clear all user data from the App. Users will still be registered with Sila. Are you sure you want to reset?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-light" onClick={() => handleHide()}>Cancel</Button>
        <Button variant="primary" onClick={() => handleReset()}>OK</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetModal;