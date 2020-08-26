import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import { useAppContext } from './components/context/AppDataProvider';
import MainNavbar from './components/layout/MainNavbar';
import MainSidebar from './components/layout/MainSidebar';
import VerticalNavbar from './components/layout/VerticalNavbar';
import MobileMenu from './components/layout/MobileMenu';
import Loader from './components/common/Loader';
import SettingsModal from './components/common/SettingsModal';
import ResetModal from './components/common/ResetModal';
import RouteConfig from './components/common/RouteConfig';

import routes from './routes';

const App = () => {
  const { app, updateApp } = useAppContext();
  const history = useHistory();
  const classes = classNames(
    'main',
    'p-0'
  );

  useEffect(() => {
    const unlisten = history.listen(() => {
      updateApp({ alert: {} });
    });
    return unlisten;
  }, [history]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const appData = { loaded: true };
    if (!app.auth) appData.manageSettings = true;
    updateApp({ ...appData });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className="p-0">
      {!app.loaded && <Loader overlay />}
      <MainNavbar />
      <Row noGutters>
        <Col
          className={classes}
          lg={{ span: 8 }}
          md={{ span: 8 }}
          sm={12}
          as="main"
        >
          <VerticalNavbar items={routes.filter(route => route.active)} />
          <MobileMenu items={routes.filter(route => route.active)} />
          <div className="main-content d-flex flex-column">
            <RouteConfig routes={routes} />
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