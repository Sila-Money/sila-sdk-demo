import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

import { useAppContext } from '../../context/AppDataProvider';
import plaidApi from '../../../api/plaid';

import AccountContextual from './AccountContextual';

const GenerateAccessToken = ({ step, title, context, allPlaidTokens, onHandleClick, onAccessToken, onLoaded }) => {
  const { app, setAppData, updateApp } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);

  const createAccessToken = async (e) => {
    console.log('exchangeToken ... ');
    e.preventDefault();
    let isValidated = true;
    let validationErrors = {};
    if (!allPlaidTokens.publicToken) {
      isValidated = false;
      validationErrors = { ...validationErrors, publicToken: "This field may not be blank." }
    }
    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    try {
      onLoaded(false);
      let result = {};
      const response = await plaidApi.exchangeToken({'public_token': allPlaidTokens.publicToken});

      if (response && response.status === 200 && response.data && response.data.access_token) {
        validationErrors = {};
        result.alert = {};
        onAccessToken(response.data.access_token);
        onHandleClick(undefined, step);
      } else {
        const error_msg = response.data ? response.data.error_message : 'Something wrong!';
        validationErrors = { ...validationErrors, publicToken: error_msg }
        result.alert = { message: error_msg, type: 'danger' };
      }

      setAppData({
        responses: [{
          endpoint: '/item/public_token/exchange',
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
    
    <Form noValidate validated={validated} autoComplete="off" onSubmit={createAccessToken}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="publicToken">Public Token</Form.Label>
        <Form.Control readOnly id="publicToken" placeholder="Public Token" aria-label="Public Token" name="publicToken" defaultValue={allPlaidTokens.publicToken ? allPlaidTokens.publicToken : undefined} isInvalid={Boolean(errors && errors.publicToken)} />
        {errors && errors.publicToken && <Form.Control.Feedback type="invalid">{errors.publicToken}</Form.Control.Feedback>}
      </Form.Group>
    
      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
          <Col><Button block className="mb-2" type="submit">Generate an Access Token</Button></Col>
          </Row>
        </div>
      </div>
    </Form>
  </>);
};

export default GenerateAccessToken;