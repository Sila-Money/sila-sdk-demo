import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';

import { useAppContext } from '../context/AppDataProvider';

import SelectMenu from '../common/SelectMenu';
import { bytesToSize } from '../../utils';

const UploadDocumentModal = ({ documentTypes, show, onClose }) => {
  const [validated, setValidated] = useState(false);
  const [docType, setDocType] = useState(undefined);
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const maxFileSize = 20971520; // in bytes 20MB
  const { app, setAppData, updateApp } = useAppContext();

  const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#4E70F8',
    borderStyle: 'dashed',
    backgroundColor: '#F4F6FF',
    color: '#6D7892',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    fontSize:'20px'
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
        file['body'] = reader.result.replace(/^data:(\w+)\/(\w+);base64,/, '');
        setUploadedFile(file || undefined);
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
          filePath: uploadedFile.body,
          filename: uploadedFile.name,
          mimeType: uploadedFile.type,
          documentType: docType.name,
          identityType: docType.identity_type,
          name: docType.label
        };
        console.info(documentPayload);
        // TODOS: here document upload is pending due to new API waiting... will fix it soon!

        setAppData({
          responses: [{
            endpoint: '/documents',
            result: JSON.stringify({}, null, '\t')
          }, ...app.responses]
        }, () => {
          updateApp({ ...{ alert : { message: 'Document successfully uploaded.', type: 'success' } } });
          onCancel();
        });
      } catch (err) {
        console.log('  ... looks like we ran into an issue!');
      }
    }
  }

  const onTypeChange = (value) => {
    setDocType((value && documentTypes && documentTypes.find(option => option.value === value)) || undefined)
    if (uploadedFile) setValidated(true);
  }

  const onCancel = () => {
    setValidated(false);
    setDocType(undefined);
    setUploadedFile(undefined)
    onClose();
  }

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
              options={documentTypes ? documentTypes : []} />
          </Form.Group>

          <div className="d-flex flex-row">
            <div {...getRootProps({style})}>
              <input {...getInputProps()} />
              {!uploadedFile && <div className="my-3 text-center"><i className="sila-icon sila-icon-document ml-2" style={{fontSize:45}}></i><p className='d-flex align-items-center'>Drag your document here, or <Button variant="link" className="p-0 shadow-none btn btn-link text-underline font-lg font-weight-bold ml-1" onClick={open}> choose a file.</Button></p></div>}
              {uploadedFile && <div className="my-3 d-flex align-items-center w-100 justify-content-between">
                <div className='col d-flex justify-content-start align-items-center'><i className="sila-icon sila-icon-document mr-4 text-primary" style={{fontSize:45}}></i> <div><p className='m-0 font-weight-bold'>{uploadedFile.name}</p> <p className='m-0 font-italic'> <small>{bytesToSize(uploadedFile.size)}</small></p></div></div> <div className='col d-flex justify-content-end align-items-center font-weight-bold'><i className="mr-2 sila-icon sila-icon-success text-success"></i>Ready to go!</div></div>}
            </div>
          </div>
          {fileRejectionItems && <Form.Control.Feedback type="none" className="text-danger">{fileRejectionItems}</Form.Control.Feedback>}

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