import React from 'react';
import { Form } from 'react-bootstrap';

const ReceiveOnlyKYBForm = ({ errors, isHide, app, children }) => {
  
  return (
    <div className={isHide ? 'd-none' : undefined}>
      <p className="text-right text-lg text-warning">All fields are required for this KYB level.</p>

      <Form.Group controlId="businessName" className="required">
        <Form.Control required placeholder="Legal Company Name" name="entity_name" defaultValue={app.activeUser ? app.activeUser.entity_name : undefined} isInvalid={Boolean(errors.entity && errors.entity.entity_name)} />
        {errors.entity && errors.entity.entity_name && <Form.Control.Feedback type="invalid">{errors.entity.entity_name}</Form.Control.Feedback>}
      </Form.Group>

      {children}
    </div>
  )
};

export default ReceiveOnlyKYBForm;
