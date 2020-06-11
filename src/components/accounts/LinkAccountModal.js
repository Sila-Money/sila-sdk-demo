import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAppContext } from '../context/AppDataProvider';

const LinkAccountModal = ({ onSuccess }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { app, updateApp, setAppData, api, handleError } = useAppContext();

  const linkAccount = (e) => {
    console.log('Linking account ...');
    e.preventDefault();
    api.linkAccountDirect(
      app.activeUser.handle,
      app.activeUser.private_key,
      e.target.routingNumber.value,
      e.target.accountNumber.value,
      e.target.accountName.value).then(res => {
        let result = {};
        console.log('  ... completed!');
        if (res.data.success) {
          result = {
            alert: { message: 'Bank account successfully linked!', style: 'success' },
            manageLinkAccount: false
          }
          if (Object.keys(errors).length) setErrors({});
          onSuccess();
        } else if (res.data.validation_details) {
          setErrors(res.data.validation_details)
        }
        setAppData({
          responses: [...app.responses, {
            endpoint: '/link_account',
            result: JSON.stringify(res, null, '\t')
          }]
        }, () => {
          updateApp({ ...result });
        });
      })
      .catch((err) => {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      });
    setValidated(true);
  }

  return (
    <Modal
      show={app.manageLinkAccount}
      size="lg"
      aria-labelledby="link-account-modal-title"
      onHide={() => { updateApp({ manageLinkAccount: false }); setErrors({}); setValidated(false); }}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="link-account-modal-title">Add your banking details</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} autoComplete="off" onSubmit={linkAccount}>
        <Modal.Body>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="routingNumber">Routing Number</Form.Label>
            <Form.Control required isInvalid={errors.routing_number}
              id="routingNumber"
              placeholder="123456789"
              aria-label="Routing Number"
              name="routingNumber"
            />
            {errors.routing_number && <Form.Control.Feedback type="invalid">{errors.routing_number}</Form.Control.Feedback>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="accountNumber">Account Number</Form.Label>
            <Form.Control required isInvalid={errors.account_number}
              id="accountNumber"
              placeholder="123456789012"
              aria-label="Account Number"
              name="accountNumber"
            />
            {errors.account_number && <Form.Control.Feedback type="invalid">{errors.account_number}</Form.Control.Feedback>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="accountName">Account Name</Form.Label>
            <Form.Control
              id="accountName"
              placeholder="Checking"
              aria-label="Account Name"
              name="accountName"
            />
          </Form.Group>

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