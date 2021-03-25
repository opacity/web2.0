import * as React from "react";
import { NavLink, Table } from "tabler-react";
import { ToastContainer, toast } from "react-toastify";
import { Row, Col, Container, Media, Button, Nav, ProgressBar, Breadcrumb, DropdownButton, Dropdown } from "react-bootstrap";
import TreeMenu, { TreeMenuProps, ItemComponent } from "react-simple-tree-menu";
import { Account, AccountGetRes, AccountCreationInvoice } from "../../../ts-client-library/packages/account-management"
import { AccountSystem, MetadataAccess, FileMetadata, FolderMetadata, FolderFileEntry, FoldersIndexEntry } from "../../../ts-client-library/packages/account-system"
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web"
import { bytesToB64, b64ToBytes } from "../../../ts-client-library/packages/util/src/b64"
import { polyfillReadableStreamIfNeeded, polyfillWritableStreamIfNeeded, ReadableStream, TransformStream, WritableStream } from "../../../ts-client-library/packages/util/src/streams"
import { Upload, bindUploadToAccountSystem, Download, bindDownloadToAccountSystem } from "../../../ts-client-library/packages/opaque"
import { theme, FILE_MAX_SIZE } from "../../config";
import RenameModal from "../../components/RenameModal/RenameModal";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import AddNewFolderModal from "../../components/NewFolderModal/NewFolderModal"
import "./FileManagePage.scss";
import { formatBytes, formatGbs } from "../../helpers"
import * as moment from 'moment';
import { DndProvider, useDrop, DropTargetMonitor } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'
import { FileManagerFileEntryGrid, FileManagerFileEntryList } from "../../components/FileManager/FileManagerFileEntry"
import { posix } from "path-browserify"
import { FileManagerFolderEntryGrid, FileManagerFolderEntryList } from "../../components/FileManager/FileManagerFolderEntry"
import { useDropzone } from "react-dropzone";
import ReactLoading from "react-loading";
import streamsaver from "streamsaver";

streamsaver.mitm = "/resources/streamsaver/mitm.html"
Object.assign(streamsaver, { WritableStream })

const uploadImage = require("../../assets/upload.png");
const empty = require("../../assets/empty.png");

const storageNode = "http://18.191.166.234:3000";

const logo = require("../../assets/logo2.png");
const FileManagePage = ({ history }) => {
  const cryptoMiddleware = new WebAccountMiddleware({ asymmetricKey: b64ToBytes(localStorage.getItem('key')) });
  const netMiddleware = new WebNetworkMiddleware();
  const metadataAccess = new MetadataAccess({
    net: netMiddleware,
    crypto: cryptoMiddleware,
    metadataNode: storageNode,
    maxConcurrency: 3,
  });
  const accountSystem = new AccountSystem({ metadataAccess });
  const account = new Account({ crypto: cryptoMiddleware, net: netMiddleware, storageNode })
  const [updateStatus, setUpdateStatus] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [tableView, setTableView] = React.useState(true);
  const [currentPath, setCurrentPath] = React.useState('/')
  const [fileList, setFileList] = React.useState<FolderFileEntry[]>([])
  const [folderList, setFolderList] = React.useState<FoldersIndexEntry[]>([]);
  const [treeData, setTreeData] = React.useState([]);
  const [pageLoading, setPageLoading] = React.useState(true)
  const [subPaths, setSubPaths] = React.useState([])
  const [accountInfo, setAccountInfo] = React.useState<AccountGetRes>();
  const [showRenameModal, setShowRenameModal] = React.useState(false);
  const [fileToRename, setFileToRename] = React.useState<FolderFileEntry>()
  const [fileToDelete, setFileToDelete] = React.useState<FolderFileEntry>()
  const [folderToRename, setFolderToRename] = React.useState<FoldersIndexEntry>()
  const [folderToDelete, setFolderToDelete] = React.useState<FoldersIndexEntry>()
  const [oldName, setOldName] = React.useState();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = React.useState(false);
  const handleShowSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  React.useEffect(() => {
    getFolderData();
  }, [updateStatus]);
  React.useEffect(() => {
    const levels = currentPath.split("/").slice(1);
    const subpaths = levels.map((l, i) => {
      const parentFolders = levels.filter((_l, idx) => idx < i);
      const parentPaths =
        "/" +
        (parentFolders.length > 0 ? parentFolders.join("/") + "/" : "");

      return { text: l, path: parentPaths + l };
    });
    setSubPaths(subpaths);
    setPageLoading(true)
    accountSystem.addFolder(currentPath).then(async res => {
      let fl = await accountSystem.getFoldersInFolderByPath(currentPath);
      setFolderList(fl);
      setFileList(res.files);
      setPageLoading(false)
    }).catch(err => {
      // toast.error(`folder "${currentPath}" not found`)
    })
  }, [currentPath, updateStatus]);
  const getFolderData = async () => {
    const accountInfo = await account.info();
    setAccountInfo(accountInfo);
    const t = await accountSystem.getFoldersIndex();
    console.log('---folder indexes', t)
    function filesToTreeNodes(arr) {
      var tree = {}
      function addnode(obj) {
        var splitpath = obj.path.replace(/^\/|\/$/g, "").split('/');
        var ptr = tree;
        for (let i = 0; i < splitpath.length; i++) {
          let node: any = {
            label: splitpath[i],
            key: 'level-' + splitpath[i] + '-' + i,
            isDirectory: true,
            path: obj.path,
            location: obj.location
          };
          if (i == splitpath.length - 1) {
            node.isDirectory = false
          }
          ptr[splitpath[i]] = ptr[splitpath[i]] || node;
          ptr[splitpath[i]].nodes = ptr[splitpath[i]].nodes || {};
          ptr = ptr[splitpath[i]].nodes;
        }
      }
      function objectToArr(node) {
        Object.keys(node || {}).map((k) => {
          if (node[k].nodes) {
            objectToArr(node[k])
          }
        })
        if (node.nodes) {
          node.nodes = Object.values(node.nodes)
          node.nodes.forEach(objectToArr)
        }
      }
      arr.map(addnode);
      objectToArr(tree)
      return Object.values(tree)
    }
    let arrayList = filesToTreeNodes(t.folders)
    let temp = []
    if (arrayList.length) {
      let i = arrayList.findIndex(e => e.path === "/");
      temp[0] = arrayList[i];
      temp[0].label = 'My Folders'
      arrayList.splice(i, 1);
      temp[0].nodes = arrayList
    } else {
      temp[0] = {
        label: 'My Folders',
        path: '/',
        nodes: []
      }
    }
    setTreeData(temp);
  }
  const handleLogout = () => {
    localStorage.clear();
    history.push('/');
  }
  const relativePath = path => path.substr(0, path.lastIndexOf("/"));

  const selectFiles = async (files) => {
    return files.map(file =>
      // Current path or subdirectory
      (file.name === (file.path || file.webkitRelativePath || file.name))
        ? uploadFile(file, currentPath)
        : uploadFile(
          file,
          currentPath === "/"
            ? file.webkitRelativePath ? currentPath + relativePath(file.webkitRelativePath) : relativePath(file.path)
            : file.webkitRelativePath ? currentPath + "/" + relativePath(file.webkitRelativePath) : currentPath + relativePath(file.path),

        )
    );
  }
  const uploadFile = async (file, path) => {
    try {
      const upload = new Upload({
        config: {
          crypto: cryptoMiddleware,
          net: netMiddleware,
          storageNode: storageNode,
        },
        meta: file,
        name: file.name,
        path: path,
      })
      let handle = file.size + file.name
      // side effects
      bindUploadToAccountSystem(accountSystem, upload)

      const stream = await upload.start()
      toast(`${file.name} is uploading. Please wait...`, { toastId: handle, autoClose: false, });
      // if there is no error
      if (stream) {
        // TODO: Why does it do this?
        polyfillReadableStreamIfNeeded<Uint8Array>(file.stream()).pipeThrough(stream as TransformStream<Uint8Array, Uint8Array> as any)
      } else {
        toast.update(handle, {
          render: `An error occurred while uploading ${file.name}.`,
          type: toast.TYPE.ERROR,
        })
      }
      await upload.finish()
      toast.update(handle, { render: `${file.name} has finished uploading.` })
      setUpdateStatus(!updateStatus);
      setTimeout(() => {
        toast.dismiss(handle);
      }, 3000);
    } catch (e) {
      toast.update(file.size + file.name, {
        render: `An error occurred while uploading ${file.name}.`,
        type: toast.TYPE.ERROR,
      })

    }

  }
  const addNewFolder = async (folderName) => {
    try {
      setShowNewFolderModal(false);
      const status = await accountSystem.addFolder(currentPath === '/' ? currentPath + folderName : currentPath + '/' + folderName)
      toast(`Folder ${folderName} was successfully created.`);
      setUpdateStatus(!updateStatus);
    } catch (e) {
      toast.error(`An error occurred while creating new folder.`)
    }
  }
  const fileShare = async (file: FolderFileEntry) => {
    try {
    } catch (e) {
      toast.error(`An error occurred while sharing ${file.name}.`)

    }
  }
  const fileDownload = async (file: FileMetadata) => {
    try {
      const d = new Download({
        handle: file.handle,
        config: {
          crypto: cryptoMiddleware,
          net: netMiddleware,
          storageNode,
        }
      })

      // side effects
      bindDownloadToAccountSystem(accountSystem, d)

      const fileStream = polyfillWritableStreamIfNeeded(streamsaver.createWriteStream(file.name, { size: file.size }))
      const s = await d.start()

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
      toast.error(`An error occurred while downloading ${file.name}.`)
    }
  }
  const deleteFile = async (file: FolderFileEntry) => {
    try {
      const status = await accountSystem.removeFile(file.location);
      toast(`${file.name} was successfully deleted.`);
      setUpdateStatus(!updateStatus);
      setFileToDelete(null)
    } catch (e) {
      setFileToDelete(null)
      toast.error(`An error occurred while deleting ${file.name}.`)
    }
  }
  const deleteFolder = async (folder: FoldersIndexEntry) => {
    const name = posix.basename(folder.path)
    try {
      const status = await accountSystem.removeFolderByPath(folder.path);
      toast(`Folder ${folder.path} was successfully deleted.`);
      setUpdateStatus(!updateStatus);
      setFolderToDelete(null);
    } catch (e) {
      console.log(e)
      setFolderToDelete(null);
      toast.error(`An error occurred while deleting Folder ${folder.path}.`)
    }
  }
  const handleOpenRenameModal = (item, isFile) => {
    setOldName(item.name)
    if (isFile) setFileToRename(item)
    else setFolderToRename(item)
    setShowRenameModal(true)
  }
  const handleChangeRename = async (rename) => {
    try {
      setShowRenameModal(false);
      setOldName(null);
      if (fileToRename) {
        const status = await accountSystem.renameFile((fileToRename.location), rename);
        toast(`${fileToRename.name} was renamed successfully.`);
      }
      if (folderToRename) {
        const status = await accountSystem.renameFolder((folderToRename.path), rename);
        toast(`${folderToRename.path} was renamed successfully.`);
      }
      setUpdateStatus(!updateStatus)
    } catch (e) {
      console.log(e)
      toast.error(`An error occurred while rename ${rename}.`)
    } finally {
      setFolderToRename(null);
      setFileToRename(null);
    }
  }
  const handleDeleteItem = (item: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => {
    if (isFile) setFileToDelete(item as FolderFileEntry)
    else setFolderToDelete(item as FoldersIndexEntry)
    setShowDeleteModal(true)
  }
  const handleDelete = async () => {
    if (folderToDelete) deleteFolder(folderToDelete)
    else deleteFile(fileToDelete)
    setShowDeleteModal(false)
  }
  const onDrop = React.useCallback(files => {
    selectFiles(files)
  }, [currentPath]);
  const { isDragActive, getRootProps } = useDropzone({
    onDrop,
    minSize: 0,
    maxSize: FILE_MAX_SIZE,
    multiple: true
  });
  const handleSelectFolder = (folder) => {
    if (folder.path !== currentPath)
      setCurrentPath(folder.path)
  }
  return (
    <div className='page'>
      {
        pageLoading && <div className='loading'>
          <ReactLoading type="spinningBubbles" color="#2e6dde" />
        </div>
      }

      <div className='mobile-header'>
        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbar-menu'
          aria-expanded={showSidebar}
          onClick={handleShowSidebar}
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <h1 className='navbar-brand'>
          <a href='/'>
            <img src={logo} width='60' height='60' alt='Opacity' className='navbar-brand-image' />
          </a>
          Opacity <span>v2.0.0</span>
        </h1>
      </div>
      <aside
        className={
          showSidebar
            ? "navbar navbar-vertical navbar-expand-lg navbar-transparent show"
            : "navbar navbar-vertical navbar-expand-lg navbar-transparent "
        }
      >
        <div className='container-fluid'>
          <h1 className='navbar-brand navbar-brand-autodark'>
            <a href='/'>
              <img src={logo} width='60' height='60' alt='Opacity' className='navbar-brand-image' />
            </a>
            Opacity <span>v2.0.0</span>
          </h1>
          <div className='collapse navbar-collapse' id='navbar-menu'>
            <ul className='navbar-nav'>
              <li className='nav-item'>
                <span className='nav-icon nav-icon-pro'>P</span>
                <Nav.Link>UPGRADE TO PRO</Nav.Link>
              </li>
              <UploadForm isDirectory={true} onSelected={selectFiles}>
                <li className='nav-item'>
                  <span className='nav-icon nav-icon-folder'></span>
                  <Nav.Link>UPLOAD FOLDER</Nav.Link>
                </li>
              </UploadForm>
              <UploadForm isDirectory={false} onSelected={selectFiles}>
                <li className='nav-item'>
                  <span className='nav-icon nav-icon-upload'></span>
                  <Nav.Link>UPLOAD FILE</Nav.Link>
                </li>
              </UploadForm>
              <li className='nav-item' onClick={handleLogout}>
                <span className='nav-icon nav-icon-logout'></span>
                <Nav.Link>LOGOUT</Nav.Link>
              </li>
            </ul>
            <div className='folder-tree'>
              <h3>Folders</h3>
              <TreeMenu data={treeData} hasSearch={false}>
                {({ search, items }) => (
                  <ul className='tree-menu'>
                    {items.map(({ key, ...props }) => (
                      <div key={key} className={props.isOpen ? "opened" : ""} onClick={() => handleSelectFolder(props)}>
                        <ItemComponent key={key} {...props} />
                      </div>
                    ))}
                  </ul>
                )}
              </TreeMenu>
            </div>
            <div className='account-info'>
              <div className='storage-info'>
                <span>{formatGbs(accountInfo ? accountInfo.account.storageUsed : 0)} </span> of {formatGbs(accountInfo ? accountInfo.account.storageLimit : 0)} used
              </div>
              <ProgressBar now={60} />
              <div className='upgrade text-right'>UPGRADE NOW</div>
              <div className='renew'>
                <p>Your account expires within 30 days</p>
                <div className='d-flex'>
                  <div className='account-icon'></div>
                  <span className='ml-3'>Renew account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className='file-content' {...getRootProps()}>
        {isDragActive && <div className='dnd-overlay'>
          <div className='content-wrapper'>
            <div className='overlay-content'>
              <img src={uploadImage} />
              <span>Drag your file to upload to Opacity</span>
            </div>
          </div>
        </div>}
        <div className='file-header'>
          <UploadForm isDirectory={false} onSelected={selectFiles}>
            <div className='d-flex header-item'>
              <span className='item-icon file-upload'></span>
              <span>FILE UPLOAD</span>
            </div>
          </UploadForm>
          <div className=' d-flex header-item ml-3' onClick={() => setShowNewFolderModal(true)}>
            <span className='item-icon new-folder'></span>
            <span>NEW FOLDER</span>
          </div>
          {tableView && (
            <div className=' d-flex header-item ml-3'>
              <span
                className='item-icon grid-view'
                onClick={() => {
                  setTableView(false);
                }}
              ></span>
            </div>
          )}
          {!tableView && (
            <div className=' d-flex header-item ml-3'>
              <span
                className='item-icon table-view'
                onClick={() => {
                  setTableView(true);
                }}
              ></span>
            </div>
          )}
        </div>
        <div className='container-xl'>
          <div className='breadcrumb-content'>
            <Breadcrumb>
              <Breadcrumb.Item href='#' onClick={() => currentPath !== '/' && setCurrentPath('/')}>
                <span className='home-icon'></span>
              </Breadcrumb.Item>
              {currentPath !== '/' && subPaths.map(
                ({ text, path }, i) =>
                  i === subPaths.length - 1 ? (
                    <Breadcrumb.Item active key={i}>{text}</Breadcrumb.Item>
                  ) : (
                    <Breadcrumb.Item key={i} onClick={() => setCurrentPath(path)}>{text}</Breadcrumb.Item>
                  )
              )}
            </Breadcrumb>
          </div>
          {(fileList.length === 0 && folderList.length === 0) &&
            <div className='empty-list'>
              <img src={empty} />
              <h4>This folder is empty</h4>
              <span>Upload files or folder by clicking the upload button, or drag & drop from your device.</span>
            </div>
          }
          {
            (fileList.length > 0 || folderList.length > 0) &&
            <div>
              {!tableView && (
                <div className='grid-view'>
                  {folderList.map((item, i) => item && (
                    <FileManagerFolderEntryGrid
                      key={i}
                      accountSystem={accountSystem}
                      folderEntry={item}
                      handleDeleteItem={handleDeleteItem}
                      handleOpenRenameModal={handleOpenRenameModal}
                      setCurrentPath={setCurrentPath}
                    />
                  ))}
                  {fileList.map((item, i) => item && (
                    <FileManagerFileEntryGrid
                      key={i}
                      accountSystem={accountSystem}
                      fileEntry={item}
                      fileShare={fileShare}
                      handleDeleteItem={handleDeleteItem}
                      handleOpenRenameModal={handleOpenRenameModal}
                      downloadItem={fileDownload}
                    />
                  ))}
                </div>
              )}
              {tableView && (
                <Table highlightRowOnHover hasOutline verticalAlign='center' className='text-nowrap'>
                  <Table.Header>
                    <tr>
                      <th style={{ width: "50%" }}>Name</th>
                      <th>Created</th>
                      <th>Size</th>
                      <th></th>
                    </tr>
                  </Table.Header>
                  <Table.Body>
                    {folderList.map((item, i) => item && (
                      <FileManagerFolderEntryList
                        key={i}
                        accountSystem={accountSystem}
                        folderEntry={item}
                        handleDeleteItem={handleDeleteItem}
                        handleOpenRenameModal={handleOpenRenameModal}
                        setCurrentPath={setCurrentPath}
                      />
                    ))}
                    {fileList.map((item, i) => item && (
                      <FileManagerFileEntryList
                        key={i}
                        accountSystem={accountSystem}
                        fileEntry={item}
                        fileShare={fileShare}
                        handleDeleteItem={handleDeleteItem}
                        handleOpenRenameModal={handleOpenRenameModal}
                        downloadItem={fileDownload}
                      />
                    ))}
                  </Table.Body>
                </Table>
              )}
            </div>
          }
        </div>
      </div>

      { oldName && <RenameModal show={showRenameModal} handleClose={() => setShowRenameModal(false)} oldName={oldName} setNewName={handleChangeRename} />}
      <DeleteModal show={showDeleteModal} handleClose={() => setShowDeleteModal(false)} setDelete={handleDelete} />
      <AddNewFolderModal show={showNewFolderModal} handleClose={() => setShowNewFolderModal(false)} addNewFolder={addNewFolder} />
      <ToastContainer
        pauseOnHover={false}
        draggable={true}
        progressClassName="toast-progress-bar"
        bodyClassName="toast-body"
        position="bottom-right"
        hideProgressBar
      />
    </div >
  );
};

const UploadForm = ({ children, onSelected, isDirectory }) => {
  const uploadFileInput = React.useRef<HTMLInputElement>(null);
  const uploadForm = React.useRef<HTMLFormElement>(null);

  const directory = {
    directory: "",
    webkitdirectory: "",
    mozkitdirectory: ""
  };

  const selectFiles = () => {
    let files = Array.from(uploadFileInput.current!.files || []);
    const filesLength = files.length;
    uploadForm.current!.reset();
    if (files.length > 0) {
      files = files.filter(file => file.size <= FILE_MAX_SIZE);
      files.length !== filesLength && alert("Some files are greater then 2GB.");
      onSelected(files);
    }
  };

  return (
    <div onClick={() => uploadFileInput.current!.click()}>
      {children}
      <form ref={uploadForm} style={{ display: "none" }}>
        <input
          type="file"
          id="file"
          ref={uploadFileInput}
          onChange={e => selectFiles()}
          multiple={true}
          {...isDirectory && { ...directory }}
        />
      </form>
    </div>

  );
}

const FileManagePageWrapper = ({ history }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <FileManagePage history={history} />
    </DndProvider>
  )

}
export default FileManagePageWrapper;
