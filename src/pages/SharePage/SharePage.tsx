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
streamsaver.mitm = "/resources/streamsaver/mitm.html"
Object.assign(streamsaver, { WritableStream })
import { STORAGE_NODE as storageNode } from "../../config"
import "./SharePage.scss";

const shareImg = require("../../assets/share-download.svg");

const SharePage = ({ history }) => {
  const location = useLocation()
  const [handle, setHandle] = useState(null)

  const cryptoMiddleware = React.useMemo(() => new WebAccountMiddleware(), []);
  const netMiddleware = React.useMemo(() => new WebNetworkMiddleware(), []);
  const metadataAccess = React.useMemo(() => new MetadataAccess({
    net: netMiddleware,
    crypto: cryptoMiddleware,
    metadataNode: storageNode,
  }), [netMiddleware, cryptoMiddleware, storageNode]);
  const accountSystem = React.useMemo(() => new AccountSystem({ metadataAccess }), [metadataAccess]);

  useEffect(() => {
    const init = async () => {
      const shareHandle = location.hash.split('=')[1]
      const shareHandleBytes = b64URLToBytes(shareHandle)

      // const res_mnemonic = await createMnemonic()
      // const res_thandlemnhandle = await mnemonicToHandle(res_mnemonic)

      // setMnemonic(res_mnemonic)
      // setHandlemnhandle(res_thandlemnhandle)

      const locationKey = shareHandleBytes.slice(0, 32)
      const encryptionKey = shareHandleBytes.slice(32, 64)

      const shared = await accountSystem.getShared(locationKey, encryptionKey)

      console.log(shared)
    }
    init()
  }, [location])

  const fileDownload = async (handle) => {
    try {
      const d = new Download({
        handle: handle,
        config: {
          crypto: cryptoMiddleware,
          net: netMiddleware,
          storageNode,
        }
      })

      const metaInfo = await d.metadata()
      console.log(metaInfo, '---')

      const s = await d.start()

      const fileStream = polyfillWritableStreamIfNeeded<Uint8Array>(streamsaver.createWriteStream('tmp', { size: 10 }))

      d.finish().then(() => {
        console.log("finish")
      })

      // more optimized
      if ("WritableStream" in window && s.pipeTo) {
        console.log("pipe")
        s.pipeTo(fileStream as WritableStream<Uint8Array>)
          .then(() => {
            console.log("done")
          })
          .catch(err => {
            console.log(err)
            throw err
          })
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
    <SiteWrapper history={history} page='share' >
      <Container fluid='xl share'>
        <Row>
          <Col md={6} className='center' >
            <Row >
              <div className='preview-area'>
                preview-area
              </div>
            </Row>
          </Col>
          <Col md={6} className="control-area">
            <Row className='align-items-center'>
              <Col className='text-center'>
                <img width='88' src={shareImg} />
                <h2>You have been invited to view a file!</h2>
                <div className='text-filename'>FileName.png</div>
                <div className='text-filesize'>fileSize KB</div>
                <div className='row mb-3'>
                  <div className='col-md-5' style={{ width: '50%' }}>
                    <button className='btn btn-pill btn-download' onClick={() => fileDownload(handle)}>
                      <span></span>
                        Download File
                    </button>
                  </div>
                  <div className='col-md-5' style={{ width: '50%' }}>
                    <button className='btn btn-pill btn-preview' >
                      <span></span>
                        Hide  Preview
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
  )
}

export default SharePage;
