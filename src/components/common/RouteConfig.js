import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { useAppContext } from '../../components/context/AppDataProvider';

import { flows } from '../../routes';

const RouteConfig = ({ routes }) => {
  const { app } = useAppContext();
  return (
    <Switch>
      {routes.map((route, i) => <Route
        key={i}
        path={route.path}
        exact={route.exact}
        strict={route.strict}
        routes={route.routes}
        render={(props) => {
          const pages = app.settings.flow ? flows[app.settings.flow] : false;
          return (
            <route.component
              page={route.path}
              routes={route.routes}
              previous={pages ? pages[pages.findIndex(p => p === route.path) - 1] : '/'}
              next={pages ? pages[pages.findIndex(p => p === route.path) + 1] : undefined}
              isActive={app.success.find(success => app.activeUser && success.handle === app.activeUser.handle && success.page === route.path) ? true : false}
              {...props}
            />);
        }} />)}
    </Switch>
  );
};

export default RouteConfig;