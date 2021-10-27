import * as React from "react";
// import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./ExtChangeAlertModal.scss";
type OtherProps = {
  show: boolean;
  handleClose: Function;
  handleOk: Function;
  fromExt?: string | null;
  toExt?: string | null;
};
const ExtChangeAlertModal: React.FC<OtherProps> = ({ show, handleClose, handleOk, fromExt, toExt }) => {
  return (
    <Modal show={show} onHide={handleClose} dialogClassName="ext-change-alert-modal" centered size="sm">
      <Modal.Header>Warning</Modal.Header>
      <Modal.Body>
        <h4>
          You're changing the file extension from {fromExt} to {toExt}. Are you really want to proceed?
        </h4>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" variant="default" onClick={() => handleOk()}>
          Yes
        </Button>

        <Button type="submit" variant="default" onClick={() => handleClose()}>
          No
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExtChangeAlertModal;
