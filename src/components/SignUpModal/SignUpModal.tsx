import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Row, Col, ProgressBar, DropdownButton, Dropdown } from "react-bootstrap";
import { Field, Formik } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { createMnemonic, mnemonicToHandle } from "../../../ts-client-library/packages/util/src/mnemonic";
import { Account, AccountCreationInvoice } from "../../../ts-client-library/packages/account-management";
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web";
import { bytesToHex, hexToBytes } from "../../../ts-client-library/packages/util/src/hex";
import { PlanType, STRIPE_API_KEY, PLANS, STORAGE_NODE as storageNode } from "../../config";
import Redeem from "./Redeem";
import UsdPaymentForm from "./UsdPaymentForm";
import { Elements, StripeProvider } from "react-stripe-elements";
import moment from "moment";
import Chain from "./Chain/Chain";
const ChainData = require("../../config/chains.json");
//https://chainid.network/chains.json
import ReactLoading from "react-loading";
import "./SignUpModal.scss";
const logo = require("../../assets/logo2.png");

const loginSchema = Yup.object().shape({
  handle: Yup.string().length(128),
  termsCheck: Yup.boolean().required(""),
});
type OtherProps = {
  show?: boolean;
  handleClose?: Function;
  initialPlan?: PlanType;
  openLoginModal?: Function;
  isForRenew?: boolean;
  doRefresh?: Function;
};
type SignUpProps = {
  plan?: PlanType;
  goBack: Function;
  goNext: Function;
  handleOpenLoginModal?: Function;
  handle?: string;
  handleClose?: Function;
  openLoginModal?: Function;
  createAccount?: Function;
  mnemonic?: string[];
  invoice?: AccountCreationInvoice;
  account?: Account;
  isForUpgrade?: boolean;
  isForRenew?: boolean;
  doRefresh?: Function;
};
type ConfirmationModalProps = {
  show: boolean;
  handleClose: Function;
  handleYes?: Function;
  handleNo?: Function;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ show, handleClose, handleYes = () => {}, handleNo = () => {} }) => {
  return (
    <Modal show={show} onHide={handleClose} dialogClassName="confirmation-modal" centered>
      <Modal.Header>
        <Modal.Title>Are you sure you want to close this window?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Note: OPCT payment may take time to complete on the blockchain depending on gas provided and network activity. If you close the
        window, you will need to start a new transaction
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            handleClose();
            handleYes();
          }}
        >
          Yes
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            handleClose();
            handleNo();
          }}
        >
          No
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const SignUpModal: React.FC<OtherProps> = ({
  show,
  handleClose: handleCloseOriginal,
  initialPlan,
  openLoginModal,
  isForRenew = false,
  doRefresh,
}) => {
  const [handle, setHandle] = useState("");
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [currentStep, setStep] = React.useState<number>(1);
  const [account, setAccount] = React.useState<Account>();
  const [invoiceData, setInvoiceData] = React.useState<AccountCreationInvoice>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const currentAccount = localStorage.getItem("key");
  const [plan, setPlan] = React.useState<PlanType>();
  const [pageLoading, setPageLoading] = React.useState(false);

  const cryptoMiddleware = React.useMemo(() => new WebAccountMiddleware(), []);

  const netMiddleware = React.useMemo(() => new WebNetworkMiddleware(), []);
  const planAccount = React.useMemo(
    () =>
      new Account({
        crypto: cryptoMiddleware,
        net: netMiddleware,
        storageNode,
      }),
    [cryptoMiddleware, netMiddleware, storageNode]
  );

  React.useEffect(() => {
    const init = async () => {
      try {
        setPageLoading(true);

        const plansApi = await planAccount.plans();

        const converedPlan = PLANS.map((item, index) => {
          if (plansApi[index]) {
            const { cost, costInUSD, storageInGB, name } = plansApi[index];
            return {
              ...item,
              opctCost: cost,
              usdCost: costInUSD,
              storageInGB,
              name,
            };
          } else {
            return item;
          }
        });
        const freePlan = converedPlan.find((item) => item.permalink === "free");
        setPlan(freePlan);
        setPageLoading(false);
      } catch {
        // setPageLoading(false)
      }
    };

    if (planAccount && initialPlan) {
      setPlan(initialPlan);
    } else if (planAccount && !initialPlan) {
      init();
    }
  }, [planAccount, initialPlan]);

  const handleClose = () => {
    if (currentStep === 2) {
      setShowConfirmationModal(true);
    } else handleCloseOriginal();
  };

  const goBack = () => {
    if (currentStep > 1) setStep(currentStep - 1);
    else handleClose();
  };

  const goNext = () => {
    if (currentStep === 1) {
      if (!plan || plan.permalink === "free") {
        createAccount().then(() => {
          setStep(3);
        });
      } else {
        createAccount().then(() => {
          setStep(currentStep + 1);
        });
      }
    } else {
      setStep(currentStep + 1);
    }
  };

  const handleOpenLoginModal = () => {
    handleClose();
    openLoginModal();
  };

  const createAccount = async () => {
    const cryptoMiddleware = new WebAccountMiddleware({
      asymmetricKey: hexToBytes(handle),
    });
    const netMiddleware = new WebNetworkMiddleware();
    const account = new Account({
      crypto: cryptoMiddleware,
      net: netMiddleware,
      storageNode,
    });
    setAccount(account);
    let form = {};
    if (plan) {
      form = {
        size: plan.storageInGB,
      };
    } else {
      form = {
        size: 10,
      };
    }
    const invoice = await account.signUp(form);
    setInvoiceData(invoice);
  };

  const upgradeAccount = async () => {
    const currentHandle = localStorage.getItem("key");

    const cryptoMiddleware = new WebAccountMiddleware({
      asymmetricKey: hexToBytes(currentHandle),
    });
    const netMiddleware = new WebNetworkMiddleware();
    const account = new Account({
      crypto: cryptoMiddleware,
      net: netMiddleware,
      storageNode,
    });
    setAccount(account);
    let form = {};
    if (plan) {
      form = {
        size: plan.storageInGB,
      };
    } else {
      form = {
        size: 10,
      };
    }
    const invoice = await account.upgradeAccount(form);
    setInvoiceData(invoice);
  };

  useEffect(() => {
    if (plan) {
      setMnemonic([]);
      setHandle("");
      const currentAccount = localStorage.getItem("key");
      if (currentAccount || isForRenew) {
        setHandle(currentAccount);
        if (isForRenew) {
          renewAccount().then(() => setStep(2));
        } else {
          upgradeAccount().then(() => setStep(2));
        }
      } else {
        createMnemonic().then(async (res) => {
          setMnemonic(res);
          const handle = await mnemonicToHandle(res);
          setHandle(bytesToHex(handle));
        });
      }
    }
  }, [plan]);

  const renewAccount = async () => {
    const currentHandle = localStorage.getItem("key");

    const cryptoMiddleware = new WebAccountMiddleware({
      asymmetricKey: hexToBytes(currentHandle),
    });
    const netMiddleware = new WebNetworkMiddleware();
    const account = new Account({
      crypto: cryptoMiddleware,
      net: netMiddleware,
      storageNode,
    });
    setAccount(account);
    const invoice = await account.renewAccount({ duration: 12 });
    setInvoiceData(invoice);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered dialogClassName="signup">
        <Modal.Body>
          {pageLoading && (
            <div className="loading">
              <ReactLoading type="spinningBubbles" color="#2e6dde" />
            </div>
          )}
          <div className="close" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
              <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z" />
            </svg>
          </div>
          {plan && (
            <div className="signup-process">
              <div className="process-item">
                <div className="process-image">
                  <div className="image-item plan"></div>
                </div>
                <div className="polygon">Select a Plan</div>
              </div>
              <div className={currentStep === 1 ? "process-item active" : "process-item"}>
                <div className="process-image">
                  <div className="image-item record"></div>
                </div>
                <div className="polygon">Record Account Handle</div>
              </div>
              <div className={currentStep === 2 ? "process-item active" : "process-item"}>
                <div className="process-image">
                  <div className="image-item payment"></div>
                </div>
                <div className="polygon">Send Payment</div>
              </div>
              <div className={currentStep === 3 ? "process-item active" : "process-item"}>
                <div className="process-image">
                  <div className="image-item confirm"></div>
                </div>
                <div className="polygon">Confirm Payment</div>
              </div>
            </div>
          )}
          {currentStep === 1 && <AccountHandle plan={plan} handle={handle} mnemonic={mnemonic} goBack={goBack} goNext={goNext} />}
          {currentStep === 2 && (
            <SendPayment
              plan={plan}
              account={account}
              invoice={invoiceData}
              goBack={goBack}
              goNext={goNext}
              isForUpgrade={currentAccount && !isForRenew && true}
              isForRenew={isForRenew}
              doRefresh={() => doRefresh()}
            />
          )}
          {currentStep === 3 && (
            <ConfirmPayment
              plan={plan}
              handle={handle}
              goBack={goBack}
              goNext={goNext}
              handleOpenLoginModal={handleOpenLoginModal}
              isForRenew={isForRenew}
              account={account}
            />
          )}
        </Modal.Body>
      </Modal>

      <ConfirmationModal
        show={showConfirmationModal}
        handleClose={() => setShowConfirmationModal(false)}
        handleYes={() => {
          account.cancelWaitForPayment();
          handleCloseOriginal();
        }}
      />
    </>
  );
};

const AccountHandle: React.FC<SignUpProps> = ({ plan, goBack, goNext, mnemonic, handle }) => {
  const [validatePrivateKey, setValidatePrivateKey] = useState(true);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const downloadCsv = (array) => {
    const csvContent = array.join(",");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = "mnemonic.csv";
    window.document.body.appendChild(elem);
    elem.click();
    window.document.body.removeChild(elem);
  };
  const handleSubmit = (values) => {
    goNext();
  };
  return (
    <Formik
      initialValues={{ handle: handle, termsCheck: false }}
      validationSchema={loginSchema}
      onSubmit={(values, { setErrors }) => {
        if (isCopied) {
          handleSubmit(values);
        } else {
          setErrors({
            handle: "Please make sure to copy and save your account handle before proceeding.",
          });
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} autoComplete="off">
          <Row className="align-items-center ">
            <Col className="text-center">
              {plan ? (
                <h2 className="plans">IMPORTANT: Save Your Account Handle Recovery Phrase</h2>
              ) : (
                <>
                  <img width="70" src={logo} />
                  <h2>Get started for FREE</h2>
                </>
              )}
              <h3>
                Your Privacy and <span>Security is in your hands.</span> Keep These Numbers <span>Safe.</span>
              </h3>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Form.Group>
                <div className="account-handle mb-0">{handle}</div>
                <CopyToClipboard text={handle} onCopy={() => handle && setIsCopied(true)}>
                  <span className="handle"></span>
                </CopyToClipboard>
                {isCopied && <div className="copy-feedback">Copied to clipboard!</div>}
                {errors.handle && !isCopied && <div className="invalid-feedback d-block">{errors.handle}</div>}
              </Form.Group>
            </Col>
            <Col md="12" className="mt-3">
              <h3>
                Keep These Recovery <span>Words Safe.</span>
              </h3>
            </Col>
          </Row>
          <Row className="words-safe">
            {mnemonic.map((word, i) => (
              <Col xs="6" md="3" key={i}>
                <div>
                  {i + 1}. {word}
                </div>
              </Col>
            ))}
          </Row>
          <Row>
            <Col>
              <div
                className="download-link"
                onClick={() => {
                  downloadCsv(mnemonic);
                }}
              >
                Download phrase as CSV
              </div>
            </Col>
          </Row>
          <Row className="align-items-center mb-3">
            <Col md="12" className="mb-3 text-md-right">
              <Field type="checkbox" name="termsCheck" className="form-check-input" onChange={handleChange} onBlur={handleBlur} />
              <span className="custom-control-label">
                I agree to the{" "}
                <a href="/terms-of-service" target="_blank">
                  <span>Terms of Service</span>
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" target="_blank">
                  <span>Privacy Policy</span>
                </a>
              </span>
            </Col>
            <Col md="12" className="text-md-right">
              <HCaptcha
                sitekey="e43ebc8e-8590-4991-bde4-eb93a9301f0d"
                onVerify={
                  (token, ekey) => setIsCaptchaVerified(true)
                  // handleVerificationSuccess(token, ekey)
                }
              />
              {/* <Reaptcha sitekey='6LciI6cUAAAAAL03VKUCArV9MFS8zgQn49NHItA8' onVerify={() => setIsCaptchaVerified(true)} /> */}
            </Col>
          </Row>
          <Row>
            {plan ? (
              <>
                <Col md={6} className="mb-md-0 mb-2">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    type="button"
                    onClick={() => {
                      goBack();
                    }}
                  >
                    Go Back
                  </Button>
                </Col>
                <Col md={6}>
                  <Button variant="primary" size="lg" type="submit" disabled={!isCaptchaVerified || !values.termsCheck}>
                    Continue
                  </Button>
                </Col>
              </>
            ) : (
              <Col>
                <Button variant="primary btn-pill" size="lg" type="submit" disabled={!isCaptchaVerified || !values.termsCheck}>
                  SIGN UP FOR FREE
                </Button>
              </Col>
            )}
          </Row>
        </form>
      )}
    </Formik>
  );
};

const SendPayment: React.FC<SignUpProps> = ({ goNext, plan, invoice, account, isForUpgrade, isForRenew, doRefresh }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [networkName, setNetworkName] = useState("No Network");
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [networkData, setNetworkData] = useState([]);

  React.useEffect(() => {
    if (isForUpgrade) {
      const form = {
        size: plan.storageInGB,
        metadataKeys: [],
        fileIDs: [],
      };
      account.waitForUpgradePayment(form).then(() => {
        goNext();
      });
    } else if (isForRenew) {
      const renewForm = {
        metadataKeys: [],
        fileIDs: [],
      };
      account.waitForRenewPayment(renewForm).then(() => {
        doRefresh && doRefresh();
        goNext();
      });
    } else {
      account.waitForPayment().then(() => {
        goNext();
      });
    }

    account.getSmartContracts().then((data) => {
      const wrapNetData = data.map((item) => {
        const chain = ChainData.find((chain) => chain.chainId === item.chainId);

        return {
          ...item,
          network: chain.name,
          chain: chain,
        };
      });
      setNetworkData(wrapNetData);
    });
  }, []);

  const handleChangeNetwork = (net) => {
    setSelectedNetwork(net);
    setNetworkName(net.network);
  };

  const handleStripeSuccess = async (stripeToken) => {
    const res = await account.createSubscription({ stripeToken });
  };

  return (
    <div className="SendPayment">
      <div className="card-body">
        <div className="payment-type">
          <div className="d-flex">
            <div
              className={`type-item ${paymentMethod === "crypto" && "active"}`}
              onClick={(e) => {
                setPaymentMethod("crypto");
              }}
            >
              Pay with cryptocurrency
            </div>
            <div
              className={`type-item ${paymentMethod === "usd" && "active"}`}
              onClick={(e) => {
                setPaymentMethod("usd");
              }}
            >
              Pay with USD
            </div>
          </div>
          <DropdownButton id="dropdown-basic-button" title="Pay with cryptocurrency" className="d-none">
            <Dropdown.Item href="#/action-2">Pay with cryptocurrency</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Pay with USD</Dropdown.Item>
          </DropdownButton>
        </div>
        {paymentMethod === "crypto" && (
          <div>
            <h3>Send Payment with OPCT using Ethereum or Polygon network</h3>
            <div className="payment-content">
              Use the Opacity Storage Token, OPCT, to pay for your storage account. Send your total amount of {plan.opctCost} OPCT to the
              address below or you may use MetaMask to easily make your payment right in your browser.
            </div>
            <div className="important-content">
              IMPORTANT: Do not send any other coin or token to this account address as it may result in a loss of funds. Only send{" "}
              {plan.opctCost} OPCT. Sending more may also result in loss of funds.
            </div>
            <div className="payment-content">
              Once your payment is sent, it may take some time to confirm your payment on the network. We will confirm receipt and complete
              setup of your account once the network transaction is confirmed. Please be patient.
            </div>
            <ProgressBar striped now={100} animated />
            <div className="send-email">Send {plan.opctCost} OPCT to Address:</div>
            <div className="form-group">
              <div className="account-handle">{invoice.ethAddress}</div>
              <CopyToClipboard text={invoice.ethAddress} onCopy={() => invoice.ethAddress && setIsCopied(true)}>
                <span className="handle"></span>
              </CopyToClipboard>
              {isCopied && <div className="copy-feedback">Copied to clipboard!</div>}
            </div>
            <div className="need-opct">
              Need OPCT?{" "}
              <span className="here" onClick={() => window.open("https://www.kucoin.com/trade/OPCT-BTC", "_blank")}>
                Purchase here
              </span>
            </div>

            <div className="row qrcode">
              <Col>
                <div className="scan">
                  <h1 className="subtitle-bottom-effect">Pay with Metamask</h1>
                  <div className="">
                    <Dropdown style={{marginBottom: "20px"}}>
                      <Dropdown.Toggle variant="default" id="dropdown-basic">
                        {networkName}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {networkData.map((item, key) => {
                          return (
                            <Dropdown.Item key={key} as="button" onClick={(e) => handleChangeNetwork(item)}>
                              {item?.network}
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    </Dropdown>
                    {!selectedNetwork && <div className="select-net">Choose your payment network</div>}
                  </div>
                  {selectedNetwork && <Chain chain={selectedNetwork.chain} contractAddress={selectedNetwork.address} invoice={invoice} />}
                </div>
              </Col>
              {/* <Col>
                <div className="scan">
                  <h1 className="subtitle-bottom-effect">Pay with Gift Code</h1>
                  <Redeem planName={plan?.name} ethAddress={invoice.ethAddress} />
                  <QRCode
                    value={invoice.ethAddress}
                    size={200}
                    renderAs="svg"
                    bgColor="#ffffff"
                    fgColor="#2e3854"
                    level="H"
                    color="#ffffff"
                    includeMargin={true}
                  />
                </div>
              </Col> */}
            </div>
          </div>
        )}
        {paymentMethod === "usd" && (
          <StripeProvider apiKey={STRIPE_API_KEY}>
            <Elements>
              <UsdPaymentForm plan={plan} onStripeSuccess={handleStripeSuccess} />
            </Elements>
          </StripeProvider>
        )}
      </div>
    </div>
  );
};

const ConfirmPayment: React.FC<SignUpProps> = ({ plan, handle, handleOpenLoginModal, isForRenew, account }) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [remainDate, setRemainDate] = React.useState("");

  const loadInfo = useCallback(async () => {
    const accountInfo = await account.info();
    setRemainDate(moment(accountInfo.account.expirationDate).format("MMM D, YYYY"));
  }, []);

  useEffect(() => {
    isForRenew && loadInfo();
  }, [isForRenew]);

  return (
    <div className="ConfirmPayment">
      <Row className="align-items-center ">
        <Col className="text-center">
          <h2 className="plans">Your Opacity Account is Ready!</h2>
          <h3
            className="login-link"
            onClick={() => {
              handleOpenLoginModal();
            }}
          >
            {isForRenew ? `Your subscription has been renew until ${remainDate}` : "Login now with your Account Handle"}
          </h3>
          <div>Opacity Account Handle</div>
          <Form.Group>
            <div className="account-handle mb-0">{handle}</div>
            <CopyToClipboard text={handle} onCopy={() => handle && setIsCopied(true)}>
              <span className="handle"></span>
            </CopyToClipboard>
            <div className="copy-feedback" style={{ height: 30 }}>
              {isCopied && "Copied to clipboard!"}
            </div>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default SignUpModal;
