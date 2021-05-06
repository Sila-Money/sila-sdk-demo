import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useAppContext } from '../context/AppDataProvider';

import RouteConfig from './RouteConfig';

import { flows } from '../../routes';

const CustomRoute = ({ route, inFlow, ...props }) => {
  const { app, setAppData } = useAppContext();
  const pages = app.settings.flow ? flows[app.settings.flow].routes : [];

  useEffect(() => {
    setAppData({
      settings: { ...app.settings, kybAdminHandle: route.admin ? (app.activeUser && app.activeUser.admin ? app.activeUser.handle : app.activeUser && app.activeUser.business && app.users.some(u => u.admin && u.business_handle === app.activeUser.handle) ? app.users.find(u => u.admin && u.business_handle === app.activeUser.handle).handle : false) : false }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return props.location.pathname !== route.path && route.routes ? <RouteConfig routes={route.routes} inFlow={inFlow} /> : (
    <route.component
      page={route.path}
      routes={route.routes}
      previous={pages[pages.findIndex(p => p === route.path) - 1] || '/'}
      next={pages[pages.findIndex(p => p === route.path) + 1] || '/'}
      isActive={app.success.find(success => app.activeUser && success.handle === app.activeUser.handle && success.page === route.path) ? true : false}
      {...props}
    />
  );
};

CustomRoute.propTypes = {
  /**
   * The current route
   */
  route: PropTypes.object.isRequired,
  /**
   * If the current route is in the selected flow
   */
  inFlow: PropTypes.bool.isRequired
};

export default CustomRoute;