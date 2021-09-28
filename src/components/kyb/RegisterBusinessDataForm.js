import React, { useState, useRef } from 'react';
import { Accordion, Table, Button } from 'react-bootstrap';

import { useAppContext } from '../../components/context/AppDataProvider';

import AccordionItem from '../../components/common/AccordionItem';

import { KYB_REGISTER_FIELDS_ARRAY, STATES_ARRAY } from '../../constants';


const RegisterBusinessDataForm = ({ errors, onConfirm, onLoaded, onErrors }) => {
  const [expanded, setExpanded] = useState(1);
  const [activeKey, setActiveKey] = useState(1);
  const registeredItemRef = useRef(null);
  const accordionItemProps = { expanded, onSetExpanded: setExpanded }

  const { app } = useAppContext();

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
            {KYB_REGISTER_FIELDS_ARRAY.filter(fieldsOption => app.activeUser && app.activeUser[fieldsOption.value]).map((fieldsOption, index) => {
              return (<tr key={index}>
                <td>{fieldsOption.label}</td>
                <td>{(fieldsOption.label === 'State') ? STATES_ARRAY.map((s) => { return s.value === app.activeUser[fieldsOption.value] ? s.label : '' }) : app.activeUser[fieldsOption.value]}</td>
                <td>
                  <div className="d-flex py-2">
                    <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none">
                      <i className="sila-icon sila-icon-edit text-lg"></i>
                    </Button>
                    <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-4 px-3"><i className="sila-icon sila-icon-delete text-lg"></i></Button>
                  </div>
                </td>
              </tr>)
            })}
          </tbody>
        </Table>
      </AccordionItem>
      <div className="mt-3">
        <div className="row mx-2">
          <div className="p-0 text-right col-md-12 col-sm-12">
            <Button variant="link" className="p-0 new-registration shadow-none">Add new registration data+</Button>
          </div>
        </div>
      </div>
    </Accordion>
  )
};

export default RegisterBusinessDataForm;
