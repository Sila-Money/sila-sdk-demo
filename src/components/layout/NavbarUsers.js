import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import { useAppContext } from '../context/AppDataProvider';

import SelectMenu from '../common/SelectMenu';

const NavbarUsers = () => {
  const { app, updateApp, setAppData } = useAppContext();
  const history = useHistory();

  const setActiveUser = (handle) => {
    setAppData({
      users: app.users.map(({ active, ...u }) => u.handle === handle ? { ...u, active: true } : u)
    }, () => {
      updateApp({ activeUser: app.users.find(u => u.handle === handle), kyc: null });
      history.go();
    });
  }

  const handleNewUser = () => {
    setAppData({ 
      success: [],
      users: app.users.map(({ active, ...u }) => u)
    }, () => {
      updateApp({ activeUser: false, kyc: null, success: [] });
      history.push('/check_handle');
    });
  }

  return <div className="ml-md-4 d-flex align-items-center">
    <Form.Label className="mr-2 mb-0" htmlFor="account">User:</Form.Label>
    <SelectMenu
      title={app.activeUser ? app.activeUser.handle : 'Creating a new user'}
      size="sm"
      onChange={setActiveUser}
      className="text-uppercase text-nowrap users"
      value={app.activeUser ? app.activeUser.handle : undefined}
      options={app.users.map(user => ({ label: user.handle, value: user.handle }))} />
    <Button onClick={handleNewUser} disabled={!app.activeUser} className="ml-2 text-nowrap" size="sm"><i className="fas fa-user-plus text-lg text-white"></i><span className="ml-2 d-none d-sm-inline">New User</span></Button>
  </div>;
}

export default NavbarUsers;