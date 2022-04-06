import React, { useState } from 'react';
import { Container } from 'react-bootstrap';

import Pagination from '../components/common/Pagination';
import CheckHandleForm from '../components/common/CheckHandleForm';

import { useAppContext } from '../components/context/AppDataProvider';

const CheckHandle = ({ page, previous, next }) => {
  const [success, setSuccess] = useState(false);
  const { app, setAppData } = useAppContext();
  const handle = app.settings.flow === 'kyc' && app.settings.kycHandle ? app.settings.kycHandle : app.settings.flow === 'kyb' && app.settings.kybHandle && app.settings.kybHandle;

  const handleSuccess = (handle) => {
    setSuccess(true);
    setAppData({
      settings: app.settings.flow === 'kyb' ? { ...app.settings, kybHandle: handle } : { ...app.settings, kycHandle: handle }
    });
  };

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">Check user handle</h1>

      <p className="mb-2 text-lg text-muted">{app.settings.flow === 'kyb' ? 'Create a unique handle to identify this business and check to ensure it is available.' : 'Create a unique handle to identify the end-user and check to ensure it is available.'}</p>

      <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/check_handle" target="_blank" rel="noopener noreferrer">/check_handle</a> functionality.</p>

      <CheckHandleForm defaultValue={handle} onSuccess={handleSuccess} />

      <Pagination
        previous={previous}
        next={(success || handle) ? next : undefined}
        currentPage={page} />

    </Container>
  );
};

export default CheckHandle;
