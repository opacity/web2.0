import * as React from "react";
import { useState, useEffect } from "react";
import { Modal, Button, Row, Col, ProgressBar, DropdownButton, Dropdown } from "react-bootstrap";
import { Field, Formik } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import "./SignUpModal.scss";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { PlanType } from "../../config";
import { createMnemonic, mnemonicToHandle } from "../../../ts-client-library/packages/util/src/mnemonic";
import { Account, AccountGetRes, AccountCreationInvoice } from "../../../ts-client-library/packages/account-management"
import { AccountSystem, MetadataAccess } from "../../../ts-client-library/packages/account-system"
import { Upload, bindUploadToAccountSystem } from "../../../ts-client-library/packages/opaque"
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web"
import { bytesToHex, hexToBytes } from "../../../ts-client-library/packages/util/src/hex"
import { STORAGE_NODE as storageNode } from "../../config"
import { STRIPE_API_KEY } from "../../config";
import Redeem from "./Redeem"
import UsdPaymentForm from './UsdPaymentForm'
import { Elements, StripeProvider } from "react-stripe-elements";
import QRCode from "qrcode.react";
import MetamaskButton from "./metamask-button";
import Metamask from "../../services/metamask";
import { connect } from "react-redux";
import metamaskActions from "../../redux/actions/metamask-actions";

const logo = require("../../assets/logo2.png");
const loginSchema = Yup.object().shape({
  handle: Yup.string().length(128),
  termsCheck: Yup.boolean().required(""),
});
type OtherProps = {
  show: boolean;
  handleClose: Function;
  plan?: PlanType;
  openLoginModal: Function;
  openMetamask: Function;
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
  openMetamask?: Function;
  mnemonic?: string[];
  invoice?: AccountCreationInvoice;
  account?: Account;
};

const SignUpModal: React.FC<OtherProps> = ({ show, handleClose, plan, openLoginModal, openMetamask }) => {
  const [handle, setHandle] = useState("");
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [currentStep, setStep] = React.useState<number>(1);
  const [account, setAccount] = React.useState<Account>();
  const [invoiceData, setInvoiceData] = React.useState<AccountCreationInvoice>();

  const goBack = () => {
    if (currentStep > 1) setStep(currentStep - 1);
    else handleClose();
  };
  const goNext = () => {
    if (currentStep === 1) {
      if (!plan || plan.permalink === 'free') {
        createAccount().then(() => {
          setStep(3)
        })
      } else {
        createAccount().then(() => {
          setStep(currentStep + 1);
        })
      }
    } else {
      setStep(currentStep + 1);
    }
  };
  const ModalClose = () => {
    setStep(1);
    handleClose();
  };
  const handleOpenLoginModal = () => {
    handleClose();
    openLoginModal();
  };
  const createAccount = async () => {
    const cryptoMiddleware = new WebAccountMiddleware({ asymmetricKey: hexToBytes(handle) });
    const netMiddleware = new WebNetworkMiddleware();
    const account = new Account({ crypto: cryptoMiddleware, net: netMiddleware, storageNode });
    setAccount(account)
    let form = {};
    if (plan) {
      form = {
        size: plan.storageInGB
      }
    } else {
      form = {
        size: 10
      }
    }
    const invoice = await account.signUp(form);
    setInvoiceData(invoice)
  }
  useEffect(() => {
    setMnemonic([])
    setHandle("")
    createMnemonic().then(async (res) => {
      setMnemonic(res);
      const handle = await mnemonicToHandle(res);
      setHandle(bytesToHex(handle));
    });
    // change in the plan must cause handle to update
  }, [plan]);
  return (
    <Modal show={show} onHide={ModalClose} size='lg' centered dialogClassName='signup'>
      <Modal.Body>
        {plan && (
          <div className='signup-process'>
            <div className='process-item'>
              <div className='process-image'>
                <div className='image-item plan'></div>
              </div>
              <div className='polygon'>Select a Plan</div>
            </div>
            <div className={currentStep === 1 ? "process-item active" : "process-item"}>
              <div className='process-image'>
                <div className='image-item record'></div>
              </div>
              <div className='polygon'>Record Account Handle</div>
            </div>
            <div className={currentStep === 2 ? "process-item active" : "process-item"}>
              <div className='process-image'>
                <div className='image-item payment'></div>
              </div>
              <div className='polygon'>Send Payment</div>
            </div>
            <div className={currentStep === 3 ? "process-item active" : "process-item"}>
              <div className='process-image'>
                <div className='image-item confirm'></div>
              </div>
              <div className='polygon'>Confirm Payment</div>
            </div>
          </div>
        )}
        {currentStep === 1 && <AccountHandle plan={plan} handle={handle} mnemonic={mnemonic} goBack={goBack} goNext={goNext} />}
        {currentStep === 2 && <SendPayment plan={plan} account={account} invoice={invoiceData} goBack={goBack} goNext={goNext} openMetamask={openMetamask} />}
        {currentStep === 3 && <ConfirmPayment plan={plan} handle={handle} goBack={goBack} goNext={goNext} handleOpenLoginModal={handleOpenLoginModal} />}
      </Modal.Body>
    </Modal>
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
          setErrors({ handle: 'Please make sure to copy and save your account handle before proceeding.' })
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} autoComplete='off'>
          <Row className='align-items-center '>
            <Col className='text-center'>
              {plan ? (
                <h2 className='plans'>IMPORTANT: Save Your Account Handle Recovery Phrase</h2>
              ) : (
                  <>
                    <img width='70' src={logo} />
                    <h2>Get started for FREE</h2>
                  </>
                )}
              <h3>
                Your Privacy and <span>Security is in your hands.</span> Keep These Numbers <span>Safe.</span>
              </h3>
            </Col>
          </Row>
          <Row>
            <Col md='12'>
              <Form.Group>
                <div className='account-handle mb-0'>{handle}</div>
                <CopyToClipboard text={handle} onCopy={() => handle && setIsCopied(true)}>
                  <span className='handle'></span>
                </CopyToClipboard>
                {isCopied && <div className='copy-feedback'>Copied to clipboard!</div>}
                {errors.handle && !isCopied && <div className='invalid-feedback d-block'>{errors.handle}</div>}
              </Form.Group>
            </Col>
            <Col md='12' className='mt-3'>
              <h3>
                Keep These Recovery <span>Words Safe.</span>
              </h3>
            </Col>
          </Row>
          <Row className='words-safe'>
            {mnemonic.map((word, i) => (
              <Col xs='6' md='3' key={i}>
                <div>
                  {i + 1}. {word}
                </div>
              </Col>
            ))}
          </Row>
          <Row>
            <Col>
              <div
                className='download-link'
                onClick={() => {
                  downloadCsv(mnemonic);
                }}
              >
                Download phrase as CSV
              </div>
            </Col>
          </Row>
          <Row className='align-items-center mb-3'>
            <Col md='12' className='mb-3 text-md-right' >
              <Field type='checkbox' name='termsCheck' className='form-check-input' onChange={handleChange} onBlur={handleBlur} />
              <span className='custom-control-label'>
                I agree to the <span>Terms of Service</span> and Privacy Policy
              </span>
            </Col>
            <Col md='12' className='text-md-right'>
              <HCaptcha
                sitekey='e43ebc8e-8590-4991-bde4-eb93a9301f0d'
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
                <Col md={6} className='mb-md-0 mb-2'>
                  <Button variant='outline-primary' size='lg' type='button' onClick={() => { goBack() }}>
                    Go Back
                  </Button>
                </Col>
                <Col md={6}>
                  <Button variant='primary' size='lg' type='submit'
                    disabled={!isCaptchaVerified || !values.termsCheck}
                  >
                    Continue
                  </Button>
                </Col>
              </>
            ) : (
                <Col>
                  <Button variant='primary btn-pill' size='lg' type='submit'
                    disabled={!isCaptchaVerified || !values.termsCheck}
                  >
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

const SendPayment: React.FC<SignUpProps> = ({ goNext, plan, invoice, account, openMetamask }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('crypto')

  React.useEffect(() => {
    account.waitForPayment().then(() => {
      goNext();
    })
  }, [])

  const handleStripeSuccess = async (stripeToken) => {
    const res = await account.createSubscription({ stripeToken })
  }

  return (
    <div className='SendPayment'>
      <div className='card-body'>
        <div className='payment-type'>
          <div className='d-flex'>
            <div className={`type-item ${paymentMethod === 'crypto' && 'active'}`} onClick={(e) => {
              setPaymentMethod('crypto')
            }}>Pay with cryptocurrency</div>
            <div className={`type-item ${paymentMethod === 'usd' && 'active'}`} onClick={(e) => {
              setPaymentMethod('usd')
            }}>Pay with USD</div>
          </div>
          <DropdownButton id='dropdown-basic-button' title='Pay with cryptocurrency' className='d-none'>
            <Dropdown.Item href='#/action-2'>Pay with cryptocurrency</Dropdown.Item>
            <Dropdown.Item href='#/action-3'>Pay with USD</Dropdown.Item>
          </DropdownButton>
        </div>
        {
          paymentMethod === 'crypto' &&
          <div>
            <h3>Send Payment with OPCT</h3>
            <div className='payment-content'>
              Use the Opacity Storage Token, OPCT, to pay for your storage account. Send your total amount of 16 OPCT to the address below or you may use
              MetaMask to easily make your payment right in your browser.
              </div>
            <div className='important-content'>
              IMPORTANT: Do not send any other coin or token to this account address as it may result in a loss of funds. Only send 16 OPCT. Sending more
              may also result in loss of funds.
              </div>
            <div className='payment-content'>
              Once your payment is sent, it may take some time to confirm your payment on the Ethereum network. We will confirm receipt and complete setup
              of your account once the network transaction is confirmed. Please be patient.
              </div>
            <ProgressBar striped now={100} animated />
            <div className='send-email'>Send {plan.opctCost} OPCT to Ethereum Address:</div>
            <div className='form-group'>
              <div className='account-handle'>{invoice.ethAddress}</div>
              <CopyToClipboard text={invoice.ethAddress} onCopy={() => invoice.ethAddress && setIsCopied(true)}>
                <span className='handle'></span>
              </CopyToClipboard>
              {isCopied && <div className='copy-feedback'>Copied to clipboard!</div>}
            </div>
            <div className='need-opct'>
              Need OPCT? <span className='here' onClick={() => window.open('https://www.kucoin.com/trade/OPCT-BTC', "_blank")}>Purchase here</span>
            </div>
            <div className='row qrcode'>
              <Col>
                <h1 className='subtitle-bottom-effect'>Other Ways To Pay</h1>
                {Metamask.isInstalled &&
                  <div className="center">
                    <MetamaskButton
                      onClick={() => openMetamask(invoice)}
                    />
                    <span className='or'>or</span>
                  </div>
                }
                <Redeem storageLimit={plan.storageLimit} ethAddress={invoice.ethAddress} />
              </Col>
              <Col>
                <div className='scan'>
                  <h3 className='subtitle-bottom-effect'>Scan QR code to pay</h3>
                  <QRCode
                    value={'ethAddress'}
                    size={200}
                    renderAs="svg"
                    bgColor="#ffffff"
                    fgColor="#2e3854"
                    level="H"
                    color="#ffffff"
                    includeMargin={true}
                  />
                </div>
              </Col>
            </div>
          </div>
        }
        {
          paymentMethod === 'usd' &&
          <StripeProvider apiKey={STRIPE_API_KEY}>
            <Elements>
              <UsdPaymentForm plan={plan} onStripeSuccess={handleStripeSuccess} />
            </Elements>
          </StripeProvider>
        }


      </div>
    </div>
  );
};

const ConfirmPayment: React.FC<SignUpProps> = ({ plan, handle, handleOpenLoginModal }) => {
  const [isCopied, setIsCopied] = React.useState(false)
  return (
    <div className='ConfirmPayment'>
      <Row className='align-items-center '>
        <Col className='text-center'>
          <h2 className='plans'>Your Opacity Account is Ready!</h2>
          <h3
            className='login-link'
            onClick={() => {
              handleOpenLoginModal();
            }}
          >
            Login now with your Account Handle
          </h3>
          <div>Opacity Account Handle</div>
          <Form.Group>
            <div className='account-handle mb-0'>{handle}</div>
            <CopyToClipboard text={handle} onCopy={() => handle && setIsCopied(true)}>
              <span className='handle'></span>
            </CopyToClipboard>
            <div className='copy-feedback' style={{ height: 30 }}>{isCopied && 'Copied to clipboard!'}</div>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  openMetamask: ({ cost, ethAddress, gasPrice }) =>
    dispatch(metamaskActions.createTransaction({ cost, ethAddress, gasPrice })),
});

export default connect(
  null,
  mapDispatchToProps
)(SignUpModal);
