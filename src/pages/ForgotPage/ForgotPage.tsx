import * as React from "react";
import SiteWrapper from "../../SiteWrapper";
import "./ForgotPage.scss";
import { Row, Col, Container, Button } from "react-bootstrap";
import { Field, Formik, FormikHelpers } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
import { mnemonicToHandle } from "../../../ts-client-library/packages/util/src/mnemonic";
import { bytesToHex } from "../../../ts-client-library/packages/util/src/hex";

const loginSchema = Yup.object().shape({
  privateKey: Yup.string().required("Account handle is required."),
});
type ForgotPageProps = {
  privateKey: string;
};

const ForgotPage = ({ history }) => {
  const [recoveryHandle, setRecoveryHandle] = React.useState("");
  
  const handleForgotButton = async (values: ForgotPageProps, { setErrors }: FormikHelpers<ForgotPageProps>) => {
    const words = values.privateKey.trim().split(" ");
    if (words.length === 12) {
      const handle = await mnemonicToHandle(words);
      setRecoveryHandle(bytesToHex(handle));
    } else {
      setErrors({
        privateKey: "Please enter your 12 word phrase with a comma or single space between each word.",
      });
    }
  };

  return (
    <SiteWrapper
      history={history}
      recoveryHandle={recoveryHandle}
    >
      <Container fluid="xl forgot">
        <Row>
          <h1>Forgot Account Handle?</h1>
        </Row>
        <Row className="justify-content-center">
          <Col md={8}>
            <Formik
              initialValues={{ privateKey: "" }}
              validationSchema={loginSchema}
              onSubmit={(values, helpers) => {
                handleForgotButton(values, helpers);
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <Row className="align-items-center ">
                    <Col className="text-center mb-4">
                      <h2 className="mb-3">Recover Account Handle</h2>
                      <p>
                        If you have lost your Opacity Account Handle, you can recover it using the 12 word mnemonic phrase provided when you
                        signed up for your account. Please enter your 12 word phrase with a comma or single space between each word. Then
                        click 'Recover Account Handle'.
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <h2>Recovery Phrase</h2>
                      <Form.Group>
                        <Field
                          component="input"
                          name="privateKey"
                          className={
                            errors.privateKey && touched.privateKey ? "form-control input is-invalid state-invalid" : "form-control input"
                          }
                        />
                        {errors.privateKey && touched.privateKey && <div className="invalid-feedback">{errors.privateKey}</div>}
                      </Form.Group>
                    </Col>
                    <Col md="12" className="mt-3">
                      <Button type="submit" variant="primary" size="lg">
                        RECOVER ACCOUNT HANDLE
                      </Button>
                    </Col>
                  </Row>
                </form>
              )}
            </Formik>
          </Col>
        </Row>
      </Container>
    </SiteWrapper>
  );
};

export default ForgotPage;
