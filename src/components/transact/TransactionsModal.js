import React, { useEffect } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

import Loader from '../common/Loader';

const TransactionsModal = ({ show, onHide, transactions, onRefresh, formatNumber }) => {
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
        <p className="text-right mb-2"><Button variant="link" className="p-0 ml-auto text-reset text-decoration-none" onClick={onRefresh}><i className="sila-icon sila-icon-refresh text-primary mr-2"></i><span className="lnk text-lg">Refresh</span></Button></p>
        {!transactions && <Loader overlay />}
        <Table style={{ marginRight: '1px' }} bordered responsive>
          <thead>
            <tr>
              <th className="text-lg">Type</th>
              <th className="text-lg">Amount</th>
              <th className="text-lg">Status</th>
              <th className="text-lg">Created At</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.length > 0 && transactions.map((transaction, index) => <tr key={index}>
              <td>{transaction.transaction_type}</td>
              <td><i className="sila-icon sila-icon-sila"></i> {formatNumber(transaction.sila_amount)}</td>
              <td className={transaction.status === 'success' ? 'text-success' : transaction.status === 'pending' ? 'text-warning' : transaction.status === 'failed' ? 'text-danger' : 'text-primary'}>{transaction.status}</td>
              <td>{(new Date(transaction.created)).toISOString().split('T')[0]}</td>
            </tr>)}
            {transactions && transactions.length === 0 && <tr><td colSpan="4"><em>No transactions found</em></td></tr>}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionsModal;