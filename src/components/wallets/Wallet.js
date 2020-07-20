import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Button } from 'react-bootstrap';

import { useAppContext } from '../context/AppDataProvider';

const Wallet = ({ wallets, data, onHandleChange, onCreate, onUpdate, onEdit, onDelete, index }) => {
  const { app } = useAppContext();
  const nicknameRef = useRef(null);

  const handleKeypress = (e) => {
    if (nicknameRef.current.value && e.key === 'Enter') nicknameRef.current.blur();
  };

  const handleBlur = () => {
    if (nicknameRef.current.value && data.isNew) {
      onCreate(data);
    } else if (nicknameRef.current.value && !data.isNew) {
      onUpdate(data);
    }
  };

  useEffect(() => {
    if (data.isNew) nicknameRef.current.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div key={data.blockchain_address} className="wallet loaded">
      <Form.Group controlId="formGroupWalletName" className={!data.editing && !data.isNew ? 'readonly' : undefined}>
        <InputGroup className="mb-3">
          <Form.Control
            ref={nicknameRef}
            aria-label="Wallet Name"
            name="nickname"
            onChange={(e) => onHandleChange(e, index)}
            onBlur={(e) => handleBlur(e)}
            onKeyPress={handleKeypress}
            placeholder={`${data.nickname ? data.nickname : (data.editing || data.isNew) ? 'Wallet Name' : 'Generated Wallet'}${data.default ? ' (Default)' : ''}`}
            readOnly={(!data.editing && !data.isNew)}
          />
          <InputGroup.Append>
            {!data.editing && !data.isNew && !data.default && <Button variant="link" onClick={() => onUpdate({ ...data, default: true })}>Make default</Button>}
            {(!data.editing && !data.isNew) && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Edit" disabled={data.isNew || data.editing} onClick={() => { onEdit(index); nicknameRef.current.focus(); }}><i className="sila-icon sila-icon-edit text-lg"></i></Button>}
            {!data.default && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Delete" onClick={() => onDelete(data, index)} disabled={data.default || data.editing || data.private_key === app.activeUser.private_key}><i className="sila-icon sila-icon-delete text-lg"></i></Button>}
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </div>
  );
};

Wallet.propTypes = {
  /**
   * Wallets array
   */
  wallets: PropTypes.array.isRequired,
  /**
   * Wallet data
   */
  data: PropTypes.object.isRequired,
  /**
   * Nickname change function
   */
  onHandleChange: PropTypes.func.isRequired,
  /**
   * Create wallet function
   */
  onCreate: PropTypes.func.isRequired,
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