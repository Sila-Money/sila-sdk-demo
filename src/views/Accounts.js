import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { usePlaidLink } from 'react-plaid-link';

import { useAppContext } from '../components/context/AppDataProvider';

import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import LinkAccountModal from '../components/accounts/LinkAccountModal';
import ProcessorTokenModal from '../components/accounts/ProcessorTokenModal';

const PlaidButton = ({ plaidToken, onSuccess }) => {
  const { app, updateApp } = useAppContext();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const { open, ready, error } = usePlaidLink({
    clientName: 'Plaid Walkthrough Demo',
    env: 'sandbox',
    product: ['auth'],
    country_codes: ['US'],
    language: 'en',
    userLegalName: app.settings.kybHandle ? app.settings.kybHandle : `${activeUser.firstName} ${activeUser.lastName}`,
    userEmailAddress: activeUser.email,
    token: plaidToken.token,
    onSuccess: (token, metadata) => onSuccess(token, metadata, open)
  });

  useEffect(() => {
    if (error) updateApp({ alert: { message: error, type: 'danger' }});
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Button className="ml-4" onClick={() => open()} disabled={!ready}>{plaidToken && plaidToken.account_name ? 'Launch microdeposit verification in Plaid' : 'Connect via Plaid'}</Button>;
};

const Accounts = ({ page, previous, next, isActive }) => {
  const [loaded, setLoaded] = useState(false);
  const [plaidToken, setPlaidToken] = useState(false);
  const { app, api, setAppData, updateApp, handleError } = useAppContext();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const userAccounts = app.accounts.filter(account => account.handle === activeUser.handle);

  const getAccounts = async () => {
    console.log('Getting Accounts ...');
    setLoaded(false);
    try {
      const res = await api.getAccounts(activeUser.handle, activeUser.private_key);
      let newAccounts = [];
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        newAccounts = res.data.map(acc => ({ ...acc, handle: activeUser.handle }));
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        accounts: [...app.accounts.filter(acc => acc.handle !== activeUser.handle), ...newAccounts],
        responses: [{
          endpoint: '/get_accounts',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
  };

  const linkAccount = async (token, metadata, open) => {
    console.log('Linking account ...');
    try {
      const res = await api.linkAccount(activeUser.handle, activeUser.private_key, token, metadata.account.name, metadata.account_id, 'link');
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        result.alert = { message: 'Bank account successfully linked!', type: 'success' };
        getAccounts();
      } else if (res.statusCode === 202 && res.data.message.includes('microdeposit_pending_automatic_verification')) {
        setPlaidToken({ token });
        setTimeout(open, 500);
      } else if (res.statusCode === 202 && res.data.message.includes('microdeposit_pending_manual_verification')) {
        result.alert = { message: 'Bank account requires manual verificaiton!', type: 'danger' };
        getAccounts();
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        responses: [{
          endpoint: '/link_account',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const getPlaidLinkToken = async () => {
    console.log('Getting Plaid link token ...');
    try {
      const res = await api.plaidLinkToken(activeUser.handle, activeUser.private_key);
      console.log('  ... completed!');
      setPlaidToken({ token: res.data.link_token });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const plaidSamedayAuth = async (account_name) => {
    console.log('Retrieving public token ...');
    try {
      const res = await api.plaidSamedayAuth(activeUser.handle, activeUser.private_key, account_name);
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        result.alert = { message: 'Token retrieved!', type: 'success' };
        setPlaidToken({ token: res.data.public_token, account_name: account_name });
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        responses: [{
          endpoint: '/plaid_sameday_auth',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  useEffect(() => {
    getAccounts();
  }, [app.activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userAccounts.length && !isActive) setAppData({ success: [...app.success, { handle: activeUser.handle, page }] });
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getPlaidLinkToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Link a Bank Account</h1>

      <p className="text-muted text-lg">We've partnered with Plaid to connect bank accounts to the Sila platform. This helps us ensure account ownership.</p>

      <p className="text-muted text-lg">We also have the ability to connect bank accounts with just an account and routing number, if your product is dependent on receiving account information over the phone, on a form, or similar. This feature needs to be approved by Sila for use.</p>

      <p className="text-muted mb-0 mb-5">This page represents <a href="https://docs.silamoney.com/docs/get_accounts" target="_blank" rel="noopener noreferrer">/get_accounts</a>, <a href="https://docs.silamoney.com/docs/link_account" target="_blank" rel="noopener noreferrer">/link_account</a>, and <a href="https://docs.silamoney.com/docs/plaid_sameday_auth" target="_blank" rel="noopener noreferrer">/plaid_sameday_auth</a> functionality.</p>

      <div className="accounts position-relative mb-5">
        {!loaded && <Loader overlay />}
        <Table bordered responsive>
          <thead>
            <tr>
              <th className="text-lg">Account  #</th>
              <th className="text-lg">Name</th>
              <th className="text-lg">Type</th>
              <th className="text-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {loaded && userAccounts.length > 0 ?
              userAccounts.map((acc, index) =>
                <tr className="loaded" key={index}>
                  <td>{acc.account_number}</td>
                  <td>{acc.account_name}</td>
                  <td>{acc.account_type}</td>
                  <td className="text-center">
                    {(acc.account_link_status === 'instantly_verified' || acc.account_link_status === 'microdeposit_manually_verified' || acc.account_link_status === 'unverified_manual_input') && <span className="text-success">Active</span>}
                    {acc.account_link_status === 'microdeposit_pending_automatic_verification' && <span className="text-danger">Failed</span>}
                    {plaidToken && acc.account_name === plaidToken.account_name && <span className="text-primary font-italic">Currently verifying...</span>}
                    {!plaidToken && acc.account_link_status === 'microdeposit_pending_manual_verification' && <Button size="sm" variant="secondary" disabled={plaidToken} onClick={() => plaidSamedayAuth(acc.account_name)}>Manually Approve</Button>}
                  </td>
                </tr>
              ) :
              <tr className="loaded">
                {loaded && userAccounts.length === 0 ? <td><em>No accounts linked</em></td> : <td>&nbsp;</td>}
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            }
          </tbody>
        </Table>
        {userAccounts.find(acc => acc.account_link_status === 'microdeposit_pending_manual_verification' || acc.account_link_status === 'microdeposit_pending_automatic_verification') && <p className="text-muted mt-4">With Same Day Micro-deposits, Plaid verfies the deposit within 1 business days Within the Sandbox timeframe, it’s only takes a few minutes. To jump back into your session, we’ll need you to retrieve a public token from Plaid. From there, two microdeposits should appear in your account within minutes. We will need you to verify the amount of these depsoits in order to launch Phase 2.</p>}
      </div>

      <div className="d-flex mb-4">
        {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
        <div className="ml-auto">
          <Button className="mr-4" onClick={() => updateApp({ manageLinkAccount: true })}>Enter Account/Routing</Button>
          <Button onClick={() => updateApp({ manageProcessorToken: true })}>Enter Processor Token</Button>
          {plaidToken && <PlaidButton plaidToken={plaidToken} onSuccess={linkAccount} />}
        </div>
      </div>

      <p className="text-right"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none" href="http://plaid.com/docs/#testing-auth" target="_blank" rel="noopener noreferrer"><span className="lnk">How do I login to Plaid?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />

      <LinkAccountModal show={app.manageLinkAccount} onSuccess={getAccounts} />

      <ProcessorTokenModal show={app.manageProcessorToken} onSuccess={getAccounts} />

    </Container>
  );
};

export default Accounts;
