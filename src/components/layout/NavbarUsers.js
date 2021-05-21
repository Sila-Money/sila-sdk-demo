import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useHistory, useLocation, NavLink } from 'react-router-dom';

import { useAppContext } from '../context/AppDataProvider';

import SelectMenu from '../common/SelectMenu';

import indvidualIcon from '../../assets/images/indvidual.svg';
import businessIcon from '../../assets/images/business.svg';

import { handleHomeRedirect } from '../../utils';
import { flows } from '../../routes';

const NavbarUsers = () => {
  const { app, updateApp, setAppData, setNewUser } = useAppContext();
  const history = useHistory();
  const location = useLocation();

  const setActiveUser = (handle) => {
    const activeUser = app.users.find(u => u.handle === handle);
    setAppData({
      settings: { ...app.settings, 
        flow: activeUser.flow,
        kybHandle: activeUser && activeUser.business ? activeUser.handle : false,
        kybAdminHandle: activeUser && activeUser.admin ? activeUser : activeUser && activeUser.business && !activeUser.certified && app.users.some(u => u.admin && u.business_handle === activeUser.handle) ? app.users.find(u => u.admin && u.business_handle === activeUser.handle).handle : false
      },
      users: app.users.map(({ active, ...u }) => u.handle === handle ? { ...u, active: true } : u)
    }, () => {
      updateApp({ activeUser });
      history.push({ pathname: handleHomeRedirect(app, flows, activeUser.flow, handle), state: { from: location.pathname } });
    });
  };

  return <div className="ml-md-4 d-flex align-items-center">
    {app.activeUser && <Form.Label className="mr-2 mb-0" htmlFor="account">{app.settings.kybAdminHandle ? 'Administrator' : app.settings.kybHandle ? 'Business' : 'User'}:</Form.Label>}
    <SelectMenu
      title={app.activeUser ? (app.settings.kybAdminHandle || app.activeUser.handle) : app.settings.flow ? `New ${app.settings.flow === 'kyb' ? 'business' : 'individual'}...` : 'Register...'}
      size="sm"
      onChange={setActiveUser}
      className="text-nowrap users"
      value={app.activeUser ? (app.settings.kybAdminHandle || app.activeUser.handle) : undefined}
      options={app.users.filter(u => (!u.business_handle && !app.settings.kybAdminHandle) || (app.settings.kybAdminHandle && app.settings.kybHandle !== u.handle)).map(user => ({ label: user.handle, value: user.handle, htmlBefore: user.business ? <img src={businessIcon} width={16} height={16} alt="Business" className="mt-n1 mr-2" /> : 
      <img src={indvidualIcon} width={16} height={16} alt="Individual" className="mt-n1 mr-2" /> }))} />
    <Button as={NavLink} to="/" onClick={() => setNewUser(() => history.push('/'))} className="ml-2 text-nowrap" size="sm"><i className="fas fa-user-plus text-lg text-white"></i><span className="ml-2 d-none d-sm-inline">New Entity</span></Button>
  </div>;
}

export default NavbarUsers;