import React, { useState, useRef } from 'react';
import { Modal, Form, Button, Table } from 'react-bootstrap';

import Loader from '../../components/common/Loader';

const InstitutionsModal = ({ institutions, show, onSearch, onClose }) => {
  const [action, setAction] = useState({loading: false, filtered: false, loadMoreLable: 'Click to load more'});
  const institutionNameRef = useRef(null);
  const routingNumberRef = useRef(null);

  const searchInstitution = (e) => {
    e.preventDefault();
    if(e.target.institutionName.value || e.target.RoutingNumber.value) {
      setAction({ ...action, loading: true});
      onSearch({
        institution_name: e.target.institutionName.value ? e.target.institutionName.value : '',
        routing_number: e.target.RoutingNumber.value ? e.target.RoutingNumber.value : ''
      });
      setAction({...action, filtered: true, loading: false });
    }
  }

  const loadMore = () => {
    setAction({ ...action, loadMoreLable: 'Wait loading'});
    onSearch({}, 2, 100);
  }

  const clearSearch = () => {
    onSearch();
    institutionNameRef.current.value = '';
    routingNumberRef.current.value = '';
    setAction({ ...action, filtered: false});
  }

  const dotStyle = {
    height: 7,
    width: 7,
    backgroundColor: '#3F63F7',
    borderRadius: '50%',
    display: 'inline-block'
  }



  return (
    <Modal centered
      show={show}
      size="xl"
      aria-labelledby="institution-modal-title"
      onHide={onClose}>
      <Modal.Header className="text-left" closeButton>
        <Modal.Title id="institution-modal-title">Routing Number Directory</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={true} autoComplete="off" onSubmit={searchInstitution}>
          <Form.Group className="mb-3">
            <Form.Control ref={institutionNameRef} id="institutionName" placeholder="Search by institution name" aria-label="Search by institution name" name="institutionName" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control ref={routingNumberRef} id="RoutingNumber" placeholder="Search by routing number" aria-label="Search by routing number" name="RoutingNumber" />
          </Form.Group>
          <Button type="submit" variant="primary" className="invisible"></Button>
        </Form>

        {action && action.filtered && <div className="d-flex mb-3">
          <Button variant="link" className="p-0 new-registration shadow-none btn btn-link ml-auto" onClick={clearSearch}><span className="lnk text-lg">Clear search results</span></Button>
        </div>}

        <div className="position-relative p-0 overflow-auto" style={{ height: 500 }}>
          {action && action.loading && <Loader overlay />}
          <Table bordered responsive id="smart-list-box">
            <thead>
              <tr>
                <th className="text-lg bg-secondary text-dark font-weight-bold">Institution Name</th>
                <th className="text-lg bg-secondary text-dark font-weight-bold">Routing Number</th>
                <th className="text-lg bg-secondary text-dark font-weight-bold">Location</th>
                <th className="text-lg bg-secondary text-dark font-weight-bold">Auth</th>
                <th className="text-lg bg-secondary text-dark font-weight-bold">Balance</th>
                <th className="text-lg bg-secondary text-dark font-weight-bold">Identity</th>
              </tr>
            </thead>
            <tbody>
              {institutions.length > 0 ?
                institutions.map((institution, index) =>
                  <tr className="loaded" key={index}>
                    <td>{institution.name}</td>
                    <td>{institution.routing_number}</td>
                    <td>{institution.address ? `${institution.address.city}, ${institution.address.state}, ${institution.address.postal_code}` : ''}</td>
                    <td className="text-center">{institution.products.includes('auth') ? <span style={dotStyle}></span> : ''}</td>
                    <td className="text-center">{institution.products.includes('balance') ? <span style={dotStyle}></span> : ''}</td>
                    <td className="text-center">{institution.products.includes('identity') ? <span style={dotStyle}></span> : ''}</td>
                  </tr>
                ) :
                <tr className="loaded">
                  {institutions.length === 0 ? <td><em>No Institutions found</em></td> : <td>&nbsp;</td>}
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={6} className="text-lg bg-secondary text-dark font-weight-bold text-center" onClick={loadMore}>Click to load more ...</th>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InstitutionsModal;