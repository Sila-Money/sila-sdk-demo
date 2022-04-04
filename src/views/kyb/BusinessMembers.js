import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage';

import { useAppContext } from '../../components/context/AppDataProvider';

import { KYB_RECEIVE_ONLY, KYB_STANDARD } from '../../constants';

const isRoleRequired = (member) => {
  const role = member.name || member.role;
  return (role === 'controlling_officer' || role === 'administrator');
};

const RoleDescription = ({ role }) => {
  const description = role === 'controlling_officer' ?
    'Required. A controlling_officer is an individual who is in a leadership position and has the ability to sign contracts for the business.' :
    role === 'administrator' ?
      'Required. An administrator is the user who is responsible for setting up the business and must be used to certify the validity of the information provided for the business and Beneficial Owners.' :
      'Conditional. Some business types need to have all individuals with a greater than 25% ownership stake in the company linked and certified by the Administrator. See /get_business_roles for more information.';
  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={(props) => <Tooltip id={`${role}-tooltip`} className="ml-2 w-100" {...props}>{description}</Tooltip>}
    >
      <i className="sila-icon sila-icon-info text-primary ml-2"></i>
    </OverlayTrigger>
  );
};

const BusinessMembers = ({ page, previous, next, isActive }) => {
  const [loaded, setLoaded] = useState(false);
  const [members, setMembers] = useState([]);
  const { api, app, setAppData, handleError, updateApp } = useAppContext();
  const businessUser = app.users.find(user => app.settings.kybHandle === user.handle);
  const rolesAndMembers = [...members, ...app.settings.kybRoles.filter(role => !members.length || members.every(member => member.role !== role.name))];
  const allMembersAdded = rolesAndMembers.length && rolesAndMembers.filter(member => member.label && isRoleRequired(member)).length === 0;

  const getRolesAndMembers = async () => {
    console.log('Getting Roles, Business Members, and checking KYB ...');
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

  const unlinkMember = async (role, handle) => {
    console.log('Unlinking Business Member ...');
    const activeUser = app.users.find(user => handle === user.handle);
    const deletedIndex = members.findIndex(member => member.user_handle === handle && member.role === role.name);
    let result = {};
    try {
      const res = await api.unlinkBusinessMember(activeUser.handle, activeUser.private_key, businessUser.handle, businessUser.private_key, role.name);
      if (res.data.success) {
        result.alert = { message: `Successfully unlinked ${activeUser.firstName} ${activeUser.lastName} as a ${role.label}!`, type: 'success' };
        result.activeUser = role.name === 'administrator' ? businessUser : app.activeUser;
        setMembers(members.slice(0, deletedIndex).concat(members.slice(deletedIndex + 1, members.length)));
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
    if (allMembersAdded) {
      setAppData({
        success: !isActive ? [...app.success, { handle: businessUser.handle, page }] : app.success,
      }, () => {
        updateApp({ alert: { message: 'Success! All required business members have now been registered, you may now continue to the KYB process, or add more business members if necessary.', type: 'success' } });
      });
    }
  }, [members]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getRolesAndMembers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">Business Information</h1>

      <p className="text-muted text-lg mb-1">We need to collect information on the following individuals. Each business type requires different roles to be registered, below you will see which ones are required for your business and which are optional. Add the required business members to get started with the process, and add any additional business members as necessary.</p>

      <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/get_business_roles" target="_blank" rel="noopener noreferrer">/get_business_roles</a>, <a href="https://docs.silamoney.com/docs/unlink_business_member" target="_blank" rel="noopener noreferrer">/unlink_business_member</a>, and <a href="https://docs.silamoney.com/docs/get_entity" target="_blank" rel="noopener noreferrer">/get_entity</a> functionality.</p>

      <div className="members position-relative">
        {!loaded ? <Loader overlay /> : <>

          <Card className="mb-3 text-nowrap">
            <Table responsive>
              <thead>
                <tr className="bg-secondary">
                  <th width="1%" className="text-lg pl-3 py-2">Role</th>
                  <th>&nbsp;</th>
                  {members.length !== 0 && <th className="text-lg px-3 py-2">Name</th>}
                  {members.length !== 0 && <th className="text-lg px-3 py-2">Handle</th>}
                  <th className="text-lg px-3 py-2" width="20%">Status</th>
                  <th className="text-lg px-3 py-2" width="1%">Action</th>
                </tr>
              </thead>
              <tbody>
                {rolesAndMembers.sort((a, b) => isRoleRequired(a) ? -1 : isRoleRequired(b) ? 1 : 0).map((member, index) => {
                  return member.user_handle ? (
                    <tr key={index} className="loaded">
                      <td width="1%" className="pl-3 align-middle">{app.settings.kybRoles.find(role => role.name === member.role).label}</td>
                      <td className="align-middle"><RoleDescription role={member.role} /></td>
                      <td className="px-3">{`${member.first_name} ${member.last_name}`}</td>
                      <td className="px-3">{member.user_handle}</td>
                      <td className="px-3" width="20%">
                        <Badge pill className="badge-outline py-2 px-3 w-100" variant="success">Linked</Badge>
                      </td>
                      <td className="actions" width="1%">
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 250, hide: 400 }}
                          overlay={(props) => <Tooltip id="edit-tooltip" {...props}>Edit</Tooltip>}
                        >
                          <Button variant="link" className="p-1 mr-2 text-decoration-none" as={NavLink} to={{ pathname: `/members/${member.user_handle}`, state: { role: member.role, from: page } }}><i className="sila-icon sila-icon-edit text-lg"></i></Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 250, hide: 400 }}
                          overlay={(props) => <Tooltip id="unlink-tooltip" {...props}>Unlink</Tooltip>}
                        >
                          <Button variant="link" className="p-1 mr-2 text-decoration-none text-reset" title="" onClick={() => unlinkMember(app.settings.kybRoles.find(role => role.name === member.role), member.user_handle)}><i className="fas fa-unlink text-lg"></i></Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ) : (
                      <tr key={index} className="loaded">
                        <td className="pl-3 align-middle">{member.label}{isRoleRequired(member) && <span className="text-primary" style={{ top: '-1rem' }}>*</span>}</td>
                        <td className="align-middle"><RoleDescription role={member.name} /></td>
                        {members.length !== 0 && <td className="px-3"></td>}
                        {members.length !== 0 && <td className="px-3"></td>}
                        <td className="px-3">
                          <Badge pill className="badge-outline py-2 px-3 w-100" variant={isRoleRequired(member) ? 'warning' : 'primary'}>{isRoleRequired(member) ? 'Required' : 'Optional'}</Badge>
                        </td>
                        <td className="actions">
                          <Button size="sm" as={NavLink} to={{ pathname: '/members/register', state: { role: member.name, from: page } }}>{members.some(member => member.user_handle) ? 'Add' : 'Add Business Member'}</Button>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </Table>
          </Card>

          <div className="d-flex">
            <span className="text-primary font-italic">* Indicates the role is required</span>
            <Button variant="link" className="p-0 important ml-auto" as={NavLink} to={{ pathname: '/members/register', state: { from: page } }}>Add Additonal Business Members +</Button>
          </div>

        </>
        }
      </div>

      {app.alert.message && <div className="mt-3"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      <Pagination
        previous={previous}
        next={app.settings.preferredKybLevel === KYB_RECEIVE_ONLY ? '/request_kyc' : members.length && rolesAndMembers.filter(member => member.label && isRoleRequired(member)).length === 0 ? app.settings.preferredKybLevel !== KYB_STANDARD ? '/request_kyc' : next : undefined}
        currentPage={page} />

    </Container>
  );
};

export default BusinessMembers;
