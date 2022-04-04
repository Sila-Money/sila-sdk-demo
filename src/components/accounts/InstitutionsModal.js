import React, { useState, useRef } from 'react';
import { Modal, Form, Button, Table, InputGroup } from 'react-bootstrap';

import Loader from '../../components/common/Loader';

const InstitutionsModal = ({ institutions, errors, isFetching, show, onSearch, onClose }) => {
  const [action, setAction] = useState({filtered: false, page: 1, loadMoreLable: 'Load more'});
  const institutionNameRef = useRef(null);
  const routingNumberRef = useRef(null);

  const searchInstitution = (e) => {
    e.preventDefault();
    if (isFetching) return;
    if(institutionNameRef.current.value || routingNumberRef.current.value) {
      onSearch({
        institution_name: institutionNameRef.current.value.trim() ? institutionNameRef.current.value : '',
        routing_number: routingNumberRef.current.value.trim() ? routingNumberRef.current.value : ''
      });
      setAction({...action, filtered: true, page: 1 });
    }
  }

  const loadMore = () => {
    if (isFetching) return;
    const pageNo = action.page + 1;
    if(pageNo > institutions.total_pages) {
      setAction({ ...action, loadMoreLable: ''});
      return;
    }
    setAction({ ...action, page: pageNo});
    onSearch({
      institution_name: institutionNameRef.current.value ? institutionNameRef.current.value : '',
      routing_number: routingNumberRef.current.value ? routingNumberRef.current.value : ''
    }, pageNo);
  }

  const clearSearch = () => {
    onSearch();
    institutionNameRef.current.value = '';
    routingNumberRef.current.value = '';
    setAction({ ...action, filtered: false, page: 1, loadMoreLable: 'Load more'});
  }

  const onCancel = () => {
    clearSearch();
    onClose();
  }

  return (
    <Modal centered
      show={show}
      size="xl"
      aria-labelledby="institution-modal-title"
      onHide={onCancel}>
      <Modal.Header className="text-left" closeButton>
        <Modal.Title id="institution-modal-title">Routing Number Directory</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={true} autoComplete="off" onSubmit={searchInstitution}>
          <Form.Group className="mb-3 input-italic" controlId="institutionName">
            <InputGroup className="mb-0">
              <Form.Control ref={institutionNameRef} placeholder="Search by institution name" aria-label="Search by institution name" name="institutionName" isInvalid={Boolean(errors && errors.search_filters && errors.search_filters.institution_name)} />
              <InputGroup.Append className="d-flex justify-content-between align-items-center">
                <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={searchInstitution}><i className="sila-icon sila-icon-search text-lg"></i></Button>
              </InputGroup.Append>
            </InputGroup>
            {errors && errors.search_filters && errors.search_filters.institution_name && <Form.Control.Feedback type="none" className="text-danger">{errors.search_filters.institution_name}</Form.Control.Feedback>}
          </Form.Group>

          <Form.Group className="mb-0 input-italic" controlId="RoutingNumber">
            <InputGroup className="mb-0">
              <Form.Control ref={routingNumberRef} placeholder="Search by routing number" aria-label="Search by routing number" name="RoutingNumber" type="number" isInvalid={Boolean(errors && errors.search_filters && errors.search_filters.routing_number)} />
              <InputGroup.Append className="d-flex justify-content-between align-items-center">
                <Button variant="link" className="p-0 text-decoration-none shadow-none mx-3" onClick={searchInstitution}><i className="sila-icon sila-icon-search text-lg"></i></Button>
              </InputGroup.Append>
            </InputGroup>
            {errors && errors.search_filters && errors.search_filters.routing_number && <Form.Control.Feedback type="none" className="text-danger">{errors.search_filters.routing_number}</Form.Control.Feedback>}
          </Form.Group>

          <Button type="submit" variant="primary" className="invisible"></Button>
        </Form>

        {action && action.filtered && <div className="d-flex mb-3">
          <Button variant="link" className="p-0 new-registration shadow-none btn btn-link ml-auto" onClick={clearSearch}><span className="lnk text-lg">Clear search results</span></Button>
        </div>}

        <div className="position-relative p-0 overflow-auto" style={{ height: 500 }}>
          {isFetching && <Loader overlay />}
          <Table bordered responsive className="headborder">
            <thead>
              <tr>
                <th className="text-lg bg-lightblue text-dark font-weight-bold">Institution Name</th>
                <th className="text-lg bg-lightblue text-dark font-weight-bold">Routing Number</th>
                <th className="text-lg bg-lightblue text-dark font-weight-bold">Location</th>
                <th className="text-lg bg-lightblue text-dark font-weight-bold">Auth</th>
                <th className="text-lg bg-lightblue text-dark font-weight-bold">Balance</th>
                <th className="text-lg bg-lightblue text-dark font-weight-bold">Identity</th>
              </tr>
            </thead>
            <tbody>
              {institutions.data.length > 0 ?
                institutions.data.map((institution, index) =>
                  <tr className="loaded" key={index}>
                    <td>{institution.name}</td>
                    <td>{institution.routing_number}</td>
                    <td>{institution.address ? `${institution.address.city}, ${institution.address.state}, ${institution.address.postal_code}` : ''}</td>
                    <td className="text-center">{institution.products.includes('auth') ? <i className="sila-icon sila-icon-blue-dot" style={{fontSize:'7px'}}></i>  : ''}</td>
                    <td className="text-center">{institution.products.includes('balance') ? <i className="sila-icon sila-icon-blue-dot" style={{fontSize:'7px'}}></i> : ''}</td>
                    <td className="text-center">{institution.products.includes('identity') ? <i className="sila-icon sila-icon-blue-dot" style={{fontSize:'7px'}}></i> : ''}</td>
                  </tr>
                ) :
                <tr className="loaded">
                  {institutions.data.length === 0 ? <td><em>No Institutions found</em></td> : <td>&nbsp;</td>}
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
                <th colSpan={6} onClick={loadMore}>
                  {action.loadMoreLable && institutions.total_count > institutions.perPage && <Button variant='secondary' className="shadow-none btn btn-lg btn-block ml-auto">{!isFetching ? action.loadMoreLable : 'Please wait' } ...</Button>}
                </th>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InstitutionsModal;
