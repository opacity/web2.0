import * as React from "react";
import { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field, Formik, FormikHelpers } from "formik";
import { Form } from "tabler-react";
import { Account } from "../../../ts-client-library/packages/account-management";
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web";
import { hexToBytes } from "../../../ts-client-library/packages/util/src/hex";
import { STORAGE_NODE as storageNode } from "../../config";
import { Link, useHistory } from "react-router-dom";
import * as moment from "moment";
import { createBrowserHistory } from "history";
import "./LoginModal.scss";

const history = createBrowserHistory();
const logo = require("../../assets/logo2.png");

type OtherProps = {
  show: boolean;
  handleClose: Function;
  handleSignup: Function;
  recoveryHandle: string;
};

type LoginFormProps = {
  privateKey: string;
};

const LoginModal: React.FC<OtherProps> = ({
  show,
  handleClose,
  recoveryHandle,
  handleSignup,
}) => {
  const [privateKey, setPrivateKey] = useState(recoveryHandle ? recoveryHandle : "");
  const history = useHistory()

  React.useEffect(() => {
    recoveryHandle && setPrivateKey(recoveryHandle);
  }, [recoveryHandle]);

  const handleLogin = (
    values: LoginFormProps,
    { setErrors }: FormikHelpers<LoginFormProps>
  ) => {
    if (!privateKey?.length) {
      setErrors({
        privateKey: "Account handle is required.",
      });
      return;
    }
    if (privateKey.length != 128) {
      setErrors({
        privateKey: "Account handle must be 128 characters long",
      });
      return;
    }

    const cryptoMiddleware = new WebAccountMiddleware({
      asymmetricKey: hexToBytes(privateKey),
    });
    const netMiddleware = new WebNetworkMiddleware();
    const account = new Account({
      crypto: cryptoMiddleware,
      net: netMiddleware,
      storageNode,
    });
    account
      .info()
      .then((acc) => {
        if (acc.account.apiVersion !== 2) {
          localStorage.setItem("old-key", privateKey);
          setErrors({
            privateKey: (
              <>
                We have detected this is a v1 account. To access your account, please update to v2 <Link to="/migration">here</Link>.<br />
                If you prefer to download your v1 files only, please use this <Link to="/migration-download">link</Link>.
              </>
            ),
            type: 'migration'
          });
          return;
        }

        if (acc.paymentStatus === "paid") {
          localStorage.setItem("key", privateKey);
          history.push("file-manager");
        } else {
          // expired status
          const remainDays = moment(acc.account.expirationDate).diff(moment(Date.now()), "days");
          if (remainDays <= 30) {
            localStorage.setItem("key", privateKey);
            history.push("file-manager");
          }
        }
      })
      .catch((err: Error) => {
        const account = new Account({
          crypto: cryptoMiddleware,
          net: netMiddleware,
          storageNode: storageNode,
        });
        account
          .needsMigration()
          .then((res) => {
            if (res) {
              setErrors({
                privateKey: (
                  <>
                    We have detected this is a v1 account. To access your account, please update to v2 <Link to="/migration">here</Link>.<br />
                    If you prefer to download your v1 files only, please use this <Link to="/migration-download">link</Link>.
                  </>
                ),
                type: 'migration'
              });
              return;
            }
          })
          .catch((error: Error) => {
            setErrors({
              privateKey: err.message,
            });
          });
      });
  };

  return (
    <Formik
      initialValues={{ privateKey: "" }}
      onSubmit={(values, helpers) => {
        handleLogin(values, helpers);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <Modal
          show={show}
          onHide={handleClose}
          size="lg"
          centered
          dialogClassName="login"
        >
          <Modal.Body>
            <form onSubmit={handleSubmit} autoComplete="off">
              <Row className="align-items-center ">
                <Col className="text-center">
                  <img width="70" src={logo} />
                  <h2>Sign In to Your Account</h2>
                </Col>
              </Row>
              <Row>
                <Col md="12">
                  <Form.Group>
                    <Field
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      name="privateKey"
                      placeholder="Account Handle"
                      className={
                        errors.privateKey && touched.privateKey
                          ? "form-control is-invalid state-invalid"
                          : "form-control"
                      }
                    />
                    {errors.privateKey && touched.privateKey && (
                      <div className="invalid-feedback" style={{ fontSize: errors.type === 'migration' && '140%' }}>
                        {errors.privateKey}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md="12" className="mt-3">
                  <Button type="submit" variant="primary btn-pill" size="lg">
                    LOGIN
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div
                    className="forgot"
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
                  <div className="border-line">or</div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    variant="outline-primary btn-pill"
                    size="lg"
                    onClick={() => {
                      handleSignup();
                      handleClose();
                      // history.push("/plans");
                    }}
                  >
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
