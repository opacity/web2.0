import React, { useState, useEffect } from 'react'
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Field } from "formik";
import { Form } from "tabler-react";
import "./FileShareModal.scss";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FRONT_END_URL } from '../../config'
import { bytesToB64URL } from "../../../ts-client-library/packages/util/src/b64"
import { AccountSystem, FileMetadata } from '../../../ts-client-library/packages/account-system'
import ReactLoading from "react-loading";

const logo = require("../../assets/logo2.png")
const copyImage = require("../../assets/copies_white.svg")
const closeImage = require("../../assets/close-button.svg")

type FileShareModalProps = {
  open: any
  onClose: any
  file: FileMetadata
  accountSystem: AccountSystem
}

const FileShareModal = ({
  open,
  onClose,
  file,
  accountSystem,
}: FileShareModalProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)

  const [shareURL, setShareURL] = useState("")

  React.useEffect(() => {
    if (!file) {
      setShareURL("")

      return
    }

    if (file.private.handle) {
      setPageLoading(true)
      accountSystem.getSharesByHandle(file.private.handle).then(async (shares) => {
        if (shares[0]) {
          const shareHandle = bytesToB64URL(accountSystem.getShareHandle(shares[0]))
          setShareURL(`${FRONT_END_URL}/share#key=${shareHandle}`)
          setPageLoading(false)
        }
        else {
          const shareMeta = await accountSystem.share([
            {
              location: file.location,
              path: "/",
            }
          ]).catch((err) => {
            setShareURL("")
            console.error("Error starting share:", err)

            // do something with the error
          })

          if (!shareMeta) {
            return
          }

          const shareHandle = bytesToB64URL(accountSystem.getShareHandle(shareMeta))
          setShareURL(`${FRONT_END_URL}/share#key=${shareHandle}`)
          setPageLoading(false)
        }
      }).catch((err) => {
        setShareURL("")
        console.error("Error getting existing share:", err)

        // do something with the error
      })
    } else {
      console.error("Public files not yet supported")
    }
  }, [file])

  return (
    <Modal show={open} onHide={onClose} size='lg' centered dialogClassName='share'>
      <Modal.Body>
        {
          pageLoading && <div className='loading'>
            <ReactLoading type="spinningBubbles" color="#2e6dde" />
          </div>
        }
        <img onClick={onClose} src={closeImage} alt='close-btn' className="share-close-button" />
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
                <input className='account-handle mb-0 manual-copy' value={shareURL} readOnly/>
                <CopyToClipboard text={shareURL} onCopy={() => file && setIsCopied(true)}>
                  <span className='handle'></span>
                </CopyToClipboard>
                {isCopied && <div className='copy-feedback'>Copied to clipboard!</div>}
              </Form.Group>
            </Col>
            <Col md='3' className='mt-3'></Col>
            <Col md='6' className='mt-3'>
              <CopyToClipboard text={shareURL} onCopy={() => file && setIsCopied(true)}>
                <Button variant='primary btn-pill' size='lg'>
                  <img src={copyImage} alt="copy-image" style={{ marginRight: '16px' }} />
                  COPY URL
                </Button>
              </CopyToClipboard>
            </Col>
          </Row>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default FileShareModal
