import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAppContext } from '../context/AppDataProvider';

const NavItem = ({ item, number }) => {
  const { app } = useAppContext();
  const location = useLocation();
  const classes = classNames('nav-item', location.pathname.includes(item.path) && 'active');
  const NavItemContent = () => (
    <>
      <div className="nav-content pr-5">
        <div className="nav-title">{item.title}</div>
        {item.routes && item.routes.length && <div className="nav-links">{item.routes.map((item, index) => ((item.restricted && app.activeUser) || (!item.restricted)) &&
          <NavLink key={index} to={{ pathname: item.path, state: { from: item.page } }} className="d-block mt-2 text-sm">{item.title}</NavLink>
        )}</div>}
      </div>
      <div className="nav-circle text-center"><span className="text-sm number">{number}</span></div>
      <div className="nav-progress-top"></div>
      <div className="nav-progress-bottom"></div>
    </>
  )
  return app.activeUser ? <li className={classes}><NavLink to={{ pathname: item.path, state: { from: item.page } }}><NavItemContent /></NavLink></li>
    : <li className={classes}><NavItemContent /></li>
};

const VerticalNav = ({ className, items }) => {
  const classes = classNames(className, 'nav-menu d-flex flex-column h-100 py-5');
  return (
    <nav className="vertical-navbar overflow-auto d-none d-lg-block">
      <ul className={classes}>
        {items.map((item, i) => <NavItem key={i} number={i + 1} item={item} />)}
      </ul>
    </nav>
  );
};

VerticalNav.propTypes = {
  /**
   * Optional classes
   */
  className: PropTypes.string,
  /**
   * Array of items
   */
  items: PropTypes.array.isRequired,
};

export default VerticalNav;
