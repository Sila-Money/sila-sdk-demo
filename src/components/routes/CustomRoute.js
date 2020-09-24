import React from 'react';
import PropTypes from 'prop-types';

import RouteConfig from './RouteConfig';

import { useAppContext } from '../context/AppDataProvider';

import { flows } from '../../routes';

const stripTrailingSlash = (str) => str.substr(-1) === '/' ? str.substr(0, str.length - 1) : str;

const CustomRoute = ({ route, ...props }) => {
  const { app } = useAppContext();
  const pages = app.settings.flow ? flows[app.settings.flow] : false;
  return stripTrailingSlash(props.location.pathname) !== route.path && route.routes ? <RouteConfig routes={route.routes} /> : (
    <route.component
      page={route.path}
      routes={route.routes}
      previous={pages && pages[pages.findIndex(p => p === route.path) - 1] ? pages[pages.findIndex(p => p === route.path) - 1] : '/'}
      next={pages ? pages[pages.findIndex(p => p === route.path) + 1] : undefined}
      isActive={app.success.find(success => app.activeUser && success.handle === app.activeUser.handle && success.page === route.path) ? true : false}
      {...props}
    />
  );
};

CustomRoute.propTypes = {
  /**
   * The current route
   */
  route: PropTypes.object.isRequired
};

export default CustomRoute;