import React, { useState } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import Pagination from '../../components/common/Pagination';
import RegisterUserForm from '../../components/register/RegisterUserForm';
import KycModal from '../../components/home/KycModal';
import ConfirmModal from '../../components/common/ConfirmModal';

import { INSTANT_ACH_KYC } from '../../constants';

const RegisterUser = ({ page, previous, next, isActive }) => {
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState({ show: false, message: '', onSuccess: () => { }, onHide: () => { } });
  const { app, setAppData, updateApp } = useAppContext();

  const registerUser = (user) => {
    setAppData({
      success: !isActive ? [...app.success, { handle: user.handle, page }] : app.success,
      users: [...app.users, user]
    }, () => {
      updateApp({ activeUser: user });
    });
  };

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">{app.activeUser ? 'Registered User' : 'Register User'}</h1>

      <p className="mb-1 text-muted text-lg">{app.activeUser ? "We've gathered some information to see if you meet KYC guidelines. If you'd like to add, update or delete information, you can do so here." : "We need to gather some information to see if you meet KYC guidelines."}</p>

      {app.activeUser && <p className="text-muted mb-1">This page represents <a href="https://docs.silamoney.com/docs/addregistration-data" target="_blank" rel="noopener noreferrer">/add</a>, <a href="https://docs.silamoney.com/docs/updateregistration-data" target="_blank" rel="noopener noreferrer">/update,</a> and <a href="https://docs.silamoney.com/docs/deleteregistration-data" target="_blank" rel="noopener noreferrer">/delete</a> functionality.</p>}

      {!app.activeUser && <p className="text-muted mb-1">This page represents <a href="https://docs.silamoney.com/docs/register" target="_blank" rel="noopener noreferrer">/register</a> functionality.</p>}

      <RegisterUserForm handle={app.settings.kycHandle} onSuccess={registerUser} onShowKycModal={(isShow) => setShow(isShow)} onConfirm={setConfirm}>

        {app.settings.preferredKycLevel && !app.activeUser && <Alert variant="info" className="mb-2">A wallet is automatically generated for you using the generateWallet() function upon registration.</Alert>}

        {app.settings.preferredKycLevel && !app.activeUser && <Button type="submit" className="ml-auto float-right" disabled={!app.settings.kycHandle || (app.activeUser && app.activeUser.handle === app.settings.kycHandle)}>Register user</Button>}

      </RegisterUserForm>

      <Pagination
        previous={previous}
        next={isActive ? (app.settings.preferredKycLevel === INSTANT_ACH_KYC && !app.activeUser.smsConfirmed) ? undefined : next : undefined}
        currentPage={page} />

      <KycModal show={show} onHide={() => setShow(false)} />
      <ConfirmModal show={confirm.show} message={confirm.message} onHide={confirm.onHide} buttonLabel="Delete" onSuccess={confirm.onSuccess} />

    </Container>
  )
};

export default RegisterUser;
