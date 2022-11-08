import React from 'react';
import PropTypes from 'prop-types';

const DisabledOverlay = ({ children }) => (
  <div className="disabled-overlay position-absolute w-100 h-100 d-flex justify-content-center"><div className="content py-2 px-3 mb-0 mx-5 rounded text-white align-self-center">{children}</div></div>
);

DisabledOverlay.propTypes = {
  /**
   * The message that is displayed in the overlay.
   */
  children: PropTypes.node.isRequired
};

export default DisabledOverlay;