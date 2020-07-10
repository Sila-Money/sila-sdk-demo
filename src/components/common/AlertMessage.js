import React, { useState, useEffect } from 'react';
import { Fade } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { useAppContext } from '../context/AppDataProvider';

const AlertMessage = ({ message, type, noIcon, noHide }) => {
  const [show, setShow] = useState(true);
  const { updateApp } = useAppContext();
  const icon = type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'wait' ? 'wait' : 'info';

  useEffect(() => {
    let showTimer, hideTimer;
    if (show) {
      if (!noHide) {
        showTimer = setTimeout(() => setShow(false), 10000);
      }
    } else {
      hideTimer = setTimeout(() => updateApp({ alert: {} }), 300);
    }
    return () => clearTimeout(showTimer, hideTimer);
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Fade in={show}>
      <p>
        {!noIcon && <i className={`mr-2 sila-icon sila-icon-${icon} text-${type && type !== 'wait' ? type : 'primary'}`}></i>}
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