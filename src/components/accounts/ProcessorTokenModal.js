import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAppContext } from '../context/AppDataProvider';

const LinkAccountModal = ({ show, onSuccess }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { app, updateApp, setAppData, api, handleError } = useAppContext();

  const linkAccount = (e) => {
    console.log('Linking account ...');
    e.preventDefault();
    api.linkAccountDirect(
      app.activeUser.handle,
      app.activeUser.private_key,
      e.target.accountNumber.value,
      e.target.routingNumber.value,
      e.target.accountName.value).then(res => {
        let result = {};
        console.log('  ... completed!');
        if (res.statusCode === 200) {
          result = {
            alert: { message: 'Bank account successfully linked!', type: 'success' },
            manageLinkAccount: false
          }
          if (Object.keys(errors).length) setErrors({});
          onSuccess();
        } else if (res.data.validation_details) {
          setErrors(res.data.validation_details)
        }
        setAppData({
          responses: [{
            endpoint: '/link_account',
            result: JSON.stringify(res, null, '\t')
          }, ...app.responses]
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
    <Modal centered
      show={show}
      size="lg"
      aria-labelledby="link-account-modal-title"
      onHide={() => { setErrors({}); setValidated(false); updateApp({ manageProcessorToken: false }); }}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="link-account-modal-title">Link via processor token</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} autoComplete="off" onSubmit={linkAccount}>
        <Modal.Body>

          <p className="text-lg text-meta mb-5">Sila has partnered with Plaid to allow us to link bank accounts using your Plaid integration. More information available <a href="https://plaid.com/docs/auth/partnerships/sila-money/" target="_blank" rel="noopener noreferrer">here</a></p>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="processorToken">Processor Token</Form.Label>
            <Form.Control required isInvalid={errors.routing_number}
              id="processorToken"
              placeholder="123456789"
              aria-label="Processor Token"
              name="processorToken"
              maxLength="9"
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