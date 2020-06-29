import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { usePlaidLink } from 'react-plaid-link';

import { useAppContext } from '../components/context/AppDataProvider';

import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import LinkAccountModal from '../components/accounts/LinkAccountModal';

const Accounts = ({ page }) => {
  const [loaded, setLoaded] = useState(false);
  const [plaidToken, setPlaidToken] = useState(false);
  const { app, api, setAppData, updateApp, handleError } = useAppContext();
  const { open, ready, error } = usePlaidLink({
    clientName: 'Plaid Walkthrough Demo',
    env: 'sandbox',
    product: ['auth'],
    publicKey: 'fa9dd19eb40982275785b09760ab79',
    userLegalName: `${app.activeUser.firstName} ${app.activeUser.lastName}`,
    userEmailAddress: app.activeUser.email,
    token: plaidToken ? plaidToken.token : null,
    onSuccess: (token, metadata) => linkAccount(token, metadata)
  });
  const userAccounts = app.accounts.filter(account => account.handle === app.activeUser.handle);

  const getAccounts = async () => {
    console.log('Getting Accounts ...');
    setLoaded(false);
    try {
      const res = await api.getAccounts(app.activeUser.handle, app.activeUser.private_key);
      let newAccounts = [];
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        newAccounts = res.data.map(acc => ({ ...acc, handle: app.activeUser.handle }));
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      setAppData({
        accounts: [...app.accounts.filter(acc => acc.handle !== app.activeUser.handle), ...newAccounts],
        responses: [...app.responses, {
          endpoint: '/get_accounts',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
  }

  const linkAccount = async (token, metadata) => {
    console.log('Linking account ...');
    try {
      const res = await api.linkAccount(app.activeUser.handle, app.activeUser.private_key, token, metadata.account.name, metadata.account_id);
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        console.log(res);
        result.alert = { message: 'Bank account successfully linked!', style: 'success' };
        getAccounts();
        if (plaidToken) setPlaidToken(false);
      } else if (res.statusCode === 202 && res.data.message.includes('microdeposit_pending_automatic_verification')) {
        setPlaidToken({ token });
        setTimeout(() => open, 500);
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      setAppData({
        responses: [...app.responses, {
          endpoint: '/link_account',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  const plaidSamedayAuth = async (account_name) => {
    console.log('Retrieving public token ...');
    try {
      const res = await api.plaidSamedayAuth(app.activeUser.handle, app.activeUser.private_key, account_name);
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        result.alert = { message: 'Token retrieved!', style: 'success' };
        setPlaidToken({ token: res.data.public_token, account_name: account_name });
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      setAppData({
        responses: [...app.responses, {
          endpoint: '/plaid_sameday_auth',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  useEffect(() => {
    if (error) updateApp({ alert: { message: error, style: 'danger' }});
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getAccounts();
  }, [app.activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userAccounts.length && !app.success.includes(page)) updateApp({ success: [...app.success, page] });
  }, [userAccounts]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 loaded">

      <h1 className="mb-4">Link a Bank Account</h1>

      <p className="text-meta text-lg">We've partnered with Plaid to connect bank accounts to the Sila platform. This helps us ensure account ownership.</p>

      <p className="text-meta text-lg">We also have the ability to connect bank accounts with just an account and routing number, if your product is dependent on receiving account information over the phone, on a form, or similar. This feature needs to be approved by Sila for use.</p>

      <p className="text-meta">This page represents <a href="https://docs.silamoney.com/#get_accounts" target="_blank" rel="noopener noreferrer">/get_accounts</a>, <a href="https://docs.silamoney.com/#link_account" target="_blank" rel="noopener noreferrer">/link_account</a>, and <a href="https://docs.silamoney.com/#plaid_sameday_auth" target="_blank" rel="noopener noreferrer">/plaid_sameday_auth</a> functionality.</p>

      <div className="accounts position-relative mt-4">
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
                    {(acc.account_link_status === 'instantly_verified' || acc.account_link_status === 'microdeposit_manually_verified') && <span className="text-success">Active</span>}
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
        {userAccounts.find(acc => acc.account_link_status === 'microdeposit_pending_manual_verification' || acc.account_link_status === 'microdeposit_pending_automatic_verification') && <p className="text-meta mt-4">With Same Day Micro-deposits, Plaid verfies the deposit within 1 business days Within the Sandbox timeframe, it’s only takes a few minutes. To jump back into your session, we’ll need you to retrieve a public token from Plaid. From there, two microdeposits should appear in your account within minutes. We will need you to verify the amount of these depsoits in order to launch Phase 2.</p>}
      </div>

      <div className="d-flex my-4">
        {app.alert.message && <AlertMessage message={app.alert.message} style={app.alert.style} />}
        <div className="ml-auto">
          {!plaidToken && <Button className=" mr-4" onClick={() => updateApp({ manageLinkAccount: true })}>Enter Account/Routing</Button>}
          <Button onClick={() => open()} disabled={!ready}>{plaidToken && plaidToken.account_name ? 'Launch microdeposit verification in Plaid' : 'Connect via Plaid'}</Button>
        </div>
      </div>

      <p className="text-right"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none" href="http://plaid.com/docs/#testing-auth" target="_blank" rel="noopener noreferrer"><span className="lnk">How do I login to Plaid?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>

      <Pagination
        className="mt-auto pt-4"
        previous="/wallets"
        next={app.success.includes(page) ? '/transact' : undefined}
        currentPage={page} />

      <LinkAccountModal onSuccess={getAccounts} />

    </Container>
  );
};

export default Accounts;
