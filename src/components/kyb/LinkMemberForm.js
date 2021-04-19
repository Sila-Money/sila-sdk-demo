import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import RangeSlider from 'react-bootstrap-range-slider';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from '../common/AlertMessage';

const LinkMemberForm = ({ member, onLinked, onUnlinked }) => {
  const { app, api, setAppData, updateApp, handleError } = useAppContext();
  const [ownershipStake, setOwnershipStake] = useState(0);
  const [details, setDetails] = useState('');
  const location = useLocation();

  const hasRole = (role) => member.memberships && member.memberships.some(membership => membership.role === role && membership.business_handle === app.settings.kybHandle);

  const linkMember = async (role) => {
    console.log('Linking Business Member ...');
    const activeUser = app.users.find(u => member.user_handle === u.handle);
    const businessUser = app.users.find(u => app.settings.kybHandle === u.handle);
    const ownership_stake = role.name === 'beneficial_owner' && ownershipStake ? (ownershipStake / 100).toFixed(2) : undefined;
    let result = {};
    try {
      const res = await api.linkBusinessMember(activeUser.handle, activeUser.private_key, businessUser.handle, businessUser.private_key, role.name, undefined, details, ownership_stake);
      if (res.data.success) {
        result.alert = { message: `Successfully linked as a ${role.label}!`, type: 'success' };
        result.activeUser = role.name === 'administrator' ? activeUser : app.activeUser;
        if (onLinked) onLinked({ handle: activeUser.handle, role: role.name });
        if (ownershipStake) setOwnershipStake(0);
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        settings: role.name === 'administrator' ? { ...app.settings, kybAdminHandle: activeUser.handle } : app.settings,
        users: app.users.map(u => u.handle === activeUser.handle ? { ...u, admin: true } : u),
        responses: [{
          endpoint: '/link_business_member',
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

  const unlinkMember = async (role) => {
    console.log('Unlinking Business Member ...');
    const activeUser = app.users.find(user => member.user_handle === user.handle);
    const businessUser = app.users.find(user => app.settings.kybHandle === user.handle);
    let result = {};
    try {
      const res = await api.unlinkBusinessMember(activeUser.handle, activeUser.private_key, businessUser.handle, businessUser.private_key, role.name);
      if (res.data.success) {
        result.alert = { message: `Successfully unlinked ${activeUser.firstName} ${activeUser.lastName} as a ${role.label}!`, type: 'success' };
        result.activeUser = role.name === 'administrator' ? businessUser : app.activeUser;
        if (onUnlinked) onUnlinked({ handle: activeUser.handle, role: role.name });
        if (ownershipStake) setOwnershipStake(0);
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        settings: role.name === 'administrator' ? { ...app.settings, kybAdminHandle: false } : app.settings,
        users: role.name === 'administrator' ? app.users.map(u => u.handle === activeUser.handle ? { ...u, admin: false } : u) : app.users,
        responses: [{
          endpoint: '/unlink_business_member',
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

  useEffect(() => {
    if (member && location.state.role && !hasRole(location.state.role)) {
      linkMember(app.settings.kybRoles.find(role => role.name === location.state.role));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <h1 className="mb-4">Link or unlink  {member.entity.entity_name} to this Business</h1>

      <Alert variant="info" className="mb-4">Once a business member has been registered, you can only link and unlink their account to a role in the business. You can not go back and edit personal details.</Alert>

      <p className="text-muted text-lg mb-4">Link or unlink your individual business member account to your role in this business. It is possible for one individual account to be linked as more than one role. You may provide an optional title to your account (such as CEO, CTO, etc,) as well as provide us with your ownership stake, if applicable. </p>

      <p className="text-muted mb-5">This page represents <a href="https://docs.silamoney.com/docs/link_business_member" target="_blank" rel="noopener noreferrer">/link_business_member</a> and <a href="https://docs.silamoney.com/docs/unlink_business_member" target="_blank" rel="noopener noreferrer">/unlink_business_member</a> functionality.</p>

      <Form.Group controlId="linkDetails">
        <Form.Control onChange={(e) => setDetails(e.target.value)} placeholder="Optional Position Title" name="detail" />
      </Form.Group>

      <div className="d-none d-xl-block">
        {app.settings.kybRoles.sort((a, b) => a.name !== 'beneficial_owner' ? -1 : 0).map((role, index) => (<div key={index} className="d-flex mt-4 align-items-center">
          <div>
            <p className="text-lg mb-0 text-muted">As a {role.label} of this Business</p>
            {role.name === 'beneficial_owner' && !hasRole(role.name) && <Form.Group className="mt-3 d-block text-nowrap">
              <Form.Label className="d-block text-muted">Ownership Percentage ({ownershipStake}%)</Form.Label>
              <RangeSlider value={ownershipStake} onChange={e => setOwnershipStake(parseInt(e.target.value))} tooltipLabel={(label) => `${label}%`} name="ownership_stake" />
              {!ownershipStake && <Form.Text className="text-muted mt-2 text-nowrap loaded">Ownership Percentage is required before you can link to this business.</Form.Text>}
            </Form.Group>}
          </div>
          <Button block size="sm" key={index} style={{ width: '260px' }} className="ml-auto text-center text-nowrap" disabled={role.name === 'beneficial_owner' && !ownershipStake && !hasRole(role.name)} onClick={() => hasRole(role.name) ? unlinkMember(role) : linkMember(role)}>{hasRole(role.name) ? 'Unlink' : 'Link'} as a {role.label}</Button>
        </div>
        ))}
      </div>

      <div className="d-block d-xl-none">
        {app.settings.kybRoles.sort((a, b) => a.name !== 'beneficial_owner' ? -1 : 0).map((role, index) => (<div key={index} className="d-flex mt-4 align-items-center">
          <p className="text-lg mb-3 text-muted">As a {role.label} of this Business</p>
          {role.name === 'beneficial_owner' && !hasRole(role.name) && <Form.Group className="mt-3">
            <Form.Label className="d-block text-muted">Ownership Percentage ({ownershipStake}%)</Form.Label>
            <RangeSlider value={ownershipStake} onChange={e => setOwnershipStake(parseInt(e.target.value))} tooltipLabel={(label) => `${label}%`} name="ownership_stake" />
            {!ownershipStake && <Form.Text className="text-muted mt-2 loaded">Ownership Percentage is required before you can link to this business.</Form.Text>}
          </Form.Group>}
          <Button key={index} className="w-100 text-center text-nowrap" disabled={role.name === 'beneficial_owner' && !ownershipStake && !hasRole(role.name)} onClick={() => hasRole(role.name) ? unlinkMember(role) : linkMember(role)}>{hasRole ? 'Unlink' : 'Link'} as a {role.label}</Button>
        </div>
        ))}
      </div>

      {app.alert.message && <div className="mt-5"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}
    </>
  );
};


export default LinkMemberForm;


