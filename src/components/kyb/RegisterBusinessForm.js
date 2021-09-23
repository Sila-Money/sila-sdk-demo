import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import Loader from '../../components/common/Loader';
import SelectMenu from '../../components/common/SelectMenu';

import { KYB_ARRAY } from '../../constants';

const RegisterBusinessForm = ({ className, children, onShowKybModal }) => {
  const { app, setAppData } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const [preferredKyb, setPreferredKyb] = useState(app.activeUser.kycLevel || app.settings.preferredKybLevel);
  const businessTypes = ['sole_proprietorship', 'trust', 'unincorporated_association'];

  const register = async (e) => {
    console.log('\n*** BEGIN REGISTER BUSINESS ***');
    e.preventDefault();
    console.log('Waking up the API service ...');
    return;
  }

  const onKybLevelChange = (value) => {
    setPreferredKyb(value || undefined)
    setAppData({
      settings: { ...app.settings, preferredKybLevel: value || undefined }
    });
  }

  return (
    <Form noValidate className={className} validated={validated} autoComplete="off" onSubmit={register}>
      {!loaded && <Loader overlay />}

      <Form.Label className="text-muted mr-5">Please choose your preferred KYB level:</Form.Label>
      <SelectMenu fullWidth
        title={preferredKyb ? KYB_ARRAY.find(option => option.value === preferredKyb).label : 'Choose KYB level'}
        onChange={(value) => onKybLevelChange(value)}
        className="types mb-4"
        value={preferredKyb}
        options={KYB_ARRAY}
        disabledOptions={(businessTypes && businessTypes.includes(app.settings.kybBusinessType)) ? ['KYB-STANDARD'] : []} />

      {!preferredKyb ? <p className="text-right text-muted"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none" onClick={() => onShowKybModal(true)}><span className="lnk">What's the difference between the KYB levels?</span><i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p> : ''}

      {children}
    </Form>
  )
};

export default RegisterBusinessForm;
