import React, { useState, useEffect, useMemo } from "react";
import SiteWrapper from "../../SiteWrapper";
import { useLocation } from 'react-router-dom'
import { Row, Col, Container, Media, Button, Carousel, CarouselItem } from "react-bootstrap";
import { Download } from "../../../ts-client-library/packages/opaque"
import { polyfillWritableStreamIfNeeded, WritableStream } from "../../../ts-client-library/packages/util/src/streams"
import { AccountSystem, MetadataAccess } from "../../../ts-client-library/packages/account-system"
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web"
import streamsaver from "streamsaver";
import { b64URLToBytes } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/b64"
import { bytesToHex } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/hex"
streamsaver.mitm = "/resources/streamsaver/mitm.html"
Object.assign(streamsaver, { WritableStream })
import { STORAGE_NODE as storageNode } from "../../config"
import "./SharePage.scss";
import { formatBytes } from "../../helpers"
import { FileIcon, defaultStyles } from 'react-file-icon';
import { Preview, getTypeFromExt } from "./preview";
import ReactLoading from "react-loading";

const shareImg = require("../../assets/share-download.svg");

const SharePage = ({ history }) => {
  const location = useLocation()
  const [handle, setHandle] = useState(null)
  const [file, setFile] = useState(null)
  const [previewPath, setPreviewPath] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const cryptoMiddleware = React.useMemo(() => new WebAccountMiddleware(), []);
  const netMiddleware = React.useMemo(() => new WebNetworkMiddleware(), []);
  const metadataAccess = React.useMemo(() => new MetadataAccess({
    net: netMiddleware,
    crypto: cryptoMiddleware,
    metadataNode: storageNode,
  }), [netMiddleware, cryptoMiddleware, storageNode]);
  const accountSystem = React.useMemo(() => new AccountSystem({ metadataAccess }), [metadataAccess]);

  const getFileExtension = (name) => {
    const lastDot = name.lastIndexOf('.');

    const ext = name.substring(lastDot + 1);
    return ext
  }

  useEffect(() => {
    const init = async () => {
      const shareHandle = location.hash.split('=')[1]
      const shareHandleBytes = b64URLToBytes(shareHandle)
      const locationKey = shareHandleBytes.slice(0, 32)
      const encryptionKey = shareHandleBytes.slice(32, 64)

      const shared = await accountSystem.getShared(locationKey, encryptionKey)
      setHandle(shared.files[0].private.handle)
      setFile(shared.files[0])
    }
    init()
  }, [location])

  const filePreview = async (handle) => {
    if (!previewOpen) {
      !previewPath && await fileControl(handle, 'preview')
    }
    setPreviewOpen(!previewOpen)
  }

  const fileDownload = async (handle) => {
    await fileControl(handle, 'download')
  }

  const fileControl = async (handle, mode) => {
    try {
      const d = new Download({
        handle: handle,
        config: {
          crypto: cryptoMiddleware,
          net: netMiddleware,
          storageNode,
        }
      })
      setDownloading(true)
      const s = await d.start()

      const fileStream = polyfillWritableStreamIfNeeded<Uint8Array>(streamsaver.createWriteStream(file.name, { size: file.size }))

      d.finish().then(() => {
        setDownloading(false)
        console.log("finish")
      })

      if ("WritableStream" in window) {
        if (mode === 'download' && s.pipeTo) {
          s.pipeTo(fileStream as WritableStream<Uint8Array>)
            .then(() => {
              console.log("done")
            })
            .catch(err => {
              console.log(err)
              throw err
            })
        } else if (mode === 'preview' && s.getReader) {

          let blobArray = new Uint8Array([]);

          const reader = s.getReader();
          const pump = () => reader.read()
            .then(({ done, value }) => {
              if (done) {
                const blob = new Blob([blobArray], { type: file.type });
                setPreviewPath(URL.createObjectURL(blob));
              } else {
                blobArray = new Uint8Array([...blobArray, ...value]);
                pump();
              }
            })
          pump()
        }
      } else {
        console.log("pump")
        const writer = fileStream.getWriter();
        const reader = s.getReader();

        const pump = () => reader.read()
          .then(res => res.done
            ? writer.close()
            : writer.write(res.value).then(pump))

        pump()
      }
    } catch (e) {
      console.error(e)
      console.log('download end')
    }
  }

  return (
    <>
      {
        downloading && <div className='loading'>
          <ReactLoading type="spinningBubbles" color="#2e6dde" />
        </div>
      }
      <SiteWrapper history={history} page='share' >
        <Container fluid='xl share'>

          <Row>
            <Col md={6} className='center' >
              <Row style={{ padding: '20px' }}>
                <div className='preview-area center'>
                  {
                    (previewOpen && previewPath) ?
                      <Preview
                        url={previewPath}
                        ext={file.name}
                        type={file.type}
                        className='preview-content'
                      />
                      :
                      <div style={{ width: '300px' }}>
                        <FileIcon
                          color="#A8A8A8"
                          glyphColor="#ffffff"
                          {...defaultStyles[file && getFileExtension(file.name)]}
                          extension={file && getFileExtension(file.name)}
                        />
                      </div>
                  }
                </div>
              </Row>
            </Col>
            <Col md={6} className="control-area">
              <Row className='align-items-center'>
                <Col className='text-center'>
                  <img width='88' src={shareImg} />
                  <h2>You have been invited to view a file!</h2>
                  <div className='text-filename'>{file && file.name}</div>
                  <div className='text-filesize'>{file && formatBytes(file.size)}</div>
                  <div className='row mb-3' style={{ justifyContent: 'center' }}>
                    <div className='col-md-5'>
                      <button className='btn btn-pill btn-download' onClick={() => fileDownload(handle)}>
                        <span></span>
                        Download File
                    </button>
                    </div>
                    <div className='col-md-5'>
                      <button className='btn btn-pill btn-preview' onClick={() => filePreview(handle)}>
                        <span></span>
                        {previewOpen ? 'Hide' : 'Show'}  Preview
                    </button>
                    </div>
                  </div>
                  <div className='text-comment' style={{ marginTop: '50px' }}>
                    Get 10GB file storage and file sharing for free
                </div>
                  <div className='text-comment'>
                    Free to share ideas. Free to be protected. Free to be you.
                </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </SiteWrapper >
    </>
  )
}

export default SharePage;
