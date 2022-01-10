import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from '../common/AlertMessage';
import SelectMenu from '../common/SelectMenu';
import { bytesToSize } from '../../utils';

const UploadDocumentModal = ({ show, onClose }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [docType, setDocType] = useState(undefined);
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const [documentTypeList, setDocumentTypeList] = useState(undefined);
  const maxFileSize = 20971520; // in bytes 20MB
  let isLoading = useRef(false);

  const { api, app, setAppData, handleError } = useAppContext();

  const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };
  
  const activeStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };
  
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => console.log('file reading was aborted.')
      reader.onerror = () => console.log('file reading has failed.')
      reader.onload = () => {
        const fileBinaryStr = reader.result;
        if (fileBinaryStr) {
          file['dataUri'] = fileBinaryStr.replace(/^data:(\w+)\/(\w+);base64,/, '');
          setUploadedFile(file || undefined);
        }
			}
      reader.readAsDataURL(file);
    });
    if (docType) setValidated(true);
  }, [docType])

  const {fileRejections, getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, open} = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png, application/pdf',
    maxFiles:1,
    maxSize: maxFileSize,
    noClick: true,
    noKeyboard: true
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [isDragActive, isDragReject, isDragAccept, baseStyle, activeStyle, acceptStyle, rejectStyle]);

  const fileRejectionItems = fileRejections.map(({ errors }) => errors.map(e => (<p key={e.code}>{e.message}</p>)))

  const onDocumentSubmit = (e) => {
    e.preventDefault();
    if (validated && docType && uploadedFile) {
      try {
        const documentPayload = {
          filePath: uploadedFile.dataUri,
          filename: uploadedFile.name,
          mimeType: uploadedFile.type,
          documentType: docType.name,
          identityType: docType.identity_type,
          name: docType.label
        };
        console.info(documentPayload);
        // TODOS: here document upload is pending due to some blocker... will fix it soon!
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
    }
  }

  const onTypeChange = (value) => {
    setDocType((value && documentTypeList && documentTypeList.find(option => option.value === value)) || undefined)
    if (uploadedFile) setValidated(true);
  }

  const onCancel = () => {
    setValidated(false);
    setDocType(undefined);
    setUploadedFile(undefined)
    onClose();
  }

  useEffect(() => {
    async function fetchDocumentTypes() {
      try {
        if (isLoading.current) return;
        isLoading.current = true;
        const res = await api.getDocumentTypes();
        if (res.statusCode === 200) {
          setDocumentTypeList((res.data.document_types && res.data.document_types.map(t => t.name ? { ...t, value: t.name } : t)) || undefined);
        } else {
          console.log('Unabe to fetch document types ...', res);
        }
        setAppData({
          responses: [{
            endpoint: '/document_types',
            result: JSON.stringify(res, null, '\t')
          }, ...app.responses]
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
        handleError(err);
      }
      isLoading.current = false;
    };
    
    if(!documentTypeList) {
      fetchDocumentTypes();
    }
  }, [api, app, handleError, setAppData, documentTypeList]);

  return (
    <Modal centered
      show={show}
      size="lg"
      aria-labelledby="upload-document-modal-title"
      onHide={onCancel}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="upload-document-modal-title" className="d-flex">Upload a Document</Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} autoComplete="off" encType="multipart/form-data" onSubmit={onDocumentSubmit}>
        <Modal.Body>
          <p className="text-muted mb-4">Please make sure all information on the document is visible and clear. We accept files in these formats: PNG, JPG, and PDF, no larger than 20MB.</p>

          <Form.Group className="mb-3">
            <Form.Label>Choose your document type:</Form.Label>
            <SelectMenu fullWidth
              title="Choose type"
              onChange={(value) => onTypeChange(value)}
              className="types mb-4"
              value={docType}
              options={documentTypeList ? documentTypeList : []} />
            {errors.doc_type && <Form.Control.Feedback type="none" className="text-danger">{errors.doc_type}</Form.Control.Feedback>}
          </Form.Group>

          <div className="d-flex flex-row">
            <div {...getRootProps({style})}>
              <input {...getInputProps()} />
              {!uploadedFile && <p className="mt-3">Drag your document here, or <Button variant="link" className="p-0 shadow-none btn btn-link" onClick={open}>choose a file.</Button></p>}
              {uploadedFile && <p className="mt-3">{uploadedFile.name} {bytesToSize(uploadedFile.size)}</p>}
            </div>
          </div>

          {fileRejectionItems && <Form.Control.Feedback type="none" className="text-danger">{fileRejectionItems}</Form.Control.Feedback>}

          {errors.auth && <AlertMessage noHide message={errors.auth} type="danger" />}

        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" className="text-decoration-none ml-3 p-2 px-4" disabled={!validated}>Add Document</Button>
          <Button variant="outline-light" className="p-2 px-4" onClick={onCancel}>Cancel</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UploadDocumentModal;