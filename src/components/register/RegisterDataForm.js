import React, { useState, useRef } from 'react';
import { Accordion, Table, Button } from 'react-bootstrap';
import AccordionItem from '../../components/common/AccordionItem';

import { KYC_REGISTER_FIELDS_ARRAY, STATES_ARRAY } from '../../constants';


const RegisterDataForm = ({ app }) => {
  const [expanded, setExpanded] = useState(1);
  const [activeKey, setActiveKey] = useState(1);
  const registeredItemRef = useRef(null);
  const accordionItemProps = { expanded, onSetExpanded: setExpanded }

  return (
    <Accordion className="mb-3 mb-md-5" defaultActiveKey={expanded ? expanded : undefined} onSelect={e => setActiveKey(e)}>
      <AccordionItem className="registered-data" eventKey={1} label="Registered Data" activeKey={activeKey} itemRef={registeredItemRef} {...accordionItemProps}>
        <Table responsive hover>
          <thead>
            <tr>
              <th className="font-weight-bold">Registration Field</th>
              <th className="font-weight-bold">Data</th>
              <th className="font-weight-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {KYC_REGISTER_FIELDS_ARRAY.map((fieldsOption, index) => {
              if (app.activeUser && app.activeUser[fieldsOption.value]) {
                return (<tr key={index}>
                  <td>{fieldsOption.label}</td>
                  <td>{fieldsOption.label === 'State' ? STATES_ARRAY.map((u) => { return u.value === app.activeUser[fieldsOption.value] ? u.label : '' }) : app.activeUser[fieldsOption.value]}</td>
                  <td>
                    <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none">
                      <i className="sila-icon sila-icon-edit text-lg"></i>
                    </Button>
                    <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none">
                      <i className="sila-icon sila-icon-delete text-lg ml-3"></i>
                    </Button>
                  </td>
                </tr>)
              } else {
                return (null)
              }
            })}
          </tbody>
        </Table>
      </AccordionItem>
      <div className="mt-3">
        <div className="row mx-2">
          <div className="sms-notifications p-0 col-md-9 col-sm-12">
            {(app.activeUser && app.activeUser.smsOptIn) && <div className="text-left">SMS Notifications: <span>Requested</span></div>}
          </div>
          <div className="p-0 text-right col-md-3 col-sm-12">
            <Button variant="link" className="p-0 new-registration shadow-none">Add new registration data+</Button>
          </div>
        </div>
      </div>
    </Accordion>
  )
};

export default RegisterDataForm;
