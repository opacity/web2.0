import * as React from "react";
// import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { OPACITY_DRIVE_FOR_MAC, OPACITY_DRIVE_FOR_WINDOWS } from "../../config";
import { browserName, browserVersion } from "react-device-detect";
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
      <Modal.Header>File size Warning</Modal.Header>
      <Modal.Body>
        <h4>
          This {browserName} {browserVersion} has a file size limit for uploads. You can use the Opacity Drive desktop application to upload
          larger files. Get it here
          <a href={OPACITY_DRIVE_FOR_MAC}>Mac</a>, <a href={OPACITY_DRIVE_FOR_WINDOWS}>Windows</a> to app. Learn more about this limitation
          here and click cancel button on Progress bar.
        </h4>
        <a href={"https://www.smartfile.com/blog/file-size-limits-for-uploads-through-web-browsers"}>
          File Size Limits for Uploads through Web Browsers - SmartFile
        </a>
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
