import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import { useAppContext } from '../context/AppDataProvider';

const ResetModal = () => {
  const { app, resetApp, updateApp } = useAppContext();
  const history = useHistory();

  const handleReset = () => {
    updateApp({ manageReset: false, loaded: false });
    resetApp(); 
    history.push('/check_handle');
  }

  return (
    <Modal centered
      show={app.manageReset}
      onHide={() => { updateApp({ manageReset: false }) }}>
      <Modal.Header className="text-center" closeButton>&nbsp;</Modal.Header>
      <Modal.Body className="text-center">
        <p className="text-lg mb-4">This will clear all user data from the App. Users will still be registered with Sila. Are you sure you want to reset?</p>
        <p>
          <Button variant="outline-primary" size="sm" className="mr-3" style={{ width: '100px' }} onClick={() => { updateApp({ manageReset: false }); }}>Cancel</Button>
          <Button variant="primary" size="sm" style={{ width: '100px' }} onClick={handleReset}>OK</Button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default ResetModal;