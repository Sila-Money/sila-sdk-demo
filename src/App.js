import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import { useAppContext } from './components/context/AppDataProvider';

import MainNavbar from './components/layout/MainNavbar';
import MainSidebar from './components/layout/MainSidebar';
import VerticalNavbar from './components/layout/VerticalNavbar';
import Loader from './components/common/Loader';
import RouteConfig from './components/routes/RouteConfig';
import SettingsModal from './components/common/SettingsModal';
import ResetModal from './components/common/ResetModal';

import routes, { flows } from './routes';

const App = () => {
  const { app, updateApp } = useAppContext();
  const history = useHistory();
  const location = useLocation();
  const inFlow = app.settings.flow && flows[app.settings.flow].routes.some(route => route.includes(location.pathname.split('/')[1]));

  console.log(flows[app.settings.flow].routes);
  console.log(location.pathname.split('/')[1]);

  useEffect(() => {
    const unlisten = history.listen(() => {
      updateApp({ alert: {} });
    });
    return unlisten;
  }, [history]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateApp({ loaded: true, manageSettings: !app.auth });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className="p-0">
      {!app.loaded && <Loader overlay />}
      <MainNavbar />
      <Row noGutters>
        <Col
          className="main p-0"
          lg={{ span: 8 }}
          md={{ span: 8 }}
          sm={12}
          as="main"
        >
          {location.pathname !== '/' && inFlow && <VerticalNavbar routes={routes.filter(route => route[app.settings.flow] || (!route.disabled && flows[app.settings.flow].routes.includes(route.path))).sort((a, b) => flows[app.settings.flow].routes.indexOf(a.path) - flows[app.settings.flow].routes.indexOf(b.path))} />}
          <div className="main-content d-flex flex-column">
            <RouteConfig routes={routes} inFlow={inFlow} />
          </div>
        </Col>
        <MainSidebar />
      </Row>
      <SettingsModal />
      <ResetModal />
    </Container>
  );
};

export default App;
