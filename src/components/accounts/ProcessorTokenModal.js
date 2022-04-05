import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from '../common/AlertMessage';

const LinkAccountModal = ({ show, onSuccess, onResponse }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);
  const [token, setToken] = useState(false);
  const [alert, setAlert] = useState(false);
  const { app, updateApp, api, handleError } = useAppContext();

  const linkAccount = (e) => {
    console.log('Linking account ...');
    e.preventDefault();
    api.linkAccount(app.activeUser.handle, app.activeUser.private_key, token, e.target.accountName.value, null, 'processor').then(res => {
        const responseObj = { endpoint: '/link_account', result: JSON.stringify(res, null, '\t') };
        let result = {};
        console.log('  ... completed!');
        if (res.data.success) {
          result = {
            alert: { message: 'Bank account successfully linked!', type: 'success' },
            manageProcessorToken: false
          }
          if (errors) setErrors(false);
          onSuccess(responseObj);
          resetForm();
        } else if (res.data.validation_details) {
          setErrors(res.data.validation_details);
          onResponse(responseObj);
        } else {
          setAlert({ message: `Error! ${res.data.message}`, type: 'danger' });
          onResponse(responseObj);
        }
        updateApp({ ...result });
      })
      .catch((err) => {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      });
    setValidated(true);
  };

  const handleChange = (e) => {
    setToken(e.target.value);
    (alert || errors || validated) && resetForm();
  };

  const resetForm = () => {
    setErrors(false);
    setAlert(false);
    setValidated(false);
  };

  return (
    <Modal centered
      show={show}
      size="lg"
      aria-labelledby="link-account-modal-title"
      onHide={() => { resetForm(); updateApp({ manageProcessorToken: false }); }}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="link-account-modal-title">Link via Processor Token</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} autoComplete="off" onSubmit={linkAccount}>
        <Modal.Body>

          <p className="text-lg mb-2">Sila has partnered with Plaid to allow us to link bank accounts using your Plaid integration.</p>
          <p className="text-meta mb-5">More information available <a href="https://plaid.com/docs/auth/partnerships/sila-money/" target="_blank" rel="noopener noreferrer">here</a>.</p>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="processorToken">Account Name</Form.Label>
            <Form.Control
              id="accountName"
              placeholder="Optional"
              aria-label="Account Name"
              name="accountName"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="processorToken">Processor Token</Form.Label>
            <Form.Control required isInvalid={errors && errors.plaid_token}
              id="processorToken"
              placeholder="processor-xxx-xxx"
              aria-label="Processor Token"
              name="processorToken"
              onChange={handleChange}
            />
            {errors && errors.plaid_token && <Form.Control.Feedback type="invalid">{errors.plaid_token}</Form.Control.Feedback>}
          </Form.Group>

          {alert && <div className="mt-4"><AlertMessage message={alert.message} type={alert.type} onHide={() => setAlert(false)} /></div>}

        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">
            Link bank account
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LinkAccountModal;