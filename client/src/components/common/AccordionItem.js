import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Card } from 'react-bootstrap';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

const CustomToggle = ({ children, eventKey, prepend, append, isExpanded, small }) => (
  <div className="d-flex">
    <div className="mr-auto d-flex align-items-center">
      {prepend}
      <h3 className={`ttl m-0${small ? ' text-reg' : ''}`}>{children}</h3>
    </div>
    <div className="ml-auto d-flex align-items-center">
      {append}
      <button
        className="toggle m-1"
        type="button"
        onClick={useAccordionToggle(eventKey)}>
        <i className={`text-primary fas fa-${isExpanded ? 'minus' : 'plus'}${!small ? ' text-lg' : ''}`}></i>
      </button>
    </div>
  </div>
);

const AccordionItem = ({ className, children, eventKey, label, expanded, onSetExpanded, prepend, append, itemRef, small }) => {
  const isExpanded = expanded instanceof Array ? expanded.includes(eventKey) : expanded === eventKey;
  return (
    <Card className={className}>
      <Accordion.Toggle as={Card.Header} eventKey={eventKey} className={`${small ? 'px-3 py-1' : 'px-4 py-3'}${isExpanded ? ' active' : ''}`} ref={itemRef} onClick={() => onSetExpanded(eventKey)}>
        <CustomToggle eventKey={eventKey} prepend={prepend} isExpanded={isExpanded} append={append} small={small}>{label}</CustomToggle>
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body className={small ? 'p-3' : 'p-4'}>{children}</Card.Body>
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
  label: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
};

export default AccordionItem;