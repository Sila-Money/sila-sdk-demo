import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import Pagination from '../components/common/Pagination';
import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Wallet from '../components/wallets/Wallet';

const Wallets = ({ page }) => {
  const { app, api, updateApp, handleError, setAppData } = useAppContext();
  const [wallets, setWallets] = useState(app.wallets.filter(wallet => wallet.handle === app.activeUser.handle).sort((x, y) => x.default ? -1 : y.default ? 1 : x.private_key === app.activeUser.private_key ? -1 : y.private_key === app.activeUser.private_key ? 1 : 0));
  const [loaded, setLoaded] = useState(false);

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
        if (newWallet.default || wallets.length === 1) result.activeUser = { ...app.activeUser, private_key: newWallet.private_key, cryptoAddress: newWallet.blockchain_address }
      } else {
        result.alert = { message: res.data.message, style: 'danger' };
      }
      delete newWallet.editing;
      setAppData({
        wallets: app.wallets.map(w => {
          if (w.default) delete w.default;
          return w.blockchain_address === newWallet.blockchain_address ? newWallet : w
        }),
        users: app.users.map(u => result.activeUser && u.handle === app.activeUser.handle ? result.activeUser : u),
        responses: [...app.responses, {
          endpoint: '/update_wallet',
          result: JSON.stringify(res, null, '\t')
        }]
      }, () => {
        updateApp({ ...result });
        setWallets(wallets.map(w => {
          if (w.default) delete w.default;
          return w.blockchain_address === newWallet.blockchain_address ? newWallet : w
        }));
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
        wallets: [...app.wallets, { ...wallet }],
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
        setWallets(wallets.filter(w => w.blockchain_address !== wallet.blockchain_address));
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
  }

  const removeWallet = (wallet, index) => {
    let newArr = [...wallets];
    if (wallet.isNew) {
      newArr.splice(index, 1);
      setWallets(newArr);
    } else {
      deleteWallet(wallet);
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

  useEffect(() => {
    if (wallets.length && !app.success.includes(page)) setAppData({ success: [...app.success, page] });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className="main-content-container d-flex flex-column flex-grow-1 loaded">

      <h1 className="mb-4">Digital Wallets</h1>

      <p className="text-lg text-meta mb-4">An Ethereum Wallet has been automatically created for this user.  Private Keys are stored locally on this device and never sent over the network.</p>

      <p className="text-meta mb-4">This page represents <a href="https://docs.silamoney.com/#register_wallet" target="_blank" rel="noopener noreferrer">/register_wallet</a>, <a href="https://docs.silamoney.com/#delete_wallet" target="_blank" rel="noopener noreferrer">/delete_wallet</a>, <a href="https://docs.silamoney.com/#update_wallet" target="_blank" rel="noopener noreferrer">/update_wallet</a> functionality.</p>

      <Form noValidate autoComplete="off" className="position-relative mt-4">
        {!loaded && <Loader overlay />}
        {loaded && wallets.map((wallet, index) => <Wallet key={index} wallets={wallets} data={wallet} onHandleChange={handleChange} onCreate={registerWallet} onUpdate={updateWallet} onEdit={editWallet} onDelete={removeWallet} index={index} />)}
      </Form>

      <div className="d-flex mt-4">
        {app.alert.message && <AlertMessage message={app.alert.message} style={app.alert.style} />}
        <Button variant="link" className="ml-auto p-0" onClick={addWallet}>Add Wallet +</Button>
      </div>

      <Pagination
        className="mt-auto pt-4"
        previous="/request_kyc"
        next={app.success.includes(page) ? '/accounts' : undefined}
        currentPage={page} />

    </Container>
  );
};

export default Wallets;
