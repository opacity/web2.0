// import opacityABI from "../contracts/opacity.abi.json";
import Web3 from 'web3';

const CONTRACT_ADDRESS = "0xDb05EA0877A2622883941b939f0bb11d1ac7c400";

declare global {
  interface Window {
    ethereum: any;
  }
}

const isNewVersion = !!window.ethereum;
const isInstalled = isNewVersion;

const fetchDefaultMetamaskAccount = async () => {
  if (isNewVersion) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0]
  } else {
    return Promise.reject(new Error("MetaMask error fetching address"));
  }
};

const sendTransaction = ({ cost, from, to, gasPrice }) =>
  new Promise((resolve, reject) => {
    const web3 = new Web3(window.ethereum);
    window.ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to,
            gas: '0xEA60',
            value: web3.utils.toWei(cost.toString(), "ether"),
          },
        ],
      })
      .then((txHash) => resolve(txHash))
      .catch((error) => reject(error));
  // });
  // new Promise((resolve, reject) => {
  //   const web3 = new Web3(window.ethereum);

  //   const opacityContract = new web3.eth.Contract(
  //     opacityABI,
  //     CONTRACT_ADDRESS,
  //     {
  //       from,
  //     })

  //   web3.eth.sendTransaction({
  //     from,
  //     to,
  //     value: web3.utils.toWei(cost.toString(), "ether"),
  //     gas: 60000,
  //   },
  //     (err, res) => {
  //       err ? reject(err) : resolve(res);
  //     })

    // opacityContract.methods.myMethod(123).send(
    //   {
    //     from,
    //     gas: 60000,
    //   },
    //   (err, res) => {
    //     err ? reject(err) : resolve(res);
    //   }
    // );
  });

export default {
  isInstalled,
  sendTransaction,
  fetchDefaultMetamaskAccount,
};
