import React, {useState} from 'react';
import { Form, InputGroup, Col, Button } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { useAppContext } from '../../components/context/AppDataProvider';

import { RECEIVE_ONLY_KYC, LITE_KYC, STATES_ARRAY } from '../../constants';

const UpdateKYCForm = ({ errors, preferredKyc, entityuuid, onLoaded, onConfirm, onShowUpdate, children }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const activeUser = app.activeUser;
  const [activeDeleteField, setActiveDeleteField] = useState(undefined);
  const phoneFields = ['phone']
  const emailFields = ['email']
  const identityFields = ['ssn']
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
          deleteRes = await api.deleteEmail(activeUser.handle, activeUser.private_key, entityuuid.uuid.email);
        } else if (phoneFields.includes(fieldName)) {
          ApiEndpoint = 'phone';
          deleteRes = await api.deletePhone(activeUser.handle, activeUser.private_key, entityuuid.uuid.phone);
        } else if (identityFields.includes(fieldName)) {
          ApiEndpoint = 'identity';
          deleteRes = await api.deleteIdentity(activeUser.handle, activeUser.private_key, entityuuid.uuid.identity);
        } else if (addressFields.includes(fieldName)) {
          ApiEndpoint = 'address';
          deleteRes = await api.deleteAddress(activeUser.handle, activeUser.private_key, entityuuid.uuid.address);
        } else {
          validationErrors = Object.assign({error: "Registration data can not be deleted because it is required for this KYC level."}, validationErrors.error);
        }

        if (ApiEndpoint) updatedResponses = [ ...updatedResponses, { endpoint: `/delete/${ApiEndpoint}`, result: JSON.stringify(deleteRes, null, '\t') } ];

        if (deleteRes.data && deleteRes.data.success) {
          deleteSuccess = true;
          if (emailFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, email: '' };
          if (phoneFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, phone: '' };
          if (identityFields.includes(fieldName)) updatedEntityData = { ...updatedEntityData, ssn: '' };
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
          const appUser = app.users.find(u => u.handle === activeUser.handle);
          updatedEntityData = { ...appUser, ...updatedEntityData, kycLevel: app.settings.preferredKycLevel }
          result = {
            activeUser: { ...appUser, ...updatedEntityData },
            alert: { message: 'Registration data was successfully deleted.', type: 'success' }
          };
          appData = {
            users: app.users.map(({ active, ...u }) => u.handle === activeUser.handle ? { ...u, ...updatedEntityData } : u),
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
      <p className="text-muted mb-1">This KYC Level requires us to gather more information from you. Please fill out the required fields below.</p>

      <p className="text-lg text-warning mb-1">All fields are required for this KYC level.</p>
      <Form.Row>
        {activeUser && activeUser.firstName && <Form.Group as={Col} md="6" controlId="registerFirstName" className="required">
          <Form.Control required placeholder="First Name" name="firstName" defaultValue={activeUser.firstName} onChange={onChange} />
          {errors.entity && errors.entity.first_name && <Form.Control.Feedback type="invalid">{errors.entity.first_name}</Form.Control.Feedback>}
        </Form.Group>}
        {activeUser && activeUser.lastName && <Form.Group as={Col} md="6" controlId="registerLastName" className="required">
          <Form.Control required placeholder="Last Name" name="lastName" defaultValue={activeUser.lastName} onChange={onChange} />
          {errors.entity && errors.entity.last_name && <Form.Control.Feedback type="invalid">{errors.entity.last_name}</Form.Control.Feedback>}
        </Form.Group>}

        {activeUser && activeUser.email && <Form.Group as={Col} md="6" controlId="registerEmail" className={preferredKyc !== RECEIVE_ONLY_KYC ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyc !== RECEIVE_ONLY_KYC}
              type="email" 
              placeholder="Email"
              aria-label="Email"
              name="email" 
              defaultValue={activeUser.email} 
              onChange={onChange}
              isInvalid={Boolean(errors.contact && errors.contact.email)} />
            {preferredKyc === RECEIVE_ONLY_KYC && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('email', 'Email')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'email' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.contact && errors.contact.email && <Form.Control.Feedback type="invalid">{errors.contact.email}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}

        {activeUser && activeUser.phone && <Form.Group as={Col} md="6" controlId="registerPhone" className={preferredKyc !== RECEIVE_ONLY_KYC ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyc !== RECEIVE_ONLY_KYC}
              name="phone" 
              type="tel" 
              defaultValue={activeUser.phone} 
              onChange={onChange}
              as={NumberFormat} 
              placeholder="Phone Number (___) ___-____" 
              format="(###) ###-####" 
              mask="_" 
              isInvalid={Boolean(errors.contact && errors.contact.phone)} />
            {preferredKyc === RECEIVE_ONLY_KYC && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('phone', 'Phone Number')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'phone' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.contact && errors.contact.phone && <Form.Control.Feedback type="invalid">{errors.contact.phone}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}

        {activeUser && activeUser.dateOfBirth && <Form.Group as={Col} md="6" controlId="registerDateOfBirth" className={preferredKyc !== RECEIVE_ONLY_KYC ? 'required' : ''}>
          <Form.Control 
            required={preferredKyc !== RECEIVE_ONLY_KYC} 
            type="date" defaultValue={activeUser.dateOfBirth} 
            onChange={onChange} placeholder="Date of Birth" 
            name="dateOfBirth" 
            isInvalid={Boolean(errors.entity && errors.entity.birthdate)} />
          {errors.entity && errors.entity.birthdate && <Form.Control.Feedback type="invalid">{errors.entity.birthdate}</Form.Control.Feedback>}
        </Form.Group>}

        {activeUser && activeUser.ssn && <Form.Group as={Col} md="6" controlId="registerSSN" className={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC}
              placeholder="Social Security Number 123-34-5678" 
              name="ssn" 
              defaultValue={activeUser.ssn} 
              onChange={onChange}
              isInvalid={Boolean(errors.identity)} />
            {(preferredKyc === RECEIVE_ONLY_KYC || preferredKyc === LITE_KYC) && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('ssn', 'Social Security Number')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'ssn' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.identity && <Form.Control.Feedback type="invalid">{errors.identity.identity_value || errors.identity}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}
      </Form.Row>

      {activeUser && activeUser.address && <Form.Group controlId="registerAddress" className={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC ? 'required' : ''}>
        <InputGroup className="mb-0">
          <Form.Control 
            required={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC}
            placeholder="Street Address" 
            name="address" 
            defaultValue={activeUser.address} 
            onChange={onChange}
            isInvalid={Boolean(errors.address && errors.address.street_address_1)} />
          {(preferredKyc === RECEIVE_ONLY_KYC || preferredKyc === LITE_KYC) && <InputGroup.Append className="d-flex justify-content-between align-items-center">
            <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('address', 'Street Address')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'address' ? 'text-primary' : undefined }`}></i></Button>
          </InputGroup.Append>}
          {errors.address && errors.address.street_address_1 && <Form.Control.Feedback type="invalid">{errors.address.street_address_1}</Form.Control.Feedback>}
        </InputGroup>
      </Form.Group>}
      
      {activeUser && (activeUser.city || activeUser.state || activeUser.zip) && <Form.Row className="mb-0">
        {activeUser.city && <Form.Group as={Col} md="4" controlId="registerCity" className={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC}
              placeholder="City" 
              name="city" 
              defaultValue={activeUser.city} 
              onChange={onChange}
              isInvalid={Boolean(errors.address && errors.address.city)} />
            {(preferredKyc === RECEIVE_ONLY_KYC || preferredKyc === LITE_KYC) && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('city', 'City')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'city' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.address && errors.address.city && <Form.Control.Feedback type="invalid">{errors.address.city}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}

        {activeUser.state && <Form.Group as={Col} md="4" controlId="registerState" className={`select ${preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC ? 'required' : ''}`}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC}
              as="select" 
              name="state" 
              defaultValue={activeUser.state} 
              onChange={onChange}
              isInvalid={Boolean(errors.address && errors.address.state)}>
              <option value="">State</option>
              {STATES_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
            </Form.Control>
            {(preferredKyc === RECEIVE_ONLY_KYC || preferredKyc === LITE_KYC) && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('state', 'State')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'state' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}

        {activeUser.zip && <Form.Group as={Col} md="4" controlId="registerZip" className={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC ? 'required' : ''}>
          <InputGroup className="mb-0">
            <Form.Control 
              required={preferredKyc !== RECEIVE_ONLY_KYC && preferredKyc !== LITE_KYC}
              placeholder="Zip" 
              name="zip" 
              defaultValue={activeUser.zip} 
              onChange={onChange}
              isInvalid={Boolean(errors.address && errors.address.postal_code)} />
            {(preferredKyc === RECEIVE_ONLY_KYC || preferredKyc === LITE_KYC) && <InputGroup.Append className="d-flex justify-content-between align-items-center">
              <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={(e) => onDelete('zip', 'Zip')}><i className={`sila-icon sila-icon-delete text-lg ${activeDeleteField === 'zip' ? 'text-primary' : undefined }`}></i></Button>
            </InputGroup.Append>}
            {errors.address && errors.address.postal_code && <Form.Control.Feedback type="invalid">{errors.address.postal_code}</Form.Control.Feedback>}
          </InputGroup>
        </Form.Group>}
      </Form.Row>}
      
      {children}
    </>
  )
};

export default UpdateKYCForm;
