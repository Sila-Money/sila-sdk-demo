import React from 'react';
import { Container, Button } from 'react-bootstrap';

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
          kyc: { message: 'Submitted for review', style: 'primary' }, 
          alert: { message: 'Submitted for KYC Review', style: 'primary' },
        };
      } else {
        result.kyc = { message: res.data.message, style: 'danger' };
      }
      result.success = app.success.filter(p => p !== page);
      setAppData({
        responses: [...app.responses, {
          endpoint: '/request_kyc',
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

  const checkKyc = async () => {
    console.log('Checking KYC ...');
    try {
      const res = await api.checkKYC(app.activeUser.handle, app.activeUser.private_key);
      let result = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        result = { 
          kyc: { message: 'Passed ID verification', style: 'success' }, 
          alert: { message: `Success! ${app.activeUser.handle} has passsed ID verifcation!`, style: 'success' }
        };
      } else {
        result = { 
          kyc: !res.data.message.includes('requested') ? { message: 'Pending ID verification', style: 'primary' } : {}, 
          alert: res.data.message.includes('requested') ? { message: res.data.message, style: 'danger' } : { message: `${app.activeUser.handle} is still pending ID verification.`, style: 'wait' }
        };
      }
      result.success = res.data.status === 'SUCCESS' && !app.success.includes(page) ? [...app.success, page] : app.success.filter(p => p !== page);
      setAppData({
        responses: [...app.responses, {
          endpoint: '/check_kyc',
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

  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 loaded">

      <h1 className="mb-4">
        Request Non-documentary {/* {app.kycType[0].toUpperCase() + app.kycType.slice(1)} */} KYC
      </h1>

      <p className="text-lg text-meta">We must verify that all users of the Sila platform are who they say they are, present a low fraud risk, and are not on any watchlists. We do this by submitting end-user information for KYC review by our identity verification partner, Alloy. The user will not be able to transact until the user is verified.  With great power comes great responsibility.</p>

      <p className="text-lg text-meta">Verification may take a few minutes, so make sure to refresh and check your status.</p>

      <p className="text-meta">This page represents <a href="https://docs.silamoney.com/#request_kyc" target="_blank" rel="noopener noreferrer">/request_kyc</a> and <a href="https://docs.silamoney.com/#check_kyc" target="_blank" rel="noopener noreferrer">/check_kyc</a> functionality.</p>

      <p><Button className="float-right" onClick={requestKyc} disabled={app.success.includes(page)}>Request KYC</Button></p>

      <div className="d-flex mt-5 mb-2">
        <h2>KYC Review Status</h2>
        <Button variant="link" className="p-0 ml-auto text-reset text-decoration-none" onClick={checkKyc}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk">Refresh</span></Button>
      </div>

      <div className="status form-control d-flex">
        <span className={`user${!app.activeUser ? ' text-meta' : ''}`}>{app.activeUser ? app.activeUser.handle : 'User'}</span>
        <em className={`message ml-auto${app.kyc && Object.keys(app.kyc).length ? ` text-${app.kyc.style}` : ''}`}>{app.kyc && Object.keys(app.kyc).length ? app.kyc.message : 'Status'}</em>
      </div>

      {app.alert.message && <div className="mt-4"><AlertMessage message={app.alert.message} style={app.alert.style} /></div>}

      <Pagination
        className="mt-auto pt-4"
        previous="/register"
        next={app.success.includes(page) ? '/wallets' : undefined}
        currentPage={page} />

    </Container>
  );
};

export default RequestKYC;
