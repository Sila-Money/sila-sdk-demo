import React from 'react';
import { Switch, Route } from 'react-router-dom';

import CustomRoute from './CustomRoute';

const RouteConfig = ({ routes }) => (
  <Switch>
    {routes.map((route, i) => <Route
      key={i}
      path={route.path}
      exact={route.exact}
      strict={route.strict}
      routes={route.routes}
      render={(props) => <CustomRoute route={route} {...props} />} />
    )}
  </Switch>
);

export default RouteConfig;