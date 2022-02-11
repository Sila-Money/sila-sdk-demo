import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';

import Loader from '../../components/common/Loader';

const DocumentPreviewModal = ({ data, show, onHide }) => {
  const [loading, setLoading] = useState(false);
  const [pdfRef, setPdfRef] = useState();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef();
  const containerRef = useRef();
  const currentPage = 1;

  const renderPage = useCallback((pageNum, pdf = pdfRef) => {
    dimensions.width && dimensions.height && pdf && pdf.getPage(pageNum).then(function (page) {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width =  dimensions.width;
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };
      page.render(renderContext);
    });
  }, [pdfRef, dimensions]);

  useEffect(() => {
    if (data && data.file_type === 'pdf') renderPage(currentPage, pdfRef);
  }, [data, pdfRef, currentPage, renderPage]);

  useEffect(() => {
    if (data && data.file_type === 'pdf') {
      setLoading(true);
      const script = document.createElement('script');
      script.src = "https://mozilla.github.io/pdf.js/build/pdf.js";
      script.async = true;
      document.body.appendChild(script);
      script.addEventListener('load', () => {
        const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'; // Just for testing...
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
          setPdfRef(pdf);
          setLoading(false);
        }, function (error) {
          setLoading(false);
          console.info("Unable to load pdf file.", error);
        });
      });
      if(data) setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    }
  }, [data]);

  return (
    <Modal centered
      backdrop="static"
      show={show}
      size={data && data.file_type === 'pdf' ? 'xl' : 'lg'}
      aria-labelledby="upload-document-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="upload-document-modal-title" className="d-flex">Document Preview: {data ? data.filename : undefined} </Modal.Title>
      </Modal.Header>
      <Modal.Body ref={containerRef} className="p-0 overflow-auto" style={{ height: 500 }}>
        {!data && !loading ? <Loader /> : <>
          {data.file_type === 'pdf' ? <canvas className="loaded" ref={canvasRef}></canvas> : <div className="d-flex w-100 h-100 justify-content-center align-items-center"><img style={{ maxWidth: '100%' }} src={data.file} alt={data ? data.filename : undefined} /></div>}
        </>}
      </Modal.Body>
    </Modal>
  );
};

export default DocumentPreviewModal;
