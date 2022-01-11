import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Table } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';

import { DEFAULT_KYC } from '../constants';
import { formatDateAndTime } from '../utils';

const DocumentUpload = ({ history, page, previous, next, isActive }) => {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  let isLoading = useRef(false);
  let isDocTypesLoading = useRef(false);

  const { app, api, setAppData, handleError } = useAppContext();

  const onViewDocument = (e) => {}

  useEffect(() => {
    if(app.settings.preferredKycLevel !== DEFAULT_KYC) {
      history.push({ pathname: '/request_kyc', state: { from: page } });
    }

    async function fetchDocumentTypes() {
      try {
        if (isDocTypesLoading.current) return;
        isDocTypesLoading.current = true;
        const res = await api.getDocumentTypes();
        setAppData({
          responses: [{endpoint: '/document_types', result: JSON.stringify(res, null, '\t')}, ...app.responses]
        });
        setDocumentTypes((res.data.document_types && res.data.document_types.map(t => t.name ? { ...t, value: t.name } : t)) || undefined);
      } catch (err) {
        console.log('  ... looks like we ran into an issue in fetchDocumentTypes!');
        handleError(err);
      }
      isDocTypesLoading.current = false;
    };

    async function fetchDocuments() {
      try {
        setLoaded(false);
        if (isLoading.current) return;
        isLoading.current = true;
        const res = await api.listDocuments(app.activeUser.handle, app.activeUser.private_key);
        setAppData({
          responses: [{ endpoint: '/list_documents', result: JSON.stringify(res, null, '\t')}, ...app.responses]
        });
        setDocuments(res.data.documents);
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
      isLoading.current = false;
      setDocumentsLoaded(true);
      setLoaded(true);
    };

    if (app.settings.preferredKycLevel === DEFAULT_KYC && !documentTypes.length) fetchDocumentTypes();
    if(app.settings.preferredKycLevel === DEFAULT_KYC && !documentsLoaded && !documents.length) fetchDocuments();
  }, [documents, documentTypes, documentsLoaded, handleError, setAppData, api, app, history, page]);
  
  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Document Upload</h1>

      {app.settings.flow === 'kyc' && <p className="text-lg text-muted mb-4">When a user registers for Doc KYC, supporting documents are necessary to aid in verifying the identity of the end-user. All new and previously uploaded documents will be displayed below, with the ability to preview each. To test the documents endpoints, you may upload dummy documents here.</p>}

      {app.settings.flow === 'kyb' && <p className="text-lg text-muted mb-4">When a user registers for Doc KYB, supporting documents are necessary to aid verifying that the business is legitamate, as well as verifying the identities of the business members. All new and previously uploaded documents will be displayed below, with the ability to preview each. To test the documents endpoints, you may upload dummy documents here.</p>}

      <p className="text-muted mb-5">This page represents <a href="https://docs.silamoney.com/docs/documents" target="_blank" rel="noopener noreferrer">/documents</a>, <a href="https://docs.silamoney.com/docs/get_documents" target="_blank" rel="noopener noreferrer">/get_document</a>, <a href="https://docs.silamoney.com/docs/list_documents" target="_blank" rel="noopener noreferrer">/list_documents</a>, and <a href="https://docs.silamoney.com/docs/document_types" target="_blank" rel="noopener noreferrer">/document_types</a> functionality.</p>

      <div className="accounts position-relative mb-5">
        {!loaded && <Loader overlay />}
        <Table bordered responsive>
          <thead>
            <tr>
              <th className="text-lg bg-secondary text-dark font-weight-bold">Date Uploaded</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold">Document Name</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold">Document Type</th>
              <th className="text-lg bg-secondary text-dark font-weight-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loaded && documents.length > 0 ?
              documents.map((documents, index) =>
                <tr className="loaded" key={index}>
                  <td>{formatDateAndTime(documents.created)}</td>
                  <td>{documents.filename}</td>
                  <td>{documentTypes.length !== 0 && documentTypes.find(t => t.name === documents.type).label}</td>
                  <td className="text-center">
                    <div className="d-flex py-2 justify-content-center">
                      <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-1 px-1" onClick={() => onViewDocument()}>
                        <i className="sila-icon sila-icon-view text-lg"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) :
              <tr className="loaded">
                {loaded && documents.length === 0 ? <td><em>No documents added</em></td> : <td>&nbsp;</td>}
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            }
          </tbody>
        </Table>
      </div>

      <Button variant="link" className="d-flex ml-auto p-0 new-registration shadow-none" onClick={() => setShow(true)}>Add a new document +</Button>

      {app.alert.message && <div className="d-flex mt-3"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />
      
      <UploadDocumentModal documentTypes={documentTypes} show={show} onClose={() => setShow(false)} />

    </Container>
  );
};

export default DocumentUpload;
