import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from './AlertMessage';

const SettingsModal = () => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { app, updateApp, setAuth, checkAuth } = useAppContext();
  const [appAuthHandle, setAppAuthHandle] = useState(app.auth.handle ? app.auth.handle : '');
  const [appAuthKey, setAppAuthKey] = useState(app.auth.key ? app.auth.key : '');
  const invalidError = { ...errors, auth: 'App credentials are invalid!' };

  const handleAuth = (e) => {
    const pattern = '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$';
    const regex = new RegExp(pattern);
    e.preventDefault();
    setErrors({
      ...errors,
      auth_handle: !e.target.auth_handle.value.length ? 'This field may not be blank.' : false,
      auth_key: !e.target.auth_key.value.length ? 'This field may not be blank.' :
        e.target.auth_key.value && !regex.test(e.target.auth_key.value) ? `This value does not match the required private key pattern: ${pattern}` : false
    });
    if (e.target.auth_key.value && e.target.auth_handle.value && !errors.auth_handle && !errors.auth_key && regex.test(e.target.auth_key.value)) {
      setAuth(e.target.auth_handle.value, e.target.auth_key.value, () => {
        checkAuth(e.target.auth_handle.value, e.target.auth_key.value, (valid) => {
          if (valid) {
            window.location.reload();
          } else {
            setErrors(invalidError);
          }
        });
      });
    }
    setValidated(true);
  };

  const handleHide = () => {
    updateApp({ manageSettings: false });
    resetForm();
  };

  const resetForm = () => {
    setErrors({});
    setValidated(false);
  };

  const appAuthHandleChange = (e) => {
    setAppAuthHandle(e.target.value);
  };

  const appAuthKeyHandleChange = (e) => {
    setAppAuthKey(e.target.value);
  };

  useEffect(() => {
    if (app.manageSettings && app.auth.failed) {
      checkAuth();
      setErrors(invalidError);
      setValidated(true);
    }
  }, [app.manageSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal centered
      show={app.manageSettings}
      size="lg"
      aria-labelledby="manage-settings-modal-title"
      onHide={handleHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="manage-settings-modal-title">App Settings</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} autoComplete="off" onSubmit={handleAuth}>
        <Modal.Body>

          <h4 className="mb-2">Enter App Credentials</h4>
          <p className="text-info mb-4">Get your App credentials from the <a href="https://console.silamoney.com/" target="_blank" rel="noopener noreferrer">Sila Console</a>.</p>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="auth_handle">App Handle</Form.Label>
            <Form.Control required isInvalid={errors.auth_handle && errors.auth_handle.length ? true : false}
              id="auth_handle"
              placeholder={app.auth.handle || undefined}
              aria-label="App Handle"
              name="auth_handle"
              onChange={appAuthHandleChange}
              value={appAuthHandle}
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
              onChange={appAuthKeyHandleChange}
              value={appAuthKey}
            />
            {errors.auth_key && <Form.Control.Feedback type="invalid">{errors.auth_key}</Form.Control.Feedback>}
          </Form.Group>

          <div className="d-flex flex-row">
            <i className="fas fa-info-circle mr-2" style={{ fontSize: '2rem', opacity: '0.1' }}></i>
            <p className="text-sm text-info"><strong className="text-uppercase">MAKE SURE YOU SAVE YOUR PRIVATE KEY!</strong><br />Keep your private keys secure; leave them out of your source code and never store them in an unsafe place. If they are ever compromised, please immediately replace your keys using the <a href="https://console.silamoney.com/" target="_blank" rel="noopener noreferrer">Sila Console</a>.</p>
          </div>

          {errors.auth && <AlertMessage noHide message={errors.auth} type="danger" />}

        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">Update App Authentication</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SettingsModal;