import * as React from "react";
import { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field, Formik } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
// import history from "../../redux/history";
import ExtChangeAlertModal from "../ExtChangeAlertModal/ExtChangeAlertModal";
import "./RenameModal.scss";

const logo = require("../../assets/logo2.png");
const nameSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
});
type OtherProps = {
  show: boolean;
  handleClose: Function;
  oldName: string;
  setNewName: Function;
};
const RenameModal: React.FC<OtherProps> = ({ show, handleClose, oldName, setNewName }) => {
  const [initValues, setInitValues] = React.useState({
    name: oldName,
  });
  const [showExtAlert, setShowExtAlert] = useState(false);
  const [renamingValue, setRenamingValue] = useState(null);
  const handleNewName = (values) => {
    setNewName(values.name);
  };
  React.useEffect(() => {
    setInitValues({ name: oldName });
  }, []);
  return (
    <>
      {showExtAlert && (
        <ExtChangeAlertModal
          show={showExtAlert}
          handleClose={() => setShowExtAlert(false)}
          handleOk={() => {
            setShowExtAlert(false);
            handleNewName(renamingValue);
          }}
        />
      )}

      <Formik
        enableReinitialize
        initialValues={initValues}
        validationSchema={nameSchema}
        onSubmit={(values, { setErrors }) => {
          const oldExt = oldName.split(".").pop();
          const newExt = values.name.split(".").pop();

          setRenamingValue(values);

          if (oldExt != newExt) {
            console.log("Not Same");
            setShowExtAlert(true);
            return;
          }

          handleNewName(values);
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <Modal show={show} onHide={handleClose} dialogClassName="rename" centered={true}>
            <Modal.Body>
              <form onSubmit={handleSubmit} autoComplete="off" className="rename-form">
                <Row className="align-items-center ">
                  <Col className="text-center">
                    <h2>Enter new name</h2>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <Field
                        name="name"
                        placeholder="New Name"
                        className={errors.name && touched.name ? "form-control is-invalid state-invalid" : "form-control"}
                      />
                      {errors.name && touched.name && <div className="invalid-feedback">{errors.name}</div>}
                    </Form.Group>
                  </Col>
                  <Col md="12" className="mt-3">
                    <Button type="submit" variant="primary" size="lg">
                      Change
                    </Button>
                  </Col>
                </Row>
              </form>
            </Modal.Body>
          </Modal>
        )}
      </Formik>
    </>
  );
};

export default RenameModal;
