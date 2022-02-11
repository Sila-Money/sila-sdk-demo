import React, { useState, useEffect } from 'react';
import { Container, Button, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { useAppContext } from '../components/context/AppDataProvider';

import Pagination from '../components/common/Pagination';
import AlertMessage from '../components/common/AlertMessage';
import KybKycModal from '../components/home/KybKycModal';

import { DEFAULT_KYC, KYB_STANDARD } from '../constants';

const RequestKYC = ({ page, previous, next }) => {
  const [certified, setCertified] = useState({ validated: false, valid: false });
  const [show, setShow] = useState(false);
  const [disabledRequestButton, setDisabledRequestButton] = useState(false);
  const { app, api, handleError, updateApp, setAppData, refreshApp } = useAppContext();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const isActive = app.success.find(success => activeUser && success.handle === activeUser.handle && success[app.settings.flow] && success.page === page) ? true : false;

  const requestKyc = async () => {
    console.log(`Requesting ${app.settings.flow.toUpperCase()} ...`);
    try {
      const kyc_level =  app.settings.flow === 'kyb' ? app.settings.preferredKybLevel : app.settings.preferredKycLevel;
      const res = await api.requestKYC(activeUser.handle, activeUser.private_key, kyc_level)
      let result = { kyc: {}, kyb: {} };
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
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
      const res = await api.checkKYC(activeUser.handle, activeUser.private_key);
      let result = { kyc: {}, kyb: {} };
      console.log('  ... completed!');
      if (res.data.verification_status.includes('passed')) {
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
        if(event === 'onclick') {
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

      setAppData({
        ...appData,
        success: res.data.verification_status.includes('passed') && !isActive ? [...app.success, { handle: activeUser.handle, [app.settings.flow]: true, page }] : app.success,
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

  useEffect(() => {
    checkKyc('onload');
  }, [])

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Request {app.settings.flow.toUpperCase()}</h1>

      <p className="text-lg text-muted mb-4">{app.settings.flow === 'kyc' ? 'We must verify that all users of the Sila platform are who they say they are, present a low fraud risk, and are not on any watchlists. We do this by submitting end-user information for KYC review by our identity verification partner, Alloy. The user will not be able to transact until the user is verified.  With great power comes great responsibility.' : 'We must verify that all users of the Sila platform are who they say they are, present a low fraud risk, and are not on any watchlists. The members of this business will be submitted for KYC review and their end-user information will be reviewed by our identity verification partner, Alloy. The business will not be able to transact until all users are verified. Additionally, the business will be submited for KYB review, to ensure that all information is correct.'}</p>

      <div className="d-lg-flex justify-content-lg-between">
        <p className="text-muted mb-4">This page represents <a href="https://docs.silamoney.com/docs/request_kyc" target="_blank" rel="noopener noreferrer">/request_kyc</a> and <a href="https://docs.silamoney.com/docs/check_kyc" target="_blank" rel="noopener noreferrer">/check_kyc</a> functionality.</p>
        <p><Button variant="link" className="text-muted font-italic p-0 text-decoration-none" onClick={() => setShow(true)}><span className="lnk">What’s the difference between KYC and KYB?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>
      </div>

      <p className="mb-5"><Button className="float-right" onClick={requestKyc} disabled={disabledRequestButton}>Request {app.settings.flow.toUpperCase()}</Button></p>

      {app[app.settings.flow].alert && (app[app.settings.flow].alert.type === 'primary' || app[app.settings.flow].alert.type === 'wait') && <Alert variant="info" className="mb-4 loaded">Verification may take a few minutes, so make sure to refresh and check your status.</Alert>}

      <div className="d-flex mb-3">
        <h2>{app.settings.flow.toUpperCase()} Review Status</h2>
        {!isActive[app.settings.flow] && <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 400 }}
          overlay={(props) => <Tooltip id={`${app.settings.flow}-tooltip`} className="ml-2" {...props}>Checks {app.settings.flow.toUpperCase()}</Tooltip>}
        >
          <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none loaded" onClick={() => checkKyc('onclick')} disabled={disabledRequestButton}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh Status</span></Button>
        </OverlayTrigger>}
      </div>

      <div className="status form-control d-flex mb-4">
        <span className={`user ${!activeUser ? 'text-muted' : 'text-primary'}`}>{activeUser ? (activeUser.entity_name || `${activeUser.firstName} ${activeUser.lastName} (${activeUser.handle})`) : app.settings.flow === 'kyb' ? 'Business Members' : 'User'}</span>
        <em className={`message ml-auto${app[app.settings.flow].alert ? ` text-${app[app.settings.flow].alert.type === 'wait' ? 'primary' : app[app.settings.flow].alert.type}` : ''}`}>{app[app.settings.flow].alert ? app[app.settings.flow].alert.message : 'Status'}</em>
      </div>

      {certified.validated && certified.valid && <Alert variant="warning" className="mb-4 loaded">Business has passed verification but needs to be certifed before it can transact.  <Button variant="link" as={NavLink} className="p-0 text-reset important ml-2" to={{ pathname: '/certify', state: { from: page } }}>Certify The Business</Button></Alert>}

      {app.alert.message && <div className="mb-4"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      {app.settings.flow === 'kyb' && <>
        <h2 className="mt-5 mb-3">KYC Review Status</h2>
        {app[app.settings.flow].members ? app[app.settings.flow].members.map((member, index) =>
          <div key={index} className="status form-control d-flex mb-4 loaded">
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
          <div className="status form-control d-flex mb-4">
            <span className="user text-muted">Business Members</span>
            <em className="message ml-auto">Status</em>
          </div>}
      </>}

      <Pagination
        previous={app.settings.flow === 'kyc' && app.settings.preferredKycLevel !== DEFAULT_KYC ? '/register_user' : app.settings.flow === 'kyb' && app.settings.preferredKybLevel !== KYB_STANDARD ? '/members' : previous}
        next={isActive ? next : undefined}
        currentPage={page} />

      <KybKycModal show={show} onHide={() => setShow(false)} />

    </Container>
  );
};

export default RequestKYC;
