import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';

import Loader from '../../components/common/Loader';

const DocumentPreviewModal = ({ data, show, onHide }) => {
  const [loading, setLoading] = useState(false);
  const [pdfRef, setPdfRef] = useState();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [totalPages, setTotalPages] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef();
  const containerRef = useRef();
  let pageRendering = useRef(false);
  let pageNumPending = useRef(null);
  let pageNum = currentPage;

  const queueRenderPage = (num) => {
    if (pageRendering.current) {
      pageNumPending.current = num;
    } else {
      renderPage(num);
    }
  }

  const onPrevPage = () => {
    if (currentPage <= 1) {
      return;
    }
    pageNum = currentPage;
    pageNum--;
    setCurrentPage(pageNum);
    queueRenderPage(pageNum);
  }

  const onNextPage = () => {
    if (currentPage >= totalPages) {
      return;
    }
    pageNum = currentPage;
    pageNum++;
    setCurrentPage(pageNum);
    queueRenderPage(pageNum);
  }

  const renderPage = useCallback((pageNum, pdf = pdfRef) => {
    pageRendering.current = true;
    dimensions && dimensions.width && dimensions.height && pdf && pdf.getPage(pageNum).then(function (page) {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width =  dimensions.width;
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTask.promise.then(function() {
        pageRendering.current = false;
        if (pageNumPending.current !== null) {
          renderPage(pageNumPending.current);
          pageNumPending.current = null;
        }
      });
      setCurrentPage(pageNum);
    });
  }, [pdfRef, dimensions]);

  useEffect(() => {
    if (data && data.file_type === 'pdf') renderPage(currentPage, pdfRef);
  }, [data, pdfRef, currentPage, renderPage]);

  useEffect(() => {
    if (data && data.file_type === 'pdf') {
      setLoading(true);
      const script = document.createElement('script');
      script.src = "/pdf.js";
      script.async = true;
      document.body.appendChild(script);
      script.addEventListener('load', () => {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
        const loadingTask = pdfjsLib.getDocument(data.file);
        loadingTask.promise.then(function(pdf) {
          setPdfRef(pdf);
          setTotalPages(pdf.numPages);
          setLoading(false);
        }, function (error) {
          setLoading(false);
          console.info("Unable to load pdf file.", error);
        });
      });
      if(data) setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    }
  }, [data]);

  const onCancel = () => {
    setPdfRef(undefined);
    setTotalPages(undefined);
    setCurrentPage(1);
    onHide();
  }

  return (
    <Modal centered
      backdrop="static"
      show={show}
      size={data && data.file_type === 'pdf' ? 'xl' : 'lg'}
      aria-labelledby="upload-document-modal-title"
      onHide={onCancel}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="upload-document-modal-title" className="d-flex">Document Preview: {data ? data.filename : undefined} </Modal.Title>
      </Modal.Header>
      <Modal.Body ref={containerRef} className="p-0 overflow-auto position-relative" style={{ height: 500 }}>
        {!data && !loading ? <Loader /> : <>
          {data && data.file_type === 'pdf' ? <><div className="preview-pdf-nav">
              {totalPages > 1 ? <button onClick={onPrevPage}>Previous</button> : ''}
              <span>Page: <span>{currentPage}</span> / <span>{totalPages}</span></span>
              {totalPages > 1 ? <button onClick={onNextPage}>Next</button> : ''}
            </div>
            <canvas className="loaded" ref={canvasRef}></canvas></> : <div className="d-flex w-100 h-100 justify-content-center align-items-center"><img style={{ maxWidth: '100%' }} src={data && data.file} alt={data ? data.filename : undefined} /></div>}
        </>}
      </Modal.Body>
    </Modal>
  );
};

export default DocumentPreviewModal;
