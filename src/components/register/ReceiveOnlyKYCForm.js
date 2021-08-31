import React from 'react';
import { Form, Col } from 'react-bootstrap';

const ReceiveOnlyKYCForm = ({ errors, children }) => {
  
  return (
    <>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerFirstName" className="required">
          <Form.Control required placeholder="First Name" name="firstName" />
          {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerLastName" className="required">
          <Form.Control required placeholder="Last Name" name="lastName" />
          {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      
      {children}
    </>
  )
};

export default ReceiveOnlyKYCForm;
