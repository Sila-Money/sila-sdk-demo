import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Container, Navbar, Button } from 'react-bootstrap';
import stickybits from 'stickybits';

import { useAppContext } from '../context/AppDataProvider';

import SilaLogo from '../common/SilaLogo';
import NavbarUsers from './NavbarUsers';

const MainNavbar = ({ stickyTop }) => {
  const { app, updateApp } = useAppContext();
  const classes = classNames(
    'border-bottom',
    'main-navbar',
    'px-4',
    stickyTop && 'sticky-top'
  );

  useEffect(() => {
    stickybits('.main .main-navbar', { useStickyClasses: true });
  }, []);
  
  return (
    <header className={classes}>
      <Navbar type="light" className="p-0">
        <Container className="my-auto justify-content-between">
          <Navbar.Brand href="/">
            <SilaLogo id="main-logo" height="30" className="d-inline-block align-middle mr-1 logo" />
          </Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <Button variant="link" size="sm" className="text-uppercase d-block p-0" onClick={() => { updateApp({ manageReset: true }); }}>Reset App</Button>
              <Button variant="link" size="sm" className="text-uppercase d-block p-0 ml-4" onClick={() => { updateApp({ manageSettings: true }); }}>App Settings</Button>
              {app.users.length > 0 && <NavbarUsers />}
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

MainNavbar.propTypes = {
  /**
   * Whether the main navbar is sticky to the top, or not.
   */
  stickyTop: PropTypes.bool
};

MainNavbar.defaultProps = {
  stickyTop: true
};

export default MainNavbar;
