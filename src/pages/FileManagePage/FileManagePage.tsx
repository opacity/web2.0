import * as React from "react";
import { Table } from "tabler-react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  Row,
  Col,
  Container,
  Media,
  Button,
  Nav,
  ProgressBar,
  Breadcrumb,
  DropdownButton,
  Dropdown,
  Alert,
} from "react-bootstrap";
import TreeMenu, { TreeMenuProps, ItemComponent } from "react-simple-tree-menu";
import {
  Account,
  AccountGetRes,
  AccountCreationInvoice,
} from "../../../ts-client-library/packages/account-management";
import {
  AccountSystem,
  MetadataAccess,
  FileMetadata,
  FolderMetadata,
  FolderFileEntry,
  FoldersIndexEntry,
} from "../../../ts-client-library/packages/account-system";
import {
  WebAccountMiddleware,
  WebNetworkMiddleware,
} from "../../../ts-client-library/packages/middleware-web";
import { hexToBytes } from "../../../ts-client-library/packages/util/src/hex";
import {
  polyfillReadableStreamIfNeeded,
  polyfillWritableStreamIfNeeded,
  ReadableStream,
  TransformStream,
  WritableStream,
} from "../../../ts-client-library/packages/util/src/streams";
import {
  OpaqueUpload,
  OpaqueDownload,
} from "../../../ts-client-library/packages/opaque";
import {
  bindDownloadToAccountSystem,
  bindUploadToAccountSystem,
} from "../../../ts-client-library/packages/filesystem-access/src/account-system-binding";
import {
  UploadEvents,
  UploadProgressEvent,
} from "../../../ts-client-library/packages/filesystem-access/src/events";
import { theme, FILE_MAX_SIZE } from "../../config";
import RenameModal from "../../components/RenameModal/RenameModal";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import WarningModal from "../../components/WarningModal/WarningModal";
import AddNewFolderModal from "../../components/NewFolderModal/NewFolderModal";
import "./FileManagePage.scss";
import { formatBytes, formatGbs } from "../../helpers";
import * as moment from "moment";
import { DndProvider, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import {
  FileManagerFileEntryGrid,
  FileManagerFileEntryList,
} from "../../components/FileManager/FileManagerFileEntry";
import { posix } from "path-browserify";
import {
  FileManagerFolderEntryGrid,
  FileManagerFolderEntryList,
} from "../../components/FileManager/FileManagerFolderEntry";
import FileShareModal from "../../components/FileManager/FileShareModal";
import { useDropzone } from "react-dropzone";
import ReactLoading from "react-loading";
import streamsaver from "streamsaver";
import { Mutex } from "async-mutex";
import { useMediaQuery } from "react-responsive";
import UploadingNotification from "../../components/UploadingNotification/UploadingNotification";

streamsaver.mitm = "/resources/streamsaver/mitm.html";
Object.assign(streamsaver, { WritableStream });

const uploadImage = require("../../assets/upload.png");
const empty = require("../../assets/empty.png");

import { STORAGE_NODE as storageNode, STORAGE_NODE_V1 } from "../../config";
import { bytesToB64URL } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/b64";
import { isPathChild } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/path";
import { arraysEqual } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/arrayEquality";
import { FileManagementStatus } from "../../context";
import { isInteger } from "formik";
import { bytesToHex } from "../../../ts-client-library/packages/util/src/hex";
import * as fflate from "fflate";
import { saveAs } from "file-saver";

const logo = require("../../assets/logo2.png");

const FileManagePage = ({ history }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const fileManaging = React.useContext(FileManagementStatus);
  const cryptoMiddleware = React.useMemo(
    () =>
      new WebAccountMiddleware({
        asymmetricKey: hexToBytes(localStorage.getItem("key")),
      }),
    []
  );
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
  const accountSystem = React.useMemo(
    () => new AccountSystem({ metadataAccess }),
    [metadataAccess]
  );
  const account = React.useMemo(
    () =>
      new Account({
        crypto: cryptoMiddleware,
        net: netMiddleware,
        storageNode,
      }),
    [cryptoMiddleware, netMiddleware, storageNode]
  );
  const [updateCurrentFolderSwitch, setUpdateCurrentFolderSwitch] =
    React.useState(false);
  const [updateFolderEntrySwitch, setUpdateFolderEntrySwitch] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [updateFileEntrySwitch, setUpdateFileEntrySwitch] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [tableView, setTableView] = React.useState(true);
  const [currentPath, setCurrentPath] = React.useState("/");
  const currentPathRef = React.useRef("/");
  const [folderList, setFolderList] = React.useState<FoldersIndexEntry[]>([]);
  const [folderMetaList, setFolderMetaList] = React.useState([]);
  const folderListRef = React.useRef<FoldersIndexEntry[]>([]);
  const [fileList, setFileList] = React.useState<FolderFileEntry[]>([]);
  const [fileMetaList, setFileMetaList] = React.useState([]);
  const fileListRef = React.useRef<FolderFileEntry[]>([]);
  const [treeData, setTreeData] = React.useState([]);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [subPaths, setSubPaths] = React.useState([]);
  const [accountInfo, setAccountInfo] = React.useState<AccountGetRes>();
  const [showRenameModal, setShowRenameModal] = React.useState(false);
  const [fileToRename, setFileToRename] = React.useState<FolderFileEntry>();
  const [fileToDelete, setFileToDelete] = React.useState<FolderFileEntry>();
  const [folderToRename, setFolderToRename] =
    React.useState<FoldersIndexEntry>();
  const [folderToDelete, setFolderToDelete] =
    React.useState<FoldersIndexEntry>();
  const [oldName, setOldName] = React.useState();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showWarningModal, setShowWarningModal] = React.useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = React.useState(false);
  const [uploadingList, setUploadingList] = React.useState([]);
  const currentUploadingList = React.useRef([]);
  const [selectedFiles, setSelectedFiles] = React.useState<FileMetadata[]>([]);
  const [alertText, setAlertText] = React.useState("30 days remaining.");
  const [alertShow, setAlertShow] = React.useState(false);
  const [openShareModal, setOpenShareModal] = React.useState(false);
  const [shareMode, setShareMode] =
    React.useState<"private" | "public">("private");
  const [shareFile, setShareFile] = React.useState<FileMetadata>(null);
  const [storageWarning, setIsStorageWarning] = React.useState(false);
  const [sortable, setSortable] = React.useState({
    column: "null",
    method: "down",
  });
  const [filesForZip, setFilesForZip] = React.useState([]);

  const handleShowSidebar = React.useCallback(() => {
    setShowSidebar(!showSidebar);
  }, [showSidebar]);

  const isFileManaging = () => {
    fileManaging.setFileStatus(true);
  };

  const OnfinishFileManaging = () => {
    fileManaging.setFileStatus(false);
  };

  React.useEffect(() => {
    getFolderData();
  }, [updateCurrentFolderSwitch]);

  React.useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  React.useEffect(() => {
    currentUploadingList.current = uploadingList;
  }, [uploadingList]);

  React.useEffect(() => {
    folderListRef.current = folderList;
  }, [folderList]);

  React.useEffect(() => {
    fileListRef.current = fileList;
  }, [fileList]);

  React.useEffect(() => {
    const levels = currentPath.split("/").slice(1);
    const subpaths = levels.map((l, i) => {
      const parentFolders = levels.filter((_l, idx) => idx < i);
      const parentPaths =
        "/" + (parentFolders.length > 0 ? parentFolders.join("/") + "/" : "");

      return { text: l, path: parentPaths + l };
    });
    setSubPaths(subpaths);
    setPageLoading(true);

    Promise.all([
      accountSystem.getFoldersInFolderByPath(currentPath),
      currentPath == "/"
        ? accountSystem.addFolder(currentPath)
        : accountSystem.getFolderMetadataByPath(currentPath),
    ])
      .then(([folders, folderMeta]) => {
        setFolderList(folders);
        setFileList(folderMeta.files);
        console.log(folderMeta.files);
        setPageLoading(false);
      })
      .catch((err) => {
        console.error(err);

        toast.error(`folder "${currentPath}" not found`);
      });
  }, [currentPath, updateCurrentFolderSwitch]);

  React.useEffect(() => {
    if (window.performance) {
      if (performance.navigation.type == 1) {
        // localStorage.clear();
      } else {
      }
    }
  }, []);

  React.useEffect(() => {
    if (
      filesForZip.length !== 0 &&
      filesForZip.length === selectedFiles.length
    ) {
      let zipableFiles = {};
      filesForZip.forEach((item) => {
        zipableFiles = Object.assign(zipableFiles, { [item.name]: item.data });
      });
      const zipped = fflate.zipSync(zipableFiles, {
        level: 0,
      });

      const blob = new Blob([zipped]);
      saveAs(blob, `opacity_files.zip`);
      setPageLoading(false);
    }
  }, [filesForZip]);

  const getFolderData = React.useCallback(async () => {
    try {
      const accountInfo = await account.info();
      setAccountInfo(accountInfo);

      const usedStorage = accountInfo.account.storageUsed;
      const limitStorage = accountInfo.account.storageLimit;
      const remainDays = moment(accountInfo.account.expirationDate).diff(
        moment(Date.now()),
        "days"
      );

      if ((limitStorage / 10) * 9 < usedStorage) {
        setAlertShow(true);
        setIsStorageWarning(true);
        setAlertText(
          `You have used ${usedStorage}% of your plan. Upgrade now to get more space.`
        );
      }
      if (remainDays < 30) {
        setAlertShow(true);
        setAlertText(`${remainDays} days remaining.`);
      }
    } catch (e) {
      localStorage.clear();
      history.push("/");
    }

    const t = await accountSystem.getFoldersIndex();
    console.log("---folder indexes", t);
    function filesToTreeNodes(arr) {
      var tree = {};
      function addnode(obj) {
        var splitpath = obj.path.replace(/^\/|\/$/g, "").split("/");
        var ptr = tree;
        for (let i = 0; i < splitpath.length; i++) {
          let node: any = {
            label: splitpath[i],
            key: "level-" + splitpath[i] + "-" + i,
            isDirectory: true,
            path: obj.path,
            location: obj.location,
          };
          if (i == splitpath.length - 1) {
            node.isDirectory = false;
          }
          ptr[splitpath[i]] = ptr[splitpath[i]] || node;
          ptr[splitpath[i]].nodes = ptr[splitpath[i]].nodes || {};
          ptr = ptr[splitpath[i]].nodes;
        }
      }
      function objectToArr(node) {
        Object.keys(node || {}).map((k) => {
          if (node[k].nodes) {
            objectToArr(node[k]);
          }
        });
        if (node.nodes) {
          node.nodes = Object.values(node.nodes);
          node.nodes.forEach(objectToArr);
        }
      }
      arr.map(addnode);
      objectToArr(tree);
      return Object.values(tree);
    }
    let arrayList = filesToTreeNodes(t.folders);
    let temp = [];
    if (arrayList.length) {
      let i = arrayList.findIndex((e) => e.path === "/");
      temp[0] = arrayList[i];
      temp[0].label = "My Folders";
      arrayList.splice(i, 1);
      temp[0].nodes = arrayList;
    } else {
      temp[0] = {
        label: "My Folders",
        path: "/",
        nodes: [],
      };
    }
    setTreeData(temp);
  }, [account, accountSystem]);

  const handleLogout = React.useCallback(() => {
    localStorage.clear();
    history.push("/");
  }, []);

  const relativePath = React.useCallback(
    (path: string) => path.substr(0, path.lastIndexOf("/")),
    []
  );

  const fileUploadMutex = React.useMemo(() => new Mutex(), []);
  const uploadFile = React.useCallback(
    async (file: File, path: string) => {
      try {
        const upload = new OpaqueUpload({
          config: {
            crypto: cryptoMiddleware,
            net: netMiddleware,
            storageNode: storageNode,
          },
          meta: file,
          name: file.name,
          path: path,
        });
        let toastID = file.size + file.name;
        // side effects
        bindUploadToAccountSystem(accountSystem, upload);

        upload.addEventListener(UploadEvents.START, async () => {
          console.log(currentPathRef.current, path);

          if (isPathChild(currentPathRef.current, path)) {
            // setPageLoading(true)
            // setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch)
          }

          if (path == currentPathRef.current) {
            setPageLoading(true);
            const folderMeta = await accountSystem.getFolderMetadataByPath(
              currentPathRef.current
            );
            setFileList(folderMeta.files);
            setPageLoading(false);
          }
        });
        upload.addEventListener(
          UploadEvents.PROGRESS,
          (e: UploadProgressEvent) => {
            let templist = currentUploadingList.current.slice();
            let index = templist.findIndex((ele) => ele.id === toastID);
            if (index > -1) {
              templist[index].percent = e.detail.progress * 100;
              setUploadingList(templist);
            }
          }
        );

        const fileStream = polyfillReadableStreamIfNeeded<Uint8Array>(
          file.stream()
        );

        const release = await fileUploadMutex.acquire();
        try {
          const stream = await upload.start();
          console.log("uploading,,,,,,");
          isFileManaging();

          // let templist = currentUploadingList.current.slice();
          // templist.push({ id: toastID, fileName: file.name, percent: 0 });
          // setUploadingList(templist);
          // toast(`${file.name} is uploading. Please wait...`, { toastId: toastID, autoClose: false, });
          // if there is no error
          if (stream) {
            // TODO: Why does it do this?
            fileStream.pipeThrough(
              stream as TransformStream<Uint8Array, Uint8Array> as any
            );
          } else {
            // toast.update(toastID, {
            //   render: `An error occurred while uploading ${file.name}.`,
            //   type: toast.TYPE.ERROR,
            // })
          }
          await upload.finish();
          OnfinishFileManaging();

          let templistdone = currentUploadingList.current.slice();
          let index = templistdone.findIndex((ele) => ele.id === toastID);
          if (index > -1) {
            templistdone[index].percent = 100;
            setUploadingList(templistdone);
          }
          // toast.update(toastID, { render: `${file.name} has finished uploading.` })
          // setUpdateStatus(!updateStatus);
          // setTimeout(() => {
          //   toast.dismiss(toastID);
          // }, 3000);
          // setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
        } finally {
          release();
        }
      } catch (e) {
        console.error(e);
        OnfinishFileManaging();
        // toast.update(file.size + file.name, {
        //   render: `An error occurred while uploading ${file.name}.`,
        //   type: toast.TYPE.ERROR,
        // })
      }
    },
    [
      accountSystem,
      cryptoMiddleware,
      netMiddleware,
      storageNode,
      updateCurrentFolderSwitch,
      updateFolderEntrySwitch,
      updateFileEntrySwitch,
    ]
  );

  const selectFiles = React.useCallback(
    async (files) => {
      let templist = currentUploadingList.current.slice();

      files.map((file) => {
        let toastID = file.size + file.name;
        templist.push({ id: toastID, fileName: file.name, percent: 0 });
        file.name === (file.path || file.webkitRelativePath || file.name)
          ? uploadFile(file, currentPath)
          : uploadFile(
              file,
              currentPath === "/"
                ? file.webkitRelativePath
                  ? currentPath + relativePath(file.webkitRelativePath)
                  : relativePath(file.path)
                : file.webkitRelativePath
                ? currentPath + "/" + relativePath(file.webkitRelativePath)
                : currentPath + relativePath(file.path)
            );
      });
      setUploadingList(templist);
    },
    [currentPath, uploadFile]
  );

  const addNewFolder = React.useCallback(
    async (folderName) => {
      try {
        setShowNewFolderModal(false);
        const status = await accountSystem.addFolder(
          currentPath === "/"
            ? currentPath + folderName
            : currentPath + "/" + folderName
        );
        toast(`Folder ${folderName} was successfully created.`);
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
      } catch (e) {
        toast.error(`An error occurred while creating new folder.`);
      }
    },
    [accountSystem, currentPath, updateCurrentFolderSwitch]
  );

  const fileShare = async (file: FileMetadata) => {
    try {
      setShareMode("private");
      setShareFile(file);
      setOpenShareModal(true);
    } catch (e) {
      toast.error(`An error occurred while sharing ${file.name}.`);
    }
  };

  const filePublicShare = async (file: FileMetadata) => {
    try {
      setShareMode("public");
      setShareFile(file);
      setOpenShareModal(true);
    } catch (e) {
      toast.error(`An error occurred while sharing ${file.name}.`);
    }
  };

  const fileDownload = React.useCallback(
    async (file: FileMetadata, isMultiple) => {
      if (file.private.handle) {
        try {
          const d = new OpaqueDownload({
            handle: file.private.handle,
            config: {
              crypto: cryptoMiddleware,
              net: netMiddleware,
              storageNodeV1: STORAGE_NODE_V1,
              storageNode,
            },
            name: file.name,
            fileMeta: file,
          });

          // side effects
          bindDownloadToAccountSystem(accountSystem, d);

          const fileStream = polyfillWritableStreamIfNeeded<Uint8Array>(
            streamsaver.createWriteStream(file.name, { size: file.size })
          );
          const s = await d.start();
          isFileManaging();

          d.finish().then(() => {
            console.log("finish");
            OnfinishFileManaging();
          });

          // more optimized
          if ("WritableStream" in window && s.pipeTo && !isMultiple) {
            console.log("pipe");
            s.pipeTo(fileStream as WritableStream<Uint8Array>)
              .then(() => {
                setPageLoading(false);
                console.log("done");
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
          } else if (isMultiple && s.getReader) {
            let blobArray = new Uint8Array([]);

            const reader = s.getReader();
            const pump = () =>
              reader.read().then(({ done, value }) => {
                if (done) {
                  setFilesForZip((prev) => [
                    ...prev,
                    {
                      name: file.name,
                      type: file.type,
                      data: blobArray,
                    },
                  ]);
                } else {
                  blobArray = new Uint8Array([...blobArray, ...value]);
                  pump();
                }
              });
            pump();
          }
        } catch (e) {
          console.error(e);
          OnfinishFileManaging();
          toast.error(`An error occurred while downloading ${file.name}.`);
        }
      } else {
        console.error("Public download is not yet available");
        toast.error("Public download is not yet available");
      }
    },
    [cryptoMiddleware, netMiddleware, storageNode]
  );

  const deleteFile = React.useCallback(
    async (file: FolderFileEntry) => {
      try {
        const status = await accountSystem.removeFile(file.location);
        // toast(`${file.name} was successfully deleted.`);
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
        setFileToDelete(null);
      } catch (e) {
        setFileToDelete(null);
        toast.error(`An error occurred while deleting ${file.name}.`);
      }
    },
    [accountSystem, updateCurrentFolderSwitch]
  );

  const deleteFolder = React.useCallback(
    async (folder: FoldersIndexEntry) => {
      const name = posix.basename(folder.path);
      try {
        const status = await accountSystem.removeFolderByPath(folder.path);
        // toast(`Folder ${folder.path} was successfully deleted.`);
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
        setFolderToDelete(null);
      } catch (e) {
        console.error(e);
        setFolderToDelete(null);
        toast.error(`An error occurred while deleting Folder ${folder.path}.`);
      }
    },
    [accountSystem, updateCurrentFolderSwitch]
  );

  const handleOpenRenameModal = React.useCallback((item, isFile) => {
    setOldName(item.name);
    if (isFile) setFileToRename(item);
    else setFolderToRename(item);
    setShowRenameModal(true);
  }, []);

  const handleChangeRename = React.useCallback(
    async (rename) => {
      try {
        setShowRenameModal(false);
        setOldName(null);
        if (fileToRename) {
          const status = await accountSystem.renameFile(
            fileToRename.location,
            rename
          );
          toast(`${fileToRename.name} was renamed successfully.`);
        }
        if (folderToRename) {
          const status = await accountSystem.renameFolder(
            folderToRename.path,
            rename
          );
          toast(`${folderToRename.path} was renamed successfully.`);
        }
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
      } catch (e) {
        console.error(e);
        toast.error(`An error occurred while rename ${rename}.`);
      } finally {
        setFolderToRename(null);
        setFileToRename(null);
      }
    },
    [accountSystem, fileToRename, folderToRename, updateCurrentFolderSwitch]
  );

  const handleDeleteItem = React.useCallback(
    (item: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => {
      if (isFile) setFileToDelete(item as FolderFileEntry);
      else setFolderToDelete(item as FoldersIndexEntry);
      setShowDeleteModal(true);
    },
    []
  );

  const handleDelete = async () => {
    setPageLoading(true);
    if (selectedFiles.length === 0) {
      if (folderToDelete) deleteFolder(folderToDelete);
      else deleteFile(fileToDelete);
    } else {
      selectedFiles.forEach((file) => {
        deleteFile(file);
      });
      setSelectedFiles([]);
    }
    setShowDeleteModal(false);
  };

  const onDrop = React.useCallback(
    (files) => {
      selectFiles(files);
    },
    [currentPath]
  );

  const maxFileValidator = (file) => {
    if (file.size > FILE_MAX_SIZE) {
      setShowWarningModal(true);

      return {
        code: "size-too-large",
        message: `Some files are greater then 2GB!`,
      };
    }
  };

  const { isDragActive, fileRejections, getRootProps } = useDropzone({
    onDrop,
    minSize: 0,
    maxSize: FILE_MAX_SIZE,
    multiple: true,
    validator: maxFileValidator,
  });

  const handleSelectFolder = React.useCallback(
    (folder) => {
      if (folder.path !== currentPath) setCurrentPath(folder.path);
    },
    [currentPath]
  );
  const handleSelectFile = (file) => {
    let temp = selectedFiles.slice();
    let i = selectedFiles.findIndex((item) =>
      arraysEqual(item.location, file.location)
    );
    if (i !== -1) {
      temp.splice(i, 1);
    } else {
      temp = [...selectedFiles, file];
    }
    setSelectedFiles(temp);
  };
  const getSelectedFileSize = () => {
    let size = 0;
    selectedFiles.map((item) => (size = size + item.size));
    return formatBytes(size);
  };
  const handleMultiDownload = () => {
    setFilesForZip([]);
    setPageLoading(true);
    selectedFiles.forEach((file) => {
      fileDownload(file, selectedFiles.length > 1 ? true : false);
    });
  };
  const handleMultiDelete = () => {
    setShowDeleteModal(true);
  };

  const compareName = (a, b, mode, type) => {
    var nameA = type === "file" ? a.name.toUpperCase() : a.path.toUpperCase();
    var nameB = type === "file" ? b.name.toUpperCase() : b.path.toUpperCase();
    if (nameA < nameB) {
      return mode === "down" ? 1 : -1;
    }
    if (nameA > nameB) {
      return mode === "down" ? -1 : 1;
    }
    return 0;
  };

  const compareType = (a, b, mode, type) => {
    var nameA =
      type === "file"
        ? a.public.location
          ? "PUBLIC"
          : "PRIVATE"
        : a.path.toUpperCase();
    var nameB =
      type === "file"
        ? b.public.location
          ? "PUBLIC"
          : "PRIVATE"
        : b.path.toUpperCase();
    if (nameA < nameB) {
      return mode === "down" ? 1 : -1;
    }
    if (nameA > nameB) {
      return mode === "down" ? -1 : 1;
    }
    return 0;
  };

  const compareDate = (a, b, mode, type) => {
    const sourceList = type === "file" ? fileMetaList : folderMetaList;
    const Ameta = sourceList.find(
      (meta) => bytesToHex(meta.location) === bytesToHex(a.location)
    );
    const Bmeta = sourceList.find(
      (meta) => bytesToHex(meta.location) === bytesToHex(b.location)
    );

    if (moment(Ameta.modified).isBefore(moment(Bmeta.modified))) {
      return mode === "down" ? 1 : -1;
    }
    if (moment(Ameta.modified).isAfter(moment(Bmeta.modified))) {
      return mode === "down" ? -1 : 1;
    }
    return 0;
  };

  const compareSize = (a, b, mode, type) => {
    const sourceList = type === "file" ? fileMetaList : folderMetaList;
    const Ameta = sourceList.find(
      (meta) => bytesToHex(meta.location) === bytesToHex(a.location)
    );
    const Bmeta = sourceList.find(
      (meta) => bytesToHex(meta.location) === bytesToHex(b.location)
    );

    if (Ameta.size < Bmeta.size) {
      return mode === "down" ? 1 : -1;
    }
    if (Ameta.size > Bmeta.size) {
      return mode === "down" ? -1 : 1;
    }
    return 0;
  };

  const handleSortTable = async (mode, method) => {
    setSortable({ column: mode, method });

    switch (mode) {
      case "name":
        fileList.sort((a, b) => compareName(a, b, method, "file"));
        folderList.sort((a, b) => compareName(a, b, method, "folder"));
        break;
      case "type":
        fileList.sort((a, b) => compareType(a, b, method, "file"));
        // folderList.sort((a, b) => compareName(a, b, method, 'folder'))
        break;
      case "created":
        fileList.sort((a, b) => compareDate(a, b, method, "file"));
        folderList.sort((a, b) => compareName(a, b, method, "folder"));
        break;
      case "size":
        fileList.sort((a, b) => compareSize(a, b, method, "file"));
        folderList.sort((a, b) => compareSize(a, b, method, "folder"));
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    const init = async () => {
      const metaList = fileList.map(async (file) => {
        return await accountSystem._getFileMetadata(file.location).then((f) => {
          return f;
        });
      });
      const tmp = await Promise.all(metaList);
      setFileMetaList(tmp);
    };
    init();
  }, [fileList]);

  React.useEffect(() => {
    const init = async () => {
      const metaList = folderList.map(async (folder) => {
        return await accountSystem
          ._getFolderMetadataByLocation(folder.location)
          .then((f) => {
            return f;
          });
      });
      const tmp = await Promise.all(metaList);
      setFolderMetaList(tmp);
    };
    init();
  }, [folderList]);

  return (
    <div className="page">
      <Alert
        variant="danger"
        show={alertShow}
        onClose={() => setAlertShow(false)}
        className="limit-alert"
        dismissible
      >
        {alertText}
        <Alert.Link onClick={() => history.push("/plans")}>
          Please renew the account.
        </Alert.Link>
      </Alert>

      {openShareModal && (
        <FileShareModal
          open={openShareModal}
          onClose={() => {
            setOpenShareModal(false);
            setShareFile(null);
          }}
          file={shareFile}
          accountSystem={accountSystem}
          mode={shareMode}
          cryptoMiddleware={cryptoMiddleware}
          netMiddleware={netMiddleware}
          storageNode={storageNode}
        />
      )}

      {pageLoading && (
        <div className="loading">
          <ReactLoading type="spinningBubbles" color="#2e6dde" />
        </div>
      )}

      <div className="mobile-header">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar-menu"
          aria-expanded={showSidebar}
          onClick={handleShowSidebar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <h1 className="navbar-brand " onClick={() => history.push("/")}>
          <Link to="/">
            <img
              src={logo}
              width="60"
              height="60"
              alt="Opacity"
              className="navbar-brand-image"
            />
          </Link>
          Opacity <span>v2.0.0</span>
        </h1>
      </div>
      <aside
        className={
          showSidebar
            ? "navbar navbar-vertical navbar-expand-lg navbar-transparent custom-sidebar show"
            : "navbar navbar-vertical navbar-expand-lg navbar-transparent custom-sidebar"
        }
      >
        <div
          className="container-fluid collapse navbar-collapse"
          id="navbar-menu"
          style={{ position: "relative" }}
        >
          <h1
            className="navbar-brand navbar-brand-autodark cursor-point"
            onClick={() => history.push("/")}
          >
            <Link to="/">
              <img
                src={logo}
                width="60"
                height="60"
                alt="Opacity"
                className="navbar-brand-image"
              />
            </Link>
            Opacity <span>v2.0.0</span>
          </h1>
          <div className="account-info">
            <div className="storage-info">
              <span>
                {formatGbs(accountInfo ? accountInfo.account.storageUsed : 0)}{" "}
              </span>{" "}
              of{" "}
              {formatGbs(
                accountInfo ? accountInfo.account.storageLimit : "..."
              )}{" "}
              used
            </div>
            <ProgressBar
              now={
                accountInfo
                  ? (100 * accountInfo.account.storageUsed) /
                    accountInfo.account.storageLimit
                  : 0
              }
              variant={storageWarning && "danger"}
              className={storageWarning && "danger"}
            />
            <div
              className="upgrade text-right"
              onClick={() => history.push("/plans")}
            >
              GET MORE SPACE
            </div>
          </div>
          <div style={{ width: "100%" }}>
            <ul className="navbar-nav">
              <UploadForm isDirectory={true} onSelected={selectFiles}>
                <li className="nav-item">
                  <span className="nav-icon nav-icon-folder"></span>
                  <Nav.Link>UPLOAD FOLDER</Nav.Link>
                </li>
              </UploadForm>
              <UploadForm isDirectory={false} onSelected={selectFiles}>
                <li className="nav-item">
                  <span className="nav-icon nav-icon-upload"></span>
                  <Nav.Link>UPLOAD FILE</Nav.Link>
                </li>
              </UploadForm>
              <li className="nav-item" onClick={handleLogout}>
                <span className="nav-icon nav-icon-logout"></span>
                <Nav.Link>LOGOUT</Nav.Link>
              </li>
            </ul>
            <div className="folder-tree">
              <h3>All files</h3>
              <TreeMenu data={treeData} hasSearch={false}>
                {({ search, items }) => (
                  <ul className="tree-menu">
                    {items.map(({ key, ...props }) => (
                      <div
                        key={key}
                        className={props.isOpen ? "opened" : ""}
                        onClick={() => handleSelectFolder(props)}
                      >
                        <ItemComponent key={key} {...props} />
                      </div>
                    ))}
                  </ul>
                )}
              </TreeMenu>
            </div>
          </div>
          <div className="side-bar-footer">
            <div>@Opacity v2.0.0</div>
            <div>
              <a href="/privacy-policy">
                <span className="text-white">Privacy Policy</span>
              </a>{" "}
              and{" "}
              <a href="/terms-of-service">
                <span className="text-white">Terms of Service</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      <div className="file-content" {...getRootProps()}>
        {isDragActive && (
          <div className="dnd-overlay">
            <div className="content-wrapper">
              <div className="overlay-content">
                <img src={uploadImage} />
                <span>Drag your file to upload to Opacity</span>
              </div>
            </div>
          </div>
        )}
        {selectedFiles.length === 0 && (
          <div className="file-header">
            <UploadForm isDirectory={false} onSelected={selectFiles}>
              <div className="d-flex header-item">
                <span className="item-icon file-upload"></span>
                <span>FILE UPLOAD</span>
              </div>
            </UploadForm>
            <div
              className=" d-flex header-item ml-3"
              onClick={() => setShowNewFolderModal(true)}
            >
              <span className="item-icon new-folder"></span>
              <span>NEW FOLDER</span>
            </div>
            {tableView && (
              <div className=" d-flex header-item ml-3">
                <span
                  className="item-icon grid-view"
                  onClick={() => {
                    setTableView(false);
                  }}
                ></span>
              </div>
            )}
            {!tableView && (
              <div className=" d-flex header-item ml-3">
                <span
                  className="item-icon table-view"
                  onClick={() => {
                    setTableView(true);
                  }}
                ></span>
              </div>
            )}
          </div>
        )}
        {selectedFiles.length > 0 && (
          <div className="file-header selected-info">
            <div></div>
            <div className="d-flex align-items-center selected-area">
              <div className="selected-info">
                <span className="circle-check"></span>
                <span>
                  {selectedFiles.length}&nbsp;items ({getSelectedFileSize()})
                </span>
              </div>
              <div
                className=" d-flex header-item ml-3"
                onClick={() => handleMultiDownload()}
              >
                <span className="item-icon file-download"></span>
                <span className="item-text">DOWNLOAD</span>
              </div>
              <div
                className=" d-flex header-item ml-3"
                onClick={() => handleMultiDelete()}
              >
                <span className="item-icon file-delete"></span>
                <span className="item-text">DELETE</span>
              </div>
              <div
                className=" d-flex header-item ml-3"
                onClick={() => setSelectedFiles([])}
              >
                <span className="item-icon file-cancel"></span>
                <span className="item-text">CANCEL</span>
              </div>
            </div>
          </div>
        )}
        <div className="container-xl">
          <div className="breadcrumb-content">
            <Breadcrumb>
              <Breadcrumb.Item
                href="#"
                onClick={() => currentPath !== "/" && setCurrentPath("/")}
              >
                <span className="home-icon"></span>
              </Breadcrumb.Item>
              {currentPath !== "/" &&
                subPaths.map(({ text, path }, i) =>
                  i === subPaths.length - 1 ? (
                    <Breadcrumb.Item active key={i}>
                      {text}
                    </Breadcrumb.Item>
                  ) : (
                    <Breadcrumb.Item
                      key={i}
                      onClick={() => setCurrentPath(path)}
                    >
                      {text}
                    </Breadcrumb.Item>
                  )
                )}
            </Breadcrumb>
          </div>
          {fileList.length === 0 && folderList.length === 0 && (
            <div className="empty-list">
              <img src={empty} />
              <h4>This folder is empty</h4>
              <span>
                Upload files or folder by clicking the upload button, or drag &
                drop from your device.
              </span>
            </div>
          )}
          {(fileList.length > 0 || folderList.length > 0) && (
            <div>
              {!tableView && (
                <div className="grid-view">
                  {folderList.map(
                    (item) =>
                      item && (
                        <FileManagerFolderEntryGrid
                          key={bytesToB64URL(item.location)}
                          accountSystem={accountSystem}
                          folderEntry={item}
                          handleDeleteItem={handleDeleteItem}
                          handleOpenRenameModal={handleOpenRenameModal}
                          setCurrentPath={setCurrentPath}
                        />
                      )
                  )}
                  {fileList.map(
                    (item) =>
                      item && (
                        <FileManagerFileEntryGrid
                          key={bytesToB64URL(item.location)}
                          accountSystem={accountSystem}
                          fileEntry={item}
                          fileShare={fileShare}
                          filePublicShare={filePublicShare}
                          handleDeleteItem={handleDeleteItem}
                          handleOpenRenameModal={handleOpenRenameModal}
                          downloadItem={fileDownload}
                          handleSelectFile={handleSelectFile}
                          selectedFiles={selectedFiles}
                        />
                      )
                  )}
                </div>
              )}
              {tableView && (
                <Table
                  highlightRowOnHover
                  hasOutline
                  verticalAlign="center"
                  className="text-nowrap"
                >
                  <Table.Header>
                    <tr className="file-table-header">
                      <th
                        onClick={() =>
                          handleSortTable(
                            "name",
                            sortable.column === "name"
                              ? sortable.method === "down"
                                ? "up"
                                : "down"
                              : "down"
                          )
                        }
                        className={`sortable ${
                          sortable.column === "name" &&
                          (sortable.method === "up" ? "asc" : "desc")
                        }`}
                      >
                        Name
                      </th>
                      {!isMobile && (
                        <th
                          onClick={() =>
                            handleSortTable(
                              "type",
                              sortable.column === "type"
                                ? sortable.method === "down"
                                  ? "up"
                                  : "down"
                                : "down"
                            )
                          }
                          className={`sortable ${
                            sortable.column === "type" &&
                            (sortable.method === "up" ? "asc" : "desc")
                          }`}
                        >
                          Type
                        </th>
                      )}
                      {!isMobile && (
                        <th
                          onClick={() =>
                            handleSortTable(
                              "created",
                              sortable.column === "created"
                                ? sortable.method === "down"
                                  ? "up"
                                  : "down"
                                : "down"
                            )
                          }
                          className={`sortable ${
                            sortable.column === "created" &&
                            (sortable.method === "up" ? "asc" : "desc")
                          }`}
                        >
                          Created
                        </th>
                      )}
                      <th
                        onClick={() =>
                          handleSortTable(
                            "size",
                            sortable.column === "size"
                              ? sortable.method === "down"
                                ? "up"
                                : "down"
                              : "down"
                          )
                        }
                        className={`sortable ${
                          sortable.column === "size" &&
                          (sortable.method === "up" ? "asc" : "desc")
                        }`}
                      >
                        Size
                      </th>
                      <th></th>
                    </tr>
                  </Table.Header>
                  <Table.Body>
                    {folderList.map(
                      (item) =>
                        item && (
                          <FileManagerFolderEntryList
                            key={bytesToB64URL(item.location)}
                            accountSystem={accountSystem}
                            folderEntry={item}
                            handleDeleteItem={handleDeleteItem}
                            handleOpenRenameModal={handleOpenRenameModal}
                            setCurrentPath={setCurrentPath}
                          />
                        )
                    )}
                    {fileList.map(
                      (item) =>
                        item && (
                          <FileManagerFileEntryList
                            key={bytesToB64URL(item.location)}
                            accountSystem={accountSystem}
                            fileEntry={item}
                            fileShare={fileShare}
                            filePublicShare={filePublicShare}
                            handleDeleteItem={handleDeleteItem}
                            handleOpenRenameModal={handleOpenRenameModal}
                            downloadItem={fileDownload}
                            handleSelectFile={handleSelectFile}
                            selectedFiles={selectedFiles}
                          />
                        )
                    )}
                  </Table.Body>
                </Table>
              )}
            </div>
          )}
        </div>
      </div>

      {oldName && (
        <RenameModal
          show={showRenameModal}
          handleClose={() => setShowRenameModal(false)}
          oldName={oldName}
          setNewName={handleChangeRename}
        />
      )}
      <DeleteModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        setDelete={() => handleDelete()}
      />
      <WarningModal
        show={showWarningModal}
        handleClose={() => setShowWarningModal(false)}
      />
      <AddNewFolderModal
        show={showNewFolderModal}
        handleClose={() => setShowNewFolderModal(false)}
        addNewFolder={addNewFolder}
      />
      <ToastContainer
        pauseOnHover={false}
        draggable={true}
        progressClassName="toast-progress-bar"
        bodyClassName="toast-body"
        position="bottom-right"
        hideProgressBar
      />
      {uploadingList.length > 0 && (
        <UploadingNotification
          setUploadingList={() => {
            setUploadingList([]);
          }}
          notifications={uploadingList}
          uploadFinish={() =>
            setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch)
          }
        />
      )}
    </div>
  );
};

const UploadForm = ({ children, onSelected, isDirectory }) => {
  const uploadFileInput = React.useRef<HTMLInputElement>(null);
  const uploadForm = React.useRef<HTMLFormElement>(null);

  const directory = {
    directory: "",
    webkitdirectory: "",
    mozkitdirectory: "",
  };

  const selectFiles = () => {
    let files = Array.from(uploadFileInput.current!.files || []);
    const filesLength = files.length;
    uploadForm.current!.reset();
    if (files.length > 0) {
      files = files.filter((file) => file.size <= FILE_MAX_SIZE);
      files.length !== filesLength && setShowWarningModal(true);
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
          onChange={(e) => selectFiles()}
          multiple={true}
          {...(isDirectory && { ...directory })}
        />
      </form>
    </div>
  );
};

const FileManagePageWrapper = ({ history }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <FileManagePage history={history} />
    </DndProvider>
  );
};
export default FileManagePageWrapper;
