import React from 'react';
import { Form, Col } from 'react-bootstrap';

const ReceiveOnlyKYCForm = ({ errors, isHide, app, children }) => {
  
  return (
    <div className={isHide ? 'd-none' : undefined}>
      <p className="text-lg text-warning mb-1">All fields are required for this KYC level.</p>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerFirstName" className="required">
          <Form.Control required placeholder="First Name" name="firstName" defaultValue={app.activeUser ? app.activeUser.firstName : undefined} />
          {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerLastName" className="required">
          <Form.Control required placeholder="Last Name" name="lastName" defaultValue={app.activeUser ? app.activeUser.lastName : undefined} />
          {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      
      {children}
    </div>
  )
};

export default ReceiveOnlyKYCForm;
