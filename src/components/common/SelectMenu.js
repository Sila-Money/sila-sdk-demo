import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Nav, Dropdown, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

const SelectMenu = ({ fullWidth, className, show, id, variant, options, onChange, value, size, action, title }) => {
  const [menuTitle, setMenuTitle] = useState(title ? title : value ? options.find(option => option.value === value).label : options.length ? options[0].label : false);
  const menuItems = options.filter(option => option.label !== menuTitle);
  const classes = classNames(
    'select-menu',
    size === 'sm' && 'dropdown-small',
    fullWidth && 'w-100'
  );
  const buttonClasses = classNames(
    className,
    size !== 'sm' && 'p-3',
    'text-left text-reset  pr-5',
    fullWidth && 'w-100'
  );
  const menuClasses = classNames(
    'justify-content-end',
    size === 'sm' && 'dropdown-menu-small',
    fullWidth && 'w-100'
  );
  const itemClasses = 'px-3 py-2 text-reset';
  const handleChange = (option) => {
    onChange(option.value);
    setMenuTitle(option.label);
  }

  useEffect(() => {
    if (title) setMenuTitle(title);
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dropdown id={id || undefined} className={classes} as={Nav.Item}>
      <Dropdown.Toggle size={size || undefined} variant={variant || 'outline-light'} className={buttonClasses} as={Button}>{menuTitle} </Dropdown.Toggle>
      {((menuItems.length) || (!menuItems.length && action)) && <Dropdown.Menu show={show} className={menuClasses}>
        {menuItems.filter(option => option.label !== menuTitle).map((option, index) => <Dropdown.Item key={index} eventKey={index + 1} onClick={() => handleChange(option)} className={itemClasses}>{option.label}</Dropdown.Item>)}
        {action && <>
          {menuItems.length !== 0 && <Dropdown.Divider />}
          <Dropdown.Item as={action.to ? NavLink : undefined} to={action.to || undefined} href={action.href || undefined} className={itemClasses}>{action.label}</Dropdown.Item>
        </>}
      </Dropdown.Menu>}
    </Dropdown>
  );
};

SelectMenu.propTypes = {
  /**
   * Element ID
   */
  id: PropTypes.string,
  /**
   * Variant style for button (primary, secondary, etc.)
   */
  variant: PropTypes.string,
  /**
   * Options array [{ value: '', label: '' },{ value: '', label: '' }]
   */
  options: PropTypes.array.isRequired,
  /**
   * 
   */
  value: PropTypes.string,
  /**
  * Action object { to: '', href: '', label: '' }
  */
  action: PropTypes.object
};

export default SelectMenu;