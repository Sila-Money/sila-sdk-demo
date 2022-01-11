import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import AlertMessage from '../components/common/AlertMessage';
import Pagination from '../components/common/Pagination';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';

import { DEFAULT_KYC } from '../constants';

const DocumentUpload = ({ history, page, previous, next, isActive }) => {
  const { app } = useAppContext();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if(app.settings.preferredKycLevel !== DEFAULT_KYC) {
      history.push({ pathname: '/request_kyc', state: { from: page } });
    }
  }, [app]);
  
  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Document Upload</h1>

      {app.settings.flow === 'kyc' && <p className="text-lg text-muted mb-4">When a user registers for Doc KYC, supporting documents are necessary to aid in verifying the identity of the end-user. All new and previously uploaded documents will be displayed below, with the ability to preview each. To test the documents endpoints, you may upload dummy documents here.</p>}

      {app.settings.flow === 'kyb' && <p className="text-lg text-muted mb-4">When a user registers for Doc KYB, supporting documents are necessary to aid verifying that the business is legitamate, as well as verifying the identities of the business members. All new and previously uploaded documents will be displayed below, with the ability to preview each. To test the documents endpoints, you may upload dummy documents here.</p>}

      <p className="text-muted mb-5">This page represents <a href="https://docs.silamoney.com/docs/documents" target="_blank" rel="noopener noreferrer">/documents</a>, <a href="https://docs.silamoney.com/docs/get_documents" target="_blank" rel="noopener noreferrer">/get_document</a>, <a href="https://docs.silamoney.com/docs/list_documents" target="_blank" rel="noopener noreferrer">/list_documents</a>, and <a href="https://docs.silamoney.com/docs/document_types" target="_blank" rel="noopener noreferrer">/document_types</a> functionality.</p>

      <Button variant="link" className="d-flex ml-auto p-0 new-registration shadow-none" onClick={() => setShow(true)}>Add a new document +</Button>

      {app.alert.message && <div className="d-flex mt-3"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />
      
      <UploadDocumentModal show={show} onClose={() => setShow(false)} />

    </Container>
  );
};

export default DocumentUpload;
