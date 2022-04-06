import React from 'react';
import { Form } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { STATES_ARRAY } from '../../constants';

const KYCFormFieldType = ({ fieldType, errors, activeUser, onEditing, onSave }) => {
  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      onSave(e.target.name);
    }
  }

  return (
    <>
      {fieldType && fieldType === 'firstName' && <Form.Group controlId="registerFirstName" className="required">
        <Form.Control required placeholder="First Name" name="firstName" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.firstName : undefined} />
        {errors && errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'lastName' && <Form.Group controlId="registerLastName" className="required">
        <Form.Control required placeholder="Last Name" name="lastName" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.lastName : undefined} />
        {errors && errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'email' && <Form.Group controlId="registerEmail" className="required">
        <Form.Control required type="email" placeholder="Email" name="email" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.email : undefined} isInvalid={Boolean(errors && errors.contact && errors.contact.email)} />
        {errors && errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'phone' && <Form.Group controlId="registerPhone" className="required">
        <Form.Control required name="phone" type="tel" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.phone : undefined} as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors && errors.contact && errors.contact.phone)} />
        {errors && errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'dateOfBirth' && <Form.Group controlId="registerDateOfBirth" className="required">
        <Form.Control required type="date" placeholder="Date of Birth" name="dateOfBirth" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.dateOfBirth : undefined} isInvalid={Boolean(errors && errors.entity && errors.entity.birthdate)} />
        {errors && errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'ssn' && <Form.Group controlId="registerSSN" className="required">
        <Form.Control required placeholder="Social Security Number 123-34-5678" name="ssn" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.ssn : undefined} isInvalid={errors && errors.identity} />
        {errors && errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
      </Form.Group>}
    
      {fieldType && fieldType === 'address' && <Form.Group controlId="registerAddress" className="required">
        <Form.Control required placeholder="Street Address" name="address" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.address : undefined} isInvalid={Boolean(errors && errors.address && errors.address.street_address_1)} />
        {errors && errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
      </Form.Group>}
    
      {fieldType && fieldType === 'city' && <Form.Group controlId="registerCity" className="required">
        <Form.Control required placeholder="City" name="city" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.city : undefined} isInvalid={Boolean(errors && errors.address && errors.address.city)} />
        {errors && errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'state' && <Form.Group controlId="registerState" className="select required">
        <Form.Control required as="select" name="state" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.state : undefined} isInvalid={Boolean(errors && errors.address && errors.address.state)}>
          <option value="">State</option>
          {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
        </Form.Control>
        {errors && errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'zip' && <Form.Group controlId="registerZip" className="required">
        <Form.Control required placeholder="Zip" name="zip" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={activeUser ? activeUser.zip : undefined} isInvalid={Boolean(errors && errors.address && errors.address.postal_code)} />
        {errors && errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
      </Form.Group>}
    </>
  )
};

export default KYCFormFieldType;
