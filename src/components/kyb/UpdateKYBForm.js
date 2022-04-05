import React, { useState } from 'react';
import { Form, Col, InputGroup, Button } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { useAppContext } from '../../components/context/AppDataProvider';

import { KYB_RECEIVE_ONLY, KYB_LITE, STATES_ARRAY } from '../../constants';

const UpdateKYBForm = ({ errors, preferredKyb, entityuuid, onLoaded, onConfirm, onShowUpdate, children }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const activeUser = app.activeUser;
  const [activeDeleteField, setActiveDeleteField] = useState(undefined);
  const phoneFields = ['phone']
  const emailFields = ['email']
  const identityFields = ['ein']
  const addressFields = ['address', 'city', 'state', 'zip']
  let updatedEntityData = {};
  let updatedResponses = [];
  let validationErrors = {};
  let result = {};
  let appData = {};
  let ApiEndpoint;

  const onChange = (e) => {
    if (activeUser[e.target.name] !== e.target.value) onShowUpdate(true);
  }

  const onDelete = async (fieldName, fieldLabel) => {
    setActiveDeleteField(fieldName);

    onConfirm({ show: true, message: `Are you sure you want to delete the ${fieldLabel} data point from the registered data?`, onSuccess: async () => {
      let deleteSuccess = false;
      let deleteRes = {};
      onLoaded(false);
      onConfirm({show: false, message: ''});
      try {
        if (emailFields.includes(fieldName)) {
          ApiEndpoint = 'email';
          deleteRes = await api.deleteEmail(app.activeUser.handle, app.activeUser.private_key, entityuuid.uuid.email);
        } else if (phoneFields.includes(fieldName)) {
          ApiEndpoint = 'phone';
          deleteRes = await api.deletePhone(app.activeUser.handle, app.activeUser.private_key, entityuuid.uuid.phone);
        } else if (identityFields.includes(fieldName)) {
          ApiEndpoint = 'identity';
          deleteRes = await api.deleteIdentity(app.activeUser.handle, app.activeUser.private_key, entityuuid.uuid.identity);
        } else if (addressFields.includes(fieldName)) {
          ApiEndpoint = 'address';
          deleteRes = await api.deleteAddress(app.activeUser.handle, app.activeUser.private_key, entityuuid.uuid.address);
        } else {
          validationErrors = Object.assign({error: "Registration data can not be deleted because it is required for this KYB level."}, validationErrors.error);
        }

        if (ApiEndpoint) updatedResponses = [ ...updatedResponses, { endpoint: `/delete/${ApiEndpoint}`, result: JSON.stringify(deleteRes, null, '\t') } ];

        if (deleteRes.data && deleteRes.data.success) {
          deleteSuccess = true;
          if (emailFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, email: '' };
          if (phoneFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, phone: '' };
          if (identityFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, ein: '' };
          if (addressFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, address: '', city: '', state: '', zip: '' };
        }  else if (deleteRes.data && !deleteRes.data.success) {
          validationErrors = Object.assign({error: deleteRes.data.validation_details ? deleteRes.data.validation_details.uuid : deleteRes.data.message }, validationErrors.error);
        } else {
          console.log(`... delete entity ${fieldName} failed!`, deleteRes);
        }
      } catch (err) {
        console.log(`  ... unable to delete entity ${fieldName}, looks like we ran into an issue!`);
        handleError(err);
      }

      try {
        if (deleteSuccess) {
          console.log(`  ... delete ${fieldName} field completed!`);
          refreshApp();
          const activeUser = app.users.find(u => u.handle === app.activeUser.handle);
          updatedEntityData = { ...activeUser, ...updatedEntityData, kybLevel: app.settings.preferredKybLevel }
          result = {
            activeUser: { ...activeUser, ...updatedEntityData } ,
            alert: { message: 'Registration data was successfully deleted.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === app.activeUser.handle ? { ...u, ...updatedEntityData } : u),
          };

          setAppData({
            ...appData,
            responses: [...updatedResponses, ...app.responses]
          }, () => {
            updateApp({ ...result });
          });
        } else if ( Object.keys(validationErrors).length ) {
          updateApp({ ...app, alert: { message: validationErrors.error, type: 'danger' } });
        }
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
      onLoaded(true);
    }, onHide: () => {
      onConfirm({show: false, message: ''});
    } })
    setActiveDeleteField(undefined);
  }
  
  return (
    <>
      <p className="text-lg text-warning mb-1">All fields are required for this KYB level.</p>

      {activeUser && activeUser.entity_name && !activeUser.email && <Form.Group controlId="businessName" className="required">
        <Form.Control required placeholder="Legal Company Name" name="entity_name" defaultValue={activeUser ? activeUser.entity_name : undefined} onChange={onChange} isInvalid={Boolean(errors.entity && errors.entity.entity_name)} />
        {errors.entity && errors.entity.entity_name && <Form.Control.Feedback type="invalid">{errors.entity.entity_name}</Form.Control.Feedback>}
      </Form.Group>}

      {activeUser && activeUser.entity_name && activeUser.email && <Form.Row>
        <Form.Group as={Col} md="6" controlId="businessName" className="required">
          <Form.Control required placeholder="Legal Company Name" name="entity_name" defaultValue={activeUser ? activeUser.entity_name : undefined} onChange={onChange} isInvalid={Boolean(errors.entity && errors.entity.entity_name)} />
          {errors.entity && errors.entity.entity_name && <Form.Control.Feedback type="invalid">{errors.entity.entity_name}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="businessEmail" className={preferredKyb !== KYB_RECEIVE_ONLY ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyb !== KYB_RECEIVE_ONLY}
              type="email"
              placeholder="Business Email"
              name="email"
              defaultValue={activeUser ? activeUser.email : undefined}
              onChange={onChange}
              isInvalid={Boolean(errors.contact && errors.contact.email)} />
            {preferredKyb === KYB_RECEIVE_ONLY && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('email', 'Business Email')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'email' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>
      </Form.Row>}

      {activeUser && activeUser.address && <Form.Group controlId="businessAddress" className={preferredKyb !== KYB_RECEIVE_ONLY ? 'required' : ''}>
        <InputGroup className="mb-0">
          <Form.Control 
            required={preferredKyb !== KYB_RECEIVE_ONLY}
            placeholder="Street Address" 
            name="address" 
            defaultValue={activeUser ? activeUser.address : undefined} 
            onChange={onChange}
            isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
          {preferredKyb === KYB_RECEIVE_ONLY && <InputGroup.Append className="d-flex justify-content-between align-items-center">
            <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('address', 'Street Address')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'address' ? 'text-primary' : undefined }`}></i></Button>
          </InputGroup.Append>}
          {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
        </InputGroup>
      </Form.Group>}

      {activeUser && (activeUser.city || activeUser.state || activeUser.zip) && <Form.Row>
        {activeUser.city && <Form.Group as={Col} md="4" controlId="businessCity" className={preferredKyb !== KYB_RECEIVE_ONLY ? 'required mb-3' : 'mb-3'}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyb !== KYB_RECEIVE_ONLY}
              placeholder="City" 
              name="city" 
              defaultValue={activeUser ? activeUser.city : undefined} 
              onChange={onChange}
              isInvalid={Boolean(errors.address && errors.address.city)} />
            {preferredKyb === KYB_RECEIVE_ONLY && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('city', 'City')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'city' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}
        {activeUser.state && <Form.Group as={Col} md="4" controlId="businessState" className={`select ${preferredKyb !== KYB_RECEIVE_ONLY ? 'required' : ''}`}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyb !== KYB_RECEIVE_ONLY}
              as="select" 
              name="state" 
              defaultValue={activeUser ? activeUser.state : undefined} 
              onChange={onChange}
              isInvalid={Boolean(errors.address && errors.address.state)}>
              <option value="">State</option>
              {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
            </Form.Control>
            {preferredKyb === KYB_RECEIVE_ONLY && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('state', 'State')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'state' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}
        {activeUser.zip && <Form.Group as={Col} md="4" controlId="businessZip" className={preferredKyb !== KYB_RECEIVE_ONLY ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyb !== KYB_RECEIVE_ONLY}
              placeholder="Zip" 
              name="zip" 
              defaultValue={activeUser ? activeUser.zip : undefined} 
              onChange={onChange}
              isInvalid={Boolean(errors.address && errors.address.postal_code)} />
            {preferredKyb === KYB_RECEIVE_ONLY && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('zip', 'Zip')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'zip' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}
      </Form.Row>}

      {activeUser && (activeUser.phone || activeUser.ein) && <Form.Row>
        {activeUser.phone && <Form.Group as={Col} md="6" controlId="businessPhone" className={preferredKyb !== KYB_RECEIVE_ONLY ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyb !== KYB_RECEIVE_ONLY}
              name="phone" 
              type="tel" 
              defaultValue={activeUser ? activeUser.phone : undefined} 
              onChange={onChange}
              as={NumberFormat} 
              placeholder="Phone Number (___) ___-____" 
              format="(###) ###-####" mask="_" 
              isInvalid={Boolean(errors.contact && errors.contact.phone)} />
            {preferredKyb === KYB_RECEIVE_ONLY && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('phone', 'Phone Number')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'phone' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}
        {activeUser.ein && <Form.Group as={Col} md="6" controlId="businessEIN" className={preferredKyb !== KYB_RECEIVE_ONLY && preferredKyb !== KYB_LITE ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyb !== KYB_RECEIVE_ONLY && preferredKyb !== KYB_LITE}
              placeholder="Employer ID Number (EIN) 12-3456789" 
              name="ein" 
              defaultValue={activeUser ? activeUser.ein : undefined} 
              onChange={onChange}
              isInvalid={Boolean(errors.identity)} />
            {(preferredKyb === KYB_RECEIVE_ONLY || preferredKyb === KYB_LITE) && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('ein', 'Employer ID Number')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'ein' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}
      </Form.Row>}

      {activeUser && (activeUser.doing_business_as || activeUser.business_website) && <Form.Row>
        {activeUser.doing_business_as && <Form.Group as={Col} md="6" controlId="businessDoingBusinessAs">
          <Form.Control 
            placeholder="DBA (If Applicable)" 
            name="doing_business_as" 
            defaultValue={activeUser ? activeUser.doing_business_as : undefined} 
            onChange={onChange} 
            isInvalid={Boolean(errors.entity && errors.entity.doing_business_as)} />
          {errors.entity && errors.entity.doing_business_as && <Form.Control.Feedback type="invalid">{errors.entity.doing_business_as}</Form.Control.Feedback>}
        </Form.Group>}
        {activeUser.business_website && <Form.Group as={Col} md="6"  controlId="businessWebsite">
          <Form.Control 
            name="business_website"
            defaultValue={activeUser ? activeUser.business_website : undefined} 
            onChange={onChange}
            placeholder="Business Website - http://example.com"
            isInvalid={Boolean(errors.entity && errors.entity.business_website)} />
          {errors.entity && errors.entity.business_website && <Form.Control.Feedback type="invalid">{errors.entity.business_website}</Form.Control.Feedback>}
        </Form.Group>}
      </Form.Row>}

      {children}
    </>
  )
};

export default UpdateKYBForm;
