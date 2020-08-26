import React from 'react';
import { Switch, Route } from 'react-router-dom';

const RouteConfig = ({ routes }) => (
  <Switch>
    {routes.map((route, i) => <Route
      key={i}
      path={route.path}
      exact={route.exact}
      strict={route.strict}
      render={(props) => <route.component page={route.page} routes={route.routes} {...props} />} />)}
  </Switch>
);

export default RouteConfig;