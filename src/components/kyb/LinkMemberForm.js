import React, { useState } from 'react';
import { Col, Form, Button } from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from '../common/AlertMessage';

const LinkMemberForm = ({ member, isBo, onRolesDisabled, onMemberLinked, onMemberUnlinked }) => {
  const { app, api, setAppData, handleError } = useAppContext();
  const [ownershipStake, setOwnershipStake] = useState(0);
  const [details, setDetails] = useState('');
  const [alert, setAlert] = useState(false);
  const activeUser = app.users.find(user => member.user_handle === user.handle);
  const businessUser = app.users.find(user => app.settings.kybHandle === user.handle);
  const isBoOrMembership = isBo && !member.memberships.some(membership => membership.role === 'beneficial_owner');

  const linkMember = async (role) => {
    console.log('Linking Business Member ...');
    const ownership_stake = role.name === 'beneficial_owner' && ownershipStake ? (ownershipStake / 100).toFixed(2) : undefined;
    try {
      const res = await api.linkBusinessMember(activeUser.handle, activeUser.private_key, businessUser.handle, businessUser.private_key, role.name, undefined, details, ownership_stake);
      if (res.data.status === 'SUCCESS') {
        setAlert({ message: `Successfully linked as a ${role.label}!`, type: 'success' });
        if (onMemberUnlinked) onMemberLinked({ handle: activeUser.handle, role: role.name });
        if (ownershipStake) setOwnershipStake(0);
      } else {
        setAlert({ message: res.data.message, type: 'danger' });
      }
      setAppData({
        responses: [{
          endpoint: '/link_business_member',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    };
  };

  const unlinkMember = async (role) => {
    console.log('Unlinking Business Member ...');
    try {
      const res = await api.unlinkBusinessMember(activeUser.handle, activeUser.private_key, businessUser.handle, businessUser.private_key, role.name);
      if (res.data.status === 'SUCCESS') {
        setAlert({ message: `Successfully unlinked ${activeUser.firstName} ${activeUser.lastName} as a ${role.label}!`, type: 'success' });
        if (onMemberUnlinked) onMemberUnlinked({ handle: activeUser.handle, role: role.name });
        if (ownershipStake) setOwnershipStake(0);
      } else {
        setAlert({ message: res.data.message, type: 'danger' });
      }
      setAppData({
        responses: [{
          endpoint: '/unlink_business_member',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    };
  };

  return (
    <>
      {member.memberships.length !== app.settings.kybRoles.length && <Form.Row className={!isBoOrMembership ? 'mx-0' : undefined}>
        <Form.Group as={isBoOrMembership ? Col : undefined} className={!isBoOrMembership ? 'w-100' : undefined} controlId="linkDetails">
          <Form.Control onChange={(e) => setDetails(e.target.value)} placeholder="Title" name="detail" />
        </Form.Group>
        {isBoOrMembership && <Form.Group as={Col} controlId="linkOwnership" className="ml-auto w-50">
          <Form.Label className="d-block text-meta">Ownership Percentage ({ownershipStake}%)</Form.Label>
          <RangeSlider value={ownershipStake} onChange={e => setOwnershipStake(parseInt(e.target.value))} tooltipLabel={(label) => `${label}%`} name="ownership_stake" />
        </Form.Group>}
      </Form.Row>}

      <div className="mt-4 text-right">
        {app.settings.kybRoles.map((role, index) => {
          const hasRole = member.memberships.some(membership => membership.role === role.name);
          return <Button key={index} className="ml-3" disabled={(onRolesDisabled ? onRolesDisabled(role) : undefined) || (role.name === 'beneficial_owner' && isBoOrMembership && !ownershipStake)} onClick={() => hasRole ? unlinkMember(role) : linkMember(role)}>{hasRole ? 'Unlink' : 'Link'} as a {role.label}</Button>
        })}
      </div>

      {alert && <div className="mt-4"><AlertMessage message={alert.message} type={alert.type} onHide={() => setAlert(false)} /></div>}
    </>
  );
};

export default LinkMemberForm;