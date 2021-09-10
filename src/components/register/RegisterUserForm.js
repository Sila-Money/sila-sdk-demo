import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import DefaultKYCForm from '../../components/register/DefaultKYCForm';
import KYCLiteForm from '../../components/register/KYCLiteForm';
import ReceiveOnlyKYCForm from '../../components/register/ReceiveOnlyKYCForm';
import InstantAchKYCForm from '../../components/register/InstantAchKYCForm';

import { DEFAULT_KYC, LITE_KYC, RECEIVE_ONLY_KYC, INSTANT_ACH_KYC, KYC_ARRAY } from '../../constants';

const RegisterUserForm = ({ className, handle, children, onError, onSuccess, onShowKycModal }) => {
  const { app, api, refreshApp, handleError, updateApp, setAppData } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER USER ***');
    e.preventDefault();
    console.log('Waking up the API service ...');
    const wallet = api.generateWallet();
    const entity = new api.User();
    entity.handle = handle;
    entity.firstName = e.target.firstName.value;
    entity.lastName = e.target.lastName.value;
    entity.address = e.target.address ? e.target.address.value : '';
    entity.city = e.target.city ? e.target.city.value : '';
    entity.state = e.target.state ? e.target.state.value : '';
    entity.zip = e.target.zip ? e.target.zip.value : '';
    entity.phone = e.target.phone ? e.target.phone.value : '';
    entity.email = e.target.email ? e.target.email.value : '';
    if(app.settings.preferredKycLevel !== RECEIVE_ONLY_KYC) entity.dateOfBirth = e.target.dateOfBirth ? e.target.dateOfBirth.value : '';
    entity.ssn = e.target.ssn ? e.target.ssn.value : '';
    entity.cryptoAddress = wallet.address;
    entity.flow = app.settings.flow;
    try {
      const res = await api.register(entity);
      let result = {};
      let appData = {};
      console.log('  ... completed!');
      if (res.data.success) {
        refreshApp();
        entity.private_key = wallet.privateKey;
        entity.active = true;
        result = {
          alert: { message: `Success! ${handle} is now registered.`, type: 'success' }
        };
        appData = {
          settings: { ...app.settings, kycHandle: false },
          users: [...app.users, entity],
          wallets: [...app.wallets, {
            handle: entity.handle,
            blockchain_address: wallet.address,
            private_key: wallet.privateKey,
            nickname: 'My Wallet',
            default: true
          }]
        };
        if (Object.keys(errors).length) setErrors({});
      } else if (res.data.validation_details) {
        setErrors(res.data.validation_details);
        if (onError) onError(res.data.validation_details);
      }
      setAppData({
        ...appData,
        responses: [{
          endpoint: '/register',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
        if (res.data.success && onSuccess) onSuccess(entity);
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setValidated(true);
  }

  const onKycLevelChange = (e) => {
    setAppData({
      settings: { ...app.settings, preferredKycLevel: e.target.value || undefined }
    });
  }

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={register}>

      <p className="text-muted mr-5">Please choose your preferred KYC level:</p>

      <Form.Group controlId="preferredKyc" className="select required">
        <Form.Control placeholder="Choose KYC" required as="select" name="kyc" onChange={onKycLevelChange} defaultValue={app.settings.preferredKycLevel || ''} isInvalid={Boolean(errors.address && errors.address.state)}>
          <option value="">Choose KYC</option>
          {KYC_ARRAY.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
        </Form.Control>
        {errors.address && errors.address.state && <Form.Control.Feedback type="invalid">{errors.address.state}</Form.Control.Feedback>}
      </Form.Group>

      {app.settings.preferredKycLevel || '' ? <p className="text-right text-lg text-warning">All fields are required for this KYC level.</p> : <p className="text-right text-muted"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none" onClick={() => onShowKycModal(true)}><span className="lnk">What's the difference between these KYC levels?</span><i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>}
      {app.settings.preferredKycLevel === DEFAULT_KYC && <DefaultKYCForm errors={errors}></DefaultKYCForm>}
      {app.settings.preferredKycLevel === LITE_KYC && <KYCLiteForm errors={errors}></KYCLiteForm>}
      {app.settings.preferredKycLevel === RECEIVE_ONLY_KYC && <ReceiveOnlyKYCForm errors={errors}></ReceiveOnlyKYCForm>}
      {app.settings.preferredKycLevel === INSTANT_ACH_KYC && <InstantAchKYCForm errors={errors}></InstantAchKYCForm>}

      {children}
    </Form>
  )
};

export default RegisterUserForm;
