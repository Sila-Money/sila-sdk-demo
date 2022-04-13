import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Button, Row, Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import LinkAccountModal from '../components/accounts/LinkAccountModal';
import ProcessorTokenModal from '../components/accounts/ProcessorTokenModal';
import InstitutionsModal from '../components/accounts/InstitutionsModal';
import ProcessorTokenFlowModal from '../components/accounts/ProcessorTokenFlowModal';
import ConfirmModal from '../components/common/ConfirmModal';

const Accounts = ({ page, previous, next, isActive }) => {
  const { app, api, setAppData, updateApp, handleError } = useAppContext();
  const [plaidToken, setPlaidToken] = useState(false);
  const [loaded, setLoaded] = useState(plaidToken);
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const [accounts, setAccounts] = useState(app.accounts.filter(account => account.handle === activeUser.handle));
  const [activeRow, setActiveRow] = useState({ isEditing: false, isDeleting: false, rowNumber: '', account_name: '', new_account_name: '', status: '' });
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState(undefined);
  const [confirm, setConfirm] = useState({ show: false, message: '', onSuccess: () => { }, onHide: () => { } });
  const [showInstitution, setShowInstitution] = useState(false);
  const [institutions, setInstitutions] = useState({data: [], total_count:0, total_pages: 0, perPage: 100} );
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState(false);
  const [processorTokenFlowModal, setProcessorTokenFlowModal] = useState(false);
  const tbodyRef = useRef()
  let result = {};
  let appData = {};
  let updatedResponses = [];

  const getAccountBalance = async (newAccounts) => {
    console.log('Checking Account Balance ...');
    let counter = 0;
    let accountsWithBalance = [];
    newAccounts.map( async (acc, i) => {
      const resAccountBalance = await api.getAccountBalance(activeUser.handle, activeUser.private_key, acc.account_name);
      let account;
      if (resAccountBalance.statusCode === 200) {
        counter++;
        account = { ...acc, current_balance: resAccountBalance.data.current_balance };
      } else {
        counter++;
        account = { ...acc, current_balance: resAccountBalance.data.message };
      }
      accountsWithBalance = [...accountsWithBalance, account];
      if(newAccounts.length === counter) {
        setAccounts(accountsWithBalance);
      }
    });
  };

  const getAccounts = async (resObj) => {
    console.log('Getting Accounts ...');
    setLoaded(false);
    try {
      if (resObj) updatedResponses = [resObj, ...updatedResponses];
      const res = await api.getAccounts(activeUser.handle, activeUser.private_key);
      updatedResponses = [{ endpoint: '/get_accounts', result: JSON.stringify(res, null, '\t') }, ...updatedResponses];
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
        responses: [...updatedResponses, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
      if (newAccounts.length > 0) getAccountBalance(newAccounts);
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
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

  const onEditToggle = (rowIndex, accountName, accountStatus) => {
    setError(undefined);
    setIsChecked(accountStatus);
    setActiveRow({
      ...activeRow,
      isEditing: (activeRow.isEditing && activeRow.rowNumber === rowIndex) ? false : true,
      rowNumber: (activeRow.isEditing && activeRow.rowNumber === rowIndex) ? '' : rowIndex,
      account_name: (activeRow.isEditing && activeRow.rowNumber === rowIndex) ? '' : accountName,
      new_account_name: (activeRow.isEditing && activeRow.rowNumber === rowIndex) ? '' : accountName,
      status: (activeRow.isEditing && activeRow.rowNumber === rowIndex) ? '' : accountStatus,
    });
  }

  const onEditing = (e) => {
    setActiveRow({...activeRow, new_account_name: e.target.value || undefined});
  }

  const onStatusToggle = async (isChecked) => {
    setIsChecked(isChecked);
  };

  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      onSave(activeRow.rowNumber);
    }
  }

  const onSave = async (rowIndex) => {
    if (!activeRow.new_account_name) setError("This field may not be blank.");
    if (activeRow.isEditing && (!activeRow.account_name || !activeRow.new_account_name)) return;

    if (activeUser && activeUser.handle) {
      setError(undefined);
      setLoaded(false);
      const accountPayloadData = {};
      if (activeRow.new_account_name && activeRow.account_name !== activeRow.new_account_name) accountPayloadData.new_account_name = activeRow.new_account_name;
      if (activeRow.status !== isChecked) accountPayloadData.active = isChecked;

      if (Object.keys(accountPayloadData).length) {
        accountPayloadData.account_name = activeRow.account_name;
        let error_message;
        let bankAccounts = accounts;
        const res = await api.updateAccount(accountPayloadData, activeUser.handle, activeUser.private_key);
        if (res.statusCode === 200 && res.data.success) {
          let updatedAccount = { ...accounts[rowIndex], account_name: activeRow.new_account_name, active: res.data.account.active, account_status: res.data.account.account_status, account_link_status: res.data.account.account_link_status };
          delete accounts[rowIndex];
          let accountsList = [...accounts, ...[updatedAccount]];
          bankAccounts = accountsList.filter(acc => acc !== undefined);
          setAccounts(bankAccounts);
          setActiveRow({...activeRow, isEditing: false, isDeleting: false, rowNumber: '', account_name: '', new_account_name: '', status: '' });

          appData = {
            accounts: [...app.accounts.filter(acc => acc.handle !== activeUser.handle), ...bankAccounts]
          };
          result.alert = { message: 'Account was successfully updated and saved.', type: 'success' };
        } else {
          if (res.data && res.data.validation_details) {
            if (res.data.validation_details.account_name) error_message = res.data.validation_details.account_name;
            if (res.data.validation_details.new_account_name) error_message = res.data.validation_details.new_account_name;
          }
          if (!error_message) error_message = res.data.message;
          setError(error_message);
          result.alert = { message: res.data.message, type: 'danger' };
        }

        setAppData({
          ...appData,
          responses: [{
            endpoint: '/update_account',
            result: JSON.stringify(res, null, '\t')
          }, ...app.responses]
        }, () => {
          updateApp({ ...result });
        });
      }
      setLoaded(true);
    }
  }

  const onDelete = async (rowIndex, account_name) => {
    setActiveRow({...activeRow, isDeleting: true, rowNumber: rowIndex });

    if (activeUser && account_name) {
      setConfirm({ show: true, message: `Are you sure you want to delete the linked bank account named "${account_name}"?`, onSuccess: async () => {
        setLoaded(false);
        setConfirm({show: false, message: ''});
        try {
          const res = await api.deleteAccount(activeUser.handle, account_name, activeUser.private_key);
          if (res.statusCode === 200 && res.data.success) {
            delete accounts[rowIndex];
            let bankAccounts = accounts.filter(acc => acc !== undefined);
            setAccounts(bankAccounts);

            appData = {
              accounts: [...app.accounts.filter(acc => acc.handle !== activeUser.handle), ...bankAccounts]
            };
            result.alert = { message: res.data.message, type: 'success' };
          } else {
            result.alert = { message: res.data.message, type: 'danger' };
          }

          setAppData({
            ...appData,
            responses: [{
              endpoint: '/delete_account',
              result: JSON.stringify(res, null, '\t')
            }, ...app.responses]
          }, () => {
            updateApp({ ...result });
          });

        } catch (err) {
          console.log(`  ... unable to delete bank account ${account_name}, looks like we ran into an issue!`);
          handleError(err);
        }

        setActiveRow({...activeRow, isEditing: false, isDeleting: false, rowNumber: '', account_name: '', new_account_name: '', status: '' });
        setLoaded(true);
      }, onHide: () => {
        setConfirm({show: false, message: ''});
        setActiveRow({...activeRow, isEditing: false, isDeleting: false, rowNumber: '', account_name: '', new_account_name: '', status: '' });
      } })
    }
  }

  const getInstitutions = async (filter, page) => {
    try {
      setIsFetching(true);
      let concatData;
      let search_filters = {
        page: page ? page : 1,
        per_page: institutions.perPage
      };
      if (filter && filter['institution_name']) search_filters['institution_name'] = filter['institution_name'];
      if (filter && filter['routing_number']) search_filters['routing_number'] = filter['routing_number'];

      const res = await api.getInstitutions(search_filters);
      if (res.data.success) {
        setErrors(false);
        if (search_filters['page'] === 1) concatData = res.data.institutions;
        else concatData = [ ...institutions.data, ...res.data.institutions ];
        setInstitutions({ ...institutions, data: concatData, total_count: res.data.total_count, total_pages: res.data.pagination.total_pages });
      } else {
        setErrors(res.data.validation_details ? res.data.validation_details : false);
      }
      setIsFetching(false);
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const onResponse = async (resObj) => {
    if (resObj) {
      setAppData({
        responses: [resObj, ...app.responses]
      });
    }
  }

  const onShowProcessorTokenModal = () => {
    setProcessorTokenFlowModal(false);
    updateApp({ manageProcessorToken: true });
  }

  useEffect(() => {
    getAccounts();
  }, [app.activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (accounts.length && !isActive) setAppData({ success: [...app.success, { handle: activeUser.handle, page }] });
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getPlaidLinkToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (activeRow.isEditing && tbodyRef.current && !tbodyRef.current.contains(e.target)) {
        setActiveRow({...activeRow, isEditing: false, rowNumber: '', account_name: '', new_account_name: '', status: ''});
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [activeRow])

  useEffect(() => {
    getInstitutions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">Link a Bank Account</h1>

      <p className="text-muted text-lg mb-1">We've partnered with Plaid to connect bank accounts to the Sila platform. This helps us ensure account ownership.</p>
     
      <p className="text-muted text-lg mb-1">Connect via Account Routing: We also have the ability to connect bank accounts with just an account and routing number "This feature required Compliance Approval for processing"</p>

      <p className="text-muted text-lg mb-1">Connect Via Plaid Link" The Sila will support Legacy public token and Link integration for the near term, however, this functionality is marked for deprecation.</p>

      <p className="text-muted text-lg mb-1">Connect via Processor Token: Please seek a direct relationship with Plaid to use our Processor Token functionality</p>

      <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/get_accounts" target="_blank" rel="noopener noreferrer">/get_accounts</a>, <a href="https://docs.silamoney.com/docs/get_institutions" target="_blank" rel="noopener noreferrer">/get_institutions</a>, <a href="https://docs.silamoney.com/docs/plaid_link_token" target="_blank" rel="noopener noreferrer">/plaid_link_token</a>, <a href="https://docs.silamoney.com/docs/link_account" target="_blank" rel="noopener noreferrer">/link_account</a>, <a href="https://docs.silamoney.com/docs/delete_account-1" target="_blank" rel="noopener noreferrer">/delete_account</a>, and <a href="https://docs.silamoney.com/docs/plaid_sameday_auth" target="_blank" rel="noopener noreferrer">/plaid_sameday_auth</a> functionality.</p>

      <div className="d-flex mb-2">
        <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none loaded" onClick={() => getAccounts(undefined)}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh</span></Button>
      </div>

      <div className="accounts position-relative mb-3">
        {(!loaded || !plaidToken) && <Loader overlay />}
        <Table bordered responsive>
          <thead>
            <tr>
              <th className="text-lg bg-secondary text-dark font-weight-bold text-nowrap">Account #</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold">Name</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold">Type</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold">Balance</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold">Status</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {loaded && plaidToken && accounts.length > 0 ?
              accounts.map((acc, index) =>
                <tr className="loaded" key={index}>
                  <td>
                    <div className="d-flex justify-content-between">
                      {acc.account_number}
                      <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }}
                        overlay={(props) => <Tooltip id={`account-number-tooltip-${index}`} {...props}>Linked via {acc.account_link_status === 'processor_token' ? 'Processor Token' : 'Account/Routing'}</Tooltip>}>
                        <Button variant="link" className="text-reset font-italic p-0 m-0 text-decoration-none shadow-none">
                          <i className="sila-icon sila-icon-info text-primary ml-2"></i>
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                  <td className="text-break">{activeRow.isEditing && activeRow.rowNumber === index ? <Form.Group controlId="accountNumber" className="required mb-0">
                    <Form.Control required placeholder="Account Name" name="account_number" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={acc.account_name ? acc.account_name : undefined} isInvalid={Boolean(error)} />
                    {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
                    </Form.Group> : acc.account_name}</td>
                  <td>{acc.account_type}</td>
                  <td>{ acc.current_balance ? typeof(acc.current_balance) !== 'string' ? `$${acc.current_balance}` : acc.current_balance : 'Checking Balance ...'}</td>
                  <td className="text-left">
                    {activeRow.isEditing && activeRow.rowNumber === index ? <span id="acc-status-toggle" className="d-flex">
                        <Form.Check type="switch" id="acc-status-switch" onChange={(e) => onStatusToggle(e.target.checked)} checked={isChecked} />
                        <Form.Label className="text-nowrap" htmlFor="acc-status-switch">{isChecked ? 'Active' : 'Inactive'}</Form.Label>
                      </span> : <>
                        {(acc.account_link_status === 'instantly_verified' || acc.account_link_status === 'microdeposit_manually_verified' || acc.account_link_status === 'unverified_manual_input' || acc.account_link_status === 'processor_token') && <span className={acc.active ? 'text-success' : 'text-danger'}>{acc.active ? 'Active' : 'Inactive'}</span>}
                        {acc.account_link_status === 'microdeposit_pending_automatic_verification' && <span className="text-warning">Pending...</span>}
                        {acc.account_link_status === 'microdeposit_pending_manual_verification' && (!plaidToken || plaidToken.account_name !== acc.account_name) && <Button size="sm" variant="secondary" disabled={plaidToken} onClick={() => plaidSamedayAuth(acc.account_name)}>Manually Approve</Button>}
                    </>}
                  </td>
                  <td className="text-center">
                    <div className="d-flex py-2 justify-content-center">
                      <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-1 px-1" onClick={() => onEditToggle(index, acc.account_name, acc.active)}>
                        <i className={`sila-icon sila-icon-edit text-lg ${activeRow.isEditing && activeRow.rowNumber === index ? 'text-primary' : ''}`}></i>
                      </Button>
                      {(activeRow.isEditing && activeRow.rowNumber === index) ? <Button className="p-1 text-decoration-none mx-1 px-1" onClick={(e) => onSave(index)} disabled={(activeRow.isEditing && activeRow.new_account_name === activeRow.account_name && activeRow.status === isChecked) ? true : false }>Save</Button> : <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-2 px-2" onClick={(e) => onDelete(index, acc.account_name)}><i className={`sila-icon sila-icon-delete text-lg ${(activeRow.isDeleting && activeRow.rowNumber === index) ? 'text-primary' : undefined }`}></i></Button>}
                    </div>
                  </td>
                </tr>
              ) :
              <tr className="loaded">
                {loaded && plaidToken && accounts.length === 0 ? <td><em>No account linked</em></td> : <td>&nbsp;</td>}
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            }
          </tbody>
        </Table>
        {accounts.find(acc => acc.account_link_status === 'microdeposit_pending_manual_verification') && <p className="text-muted mt-4">With Same Day Micro-deposits, Plaid verfies the deposit within 1 business days Within the Sandbox timeframe, it’s only takes a few minutes. To jump back into your session, we’ll need you to retrieve a public token from Plaid. From there, two microdeposits should appear in your account within minutes. We will need you to verify the amount of these depsoits in order to launch Phase 2.</p>}
      </div>

      {plaidToken && <div className="d-block d-xl-flex align-items-center mb-2 loaded">
        <div className="ml-auto">
          <Row>
            <Col lg="12" xl="6"><Button block className="mb-2 text-nowrap" onClick={() => updateApp({ manageLinkAccount: true })}>Enter Account/Routing</Button></Col>
            <Col lg="12" xl="6"><Button block className="mb-2 text-nowrap" onClick={() => setProcessorTokenFlowModal(true)}>Processor Token Flow</Button></Col>
          </Row>
        </div>
      </div>}

      <p className="text-right loaded mb-2">
        <Button variant="link" className="text-reset font-italic p-0 mr-5 text-decoration-none" onClick={() => setShowInstitution(true)}><span className="lnk">Which institutions are supported by Plaid?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button>
        <Button variant="link" className="text-reset font-italic p-0 text-decoration-none" href="https://dashboard.plaid.com/signin" target="_blank" rel="noopener noreferrer"><span className="lnk">How do I login to Plaid?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button>
      </p>

      {app.alert.message && <div className="mb-2"><AlertMessage message={app.alert.message} type={app.alert.type} noIcon={app.alert.noIcon} loading={app.alert.loading} /></div>}

      <Pagination
        previous={previous}
        next={(isActive || accounts.length) ? next : undefined}
        currentPage={page} />

      <LinkAccountModal show={app.manageLinkAccount} onSuccess={getAccounts} onResponse={onResponse} />

      <ProcessorTokenModal show={app.manageProcessorToken} onSuccess={getAccounts} onResponse={onResponse} />

      <ConfirmModal show={confirm.show} message={confirm.message} onHide={confirm.onHide} buttonLabel="Delete" onSuccess={confirm.onSuccess} />

      <InstitutionsModal institutions={institutions} errors={errors} isFetching={isFetching} show={showInstitution} onSearch={(filter, page) => getInstitutions(filter, page)} onClose={() => setShowInstitution(false)} />

      <ProcessorTokenFlowModal show={processorTokenFlowModal} onShowProcessorTokenModal={onShowProcessorTokenModal} onHide={() => setProcessorTokenFlowModal(false)} />

    </Container>
  );
};

export default Accounts;
