import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from './AlertMessage';

const CheckHandleForm = ({ className, defaultValue, onSuccess, disabled, page }) => {
  const [validated, setValidated] = useState(false);
  const [handle, setHandle] = useState(defaultValue || '');
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { app, api, handleError, setAppData } = useAppContext();

  const checkHandle = async (e) => {
    e.preventDefault();
    console.log('\n*** CHECK HANDLE:');
    console.log('  Waking up the API service ...');
    setIsSending(true);
    try {
      const res = await api.checkHandle(handle);
      console.log('  ... completed!');
      if (res.data.success) {
        setAlert({ message: `Success! ${res.data.message}`, type: 'success' });
        resetForm();
        onSuccess(handle);
      } else {
        if (res.data.validation_details) {
          setError(res.data.validation_details.header.user_handle);
          if (alert) setAlert(false);
        } else {
          setAlert({ message: `Error! ${res.data.message}`, type: 'danger' });
        }
      }
      setAppData({
        responses: [{
          endpoint: '/check_handle',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setValidated(true);
    setIsSending(false);
  };

  const handleChange = (e) => {
    setHandle(e.target.value.toLowerCase().replace(/\s/g, ''));
    (error || validated) && resetForm();
  };

  const resetForm = () => {
    setError(false);
    setValidated(false);
  };

  useEffect(() => {
    if (handle.length && handle.length < 3) setError('Minimum of 3 characters');
  }, [handle]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={checkHandle}>
      <Form.Group controlId="formGroupHandle">
        <Form.Control
          placeholder={`${app.settings.flow === 'kyb' && page !== '/members/register' ? 'Business' : 'User'} Handle`}
          aria-label="handle"
          value={handle}
          onChange={handleChange}
          name="handle"
          minLength="3"
          isInvalid={error}
        />
        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        <Form.Text className="text-muted">Spaces, special characters, and uppercase characters are not permitted.  Minimum of 3 characters of input required.</Form.Text>
      </Form.Group>

      <div className="d-flex mt-2">
        {alert && <AlertMessage message={alert.message} type={alert.type} onHide={() => setAlert(false)} />}
        <Button type="submit" className="ml-auto" disabled={disabled || !handle || error}>{isSending ? 'Sending...' : 'Check handle'}</Button>
      </div>
    </Form>
  );
};

export default CheckHandleForm;
