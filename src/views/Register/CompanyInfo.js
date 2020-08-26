import React from 'react';
import { Container } from 'react-bootstrap';

const CompanyInfo = ({ page }) => {
  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page}`}>

      <h1 className="mb-4">Company Information</h1>

    </Container>
  );
};

export default CompanyInfo;
