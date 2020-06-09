import React from 'react';
import { Form } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

import Pagination from '../common/Pagination';

const SelectKYC = ({ page, onNext }) => {
  const { app, updateApp } = useAppContext();

  const handleChange = (e) => {
    updateApp({ kycType: e.target.value });
  }

  return (
    <div className="d-flex flex-column flex-grow-1 h-100 loaded">

      <h1 className="mb-4">Choose Your Type of Registration</h1>

      <p className="mb-4 text-lg text-meta">We need to gather some information to see if the end-user meets KYC (Know Your Customer) guidelines. Pick a KYC level below.</p>

      <Form.Group controlId="kycType" className="select">
        <Form.Control as="select" name="kycType" value={app.kycType} onChange={handleChange}>
          <option value="default">Register User with Default KYC</option>
          <option value="light">Register User with Light KYC</option>
        </Form.Control>
      </Form.Group>

      <p className="text-right"><em>What’s the difference between the KYC levels?</em> <i className="sila-icon sila-icon-info text-primary ml-2"></i></p>

      <Pagination
        className="mt-auto pt-4"
        previous={'/check_handle'}
        nextOnClick={onNext}
        currentPage={page} />

    </div>
  );
};

export default SelectKYC;