import React from 'react';
import { Fade, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AlertMessage = ({ message, type, noIcon, loading }) => {
  const icon = type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'wait' ? 'wait' : 'info';
  return (
    <Fade in={true}>
      <div className={!noIcon ? 'd-flex align-items-center position-relative' : undefined}>
        {!noIcon && type !== 'warning' ? <i className={`mr-3 sila-icon sila-icon-${icon} text-${type && type !== 'wait' ? type : 'primary'}`}></i> : !noIcon ? <i class="fas fa-exclamation text-warning mr-3"></i> : null}
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