import React from 'react';
import { Form, Col } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { STATES_ARRAY } from '../../constants';

const StandardKYBForm = ({ errors, app, children }) => {
  
  return (
    <>
      <p className="text-lg text-warning mb-1">All fields are required for this KYB level.</p>

      <Form.Row>
        <Form.Group as={Col} md="6" controlId="businessName" className="required">
          <Form.Control required placeholder="Legal Company Name" name="entity_name" defaultValue={app.activeUser ? app.activeUser.entity_name : undefined} isInvalid={Boolean(errors.entity && errors.entity.entity_name)} />
          {errors.entity && errors.entity.entity_name && <Form.Control.Feedback type="invalid">{errors.entity.entity_name}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="businessEmail" className="required">
          <Form.Control required type="email" placeholder="Business Email" name="email" defaultValue={app.activeUser ? app.activeUser.email : undefined} isInvalid={Boolean(errors.contact && errors.contact.email)} />
          {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Group controlId="businessAddress" className="required">
        <Form.Control required placeholder="Street Address" name="address" defaultValue={app.activeUser ? app.activeUser.address : undefined} isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
        {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Row>
        <Form.Group as={Col} md="4" controlId="businessCity" className="required">
          <Form.Control required  placeholder="City" name="city" defaultValue={app.activeUser ? app.activeUser.city : undefined} isInvalid={Boolean(errors.address && errors.address.city)} />
          {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="businessState" className="select required">
          <Form.Control required as="select" name="state" defaultValue={app.activeUser ? app.activeUser.state : undefined} isInvalid={Boolean(errors.address && errors.address.state)}>
            <option value="">State</option>
            {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
          </Form.Control>
          {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="businessZip" className="required">
          <Form.Control required placeholder="Zip" name="zip" defaultValue={app.activeUser ? app.activeUser.zip : undefined} isInvalid={Boolean(errors.address && errors.address.postal_code)} />
          {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="businessPhone" className="required">
          <Form.Control required name="phone" type="tel" defaultValue={app.activeUser ? app.activeUser.phone : undefined} as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors.contact && errors.contact.phone)} />
          {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="businessEIN" className="required">
          <Form.Control required placeholder="Employer ID Number (EIN) 12-3456789" name="ein" defaultValue={app.activeUser ? app.activeUser.ein : undefined} isInvalid={Boolean(errors.identity)} />
          {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>

      {children}
    </>
  )
};

export default StandardKYBForm;
