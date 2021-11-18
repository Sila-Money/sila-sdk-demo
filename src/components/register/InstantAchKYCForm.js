import React, { useState, useEffect } from 'react';
import { Form, Col } from 'react-bootstrap';
import NumberFormat from 'react-number-format';

import { STATES_ARRAY } from '../../constants';

const InstantAchKYCForm = ({ errors, isHide, app, children }) => {
  const [receiveSMS, setReceiveSMS] = useState(app.activeUser ? app.activeUser.smsOptIn : false);
  const [deviceFingerprint, setDeviceFingerprint] = useState(undefined);
  const onSMSChange = (e) => {
    setReceiveSMS(e.target.checked);
  }

  useEffect(() => {
    try {
      console.log('  ... loading device-fingerprint');
      window.IGLOO = window.IGLOO || {
        "enable_rip" : true,
        "enable_flash" : false,
        "install_flash" : false,
        "loader" : {
          "version" : "general5",
          "fp_static" : false
        }
      };

      const scriptElem = document.getElementById('iovation');
      if (scriptElem) scriptElem.remove();
      const script = document.createElement('script');
      script.src = "/iovation.js";
      script.id = 'iovation';
      script.async = true;
      document.body.appendChild(script);

      let timeoutId;
      function useBlackboxString(intervalCount) {
        if (typeof window.IGLOO.getBlackbox !== 'function') {return;}
        const bbData = window.IGLOO.getBlackbox();
        if (bbData.finished) {
          clearTimeout(timeoutId);
          setDeviceFingerprint(bbData.blackbox);
        }
      }
      timeoutId = setInterval(useBlackboxString, 500);
    } catch (err) {
      console.log('  ... device-fingerprint looks like we ran into an issue!', err);
    }
  }, []);
  
  return (
    <div className={isHide ? 'd-none' : undefined}>
      <p className="text-muted">This KYC Level requires us to gather more information from you. Please fill out the required fields below.</p>

      <p className="text-right text-lg text-warning">All fields are required for this KYC level.</p>
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
          <Form.Control required type="date" defaultValue={app.activeUser ? app.activeUser.dateOfBirth : undefined} placeholder="Date of Birth" name="dateOfBirth" isInvalid={Boolean(errors.entity && errors.entity.birthdate)} />
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
      <Form.Row className="mb-4">
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

      <h2 className="mb-4">Device Fingerprint</h2>

      <p className="text-muted mb-3">Your device fingerprint is a unique string of numbers used to identify your desktop or mobile device. You must opt-in to accept SMS notifications about all instant-ACH transactions.</p>

      <Form.Group controlId="registerDeviceFingerprint" className="readonly">
        <Form.Control required placeholder="Loading..." name="deviceFingerprint" defaultValue={app.activeUser.deviceFingerprint ? app.activeUser.deviceFingerprint : deviceFingerprint} readOnly={true} isInvalid={Boolean(errors.device && errors.device.deviceFingerprint)} />
        {errors.device && errors.device.deviceFingerprint && <Form.Control.Feedback type="invalid">{errors.device.deviceFingerprint}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group controlId="registerSms" className="mb-5 registerSms">
        <Form.Check custom id="registerSms" className="mb-5 ml-n2" type="checkbox">
          <Form.Check.Input name="smsOptIn" defaultChecked={receiveSMS} onChange={onSMSChange} type="checkbox" />
          <Form.Check.Label className="text-muted ml-2">Yes, opt-in to receive SMS notifications about all instant ACH transactions.</Form.Check.Label>
        </Form.Check>
      </Form.Group>
      
      {children}
    </div>
  )
};

export default InstantAchKYCForm;
