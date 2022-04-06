import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import AlertMessage from '../../components/common/AlertMessage';
import LinkMemberForm from '../../components/kyb/LinkMemberForm';
import MemberKYBForm from '../../components/kyb/MemberKYBForm';
import ConfirmModal from '../../components/common/ConfirmModal';

const MemberDetails = ({ page, match, history, location }) => {
  const [member, setMember] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(true);
  const [alert, setAlert] = useState(false);
  const [confirm, setConfirm] = useState({ show: false, message: '', onSuccess: () => { }, onHide: () => { } });
  const { app, api, handleError, setAppData } = useAppContext();
  const beneficialOwner = member && member.memberships.find(membership => membership.role === 'beneficial_owner');
  const canCertify = member && member.memberships.some(membership => location.state.role && location.state.role === membership.role && membership.certification_token !== null);
  const currentRole = app.settings.kybRoles.find(role => role.name === location.state.role);

  const getEntity = async () => {
    console.log('Getting Entity ...');
    const activeUser = app.users.find(user => match.params.handle === user.handle);
    try {
      const res = await api.getEntity(activeUser.handle, activeUser.private_key);
      console.log('  ... completed!');
      if (res.data.success) {
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
    const adminUser = app.users.find(user => app.settings.kybAdminHandle === user.handle);
    try {
      const res = await api.certifyBeneficialOwner(adminUser.handle, adminUser.private_key, businessUser.handle, businessUser.private_key, match.params.handle, beneficialOwner.certification_token);
      if (res.data.success) {
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
    if (app.users.some(user => match.params.handle === user.handle)) {
      getEntity();
    } else {
      history.push('/members');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      {!member ? <Loader /> : <div className="loaded">

        {location.pathname.includes('certify') && <>
          <div className="mb-2 d-flex align-items-center">
            <h1 className="mb-0">Team Member</h1>
            {location.pathname.includes('certify') && <p className="text-warning text-lg ml-auto mb-0">In Review</p>}
          </div>

          <p className="text-lg text-muted mb-2">Please review the following information and certify that it is correct.</p>

          <p className="text-muted mb-2">This page represents <a href="https://docs.silamoney.com/docs/get_entity" target="_blank" rel="noopener noreferrer">/get_entity</a> and {location.pathname.includes('certify') ? <a href="https://docs.silamoney.com/docs/certify_beneficial_owner" target="_blank" rel="noopener noreferrer">/certify_beneficial_owner</a> : <a href="https://docs.silamoney.com/docs/link_business_member" target="_blank" rel="noopener noreferrer">/link_business_member</a>} functionality.</p>

          <Row className="mb-0">
            <Col md="12" lg="6" className="mb-3">
              <p className="pb-2 mb-1 border-bottom border-light text-lg">{`${member.entity.first_name} ${member.entity.last_name}`}</p>
              <p className="mb-0 text-muted">Full Name</p>
            </Col>
            <Col md="12" lg="6" className="mb-3">
              <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.emails.length ? member.emails[0].email : 'N/A'}</p>
              <p className="mb-0 text-muted">Email</p>
            </Col>
          </Row>

          <Row className="mb-0">
            <Col md="12" lg="6" className="mb-3">
              <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.phones.length ? member.phones[0].phone : 'N/A'}</p>
              <p className="mb-0 text-muted">Phone</p>
            </Col>
            <Col md="12" lg="6" className="mb-3">
              <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.identities.length ? member.identities[0].identity : 'N/A'}</p>
              <p className="mb-0 text-muted">SSN (Last 4 digits)</p>
            </Col>
          </Row>

          <Row className="mb-0">
            <Col md={beneficialOwner && 12} lg={beneficialOwner && 6} className="mb-3">
              <p className="pb-2 mb-1 border-bottom border-light text-lg">{member.addresses.length ? `${member.addresses[0].street_address_1} ${member.addresses[0].city}, ${member.addresses[0].state} ${member.addresses[0].postal_code}` : 'N/A'}</p>
              <p className="mb-0 text-muted">Home Address</p>
            </Col>
            {beneficialOwner && <Col md="12" lg="6" className="mb-3">
              <p className="pb-2 mb-1 border-bottom border-light text-lg">{`${Math.round(beneficialOwner.ownership_stake * 100)}%`}</p>
              <p className="mb-0 text-muted">Ownership Percentage</p>
            </Col>}
          </Row>

          {member.memberships.length !== 0 && <Card>
            <Card.Header className="bg-secondary">Memberships</Card.Header>
            <ListGroup variant="flush">
              {member.memberships.map((membership, index) => <ListGroup.Item variant="flush" key={index}>
                <p className="m-0">{`${app.settings.kybRoles.find(role => role.name === membership.role).label} at ${membership.entity_name}${membership.ownership_stake ? ` with an ownership stake of ${Math.round(beneficialOwner.ownership_stake * 100)}%` : ''}.`}</p>
                {membership.details && <p className="m-0 text-muted text-sm">{membership.details}</p>}
              </ListGroup.Item>)}
            </ListGroup>
          </Card>}
        </>}

        {!location.pathname.includes('certify') && <>
          {showMemberForm && <>
            <h1 className="mb-2">Registered Business Member</h1>
            <p className="text-muted text-lg mb-2">We've gathered some information to see if this business member meet KYC guidelines. If you'd like to add, update or delete information, you can do so here.</p>
            <MemberKYBForm handle={member.user_handle} activeMember={member} currentRole={currentRole} moreInfoNeeded={true} action="update-member" onConfirm={setConfirm} />
          </>}

          <LinkMemberForm member={member} onLinked={() => { setMember(false); getEntity(); }} onUnlinked={() => { setMember(false); getEntity(); }} onShowMemberForm={(status) => { setShowMemberForm(status); }} />

          <p className="mt-3 mb-0 text-center"><Button variant="outline-light" className="text-muted text-uppercase" onClick={() => history.goBack()} disabled={member.memberships.length === 0}>I'm Done</Button></p>
        </>}

        {location.pathname.includes('certify') && <p className="d-flex mt-4"><Button onClick={certifyMember} disabled={!canCertify} className="ml-auto">Certify</Button></p>}

        {alert && <div className="mt-2"><AlertMessage message={alert.message} type={alert.type} onHide={() => setAlert(false)} /></div>}

      </div>}

      <Pagination hideNext
        previousOnClick={() => history.goBack()}
        currentPage={page} />
      <ConfirmModal show={confirm.show} message={confirm.message} onHide={confirm.onHide} buttonLabel="Delete" onSuccess={confirm.onSuccess} />

    </Container>
  );
};

export default MemberDetails;
