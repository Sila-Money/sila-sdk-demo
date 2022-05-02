import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const PlaidSilaAccount = ({ step, title, onHandleClick }) => {
  return (<>
    <h2 className="text-primary">{`${step}. ${title}`}</h2>
    <p className="text-muted mb-3">In order to use the Plaid + Sila integration, a user must have accounts at both Plaid and Sila. If you already have your Plaid account and have enabled it for integration, click the "I have a Plaid Account" option. If you do not have your own account with sandbox credentials, click "Create Plaid Account".</p>
    <div className="mb-2 loaded">
      <div className="">
        <Row className="mt-2 justify-content-end">
          <Col lg="12" xl="4"><Button onClick={() => onHandleClick('signup')} block className="mb-2">Create Plaid Account</Button></Col>
          <Col lg="12" xl="4"><Button onClick={() => onHandleClick('havePlaidAccount')} block className="mb-2">I have a Plaid Account</Button></Col>
          <Col lg="12" xl="2"><Button variant="outline-light" block onClick={() => onHandleClick('accounts')}>Cancel</Button></Col>
        </Row>
      </div>
    </div>
  </>);
};

export default PlaidSilaAccount;