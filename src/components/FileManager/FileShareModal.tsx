import React, { useState, useEffect } from 'react'
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Form } from "tabler-react";
import "./FileShareModal.scss";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FRONT_END_URL, PUBLIC_SHARE_URL } from '../../config'
import { bytesToB64URL } from "../../../ts-client-library/packages/util/src/b64"
import { AccountSystem, FileMetadata } from '../../../ts-client-library/packages/account-system'
import { FileSystemShare } from "../../../ts-client-library/packages/filesystem-access/src/public-share"
import { bindFileSystemObjectToAccountSystem, bindPublicShareToAccountSystem } from "../../../ts-client-library/packages/filesystem-access/src/account-system-binding"
import { FileSystemObject } from "../../../ts-client-library/packages/filesystem-access/src/filesystem-object"
import ReactLoading from "react-loading";
import { CryptoMiddleware } from '../../../ts-client-library/packages/util/node_modules/@opacity/middleware/src'
import { NetworkMiddleware } from '../../../ts-client-library/packages/util/node_modules/@opacity/middleware/src'
import _ from 'lodash'
import { toast } from "react-toastify";

const logo = require("../../assets/logo2.png")
const copyImage = require("../../assets/copies_white.svg")
const revokeImage = require("../../assets/revoke.svg")
const closeImage = require("../../assets/close-button.svg")

type FileShareModalProps = {
  open: any
  onClose: any
  file: FileMetadata
  accountSystem: AccountSystem
  cryptoMiddleware: CryptoMiddleware
  netMiddleware: NetworkMiddleware
  storageNode: string
  mode: "private" | "public"
}

const FileShareModal = ({
  open,
  onClose,
  file,
  accountSystem,
  cryptoMiddleware,
  netMiddleware,
  storageNode,
  mode = 'private',
}: FileShareModalProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [shareURL, setShareURL] = useState("")

  React.useEffect(() => {
    const getFileExtension = (name) => {
      const lastDot = name.lastIndexOf('.');

      const ext = name.substring(lastDot + 1);
      return ext
    }

    const doAction = async () => {
      setPageLoading(true)

      if (mode === 'private') {
        if (file.private.handle) {
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
            toast.error("Error getting existing share:", err)
            onClose()
          })
        } else {
          toast.error("Public files not yet supported")
          onClose()
        }
      } else if (mode === 'public') {
        const curFileMetadata = await accountSystem.getFileMetadata(file.location)

        console.log(curFileMetadata, '---------')
        if (curFileMetadata.public.shortLinks[0] || !_.isEmpty(curFileMetadata.public.location)) {
          setShareURL(`${PUBLIC_SHARE_URL}/${curFileMetadata.public.shortLinks[0]}`)
          setPageLoading(false)

          return
        }

        const fileSystemObject = new FileSystemObject({
          handle: curFileMetadata.private.handle || undefined,
          location: curFileMetadata.public.location || undefined,
          config: {
            crypto: cryptoMiddleware,
            net: netMiddleware,
            storageNode: storageNode,
          }
        })

        bindFileSystemObjectToAccountSystem(accountSystem, fileSystemObject)
        await fileSystemObject.convertToPublic()

        const fileSystemShare = new FileSystemShare({
          fileLocation: fileSystemObject.location,
          config: {
            crypto: cryptoMiddleware,
            net: netMiddleware,
            storageNode: storageNode,
          }
        })

        bindPublicShareToAccountSystem(accountSystem, fileSystemShare)
        await fileSystemShare.publicShare({
          title: curFileMetadata.name,
          description: "This file is opacity public file, Everyone can use this file!",
          fileExtension: getFileExtension(curFileMetadata.name),
          mimeType: curFileMetadata.type,
        })

        setShareURL(`${PUBLIC_SHARE_URL}/${fileSystemShare.shortlink}`)
        setPageLoading(false)
      }
    }

    file && doAction()
  }, [file, mode, accountSystem, cryptoMiddleware, netMiddleware, storageNode])

  const handleRevokeShortlink = async () => {
    setPageLoading(true)

    const curFileMetadata = await accountSystem.getFileMetadata(file.location)

    const fileSystemShare = new FileSystemShare({
      shortLink: curFileMetadata.public.shortLinks[0],
      fileLocation: curFileMetadata.public.location,
      config: {
        crypto: cryptoMiddleware,
        net: netMiddleware,
        storageNode: storageNode,
      }
    })

    bindPublicShareToAccountSystem(accountSystem, fileSystemShare)

    await fileSystemShare.publicShareRevoke()

    setPageLoading(false)
    onClose()
  }


  return (
    <Modal show={open} onHide={() => !pageLoading && onClose()} size='lg' centered dialogClassName='share'>
      <Modal.Body>
        {
          pageLoading && <div className='loading'>
            <ReactLoading type="spinningBubbles" color="#2e6dde" />
          </div>
        }
        <img onClick={() => !pageLoading && onClose()} src={closeImage} alt='close-btn' className="share-close-button" />
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
                <input className='account-handle mb-0 manual-copy' value={shareURL} readOnly />
                <CopyToClipboard text={shareURL} onCopy={() => file && setIsCopied(true)}>
                  <span className='handle'></span>
                </CopyToClipboard>
                {isCopied && <div className='copy-feedback'>Copied to clipboard!</div>}
              </Form.Group>
            </Col>
            {
              mode === 'private'
                ?
                <>
                  <Col md='3' className='mt-3'></Col>
                  <Col md='6' className='mt-3'>
                    <CopyToClipboard text={shareURL} onCopy={() => file && setIsCopied(true)}>
                      <Button variant='primary btn-pill' size='lg'>
                        <img src={copyImage} alt="copy-image" style={{ marginRight: '16px' }} />
                        COPY URL
                      </Button>
                    </CopyToClipboard>
                  </Col>
                </>
                :
                <>
                  <Col md='1' className='mt-3'></Col>
                  <Col md='5' className='mt-3'>
                    <CopyToClipboard text={shareURL} onCopy={() => file && setIsCopied(true)}>
                      <Button variant='primary btn-pill' size='lg'>
                        <img src={copyImage} alt="copy-image" style={{ marginRight: '16px' }} />
                        COPY URL
                      </Button>
                    </CopyToClipboard>
                  </Col>
                  <Col md='5' className='mt-3'>
                    <Button variant='white btn-pill' size='lg' onClick={handleRevokeShortlink} style={{ color: '#E23B2A' }}>
                      <img src={revokeImage} alt="revoke-image" style={{ marginRight: '16px' }} />
                      Revoke
                    </Button>
                  </Col>
                </>
            }
          </Row>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default FileShareModal
