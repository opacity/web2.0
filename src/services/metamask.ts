import Web3 from "web3";
const opacityABI = require("../contracts/opacity.abi.json");

declare global {
  interface Window {
    ethereum: any;
    web3: any;
    Web3: any;
  }
}

const isNewVersion = !!window.ethereum;
const isInstalled = isNewVersion;

const fetchDefaultMetamaskAccount = async () => {
  if (isNewVersion) {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
  } else {
    return Promise.reject(new Error("MetaMask error fetching address"));
  }
};

const sendTransaction = ({ cost, from, to, gasPrice, contractAddress }) =>
  new Promise((resolve, reject) => {
    const web3 = new Web3(window.ethereum);
    const opacityContract = new web3.eth.Contract(opacityABI, contractAddress);
    opacityContract.methods.transfer(to, web3.utils.toWei(cost.toString(), "ether")).send(
      {
        from,
        gas: "0xEA60",
        gasPrice: web3.utils.toWei(gasPrice.toString(), "gwei"),
      },
      (err, res) => {
        err ? reject(err) : resolve(res);
      }
    );
  });

export default {
  isInstalled,
  sendTransaction,
  fetchDefaultMetamaskAccount,
};
