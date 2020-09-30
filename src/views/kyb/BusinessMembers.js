import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';

import { useAppContext } from '../../components/context/AppDataProvider';

const BusinessMembers = ({ page, previous, next, history, location }) => {
  const [loaded, setLoaded] = useState(false);
  const [members, setMembers] = useState([]);
  const { api, app, setAppData, handleError, updateApp } = useAppContext();

  const getRolesAndMembersAndCheckKyc = async () => {
    console.log('Getting Roles, Business Members, and checking KYB ...');
    const businessUser = app.users.find(user => app.settings.kybHandle === user.handle);
    try {
      const [rolesResponse, entityResponse, kycResponse] = await Promise.all([
        api.getBusinessRoles(),
        api.getEntity(businessUser.handle, businessUser.private_key),
        api.checkKYC(businessUser.handle, businessUser.private_key)
      ]);
      if (rolesResponse.data.success && entityResponse.statusCode === 200 && kycResponse.statusCode === 200) {
        setAppData({
          settings: { ...app.settings, kybRoles: rolesResponse.data.business_roles },
          responses: [{
            endpoint: '/get_business_roles',
            result: JSON.stringify(rolesResponse, null, '\t')
          }, {
            endpoint: '/get_entity',
            result: JSON.stringify(entityResponse, null, '\t')
          }, ...app.responses]
        }, () => {
          setMembers(entityResponse.data.members.map(member => ({ ...member, ...kycResponse.data.members.find(kyc => member.user_handle === kyc.user_handle && member.role === kyc.role) })));
          setLoaded(true);
        });

      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    };
  };

  const handleClick = (e, handle) => {
    const isAction = e.target.closest && !e.target.closest('.actions');
    const isButton = !e.target.closest && !e.target.className.includes('btn');
    if (isAction || isButton) {
      history.push({ pathname: `/members/${handle}`, state: { from: page } });
    } else {
      e.preventDefault();
    }
  };

  const unlinkMember = async (role, handle) => {
    console.log('Unlinking Business Member ...');
    const activeUser = app.users.find(user => handle === user.handle);
    const businessUser = app.users.find(user => app.settings.kybHandle === user.handle);
    const deletedIndex = members.findIndex(member => member.user_handle === handle && member.role === role.name);
    let result = {};
    try {
      const res = await api.unlinkBusinessMember(activeUser.handle, activeUser.private_key, businessUser.handle, businessUser.private_key, role.name);
      if (res.data.status === 'SUCCESS') {
        result.alert = { message: `Successfully unlinked ${activeUser.firstName} ${activeUser.lastName} as a ${role.label}!`, type: 'success' };
        setMembers(members.slice(0, deletedIndex).concat(members.slice(deletedIndex + 1, members.length)));
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
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
    if (location.pathname === page && app.settings.kybHandle) {
      getRolesAndMembersAndCheckKyc();
    } else {
      history.push('/');
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Register Business Members</h1>

      <p className="text-meta text-lg mb-4">As a Partnership, we need to collect information on the following individuals. Administrator and Controlling Officer are required (though they can be the same person). If any individual owns more than 25% of this business, they must be added as a Beneficial Owner.</p>

      <p className="text-meta mb-0 mb-5">This page represents <a href="https://docs.silamoney.com/docs/get_business_roles" target="_blank" rel="noopener noreferrer">/get_business_roles</a>, <a href="https://docs.silamoney.com/docs/unlink_business_member" target="_blank" rel="noopener noreferrer">/unlink_business_member</a>, and <a href="https://docs.silamoney.com/docs/get_entity" target="_blank" rel="noopener noreferrer">/get_entity</a> functionality.</p>

      <div className="members position-relative">
        {!loaded ? <Loader overlay /> : <>

          <Card className="mb-4">
            <Table hover responsive>
              {loaded &&
                <>
                  <thead>
                    <tr className="bg-secondary">
                      <th className="text-lg px-3 py-2">Role</th>
                      {members.length !== 0 && <th className="text-lg px-3 py-2">Name</th>}
                      {members.length !== 0 && <th className="text-lg px-3 py-2">Handle</th>}
                      <th className="text-lg px-3 py-2">Status</th>
                      <th className="text-lg px-3 py-2">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...members, ...app.settings.kybRoles.filter(role => !members.length || members.every(member => member.role !== role.name))].sort((a, b) => a.role && b.role ? a.role.localeCompare(b.role) : a.name.localeCompare(b.name)).map((member, index) => {
                      let statusVariant, statusLabel;
                      if (member.user_handle) {
                        statusVariant = member.verification_status.includes('passed') ? 'success' : member.verification_status.includes('pending') ? 'primary' : member.verification_status.includes('failed') ? 'danger' : 'warning';
                        statusLabel = `KYC ${member.verification_status.charAt(0).toUpperCase() + member.verification_status.slice(1)}`;
                        return (
                          <tr key={index} className="loaded" onClick={(e) => handleClick(e, member.user_handle)}>
                            <td className="px-3 text-nowrap align-middle">{app.settings.kybRoles.find(role => role.name === member.role).label}</td>
                            <td className="px-3 text-nowrap">{`${member.first_name} ${member.last_name}`}</td>
                            <td className="px-3 text-nowrap">{member.user_handle}</td>
                            <td className="px-3">
                              <Badge pill className="badge-outline py-2 px-3" variant={statusVariant}>{statusLabel}</Badge>
                            </td>
                            <td className="actions text-right"><Button variant="link" className="p-1 mr-3 text-decoration-none" title="Unlink" onClick={() => unlinkMember(app.settings.kybRoles.find(role => role.name === member.role), member.user_handle)}><i className="sila-icon sila-icon-delete text-lg"></i></Button></td>
                          </tr>
                        );
                      } else {
                        statusVariant = member.name === 'beneficial_owner' ? 'primary' : 'warning';
                        statusLabel = member.name === 'beneficial_owner' ? 'Optional - Not Linked' : 'Required - Not Linked';
                        return (
                          <tr key={index} className="loaded" onClick={() => history.push({
                            pathname: '/members/register',
                            state: { role: member.name, from: page }
                          })}>
                            <td className="px-3 align-middle">{member.label}{member.name !== 'beneficial_owner' && <span className="text-primary" style={{ top: '-1rem' }}>*</span>}</td>
                            {members.length !== 0 && <td className="px-3"></td>}
                            {members.length !== 0 && <td className="px-3"></td>}
                            <td className="px-3">
                              <Badge pill className="badge-outline py-2 px-3" variant={statusVariant}>{statusLabel}</Badge>
                            </td>
                            <td>&nbsp;</td>
                          </tr>
                        );
                      }})}
                  </tbody>
                </>}
            </Table>
          </Card>

          <div className="d-flex">
            <span className="text-primary font-italic">* Indicates the role is required</span>
            <Button as={NavLink} to={{ pathname: '/members/register', state: { from: page } }} variant="secondary" size="sm" className="ml-auto">Add Business Member <i className="fas fa-plus-circle ml-2"></i></Button>
          </div>

        </>
        }
      </div>

      {app.alert.message && <div className="mt-4"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      <Pagination
        previous={previous}
        next={members.length && app.settings.kybRoles.filter(role => members.every(member => member.role !== role.name)).length <= 1 ? next : undefined}
        currentPage={page} />

    </Container>
  );
};

export default BusinessMembers;
