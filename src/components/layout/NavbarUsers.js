import React from 'react';
import { Button } from 'react-bootstrap';
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
      updateApp({ activeUser: false });
      history.push('/check_handle');
    });
  }

  return <>
    <SelectMenu
      title={!app.activeUser ? 'Creating New User' : undefined}
      size="sm"
      onChange={setActiveUser}
      className="ml-3 ml-md-4 text-uppercase"
      value={app.activeUser ? app.activeUser.handle : undefined}
      options={app.users.map(user => ({ label: user.handle, value: user.handle }))} />
    <Button onClick={handleNewUser} disabled={!app.activeUser} className="ml-2" size="sm"><i className="fas fa-user-plus text-lg text-white"></i></Button>
  </>;
}

export default NavbarUsers;