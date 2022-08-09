import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Button, Table, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';

import Loader from '../common/Loader';
import AlertMessage from '../../components/common/AlertMessage';

import { capitalize } from '../../utils';
import { useAppContext } from '../../components/context/AppDataProvider';

const TransactionsModal = ({ show, onHide, transactions, onRefresh, formatNumber }) => {
  const [tempData, setTempData] = useState(transactions);
  const transactionsData = transactions || tempData;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alertMessage, setAlertMessage] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const { app, api, setAppData, handleError } = useAppContext();

  const onDelete = async (transactionId) => {
    setAlertMessage(false);
    setConfirmDelete({ txId: transactionId, state: true });
  }

  const onConfirmDelete = async () => {
    if (confirmDelete && confirmDelete.txId) {
      try {
        setLoaded(false);
        const res = await api.cancelTransaction(app.activeUser.handle, app.activeUser.private_key, confirmDelete.txId);
        if (res.statusCode === 200 && res.data.success) {
          setAlertMessage({ message: 'The transaction has been successfully cancelled.', type: 'success' });
          onRefresh();
        } else {
          setAlertMessage({ message: res.data.message, type: 'danger' });
        }

        setAppData({
          responses: [{
            endpoint: '/cancel_transaction',
            result: JSON.stringify(res, null, '\t')
          }, ...app.responses]
        });

      } catch (err) {
        console.log(`  ... unable to delete transaction ${confirmDelete.txId}, looks like we ran into an issue!`);
        handleError(err);
      }
      setConfirmDelete(false);
      setLoaded(true);
      setTimeout(() => {
        setAlertMessage(false);
      }, 10000);
    }
  }

  useEffect(() => {
    if (transactions) setTempData(transactions);
  }, [transactions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (show) onRefresh();
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal centered
      show={show}
      size="lg"
      aria-labelledby="manage-settings-modal-title"
      onHide={onHide}>
      <Modal.Header className="text-center" closeButton>
        <Modal.Title id="manage-settings-modal-title">Transactions</Modal.Title>
      </Modal.Header>
      <Modal.Body className="transactions position-relative">
        <p className="text-right mb-4">
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => <Tooltip id="transactions-tooltip" className="ml-2" {...props}>Gets Transactions</Tooltip>}
          >
            <Button variant="link" className="p-0 text-reset text-decoration-none" onClick={onRefresh}><i className="fas fa-sync-alt text-primary mr-2"></i><span className="lnk text-lg">Refresh</span></Button>
          </OverlayTrigger>
        </p>
        <Card className="position-relative border rounded overflow-hidden">
          {(!transactions || !loaded) && <Loader overlay />}
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Created At</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactionsData && transactionsData.length > 0 && transactionsData.map((transaction, index) => <tr key={index}>
                <td>{(new Date(transaction.created)).toISOString().split('T')[0]}</td>
                <td>
                  {capitalize(transaction.transaction_type)}{transaction.destination_handle && app.activeUser.handle !== transaction.destination_handle && <em className="text-info d-block">{`to ${transaction.destination_handle}`}</em>}
                  {transaction.destination_handle && app.activeUser.handle === transaction.destination_handle && <em className="text-info d-block">{`from ${transaction.user_handle}`}</em>}
                </td>
                <td><i className="sila-icon sila"></i> {formatNumber(transaction.sila_amount)}</td>
                <td className={transaction.status === 'success' ? 'text-success' : transaction.status === 'pending' ? 'text-warning' : transaction.status === 'failed' ? 'text-danger' : 'text-primary'}>{transaction.status}</td>
                <td className="text-center">
                  {transaction.status === 'pending' && <div className="d-flex py-2 justify-content-center">
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 250, hide: 400 }}
                      overlay={(props) => <Tooltip id="cancel-transactions-tooltip" {...props}>Cancel Transaction</Tooltip>}
                    >
                      <Button variant="link" className="text-reset font-italic p-0 text-decoration-none shadow-none mx-2 px-2" onClick={(e) => onDelete(transaction.transaction_id)}><i className="sila-icon close text-danger text-lg"></i></Button>
                    </OverlayTrigger>
                  </div>}
                </td>
              </tr>)}
              {transactionsData && transactionsData.length === 0 && <tr><td colSpan="5"><em>No transactions found</em></td></tr>}
            </tbody>
          </Table>
        </Card>

        {confirmDelete && confirmDelete.state && <Row className="justify-content-around align-items-center mt-4">
          <Col className="col-7 text-lg">Are you sure you want to cancel this transaction?</Col>
          <Col className="col-5 px-0 d-flex justify-content-around">
            <Button variant="primary" size="lg" className="px-4" onClick={onConfirmDelete}>Yes, Cancel</Button>
            <Button variant="secondary" size="lg" className="px-5 bg-white text-dark" onClick={() => setConfirmDelete(false)}>No</Button>
          </Col>
        </Row>}

        {alertMessage && <div className="mt-4"><AlertMessage message={alertMessage.message} type={alertMessage.type} /></div>}

      </Modal.Body>
    </Modal>
  );
};

export default TransactionsModal;