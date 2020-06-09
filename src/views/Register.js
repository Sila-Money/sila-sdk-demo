import React from 'react';
import { Container } from 'react-bootstrap';

// import SelectKYC from '../components/register/SelectKYC';
import RegisterForm from '../components/register/RegisterForm';

const Register = ({ page }) => {
  // const [show, setShow] = useState(false);

  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 loaded">

      {/* {!show && <SelectKYC page={page} onNext={() => setShow(true)} />}
      {show && <RegisterForm page={page} onPrevious={() => setShow(false)} />} */}

      <RegisterForm page={page} />

    </Container>
  );
};

export default Register;
