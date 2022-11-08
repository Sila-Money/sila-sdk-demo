import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import KybKycModal from '../components/home/KybKycModal';

import { handleHomeRedirect } from '../utils';
import { flows } from '../routes';

const Home = ({ page, history }) => {
  const [show, setShow] = useState(false);
  const { app, setAppData } = useAppContext();

  const handleClick = (e, flow) => {
    if (Object.keys(app.auth).length && !app.auth.failed) {
      setAppData({ settings: { ...app.settings, flow } }, () => {
        history.push({ pathname: handleHomeRedirect(app, flows, flow, app.activeUser ? app.activeUser.handle : null), state: { from: page } });
      });
    } else {
      e.preventDefault();
    }
  };

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Choose Your Flow</h1>

      <Container className="mt-5">
        <Row className="justify-content-center">
          {Object.keys(flows).map(key => <Col key={key} lg="12" xl="6" className="text-center px-5">
            <Button onClick={(e) => handleClick(e, key)} disabled={!flows[key].permissions(app)} className="jumbotron w-100 d-flex flex-column text-center align-items-center shadow text-lg font-weight-normal text-info text-transform-none" size="lg" variant="outline-light">{flows[key].icon}<span className="d-block mt-4">{flows[key].name}</span></Button>
          </Col>)}
        </Row>
      </Container>

      <p className="text-right"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none" onClick={() => setShow(true)}><span className="lnk">What’s the difference between KYC and KYB?</span> <i className="sila-icon info text-primary ml-2"></i></Button></p>
      <KybKycModal show={show} onHide={() => setShow(false)} />

    </Container>
  );
};

export default Home;
