import React, { useEffect } from 'react';
import { Container, Button, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { useAppContext } from '../components/context/AppDataProvider';

import Pagination from '../components/common/Pagination';
import AlertMessage from '../components/common/AlertMessage';

const RequestKYC = ({ page }) => {
  const { app, api, handleError, updateApp, setAppData } = useAppContext();

  const requestKyc = async () => {
    console.log('Requesting KYC ...');
    try {
      const res = await api.requestKYC(app.activeUser.handle, app.activeUser.private_key)
      let result = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        result = {
          kyc: { message: 'Submitted for review', type: 'wait' },
          alert: { message: 'Submitted for KYC Review', type: 'wait' }
        };
      } else {
        result.kyc = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        success: app.success.filter(p => p !== page),
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

  const checkKyc = async () => {
    console.log('Checking KYC ...');
    try {
      const res = await api.checkKYC(app.activeUser.handle, app.activeUser.private_key);
      let result = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        result = {
          kyc: { message: 'Passed ID verification', type: 'success' },
          alert: { message: `Success! ${app.activeUser.handle} has passsed ID verifcation!`, type: 'success' }
        };
      } else {
        result = {
          kyc: !res.data.message.includes('requested') ? { message: 'Pending ID verification', type: 'primary' } : null,
          alert: res.data.message.includes('requested') ? { message: res.data.message, type: 'danger' } : { message: `${app.activeUser.handle} is still pending ID verification.`, type: 'wait' }
        };
      }
      setAppData({
        success: res.data.status === 'SUCCESS' && !app.success.includes(page) ? [...app.success, page] : app.success,
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
    if (app.success.includes(page)) updateApp({ kyc: { message: 'Passed ID verification', type: 'success' } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page}`}>

      <h1 className="mb-4">
        Request Non-documentary {/* {app.kycType[0].toUpperCase() + app.kycType.slice(1)} */} KYC
      </h1>

      <p className="text-lg text-meta mb-4">We must verify that all users of the Sila platform are who they say they are, present a low fraud risk, and are not on any watchlists. We do this by submitting end-user information for KYC review by our identity verification partner, Alloy. The user will not be able to transact until the user is verified.  With great power comes great responsibility.</p>

      <p className="text-lg text-meta mb-4">Verification may take a few minutes, so make sure to refresh and check your status.</p>

      <p className="text-meta">This page represents <a href="https://docs.silamoney.com/docs/request_kyc" target="_blank" rel="noopener noreferrer">/request_kyc</a> and <a href="https://docs.silamoney.com/docs/check_kyc" target="_blank" rel="noopener noreferrer">/check_kyc</a> functionality.</p>

      <p className="mt-40 mb-40"><Button className="float-right" onClick={requestKyc} disabled={app.success.includes(page) || app.kyc}>Request KYC</Button></p>

      {app.kyc && (app.kyc.type === 'primary' || app.kyc.type === 'wait') && <Alert variant="info" className="mb-4 loaded">While you wait for the KYC review to process, go ahead and <NavLink to="/accounts" className="text-reset text-underline">Link an account</NavLink></Alert>}

      <div className="d-flex mb-3">
        <h2>KYC Review Status</h2>
        {!app.success.includes(page) && <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 400 }}
          overlay={(props) => <Tooltip id="kyc-tooltip" className="ml-2" {...props}>Checks KYC</Tooltip>}
        >
          <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none loaded" onClick={checkKyc}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh</span></Button>
        </OverlayTrigger>}
      </div>

      <div className="status form-control d-flex">
        <span className={`user${!app.activeUser ? ' text-meta' : ''}`}>{app.activeUser ? app.activeUser.handle : 'User'}</span>
        <em className={`message ml-auto${app.kyc && Object.keys(app.kyc).length ? ` text-${app.kyc.type}` : ''}`}>{app.kyc && Object.keys(app.kyc).length ? app.kyc.message : ''}</em>
      </div>

      {app.alert.message && <div className="mt-4"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      <Pagination
        previous={!app.activeUser ? '/register' : undefined}
        next={app.success.includes(page) ? '/wallets' : undefined}
        currentPage={page} />

    </Container>
  );
};

export default RequestKYC;
