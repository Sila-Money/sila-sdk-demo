import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

const SettingsModal = () => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { app, updateApp, setAuth } = useAppContext();

  const handleAuth = (e) => {
    const pattern = '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$';
    const regex = new RegExp(pattern);
    e.preventDefault();
    setErrors({ ...errors,
      auth_handle: !e.target.auth_handle.value.length ? 'This field may not be blank.' : false,
      auth_key: !e.target.auth_key.value.length ? 'This field may not be blank.' : 
        e.target.auth_key.value && !regex.test(e.target.auth_key.value) ? `This value does not match the required private key pattern: ${pattern}` : false
    });
    if (e.target.auth_key.value && e.target.auth_handle.value && !errors.auth_handle && !errors.auth_key && regex.test(e.target.auth_key.value)) {
      e.preventDefault();
      setAuth(e.target.auth_handle.value, e.target.auth_key.value);
      handleHide();
    }
    setValidated(true);
  }

  const handleHide = () => {
    updateApp({ manageSettings: false });
    resetForm();
  }

  const resetForm = () => {
    setErrors({});
    setValidated(false);
  }

  return (
    <Modal
      show={app.manageSettings}
      size="lg"
      aria-labelledby="manage-settings-modal-title"
      onHide={handleHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="manage-settings-modal-title">App Settings</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} autoComplete="off" onSubmit={handleAuth}>
        <Modal.Body>

          <h4 className="mb-4">Enter App Credentials</h4>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="auth_handle">App Handle</Form.Label>
            <Form.Control required isInvalid={errors.auth_handle && errors.auth_handle.length ? true : false}
              id="auth_handle"
              placeholder={app.auth.handle || undefined}
              aria-label="App Handle"
              name="auth_handle"
            />
            {errors.auth_handle && <Form.Control.Feedback type="invalid">{errors.auth_handle}</Form.Control.Feedback>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="auth_key">App Private Key</Form.Label>
            <Form.Control required isInvalid={errors.auth_key && errors.auth_key.length ? true : false}
              id="auth_key"
              placeholder={app.auth.key || undefined}
              aria-label="App Private Key"
              name="auth_key"
            />
            {errors.auth_key && <Form.Control.Feedback type="invalid">{errors.auth_key}</Form.Control.Feedback>}
          </Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">Update App Authentication</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SettingsModal;