import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Button, Col } from 'react-bootstrap';
import classNames from 'classnames';

const Pagination = ({ className, previous, next, hidePrevious, hideNext, previousOnClick, nextOnClick, currentPage }) => {
  const classes = classNames(
    className,
    'pagination border-top d-flex justify-content-between align-items-center px-4'
  );
  const previousDisabled = !previous && !previousOnClick;
  const nextDisabled = !next && !nextOnClick;
  return (
    <Col
      className={classes}
      lg={{ span: 8 }}
      md={{ span: 8 }}
      sm={12}>
      {hidePrevious ? <span></span> : <Button as={previous && NavLink} variant="link" className={`no-underline p-0 text-lg ${previousDisabled ? 'disabled' : ''}`} onClick={previousOnClick} to={previous && { pathname: previous, state: { from: currentPage } }}><i className="sila-icon long-arrow-left text-lg mr-2"></i> Back</Button>}
      {hideNext ? <span></span> : <Button as={next && NavLink} variant="link" className={`no-underline p-0 text-lg ${nextDisabled ? 'disabled' : ''}`} onClick={nextOnClick} to={next && { pathname: next, state: { from: currentPage } }}>Continue <i className="sila-icon long-arrow-right text-lg ml-2"></i></Button>}
    </Col>
  );
};

Pagination.propTypes = {
  /**
   * Previous link
   */
  previous: PropTypes.string,
  /**
   * Hide previous link (must be true / false)
   */
  hidePrevious: PropTypes.bool,
  /**
   * Previous custom click function
   */
  previousOnClick: PropTypes.func,
  /**
   * Next link
   */
  next: PropTypes.string,
  /**
   * Hide previous link (must be true / false)
   */
  hideNext: PropTypes.bool,
  /**
   * Next custom click function
   */
  nextOnClick: PropTypes.func,
  /**
   * Current page name
   */
  currentPage: PropTypes.string.isRequired
};

export default Pagination;