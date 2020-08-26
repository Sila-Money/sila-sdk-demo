import React from 'react';
import { Container } from 'react-bootstrap';

const BusinessMembers = ({ page }) => {
  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page}`}>

      <h1 className="mb-4">Register Business Members</h1>

    </Container>
  );
};

export default BusinessMembers;
