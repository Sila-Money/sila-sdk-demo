import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useHistory, NavLink } from 'react-router-dom';

import { useAppContext } from '../context/AppDataProvider';

import SelectMenu from '../common/SelectMenu';

import indvidualIcon from '../../assets/images/indvidual.svg';
import businessIcon from '../../assets/images/business.svg';

const NavbarUsers = () => {
  const { app, updateApp, setAppData, setNewUser } = useAppContext();
  const history = useHistory();

  const setActiveUser = (handle) => {
    const businessUser = app.users.find(user => user.handle === handle && user.business);
    const businessMember = app.users.find(user => user.handle === handle && user.business_handle);
    setAppData({
      settings: { ...app.settings, kybHandle: businessUser ? businessUser.handle : businessMember ? businessMember.business_handle : false },
      users: app.users.map(({ active, ...u }) => u.handle === handle ? { ...u, active: true } : u)
    }, () => {
      updateApp({ activeUser: app.users.find(u => u.handle === handle), kyc: {}, kyb: {} });
      history.go();
    });
  };

  return <div className="ml-md-4 d-flex align-items-center">
    <Form.Label className="mr-2 mb-0" htmlFor="account">{app.activeUser && app.activeUser.handle ? 'Business' : 'User'}:</Form.Label>
    <SelectMenu
      title={app.activeUser ? app.activeUser.handle : app.settings.flow ? `Creating a new ${app.settings.flow === 'kyb' ? 'business' : 'user'}` : 'Choose your flow...'}
      size="sm"
      onChange={setActiveUser}
      className="text-uppercase text-nowrap users"
      value={app.activeUser ? app.activeUser.handle : undefined}
      options={app.users.map(user => ({ label: user.handle, value: user.handle, htmlBefore: user.business ? <img src={businessIcon} width={16} height={16} alt="Business" className="mt-n1 mr-2" /> : 
      <img src={indvidualIcon} width={16} height={16} alt="Individual" className="mt-n1 mr-2" /> }))} />
    <Button as={NavLink} to="/" onClick={() => setNewUser(() => history.push('/'))} className="ml-2 text-nowrap" size="sm"><i className="fas fa-user-plus text-lg text-white"></i><span className="ml-2 d-none d-sm-inline">New Entity</span></Button>
  </div>;
}

export default NavbarUsers;