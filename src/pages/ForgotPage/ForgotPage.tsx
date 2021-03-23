import * as React from "react";
import SiteWrapper from "../../SiteWrapper";
import "./ForgotPage.scss";
import { Row, Col, Container, Media, Button, Carousel, CarouselItem } from "react-bootstrap";
import { Field, Formik } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
const loginSchema = Yup.object().shape({
  privateKey: Yup.string().required("Account handle is required."),
});
const ForgotPage = ({ history }) => {
  return (
    <SiteWrapper history={history}>
      <Container fluid='xl forgot'>
        <Row>
          <h1>Forgot Account Handle?</h1>
        </Row>
        <Row className="justify-content-center">
          <Col md={10}>
            <Formik initialValues={{ privateKey: "" }} validationSchema={loginSchema} onSubmit={(values, { setErrors }) => {}}>
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} autoComplete='off'>
                  <Row className='align-items-center '>
                    <Col className='text-center mb-4'>
                      <h2 className="mb-3">Recover Account Handle</h2>
                      <p>
                        If you have lost your Opacity Account Handle, you can recover it using the 12 word mnemonic phrase provided when you signed up
                        for your account. Please enter the 12 words below in the exact order originally provided with a space between each word. Then
                        click 'Recover Account Handle.
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md='12'>
                      <h2>Recovery Phrase</h2>
                      <Form.Group>
                        <textarea
                          name='privateKey'
                          className={errors.privateKey && touched.privateKey ? "form-control is-invalid state-invalid" : "form-control"}
                        />
                        {errors.privateKey && touched.privateKey && <div className='invalid-feedback'>{errors.privateKey}</div>}
                      </Form.Group>
                    </Col>
                    <Col md='12' className='mt-3'>
                      <Button type='submit' variant='primary' size='lg'>
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
