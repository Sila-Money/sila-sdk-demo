import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';

import { useAppContext } from '../components/context/AppDataProvider';

import Pagination from '../components/common/Pagination';
import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import Wallet from '../components/wallets/Wallet';

const Wallets = ({ page, previous, next, isActive }) => {
  const { app, api, updateApp, handleError, setAppData } = useAppContext();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const [wallets, setWallets] = useState(app.wallets.filter(wallet => wallet.handle === activeUser.handle).sort((x, y) => x.default ? -1 : y.default ? 1 : x.private_key === activeUser.private_key ? -1 : y.private_key === activeUser.private_key ? 1 : 0));
  const [loaded, setLoaded] = useState(false);

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

  const updateWallet = async (wallet) => {
    console.log('Updating Wallet ...');
    try {
      const res = await api.updateWallet(activeUser.handle, wallet.private_key, {
        nickname: wallet.nickname,
        default: wallet.default
      });
      let newWallet = wallet;
      let result = {};
      console.log('  ... completed!');
      if (res.data.success) {
        newWallet = { ...wallet, ...res.data.wallet };
        result.alert = { message: 'Wallet saved!', type: 'success' };
        if (newWallet.default || wallets.length === 1) result.activeUser = { ...activeUser, private_key: newWallet.private_key, cryptoAddress: newWallet.blockchain_address }
      } else {
        result.alert = { message: res.data && res.data.validation_details ? res.data.validation_details.nickname : res.data.message , type: 'danger' };
      }
      delete newWallet.editing;
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
  }

  const registerWallet = async (wallet) => {
    console.log('Registering Wallet ...');
    try {
      const res = await api.registerWallet(activeUser.handle, activeUser.private_key, {
        address: wallet.blockchain_address,
        privateKey: wallet.private_key
      }, wallet.nickname);
      let result = {};
      console.log('  ... completed!');
      let registerWallets = [...app.wallets];
      if (res.data.success) {
        delete wallet.isNew;
        registerWallets = [...app.wallets, { ...wallet }];
        result.alert = { message: 'Wallet saved!', type: 'success' };
      } else {
        result.alert = { message: res.data && res.data.validation_details ? res.data.validation_details.wallet.nickname : res.data.message, type: 'danger' };
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
  }

  const deleteWallet = async (wallet) => {
    console.log('Deleting Wallet ...');
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
  }

  const addWallet = () => {
    const newWallet = api.generateWallet();
    setWallets([...wallets, {
      blockchain_address: newWallet.address,
      private_key: newWallet.privateKey,
      handle: activeUser.handle,
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
    setAppData({
      success: wallets.length && !isActive ? [...app.success, { handle:  app.settings.kybHandle || activeUser.handle, page }] :  app.success,
      users: app.settings.kybHandle ? app.users.map(({ active, ...u }) => u.handle === app.settings.kybHandle ? { ...u, active: true } : u) : app.users
    }, () => {
      updateApp({ activeUser: app.settings.kybHandle ? app.users.find(u => u.handle === app.settings.kybHandle) : activeUser, kyc: {}, kyb: {} });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-4">Wallets</h1>

      <p className="text-lg text-muted mb-4">An Ethereum wallet has been automatically generated for this business by this demo. Per best practice, the private keys are stored locally on your computer and never sent over the network.</p>

      <p className="text-muted mb-5">This page represents <a href="https://docs.silamoney.com/docs/register_wallet" target="_blank" rel="noopener noreferrer">/register_wallet</a>, <a href="https://docs.silamoney.com/docs/delete_wallet" target="_blank" rel="noopener noreferrer">/delete_wallet</a>, <a href="https://docs.silamoney.com/docs/update_wallet" target="_blank" rel="noopener noreferrer">/update_wallet</a>, and <a href="https://docs.silamoney.com/docs/get_wallets" target="_blank" rel="noopener noreferrer">/get_wallets</a> functionality.</p>

      <Form noValidate autoComplete="off" className="position-relative mt-4">
        {!loaded && <Loader overlay />}
        {wallets.map((wallet, index) => <Wallet key={index} wallets={wallets} data={wallet} onHandleChange={handleChange} onCreate={registerWallet} onUpdate={updateWallet} onEdit={editWallet} onDelete={removeWallet} index={index} />)}
      </Form>

      <div className="d-flex mt-5">
        {app.alert.message && <AlertMessage message={app.alert.message} type={app.alert.type} />}
        <Button onClick={addWallet} className="ml-auto">Add Additonal Wallet <i className="fas fa-plus-circle ml-2"></i></Button>
      </div>

      <Pagination
        previous={previous}
        next={isActive ? next : undefined}
        currentPage={page} />

    </Container>
  );
};

export default Wallets;
