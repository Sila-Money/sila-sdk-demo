import React from 'react';
import PropTypes from 'prop-types';

import RouteConfig from './RouteConfig';

import { flows } from '../../routes';

const CustomRoute = ({ route, app, inFlow, ...props }) => {
  const pages = app.settings.flow ? flows[app.settings.flow].routes : [];
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
   * The current app state
   */
  app: PropTypes.object.isRequired,
  /**
   * If the current route is in the selected flow
   */
  inFlow: PropTypes.bool.isRequired
};

export default CustomRoute;