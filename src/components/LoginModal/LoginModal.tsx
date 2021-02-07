import * as React from "react";
import { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field, Formik } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
import "./LoginModal.scss";
const logo = require("../../assets/logo2.png");
const loginSchema = Yup.object().shape({
  privateKey: Yup.string().required("Account handle is required."),
});
type OtherProps = {
  show: boolean;
  handleClose: Function;
};
const LoginModal: React.FC<OtherProps> = ({ show, handleClose }) => {
  const [privateKey, setPrivateKey] = useState("");
  const [validatePrivateKey, setValidatePrivateKey] = useState(true);
  return (
    <Formik initialValues={{ privateKey: "" }} validationSchema={loginSchema} onSubmit={(values, { setErrors }) => {}}>
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <Modal show={show} onHide={handleClose} size="lg" dialogClassName="login">
          <Modal.Body>
            <form onSubmit={handleSubmit} autoComplete="off">
              <Row className="align-items-center ">
                <Col className="text-center">
                  <img width="108" src={logo} />
                  <h2>Sign In to Your Account</h2>
                </Col>
              </Row>
              <Row>
                <Col md="12">
                  <Form.Group>
                    <Field
                      name="privateKey"
                      placeholder="Account Handle"
                      className={errors.privateKey && touched.privateKey ? "form-control is-invalid state-invalid" : "form-control"}
                    />
                    {errors.privateKey && touched.privateKey && <div className="invalid-feedback">{errors.privateKey}</div>}
                  </Form.Group>
                </Col>
                <Col md="12" className="mt-3">
                  <Button type="submit" variant="primary btn-pill" size="lg">LOGIN</Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="forgot">Forgot Account Handle?</div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="border-line">or</div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button variant="outline-primary btn-pill" size="lg">CREATE AN ACCOUNT </Button>
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
