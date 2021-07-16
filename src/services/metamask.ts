import opacityABI from "../contracts/opacity.abi.json";
import Web3 from 'web3';

const CONTRACT_ADDRESS = "0xDb05EA0877A2622883941b939f0bb11d1ac7c400";

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
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0]
  } else {
    return Promise.reject(new Error("MetaMask error fetching address"));
  }
};

const sendTransaction = ({ cost, from, to, gasPrice }) =>
  new Promise((resolve, reject) => {
    const web3 = new window.Web3(window.ethereum)
    // const web3 = new Web3(window.ethereum);
    // window.ethereum
    //   .request({
    //     method: 'eth_sendTransaction',
    //     params: [
    //       {
    //         from,
    //         to,
    //         gas: '0xEA60',
    //         gasPrice: web3.utils.toWei(gasPrice.toString(), "gwei"),
    //         value: web3.utils.toWei(cost.toString(), "ether"),
    //       },
    //     ],
    //   })
    //   .then((txHash) => resolve(txHash))
    //   .catch((error) => reject(error));

    // const opacityContract = new web3.eth.Contract(opacityABI, CONTRACT_ADDRESS)

    // opacityContract.methods.transfer(to, web3.utils.toWei(cost.toString(), "ether"))
    //   .send(
    //     {
    //       from,
    //       gas: '0xEA60',
    //       gasPrice: web3.utils.toWei(gasPrice.toString(), "gwei")
    //     },
    //     (err, res) => {
    //       console.log('here')
    //     }
    //   )


    const opacityContract = web3.eth.contract(opacityABI).at(CONTRACT_ADDRESS);

    opacityContract.transfer(
      to,
      web3.toWei(cost, "ether"),
      {
        from,
        gas: 60000,
        gasPrice: web3.toWei(gasPrice, "gwei")
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
