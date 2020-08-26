import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Col, DropdownButton, Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAppContext } from '../context/AppDataProvider';

const MobileMenu = ({ className, items }) => {
  const { app } = useAppContext();
  const location = useLocation();
  const activeItem = items.find(item => item.path === location.pathname);
  const classes = classNames(className, 'mobile-menu d-block d-lg-none p-4 position-fixed border-bottom border-light');
  return (
    <Col
      className={classes}
      lg={{ span: 8 }}
      md={{ span: 8 }}
      sm={12}>
      <DropdownButton size="lg" variant="secondary" title={activeItem ? activeItem.title : items[0].title}>
        {items.map((item, index) => ((item.restricted && app.activeUser) || (!item.restricted)) &&
          <>
            <Dropdown.Item key={index} as={NavLink} to={{ pathname: item.path, state: { from: item.page } }}>{item.title}</Dropdown.Item>
            {item.routes && item.routes.length &&
              <div className="py-2 px-3 text-sm">
                {item.routes.map((item, index) => ((item.restricted && app.activeUser) || (!item.restricted)) &&
                  <Dropdown.Item key={index} as={NavLink} to={{ pathname: item.path, state: { from: item.page } }}>
                    {item.title}
                  </Dropdown.Item>
                )}
              </div>
            }
          </>
        )}
      </DropdownButton>
    </Col>
  );
};

MobileMenu.propTypes = {
  /**
   * Optional classes
   */
  className: PropTypes.string,
  /**
   * Array of items
   */
  items: PropTypes.array.isRequired,
};

export default MobileMenu;
