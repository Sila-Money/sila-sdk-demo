import React from 'react';
import { Button } from 'react-bootstrap';
import { useLocation, useHistory, NavLink } from 'react-router-dom';

import { useAppContext } from '../context/AppDataProvider';

import SelectMenu from '../common/SelectMenu';

const NavbarUsers = () => {
  const { app, updateApp, setAppData } = useAppContext();
  const location = useLocation();
  const history = useHistory();

  const setActiveUser = (user) => {
    setAppData({
      users: app.users.map(({ active, ...u }) => u.handle === user.handle ? { ...u, active: true } : u)
    }, () => {
      updateApp({ activeUser: user, kyc: null });
      history.go();
    });
  }

  return <>
    <SelectMenu
      title={location.pathname === '/check_handle' ? 'Creating New User' : app.activeUser ? app.activeUser.handle : undefined}
      size="sm"
      onChange={setActiveUser}
      className="ml-4 text-uppercase"
      options={app.users.map(user => ({ label: user.handle, value: user }))} />
    <Button as={NavLink} to="/check_handle" onClick={() => updateApp({ activeUser: false })} disabled={location.pathname === '/check_handle'} className="ml-2" size="sm"><i className="fas fa-user-plus text-lg text-white"></i></Button>
  </>;
}

export default NavbarUsers;