import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Nav, Dropdown, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

const SelectMenu = ({ fullWidth, className, show, id, variant, options, onChange, value, size, action, title, disabledOptions }) => {
  const [menuTitle, setMenuTitle] = useState(title ? title : value ? options.find(option => option.value === value).label : options.length ? options[0].label : false);
  const menuItems = options.filter(option => option.label !== menuTitle);
  const classes = classNames(
    'select-menu flex-grow-0 flex-shrink-1',
    size === 'sm' && 'dropdown-small',
    fullWidth && 'w-100'
  );
  const buttonClasses = classNames(
    className,
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
    <Dropdown id={id} className={classes} as={Nav.Item}>
      <Dropdown.Toggle size={size} variant={variant || 'outline-light'} className={buttonClasses} as={Button}>{menuTitle}</Dropdown.Toggle>
      {((menuItems.length) || (!menuItems.length && action)) && <Dropdown.Menu show={show} className={menuClasses}>
        <div className="overflow-auto custom-scrollbar" style={{ maxHeight: 270 }}>
          {menuItems.filter(option => option.label !== menuTitle).map((option, index) => <Dropdown.Item key={index} eventKey={index + 1} onClick={() => handleChange(option)} className={itemClasses} disabled={(disabledOptions && disabledOptions.includes(option.value)) ? true : false}>{option.htmlBefore}{option.label}{option.htmlAfter}</Dropdown.Item>)}
          {action && <>
            {menuItems.length !== 0 && <Dropdown.Divider />}
            <Dropdown.Item as={action.to && NavLink} to={action.to} href={action.href} className={itemClasses}>{action.htmlBefore}{action.label}{action.htmlAfter}</Dropdown.Item>
          </>}
        </div>
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
   * Current value
   */
  value: PropTypes.any,
  /**
  * Action object { to: '', href: '', label: '' }
  */
  action: PropTypes.object,
  /**
  * Optional HTML before label
  */
  htmlBefore: PropTypes.node,
  /**
  * Optional HTML after label
  */
  htmlAfter: PropTypes.node,
};

export default SelectMenu;

