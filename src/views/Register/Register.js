import React from 'react';
import { Container } from 'react-bootstrap';

import RouteConfig from '../../components/common/RouteConfig';
// import SelectKYC from '../../components/register/SelectKYC';
import RegisterForm from '../../components/register/RegisterForm';

const Register = ({ page, routes, location }) => {
  // const [show, setShow] = useState(false);

  return location.pathname === '/register' ?
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page}`}>

      {/* {!show && <SelectKYC page={page} onNext={() => setShow(true)} />}
      {show && <RegisterForm page={page} onPrevious={() => setShow(false)} />} */}

      {location.pathname === '/register' && <RegisterForm page={page} />}

    </Container>
    : <RouteConfig routes={routes} />;
};

export default Register;
