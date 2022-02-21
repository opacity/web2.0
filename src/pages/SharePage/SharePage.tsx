import React, { useState, useEffect, useMemo } from "react";
import SiteWrapper from "../../SiteWrapper";
import { useLocation } from "react-router-dom";
import { Row, Col, Container, ProgressBar } from "react-bootstrap";
import { OpaqueDownload } from "../../../ts-client-library/packages/opaque";
import { DownloadEvents, DownloadProgressEvent } from "../../../ts-client-library/packages/filesystem-access/src/events";
import { polyfillWritableStreamIfNeeded, WritableStream } from "../../../ts-client-library/packages/util/src/streams";
import { AccountSystem, MetadataAccess } from "../../../ts-client-library/packages/account-system";
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web";
import streamsaver from "streamsaver";
import { b64URLToBytes } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/b64";
streamsaver.mitm = "/resources/streamsaver/mitm.html";
Object.assign(streamsaver, { WritableStream });
import "./SharePage.scss";
import { formatBytes } from "../../helpers";
import { FileIcon, defaultStyles } from "react-file-icon";
import { Preview } from "./preview";
import { STORAGE_NODE as storageNode } from "../../config";

const SharePage = ({ history }) => {
  const location = useLocation();
  const [handle, setHandle] = useState(null);
  const [file, setFile] = useState(null);
  const [previewPath, setPreviewPath] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [percent, setPercent] = useState(0);

  const cryptoMiddleware = React.useMemo(() => new WebAccountMiddleware(), []);
  const netMiddleware = React.useMemo(() => new WebNetworkMiddleware(), []);
  const metadataAccess = React.useMemo(
    () =>
      new MetadataAccess({
        net: netMiddleware,
        crypto: cryptoMiddleware,
        metadataNode: storageNode,
      }),
    [netMiddleware, cryptoMiddleware, storageNode]
  );
  const accountSystem = React.useMemo(() => new AccountSystem({ metadataAccess }), [metadataAccess]);

  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };

  const getFileExtension = (name) => {
    const lastDot = name.lastIndexOf(".");

    const ext = name.substring(lastDot + 1);
    return ext;
  };

  const getTypeFromExt = (ext?: string) => {
    ext = ("" + ext).replace(/^\./, "");

    if (["png", "apng", "svg", "gif", "bmp", "ico", "cur", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "webp"].includes(ext)) {
      return "image";
    }

    if (["mp4", "ogg", "webm"].includes(ext)) {
      return "video";
    }

    if (["mp3", "flac"].includes(ext)) {
      return "audio";
    }

    if (["txt", "md"].includes(ext)) {
      return "text";
    }

    return undefined;
  };

  const checkPreviewPossible = () => {
    if (!file) return true;

    const newType = "" + (file.type || getTypeFromExt(getFileExtension(file.name)));

    switch (newType.split("/")[0]) {
      case "image":
      case "audio":
      case "video":
      case "text":
        return true;
    }

    return false;
  };

  useEffect(() => {
    const init = async () => {
      const shareHandle = location.hash.split("=")[1];
      const shareHandleBytes = b64URLToBytes(shareHandle);
      const locationKey = shareHandleBytes.slice(0, 32);
      const encryptionKey = shareHandleBytes.slice(32, 64);

      const shared = await accountSystem.getShared(locationKey, encryptionKey);
      setHandle(shared.files[0].private.handle);
      setFile(shared.files[0]);
    };
    init();
  }, [location]);

  const filePreview = async (handle) => {
    if (!previewOpen) {
      !previewPath && (await fileControl(handle, "preview"));
    }
    setPreviewOpen(!previewOpen);
  };

  const fileDownload = async (handle) => {
    await fileControl(handle, "download");
  };

  const clickFreeSignup = () => {
    setShowSignUpModal(true);
  };

  const fileControl = async (handle, mode) => {
    try {
      const d = new OpaqueDownload({
        handle: handle,
        config: {
          crypto: cryptoMiddleware,
          net: netMiddleware,
          storageNode,
        },
        name: file.name,
        fileMeta: file,
      });
      setDownloading(true);
      const s = await d.start();
      setPercent(0);

      const fileStream = polyfillWritableStreamIfNeeded<Uint8Array>(streamsaver.createWriteStream(file.name, { size: file.size }));

      d.addEventListener(DownloadEvents.PROGRESS, (e: DownloadProgressEvent) => {
        setPercent((e.detail.progress * 100).toFixed(0));
      });

      d.finish().then(() => {
        setDownloading(false);
      });

      if (mode === "download" && s.pipeTo) {
        s.pipeTo(fileStream as WritableStream<Uint8Array>)
          .then(() => {
          })
          .catch((err) => {
            throw err;
          });
      } else if (mode === "preview" && s.getReader) {
        let blobArray = new Uint8Array([]);

        const reader = s.getReader();
        const pump = () =>
          reader.read().then(({ done, value }) => {
            if (done) {
              const blob = new Blob([blobArray], { type: file.type });
              setPreviewPath(URL.createObjectURL(blob));
            } else {
              blobArray = new Uint8Array([...blobArray, ...value]);
              pump();
            }
          });
        pump();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isPreviewPossible = checkPreviewPossible();

  return (
    <SiteWrapper history={history} showSignUpModal={showSignUpModal} handleCloseSignUpModal={handleCloseSignUpModal}>
      <Container fluid="xl share">
        <Row>
          <Col lg={6} md={12} className="center">
            <Row style={{ padding: "20px" }}>
              {downloading ? (
                <div className="download-progress">
                  <ProgressBar now={100} animated />
                  <div className="percentage-text">{percent}%</div>
                </div>
              ) : (
                <div className="preview-area center">
                  {previewOpen && previewPath ? (
                    <Preview url={previewPath} ext={file.name} type={file.type} className="preview-content" />
                  ) : (
                    <div style={{ width: "300px" }}>
                      <FileIcon
                        color="#A8A8A8"
                        glyphColor="#ffffff"
                        {...defaultStyles[file && getFileExtension(file.name)]}
                        extension={file && getFileExtension(file.name)}
                      />
                    </div>
                  )}
                </div>
              )}
            </Row>
          </Col>
          <Col lg={6} md={12} className="control-area">
            <Row className="align-items-center">
              <Col className="text-center">
                <div className="text-filename">{file && file.name}</div>
                <div className="text-filesize">{file && formatBytes(file.size)}</div>
                <div className="row mb-3" style={{ justifyContent: "center" }}>
                  <div className="col-md-5">
                    <button className="btn btn-pill btn-download" onClick={() => fileDownload(handle)}>
                      <span></span>
                      Download File
                    </button>
                  </div>
                  <div className="col-md-5">
                    <button className="btn btn-pill btn-preview" onClick={() => filePreview(handle)} disabled={!isPreviewPossible}>
                      <span></span>
                      {isPreviewPossible ? `${previewOpen ? "Hide" : "Show"} Preview` : "Preview Not Available"}
                    </button>
                  </div>
                </div>

                <h2>Easily share your files with Opacity</h2>

                <div className="free-signup-text">
                  <a href="/plans">Get 10GB file storage and file sharing for free</a>
                </div>
                <div style={{ fontSize: "1.1rem" }}>Free to share ideas. Free to be protected. Free to be you.</div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </SiteWrapper>
  );
};

export default SharePage;
