import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import AlertMessage from '../../components/common/AlertMessage';
import LinkMemberForm from '../../components/kyb/LinkMemberForm';

const MemberDetails = ({ page, match, history, location }) => {
  const [member, setMember] = useState(false);
  const [alert, setAlert] = useState(false);
  const { app, api, handleError, setAppData } = useAppContext();
  const beneficialOwner = member && member.memberships.find(membership => membership.role === 'beneficial_owner');
  const canCertify = member && member.memberships.some(membership => location.state.role && location.state.role === membership.role && membership.certification_token !== null);
  
  const getEntity = async () => {
    console.log('Getting Entity ...');
    const activeUser = app.users.find(user => match.params.handle === user.handle);
    try {
      const res = await api.getEntity(activeUser.handle, activeUser.private_key);
      console.log('  ... completed!');
      if (res.data.success) {
        console.log(res);
        delete res.data.success;
        setMember(res.data);
      }
      setAppData({
        responses: [{
          endpoint: '/get_entity',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  const certifyMember = async () => {
    console.log('Certify Benefical Owner ...');
    const businessUser = app.users.find(user => app.settings.kybHandle === user.handle);
    try {
      const res = await api.certifyBeneficialOwner(app.activeUser.handle, app.activeUser.private_key, businessUser.handle, businessUser.private_key, match.params.handle, beneficialOwner.certification_token);
      if (res.data.status === 'SUCCESS') {
        setAlert({ message: res.data.message, type: 'success' });
        history.goBack();
      } else {
        setAlert({ message: res.data.message, type: 'danger' });
      }
      setAppData({
        responses: [{
          endpoint: '/certify_beneficial_owner',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    };
  };

  useEffect(() => {
    getEntity();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <div className="mb-4 d-flex">
        <h1 className="mb-0">Team Member</h1>
        {location.pathname.includes('certify') && <Button variant="outline-light" className="text-meta text-uppercase ml-auto" onClick={() => history.goBack()}>Back</Button>}
      </div>      

      <p className="text-lg text-meta mb-4">Please review the following information and certify that it is correct.</p>

      <p className="text-meta mb-5">This page represents <a href="https://docs.silamoney.com/docs/get_entity" target="_blank" rel="noopener noreferrer">/get_entity</a> and {location.pathname.includes('certify') ? <a href="https://docs.silamoney.com/docs/certify_beneficial_owner" target="_blank" rel="noopener noreferrer">/certify_beneficial_owner</a> : <a href="https://docs.silamoney.com/docs/link_business_member" target="_blank" rel="noopener noreferrer">/link_business_member</a>} functionality.</p>

      {!member ? <Loader /> : <>

        <Row className="mb-0">
          <Col md="12" lg="6" className="mb-4">
            <p className="pb-2 mb-1 border-bottom border-light text-lg">{`${member.entity.first_name} ${member.entity.last_name}`}</p>
            <p className="mb-0 text-meta">Full Name</p>
          </Col>
          <Col md="12" lg="6" className="mb-4">
            <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.emails.length ? member.emails[0].email : 'N/A'}</p>
            <p className="mb-0 text-meta">Email</p>
          </Col>
        </Row>

        <Row className="mb-0">
          <Col md="12" lg="6" className="mb-4">
            <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.phones.length ? member.phones[0].phone : 'N/A'}</p>
            <p className="mb-0 text-meta">Phone</p>
          </Col>
          <Col md="12" lg="6" className="mb-4">
            <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.identities.length ? member.identities[0].identity : 'N/A'}</p>
            <p className="mb-0 text-meta">SSN (Last 4 digits)</p>
          </Col>
        </Row>

        <Row className="mb-0">
          <Col md={beneficialOwner ? 12 : undefined} lg={beneficialOwner ? 6 : undefined} className="mb-4">
            <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.addresses.length ? `${member.addresses[0].street_address_1} ${member.addresses[0].city}, ${member.addresses[0].state} ${member.addresses[0].postal_code}` : 'N/A'}</p>
            <p className="mb-4 text-meta">Home Address</p>
          </Col>
          {beneficialOwner && <Col md="12" lg="6" className="mb-4">
            <p className="pb-2 mb-1 border-bottom border-light text-lg">{`${Math.round(beneficialOwner.ownership_stake * 100)}%`}</p>
            <p className="mb-0 text-meta">Ownership Percentage</p>
          </Col>}
        </Row>

        {!location.pathname.includes('certify') && member.memberships.length !== 0 && <Card>
          <Card.Header className="bg-secondary">Memberships</Card.Header>
          <ListGroup variant="flush">
            {member.memberships.map((membership, index) => <ListGroup.Item variant="flush" key={index}>
              <p className="m-0">{`${app.settings.kybRoles.find(role => role.name === membership.role).label} at ${membership.entity_name}${membership.ownership_stake ? ` with an ownership stake of ${membership.ownership_stake * 100}%` : ''}.`}</p>
              {membership.details && <p className="m-0 text-meta text-sm">{membership.details}</p>}
            </ListGroup.Item>)}
          </ListGroup>
        </Card>}

        {!location.pathname.includes('certify') && <div className="mt-5">
          <h2 className="mb-4">Link your account</h2>
          <p className="text-meta text-lg mb-4">Now that you have registered, you must link your account to the business.{member.memberships.find(membership => membership.role === 'beneficial_owner') && '  If you are also a Beneficial Owner, please provide your Ownership Percentage.'}</p>
          <LinkMemberForm member={member} onMemberLinked={() => { setMember(false); getEntity() ;} } onMemberUnlinked={() => { setMember(false); getEntity(); }} isBo={!member.memberships.some(membership => membership.role === 'beneficial_owner')} />
          <p className="mt-5 mb-0 text-center"><Button variant="outline-light" className="text-meta text-uppercase" onClick={() => history.goBack()}>Back to Business Members</Button></p>
        </div>}
                
        {location.pathname.includes('certify') && <p className="d-flex mt-4"><Button onClick={certifyMember} disabled={!canCertify} className="ml-auto">Certify</Button></p>}

        {alert && <div className="mt-4"><AlertMessage message={alert.message} type={alert.type} onHide={() => setAlert(false)} /></div>}

      </>}

      <Pagination hideNext
        previousOnClick={() => history.goBack()}
        currentPage={page} />

    </Container>
  );
};

export default MemberDetails;