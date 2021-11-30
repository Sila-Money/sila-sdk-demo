import React, { useState, useEffect } from 'react';
import { Container, CardGroup, Card, Form, Button, Row, Col, InputGroup, Tab, Nav, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { NavLink } from 'react-router-dom';

import { useAppContext } from '../components/context/AppDataProvider';

import ConfirmModal from '../components/common/ConfirmModal';
import SelectMenu from '../components/common/SelectMenu';
import AlertMessage from '../components/common/AlertMessage';
import Pagination from '../components/common/Pagination';
import TransactionsModal from '../components/transact/TransactionsModal';

const defaultForms = {
  issue: { values: {}, errors: {}, validated: false },
  transfer: { values: {}, errors: {}, validated: false },
  redeem: { values: {}, errors: {}, validated: false }
};

const defaultConfirm = { show: false, message: '', onSuccess: () => { } };

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const Transact = ({ page, previous, next, isActive }) => {
  const { app, api, setAppData, updateApp, handleError } = useAppContext();
  const userWallets = app.wallets.filter(wallet => wallet.handle === app.activeUser.handle).sort((x, y) => x.default ? -1 : y.default ? 1 : x.private_key === app.activeUser.private_key ? -1 : y.private_key === app.activeUser.private_key ? 1 : 0);
  const userAccounts = app.accounts.filter(account => account.handle === app.activeUser.handle && account.account_number);
  const [wallet, setWallet] = useState(userWallets.find(wallet => wallet.private_key === app.activeUser.private_key));
  const [account, setAccount] = useState(userAccounts[0]);
  const [balance, setBalance] = useState('Checking Balance ...');
  const [forms, setForms] = useState(defaultForms);
  const [confirm, setConfirm] = useState(defaultConfirm);
  const [showTransactions, setShowTransactions] = useState(false);

  const handleChange = (e, form) => setForms({ ...forms, [form]: { ...forms[form], values: { ...forms[form].values, [e.target.name]: e.target.value } } });
  const handleFormError = (form, name, error) => setForms({ ...forms, [form]: { ...forms[form], errors: { ...forms[form].errors, [name]: error } } });
  const handleAccount = (index) => setAccount(userAccounts[index]);
  const handleWallet = (index) => {
    setWallet(userWallets[index]);
    updateApp({ activeUser: { ...app.activeUser, private_key: userWallets[index].private_key, cryptoAddress: userWallets[index].blockchain_address } });
  };
  let updatedResponses = [];

  const refreshBalance = async () => {
    console.log('Checking Balance ...');
    setBalance('Checking Balance ...');
    try {
      const res = await api.getSilaBalance(wallet.blockchain_address);
      updatedResponses = [{ endpoint: '/get_sila_balance', result: JSON.stringify(res, null, '\t') }, ...updatedResponses];
      let result = {};
      console.log('  ... completed!');
      if (res.statusCode === 200) {
        setBalance(res.data.sila_balance);
        result.alert = { message: res.data.message, type: 'success' }
      } else {
        result.alert = { message: res.data.message, type: 'danger' }
      }
      setAppData({
        success: res.statusCode === 200 && !isActive ? [...app.success, { handle: app.activeUser.handle, page }] : app.success,
        responses: [...updatedResponses, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const issueSila = async (amount) => {
    console.log(`Issuing ${amount} Sila ...`);
    try {
      const res = await api.issueSila(amount, app.activeUser.handle, app.activeUser.private_key, account.account_name);
      updatedResponses = [{ endpoint: '/issue_sila', result: JSON.stringify(res, null, '\t') }, ...updatedResponses];
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        result.alert = { message: res.data.message, type: 'wait' };
        refreshTransactions();
        updateApp({ ...result });
      } else {
        result.alert = { message: res.data.validation_details ? res.data.validation_details.amount : res.data.message, type: 'danger' };
        setAppData({
          responses: [...updatedResponses, ...app.responses]
        }, () => {
          updateApp({ ...result });
        });
      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const redeemSila = async (amount) => {
    console.log(`Redeeming ${amount} Sila ...`);
    try {
      const res = await api.redeemSila(amount, app.activeUser.handle, app.activeUser.private_key, account.account_name);
      updatedResponses = [{ endpoint: '/redeem_sila', result: JSON.stringify(res, null, '\t') }, ...updatedResponses];
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        result.alert = { message: res.data.message, type: 'wait' };
        refreshTransactions();
        updateApp({ ...result });
      } else {
        result.alert = { message: res.data.validation_details ? res.data.validation_details.amount : res.data.message, type: 'danger' };
        setAppData({
          responses: [...updatedResponses, ...app.responses]
        }, () => {
          updateApp({ ...result });
        });
      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const transferSila = async (amount, destination) => {
    console.log(`Transferring ${amount} Sila to ${destination} ...`);
    try {
      const res = await api.transferSila(amount, app.activeUser.handle, app.activeUser.private_key, destination);
      updatedResponses = [{ endpoint: '/transfer_sila', result: JSON.stringify(res, null, '\t') }, ...updatedResponses];
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        result.alert = { message: res.data.message, type: 'wait' };
        refreshTransactions();
        updateApp({ ...result });
      } else {
        result.alert = { message: res.data.validation_details ? res.data.validation_details.amount : res.data.message, type: 'danger' };
        setAppData({
          responses: [...updatedResponses, ...app.responses]
        }, () => {
          updateApp({ ...result });
        });
      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const refreshTransactions = async (showResponse) => {
    console.log('Refreshing transactions ...');
    updateApp({ transactions: false });
    try {
      const res = await api.getTransactions(app.activeUser.handle, app.activeUser.private_key, {
        bank_account_name: account.account_name,
        blockchain_address: wallet.blockchain_address,
        per_page: 50
      });
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        result.transactions = res.data.transactions;
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      if (showResponse) {
        updatedResponses = [{ endpoint: '/get_transactions', result: JSON.stringify(res, null, '\t') }, ...updatedResponses];
      }
      updateApp({ ...result });
      refreshBalance();
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  useEffect(() => {
    setWallet(userWallets.find(wallet => wallet.private_key === app.activeUser.private_key));
  }, [app.activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refreshBalance();
  }, [wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <div className="d-flex mb-4">
        <h1 className="mb-0">Transact</h1>
        {userAccounts.length !== 0 && <Form.Group className="d-flex align-items-center ml-auto w-50">
          <Form.Label className="mr-4 mb-0 font-weight-bold" htmlFor="account">Account:</Form.Label>
          <SelectMenu fullWidth id="account" size="sm" onChange={handleAccount} options={userAccounts.map((account, index) => ({ label: account.account_name, value: index }))} />
        </Form.Group>}
      </div>

      {userAccounts.length === 0 && <Alert variant="warning" className="mb-4">An active account is required to initiate a transaction.  <NavLink to="/accounts" className="text-reset text-underline">Link an account</NavLink></Alert>}

      <p className="text-muted mb-5">This page represents <a href="https://docs.silamoney.com/docs/get_sila_balance" target="_blank" rel="noopener noreferrer">/get_sila_balance</a>, <a href="https://docs.silamoney.com/docs/issue_sila" target="_blank" rel="noopener noreferrer">/issue_sila</a>, <a href="https://docs.silamoney.com/docs/redeem_sila" target="_blank" rel="noopener noreferrer">/redeem_sila</a>, <a href="https://docs.silamoney.com/docs/transfer_sila" target="_blank" rel="noopener noreferrer">/transfer_sila</a>, and <a href="https://docs.silamoney.com/docs/get_transactions" target="_blank" rel="noopener noreferrer">/get_transactions</a>  functionality.</p>

      <div className="d-flex mb-4">
        <h2 className="mb-0">Wallet Balance</h2>
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 400 }}
          overlay={(props) => <Tooltip id="balance-tooltip" className="ml-2" {...props}>Gets Sila Balance</Tooltip>}
        >
          <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none" onClick={refreshBalance}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh</span></Button>
        </OverlayTrigger>
      </div>

      <CardGroup className="mb-5">
        <Card>
          <Form.Group className="select mb-0">
            <Card.Header className="bg-secondary p-3">
              <Form.Label className="m-0" htmlFor="wallet"><h3 className="m-0">Wallet</h3></Form.Label>
            </Card.Header>
            <Card.Body className="p-0">
              <SelectMenu fullWidth id="wallet" className="border-0 py-3 w-100 text-truncate" onChange={handleWallet} title={`${wallet.nickname ? wallet.nickname : (wallet.editing || wallet.isNew) ? 'Wallet Name' : 'Generated Wallet'}${wallet.default ? ' (Default)' : ''}`} options={userWallets.map((wallet, index) => ({ label: `${wallet.nickname ? wallet.nickname : (wallet.editing || wallet.isNew) ? 'Wallet Name' : 'Generated Wallet'}${wallet.default ? ' (Default)' : ''}`, value: index }))} />
            </Card.Body>
          </Form.Group>
        </Card>

        <Card>
          <Form.Group className="mb-0">
            <Card.Header className="bg-secondary p-3">
              <Form.Label className="m-0" htmlFor="balance"><h3 className="m-0">Amount in Sila</h3></Form.Label>
            </Card.Header>
            <Card.Body className="form-control balance p-3 border-0">
              {balance}
            </Card.Body>
          </Form.Group>
        </Card>
      </CardGroup>

      {userAccounts.length !== 0 && <h2 className="mb-4">Transactions</h2>}

      {userAccounts.length !== 0 && <Tab.Container defaultActiveKey="issue">
        <Card>
          <Card.Header className="d-flex bg-secondary">
            <Nav variant="pills" defaultActiveKey="issue">
              <Nav.Item>
                <Nav.Link className="text-lg" eventKey="issue">Issue</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="text-lg ml-2" eventKey="transfer">Transfer</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="text-lg ml-2" eventKey="redeem">Redeem</Nav.Link>
              </Nav.Item>
            </Nav>
            <Button className="ml-auto" size="sm" onClick={() => setShowTransactions(true)}>View Transactions</Button>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="issue">
                <p className="text-muted">Add Sila to your wallet by debiting a linked account. One Sila = 1¢.</p>
                <Form noValidate validated={forms.issue.validated} autoComplete="off" className="d-flex mt-auto" onSubmit={(e) => {
                  e.preventDefault();
                  const amount = parseFloat(e.target.issue.value);
                  if (isNaN(amount) || amount % 1 !== 0) {
                    handleFormError('issue', 'issue', 'Please enter a whole number');
                  } else {
                    setConfirm({
                      show: true,
                      message: `Please confirm that you would like to convert $${formatNumber(amount / 100)} USD from ${account.account_name} ending in ${account.account_number} to ${formatNumber(amount)} Sila in ${wallet.nickname}.`,
                      onSuccess: () => {
                        issueSila(amount);
                        setConfirm({ show: false });
                        setForms(defaultForms);
                      }
                    });
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
              </Tab.Pane>
              <Tab.Pane eventKey="transfer">
                <p className="text-muted">Transfer Sila from your selected linked wallet to another user.  Destination suggestions are scoped to entities created in this application, but all Sila accounts can recieve Sila.</p>
                <Form noValidate validated={forms.transfer.validated} autoComplete="off" className="d-flex" onSubmit={(e) => {
                  e.preventDefault();
                  const amount = parseFloat(e.target.transfer.value);
                  const destination = forms.transfer.values.destination.toString();
                  if (isNaN(amount) || amount % 1 !== 0) {
                    handleFormError('transfer', 'transfer', 'Please enter a whole number');
                  } else {
                    setConfirm({
                      show: true,
                      message: `Please confirm that you would like to transfer ${formatNumber(amount)} Sila from ${wallet.nickname} to ${destination}.`,
                      onSuccess: () => {
                        transferSila(amount, destination);
                        setConfirm({ show: false });
                        setForms(defaultForms);
                      }
                    });
                  }
                }}>
                  <Row className="w-100" noGutters>
                    <Col sm="12" md="6">
                      <InputGroup className="mb-2 mb-md-0">
                        <InputGroup.Prepend>
                          <InputGroup.Text><i className="sila-icon sila-icon-sila"></i></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control type="number" name="transfer" id="transfer" value={forms.transfer.values.transfer || ''} onChange={(e) => handleChange(e, 'transfer')} placeholder="# of Sila" />
                      </InputGroup>
                    </Col>
                    <Col className="destination-typeahead position-relative" sm="12" md="6">
                      <Typeahead clearButton style={{ marginLeft: '-1px' }}
                        id="destination"
                        labelKey="destination"
                        onChange={(handle) => setForms({ ...forms, transfer: { ...forms.transfer, values: { ...forms.transfer.values, destination: handle } } })}
                        options={app.users.filter(u => (!u.business_handle && !app.settings.kybAdminHandle && u.handle !== app.activeUser.handle) || (u.handle !== app.activeUser.handle && app.settings.kybAdminHandle && app.settings.kybHandle !== u.handle)).map(u => u.handle)}
                        placeholder="Destination handle"
                        allowNew={true}
                        newSelectionPrefix="New handle:"
                        selected={forms.transfer.values.destination || ['']} />
                    </Col>
                  </Row>
                  <Button className="text-nowrap ml-2" variant="primary" type="submit" disabled={!forms.transfer.values.transfer || !forms.transfer.values.destination}>GO</Button>
                </Form>
              </Tab.Pane>
              <Tab.Pane eventKey="redeem">
                <p className="text-muted">Convert Sila from your selected linked wallet to dollars in your primary linked account.</p>
                <Form noValidate validated={forms.redeem.validated} autoComplete="off" className="d-flex mt-auto" onSubmit={(e) => {
                  e.preventDefault();
                  const amount = parseFloat(e.target.redeem.value);
                  if (isNaN(amount) || amount % 1 !== 0) {
                    handleFormError('redeem', 'redeem', 'Please enter a whole number');
                  } else {
                    setConfirm({
                      show: true,
                      message: `Please confirm that you would like to convert ${formatNumber(amount)} Sila from ${wallet.nickname} to $${formatNumber(amount / 100)} USD in ${account.account_name} ending in ${account.account_number}.`,
                      onSuccess: () => {
                        redeemSila(amount);
                        setConfirm({ show: false });
                        setForms(defaultForms);
                      }
                    });
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
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>}

      {app.alert.message && <div className="mt-4"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      <Pagination hideNext
        previous={previous}
        next={next}
        currentPage={page} />

      <ConfirmModal show={confirm.show} message={confirm.message} onHide={() => setConfirm(defaultConfirm)} onSuccess={confirm.onSuccess} />
      <TransactionsModal show={showTransactions} onHide={() => setShowTransactions(false)} transactions={app.transactions} onRefresh={() => refreshTransactions(true)} formatNumber={formatNumber} />

    </Container>
  );
};

export default Transact;
