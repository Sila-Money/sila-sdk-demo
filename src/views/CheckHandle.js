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
        result.alert = { message: `Success! ${res.data.message}`, type: 'success' };
        resetForm();
      } else {
        if (res.data.validation_details) {
          setError(res.data.validation_details.header.user_handle);
        } else {
          result.alert = { message: `Error! ${res.data.message}`, type: 'danger' };
        }
      }
      setAppData({
        success: res.data.status === 'SUCCESS' && !app.success.includes(page) ? [...app.success, page] : app.success.filter(p => p !== page),
        responses: [{
          endpoint: '/check_handle',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
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
    if (error || validated) resetForm();
  }

  const resetForm = () => {
    setError(false);
    setValidated(false);
    updateApp({ alert: false });
  }

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page}`}>

      <h1 className="mb-4">Check user handle</h1>

      <p className="mb-4 text-lg text-meta">Create a unique handle to identify the end-user and check to ensure it is available.</p>

      <p className="text-meta mb-40">This page represents <a href="https://docs.silamoney.com/#check_handle" target="_blank" rel="noopener noreferrer">/check_handle</a> functionality.</p>

      <Form noValidate validated={validated} autoComplete="off" onSubmit={checkHandle}>
        <Form.Group controlId="formGroupHandle">
          <Form.Control
            placeholder="Handle"
            aria-label="handle"
            defaultValue={app.handle}
            onChange={handleChange}
            name="handle"
            isInvalid={error}
          />
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>

        <div className="d-flex mt-40">
          {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
          <Button type="submit" className="ml-auto" disabled={!app.handle || !app.auth.handle || (validated && !error)}>Check handle</Button>
        </div>
      </Form>

      <Pagination hidePrevious
        next={app.handle && (validated && !error) ? '/register' : undefined}
        currentPage={page} />

    </Container>
  );
};

export default CheckHandle;
