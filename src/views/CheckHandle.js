import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import AlertMessage from '../components/common/AlertMessage';
import Pagination from '../components/common/Pagination';

const CheckHandle = ({ page }) => {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(false);
  const { app, api, handleError, updateApp, setAppData } = useAppContext();

  const checkHandle = async (e) => {
    e.preventDefault();
    console.log('\n*** CHECK HANDLE:');
    console.log('  Waking up the API service ...');
    try {
      const res = await api.checkHandle(app.handle);
      let result = {};
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
        result = { 
          alert: { message: 'Success! Handle available.', style: 'success' },
          success: [...app.success, page]
        };
        resetForm();
      } else {
        const errorMessage = res.data.validation_details ? res.data.validation_details.header.user_handle : 'Error! Handle is taken.';
        result = { 
          alert: { message: errorMessage, style: 'danger' },
          success: app.success.filter(p => p !== page)
        };
        setError(errorMessage);
      }
      setAppData({
        responses: [...app.responses, {
          endpoint: '/check_handle',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setValidated(true);
  }

  const handleChange = (e) => {
    updateApp({ handle: e.target.value });
    resetForm();
  }

  const resetForm = () => {
    setError(false);
    setValidated(false);
    updateApp({ alert: false });
  }

  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 loaded">

      <h1 className="mb-4">Check user handle</h1>

      <p className="mb-4 text-lg text-meta">Create a unique handle to identify the end-user and check to ensure it is available.</p>

      <p className="text-meta">This page represents <a href="https://docs.silamoney.com/#check_handle" target="_blank" rel="noopener noreferrer">/check_handle</a> functionality.</p>

      <Form noValidate validated={validated} autoComplete="off" onSubmit={checkHandle}>
        <Form.Group controlId="formGroupHandle">
          <Form.Control
            placeholder="handle"
            aria-label="handle"
            defaultValue={app.handle}
            onChange={handleChange}
            name="handle"
            isInvalid={error}
          />
        </Form.Group>

        <div className="d-flex mt-4">
          {app.alert.message && <AlertMessage message={app.alert.message} style={app.alert.style} />}
          <Button type="submit" className="ml-auto" disabled={!app.handle || !app.auth.handle}>Check handle</Button>
        </div>
      </Form>

      <Pagination hidePrevious
        className="mt-auto pt-4"
        next={app.success.includes(page) ? '/register' : undefined}
        currentPage={page} />

    </Container>
  );
};

export default CheckHandle;
