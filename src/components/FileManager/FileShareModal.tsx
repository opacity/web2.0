import React, { useState } from 'react'
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field } from "formik";
import { Form } from "tabler-react";
import logo from "../../assets/logo2.png"
import copyImage from "../../assets/copies_white.svg"
import closeImg from "../../assets/close.svg"
import "./FileShareModal.scss";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FRONT_END_URL } from '../../config'
import { bytesToHex } from "../../../ts-client-library/packages/util/src/hex"

const FileShareModal = ({
  open,
  onClose,
  file,
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const handleValue = `${FRONT_END_URL}/share#handle=${file && bytesToHex(file.handle)}`
  
  return (
    <Modal show={open} onHide={onClose} size='lg' centered dialogClassName='share'>
      <Modal.Body>
        <img onClick={onClose} src={closeImg} alt='close' className="share-close-button" />
        <form autoComplete='off'>
          <Row className='align-items-center '>
            <Col className='text-center'>
              <img width='70' src={logo} />
              <h2>Share Your File with another</h2>
              <h3>
                <span>ANYONE WITH THIS LINK CAN VIEW THE FILE</span>
              </h3>
            </Col>
          </Row>
          <Row>
            <Col md='12'>
              <Form.Group>
                <div className='account-handle mb-0'>{handleValue}</div>
                <CopyToClipboard text={handleValue} onCopy={() => file && setIsCopied(true)}>
                  <span className='handle'></span>
                </CopyToClipboard>
                {isCopied && <div className='copy-feedback'>Copied to clipboard!</div>}
              </Form.Group>
            </Col>
            <Col md='3' className='mt-3'></Col>
            <Col md='6' className='mt-3'>
              <Button onClick={() => file && setIsCopied(true)} variant='primary btn-pill' size='lg'>
                <img src={copyImage} alt="copy-image" style={{ marginRight: '16px' }} />
								COPY URL
							</Button>
            </Col>
          </Row>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default FileShareModal
