import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "react-bootstrap";
import "./chain.scss";
import { connect } from "react-redux";
import metamaskActions from "../../../redux/actions/metamask-actions";
import Web3 from 'web3';
import MetamaskButton from "../metamask-button";
import { ToastContainer, toast } from "react-toastify";
const logo = require("../../../assets/unknown-chain.png");


const getProvider = () => {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    if (window.ethereum.isMetaMask) return 'Metamask'
  }
  return 'Wallet'
}

const toHex = (num) => {
  return '0x' + num.toString(16)
}

const Chain = ({ chain, invoice, contractAddress, openMetamask }) => {
  const [account, setAccount] = useState(null)
  const [isConnected, setIsConnected] = useState(false);

  const tryConnectWallet = useCallback(async () => {
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        await ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        toast.error("Error on try to connect");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    }
    // Non-dapp browsers...
    else {
      toast.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  }, [])

  const addToNetwork = () => {
    if (!(account)) {
      tryConnectWallet()
      return
    }

    const params = {
      chainId: toHex(chain.chainId), // A 0x-prefixed hexadecimal string
      chainName: chain.name,
      nativeCurrency: {
        name: chain.nativeCurrency.name,
        symbol: chain.nativeCurrency.symbol, // 2-6 characters long
        decimals: chain.nativeCurrency.decimals,
      },
      rpcUrls: chain.rpc,
      blockExplorerUrls: [((chain.explorers && chain.explorers.length > 0 && chain.explorers[0].url) ? chain.explorers[0].url : chain.infoURL)]
    }

    window.web3.eth.getAccounts((error, accounts) => {
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params, accounts[0]],
      })
        .then((result) => {
          setIsConnected(true);
        })
        .catch((error) => {
          toast.error(error?.message)
        });
    })
  }

  const renderProviderText = () => {

    if (account) {
      const providerTextList = {
        Metamask: 'Add to Metamask',
        Wallet: 'Add to Wallet'
      }
      return providerTextList[getProvider()]
    } else {
      return 'Connect Wallet'
    }

  }

  useEffect(() => {
    setIsConnected(false)
  }, [chain])

  return (
    <div className="chainContainer">
      <div className="chainNameContainer">
        <h3 className="name" >{chain.name}</h3>
      </div>
      {
        isConnected ?
          <MetamaskButton onClick={() => openMetamask({ ...invoice, gasPrice: 20, contractAddress })} />
          :
          <div className="addButton">
            <Button
              color='primary'
              onClick={addToNetwork}
            >
              {renderProviderText()}
            </Button>
          </div>
      }

      <ToastContainer
        pauseOnHover={false}
        draggable={true}
        progressClassName="toast-progress-bar"
        bodyClassName="toast-body"
        position="bottom-right"
        hideProgressBar
      />
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  openMetamask: ({ cost, ethAddress, gasPrice, contractAddress }) =>
    dispatch(metamaskActions.createTransaction({ cost, ethAddress, gasPrice, contractAddress })),
});

export default connect(null, mapDispatchToProps)(Chain);
