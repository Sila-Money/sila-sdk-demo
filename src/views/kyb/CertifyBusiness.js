import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Form, Dropdown, DropdownButton } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import Sketch from 'react-p5';

import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';
import RouteConfig from '../../components/common/RouteConfig';
import DisabledOverlay from '../../components/common/DisabledOverlay';

import { useAppContext } from '../../components/context/AppDataProvider';

import * as confetti from '../../assets/vendor/confetti';

const BusinessMembers = ({ page, previous, next, routes, location, history, isActive }) => {
  const [loaded, setLoaded] = useState(false);
  const [members, setMembers] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCongrats, setShowCongrats] = useState(members && members.filter(member => member.beneficial_owner_certification_status.includes('not_required')).length !== 0);
  const [filters, setFilters] = useState({ role: false, search: '' });
  const { api, app, setAppData, handleError, updateApp } = useAppContext();
  const businessUser = app.users.find(user => app.settings.kybHandle === user.handle);
  const adminUser = members && members.find(user => user.role === 'administrator');

  const filteredMembers = members ? members.filter(member => {
    return Object.keys(filters).every(filter => {
      if (!filters[filter]) { return true; }
      if (filter === 'role') {
        return member.role === filters[filter];
      } else {
        return member.first_name.toLowerCase().includes(filters[filter].toLowerCase()) || member.last_name.toLowerCase().includes(filters[filter].toLowerCase());
      }
    });
  }) : [];

  const getMembersAndCheckKyc = async () => {
    console.log('Getting Business Members and checking KYB ...');
    try {
      const [entityResponse, kycResponse] = await Promise.all([
        api.getEntity(businessUser.handle, businessUser.private_key),
        api.checkKYC(businessUser.handle, businessUser.private_key)
      ]);
      if (entityResponse.statusCode === 200 && kycResponse.statusCode === 200) {
        console.log(kycResponse);
        setMembers(entityResponse.data.members.map(member => ({ ...member, ...kycResponse.data.members.find(kyc => member.user_handle === kyc.user_handle && member.role === kyc.role) })));
        setShowCongrats(kycResponse.data.certification_history.some(history => !history.expires_after_epoch || history.expires_after_epoch > Date.now()) && kycResponse.data.certification_status.includes('certified'));
        setLoaded(true);
      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    };
  };

  const certifyBusiness = async () => {
    console.log('Certify Business ...');
    let result = {};
    try {
      const res = await api.certifyBusiness(app.activeUser.handle, app.activeUser.private_key, businessUser.handle, businessUser.private_key);
      if (res.data.status === 'SUCCESS') {
        result.alert = { message: res.data.message, type: 'success' };
        setShowCongrats(true);
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        success: res.data.success && showCongrats && !isActive ? [...app.success, { handle: app.activeUser.handle, page }] : app.success,
        responses: [{
          endpoint: '/certify_business',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    };
  };

  const setActiveUser = (e) => {
    e.preventDefault();
    setAppData({
      users: app.users.map(({ active, ...u }) => u.handle === adminUser.user_handle ? { ...u, active: true } : u)
    }, () => {
      updateApp({ activeUser: app.users.find(u => u.handle === adminUser.user_handle), kyc: {}, kyb: {} });
      history.go();
    });
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.getEntity(app.activeUser.handle, app.activeUser.private_key);
        if (res.data.success && res.data.memberships && res.data.memberships.find(membership => membership.role === 'administrator')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
    }
    if (location.pathname === page) {
      checkAdmin();
      getMembersAndCheckKyc();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return location.pathname !== page ? <RouteConfig routes={routes} /> : (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      {!loaded ? <Loader overlay /> : <>

        {!showCongrats && <>

          <h1 className="mb-4">Certify</h1>

          <p className="text-meta text-lg mb-4">Your team has successfully gone through the KYB process and have been verified. Let’s certify that all the information you have on hand is correct and get you ready to transact. Once your team members are certified, then you can certify your business.</p>

          <p className="text-meta mb-0 mb-5">This page represents <a href="https://docs.silamoney.com/docs/certify_business" target="_blank" rel="noopener noreferrer">/certify_business</a> functionality.</p>

          {!isAdmin && <DisabledOverlay>
            <p className="mb-0"><i className="fas fa-lock mr-2"></i> You must be an administrator to cerify the business and it's members. {adminUser && <Button variant="link" className="p-0 text-white important ml-2" onClick={(e) => setActiveUser(e)}>Switch to the Administator</Button>}</p>
          </DisabledOverlay>}

          <div className="members position-relative">

            <Row className="mb-5 position-relative" style={{ zIndex: 4 }}>
              <Col sm="8" className="d-block d-sm-flex align-items-center">
                <Form.Control className="w-100 mr-3 mb-2 mb-md-0 loaded" placeholder="Search by name" aria-label="Search by name" onChange={(e) => setFilters({ ...filters, search: e.currentTarget.value })} />
                <DropdownButton className="text-nowrap text-nowrap mt-2 mt-sm-0 loaded" variant="outline-light" title={app.settings.kybRoles.find(role => role.name === filters.role) ? app.settings.kybRoles.find(role => role.name === filters.role).label : 'All roles'}>
                  {filters.role && <Dropdown.Item onClick={() => setFilters({ ...filters, role: false })}>All roles</Dropdown.Item>}
                  {app.settings.kybRoles.filter(role => role.name !== filters.role).map((role, key) => <Dropdown.Item key={key} onClick={() => setFilters({ ...filters, role: role.name })}>{role.label}</Dropdown.Item>)}
                </DropdownButton>
              </Col>
              <Col sm="4" className="text-right">
                <Button as={NavLink} to={{ pathname: '/members/register', state: { from: page } }} className="text-uppercase">Add +</Button>
              </Col>
            </Row>

            <Card className="mb-4">
              <Table hover responsive>
                {members &&
                  <>
                    <thead>
                      <tr className="bg-secondary">
                        <th className="text-lg px-3 py-2">Role</th>
                        <th className="text-lg px-3 py-2">Name</th>
                        <th className="text-lg px-3 py-2">Handle</th>
                        <th width="20%" className="text-lg px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.length ? filteredMembers.sort((a, b) => a.role.localeCompare(b.role)).map((member, index) => {
                        const statusVariant = member.beneficial_owner_certification_status.includes('not_required') ? 'info' : member.beneficial_owner_certification_status.includes('pending') ? 'primary' : 'success';
                        const statusLabel = member.beneficial_owner_certification_status.includes('not_required') ? 'Not required' : member.beneficial_owner_certification_status.includes('pending') ? 'Certification Pending' : 'Certfied';
                        return (
                          <tr key={index} className="loaded" onClick={() => history.push({ pathname: `/certify/${member.user_handle}`, state: { role: member.role, from: page } })}>
                            <td className="px-3 text-nowrap align-middle">{app.settings.kybRoles.find(role => role.name === member.role).label}</td>
                            <td className="px-3 text-nowrap">{`${member.first_name} ${member.last_name}`}</td>
                            <td className="px-3 text-nowrap">{member.user_handle}</td>
                            <td width="20%" className="px-3">
                              <Badge pill className="w-100 badge-outline py-2 px-3" variant={statusVariant}>{statusLabel}</Badge>
                            </td>
                          </tr>
                        );
                      }) : <tr><td className="text-center text-meta py-3" colSpan="4">No members found.</td></tr>}
                    </tbody>
                  </>}
              </Table>
            </Card>

            <div className="d-flex">
              <span className="text-meta">Total Members: {filteredMembers.length}</span>
              <Button onClick={certifyBusiness} disabled={members.filter(member => member.beneficial_owner_certification_status.includes('pending')).length !== 0} className="ml-auto">Certify Business</Button>
            </div>
          </div>

          {app.alert.message && <div className="mt-4"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

        </>}

        {showCongrats && <div className="loaded">

          <Sketch setup={confetti.setup} draw={confetti.draw} windowResized={confetti.windowResized} />

          <h1 className="mb-4">Congratulations!</h1>

          <p className="text-meta text-lg mb-5">You’ve completed all steps and certifications, and your team is ready to link bank accounts, create wallets, and transact! Continue on to get started. </p>

          <p className="text-right"><Button as={NavLink} to={{ pathname: next, state: { from: page } }}>Go to Wallets</Button></p>

        </div>}

      </>}

      <Pagination
        previous={previous}
        next={showCongrats ? next : undefined}
        currentPage={page} />

    </Container>
  );
};

export default BusinessMembers;