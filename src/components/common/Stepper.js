import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Col, DropdownButton, Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAppContext } from '../context/AppDataProvider';

const StepperItem = ({ item, number }) => {
  const { app } = useAppContext();
  const location = useLocation();
  const isDisabled = app.activeUser && (item.page === 'handle' || item.page === 'register');
  const classes = classNames(
    'step', 
    'text-center',
    isDisabled && 'disabled',
    item.path === location.pathname && 'active'
  );
  const StepperContent = () => (
    <>
      <div className={`step-title${isDisabled ? ' text-meta' : ''}`}>{item.title}</div>
      {item.description && <div className="step-optional text-meta text-sm">{item.description}</div>}
      <div className="step-circle"><span>{number}</span></div>
      <div className="step-bar-left"></div>
      <div className="step-bar-right"></div>
    </>
  )
  return app.activeUser && !isDisabled ? <NavLink className={classes} to={{ pathname: item.path, state: { from: item.page } }}><StepperContent /></NavLink>
    : <div className={classes}><StepperContent /></div>
};

const Stepper = ({ className, items }) => {
  const { app } = useAppContext();
  const location = useLocation();
  const hasDescription = items.find(item => item.description);
  const activeItem = items.find(item => item.path === location.pathname);
  return (
    <Col
      className="stepper p-0"
      lg={{ span: 8 }}
      md={{ span: 8 }}
      sm={12}>
      <div className="stepper-menu d-block d-lg-none p-4">
        <DropdownButton size="lg" variant="secondary" title={activeItem ? activeItem.title : items[0].title}>
          {items.map((item, index) => ((item.restricted && app.activeUser) || (!item.restricted)) && <Dropdown.Item key={index} as={NavLink} to={{ pathname: item.path, state: { from: item.page } }}>{item.title}</Dropdown.Item>)}
        </DropdownButton>
      </div>
      <div className="stepper-nav h-100 p-0 d-none d-lg-block">
        <div className={classNames(
          className,
          'd-flex',
          'flex-direction-row',
          'h-100',
          hasDescription && 'has-description'
        )}>
          {items.map((item, i) => <StepperItem key={i} number={i + 1} item={item} />)}
        </div>
      </div>
    </Col>
  );
};

Stepper.propTypes = {
  /**
   * Optional classes
   */
  className: PropTypes.string,
  /**
   * Array of items
   */
  items: PropTypes.array.isRequired,
};

export default Stepper;
