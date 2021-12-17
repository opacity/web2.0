import * as React from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field, Formik } from "formik";
import { Form } from "tabler-react";
import * as Yup from "yup";
import "./NewFolderModal.scss";

const nameSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
});
type OtherProps = {
  show: boolean;
  handleClose: Function;
  addNewFolder: Function;
};
const RenameModal: React.FC<OtherProps> = ({
  show,
  handleClose,
  addNewFolder,
}) => {
  const handleNewName = (values) => {
    addNewFolder(values.name);
  };
  return (
    <Formik
      enableReinitialize
      initialValues={{ name: "" }}
      validationSchema={nameSchema}
      onSubmit={(values, { setErrors }) => {
        handleNewName(values);
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
          dialogClassName="rename"
          centered
        >
          <Modal.Body>
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="rename-form"
            >
              <Row className="align-items-center ">
                <Col className="text-center">
                  <h2>Enter folder name</h2>
                </Col>
              </Row>
              <Row>
                <Col md="12">
                  <Form.Group>
                    <Field
                      name="name"
                      placeholder="New Name"
                      className={
                        errors.name && touched.name
                          ? "form-control is-invalid state-invalid"
                          : "form-control"
                      }
                    />
                    {errors.name && touched.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md="12" className="mt-3">
                  <Button type="submit" variant="primary" size="lg">
                    Create Folder
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

export default RenameModal;
