import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Col, Dropdown, DropdownButton } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAppContext } from '../context/AppDataProvider';

import { flows } from '../../routes';

const NavItem = ({ route, number, show }) => {
  const [hover, setHover] = useState(false);
  const { app } = useAppContext();
  const location = useLocation();
  const success = app.activeUser && flows[app.settings.flow].routes.filter(route => app.success.some(success => success.handle === app.activeUser.handle && success.page === route)).pop();
  const isActive = (route.path && location.pathname.includes(route.path)) || (route.routes && route.routes.includes(location.pathname));
  const isEnabled = isActive || (app.activeUser && app.success.some(success => success.handle === app.activeUser.handle && success.page === route.path)) || flows[app.settings.flow].routes[flows[app.settings.flow].routes.indexOf(success) + 1] === route.path;
  const subRoutes = route.routes ? route.routes.filter(subroute => !subroute.disabled) : false;
  const classes = classNames('nav-item', !isEnabled && 'disabled', isActive && 'active');
  return <li
    className={classes}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    style={(hover || isActive) && show && isEnabled && subRoutes && subRoutes.length ? { marginTop: `-${(subRoutes.length * 2 + 1) / 2}rem`, paddingBottom: `${subRoutes.length * 2 + 1}rem` } : undefined}>
    <div className="nav-content">
      {isEnabled && !route.placeholder ? <NavLink to={{ pathname: route.path, state: { from: route.page } }} className="nav-title">{route.title}</NavLink> : <div className={`nav-title${!isActive ? ' text-info' : ''}`}>{route.title}</div>}
      {subRoutes && <div className="nav-links">{subRoutes.map((route, index) =>
        <NavLink key={index} to={{ pathname: route.path, state: { from: route.page } }} className="d-block mt-2 text-sm">{route.title}</NavLink>
      )}</div>}
    </div>
    <div className="nav-circle text-center"><span className="text-sm number">{number}</span></div>
    <div className="nav-progress-top"></div>
    <div className="nav-progress-bottom"></div>
  </li>
};

const MobileMenu = ({ routes }) => {
  const { app } = useAppContext();
  const location = useLocation();
  const currentRoute = routes.find(route => route.path === location.pathname) || routes[0];
  return (
    <Col
      className="mobile-menu d-block d-lg-none p-4 position-fixed border-bottom"
      lg={{ span: 8 }}
      md={{ span: 8 }}
      sm={12}>
      <DropdownButton size="lg" variant="outline-light" title={currentRoute.title}>
        {routes.filter(route => (app.activeUser && app.success.some(success => success.handle === app.activeUser.handle && success.page === route.path)) || location.pathname.includes(route.path)).map((route, index) => {
          const subRoutes = route.routes ? route.routes.filter(subroute => !subroute.disabled) : false;
          return (
            <div key={index}>
              <Dropdown.Item as={NavLink} to={{ pathname: route.path, state: { from: route.page } }}>{route.title}</Dropdown.Item>
              {subRoutes && subRoutes.length !== 0 && 
                <>
                  <Dropdown.Divider />
                  {subRoutes.map((route, index) =>
                    <Dropdown.Item key={index} className="text-sm pl-4" as={NavLink} to={{ pathname: route.path, state: { from: route.page } }}>
                      {route.title}
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                </>
              }
            </div>)
        })}
      </DropdownButton>
    </Col>
  );
};

const VerticalNav = ({ className, routes }) => {
  const [show, setShow] = useState(false);
  const classes = classNames(className, 'nav-menu d-flex flex-column h-100 py-5');
  return (
    <>
      <nav
        className="vertical-navbar overflow-auto custom-scrollbar d-none d-lg-block border-right"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}>
        <ul className={classes}>
          {routes.map((route, i) => <NavItem key={i} number={i + 1} routes={routes} route={route} show={show} />)}
        </ul>
      </nav>
      <MobileMenu routes={routes} />
    </>
  );
};

VerticalNav.propTypes = {
  /**
   * Optional classes
   */
  className: PropTypes.string,
  /**
   * Array of routes
   */
  routes: PropTypes.array.isRequired,
};

export default VerticalNav;
