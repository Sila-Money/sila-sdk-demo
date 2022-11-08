import React, { useEffect } from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import stickybits from 'stickybits';

import { useAppContext } from '../context/AppDataProvider';

import SilaLogo from '../common/SilaLogo';
import NavbarUsers from './NavbarUsers';

const NavbarButtons = () => {
  const { updateApp } = useAppContext();
  return (<>
    <Button variant="link" size="sm" className="text-uppercase p-0 text-primary" as={NavLink} to="/">Home</Button>
    <Button variant="link" size="sm" className="text-uppercase p-0 ml-3 ml-md-4" onClick={() => { updateApp({ manageReset: true }); }}>Reset App</Button>
    <Button variant="link" size="sm" className="text-uppercase p-0 ml-3 ml-md-4" onClick={() => { updateApp({ manageSettings: true }); }}>App Settings</Button>
  </>);
};

const MainNavbar = ({ stickyTop }) => {
  const { app } = useAppContext();
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
          <Navbar.Brand as={NavLink} to="/">
            <SilaLogo id="main-logo" className="d-inline-block align-middle mr-1 logo" height="46" />
          </Navbar.Brand>
          <Navbar.Collapse className="d-block d-md-flex justify-content-end">
            <Navbar.Text>
              <div className="d-block d-md-none d-lg-none d-xl-none">
                <div className="d-block mb-3">
                  <div className="d-flex w-100 align-items-center justify-content-end">
                    <NavbarButtons />
                  </div>
                </div>
                {app.users.length > 0 && <div className="d-block">
                  <div className="d-flex w-100 justify-content-end">
                    <NavbarUsers />
                  </div>
                </div>}
              </div>
              <div className="d-none d-md-flex d-lg-flex d-xl-flex align-items-center justify-content-end">
                <NavbarButtons />
                {app.users.length > 0 && <NavbarUsers />}
              </div>
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