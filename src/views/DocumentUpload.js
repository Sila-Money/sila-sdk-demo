import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Table } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';

import { DEFAULT_KYC, KYB_STANDARD } from '../constants';
import { formatDateAndTime, b64toBlob } from '../utils';

const DocumentUpload = ({ history, page, previous, next }) => {
  const { app, api, setAppData, handleError } = useAppContext();
  const userHandle = app.settings.flow === 'kyb' ? app.settings.kybHandle : app.activeUser.handle;
  const activeUser = app.users.find(user => user.handle === userHandle);
  const isActive = app.success.find(success => activeUser && success.handle === activeUser.handle && success[app.settings.flow] && success.page === page) ? true : false;
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const [preview, setPreview] = useState({ show: false, data: undefined });
  const [documents, setDocuments] = useState([])
  const [documentTypes, setDocumentTypes] = useState([]);
  let isLoading = useRef(false);
  let isDocTypesLoading = useRef(false);
  let updatedResponses = useRef([]);
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  const onDocumentView = async (document) => {
    if (document) {
      setPreview({ ...preview, show: true });
      try {
        const res = await api.getDocument(activeUser.handle, activeUser.private_key, document.document_id);
        if (res['statusCode'] === 200) {
          var encodedData = new Buffer(res['data'].toString(), "binary").toString("base64");
          const blob = b64toBlob(encodedData, res['headers']['content-type']);
          let previewData = { show: true, data: { ...document, file_type: 'image', file: URL.createObjectURL(blob) } };
          if (!imageTypes.includes(res['headers']['content-type'])) {
            previewData.data['file_type'] = 'pdf';
          }
          setPreview(previewData);
        }

        // Removed file binary content response due to localStorage quota limit exceeded error handling.
        res['data'] = '';
        setAppData({
          responses: [{
            endpoint: '/get_document', result: JSON.stringify(res, null, '\t')
          }, ...app.responses]
        });
      } catch (err) {
        setPreview({ show: false, data: undefined })
        console.log('  ... looks like we ran into an issue in getDocument!');
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoaded(false);
      if (isLoading.current) return;
      isLoading.current = true;
      const res = await api.listDocuments(activeUser.handle, activeUser.private_key);
      updatedResponses.current = [{ endpoint: '/list_documents', result: JSON.stringify(res, null, '\t') }, ...updatedResponses.current];
      setAppData({
        responses: [...updatedResponses.current, ...app.responses]
      });
      setDocuments(res.data.documents);
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    isLoading.current = false;
    setLoaded(true);
  };

  const fetchDocumentTypes = async () => {
    try {
      if (isDocTypesLoading.current) return;
      isDocTypesLoading.current = true;
      const res = await api.getDocumentTypes();
      updatedResponses.current = [{ endpoint: '/document_types', result: JSON.stringify(res, null, '\t') }, ...updatedResponses.current];
      setDocumentTypes((res.data.document_types && res.data.document_types.map(t => t.name ? { ...t, value: t.name } : t)) || undefined);
      setAppData({
        responses: [...updatedResponses.current, ...app.responses]
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue in fetchDocumentTypes!');
      handleError(err);
    }
    isDocTypesLoading.current = false;
  };

  useEffect(() => {
    fetchDocuments();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDocumentTypes();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if((app.settings.flow === 'kyc' && app.settings.preferredKycLevel !== DEFAULT_KYC) || (app.settings.flow === 'kyb' && app.settings.preferredKybLevel !== KYB_STANDARD)) {
      history.push({ pathname: app.settings.flow === 'kyb' ? '/certify' : '/wallets', state: { from: page } });
    }
  }, [app, history, page]);

  useEffect(() => {
    setAppData({
      success: documents.length && !isActive ? [...app.success, { handle: userHandle, [app.settings.flow]: true, page }] : app.success,
    });
  }, [userHandle, documents]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">Document Upload</h1>

      {app.settings.flow === 'kyc' && <p className="text-lg text-muted mb-1">When a user registers for Doc KYC, supporting documents are necessary to aid in verifying the identity of the end-user. All new and previously uploaded documents will be displayed below, with the ability to preview each. To test the documents endpoints, you may upload dummy documents here.</p>}

      {app.settings.flow === 'kyb' && <p className="text-lg text-muted mb-1">When a user registers for Doc KYB, supporting documents are necessary to aid verifying that the business is legitamate, as well as verifying the identities of the business members. All new and previously uploaded documents will be displayed below, with the ability to preview each. To test the documents endpoints, you may upload dummy documents here.</p>}

      <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/documents" target="_blank" rel="noopener noreferrer">/documents</a>, <a href="https://docs.silamoney.com/docs/get_documents" target="_blank" rel="noopener noreferrer">/get_document</a>, <a href="https://docs.silamoney.com/docs/list_documents" target="_blank" rel="noopener noreferrer">/list_documents</a>, and <a href="https://docs.silamoney.com/docs/document_types" target="_blank" rel="noopener noreferrer">/document_types</a> functionality.</p>

      <div className="accounts position-relative mb-3">
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
              documents.map((document, index) =>
                <tr className="loaded" key={index}>
                  <td>{formatDateAndTime(document.created)}</td>
                  <td>{document.filename}</td>
                  <td>{documentTypes.length !== 0 && documentTypes.find(t => t.name === document.type).label}</td>
                  <td className="text-center">
                    <div className="d-flex py-2 justify-content-center">
                      <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-1 px-1" onClick={() => onDocumentView(document) }>
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

      {app.alert.message && <div className="d-flex mt-2"><AlertMessage message={app.alert.message} type={app.alert.type} /></div>}

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />
      
      <UploadDocumentModal activeUser={activeUser} documentTypes={documentTypes} show={show} onClose={() => setShow(false)} onSuccess={fetchDocuments} />
      <DocumentPreviewModal data={preview.data} show={preview.show} onHide={() => setPreview({ show: false, data: undefined })} />

    </Container>
  );
};

export default DocumentUpload;
