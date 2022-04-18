import React, { useState } from 'react';
import { Modal, Container, Row, Col, Button, Card } from 'react-bootstrap';

import plaidApi from '../../../src/api/plaid';

const GenerateProcessorTokenModal = ({ show, onHide }) => {
  const [linkToken, setLinkToken] = useState(false);
  const [linkResponse, setLinkResponse] = useState(false);
  const [publicToken, setPublicToken] = useState(false);
  const [accountId, setAccountId] = useState(false);
  const [publicResponse, setPublicResponse] = useState(false);
  const [accessToken, setAccessToken] = useState(false);
  const [accessResponse, setAccessResponse] = useState(false);
  const [processorToken, setProcessorToken] = useState(false);
  const [processorResponse, setProcessorResponse] = useState(false);

  const createLinkToken = async () => {
    try {
      const response = await plaidApi.createLinkToken({
        'client_name': 'Sila Demo',
        'country_codes': ['US'],
        'language': 'en',
        'user': {
          'client_user_id': 'sila'
        },
        'products': ['auth']
      });
      setLinkResponse(JSON.stringify(response, null, '\t'));
      
      if (response && response.status === 200 && response.data && response.data.link_token) {
        setLinkToken(response.data.link_token);
        const method = 'POST';
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        };
        const body = JSON.stringify({
          link_token: response.data.link_token,
          initial_products: ['transactions'],
          institution_id: 'ins_109508',
          credentials: {
            username: 'user_good',
            password: 'pass_good'
          }
        });
        const public_res = await fetch('https://sandbox.plaid.com/link/item/create', { method, headers, body });
        const result = await public_res.json();
        setPublicResponse(JSON.stringify(result, null, '\t'));
        if (result && result.public_token) {
          setPublicToken(result.public_token);
          setAccountId(result.accounts[0]['account_id']);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const exchangeToken = async () => {
    try {
      const response = await plaidApi.exchangeToken({'public_token': publicToken});
      setAccessResponse(JSON.stringify(response, null, '\t'));
      setAccessToken(response.data.access_token);
    } catch (error) {
      console.log(error);
    }
  };

  const createProcessorToken = async () => {
    try {
      const response = await plaidApi.createProcessorToken({
        'accessToken': accessToken,
        'accountID': accountId,
        'processor': 'sila_money'
      });
      setProcessorResponse(JSON.stringify(response, null, '\t'));
      setProcessorToken(response.data.processor_token);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal centered
      show={show}
      size="lg"
      aria-labelledby="generate-processor-token-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-left border-bottom p-4" closeButton>
        <Modal.Title id="generate-processor-token-modal-title" className="text-lgr">Generate a Plaid Processor Token</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Container className="p-4">
          <Row>
            <Col className="mx-auto" md="6">
              <h2 className="mb-4 text-center text-primary">Plaid Test</h2>
              <Card as="aside">
                <Card.Header as="header" className="p-4">
                  <h4>Generate A Link Token</h4>
                </Card.Header>
                <Card.Body as="section" className="p-4">
                  <p className={`mb-0 ${linkToken ? 'text-success' : 'text-muted font-italic'}`}>{linkToken || 'link-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}</p>
                  <p className={`mb-0 ${publicToken ? 'text-success' : 'text-muted font-italic'}`}>{publicToken || 'public-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}</p>
                  <p className={`mb-0 ${accessToken ? 'text-success' : 'text-muted font-italic'}`}>{accessToken || 'access-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}</p>
                  <p className={`mb-0 ${processorToken ? 'text-success' : 'text-muted font-italic'}`}>{processorToken || 'processor-sandbox-xxxxx-xxxxx'}</p>
                </Card.Body>
                <Card.Footer as="footer" className="p-4">
                  <Button onClick={createLinkToken} className="ml-auto mb-3">Generate Link Token</Button>
                  {linkToken && publicToken && <Button onClick={exchangeToken} className="ml-auto mb-3">Generate an Access Token</Button>}
                  {accessToken && <Button onClick={createProcessorToken} className="ml-auto mb-3">Create Processor token</Button>}
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5 className="mt-5">Plaid Response:</h5>
              <pre className="w-100 border p-4 rounded">{linkResponse || 'Wating for link response...'}</pre>
              {publicResponse && <pre className="w-100 border p-4 rounded">{publicResponse || 'Wating for public response...'}</pre>}
              {accessResponse && <pre className="w-100 border p-4 rounded">{accessResponse || 'Wating for access response...'}</pre>}
              {processorResponse && <pre className="w-100 border p-4 rounded">{processorResponse || 'Wating for processor response...'}</pre>}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default GenerateProcessorTokenModal;