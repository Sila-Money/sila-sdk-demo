import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from './AlertMessage';

const CheckHandleForm = ({ className, defaultValue, onSuccess, disabled, page }) => {
  const [validated, setValidated] = useState(false);
  const [handle, setHandle] = useState('');
  const [error, setError] = useState(false);
  const [alert, setAlert] = useState(false);
  const { app, api, handleError, setAppData } = useAppContext();

  const checkHandle = async (e) => {
    e.preventDefault();
    console.log('\n*** CHECK HANDLE:');
    console.log('  Waking up the API service ...');
    try {
      const res = await api.checkHandle(handle);
      console.log('  ... completed!');
      if (res.data.status === 'SUCCESS') {
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
  }

  const handleChange = (e) => {
    setHandle(e.target.value.toLowerCase().replace(/\s/g, ''));
    (error || validated) && resetForm();
  }

  const resetForm = () => {
    setError(false);
    setValidated(false);
  }

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={checkHandle}>
      <Form.Group controlId="formGroupHandle">
        <Form.Control
          placeholder={`${app.settings.flow === 'kyb' && page !== '/members/register' ? 'Business' : 'User'} Handle`}
          aria-label="handle"
          defaultValue={defaultValue}
          value={handle}
          onChange={handleChange}
          name="handle"
          isInvalid={error}
        />
        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        <Form.Text className="text-muted">Spaces, uppercase characters, and lowercase characters are not permitted.</Form.Text>
      </Form.Group>

      <div className="d-flex mt-4">
        {alert && <AlertMessage message={alert.message} type={alert.type} onHide={() => setAlert(false)} />}
        <Button type="submit" className="ml-auto" disabled={disabled || !handle || (validated && !error)}>Check handle</Button>
      </div>
    </Form>
  );
};

export default CheckHandleForm;