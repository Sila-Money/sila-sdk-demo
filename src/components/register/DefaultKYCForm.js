import React from 'react';
import { Form, Col } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { STATES_ARRAY } from '../../constants';

const DefaultKYCForm = ({ errors, isHide, app, children }) => {
  
  return (
    <div className={isHide ? 'd-none' : undefined}>
      <p className="text-muted mb-1">This KYC Level requires us to gather more information from you. Please fill out the required fields below.</p>

      <p className="text-lg text-warning mb-1">All fields are required for this KYC level.</p>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerFirstName" className="required">
          <Form.Control required placeholder="First Name" name="firstName" defaultValue={app.activeUser ? app.activeUser.firstName : undefined} isInvalid={Boolean(errors.entity && errors.entity.first_name)} />
          {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerLastName" className="required">
          <Form.Control required placeholder="Last Name" name="lastName" defaultValue={app.activeUser ? app.activeUser.lastName : undefined} isInvalid={Boolean(errors.entity && errors.entity.last_name)} />
          {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerEmail" className="required">
          <Form.Control required type="email" placeholder="Email" name="email" defaultValue={app.activeUser ? app.activeUser.email : undefined} isInvalid={Boolean(errors.contact && errors.contact.email)} />
          {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerPhone" className="required">
          <Form.Control required name="phone" type="tel" defaultValue={app.activeUser ? app.activeUser.phone : undefined} as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors.contact && errors.contact.phone)} />
          {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="6" controlId="registerDateOfBirth" className="required">
          <Form.Control required type="date" placeholder="Date of Birth" name="dateOfBirth" defaultValue={app.activeUser ? app.activeUser.dateOfBirth : undefined} isInvalid={Boolean(errors.entity && errors.entity.birthdate)} />
          {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="registerSSN" className="required">
          <Form.Control required placeholder="Social Security Number 123-34-5678" name="ssn" defaultValue={app.activeUser ? app.activeUser.ssn : undefined} isInvalid={errors.identity} />
          {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      <Form.Group controlId="registerAddress" className="required">
        <Form.Control required placeholder="Street Address" name="address" defaultValue={app.activeUser ? app.activeUser.address : undefined} isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
        {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Row>
        <Form.Group as={Col} md="4" controlId="registerCity" className="required">
          <Form.Control required placeholder="City" name="city" defaultValue={app.activeUser ? app.activeUser.city : undefined} isInvalid={Boolean(errors.address && errors.address.city)} />
          {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="registerState" className="select required">
          <Form.Control required as="select" name="state" defaultValue={app.activeUser ? app.activeUser.state : undefined} isInvalid={Boolean(errors.address && errors.address.state)}>
            <option value="">State</option>
            {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
          </Form.Control>
          {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="4" controlId="registerZip" className="required">
          <Form.Control required placeholder="Zip" name="zip" defaultValue={app.activeUser ? app.activeUser.zip : undefined} isInvalid={Boolean(errors.address && errors.address.postal_code)} />
          {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
        </Form.Group>
      </Form.Row>
      
      {children}
    </div>
  )
};

export default DefaultKYCForm;
