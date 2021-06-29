import * as React from "react";
// import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./DeleteModal.scss";
type OtherProps = {
  show: boolean;
  handleClose: Function;
  setDelete: Function;
};
const DeleteModal: React.FC<OtherProps> = ({
  show,
  handleClose,
  setDelete,
}) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="delete-modal"
      centered
    >
      <Modal.Header>Delete</Modal.Header>
      <Modal.Body>
        <h4>Are you sure you want to delete these items? </h4>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" variant="default" onClick={() => handleClose()}>
          Cancel
        </Button>
        <Button type="submit" variant="danger" onClick={() => setDelete()}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
