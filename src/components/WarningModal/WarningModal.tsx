import * as React from "react";
// import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./WarningModal.scss";
type OtherProps = {
  show: boolean;
  handleClose: Function;
};
const WarningModal: React.FC<OtherProps> = ({ show, handleClose }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="warning-modal"
      centered
    >
      <Modal.Header>Warning</Modal.Header>
      <Modal.Body>
        <h4>Can’t upload file larger than 2GB ! </h4>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" variant="default" onClick={() => handleClose()}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WarningModal;
