import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { Form, Row, Col, Button } from 'react-bootstrap';

import { useAppContext } from '../../context/AppDataProvider';
import plaidApi from '../../../api/plaid';

import AccountContextual from './AccountContextual';

const CreateLinkToken = ({ step, title, context, onHandleClick, onLinkToken, onLoaded }) => {
  const { app, setAppData, updateApp } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);
  const [authCredentials, setAuthCredentials] = useState({
    clientId: Cookies.get('sila_demo_clientId') || undefined,
    secretKey: Cookies.get('sila_demo_secretKey') || undefined
  });

  const linkTokenCreate = async (e) => {
    console.log('createlinkToken ... ');
    e.preventDefault();
    let isValidated = true;
    let validationErrors = {};
    if (e.target.clientId && e.target.clientId.value) e.target.clientId.value = e.target.clientId.value.trim();
    if (e.target.secretKey && e.target.secretKey.value) e.target.secretKey.value = e.target.secretKey.value.trim();
    if (e.target.clientId && !e.target.clientId.value) {
      isValidated = false;
      validationErrors = { ...validationErrors, clientId: "This field may not be blank." }
    }
    if (e.target.secretKey && !e.target.secretKey.value) {
      isValidated = false;
      validationErrors = { ...validationErrors, secretKey: "This field may not be blank." }
    }
    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    setAuthCredentials({ ...authCredentials, clientId: e.target.clientId.value, secretKey: e.target.secretKey.value });
    Cookies.set('sila_demo_clientId', e.target.clientId.value);
    Cookies.set('sila_demo_secretKey', e.target.secretKey.value);

    try {
      onLoaded(false);
      let result = {};
      const response = await plaidApi.createLinkToken({
        'client_name': 'Sila Demo',
        'country_codes': ['US'],
        'language': 'en',
        'user': {
          'client_user_id': app.activeUser.handle
        },
        'products': ['auth']
      });

      if (response && response.status === 200 && response.data && response.data.link_token) {
        validationErrors = {};
        result.alert = {};
        onLinkToken(response.data.link_token);
        onHandleClick(undefined, step);
      } else {
        const error_msg = response.data ? response.data.error_message : 'Something wrong!';
        validationErrors = { ...validationErrors, secretKey: error_msg }
        result.alert = { message: error_msg, type: 'danger' };
      }

      setAppData({
        responses: [{
          endpoint: '/link/token/create',
          result: JSON.stringify(response, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (error) {
      console.log(error);
    }
    setErrors(validationErrors);
    setValidated(true);
    onLoaded(true);
  };

  return (<>
    <AccountContextual step={step} title={title} context={context} onHandleClick={onHandleClick} isTutorial={false} />
    
    <Form noValidate validated={validated} autoComplete="off" onSubmit={linkTokenCreate}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="clientId">Client ID</Form.Label>
        <Form.Control autoFocus required id="clientId" placeholder="client_id" aria-label="Client ID" name="clientId" defaultValue={authCredentials.clientId ? authCredentials.clientId : undefined} isInvalid={Boolean(errors && errors.clientId)} />
        {errors && errors.clientId && <Form.Control.Feedback type="invalid">{errors.clientId}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="secretKey">Secret Key</Form.Label>
        <Form.Control required id="secretKey" placeholder="secret_key" aria-label="Secret Key" name="secretKey" defaultValue={authCredentials.secretKey ? authCredentials.secretKey : undefined} isInvalid={Boolean(errors && errors.secretKey)} />
        {errors && errors.secretKey && <Form.Control.Feedback type="invalid">{errors.secretKey}</Form.Control.Feedback>}
      </Form.Group>

      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
            <Col><Button block className="mb-2" type="submit">Generate Link Token</Button></Col>
          </Row>
        </div>
      </div>
    </Form>
  </>);
};

export default CreateLinkToken;