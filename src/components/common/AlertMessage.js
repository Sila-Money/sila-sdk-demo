import React from 'react';
import { Fade } from 'react-bootstrap';
import PropTypes from 'prop-types';

const AlertMessage = ({ message, type, noIcon }) => {
  const icon = type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'wait' ? 'wait' : 'info';
  return (
    <Fade in={true}>
      <p className={!noIcon ? 'd-flex align-items-center' : undefined}>
        {!noIcon && type !== 'warning' ? <i className={`mr-3 sila-icon sila-icon-${icon} text-${type && type !== 'wait' ? type : 'primary'}`}></i> : !noIcon ? <i class="fas fa-exclamation-triangle text-warning mr-3"></i> : null}
        <span className="message">{message}</span>
      </p>
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
   * The visibility toggle (visible by default)
   */
  noIcon: PropTypes.bool
};

export default AlertMessage;