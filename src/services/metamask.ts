// import opacityABI from "../contracts/opacity.abi.json";

const CONTRACT_ADDRESS = "0xDb05EA0877A2622883941b939f0bb11d1ac7c400";

declare global {
  interface Window {
    ethereum: any;
  }
}

const isNewVersion = !!window.ethereum;
const isInstalled = isNewVersion ;

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
    window.ethereum
    .request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          to,
          value: window.ethereum.Web3.Web3.Convert.ToWei(gasPrice, "ether"),
          gasPrice: window.ethereum.Web3.Web3.Convert.ToWei(gasPrice, "gwei"),
          gas: '6000',
        },
      ],
    })
    .then((txHash) => resolve(txHash))
    .catch((error) => reject(error));
  });

export default {
  isInstalled,
  sendTransaction,
  fetchDefaultMetamaskAccount,
};
