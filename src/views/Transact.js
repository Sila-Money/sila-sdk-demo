import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, InputGroup, Table, Tab, Tabs, Alert } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { useAppContext } from '../components/context/AppDataProvider';

import ConfirmModal from '../components/common/ConfirmModal';
import SelectMenu from '../components/common/SelectMenu';
import Loader from '../components/common/Loader';
import AlertMessage from '../components/common/AlertMessage';

const defaultForms = {
  issue: { values: {}, errors: {}, validated: false },
  transfer: { values: {}, errors: {}, validated: false },
  redeem: { values: {}, errors: {}, validated: false }
};

const defaultConfirm = { show: false, message: '', onSuccess: () => { } };

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const Transact = () => {
  const { app, api, setAppData, updateApp, handleError } = useAppContext();
  const userWallets = app.wallets.filter(wallet => wallet.handle === app.activeUser.handle).sort((x, y) => x.default ? -1 : y.default ? 1 : 0);
  const userAccounts = app.accounts.filter(account => account.handle === app.activeUser.handle);
  const [wallet, setWallet] = useState(userWallets.find(wallet => wallet.default) || userWallets[0]);
  const [account, setAccount] = useState(userAccounts[0]);
  const [balance, setBalance] = useState('Checking Balance ...');
  const [loaded, setLoaded] = useState(false);
  const [forms, setForms] = useState(defaultForms);
  const [confirm, setConfirm] = useState(defaultConfirm);

  const handleChange = (e, form) => setForms({ ...forms, [form]: { ...forms[form], values: { ...forms[form].values, [e.target.name]: e.target.value } } });
  const handleFormError = (form, name, error) => setForms({ ...forms, [form]: { ...forms[form], errors: { ...forms[form].errors, [name]: error } } });
  const handleAccount = (index) => setAccount(userAccounts[index]);
  const handleWallet = (index) => {
    setWallet(userWallets[index]);
    updateApp({ activeUser: { ...app.activeUser, private_key: userWallets[index].private_key, cryptoAddress: userWallets[index].blockchain_address } });
  };

  const refreshBalance = async () => {
    console.log('Checking Balance ...');
    setBalance('Checking Balance ...');
    try {
      const res = await api.getBalance(wallet.blockchain_address);
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        setBalance(res.data.silaBalance);
        result.alert = { message: res.data.message, style: 'success' }
      } else {
        result.alert = { message: res.data.message, style: 'danger' }
      }
      setAppData({
        responses: [...app.responses, {
          endpoint: '/get_sila_balance',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const issueSila = async (amount) => {
    console.log(`Issuing ${amount} sila ...`);
    try {
      const res = await api.issueSila(amount, app.activeUser.handle, app.activeUser.private_key, account.account_name);
      let result = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        result.alert = { message: 'Sila successfully issued', style: 'success' };
        refreshTransactions();
      } else {
        result.alert = { message: res.data.message, style: 'success' };
      }
      setAppData({
        responses: [...app.responses, {
          endpoint: '/issue_sila',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const redeemSila = async (amount) => {
    console.log(`Redeeming ${amount} sila ...`);
    try {
      const res = await api.redeemSila(amount, app.activeUser.handle, app.activeUser.private_key, account.account_name);
      let result = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        result.alert = { message: 'Sila successfully redeemed', style: 'success' };
        refreshTransactions();
      } else {
        result.alert = { message: res.data.message, style: 'success' };
      }
      setAppData({
        responses: [...app.responses, {
          endpoint: '/redeem_sila',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const transferSila = async (amount, destination) => {
    console.log(`Transferring ${amount} sila to ${destination} ...`);
    try {
      const res = await api.transferSila(amount, app.activeUser.handle, app.activeUser.private_key, destination);
      let result = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        result.alert = { message: 'Sila successfully transferred', style: 'success' };
        refreshTransactions();
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      setAppData({
        responses: [...app.responses, {
          endpoint: '/transfer_sila',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const refreshTransactions = async (showResponse) => {
    console.log('Refreshing transactions ...');
    setLoaded(false);
    try {
      const res = await api.getTransactions(app.activeUser.handle, app.activeUser.private_key);
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        result.transactions = res.data.transactions;
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      if (showResponse) {
        setAppData({
          responses: [...app.responses, {
            endpoint: '/get_transactions',
            result: JSON.stringify(res, null, '\t')
          }]
        }, () => {
          updateApp({ ...result });
        });
      } else {
        updateApp({ ...result });
      }
      setLoaded(true);
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  useEffect(() => {
    refreshBalance();
  }, [wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refreshTransactions(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 loaded">

      <div className="d-flex mb-2">
        <h1 className="mb-4">Transact</h1>
        {userAccounts.length !== 0 && <Form.Group className="d-flex select align-items-center ml-auto w-50">
          <Form.Label className="mr-4 mb-0 font-weight-bold" htmlFor="account">Account:</Form.Label>
          <SelectMenu fullWidth id="account" size="sm" onChange={handleAccount} options={userAccounts.map((account, index) => ({ label: account.account_name, value: index }))} />
        </Form.Group>}
      </div>

      <p className="text-meta mb-4">This page represents <a href="https://docs.silamoney.com/#get_sila_balance" target="_blank" rel="noopener noreferrer">/get_sila_balance</a>, <a href="https://docs.silamoney.com/#issue_sila" target="_blank" rel="noopener noreferrer">/issue_sila</a>, <a href="https://docs.silamoney.com/#redeem_sila" target="_blank" rel="noopener noreferrer">/redeem_sila</a>, <a href="https://docs.silamoney.com/#transfer_sila" target="_blank" rel="noopener noreferrer">/transfer_sila</a>, and <a href="https://docs.silamoney.com/#get_transactions" target="_blank" rel="noopener noreferrer">/get_transactions</a>  functionality.</p>

      {userAccounts.length === 0 && <Alert variant="warning" className="mb-4">An an active account is required to initiate a transaction.  <NavLink to="/accounts" className="text-reset text-underline">Link an account</NavLink></Alert>}

      <div className="d-flex mb-2">
        <h2>Wallet Ballance</h2>
        <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none" onClick={refreshBalance}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk">Refresh</span></Button>
      </div>

      <Row className="mb-4" noGutters>
        <Col>
          <Form.Group className="select">
            <Card className="border-0">
              <Card.Header className="bg-primary p-3 rounded-tl rounded-tr-0">
                <Form.Label className="m-0" htmlFor="wallet"><h3 className="m-0 text-white">Wallet</h3></Form.Label>
              </Card.Header>
              <Card.Body className="p-0">
                <SelectMenu fullWidth id="wallet" className="border-top-0 rounded-top-0 rounded-br-0 border-light py-3" onChange={handleWallet} options={userWallets.map((wallet, index) => ({ label: `${wallet.nickname ? wallet.nickname : wallet.private_key === app.activeUser.private_key ? 'My Wallet' : `Wallet Name`}${wallet.default ? ' (Default)' : ''}`, value: index }))} />
              </Card.Body>
            </Card>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Card className="border-0">
              <Card.Header className="bg-primary p-3 rounded-tr rounded-tl-0">
                <Form.Label className="m-0" htmlFor="balance"><h3 className="m-0 text-white">Amount of Sila</h3></Form.Label>
              </Card.Header>
              <Card.Body className="form-control p-3 border-left-0 border-top-0 rounded-top-0 rounded-bl-0 border-bottom border-right border-light">
                {balance}
              </Card.Body>
            </Card>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex mb-2">
        <h2>Transactions</h2>
        <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none" onClick={() => refreshTransactions(true)}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk">Refresh</span></Button>
      </div>

      <div className="transactions position-relative mb-4">
        {!loaded && <Loader overlay />}
        <Table bordered responsive>
          <thead>
            <tr>
              <th className="text-lg">Type</th>
              <th className="text-lg">Amount</th>
              <th className="text-lg">Status</th>
              <th className="text-lg">Created At</th>
            </tr>
          </thead>
          <tbody>
            {app.transactions.length ?
              <>
                {app.transactions.map((transaction, index) => <tr key={index}>
                  <td>{transaction.transaction_type}</td>
                  <td><i className="sila-icon sila-icon-sila"></i> {formatNumber(transaction.sila_amount)}</td>
                  <td className={transaction.status === 'success' ? 'text-success' : transaction.status === 'pending' ? 'text-warning' : transaction.status === 'failed' ? 'text-danger' : 'text-primary'}>{transaction.status}</td>
                  <td>{(new Date(transaction.created)).toISOString().split('T')[0]}</td>
                </tr>)}
              </>
              : <tr><td colSpan="4"><em>No transactions found</em></td></tr>}
          </tbody>
        </Table>
      </div>

      {app.accounts.length !== 0 && <Tabs defaultActiveKey="issue" id="uncontrolled-tab-example">
        <Tab eventKey="issue" title="Issue">
          <h2>Issue</h2>
          <p className="text-meta">Add Sila to your wallet by debiting a linked account.</p>
          <Form noValidate validated={forms.issue.validated} autoComplete="off" className="d-flex mt-auto" onSubmit={(e) => {
            e.preventDefault();
            const amount = parseFloat(e.target.issue.value);
            if (isNaN(amount) || amount % 1 !== 0) {
              handleFormError('issue', 'issue', 'Please enter a whole number');
            } else {
              setConfirm({
                show: true,
                message: `Please confirm that you would like to convert $${formatNumber(amount / 100)} USD fom your primary linked account to ${formatNumber(amount)} Sila in your linked wallet.`,
                onSuccess:() => {
                  issueSila(amount);
                  setConfirm({ show: false });
                }
              });
              setForms(defaultForms);
            }
          }}>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><i className="sila-icon sila-icon-sila"></i></InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control type="number" name="issue" id="issue" className="m-0" value={forms.issue.values.issue || ''} placeholder="# of Sila" isInvalid={forms.issue.errors.issue ? true : false} onChange={(e) => handleChange(e, 'issue')} />
              {forms.issue.errors.issue && <Form.Control.Feedback type="invalid">{forms.issue.errors.issue}</Form.Control.Feedback>}
            </InputGroup>
            <Button className="text-nowrap ml-2" variant="primary" type="submit" disabled={!forms.issue.values.issue}>GO</Button>
          </Form>
        </Tab>
        <Tab eventKey="redeem" title="Redeem">
          <h2>Redeem</h2>
          <p className="text-meta">Convert Sila from your selected linked wallet to dollars in your primary linked account.</p>
          <Form noValidate validated={forms.redeem.validated} autoComplete="off" className="d-flex mt-auto" onSubmit={(e) => {
            e.preventDefault();
            const amount = parseFloat(e.target.redeem.value);
            if (isNaN(amount) || amount % 1 !== 0) {
              handleFormError('redeem', 'redeem', 'Please enter a whole number');
            } else {
              setConfirm({
                show: true,
                message: `Please confirm that you would like to convert ${formatNumber(amount)} Sila from your linked wallet to $${formatNumber(amount / 100)} USD in your primary linked account.`,
                onSuccess:() => {
                  redeemSila(amount);
                  setConfirm({ show: false });
                }
              });
              setForms(defaultForms);
            }
          }}>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><i className="sila-icon sila-icon-sila"></i></InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control type="number" name="redeem" id="redeem" className="m-0" value={forms.redeem.values.redeem || ''} placeholder="# of Sila" isInvalid={forms.redeem.errors.issue ? true : false} onChange={(e) => handleChange(e, 'redeem')} />
            </InputGroup>
            {forms.redeem.errors.issue && <Form.Control.Feedback type="invalid">{forms.redeem.errors.issue}</Form.Control.Feedback>}
            <Button className="text-nowrap ml-2" variant="primary" type="submit" disabled={!forms.redeem.values.redeem}>GO</Button>
          </Form>
        </Tab>
        <Tab eventKey="transfer" title="Transfer">
          <h2>Transfer</h2>
          <p className="text-meta">Transfer sila from your selected linked wallet to another user.</p>
          <Form noValidate validated={forms.transfer.validated} autoComplete="off" className="d-flex" onSubmit={(e) => {
            e.preventDefault();
            const amount = parseFloat(e.target.transfer.value);
            const destination = e.target.destination.value;
            if (isNaN(amount) || amount % 1 !== 0) {
              handleFormError('transfer', 'transfer', 'Please enter a whole number');
            } else {
              setConfirm({
                show: true,
                message: `Please confirm that you would like to transfer ${formatNumber(amount)} Sila from your linked wallet to ${destination}.`,
                onSuccess:() => {
                  transferSila(amount, destination);
                  setConfirm({ show: false });
                }
              });
              setForms(defaultForms);
            }
          }}>
            <Row className="w-100" noGutters>
              <Col sm="12" md="6">
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text><i className="sila-icon sila-icon-sila"></i></InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control type="number" name="transfer" id="transfer" className="rounded-right-0 mb-2 mb-md-0" value={forms.transfer.values.transfer || ''} onChange={(e) => handleChange(e, 'transfer')} placeholder="# of Sila" />
                </InputGroup>
              </Col>
              <Col sm="12" md="6">
                <Form.Control name="destination" id="destination" className="rounded-left-0" value={forms.transfer.values.destination || ''} onChange={(e) => handleChange(e, 'transfer')} placeholder="Destination handle" style={{ marginLeft: '-1px' }} />
              </Col>
            </Row>
            <Button className="text-nowrap ml-2" variant="primary" type="submit" disabled={!forms.transfer.values.transfer || !forms.transfer.values.destination}>GO</Button>
          </Form>
        </Tab>
      </Tabs>}

      {app.alert.message && <div className="mt-4"><AlertMessage message={app.alert.message} style={app.alert.style} /></div>}

      <ConfirmModal show={confirm.show} message={confirm.message} onHide={() => setConfirm(defaultConfirm)} onSuccess={confirm.onSuccess} />

    </Container>
  );
};

export default Transact;