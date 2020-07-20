import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const Errors = ({ status }) => {
  const history = useHistory();
  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 error splash loaded">
      <div className="splash-content align-self-center">
        <h2>{status}</h2>
        {status === 404 && <>
          <h3>Oops, the page can't be found!</h3>
          <p>Sorry, the page you requested can't be found.</p>
        </>}
        <Button className="text-uppercase" onClick={() => history.goBack()}>Go Back</Button>
      </div>
    </Container>
  )
};

export default Errors;
