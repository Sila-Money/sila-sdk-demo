import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col } from 'react-bootstrap';
import classNames from 'classnames';

const Pagination = ({ className, previous, next, hidePrevious, hideNext, previousOnClick, nextOnClick, currentPage }) => {
  const classes = classNames(
    className,
    'pagination border-top border-light d-flex justify-content-between align-items-center px-4'
  );
  const previousDisabled = !previous && !previousOnClick;
  const nextDisabled = !next && !nextOnClick;
  return (
    <Col
      className={classes}
      lg={{ span: 8 }}
      md={{ span: 8 }}
      sm={12}>
      {hidePrevious ? <span></span> : <Button as={previous ? NavLink : undefined} variant="link" className={`p-0 text-lg ${previousDisabled ? 'disabled' : ''}`} onClick={previousOnClick || undefined} to={previous ? { pathname: previous, state: { from: currentPage } } : undefined}><FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back</Button>}
      {hideNext ? <span></span> : <Button as={next ? NavLink : undefined} variant="link" className={`p-0 text-lg ${nextDisabled ? 'disabled' : ''}`} onClick={nextOnClick || undefined} to={next ? { pathname: next, state: { from: currentPage } } : undefined}>Continue <FontAwesomeIcon icon={faArrowRight} className="ml-2" /></Button>}
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