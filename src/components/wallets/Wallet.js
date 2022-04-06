import React from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Button } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

const Wallet = ({ data, activeRow, onHandleChange, onHandleKeypress, onUpdate, onEdit, onDelete, index }) => {
  const { app } = useAppContext();

  return (
    <div key={data.blockchain_address} className="wallet loaded">
      <Form.Group controlId="formGroupWalletName" className={!activeRow.isEditing && 'readonly mb-3'}>
        <InputGroup className="mb-3">
          {activeRow.isEditing && activeRow.index === index ? <Form.Control
            autoFocus
            aria-label="Wallet Name"
            name="nickname"
            onChange={onHandleChange}
            onKeyPress={(e) => onHandleKeypress(e, data, index)}
            placeholder={`${data.nickname ? data.nickname : activeRow.isEditing ? 'Wallet Name' : 'Generated Wallet'}${data.default ? ' (Default)' : ''}`}
            readOnly={ activeRow.isEditing ? activeRow.index === index ? false : true : true }
            defaultValue={data.nickname}
          /> : <div className="form-control">{`${data.nickname} ${data.default ? ' (Default)' : ''}`}</div>}
          <InputGroup.Append className="d-flex justify-content-between align-items-center">
            {!activeRow.isEditing && !data.default && <Button variant="link" onClick={(e) => onUpdate({ ...data, default: true }, index)}>Make default</Button>}
            <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Edit" onClick={() => { onEdit(index); }}><i className={`sila-icon sila-icon-edit text-lg ${activeRow.isEditing && activeRow.index === index ? 'text-primary' : ''} `}></i></Button>
            {activeRow.isEditing && activeRow.index === index && <Button className="p-1 text-decoration-none mr-3 px-3" onClick={(e) => onUpdate(data, index)} disabled={(activeRow.isEditing && (!activeRow.value || activeRow.value === data.nickname)) ? true : false }>Save</Button>}
            {!activeRow.isEditing && !data.default && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Delete" onClick={() => onDelete(data, index)} disabled={data.default || activeRow.isEditing || data.private_key === app.activeUser.private_key}><i className="sila-icon sila-icon-delete text-lg"></i></Button>}
          </InputGroup.Append>
        </InputGroup>
        {activeRow.isEditing && activeRow.index === index && activeRow.error && <Form.Control.Feedback type="none" className="text-danger">{activeRow.error}</Form.Control.Feedback>}
      </Form.Group>
    </div>
  );
};

Wallet.propTypes = {
  /**
   * Wallet data
   */
  data: PropTypes.object.isRequired,
  /**
   * Nickname change function
   */
   onHandleChange: PropTypes.func.isRequired,
   /**
   * key enter function
   */
    onHandleKeypress: PropTypes.func.isRequired,
  /**
   * Update wallet function
   */
  onUpdate: PropTypes.func.isRequired,
  /**
   * Set wallet state to edit mode
   */
  onEdit: PropTypes.func.isRequired,
  /**
   * Delete wallet function
   */
  onDelete: PropTypes.func.isRequired,
  /**
   * Index value
   */
  index: PropTypes.number.isRequired
};

export default Wallet;
