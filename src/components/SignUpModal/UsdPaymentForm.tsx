import React, { useState } from 'react'
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field, Formik, FormikHelpers } from "formik";
import { Form } from "tabler-react";
import { injectStripe, CardElement } from "react-stripe-elements";
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import axios from "axios";
import { getPayload } from "../../../ts-client-library/packages/util/src/payload"
const axiosInstance = axios.create({ timeout: 200000 });

const UsdPaymentForm = ({
  plan,
  stripe,
}) => {
  const [billingCountry, setBillingCountry] = useState(null)
  const [firstName, setFirstName] = useState(null)
  const [lastName, setLastName] = useState(null)
  const [termChecked, setTermChecked] = useState(false)

  const handleSubmit = () => {
    //setIsSubmitDisabled(true);
    stripe
      .createToken({
        type: "card",
        name: `${firstName} ${lastName}`,
        address_country: billingCountry
      })
      .then(async (result) => {
        if (result.error) {
          onStripeError();
        } else {
          const {
            token: { id: token }
          } = result;
          // onSubmit(token);
          const signedPayload = getPayload({
            payload: {
              stripeToken: token
            }
          });

          axiosInstance
            .post(`http://18.191.166.234:3000/api/v1/stripe/create`, signedPayload)
            .then(({ data: { available } }: any) => {
              console.log(available)
            });
        }
      })
      .catch(e => {
        onStripeError();
      });
  }

  const onStripeError = () => {
    // setIsSubmitDisabled(false);
    alert(
      "Something was wrong with your payment information, please try again."
    );
  };

  return (
    <Formik>
      <form className="custom-form-size">
        <Row>
          <Col md='4'>
            <Form.Group>
              <h4>First Name</h4>
              <Field
                onChange={e => setFirstName(e.target.value)}
                value={firstName}
                name='firstName'
                placeholder='First Name'
                className={`form-control ${firstName === '' && 'is-invalid state-invalid'}`}
              />
              {
                firstName === '' && <div className='invalid-feedback'>this field is required.</div>
              }
            </Form.Group>
          </Col>
          <Col md='4'>
            <Form.Group>
              <h4>Last Name</h4>
              <Field
                onChange={e => setLastName(e.target.value)}
                value={lastName}
                name='lastName'
                placeholder='Last Name'
                className={`form-control ${lastName === '' && 'is-invalid state-invalid'}`}
              />
              {
                lastName === '' && <div className='invalid-feedback'>this field is required.</div>
              }
            </Form.Group>
          </Col><Col md='4'>
            <Form.Group>
              <h4>Billing Country</h4>
              <CountryDropdown
                className={`form-control ${billingCountry === '' && 'is-invalid state-invalid'}`}
                value={billingCountry}
                name='billingCountry'
                onChange={(val) => setBillingCountry(val)}
              />
              {
                billingCountry === '' && <div className='invalid-feedback'>this field is required.</div>
              }
            </Form.Group>
          </Col>
          <Col md='12' className='mt-3'>
            <Form.Group>
              <h4>Card Details</h4>
              <CardElement
                style={{
                  base: {
                    fontSize: "16px",
                    fontWeight: "normal",
                    fontFamily: '"Lato", sans-serif'
                  }
                }}
                classes={{
                  base: "stripe-cc-input",
                  invalid: "stripe-cc-input-error"
                }}
              />
            </Form.Group>
          </Col>
          <Col md='12' className='mt-3'>
            <div className='cardform-highlight-text'>
              Total:     {plan.storageLimit} - ${plan.usdCost} for 1 year
            </div>
          </Col>
          <Col md='12' className='mb-3 text-md-right' >
            <Field type='checkbox' name='termsCheck' className='form-check-input' onChange={(e) => setTermChecked(!termChecked)} value={termChecked} />
            <span className='custom-control-label'>
              I agree to the <span>Terms of Service</span> and Privacy Policy
            </span>
          </Col>
          <Col md='12' className='mt-3'>
            <Button onClick={e => handleSubmit()} variant='primary btn-pill' size='lg' disabled={!termChecked}>
              Purchase
            </Button>
          </Col>
        </Row>
      </form>
    </Formik>
  )
}

export default injectStripe(UsdPaymentForm)