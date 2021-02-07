import * as React from "react";
import { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field, Formik } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
import Reaptcha from "reaptcha";
import "./SignUpModal.scss";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { RECAPTCHA_SITEKEY } from "../../config";
const logo = require("../../assets/logo2.png");
const loginSchema = Yup.object().shape({
  handle: Yup.string().required("Account handle is required."),
  termsCheck: Yup.boolean().required(""),
});
type OtherProps = {
  show: boolean;
  handleClose: Function;
};
const SignUpModal: React.FC<OtherProps> = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg" dialogClassName="signup">
      <Modal.Body>
      <AccountHandle />
        {/* <Row className="signup-process">
          <Col>
            <div className="polygon">Select a Plan</div>
          </Col>
        </Row> */}
      </Modal.Body>
    </Modal>
  );
};

const AccountHandle: React.FC = () => {
  const [handle, setPrivateKey] = useState("");
  const [validatePrivateKey, setValidatePrivateKey] = useState(true);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Formik initialValues={{ handle: "", termsCheck: false }} validationSchema={loginSchema} onSubmit={(values, { setErrors }) => {}}>
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} autoComplete="off">
          <Row className="align-items-center ">
            <Col className="text-center">
              <img width="108" src={logo} />
              <h2>Get started for FREE</h2>
              <h3>
                Your Privacy and <span>Security is in your hands.</span> Keep These Numbers <span>Safe.</span>
              </h3>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Form.Group>
                <Field
                  name="handle"
                  placeholder="Account Handle"
                  className={errors.handle && touched.handle ? "form-control is-invalid state-invalid" : "form-control"}
                />
                <CopyToClipboard text={values.handle} onCopy={() => values.handle && setIsCopied(true)}>
                  <span className="handle"></span>
                </CopyToClipboard>
                {isCopied && <div className="copy-feedback">Copied to clipboard!</div>}
                {errors.handle && touched.handle && <div className="invalid-feedback">{errors.handle}</div>}
              </Form.Group>
            </Col>
            <Col md="12" className="mt-3">
              <h3>
                Keep These Recovery <span>Words Safe.</span>
              </h3>
            </Col>
          </Row>
          <Row className="words-safe">
            <Col xs="6" md="3">
              <div>1. color</div>
            </Col>
            <Col xs="6" md="3">
              <div>2. replace</div>
            </Col>
            <Col xs="6" md="3">
              <div>3. shove</div>
            </Col>
            <Col xs="6" md="3">
              <div>4. bitter</div>
            </Col>
          </Row>

          <Row className="words-safe">
            <Col xs="6" md="3">
              <div>5. fetch</div>
            </Col>
            <Col xs="6" md="3">
              <div>6. blouse</div>
            </Col>
            <Col xs="6" md="3">
              <div>7. forest</div>
            </Col>
            <Col xs="6" md="3">
              <div>8. arrest</div>
            </Col>
          </Row>
          <Row className="words-safe">
            <Col xs="6" md="3">
              <div>9. stage</div>
            </Col>
            <Col xs="6" md="3">
              <div>10. offer</div>
            </Col>
            <Col xs="6" md="3">
              <div>11. pyramid</div>
            </Col>
            <Col xs="6" md="3">
              <div>12. embrace</div>
            </Col>
          </Row>
          <Row>
            <Col className="text-md-right">
              <div className="download-link">Download phrase as CSV</div>
            </Col>
          </Row>
          <Row className="align-items-center mb-3">
            <Col md="7" className="mb-3">
              <Field type="checkbox" name="termsCheck" className="form-check-input" />
              <span className="custom-control-label">
                I agree to the <span>Terms of Service</span> and Privacy Policy
              </span>
            </Col>
            <Col md="5">
              <Reaptcha sitekey="6LciI6cUAAAAAL03VKUCArV9MFS8zgQn49NHItA8" onVerify={() => setIsCaptchaVerified(true)} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Button variant="primary btn-pill" size="lg" type="submit" disabled={!isCaptchaVerified || !values.termsCheck}>
                SIGN UP FOR FREE
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

const SendPayment: React.FC = () => {
  return <div className="SendPayment"></div>;
};
export default SignUpModal;
