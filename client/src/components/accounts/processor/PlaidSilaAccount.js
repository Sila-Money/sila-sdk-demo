import React from 'react';
import { Button } from 'react-bootstrap';

const PlaidSilaAccount = ({ step, title, onHandleClick }) => {
  return (<>
    <h2 className="text-primary">{`${step}. ${title}`}</h2>
    <p className="text-info mb-4">In order to use the Plaid + Sila integration, a user must have accounts at both Plaid and Sila. If you already have your Plaid account and have enabled it for integration, click the "I have a Plaid Account" option. If you do not have your own account with sandbox credentials, click "Create Plaid Account".</p>
    <div className="d-flex justify-content-end">
      <Button className="mb-2 mb-md-0" onClick={() => onHandleClick('signup')}>Create Plaid Account</Button>
      <Button className="ml-0 ml-md-4" onClick={() => onHandleClick('havePlaidAccount')}>I have a Plaid Account</Button>
      <Button className="ml-0 ml-md-4" variant="outline-light" onClick={() => onHandleClick('accounts')}>Cancel</Button>
    </div>
  </>);
};

export default PlaidSilaAccount;