import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Card } from 'react-bootstrap';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

const CustomToggle = ({ children, eventKey, activeKey }) => {
  return (<div className={`d-flex ${activeKey === eventKey ? 'expand' : 'collapse'}`}>
    <div className="mr-auto d-flex align-items-center">
      <h2 className="ttl m-0 font-weight-bold">{children}</h2>
    </div>
    <div className="ml-auto d-flex align-items-center">
      <button className="toggle m-1 accordion-icon" type="button" onClick={useAccordionToggle(eventKey)}></button>
    </div>
  </div>)
};

const AccordionItem = ({ className, children, eventKey, activeKey, label, expanded, onSetExpanded, itemRef }) => {
  const isExpanded = expanded instanceof Array ? expanded.includes(eventKey) : expanded === eventKey;
  return (
    <Card className={className}>
      <Accordion.Toggle as={Card.Header} eventKey={eventKey} className={`px-3 py-3${isExpanded && ' active'}`} ref={itemRef} onClick={() => onSetExpanded(eventKey)}>
        <CustomToggle eventKey={eventKey} activeKey={activeKey}>{label}</CustomToggle>
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body className="p-0">{children}</Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

AccordionItem.propTypes = {
  /**
   * The unique key per item.
   */
  eventKey: PropTypes.number,
  /**
   * Whether the item is expanded, or not.
   */
  expanded: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.array.isRequired
  ]),
  /**
   * The function to be called after the item is expanded.
   */
  onSetExpanded: PropTypes.func.isRequired,
  /**
   * The label.
   */
  label: PropTypes.string.isRequired
};

export default AccordionItem;