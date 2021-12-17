import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "react-bootstrap";
import Web3 from "web3";
import MetamaskButton from "../metamask-button";
import { ToastContainer, toast } from "react-toastify";
import MetamaskService from "../../../services/metamask";
import "./chain.scss";

const toHex = (num) => {
  return "0x" + num.toString(16);
};

const Chain = ({ chain, invoice, contractAddress }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const hasConnectedWallet = useMemo(() => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      // Legacy dapp browsers...
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      // Non-dapp browsers...
      return false;
    }
    return true;
  }, []);

  const addToNetwork = () => {
    const params = {
      chainId: toHex(chain.chainId), // A 0x-prefixed hexadecimal string
      chainName: chain.name,
      nativeCurrency: {
        name: chain.nativeCurrency.name,
        symbol: chain.nativeCurrency.symbol, // 2-6 characters long
        decimals: chain.nativeCurrency.decimals,
      },
      rpcUrls: chain.rpc,
      blockExplorerUrls: [chain.explorers && chain.explorers.length > 0 && chain.explorers[0].url ? chain.explorers[0].url : chain.infoURL],
    };

    window.web3.eth.getAccounts((error, accounts) => {
      window.ethereum
        .request({
          method: "wallet_addEthereumChain",
          params: [params, accounts[0]],
        })
        .then((result) => {
          setIsConnected(true);
        })
        .catch((error) => {
          console.log(error, "Error on add network");
          toast.error(error?.message);
        });
    });
  };

  const changeNetwork = async () => {
    if (!hasConnectedWallet) {
      toast.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
      return;
    }

    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: toHex(chain.chainId) }],
        });
        setIsConnected(true);
      } catch (error) {
        if (error.code === 4902) {
          // This error code indicates that the chain has not been added to MetaMask.
          await addToNetwork();
        } else {
          console.error(error, "Error on change network");
          toast.error("Error on change network");
        }
      }
    } else {
      // need to check legacy version
    }
  };

  const checkChain = useCallback(async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    setIsConnected(chainId === toHex(chain.chainId) ? true : false);
  }, [chain]);

  useEffect(() => {
    if (!hasConnectedWallet) {
      return;
    }
    const events = ["chainChanged"];

    const resetStatus = (event) => (value) => {
      if (event === "chainChanged" && value === toHex(chain.chainId)) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };

    for (let i in events) {
      window.ethereum.on(events[i], resetStatus(events[i]));
    }

    return () => {
      for (let i in events) {
        window.ethereum.removeListener(events[i], () => {});
      }
    };
  }, [chain]);

  useEffect(() => {
    if (hasConnectedWallet) {
      checkChain();
    }
  }, [chain]);

  const sendTransaction = useCallback(async ({ cost, ethAddress, gasPrice, contractAddress }) => {
    try {
      setIsDisabled(true);
      const from = await MetamaskService.fetchDefaultMetamaskAccount();
      await MetamaskService.sendTransaction({
        cost,
        to: ethAddress,
        from,
        gasPrice,
        contractAddress,
      });
    } catch (error) {
      console.log(error, "error on send transaction");
      toast.error("Error on send transaction");
    } finally {
      setIsDisabled(false);
    }
  }, []);

  return (
    <div className="chainContainer">
      <div className="chainNameContainer">
        <h3 className="name">{chain.name}</h3>
      </div>
      {isConnected ? (
        <MetamaskButton onClick={() => sendTransaction({ ...invoice, gasPrice: 20, contractAddress })} isDisabled={isDisabled}/>
      ) : (
        <div className="addButton">
          <Button color="primary" onClick={changeNetwork}>
            Connect Wallet
          </Button>
        </div>
      )}

      <ToastContainer
        pauseOnHover={false}
        draggable={true}
        progressClassName="toast-progress-bar"
        bodyClassName="toast-body"
        position="bottom-right"
        hideProgressBar
      />
    </div>
  );
};

export default Chain;
