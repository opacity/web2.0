import * as React from "react";
import { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field, Formik, FormikHelpers } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
import history from "../../redux/history";
import "./LoginModal.scss";
import { Account, AccountGetRes, AccountCreationInvoice } from "../../../ts-client-library/packages/account-management"
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web"
import { hexToBytes } from "../../../ts-client-library/packages/util/src/hex"
import { STORAGE_NODE as storageNode, DEFAULT_STORAGE_NODE_V1 } from "../../config"
import { Link } from 'react-router-dom'

const logo = require("../../assets/logo2.png");

type OtherProps = {
  show: boolean;
  handleClose: Function;
  handleSignup: Function;
  recoveryHandle: string;
};

type LoginFormProps = {
  privateKey: string
}

const LoginModal: React.FC<OtherProps> = ({ show, handleClose, recoveryHandle, handleSignup }) => {
  const [privateKey, setPrivateKey] = useState(recoveryHandle ? recoveryHandle : "");
  const [validatePrivateKey, setValidatePrivateKey] = useState(true);
  const [account, setAccount] = React.useState<Account>();

  React.useEffect(() => {
    recoveryHandle && setPrivateKey(recoveryHandle);
  }, [recoveryHandle]);

  const handleLogin = (values: LoginFormProps, { setErrors }: FormikHelpers<LoginFormProps>) => {
    if (!privateKey?.length) {
      setErrors({
        privateKey: "Account handle is required."
      })
      return
    }
    if (privateKey.length != 128) {
      setErrors({
        privateKey: "Account handle must be 128 characters long"
      })
      return
    }

    const cryptoMiddleware = new WebAccountMiddleware({ asymmetricKey: hexToBytes(privateKey) });
    const netMiddleware = new WebNetworkMiddleware();
    const account = new Account({ crypto: cryptoMiddleware, net: netMiddleware, storageNode });
    account.info().then(acc => {
      if (acc.account.apiVersion !== 2) {
        setErrors({
          privateKey: <>Ths account handle is old. <Link to='/migration'>Upgrade</Link> your account to Opacity V2.0</>
        })
        return
      }
      if (acc.paymentStatus === 'paid') {
        localStorage.setItem('key', privateKey);
        history.push('file-manager')
      }
    }).catch((err: Error) => {
      const account = new Account({ crypto: cryptoMiddleware, net: netMiddleware, storageNode: `https://${DEFAULT_STORAGE_NODE_V1}:3000` });
      account.needsMigration().then(res => {
        if(res) {
          setErrors({
            privateKey: <>Ths account handle is old. <Link to='/migration'>Upgrade</Link> your account to Opacity V2.0</>
          })
          return
        }
      }).catch((error: Error) => {
        setErrors({
          privateKey: err.message
        })
      })
    })
  }

  return (
    <Formik initialValues={{ privateKey: "" }} onSubmit={(values, helpers) => { handleLogin(values, helpers) }}>
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <Modal show={show} onHide={handleClose} size='lg' centered dialogClassName='login'>
          <Modal.Body>
            <form onSubmit={handleSubmit} autoComplete='off'>
              <Row className='align-items-center '>
                <Col className='text-center'>
                  <img width='70' src={logo} />
                  <h2>Sign In to Your Account</h2>
                </Col>
              </Row>
              <Row>
                <Col md='12'>
                  <Form.Group>
                    <Field
                      value={privateKey}
                      onChange={e => setPrivateKey(e.target.value)}
                      name='privateKey'
                      placeholder='Account Handle'
                      className={errors.privateKey && touched.privateKey ? "form-control is-invalid state-invalid" : "form-control"}
                    />
                    {errors.privateKey && touched.privateKey && <div className='invalid-feedback'>{errors.privateKey}</div>}
                  </Form.Group>
                </Col>
                <Col md='12' className='mt-3'>
                  <Button type='submit' variant='primary btn-pill' size='lg'>
                    LOGIN
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div
                    className='forgot'
                    onClick={() => {
                      handleClose();
                      history.push("/forgot");
                    }}
                  >
                    Forgot Account Handle?
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className='border-line'>or</div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button variant='outline-primary btn-pill' size='lg' onClick={() => {
                    handleSignup();
                    handleClose();
                    // history.push("/plans");
                  }}>
                    CREATE AN ACCOUNT
                  </Button>
                </Col>
              </Row>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </Formik>
  );
};

export default LoginModal;
