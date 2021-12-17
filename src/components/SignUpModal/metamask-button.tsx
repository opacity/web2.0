import React from "react";

const PAY_WITH_METAMASK_IMG = require("../../assets/pay_with_metamask.png");

const MetamaskButton = ({ onClick, isDisabled }) => (
  <button onClick={onClick} disabled={isDisabled} style={{
    cursor: 'pointer',
    padding: 0,
    border: 'none',
    background: 'none',
    width: '180px'
  }}>
    <img src={PAY_WITH_METAMASK_IMG} style={{ width: '180px' }}/>
  </button>
);

export default MetamaskButton;
