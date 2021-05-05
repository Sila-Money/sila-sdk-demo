import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import Pagination from '../../components/common/Pagination';
import AlertMessage from '../../components/common/AlertMessage';
import RegisterUserForm from '../../components/register/RegisterUserForm';

const RegisterUser = ({ page, previous, next, isActive }) => {
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

      <h1 className="mb-4">Register User</h1>

      <p className="mb-4 text-muted text-lg">We need to gather some information to see if you meet KYC guidelines.</p>

      <p className="text-muted mb-5">This page represents <a href="https://docs.silamoney.com/docs/register" target="_blank" rel="noopener noreferrer">/register</a> functionality.</p>

      <RegisterUserForm handle={app.settings.kycHandle} onSuccess={registerUser}>

        <Alert variant="info" className="mt-4 mb-5">A wallet is automatically generated for you using the generateWallet() function upon registration.</Alert>

        <div className="d-flex">
          {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
          <Button type="submit" className="ml-auto" disabled={!app.settings.kycHandle || (app.activeUser && app.activeUser.handle === app.settings.kycHandle)}>Register user</Button>
        </div>

      </RegisterUserForm>

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />
    </Container>
  )
};

export default RegisterUser;
