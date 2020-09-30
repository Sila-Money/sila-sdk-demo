import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import KybKycModal from '../components/home/KybKycModal';

import { flows } from '../routes';

const Home = ({ page, history }) => {
  const [show, setShow] = useState(false);
  const { app, setAppData } = useAppContext();

  const handleClick = (e, flow) => {
    if (Object.keys(app.auth).length) {
      setAppData({ settings: { ...app.settings, flow } }, () => {
        console.log({ ...app.settings, flow });
        history.push({ pathname: app.activeUser ? flows[flow].home : flows[flow].routes[0], state: { from: page } });
      });
    } else {
      e.preventDefault();
    }
  };

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Choose Your Flow</h1>

      <p className="text-meta text-lg">We need to gather some information to see if the end-user meets KYC (Know Your Customer) or KYB (Know Your Business) guidelines.  Pick an option below to move forward.</p>

      <Container className="mt-5">
        <Row className="justify-content-center">
          {Object.keys(flows).map(key => <Col key={key} lg="12" xl="6" className="text-center px-5">
            <Button onClick={(e) => handleClick(e, key)} disabled={!flows[key].permissions(app)} className="jumbotron border-light w-100" size="lg" variant="outline-light"><span className="badge-light rounded-circle d-inline-block p-3 mb-3"><img src={flows[key].icon} width={32} height={32} alt={flows[key].name} /></span><br />{flows[key].name}</Button>
          </Col>)}
        </Row>
      </Container>

      <p className="text-right"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none" onClick={() => setShow(true)}><span className="lnk">What’s the difference between the KYC and KYB?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>
      <KybKycModal show={show} onHide={() => setShow(false)} />

    </Container>
  );
};

export default Home;
