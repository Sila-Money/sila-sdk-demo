import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { useAppContext } from '../components/context/AppDataProvider';

import KybKycModal from '../components/home/KybKycModal';

import indvidualIcon from '../assets/images/indvidual.svg';
import businessIcon from '../assets/images/business.svg';

import { flows } from '../routes';

const Home = ({ page }) => {
  const [show, setShow] = useState(false);
  const { app, setAppData } = useAppContext();

  const handleClick = (e, flow) => Object.keys(app.auth).length ? setAppData({ settings: { ...app.settings, flow } }) : e.preventDefault();
  
  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Choose Your Flow</h1>

      <p className="text-meta text-lg">We need to gather some information to see if the end-user meets KYC (Know Your Customer) or KYB (Know Your Business) guidelines.  Pick an option below to move forward.</p>

      <Container className="mt-5">
        <Row className="justify-content-center">
          {(!app.activeUser || !app.activeUser.business || app.settings.flow === 'kyc') && <Col lg="12" xl="6" className="text-center px-5">
            <Button onClick={(e) => handleClick(e, 'kyc')} className="jumbotron border-light w-100" size="lg" variant="outline-light" as={NavLink} to={{ pathname: app.activeUser ? '/request_kyc' : flows['kyc'][0], state: { from: page } }}><span className="badge-light rounded-circle d-inline-block p-3 mb-3"><img src={indvidualIcon} width={32} height={32} alt="Individual Onboarding" /></span><br />Individual Onboarding</Button>
          </Col>}
          {(!app.activeUser || app.activeUser.business || app.settings.flow === 'kyb') && <Col lg="12" xl="6" className="text-center px-5">
            <Button onClick={(e) => handleClick(e, 'kyb')} className="jumbotron border-light w-100" size="lg" variant="outline-light" as={NavLink} to={{ pathname: app.activeUser ? '/members' : flows['kyb'][0], state: { from: page } }}><span className="badge-light rounded-circle d-inline-block p-3 mb-3"><img src={businessIcon} width={32} height={32} alt="Business Onboarding" /></span><br />Business Onboarding</Button>
          </Col>}
        </Row>
      </Container>

      <p className="text-right"><Button variant="link" className="text-reset font-italic p-0 text-decoration-none" onClick={() => setShow(true)}><span className="lnk">What’s the difference between the KYC and KYB?</span> <i className="sila-icon sila-icon-info text-primary ml-2"></i></Button></p>
      <KybKycModal show={show} onHide={() => setShow(false)} />

    </Container>
  );
};

export default Home;
