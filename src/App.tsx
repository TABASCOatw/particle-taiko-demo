import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { notification } from 'antd';

import { useEthereum, useConnect, useAuthCore } from '@particle-network/auth-core-modal';
import { TaikoJolnir } from '@particle-network/chains';
import { AAWrapProvider, SmartAccount, SendTransactionMode } from '@particle-network/aa';

import './App.css';

const App = () => {
  const { provider } = useEthereum();
  const { connect, disconnect } = useConnect();
  const { userInfo } = useAuthCore();

  const smartAccount = new SmartAccount(provider, {
    projectId: process.env.REACT_APP_PROJECT_ID,
    clientKey: process.env.REACT_APP_CLIENT_KEY,
    appId: process.env.REACT_APP_APP_ID,
    aaOptions: {
      simple: [{ chainId: TaikoJolnir.id, version: '1.0.0' }]
    }
  });

  const [balance, setBalance] = useState(null);

   const customProvider = new ethers.providers.Web3Provider(new AAWrapProvider(smartAccount, SendTransactionMode.Gasless), "any");

  useEffect(() => {
    if (userInfo) {
      fetchBalance();
    }
  }, [userInfo]);

  const fetchBalance = async () => {
    const signer = customProvider.getSigner();
    const address = await signer.getAddress();
    const balanceResponse = await customProvider.getBalance(address);
    setBalance(ethers.utils.formatEther(balanceResponse));
  };

  const handleLogin = async (authType) => {
    if (!userInfo) {
      await connect({ socialType: authType, chain: TaikoJolnir });
    }
  };

  const executeTx = async () => {
    const signer = customProvider.getSigner();
    const tx = {
      to: "0x000000000000000000000000000000000000dEaD",
      value: ethers.utils.parseEther("0.001"),
    };
    const txResponse = await signer.sendTransaction(tx);
    const txReceipt = await txResponse.wait();
    notification.success({ message: 'Transaction Successful', description: txReceipt.transactionHash });
  };

  return (
    <div className="App">
      <div className="logo-section">
        <img src="https://i.imgur.com/EerK7MS.png" alt="Logo 1" className="logo logo-big" />
        <img src="https://i.imgur.com/xZGTAt5.png" alt="Logo 2" className="logo" />
      </div>
      {!userInfo ? (
      <div className="login-section">
        <button className="sign-button google-button" onClick={() => handleLogin('google')}>
          <img src="https://i.imgur.com/nIN9P4A.png" alt="Google" className="icon"/>
          Sign in with Google
        </button>
        <button className="sign-button twitter-button" onClick={() => handleLogin('twitter')}>
          <img src="https://i.imgur.com/afIaQJC.png" alt="Twitter" className="icon"/>
          Sign in with X
        </button>
      </div>
      ) : (
        <div className="profile-card">
          <h2>{userInfo.name}</h2>
          <div className="balance-section">
            <small>{balance} ETH</small>
            <button className="sign-message-button" onClick={executeTx}>Execute Transaction</button>
            <button className="disconnect-button" onClick={() => disconnect()}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
