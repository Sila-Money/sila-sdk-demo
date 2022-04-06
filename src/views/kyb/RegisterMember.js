import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import LinkMemberForm from '../../components/kyb/LinkMemberForm';
import MemberKYBForm from '../../components/kyb/MemberKYBForm';
import CheckHandleForm from '../../components/common/CheckHandleForm';
import Pagination from '../../components/common/Pagination';
import SelectMenu from '../../components/common/SelectMenu';
import Loader from '../../components/common/Loader';

const RegisterMember = ({ page, location, history }) => {
  const [handle, setHandle] = useState(false);
  const [member, setMember] = useState(false);
  const [activeUser, setActiveUser] = useState(false);
  const [existing, setExisting] = useState(false);
  const [showImDoneButton, setShowImDoneButton] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState(location.state.role ? [location.state.role] : []);
  const { app, api, handleError, setAppData } = useAppContext();
  const currentRole = app.settings.kybRoles.find(role => role.name === location.state.role);

  const getEntity = async () => {
    console.log('Getting Entity ...');
    setMember({ loading: true });
    try {
      const res = await api.getEntity(activeUser.handle, activeUser.private_key);
      console.log('  ... completed!');
      if (res.data.success) {
        setMember(res.data);
        setSelectedRoles([...selectedRoles, ...res.data.memberships.filter(membership => !selectedRoles.length || selectedRoles.some(role => membership.role !== role)).map(membership => membership.role)]);
      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  };

  const handleActiveUser = (r, user) => {
    if (user && (currentRole === 'administrator' || selectedRoles.some(role => role === 'administrator'))) user.admin = true;
    if (user && app.settings.kybHandle) user.business_handle = app.settings.kybHandle;
    setActiveUser(user);
    setAppData({ users: app.users.some(u => u.handle === user.handle) ? app.users.map(u => u.handle === user.handle ? { ...u, ...user } : u) : [...app.users, user] });
  };
  useEffect(() => {
    if (activeUser) getEntity();
  }, [activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      {!activeUser && <div className="loaded">

        <div className="mb-2 d-flex">
          <h1 className="mb-0">{location.state.role === 'administrator' ? 'Business Administration' : location.state.role ? app.settings.kybRoles.find(role => role.name === location.state.role).label : 'Add a Business Member'}</h1>
        </div>

        {!handle && app.users.filter(user => !user.business).length !== 0 && <div className="loaded"><Form.Check custom id="register-user" className="mb-2 ml-n2" type="radio">
          <Form.Check.Input name="existing" onChange={() => { setActiveUser(false); setExisting(false); }} defaultChecked type="radio" />
          <Form.Check.Label className="ml-2 text-lg">Register and link a new user</Form.Check.Label>
        </Form.Check>
          <Form.Check custom id="existing-user" className="mb-2 ml-n2" type="radio">
            <Form.Check.Input name="existing" onChange={() => { setExisting(true); }} type="radio" />
            <Form.Check.Label className="ml-2 text-lg">Link an existing user</Form.Check.Label>
          </Form.Check></div>}

        {!existing ? <div className="loaded">
          {currentRole && currentRole.name === 'controlling_officer' && <p className="mb-3 text-muted text-lg">As a {currentRole.label}, personal information is required before we can move on with the business registration (KYB) process.</p>}
          {currentRole && currentRole.name === 'administrator' && <p className="mb-3 text-muted text-lg">As the {currentRole.label}, personal information is required before we can move on with the business registration (KYB) process.</p>}
          {currentRole && currentRole.name === 'beneficial_owner' && <p className="mb-3 text-muted text-lg">To link this business member to the Beneficial Owner role, we will need to gather more personal informaton before we can move on with the business registration (KYB) process.</p>}

          <CheckHandleForm page={page} disabled={activeUser} onSuccess={(handle) => setHandle(handle)} />

          <MemberKYBForm handle={handle} currentRole={currentRole} onSuccess={handleActiveUser} />
        </div>
          :
          <div className="mb-5 loaded position-relative select-menu-height" style={{ zIndex: 4 }}>
            <p className="text-lg text-muted mb-2 loaded">Select the user you wish to link to the business.</p>
            <SelectMenu fullWidth title="Choose a user..." options={app.users.filter(user => !user.business).map(user => ({ label: `${user.firstName} ${user.lastName} (${user.handle})`, value: user.handle }))} onChange={(handle) => handleActiveUser(undefined, app.users.find(user => user.handle === handle))} />
          </div>}

      </div>}

      {member && <div className="loaded">

        {member.loading ? <Loader /> : <div className="loaded">
          <LinkMemberForm member={{ ...activeUser, ...member }} onLinked={() => getEntity()} onUnlinked={() => getEntity()} onShowImDone={(status) => setShowImDoneButton(status)} />
          {showImDoneButton && <p className="mt-3 mb-0 text-center"><Button variant="outline-light" className="text-muted text-uppercase" onClick={() => history.goBack()}>I'm Done</Button></p>}
        </div>}

      </div>}

      <Pagination hideNext
        previousOnClick={() => history.goBack()}
        currentPage={page} />
    </Container>
  );
};

export default RegisterMember;
