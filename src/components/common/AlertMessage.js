import React from 'react';
import { Fade, Spinner } from 'react-bootstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const AlertMessage = ({ message, type, noIcon, loading }) => {
  return (
    <Fade in={true}>
      <div className={classNames(!noIcon && 'd-flex align-items-center position-relative', `text-${type ? type : 'warning'}`)}>
        {!noIcon && <i className={classNames('mr-3', type === 'success' && 'sila-icon check', type === 'wait' && 'sila-icon info', (!type || (type !== 'success' && type !== 'wait')) && 'fas fa-exclamation')}></i>}
        {loading && <Spinner animation="border" role="status" variant="primary" size="sm" className="mr-2"></Spinner>}
        <span className="message">{message}</span>
      </div>
    </Fade>
  );
};

AlertMessage.propTypes = {
  /**
   * The text for the alert
   */
  message: PropTypes.string.isRequired,
  /**
   * The type of alert (success, danger, wait, etc.)
   */
  type: PropTypes.string,
  /**
   * The icon visibility toggle (visible by default)
   */
  noIcon: PropTypes.bool,
  /**
   * The loading toggle (disabled by default)
   */
  loading: PropTypes.bool
};

export default AlertMessage;