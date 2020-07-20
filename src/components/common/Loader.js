import React from 'react';
import { Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const Loader = ({ label, overlay, ...rest }) => (
  <div className={`loader overlay d-flex justify-content-center align-items-center text-center`}>
    <Spinner animation="border" role="status" variant="primary" {...rest}><span className="sr-only">Loading....</span></Spinner>
    {label && <p className="text-meta text-sm mt-2" dangerouslySetInnerHTML={{ __html: label }}></p>}
  </div>
);

Loader.propTypes = {
  /**
   * The optional label that is displayed underneath the spinner.
   */
  label: PropTypes.string,
  /**
   * Display the spinner in an optional overlay.
   */
  overlay: PropTypes.bool
};

export default Loader;