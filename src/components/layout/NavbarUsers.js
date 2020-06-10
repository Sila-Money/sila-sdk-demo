import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

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

  return <SelectMenu
    title={app.activeUser ? app.activeUser.handle : 'Switch User'}
    size="sm" 
    onChange={setActiveUser} 
    className="ml-4 text-uppercase"
    options={app.users.map(user => ({ label: user.handle, value: user }))}
    action={location.pathname !== '/check_handle' ? { to: '/check_handle', label: 'Add User +' } : undefined} />;
}

export default NavbarUsers;