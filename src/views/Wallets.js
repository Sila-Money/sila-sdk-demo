import React, { useState, useEffect } from 'react';
import { Container, Form, Button, InputGroup } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import Pagination from '../components/common/Pagination';
import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';

const Wallets = ({ page }) => {
  const [loaded, setLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { app, api, updateApp, handleError, setAppData } = useAppContext();
  const [wallets, setWallets] = useState(app.wallets.filter(wallet => wallet.handle === app.activeUser.handle).sort((x, y) => x.default ? -1 : y.default ? 1 : 0));

  const getWallets = async () => {
    console.log('Getting Wallets ...');
    setLoaded(false);
    try {
      const res = await api.getWallets(app.activeUser.handle, app.activeUser.private_key);
      let newWallets = [];
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        newWallets = res.data.wallets.filter(wallet => app.wallets.find(savedWallet => savedWallet.blockchain_address === wallet.blockchain_address)).map(wallet => ({ ...app.wallets.find(savedWallet => savedWallet.blockchain_address === wallet.blockchain_address), ...wallet }));
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      setAppData({
        wallets: [...app.wallets.filter(wallet => wallet.handle !== app.activeUser.handle), ...newWallets],
        responses: [...app.responses, {
          endpoint: '/get_wallets',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
    setLoaded(true);
  }

  const updateWallet = async (wallet) => {
    console.log('Updating Wallet ...');
    try {
      const res = await api.updateWallet(app.activeUser.handle, wallet.private_key, {
        nickname: wallet.nickname,
        default: wallet.default
      });
      let newWallet = wallet;
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        newWallet = { ...wallet, ...res.data.wallet };
        result.alert = { message: 'Wallet saved!', style: 'success' };
        if (wallet.default) result.activeUser = { ...app.activeUser, private_key: newWallet.private_key, cryptoAddress: newWallet.blockchain_address }
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      setIsEditing(false);
      delete newWallet.editing;
      setAppData({
        wallets: app.wallets.map(w => {
          if (w.default) delete w.default;
          return w.blockchain_address === newWallet.blockchain_address ? newWallet : w
        }),
        users: app.users.map(u => wallet.default && u.handle === app.activeUser.handle ? result.activeUser : u),
        responses: [...app.responses, {
          endpoint: '/update_wallet',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  const registerWallet = async (wallet) => {
    console.log('Registering Wallet ...');
    try {
      const res = await api.registerWallet(app.activeUser.handle, app.activeUser.private_key, {
        address: wallet.blockchain_address,
        privateKey: wallet.private_key
      }, wallet.nickname);
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        result.alert = { message: 'Wallet saved!', style: 'success' };
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      delete wallet.isNew;
      setAppData({
        wallets: app.wallets.map(w => w.blockchain_address === wallet.blockchain_address ? wallet : w),
        responses: [...app.responses, {
          endpoint: '/register_wallet',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  const deleteWallet = async (wallet) => {
    console.log('Deleting Wallet ...');
    try {
      const res = await api.deleteWallet(app.activeUser.handle, wallet.private_key);
      let result = {};
      let newWallets = app.wallets;
      console.log('  ... completed!');
      if (res.data.success) {
        newWallets = app.wallets.filter(w => w.blockchain_address !== wallet.blockchain_address);
        result.alert = { message: 'Wallet deleted!', style: 'success' };
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      setAppData({
        wallets: newWallets,
        responses: [...app.responses, {
          endpoint: '/delete_wallet',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
      });
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    }
  }

  const addWallet = () => {
    const newWallet = api.generateWallet();
    setWallets([...wallets, {
      blockchain_address: newWallet.address,
      private_key: newWallet.privateKey,
      handle: app.activeUser.handle,
      isNew: true,
      nickname: ''
    }]);
  }

  const editWallet = (index) => {
    let newArr = [...wallets];
    newArr[index].editing = true;
    setWallets(newArr);
    setIsEditing(true);
  }

  const removeWallet = (wallet, index) => {
    let newArr = [...wallets];
    newArr.splice(index, 1);
    if (wallet.blockchain_network) {
      deleteWallet(wallet);
    } else {
      setWallets(newArr);
    }
  }

  const handleChange = (e, index) => {
    let newArr = [...wallets];
    newArr[index][e.target.name] = e.target.value;
    setWallets(newArr);
  }

  useEffect(() => {
    getWallets();
  }, [app.activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 loaded">

      <h1 className="mb-4">Digital Wallets</h1>

      {loaded && app.wallets[0].nickname && !app.wallets[0].nickname.length && <p className="text-lg text-meta">An Ethereum Wallet has been automatically created for this user.  Give this wallet a name and add additional wallets here.</p>}

      <p className="text-meta">This page represents <a href="https://docs.silamoney.com/#register_wallet" target="_blank" rel="noopener noreferrer">/register_wallet</a>, <a href="https://docs.silamoney.com/#delete_wallet" target="_blank" rel="noopener noreferrer">/delete_wallet</a>, <a href="https://docs.silamoney.com/#update_wallet" target="_blank" rel="noopener noreferrer">/update_wallet</a> functionality.</p>

      <Form noValidate autoComplete="off" className="position-relative mt-4">
        {!loaded && <Loader overlay />}
        {loaded && wallets.map((wallet, index) => (
          <div key={wallet.blockchain_address} className="wallet loaded">
            <Form.Group controlId="formGroupWalletName" className={!wallet.editing && !wallet.isNew ? 'readonly' : undefined}>
              <InputGroup className="mb-3">
                <Form.Control
                  aria-label='Wallet Name'
                  name="nickname"
                  onChange={(e) => handleChange(e, index)}
                  placeholder={`${wallet.nickname ? wallet.nickname : wallet.private_key === app.activeUser.private_key ? 'My Wallet' : `Wallet Name`}${wallet.default ? ' (Default)' : ''}`}
                  readOnly={(!wallet.editing && !wallet.isNew)}
                />
                <InputGroup.Append>
                  {!wallet.editing && !wallet.isNew && (!wallet.default && wallet.private_key !== app.activeUser.private_key) && <Button variant="link" onClick={() => updateWallet({ ...wallet, default: true })}>Make default</Button>}
                  {(wallet.editing || wallet.isNew) && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Save" onClick={() => wallet.isNew ? registerWallet(wallet) : updateWallet(wallet)} disabled={(!wallet.nickname) || (wallet.nickname && !wallet.nickname.length)}><i className="sila-icon sila-icon-save text-lg"></i></Button>}
                  {(!wallet.editing && !wallet.isNew) && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Edit" disabled={wallet.isNew || isEditing} onClick={() => editWallet(index)}><i className="sila-icon sila-icon-edit text-lg"></i></Button>}
                  {wallet.private_key !== app.activeUser.private_key && <Button variant="link" className="p-0 mr-3 text-decoration-none loaded" title="Delete" onClick={() => removeWallet(wallet, index)} disabled={wallet.default || isEditing || wallet.private_key === app.activeUser.private_key}><i className="sila-icon sila-icon-delete text-lg"></i></Button>}
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
          </div>
        ))}
      </Form>

      <div className="d-flex mt-4">
        {app.alert.message && <AlertMessage message={app.alert.message} style={app.alert.style} />}
        <Button variant="link" className="ml-auto p-0" onClick={addWallet}>Add Wallet +</Button>
      </div>

      <Pagination
        className="mt-auto pt-4"
        previous="/request_kyc"
        next="/accounts"
        currentPage={page} />

    </Container>
  );
};

export default Wallets;
