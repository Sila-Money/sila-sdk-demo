import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, InputGroup, Button } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import Pagination from '../components/common/Pagination';
import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Wallet from '../components/wallets/Wallet';

import { DEFAULT_KYC, KYB_STANDARD } from '../constants';

const Wallets = ({ page, previous, next, isActive }) => {
  const { app, api, updateApp, handleError, setAppData } = useAppContext();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const [wallets, setWallets] = useState(app.wallets.filter(wallet => wallet.handle === activeUser.handle).sort((x, y) => x.default ? -1 : y.default ? 1 : x.private_key === activeUser.private_key ? -1 : y.private_key === activeUser.private_key ? 1 : 0));
  const [loaded, setLoaded] = useState(false);
  const [activeRow, setActiveRow] = useState({ isNew: false, isEditing: false, error: undefined, index: undefined, value: undefined });
  const walletsBodyRef = useRef();

  const getWallets = async () => {
    console.log('Getting Wallets ...');
    setLoaded(false);
    try {
      const res = await api.getWallets(activeUser.handle, activeUser.private_key);
      let newWallets = wallets;
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        newWallets = res.data.wallets
          .filter(w => app.wallets.find(savedWallet => savedWallet.blockchain_address === w.blockchain_address))
          .map(w => ({ ...w, ...app.wallets.find(savedWallet => savedWallet.blockchain_address === w.blockchain_address) }));
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        wallets: [...app.wallets.filter(wallet => wallet.handle !== activeUser.handle), ...newWallets],
        responses: [{
          endpoint: '/get_wallets',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
  }

  const updateWallet = async (wallet, index) => {
    console.log('Updating Wallet ...');
    setLoaded(false);
    try {
      const res = await api.updateWallet(activeUser.handle, wallet.private_key, {
        nickname: activeRow.value ? activeRow.value : wallet.nickname,
        default: wallet.default
      });
      let newWallet = { ...wallet };
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        newWallet = { ...wallet, ...res.data.wallet, nickname: activeRow.value ? activeRow.value : wallet.nickname };
        let newArr = [...wallets];
        newArr[index]['nickname'] = activeRow.value ? activeRow.value : wallet.nickname;
        setWallets(newArr);
        setActiveRow({...activeRow, isEditing: false, index: undefined, value: undefined, error: undefined, isNew: false});
        result.alert = { message: 'Wallet saved!', type: 'success' };
        if (newWallet.default || wallets.length === 1) result.activeUser = { ...activeUser, private_key: newWallet.private_key, cryptoAddress: newWallet.blockchain_address }
      } else {
        setActiveRow({...activeRow, error : res.data && res.data.validation_details ? res.data.validation_details.nickname : res.data.message });
      }

      setAppData({
        wallets: app.wallets.map(w => {
          if (w.default && newWallet.default) delete w.default;
          return w.blockchain_address === newWallet.blockchain_address ? newWallet : w
        }),
        users: app.users.map(u => result.activeUser && u.handle === activeUser.handle ? result.activeUser : u),
        responses: [{
          endpoint: '/update_wallet',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
        setWallets(wallets.map(w => {
          if (w.default && newWallet.default) delete w.default;
          return w.blockchain_address === newWallet.blockchain_address ? newWallet : w
        }));
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
  }

  const registerWallet = async () => {
    if (activeRow.isNew && !activeRow.value) return;
    console.log('Registering Wallet ...');
    setLoaded(false);
    try {
      const newWallet = await api.generateWallet();
      const res = await api.registerWallet(activeUser.handle, activeUser.private_key, {
        address: newWallet.address,
        privateKey: newWallet.privateKey
      }, activeRow.value);

      let result = {};
      console.log('  ... completed!');
      let registerWallets = [...app.wallets];
      if (res.data.success) {
        const newWalletData = {
          blockchain_address: newWallet.address,
          private_key: newWallet.privateKey,
          handle: activeUser.handle,
          nickname: res.data.wallet_nickname
        }
        setWallets([...wallets, newWalletData]);
        setActiveRow({...activeRow, isNew: false, error: undefined, value: undefined});
        registerWallets = [...app.wallets, { ...newWalletData }];
        result.alert = { message: 'Wallet saved!', type: 'success' };
      } else {
        setActiveRow({...activeRow, error : res.data && res.data.validation_details ? res.data.validation_details.wallet.nickname : res.data.message });
      }

      setAppData({
        wallets: registerWallets,
        responses: [{
          endpoint: '/register_wallet',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
  }

  const deleteWallet = async (wallet, index) => {
    console.log('Deleting Wallet ...');
    setLoaded(false);
    try {
      const res = await api.deleteWallet(activeUser.handle, wallet.private_key);
      let result = {};
      let newWallets = app.wallets;
      console.log('  ... completed!');
      if (res.data.success) {
        newWallets = app.wallets.filter(w => w.blockchain_address !== wallet.blockchain_address);
        result.alert = { message: 'Wallet deleted!', type: 'success' };
      } else {
        result.alert = { message: res.data.message, type: 'danger' };
      }
      setAppData({
        wallets: newWallets,
        responses: [{
          endpoint: '/delete_wallet',
          result: JSON.stringify(res, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
        setWallets(wallets.filter(w => w.blockchain_address !== wallet.blockchain_address));
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
  }

  const addWallet = () => {
    setActiveRow({ ...activeRow, isNew: activeRow.isNew ? false : true, isEditing: false, index: '' });
  }

  const editWallet = (index) => {
    setActiveRow({ ...activeRow, isEditing: true, index: index, isNew: false });
  }

  const handleChange = (e) => {
    setActiveRow({...activeRow, value: e.target.value.trim() || undefined});
  }

  const handleKeypress = (e, wallet, index) => {
    if (e.key === 'Enter') {
      if(activeRow.isEditing && wallet && typeof(index) !== undefined && activeRow.value && activeRow.value !== wallet.nickname) updateWallet(wallet, index);
      if(activeRow.isNew) registerWallet();
    }
  };

  const submitWallet = (e) => {
    e.preventDefault();
  }

  useEffect(() => {
    getWallets();
  }, [app.activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setAppData({
      success: wallets.length && !isActive ? [...app.success, { handle:  app.settings.kybHandle || activeUser.handle, page }] :  app.success,
      users: app.settings.kybHandle ? app.users.map(({ active, ...u }) => u.handle === app.settings.kybHandle ? { ...u, active: true } : u) : app.users
    }, () => {
      updateApp({ activeUser: app.settings.kybHandle ? app.users.find(u => u.handle === app.settings.kybHandle) : activeUser, kyc: {}, kyb: {} });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (activeRow.isEditing && walletsBodyRef.current && !walletsBodyRef.current.contains(e.target)) {
        setActiveRow({...activeRow, isEditing: false, error: undefined, index: undefined, value: undefined});
      }
    }
    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [activeRow])

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">Wallets</h1>

      <p className="text-lg text-muted mb-1">An Ethereum wallet has been automatically generated for this business by this demo. Per best practice, the private keys are stored locally on your computer and never sent over the network.</p>

      <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/register_wallet" target="_blank" rel="noopener noreferrer">/register_wallet</a>, <a href="https://docs.silamoney.com/docs/delete_wallet" target="_blank" rel="noopener noreferrer">/delete_wallet</a>, <a href="https://docs.silamoney.com/docs/update_wallet" target="_blank" rel="noopener noreferrer">/update_wallet</a>, and <a href="https://docs.silamoney.com/docs/get_wallets" target="_blank" rel="noopener noreferrer">/get_wallets</a> functionality.</p>

      <Form noValidate autoComplete="off" className="position-relative mt-2" onSubmit={submitWallet}>
        {!loaded && <Loader overlay />}
        <span ref={walletsBodyRef}>
          {wallets.map((wallet, index) => <Wallet key={index} data={wallet} activeRow={activeRow} onHandleChange={handleChange} onHandleKeypress={handleKeypress} onUpdate={updateWallet} onEdit={editWallet} onDelete={deleteWallet} index={index} />)}
        </span>

        {activeRow.isNew && <div className="wallet loaded">
          <Form.Group controlId="formGroupAddWalletName">
            <InputGroup className="mb-3">
              <Form.Control
                autoFocus
                aria-label="New Wallet Name"
                name="newnickname"
                placeholder="New Wallet Name"
                onChange={handleChange}
                onKeyPress={(e) => handleKeypress(e)}
                defaultValue={activeRow.value}
              />
              <InputGroup.Append className="d-flex justify-content-between align-items-center">
                <Button className="p-1 text-decoration-none mr-3 px-3" disabled={!activeRow.value} onClick={registerWallet}>Save</Button>
                <Button variant="outline-light" className="p-1 text-decoration-none mr-3 px-3 btn-sm" onClick={addWallet}>Cancel</Button>
              </InputGroup.Append>
            </InputGroup>
            {activeRow.error && <Form.Control.Feedback type="none" className="text-danger">{activeRow.error}</Form.Control.Feedback>}
          </Form.Group>
        </div>}
      </Form>

      <div className="d-flex">
        {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
        <Button onClick={addWallet} className="ml-auto">Add Additional Wallet <i className="fas fa-plus-circle ml-2"></i></Button>
      </div>

      <Pagination
        previous={app.settings.flow === 'kyc' && app.settings.preferredKycLevel !== DEFAULT_KYC ? '/request_kyc' : app.settings.flow === 'kyb' && app.settings.preferredKybLevel !== KYB_STANDARD ? '/request_kyc' : previous}
        next={isActive ? next : undefined}
        currentPage={page} />

    </Container>
  );
};

export default Wallets;
