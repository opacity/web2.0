import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Breadcrumb } from "react-bootstrap";
import { Table, Button } from "tabler-react";
import "./OldFileManager.scss";
import { MasterHandle, Download } from "opaque";
import { STORAGE_NODE as storageNode } from "../../config";
import { ToastContainer, toast } from "react-toastify";
import { FileManagerFileEntryList } from "../../components/FileManager/OldFileManagerFileEntry";
import { FileManagerFolderEntryList } from "../../components/FileManager/OldFileManagerFolderEntry";
import ReactLoading from "react-loading";
import * as FileSaver from "file-saver";


const OldAccountFileManage = ({ history }) => {
  const privateKey = localStorage.getItem("old-key");

  const [currentPath, setCurrentPath] = useState("/");
  const [subPaths, setSubPaths] = useState([]);
  const [folderList, setFolderList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const masterHandle = useMemo(
    () =>
      new MasterHandle(
        {
          handle: privateKey,
        },
        {
          downloadOpts: {
            endpoint: storageNode,
          },
          uploadOpts: {
            endpoint: storageNode,
          },
        }
      ),
    []
  );

  const loadData = useCallback(async (path) => {
    setPageLoading(true);

    const levels = path.split("/").slice(1);
    const subpaths = levels.map((l, i) => {
      const parentFolders = levels.filter((_l, idx) => idx < i);
      const parentPaths = "/" + (parentFolders.length > 0 ? parentFolders.join("/") + "/" : "");

      return { text: l, path: parentPaths + l };
    });
    setSubPaths(subpaths);

    try {
      const data = await masterHandle.getFolderMeta(path);
      setFolderList(data.folders);
      setFileList(data.files);

      setPageLoading(false);
    } catch (err) {
      toast.error("Unknown error!");
      setPageLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (handle) => {
    const download = new Download(handle, {
      endpoint: storageNode,
    });

    download
      .metadata()
      .then(({ name: filename }) => {
        toast.info(`${filename} is downloading. Please wait...`, {
          autoClose: false,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: handle,
        });

        download.on("download-progress", (event) => {
          toast.update(handle, {
            render: `${filename} download progress: ${Math.round(event.progress * 100.0)}%`,
            progress: event.progress,
          });
        });

        download
          .toFile()
          .then((file) => {
            const f = file as File;
            FileSaver.saveAs(f);

            toast.update(handle, {
              render: `${filename} has finished downloading.`,
              progress: 1,
            });
            setTimeout(() => {
              toast.dismiss(handle);
            }, 3000);
          })
          .catch((error) => {});
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    setSelectedFiles([]);
    loadData(currentPath);
  }, [currentPath]);

  const handleDownloadFiles = async () => {
    for (const file of selectedFiles) {
      await downloadFile(file.versions[0].handle);
    }
  };

  const handleSelectFile = (file) => {
    let temp = selectedFiles.slice();
    let i = selectedFiles.findIndex((ele) => ele.versions[0].handle === file.versions[0].handle);
    if (i !== -1) {
      temp.splice(i, 1);
    } else {
      temp = [...selectedFiles, file];
    }
    setSelectedFiles(temp);
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === fileList.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(fileList);
    }
  };

  return (
    <div className="old-file-content">
      {pageLoading && (
        <div className="loading">
          <ReactLoading type="spinningBubbles" color="#2e6dde" />
        </div>
      )}

      <div className="file-header">
        <Button className="mr-2" onClick={handleSelectAll}>
          {selectedFiles.length !== 0 && selectedFiles.length === fileList.length ? "Unselect All" : "Select All"}
        </Button>

        {selectedFiles.length > 0 && (
          <Button className="mr-2" onClick={handleDownloadFiles}>
            Download {selectedFiles.length} Files
          </Button>
        )}

        <Button
          onClick={() => {
            localStorage.clear();
            history.push("/");
          }}
        >
          Logout
        </Button>
      </div>

      <div className="container-xl">
        <div className="breadcrumb-content">
          <Breadcrumb>
            <Breadcrumb.Item href="#" onClick={() => currentPath !== "/" && setCurrentPath("/")}>
              <span className="home-icon"></span>
            </Breadcrumb.Item>
            {currentPath !== "/" &&
              subPaths.map(({ text, path }, i) =>
                i === subPaths.length - 1 ? (
                  <Breadcrumb.Item active key={i}>
                    {text}
                  </Breadcrumb.Item>
                ) : (
                  <Breadcrumb.Item key={i} onClick={() => setCurrentPath(path)}>
                    {text}
                  </Breadcrumb.Item>
                )
              )}
          </Breadcrumb>
        </div>

        <Table highlightRowOnHover hasOutline verticalAlign="center" className="text-nowrap">
          <Table.Header>
            <tr className="file-table-header">
              <th>Name</th>
              <th>Created Date</th>
              <th>Size</th>
              <th>Action</th>
            </tr>
          </Table.Header>
          <Table.Body>
            {folderList.map((item, key) => (
              <FileManagerFolderEntryList key={key} folderEntry={item} currentPath={currentPath} setCurrentPath={setCurrentPath} />
            ))}
            {fileList.map((item, key) => (
              <FileManagerFileEntryList
                key={key}
                fileEntry={item}
                downloadFile={downloadFile}
                selectedFiles={selectedFiles}
                onSelectFile={handleSelectFile}
              />
            ))}
          </Table.Body>
        </Table>

        <ToastContainer pauseOnHover={false} draggable={true} progressClassName="toast-progress-bar" bodyClassName="toast-body" />
      </div>
    </div>
  );
};

export default OldAccountFileManage;
