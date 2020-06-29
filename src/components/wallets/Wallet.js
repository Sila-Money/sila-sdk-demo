import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Button } from 'react-bootstrap';

import useDebounce from '../../utils/hooks/useDebounce';

import { useAppContext } from '../context/AppDataProvider';

const Wallet = ({ wallets, data, onHandleChange, onCreate, onUpdate, onEdit, onDelete, index }) => {
  const { app } = useAppContext();
  const [nickname, setNickname] = useState('');
  const debouncedNickname = useDebounce(nickname, 500);
  const nicknameRef = useRef(null);

  const handleChange = (e, index) => {
    onHandleChange(e, index);
    setNickname(e.target.value);
  };

  useEffect(() => {
    const wallet = wallets.find(w => w.nickname === debouncedNickname);
    if (wallet && debouncedNickname) wallet.isNew ? onCreate(wallet) : onUpdate(wallet);
  }, [debouncedNickname]); // eslint-disable-line react-hooks/exhaustive-deps

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
            onChange={(e) => handleChange(e, index)}
            placeholder={`${data.nickname ? data.nickname : data.private_key === app.activeUser.private_key ? 'My Wallet' : (data.editing || data.isNew) ? 'Wallet Name' : 'My First Wallet'}${data.default || (!data.default && data.private_key === app.activeUser.private_key) ? ' (Default)' : ''}`}
            readOnly={(!data.editing && !data.isNew)}
          />
          <InputGroup.Append>
            {!data.editing && !data.isNew && (!data.default && data.private_key !== app.activeUser.private_key) && <Button variant="link" onClick={() => onUpdate({ ...data, default: true })}>Make default</Button>}
            {(!data.editing && !data.isNew) && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Edit" disabled={data.isNew || data.editing} onClick={() => { onEdit(index); nicknameRef.current.focus(); }}><i className="sila-icon sila-icon-edit text-lg"></i></Button>}
            {data.private_key !== app.activeUser.private_key && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Delete" onClick={() => onDelete(data, index)} disabled={data.default || data.editing || data.private_key === app.activeUser.private_key}><i className="sila-icon sila-icon-delete text-lg"></i></Button>}
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