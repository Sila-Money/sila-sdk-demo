import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import { useAppContext } from './components/context/AppDataProvider';
import MainNavbar from './components/layout/MainNavbar';
import MainSidebar from './components/layout/MainSidebar';
import Loader from './components/common/Loader';
import Stepper from './components/common/Stepper';
import SettingsModal from './components/common/SettingsModal';
import ResetModal from './components/common/ResetModal';

import routes from './routes';

const App = () => {
  const { app, updateApp } = useAppContext();
  const history = useHistory();
  const classes = classNames(
    'main',
    'p-0'
  );

  useEffect(() => {
    const unlisten = history.listen((location) => {
      updateApp({ alert: {} });
    });
    return unlisten;
  }, [history]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateApp({ loaded: true });
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
          <Stepper items={routes.filter(route => route.stepper)} />
          <div className="main-content d-flex flex-column">
            <Switch>
              {routes.map((route, i) => (
                <Route
                  key={i}
                  path={route.path}
                  exact={route.exact}
                  strict={route.strict}
                  render={(props) => <route.component page={route.page || undefined} {...props} />}
                />
              ))}
            </Switch>
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