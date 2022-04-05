import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Col, Button, OverlayTrigger, Tooltip, Alert, Table } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppContext } from '../components/context/AppDataProvider';

import Pagination from '../components/common/Pagination';
import AlertMessage from '../components/common/AlertMessage';
import KybKycModal from '../components/home/KybKycModal';

import { DEFAULT_KYC, KYB_STANDARD, INSTANT_ACH_KYC, MOCK_APP_HANDLES, MOCK_USER_HANDLES } from '../constants';

const RequestKYC = ({ history, page, previous, next }) => {
  const [certified, setCertified] = useState({ validated: false, valid: false });
  const [show, setShow] = useState(false);
  const [disabledRequestButton, setDisabledRequestButton] = useState(false);
  const { app, api, handleError, updateApp, setAppData, refreshApp } = useAppContext();
  const [checkPartnerKYC, setCheckPartnerKYC] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState(false);
  const [partnerAppHandle, setPartnerAppHandle] = useState();
  const [partnerUserHandle, setPartnerUserHandle] = useState();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const [partnersKYC, setPartnersKYC] = useState(app.kycPartners.filter(partner => partner.handle === activeUser.handle));
  const isActive = app.success.find(success => activeUser && success.handle === activeUser.handle && success[app.settings.flow] && success.page === page) ? true : false;
  const [isRequestedKyc, setIsRequestedKyc] = useState(false);
  const maxAttempts = 3;
  const retryInterval = 6000; // 6 seconds
  let autoRefreshCount = useRef(0);
  const isKycPassed = useRef(false);

  const requestKyc = async () => {
    console.log(`Requesting ${app.settings.flow.toUpperCase()} ...`);
    try {
      const kyc_level =  app.settings.flow === 'kyb' ? app.settings.preferredKybLevel : app.settings.preferredKycLevel;
      const res = await api.requestKYC(activeUser.handle, activeUser.private_key, kyc_level)
      let result = { kyc: {}, kyb: {} };
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        setIsRequestedKyc(true);
        result.alert = { message: `Submitted for ${app.settings.flow.toUpperCase()} Review`, type: 'wait' };
        result[app.settings.flow].alert = { message: 'Submitted for review', type: 'wait' };
      } else {
        result[app.settings.flow].alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        responses: [{
          endpoint: '/request_kyc',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  const checkKyc = async (event) => {
    console.log(`Checking ${app.settings.flow.toUpperCase()} ...`);
    try {
      if (isKycPassed.current) return;
      const res = await api.checkKYC(activeUser.handle, activeUser.private_key);
      let result = { kyc: {}, kyb: {} };
      console.log('  ... completed!');
      if (res.data.verification_status.includes('passed')) {
        isKycPassed.current = true;
        result.alert = { message: res.data.message, type: 'success' };
        result[app.settings.flow].alert = { message: 'Passed ID verification', type: 'success' };
        setCertified({ validated: true, valid: res.data.certification_history && res.data.certification_history.some(history => !history.expires_after_epoch || history.expires_after_epoch > Date.now()) && res.data.certification_status && res.data.certification_status.includes('certified') });
        refreshApp();
        const appUser = app.users.find(u => u.handle === activeUser.handle);
        const kycStatus = appUser.reviewStatus && appUser.reviewStatus.status === 'passed' && appUser.reviewStatus.level === app.settings.preferredKycLevel;
        const kybStatus = appUser.reviewStatus && appUser.reviewStatus.status === 'passed' && appUser.reviewStatus.level === app.settings.preferredKybLevel;
        setDisabledRequestButton(event === 'onclick' ? true : app.settings.flow === 'kyb' ? kybStatus : kycStatus);
      } else if (res.data.verification_status.includes('failed')) {
        result.alert = { message: res.data.message, type: 'danger' };
        result[app.settings.flow].alert = { message: 'Failed ID verification', type: 'danger' };
      } else {
        if(res.data.verification_status !== 'unverified' || event === 'onclick') {
          result.alert = res.data.message.includes('requested') ? { message: res.data.message, type: 'danger' } : { message: `${activeUser.handle} is still pending ID verification.`, type: 'wait' };
          if (!res.data.message.includes('requested')) result[app.settings.flow].alert = { message: 'Pending ID verification', type: 'warning' };
        }
      }
      if (res.data.members) {
        result[app.settings.flow].members = res.data.members;
      }

      let appData = {};
      if(event === 'onclick') {
        const updatedUserData = { ...activeUser, reviewStatus: {
          level: app.settings.flow === 'kyb' ? app.settings.preferredKybLevel : app.settings.preferredKycLevel,
          status: res.data.verification_status.includes('passed') ? 'passed' : res.data.verification_status
        }}
        appData = {
          users: app.users.map(({ active, ...u }) => u.handle === activeUser.handle ? { ...u, ...updatedUserData } : u)
        };
      }

      let appSuccessData;
      if ((app.settings.flow === 'kyc' && app.settings.preferredKycLevel === DEFAULT_KYC) || (app.settings.flow === 'kyb' && app.settings.preferredKybLevel === KYB_STANDARD)) {
        appSuccessData = res.data.verification_status !== 'unverified' && !isActive ? [...app.success, { handle: activeUser.handle, [app.settings.flow]: true, page }] : app.success;
      } else {
        appSuccessData = res.data.verification_status.includes('passed') && !isActive ? [...app.success, { handle: activeUser.handle, [app.settings.flow]: true, page }] : app.success;
      }

      setAppData({
        ...appData,
        success: appSuccessData,
        responses: [{
          endpoint: '/check_kyc',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  const toggleCheckPartnerKYC = () => {
    setPartnerAppHandle('');
    setPartnerUserHandle('');
    setValidated(false);
    updateApp({ ...app, alert: { message: '', type: '' } });
    setCheckPartnerKYC(checkPartnerKYC === false ? true : false);
  }

  const partnerAppHandleChange = (e) => {
    setValidated(false);
    setPartnerAppHandle(e.target.value.toLowerCase().replace(/\s/g, ''));
    if(e.target.value && partnerUserHandle) setValidated(true);
  };

  const partnerUserHandleChange = (e) => {
    setValidated(false);
    setPartnerUserHandle(e.target.value.toLowerCase().replace(/\s/g, ''));
    if(e.target.value && partnerAppHandle) setValidated(true);
  };

  const submitCheckPartnerKYC = async (e, app_handle, user_handle) => {
    e.preventDefault();
    app_handle = app_handle ? app_handle : partnerAppHandle;
    user_handle = user_handle ? user_handle : partnerUserHandle;

    if(app_handle && user_handle) {
      if(partnerAppHandle && partnerUserHandle) setIsSending(true);
      try {
        let result = {};
        let appData = {};
        const res = {};
        res.data = {
          success: true,
          message: "checkpartnerkycuser has passed ID verification!",
          reference: "80df8d12-2d02-4ec8-895b-866fbb22c708",
          entity_type: "individual",
          verification_status: "passed",
          valid_kyc_levels: ["DEFAULT", "DOC_KYC", "DOC_KYC_BETA", "INSTANT-ACH", "INSTANT-ACHV2", "KYC-LITE", "NONE", "RECEIVE_ONLY"],
          status: "SUCCESS",
          response_time_ms: "114"
        };
        if (res.data && res.data.validation_details) {
          setErrors(res.data.validation_details);
        } else {
          if (res.data && res.data.verification_status) {
            const statusClass = res.data.verification_status === 'passed' ? 'text-success' : res.data.verification_status === 'pending' ? 'text-primary' : res.data.verification_status === 'failed' ? 'text-danger' : 'text-primary';
            const newPartnerKYC = { ...res.data, handle: activeUser.handle, app_handle: app_handle, user_handle: user_handle, class: statusClass }

            let concatData;
            if (partnersKYC.length) {
              const partnerExists = app.kycPartners.find(partner => activeUser.handle === partner.handle && app_handle === partner.app_handle && user_handle === partner.user_handle);
              const userPartnersData = partnersKYC.map(partner => activeUser.handle === partner.handle && app_handle === partner.app_handle && user_handle === partner.user_handle ? { ...partner, ...newPartnerKYC } : partner)
              concatData = !partnerExists ? [ ...userPartnersData, newPartnerKYC ] : userPartnersData;
            } else {
              concatData = [newPartnerKYC];
            }
            setPartnersKYC(concatData);

            appData = {
              kycPartners: [ ...app.kycPartners.filter(partner => partner.handle !== activeUser.handle), ...concatData ],
            };

            const alertClass = res.data.verification_status === 'passed' ? 'success' : res.data.verification_status === 'pending' ? 'info' : res.data.verification_status === 'failed' ? 'danger' : 'info';
            result.alert = { message: res.data.message, type: alertClass };
            resetForm();
          } else {
            result.alert = { message: res.data.message, type: 'danger' };
          }
        }

        setAppData({
          ...appData,
          responses: [{
            endpoint: '/check_partner_kyc',
            result: JSON.stringify(res, null, '\t')
          }, ...app.responses]
        }, () => {
          updateApp({ ...result });
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
      setValidated(false);
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setPartnerAppHandle('');
    setPartnerUserHandle('');
    setErrors(false);
  };

  useEffect(() => {
    checkKyc('onload');
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let timeoutId;
    function autoRefreshKYCStatus() {
      if (autoRefreshCount.current === maxAttempts || disabledRequestButton) {
        clearTimeout(timeoutId);
        return;
      }
      autoRefreshCount.current = autoRefreshCount.current + 1;
      checkKyc('onclick');
    }
    if(isRequestedKyc && !disabledRequestButton) timeoutId = setInterval(autoRefreshKYCStatus, retryInterval);
  }, [isRequestedKyc, disabledRequestButton]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (app.settings.flow === 'kyc' && app.settings.preferredKycLevel === INSTANT_ACH_KYC && app.activeUser && !app.activeUser.smsConfirmed) {
      history.push({ pathname: '/register_user', state: { from: page } });
    }
  }, [app, history, page]);

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      {!checkPartnerKYC && <>
        <h1 className="mb-1">Request {app.settings.flow.toUpperCase()}</h1>

        <p className="text-lg text-muted mb-1">{app.settings.flow === 'kyc' ? 'We must verify that all users of the Sila platform are who they say they are, present a low fraud risk, and are not on any watchlists. We do this by submitting end-user information for KYC review by our identity verification partner, Alloy. The user will not be able to transact until the user is verified.  With great power comes great responsibility.' : 'We must verify that all users of the Sila platform are who they say they are, present a low fraud risk, and are not on any watchlists. The members of this business will be submitted for KYC review and their end-user information will be reviewed by our identity verification partner, Alloy. The business will not be able to transact until all users are verified. Additionally, the business will be submited for KYB review, to ensure that all information is correct.'}</p>

        <div className="d-lg-flex justify-content-lg-between">
          <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/request_kyc" target="_blank" rel="noopener noreferrer">/request_kyc</a> and <a href="https://docs.silamoney.com/docs/check_kyc" target="_blank" rel="noopener noreferrer">/check_kyc</a> functionality.</p>
          <p className="mb-3"><Button variant="link" className="text-muted font-italic p-0 text-decoration-none" onClick={() => setShow(true)}><span className="lnk">What’s the difference between KYC and KYB?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>
        </div>

        <p className="mb-2"><Button className="float-right" onClick={requestKyc} disabled={disabledRequestButton}>Request {app.settings.flow.toUpperCase()}</Button></p>

        {app[app.settings.flow].alert && (app[app.settings.flow].alert.type === 'primary' || app[app.settings.flow].alert.type === 'wait') && <Alert variant="info" className="mb-4 loaded">Verification may take a few minutes, so make sure to refresh and check your status.</Alert>}

        <div className="d-flex mb-2">
          <h2 className="mb-0">{app.settings.flow.toUpperCase()} Review Status</h2>
          {!isActive[app.settings.flow] && <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => <Tooltip id={`${app.settings.flow}-tooltip`} className="ml-2" {...props}>Checks {app.settings.flow.toUpperCase()}</Tooltip>}
          >
            <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none loaded" onClick={() => checkKyc('onclick')} disabled={disabledRequestButton}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh Status</span></Button>
          </OverlayTrigger>}
        </div>

        <div className="status form-control d-flex mb-2">
          <span className={`user ${!activeUser ? 'text-muted' : 'text-primary'}`}>{activeUser ? (activeUser.entity_name || `${activeUser.firstName} ${activeUser.lastName} (${activeUser.handle})`) : app.settings.flow === 'kyb' ? 'Business Members' : 'User'}</span>
          <em className={`message ml-auto${app[app.settings.flow].alert ? ` text-${app[app.settings.flow].alert.type === 'wait' ? 'primary' : app[app.settings.flow].alert.type}` : ''}`}>{app[app.settings.flow].alert ? app[app.settings.flow].alert.message : 'Status'}</em>
        </div>

        {certified.validated && certified.valid && <Alert variant="warning" className="mb-4 loaded">Business has passed verification but needs to be certifed before it can transact.  <Button variant="link" as={NavLink} className="p-0 text-reset important ml-2" to={{ pathname: '/certify', state: { from: page } }}>Certify The Business</Button></Alert>}

        {app.alert.message && <div className="mb-2"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

        {app.settings.flow === 'kyb' && <>
          <h2 className="mt-2 mb-2">KYC Review Status</h2>
          {app[app.settings.flow].members ? app[app.settings.flow].members.map((member, index) =>
            <div key={index} className="status form-control d-flex mb-2 loaded">
              <span className="user"><span className="text-primary">{`${member.first_name} ${member.last_name} (${member.user_handle})`}</span> <span className="mx-2">&ndash;</span> <em>{app.settings.kybRoles.find(role => role.name === member.role).label}</em></span>
              {member.verification_status.includes('passed') ? 
              <em className="message ml-auto text-success">Passed ID verification</em> : 
              member.verification_status.includes('pending') ? 
              <em className="message ml-auto text-warning">Pending ID verification</em> : 
              member.verification_status.includes('unverified') && member.role === 'administrator' ? 
              <em className="message ml-auto text-success">Verification not required</em> : 
              member.verification_status.includes('unverified') ? 
              <em className="message ml-auto text-warning">Unverified ID verification</em> : 
              member.verification_status.includes('failed') ?
              <em className="message ml-auto text-danger">Failed ID verification</em> : null}
            </div>
          ) :
            <div className="status form-control d-flex mb-2">
              <span className="user text-muted">Business Members</span>
              <em className="message ml-auto">Status</em>
            </div>}
        </>}

        <h2 className="mb-1 mt-2">Check Partner {app.settings.flow.toUpperCase()}</h2>
        <p className="text-lg text-muted mb-4">Returns whether entity attached to partnered app is verified, not valid, or still pending. <Button variant="link" className="p-0 new-registration shadow-none" onClick={toggleCheckPartnerKYC} disabled={!certified.validated}>Check Partner {app.settings.flow.toUpperCase()} <FontAwesomeIcon icon={faArrowRight} className="ml-2" /></Button></p>
      </>}

      {checkPartnerKYC && <>
        <h1 className="mb-1">Check Partner {app.settings.flow.toUpperCase()}</h1>
        <p className="text-lg text-muted mb-2">This endpoint is used to check KYC status of end-users across apps. For example, if app A is seeking to enable services for their users through App B, then App B has a need to verify that the users have been KYC'd and have passed.</p>
        <p className="text-lg text-muted mb-2 font-weight-bold">In production, this endpoint must be enabled by a support request to Sila to establish the mapping between apps.  If you are interested in a partnership opportunity with Sila, please reach out to us <a href="https://sila.atlassian.net/servicedesk/customer/portals" target="_blank" rel="noopener noreferrer" className="new-registration">here</a>!</p>
        <p className="text-lg text-muted mb-2">To check the verification status of an end-user on a partner app, you must specify by the app handle and user handle below.</p>
        <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/check_partner_kyc" target="_blank" rel="noopener noreferrer">/check_partner_kyc</a> functionality.</p>
        <Form noValidate validated={validated} autoComplete="off" onSubmit={submitCheckPartnerKYC}>
          <Form.Row>
            <Form.Group as={Col} md="6" controlId="partnerAppHandle" className="required">
              <Form.Control required as="select" name="partnerAppHandle" value={partnerAppHandle} onChange={partnerAppHandleChange} isInvalid={Boolean(errors && errors.query_app_handle)}>
                <option value="">Select App handle</option>
                {MOCK_APP_HANDLES.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
              </Form.Control>
              {errors && <Form.Control.Feedback type="invalid">{errors.query_app_handle}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="partnerUserHandle" className="required">
              <Form.Control required as="select" name="partnerUserHandle" value={partnerUserHandle} onChange={partnerUserHandleChange} isInvalid={Boolean(errors && errors.query_user_handle)}>
                <option value="">Select User handle</option>
                {MOCK_USER_HANDLES.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
              </Form.Control>
              {errors && <Form.Control.Feedback type="invalid">{errors.query_user_handle}</Form.Control.Feedback>}
            </Form.Group>
          </Form.Row>
          <div className="d-flex">
            <Button type="submit" className="ml-auto mr-3" disabled={!validated}>{isSending ? 'Sending...' : 'Check Partner KYC'}</Button>
            <Button variant="outline-light" className="p-2 px-4" onClick={toggleCheckPartnerKYC}>Cancel</Button>
          </div>
        </Form>

        {partnersKYC.length > 0 && <>
          <div className="d-flex mb-3 mt-3">
            <h2>Partner {app.settings.flow.toUpperCase()} Status</h2>
            {!isActive[app.settings.flow] && partnersKYC.length === 1 && <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => <Tooltip id={`${app.settings.flow}-tooltip`} className="ml-2" {...props}>Checks {app.settings.flow.toUpperCase()}</Tooltip>}
            >
              <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none loaded" onClick={(e) => submitCheckPartnerKYC(e, partnersKYC[0]['app_handle'], partnersKYC[0]['user_handle'])} disabled={partnersKYC[0]['verification_status'] === 'passed'}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh Status</span></Button>
            </OverlayTrigger>}
          </div>
          <Table bordered responsive>
            <thead>
              <tr>
                <th className="text-lg bg-secondary text-dark font-weight-bold">App Handle</th>
                <th className="text-lg bg-secondary text-dark font-weight-bold">User Handle</th>
                <th className="text-lg bg-secondary text-dark font-weight-bold">Status</th>
                {partnersKYC.length > 1 && <th className="text-lg bg-secondary text-dark font-weight-bold text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {partnersKYC.map((partnerKYC, index) =>
                <tr className="loaded" key={index}>
                  <td>{partnerKYC.app_handle}</td>
                  <td>{partnerKYC.user_handle}</td>
                  <td><span className={partnerKYC.class}>{partnerKYC.message}</span></td>
                  {partnersKYC.length > 1 && <td className="text-center">
                    <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={(props) => <Tooltip id={`${app.settings.flow}-tooltip`} className="ml-2" {...props}>Refresh Status</Tooltip>}>
                      <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none loaded" onClick={(e) => submitCheckPartnerKYC(e, partnerKYC.app_handle, partnerKYC.user_handle)} disabled={partnerKYC.verification_status === 'passed'}>
                        <i className="sila-icon sila-icon-refresh text-primary mr-2"></i>
                      </Button>
                    </OverlayTrigger>
                  </td>}
                </tr>
              )}
            </tbody>
          </Table>
        </>}
        {app.alert.message && <div className="d-flex mt-2"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}
      </>}

      <Pagination
        previous={previous}
        next={isActive ? app.settings.flow === 'kyc' && app.settings.preferredKycLevel !== DEFAULT_KYC ? '/wallets' : app.settings.flow === 'kyb' && app.settings.preferredKybLevel !== KYB_STANDARD ? '/certify' : next : undefined}
        currentPage={page} />

      <KybKycModal show={show} onHide={() => setShow(false)} />

    </Container>
  );
};

export default RequestKYC;
