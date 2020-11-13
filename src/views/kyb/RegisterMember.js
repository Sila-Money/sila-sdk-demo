import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import RegisterUserForm from '../../components/register/RegisterUserForm';
import LinkMemberForm from '../../components/kyb/LinkMemberForm';
import CheckHandleForm from '../../components/common/CheckHandleForm';
import AlertMessage from '../../components/common/AlertMessage';
import Pagination from '../../components/common/Pagination';
import SelectMenu from '../../components/common/SelectMenu';

const RegisterMember = ({ page, isActive, location, history }) => {
  const [handle, setHandle] = useState(false);
  const [member, setMember] = useState(false);
  const [activeUser, setActiveUser] = useState(false);
  const [existing, setExisting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(location.state.role ? [location.state.role] : []);
  const { app, api, handleError, setAppData } = useAppContext();
  const currentRole = app.settings.kybRoles.find(role => role.name === location.state.role);

  const getEntity = async () => {
    console.log('Getting Entity ...');
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

  const handleActiveUser = (user) => {
    setActiveUser(user);
    setAppData({
      users: app.users.map(u => u.handle === user.handle ? { ...u, business_handle: app.settings.kybHandle } : u)
    });
  };

  useEffect(() => {
    if (activeUser) getEntity();
  }, [activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <div className="mb-4 d-flex">
        <h1 className="mb-0">{location.state.role === 'administrator' ? 'Business Administration' : location.state.role ? app.settings.kybRoles.find(role => role.name === location.state.role).label : app.activeUser.entity_name ? `Add ${app.activeUser.entity_name} as a Business Member` : 'Add a Business Member'}</h1>
        <Button variant="outline-light" className="text-muted text-uppercase ml-auto" onClick={() => history.goBack()}>Back</Button>
      </div>

      {activeUser && handle && <p className="text-muted mb-0 mb-5 loaded">This page represents <a href="https://docs.silamoney.com/docs/link_business_member" target="_blank" rel="noopener noreferrer">/link_business_member</a> functionality.</p>}

      {!handle && app.users.filter(user => !user.business).length !== 0 && <><Form.Check custom id="register-user" className="mb-4 ml-n2" type="radio">
        <Form.Check.Input name="existing" onChange={() => { setActiveUser(false); setExisting(false); }} defaultChecked type="radio" />
        <Form.Check.Label className="ml-2 text-lg">Register and link a new user</Form.Check.Label>
      </Form.Check>
        <Form.Check custom id="existing-user" className="mb-5 ml-n2" type="radio">
          <Form.Check.Input name="existing" onChange={() => { setExisting(true); }} type="radio" />
          <Form.Check.Label className="ml-2 text-lg">Link an existing user</Form.Check.Label>
        </Form.Check></>}

      {!activeUser && !existing ? <>
        <p className="mb-4 text-muted text-lg">As {currentRole ? `the ${currentRole.label}` : 'a business member'}, personal information is required before we can move on with the business registration (KYB) process.</p>

        <CheckHandleForm page={page} disabled={activeUser} onSuccess={(handle) => setHandle(handle)} />

        <RegisterUserForm
          className="mt-4"
          page={page}
          handle={handle}
          isActive={isActive}
          description="Please fill out the below fields for this business member."
          onSuccess={handleActiveUser}>

          <div className="d-flex mt-4">
            {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
            <Button type="submit" className="ml-auto" disabled={!handle || activeUser}>Register</Button>
          </div>

        </RegisterUserForm>

      </> : <>

          {existing && <div className="mb-5 loaded position-relative" style={{ zIndex: 4 }}>
            <p className="text-lg text-muted mb-4 loaded">Select the user you wish to link to the business.</p>
            <SelectMenu fullWidth title="Choose a user..." options={app.users.filter(user => !user.business).map(user => ({ label: `${user.firstName} ${user.lastName} (${user.handle})`, value: user.handle }))} onChange={(handle) => handleActiveUser(app.users.find(user => user.handle === handle))} />
          </div>}

          {member && <div className="loaded">

            <div className="mt-5"><LinkMemberForm member={member} onLinked={() => getEntity()} onUnlinked={() => getEntity()} /></div>
            <p className="mt-5 mb-0 text-center"><Button variant="outline-light" className="text-muted text-uppercase" onClick={() => history.goBack()}>I'm Done</Button></p>

          </div>}

        </>}

      <Pagination hideNext
        previousOnClick={() => history.goBack()}
        currentPage={page} />
    </Container>
  );
};

export default RegisterMember;