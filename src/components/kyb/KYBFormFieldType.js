import React from 'react';
import { Form } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { STATES_ARRAY } from '../../constants';

const KYBFormFieldType = ({ fieldType, errors, app, onEditing, onSave }) => {
  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      onSave(e.target.name);
    }
  }

  return (
    <>
      {fieldType && fieldType === 'entity_name' && <Form.Group controlId="businessName" className="required">
        <Form.Control required placeholder="Legal Company Name" name="entity_name" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.entity_name : undefined} isInvalid={Boolean(errors.entity && errors.entity.entity_name)} />
        {errors.entity && errors.entity.entity_name && <Form.Control.Feedback type="invalid">{errors.entity.entity_name}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'doing_business_as' && <Form.Group controlId="businessDBA" className="required">
        <Form.Control placeholder="DBA (If Applicable)" name="doing_business_as" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.doing_business_as : undefined} isInvalid={Boolean(errors.entity && errors.entity.doing_business_as)} />
        {errors.entity && errors.entity.doing_business_as && <Form.Control.Feedback type="invalid">{errors.entity.doing_business_as}</Form.Control.Feedback>}
        <Form.Text className="text-muted">Optional business name if it differs from the legally registered name.</Form.Text>
      </Form.Group>}

      {fieldType && fieldType === 'email' && <Form.Group controlId="businessEmail" className="required">
        <Form.Control required type="email" placeholder="Business Email" name="email" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.email : undefined} isInvalid={Boolean(errors.contact && errors.contact.email)} />
        {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'business_website' && <Form.Group controlId="businessWebsite" className="required">
        <Form.Control type="url" placeholder="Business Website - http://example.com" name="business_website" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.business_website : undefined} isInvalid={Boolean(errors.entity && errors.entity.business_website)} />
        {errors.entity && errors.entity.business_website && <Form.Control.Feedback type="invalid">{errors.entity.business_website}</Form.Control.Feedback>}
      </Form.Group>}
    
      {fieldType && fieldType === 'address' && <Form.Group controlId="businessAddress" className="required">
        <Form.Control required placeholder="Street Address" name="address" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.address : undefined} isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
        {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'city' && <Form.Group controlId="businessCity" className="required">
        <Form.Control required  placeholder="City" name="city" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.city : undefined} isInvalid={Boolean(errors.address && errors.address.city)} />
        {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'state' && <Form.Group controlId="businessState" className="select required">
        <Form.Control required as="select" name="state" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.state : undefined} isInvalid={Boolean(errors.address && errors.address.state)}>
          <option value="">State</option>
          {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
        </Form.Control>
        {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'zip' && <Form.Group controlId="businessZip" className="required">
        <Form.Control required placeholder="Zip" name="zip" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.zip : undefined} isInvalid={Boolean(errors.address && errors.address.postal_code)} />
        {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'phone' && <Form.Group controlId="businessPhone" className="required">
        <Form.Control required name="phone" type="tel" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.phone : undefined} as={NumberFormat} placeholder="Phone Number (___) ___-____" format="(###) ###-####" mask="_" isInvalid={Boolean(errors.contact && errors.contact.phone)} />
        {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
      </Form.Group>}

      {fieldType && fieldType === 'ein' && <Form.Group controlId="businessEIN" className="required">
        <Form.Control required placeholder="Employer ID Number (EIN) 12-3456789" name="ein" className="p-2" autoFocus onChange={onEditing} onKeyDown={handleKeypress} defaultValue={app.activeUser ? app.activeUser.ein : undefined} isInvalid={Boolean(errors.identity)} />
        {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
      </Form.Group>}
    </>
  )
};

export default KYBFormFieldType;
