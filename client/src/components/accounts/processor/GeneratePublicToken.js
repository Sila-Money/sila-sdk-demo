import React, { useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { usePlaidLink } from 'react-plaid-link';

import { useAppContext } from '../../context/AppDataProvider';

import AccountContextual from './AccountContextual';

const PlaidButton = ({ linkToken, onSuccess }) => {
  const { app, updateApp } = useAppContext();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const { open, ready, error } = usePlaidLink({
    clientName: 'Plaid Walkthrough Demo',
    env: 'sandbox',
    product: ['auth'],
    language: 'en',
    userLegalName: app.settings.kybHandle ? app.settings.kybHandle : `${activeUser.firstName} ${activeUser.lastName}`,
    userEmailAddress: activeUser.email,
    token: linkToken,
    onSuccess: (token, metadata) => onSuccess(token, metadata)
  });

  const onOpen = () => {
    if (activeUser && !activeUser.email) {
      updateApp({ alert: { message: 'Email address is required to Launch Plaid Link. please add your email from the Registered User page.', type: 'warning' } });
      return;
    }
    open();
  }

  useEffect(() => {
    if (error) updateApp({ alert: { message: error, type: 'danger' } });
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Button className="ml-0 ml-md-4" onClick={onOpen} disabled={!ready}>Launch Plaid Link</Button>;
};

const GeneratePublicToken = ({ step, title, context, isTutorial, allPlaidTokens, onHandleClick, onPublicToken, onTabKey }) => {
  const publicToken = (pubToken, metadata) => {
    onPublicToken(pubToken, metadata.account.name, metadata.account_id);
    onHandleClick(undefined, step);
  };

  return (<>
    <AccountContextual step={step} title={title} context={context} isTutorial={isTutorial} onHandleClick={onHandleClick} onTabKey={onTabKey} />

    {!isTutorial && <>
      <Form noValidate validated={false} autoComplete="off">
        <Form.Group className="mb-3">
          <Form.Label htmlFor="linkToken">Link Token</Form.Label>
          <Form.Control readOnly id="linkToken" placeholder="Link Token" aria-label="Link Token" name="linkToken" defaultValue={allPlaidTokens.linkToken ? allPlaidTokens.linkToken : undefined} />
        </Form.Group>
      </Form>

      <div className="d-flex justify-content-end">
        <Button variant="outline-light" className="mb-2 mb-md-0" onClick={() => onTabKey(step-2)}>Previous</Button>
        <PlaidButton linkToken={allPlaidTokens.linkToken} onSuccess={publicToken} />
      </div>
    </>}
  </>);
};

export default GeneratePublicToken;