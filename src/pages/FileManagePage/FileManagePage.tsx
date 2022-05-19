import * as React from "react";
import { Table, Tooltip, Tag, NavLink } from "tabler-react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Button, Nav, ProgressBar, Breadcrumb, Alert, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import TreeMenu, { ItemComponent } from "react-simple-tree-menu";
import { Account, AccountGetRes } from "../../../ts-client-library/packages/account-management";
import {
  AccountSystem,
  MetadataAccess,
  FileMetadata,
  FolderFileEntry,
  FoldersIndexEntry,
} from "../../../ts-client-library/packages/account-system";
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web";
import { hexToBytes } from "../../../ts-client-library/packages/util/src/hex";
import {
  polyfillReadableStreamIfNeeded,
  polyfillWritableStreamIfNeeded,
  WritableStream,
} from "../../../ts-client-library/packages/util/src/streams";
import { OpaqueUpload, OpaqueDownload } from "../../../ts-client-library/packages/opaque";
import {
  bindFileSystemObjectToAccountSystem,
  bindDownloadToAccountSystem,
  bindUploadToAccountSystem,
  bindPublicShareToAccountSystem,
} from "../../../ts-client-library/packages/filesystem-access/src/account-system-binding";
import {
  UploadEvents,
  UploadProgressEvent,
  UploadErrorEvent,
  UploadCancelEvent,
  UploadFinishedEvent,
} from "../../../ts-client-library/packages/filesystem-access/src/events";
import RenameModal from "../../components/RenameModal/RenameModal";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import WarningModal from "../../components/WarningModal/WarningModal";
import AddNewFolderModal from "../../components/NewFolderModal/NewFolderModal";
import "./FileManagePage.scss";
import { formatBytes, formatGbs } from "../../helpers";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FileManagerFileEntryGrid, FileManagerFileEntryList } from "../../components/FileManager/FileManagerFileEntry";
import { FileManagerFolderEntryGrid, FileManagerFolderEntryList } from "../../components/FileManager/FileManagerFolderEntry";
import FileShareModal from "../../components/FileManager/FileShareModal";
import { useDropzone } from "react-dropzone";
import ReactLoading from "react-loading";
import streamsaver from "streamsaver";
import { Mutex } from "async-mutex";
import { useMediaQuery } from "react-responsive";
import UploadingNotification from "../../components/UploadingNotification/UploadingNotification";
import { FileSystemObject } from "../../../ts-client-library/packages/filesystem-access/src/filesystem-object";
import { STORAGE_NODE as storageNode } from "../../config";
import { bytesToB64URL } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/b64";
import { arraysEqual } from "../../../ts-client-library/packages/account-management/node_modules/@opacity/util/src/arrayEquality";
import { FileSystemShare } from "../../../ts-client-library/packages/filesystem-access/src/public-share";
import { bytesToHex } from "../../../ts-client-library/packages/util/src/hex";
import * as fflate from "fflate";
import { saveAs } from "file-saver";
import SignUpModal from "../../components/SignUpModal/SignUpModal";
import { PLANS } from "../../config";
import { isChrome } from "react-device-detect";
import formatDate from 'date-fns/format';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import differenceInDays from "date-fns/differenceInDays";

const uploadImage = require("../../assets/upload.png");
const empty = require("../../assets/empty.png");
const logo = require("../../assets/logo2.png");
const copy = require("../../assets/copy.svg");

streamsaver.mitm = "/resources/streamsaver/mitm.html";
Object.assign(streamsaver, { WritableStream });
import { OPACITY_DRIVE_FOR_MAC, OPACITY_DRIVE_FOR_WINDOWS } from "../../config";

let logoutTimeout;
let fileUploadingList = [];
let loadingFlagCnt = 0;
let filesToUpload = [];
const THREAD_COUNT = 10;
let curThreadNum = 0;
let uploaderThread = [];
let location;

const FileManagePage = ({ history }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isManaging, setIsManaging] = React.useState(false);
  const cryptoMiddleware = React.useMemo(
    () =>
      new WebAccountMiddleware({
        asymmetricKey: hexToBytes(localStorage.getItem("key")),
      }),
    []
  );
  const netMiddleware = React.useMemo(() => new WebNetworkMiddleware(), []);
  const fileSystemObject = React.useMemo(
    () =>
      new FileSystemObject({
        handle: undefined,
        location: undefined,
        config: {
          net: netMiddleware,
          crypto: cryptoMiddleware,
          storageNode: storageNode,
        },
      }),
    [netMiddleware, cryptoMiddleware, storageNode]
  );
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
  const account = React.useMemo(
    () =>
      new Account({
        crypto: cryptoMiddleware,
        net: netMiddleware,
        storageNode,
      }),
    [cryptoMiddleware, netMiddleware, storageNode]
  );
  const [updateCurrentFolderSwitch, setUpdateCurrentFolderSwitch] = React.useState(false);
  const [updateFolderEntrySwitch, setUpdateFolderEntrySwitch] = React.useState(false);
  const [updateFileEntrySwitch, setUpdateFileEntrySwitch] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [tableView, setTableView] = React.useState(true);
  const [currentPath, setCurrentPath] = React.useState("/");
  const [currentLocation, setCurrentLocation] = React.useState<Uint8Array>();
  const currentPathRef = React.useRef("/");
  const [folderList, setFolderList] = React.useState<FoldersIndexEntry[]>([]);
  const [folderMetaList, setFolderMetaList] = React.useState(undefined);
  const folderListRef = React.useRef<FoldersIndexEntry[]>([]);
  const [fileList, setFileList] = React.useState<FolderFileEntry[]>([]);
  const [fileMetaList, setFileMetaList] = React.useState(undefined);
  const fileListRef = React.useRef<FolderFileEntry[]>([]);
  const [treeData, setTreeData] = React.useState([]);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [subPaths, setSubPaths] = React.useState([]);
  const [accountInfo, setAccountInfo] = React.useState<AccountGetRes>();
  const [showRenameModal, setShowRenameModal] = React.useState(false);
  const [fileToRename, setFileToRename] = React.useState<FolderFileEntry>();
  const [fileToDelete, setFileToDelete] = React.useState<FileMetadata | FolderFileEntry>();
  const [folderToRename, setFolderToRename] = React.useState<FoldersIndexEntry>();
  const [folderToDelete, setFolderToDelete] = React.useState<FoldersIndexEntry>();
  const [oldName, setOldName] = React.useState();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showWarningModal, setShowWarningModal] = React.useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = React.useState(false);
  const [uploadingList, setUploadingList] = React.useState([]);
  const [selectedFiles, setSelectedFiles] = React.useState<FileMetadata[]>([]);
  const [alertText, setAlertText] = React.useState("There are 30 days remaining on your account. ");
  const [alertLinkText, setAlertLinkText] = React.useState("Upgrade now to a paid plan.");
  const [alertLink, setAlertLink] = React.useState("renew");
  const [alertShow, setAlertShow] = React.useState(false);
  const [openShareModal, setOpenShareModal] = React.useState(false);
  const [shareMode, setShareMode] = React.useState<"private" | "public">("private");
  const [shareFile, setShareFile] = React.useState<FileMetadata>(null);
  const [storageWarning, setIsStorageWarning] = React.useState(false);
  const [sortable, setSortable] = React.useState({
    column: "null",
    method: "null",
  });
  const [filesForZip, setFilesForZip] = React.useState([]);
  const [upgradeAvailable, setUpgradeAvailable] = React.useState(true);
  const [showSignUpModal, setShowSignUpModal] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState();
  const [isAccountExpired, setIsAccountExpired] = React.useState(false);
  const [isFilechoosed, setIsFileChoosed] = React.useState(true);
  const [, setProcessChange] = React.useState();
  const [currentUploader, setCurrentUploader] = React.useState<OpaqueUpload>();

  const handleShowSidebar = React.useCallback(() => {
    setShowSidebar(!showSidebar);
  }, [showSidebar]);

  const isFileManaging = () => {
    setIsManaging(true);
  };

  const OnfinishFileManaging = () => {
    setIsManaging(false);
  };

  //=================event hook================

  const clearTimeouts = () => {
    logoutTimeout && clearTimeout(logoutTimeout);
  };

  React.useEffect(() => {
    isManaging === true && clearTimeouts();
  }, [isManaging, clearTimeouts]);

  const logout = () => {
    if (isManaging === true || window.location.pathname !== "/file-manager") {
      return;
    }
    localStorage.clear();
    history.push("/");
  };

  const setTimeouts = () => {
    logoutTimeout = setTimeout(logout, 1000 * 60 * 20);
  };

  React.useEffect(() => {
    const events = ["load", "mousemove", "mousedown", "click", "scroll", "keypress"];

    const resetTimeout = () => {
      clearTimeouts();
      !isManaging && setTimeouts();
    };

    for (let i in events) {
      window.addEventListener(events[i], resetTimeout);
    }
    // resetTimeout();
    return () => {
      for (let i in events) {
        window.removeEventListener(events[i], resetTimeout);
        clearTimeouts();
      }
    };
  }, [isManaging, setTimeouts]);

  //=================end event hook============

  React.useEffect(() => {
    getFolderData();
  }, [updateCurrentFolderSwitch]);

  React.useEffect(() => {
    currentPathRef.current = currentPath;
    setFolderMetaList(undefined);
    setFileMetaList(undefined);
    setSortable({
      column: "null",
      method: "null",
    });
  }, [currentPath]);

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
      const parentPaths = "/" + (parentFolders.length > 0 ? parentFolders.join("/") + "/" : "");

      return { text: l, path: parentPaths + l };
    });
    setSubPaths(subpaths);
    setPageLoading(true);
    loadingFlagCnt++;

    Promise.all([
      accountSystem.getFoldersInFolderByPath(currentPath),
      currentPath == "/" ? accountSystem.addFolder(currentPath) : accountSystem.getFolderMetadataByPath(currentPath),
    ])
      .then(async ([folders, folderMeta]) => {
        setFolderList(folders);
        setFileList(folderMeta.files);
        setCurrentLocation(folderMeta.location);
        loadingFlagCnt--;
        await Promise.all([getFolderMetaList(folders), getFileMetaList(folderMeta.files)]);
        loadingFlagCnt === 0 && setPageLoading(false);
      })
      .catch((err) => {
        toast.error(`folder "${currentPath}" not found`);
        loadingFlagCnt--;
        setPageLoading(false);
      });
  }, [currentPath, updateCurrentFolderSwitch]);

  React.useEffect(() => {
    if (filesForZip.length !== 0 && filesForZip.length === selectedFiles.length) {
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

  React.useEffect(() => {
    fileUploadingList = [];
    filesToUpload = [];
    curThreadNum = 0;
    uploaderThread = [];
  }, []);

  const doRefreshAfterRenew = React.useCallback(async () => {
    try {
      const accountInfo = await account.info();
      setAccountInfo(accountInfo);
      setAlertShow(false);
    } catch (e) {
      localStorage.clear();
      history.push("/");
    }
  }, [account]);

  const getFolderData = React.useCallback(async () => {
    try {
      setPageLoading(true);
      loadingFlagCnt++;
      const accountInfo = await account.info();
      setAccountInfo(accountInfo);

      const usedStorage = accountInfo.account.storageUsed;
      const limitStorage = accountInfo.account.storageLimit;
      const remainDays = differenceInDays(
        new Date(accountInfo.account.expirationDate),
        new Date()
      );
      const plansApi = await account.plans();
      let idx = 0;
      for (idx = 0; idx < plansApi.length; idx++) {
        if (plansApi[idx].storageInGB === limitStorage) {
          break;
        }
      }
      setUpgradeAvailable(idx < plansApi.length - 1);
      const curPlanIndex = plansApi.findIndex((item) => item.storageInGB === limitStorage);
      if (curPlanIndex >= 0) {
        const { cost, costInUSD, storageInGB, name } = plansApi[curPlanIndex];
        setCurrentPlan({
          ...PLANS[curPlanIndex],
          opctCost: cost,
          usdCost: costInUSD,
          storageInGB,
          name,
        });
      }

      if ((limitStorage / 10) * 9 < usedStorage) {
        setIsStorageWarning(true);
        setAlertText(`You have used ${((usedStorage / limitStorage) * 100).toFixed(2)}% of your plan. `);
        setAlertLinkText("Upgrade now to get more space.");
        setAlertLink("plans");
        setAlertShow(true);
      }
      if (remainDays < 30) {
        isAfter(new Date(accountInfo.account.expirationDate), new Date()) && setIsAccountExpired(true);

        setAlertText(`There are ${remainDays} days remaining on your account. `);
        if (limitStorage === 10) {
          setAlertLinkText("Upgrade now to a paid plan.");
          setAlertLink("plans");
        } else {
          setAlertLinkText("Renew now to prevent losing access to your data.");
          setAlertLink("renew");
        }
        setAlertShow(true);
      }
    } catch (e) {
      localStorage.clear();
      history.push("/");
    }

    const t = await accountSystem.getFoldersIndex();

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
    loadingFlagCnt--;
    loadingFlagCnt === 0 && setPageLoading(false);
  }, [account, accountSystem]);

  const handleLogout = React.useCallback(() => {
    localStorage.clear();
    history.push("/");
  }, []);

  const relativePath = React.useCallback((path: string) => path.substr(0, path.lastIndexOf("/")), []);

  React.useEffect(() => {
    const isFinished = uploadingList.find((item) => item.percent !== 100) ? false : true;
    isFinished && setUpdateCurrentFolderSwitch((prev) => !prev);
  }, [uploadingList, setUpdateCurrentFolderSwitch]);

  const updateUploadingItemStatus = (itemId, status, percent = 100) => {
    let templist = fileUploadingList;
    let index = templist.findIndex((ele) => ele.id === itemId);
    if (index > -1) {
      templist[index].percent = percent;
      templist[index].status = status;
      fileUploadingList = templist;
      setUploadingList([...templist]);
      setProcessChange({});
    }
  };

  const handleCancelSingleThreadUpload = React.useCallback(
    async (item) => {
      if (currentUploader.uploaderId === item.id) {
        await currentUploader.cancel();
      }
      updateUploadingItemStatus(item.id, "cancelled");
    },
    [currentUploader]
  );

  const handleCancelUpload = React.useCallback(async (item) => {
    if (isChrome) {
      await handleCancelSingleThreadUpload(item);
      return;
    }
    const threadIndex = uploaderThread.findIndex((uploader) => item.id === uploader.uploaderId);
    if (threadIndex !== -1) {
      const uploader = uploaderThread[threadIndex];
      uploader.cancel();
    } else {
      updateUploadingItemStatus(item.id, "cancelled");
    }
  }, []);

  const handleCancelAllUpload = React.useCallback(async () => {
    if (fileUploadingList.find((item) => item.percent !== 100)) {
      if (isChrome) {
        for (const uploader of uploaderThread) {
          uploader.cancel();
        }
      } else {
        currentUploader && (await currentUploader.cancel());
      }

      fileUploadingList.forEach((item) => {
        const isInThread = uploaderThread.findIndex((x) => x.uploaderId === item.id);
        isInThread === -1 && item.status !== "completed" && updateUploadingItemStatus(item.id, "cancelled");
      });
    }
  }, [currentUploader]);

  const uploadFile = React.useCallback(
    async (file: File, path: string) => {
      let toastID = file.size + file.name + path;
      try {
        let index = fileUploadingList.findIndex((ele) => ele.id === toastID);
        if (index > -1 && fileUploadingList[index].status === "cancelled") {
          const fileIndex = filesToUpload.findIndex((item) => toastID === item.size + file.name + pathGenerator(item, currentPath));
          fileIndex !== -1 && filesToUpload.splice(fileIndex, 1);
          if (curThreadNum < THREAD_COUNT && filesToUpload.length > 0) {
            const nextFile = filesToUpload[0];
            const nextFilePath = pathGenerator(nextFile, currentPath);
            uploadFile(nextFile, nextFilePath);
          }
          return;
        }

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
        uploaderThread.push(upload);
        curThreadNum++;

        const fileIndex = filesToUpload.findIndex((item) => toastID === item.size + file.name + pathGenerator(item, currentPath));
        fileIndex !== -1 && filesToUpload.splice(fileIndex, 1);
        if (curThreadNum < THREAD_COUNT && filesToUpload.length > 0) {
          const nextFile = filesToUpload[0];
          const nextFilePath = pathGenerator(nextFile, currentPath);
          uploadFile(nextFile, nextFilePath);
        }

        // side effects
        bindUploadToAccountSystem(accountSystem, upload);

        upload.addEventListener(UploadEvents.PROGRESS, (e: UploadProgressEvent) => {
          updateUploadingItemStatus(toastID, "uploading", e.detail.progress * 100);
        });

        upload.addEventListener(UploadEvents.ERROR, (e: UploadErrorEvent) => {
          toast.error(e.detail.error);
          updateUploadingItemStatus(toastID, "cancelled");
        });

        upload.addEventListener(UploadEvents.CANCEL, (e: UploadCancelEvent) => {
          updateUploadingItemStatus(toastID, "cancelled");
        });

        upload.addEventListener(UploadEvents.FINISH, (e: UploadFinishedEvent) => {
          updateUploadingItemStatus(toastID, "completed");
        });

        const fileStream = polyfillReadableStreamIfNeeded<Uint8Array>(file.stream());

        try {
          const stream = await upload.start();

          stream && fileStream.pipeThrough(stream as TransformStream<Uint8Array, Uint8Array> as any);
          await upload.finish();
        } finally {
          curThreadNum--;
          const threadIndex = uploaderThread.findIndex((item) => toastID === item.uploaderId);
          if (threadIndex !== -1) {
            delete uploaderThread[threadIndex];
            uploaderThread.splice(threadIndex, 1);
          }
          if (curThreadNum < THREAD_COUNT && filesToUpload.length > 0) {
            const nextFile = filesToUpload[0];
            const nextFilePath = pathGenerator(nextFile, currentPath);
            uploadFile(nextFile, nextFilePath);
          }
        }
      } catch (e) {
        curThreadNum--;

        const threadIndex = uploaderThread.findIndex((item) => toastID === item.uploaderId);
        if (threadIndex !== -1) {
          delete uploaderThread[threadIndex];
          uploaderThread.splice(threadIndex, 1);
        }
        if (curThreadNum < THREAD_COUNT && filesToUpload.length > 0) {
          const nextFile = filesToUpload[0];
          const nextFilePath = pathGenerator(nextFile, currentPath);
          uploadFile(nextFile, nextFilePath);
        }
      }
    },
    [
      currentPath,
      accountSystem,
      currentLocation,
      cryptoMiddleware,
      netMiddleware,
      storageNode,
      updateCurrentFolderSwitch,
      updateFolderEntrySwitch,
      updateFileEntrySwitch,
    ]
  );

  const fileUploadMutex = React.useMemo(() => new Mutex(), []);
  const uploadFileOnSingleThread = React.useCallback(
    async (file: File, path: string) => {
      let toastID = file.size + file.name + path;
      try {
        let index = fileUploadingList.findIndex((ele) => ele.id === toastID);
        if (index > -1 && fileUploadingList[index].status === "cancelled") {
          return;
        }
        const release = await fileUploadMutex.acquire();

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
        setCurrentUploader(upload);

        // side effects
        bindUploadToAccountSystem(accountSystem, upload);

        upload.addEventListener(UploadEvents.PROGRESS, (e: UploadProgressEvent) => {
          updateUploadingItemStatus(toastID, "uploading", e.detail.progress * 100);
        });

        upload.addEventListener(UploadEvents.ERROR, (e: UploadErrorEvent) => {
          toast.error(e.detail.error);
          updateUploadingItemStatus(toastID, "cancelled");
        });

        upload.addEventListener(UploadEvents.CANCEL, (e: UploadCancelEvent) => {
          updateUploadingItemStatus(toastID, "cancelled");
        });

        upload.addEventListener(UploadEvents.FINISH, (e: UploadFinishedEvent) => {
          updateUploadingItemStatus(toastID, "completed");
        });

        const fileStream = polyfillReadableStreamIfNeeded<Uint8Array>(file.stream());

        try {
          const stream = await upload.start();

          stream && fileStream.pipeThrough(stream as TransformStream<Uint8Array, Uint8Array> as any);
          await upload.finish();
        } finally {
          release();
        }
      } catch (e) {
        console.error(e,"error on uploading file in mutex");
      }
    },
    [
      currentPath,
      accountSystem,
      currentLocation,
      cryptoMiddleware,
      netMiddleware,
      storageNode,
      updateCurrentFolderSwitch,
      updateFolderEntrySwitch,
      updateFileEntrySwitch,
    ]
  );

  const pathGenerator = React.useCallback((file, curPath) => {
    const folderPath = file.path
      ? curPath + relativePath(file.path)
      : curPath + (file.webkitRelativePath ? "/" + relativePath(file.webkitRelativePath) : "");
    return folderPath;
  }, []);

  const selectFiles = React.useCallback(
    async (files) => {
      isFileManaging();
      let addedFileList = [];

      if (isChrome) {
        files.forEach((file) => {
          const path = pathGenerator(file, currentPath);
          let toastID = file.size + file.name + path;
          if (!fileUploadingList.find((item) => item.id === toastID)) {
            addedFileList.push({ id: toastID, fileName: file.name, percent: 0, status: "active" });
            filesToUpload.push(file);
          }
        });

        if (curThreadNum === 0) {
          const orderChanged = addedFileList.slice(0, THREAD_COUNT - curThreadNum);
          orderChanged.reverse();
          addedFileList.splice(0, 10, ...orderChanged);
        }

        fileUploadingList.push(...addedFileList);
        setUploadingList(fileUploadingList);
        setProcessChange({});

        if (curThreadNum === 0 || curThreadNum < THREAD_COUNT) {
          const file = filesToUpload[0];
          const path = pathGenerator(file, currentPath);
          uploadFile(file, path);
        }
      } else {
        files.forEach((file) => {
          const path = pathGenerator(file, currentPath);
          let toastID = file.size + file.name + path;
          if (!fileUploadingList.find((item) => item.id === toastID)) {
            addedFileList.push({ id: toastID, fileName: file.name, percent: 0, status: "active" });
          }
        });

        fileUploadingList.push(...addedFileList);
        setUploadingList(fileUploadingList);
        setProcessChange({});

        for (const file of files) {
          const path = pathGenerator(file, currentPath);
          // ======================will update with UUID (DEV-445)  =======================================
          await uploadFileOnSingleThread(file, path);
        }
      }
    },
    [currentPath, uploadFile]
  );

  const addNewFolder = React.useCallback(
    async (folderName) => {
      setPageLoading(true);
      try {
        setShowNewFolderModal(false);
        const status = await accountSystem.addFolder(currentPath === "/" ? currentPath + folderName : currentPath + "/" + folderName);
        toast(`Folder ${folderName} was successfully created.`);
        setPageLoading(false);
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
      } catch (e) {
        setPageLoading(false);
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
      isFileManaging();
      if (file.private.handle) {
        try {
          const d = new OpaqueDownload({
            handle: file.private.handle,
            config: {
              crypto: cryptoMiddleware,
              net: netMiddleware,
              storageNode,
            },
            name: file.name,
            fileMeta: file,
          });

          // side effects
          bindDownloadToAccountSystem(accountSystem, d);

          const fileStream = polyfillWritableStreamIfNeeded<Uint8Array>(streamsaver.createWriteStream(file.name, { size: file.size }));
          const s = await d.start();

          d.finish().then(() => {
            OnfinishFileManaging();
          });

          // more optimized
          if (s.pipeTo && !isMultiple) {
            s.pipeTo(fileStream as WritableStream<Uint8Array>)
              .then(() => {
                setPageLoading(false);
              })
              .catch((err) => {
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
          toast.error(`An error occurred while downloading ${file.name}.`);
        }
      } else {
        console.error("Public download is not yet available");
        toast.error("Public download is not yet available");
      }
    },
    [cryptoMiddleware, netMiddleware, storageNode]
  );

  const cancelPublicShare = React.useCallback(
    async (file) => {
      const curFileMetadata = await accountSystem.getFileMetadata(file.location);
      if (!curFileMetadata.public.location) {
        return;
      }
      const fileSystemShare = new FileSystemShare({
        shortLink: curFileMetadata.public.shortLinks[0],
        fileLocation: curFileMetadata.public.location,
        handle: curFileMetadata.location,
        config: {
          crypto: cryptoMiddleware,
          net: netMiddleware,
          storageNode: storageNode,
        },
      });

      bindPublicShareToAccountSystem(accountSystem, fileSystemShare);

      await fileSystemShare.publicShareRevoke();
    },
    [accountSystem, cryptoMiddleware, netMiddleware, storageNode]
  );

  const deleteFile = React.useCallback(
    async (file: FileMetadata) => {
      isFileManaging();
      try {
        const fso = new FileSystemObject({
          handle: file.private.handle,
          location: undefined,
          config: {
            net: netMiddleware,
            crypto: cryptoMiddleware,
            storageNode: storageNode,
          },
        });
        bindFileSystemObjectToAccountSystem(accountSystem, fso);
        await fso.delete();
        setFileToDelete(null);
      } catch (e) {
        setFileToDelete(null);
        toast.error(`An error occurred while deleting ${file.name}.`);
      }
    },
    [accountSystem, updateCurrentFolderSwitch]
  );

  const handleMoveFile = React.useCallback(async (file: FileMetadata) => {
    try {
      location = file.location;
      toast.info(`File copied`);
      setIsFileChoosed(false);
    } catch (e) {
      toast.error(`An error occurred while get file location`);
    }
  }, []);

  const handlePasteFilePath = React.useCallback(
    async (folderpath) => {
      setPageLoading(true);
      try {
        console.log(location);
        console.log(folderpath);
        await accountSystem.moveFile(location, folderpath, false);
        toast.success(`File successfully moved!`);
        setIsFileChoosed(true);
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
      } catch (e) {
        setPageLoading(false);
        toast.error(`An error occurred while moving a folder.`);
      }
    },
    [accountSystem, currentPath, updateCurrentFolderSwitch]
  );

  const deleteMultiFile = React.useCallback(
    async (files: FileMetadata[]) => {
      isFileManaging();
      try {
        const fso = new FileSystemObject({
          handle: files[0].private.handle,
          location: undefined,
          config: {
            net: netMiddleware,
            crypto: cryptoMiddleware,
            storageNode: storageNode,
          },
        });
        bindFileSystemObjectToAccountSystem(accountSystem, fso);
        await accountSystem
          .removeMultiFile(files.map((item) => item.location))
          .catch(() => {
            toast.error(`An error occurred while deleting selected files.`);
          })
          .then(async () => {
            await fso.deleteMultiFile(files).catch(() => {
              toast.error(`An error occurred while deleting selected files.`);
            });
          });

        setFileToDelete(null);
      } catch (e) {
        await accountSystem.removeMultiFile(files.map((item) => item.location));
        setFileToDelete(null);
        toast.error(`An error occurred while deleting selected files.`);
      }
    },
    [accountSystem, updateCurrentFolderSwitch]
  );

  const deleteFolder = React.useCallback(
    async (folder: FoldersIndexEntry) => {
      try {
        const folders = await accountSystem.getFoldersInFolderByLocation(folder.location);
        const folderMeta = await accountSystem.getFolderMetadataByLocation(folder.location);

        const fileMetaListInFolder = [];
        for (const file of folderMeta.files) {
          const metaFile = await accountSystem.getFileIndexEntryByFileMetadataLocation(file.location);
          fileMetaListInFolder.push(metaFile);
        }

        fileMetaListInFolder.length > 0 && (await deleteMultiFile(fileMetaListInFolder));

        for (const folderItem of folders) {
          await deleteFolder(folderItem);
        }

        await accountSystem.removeFolderByLocation(folder.location);
      } catch (e) {
        console.error(e);
        setFolderToDelete(null);
        toast.error(`An error occurred while deleting Folder ${folder.path}.`);
      }
    },
    [accountSystem]
  );

  const calculateTotalItems = async (folder: FoldersIndexEntry) => {
    try {
      const folders = await accountSystem.getFoldersInFolderByPath(folder.path);
      const folderMeta = await accountSystem.getFolderMetadataByPath(folder.path);

      let files = folderMeta.files?.length;

      if (!folders.length) return files;

      for (const folderItem of folders) files += await calculateTotalItems(folderItem);

      return files;
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenRenameModal = React.useCallback((item, isFile) => {
    setOldName(item.name);
    if (isFile) setFileToRename(item);
    else setFolderToRename(item);
    setShowRenameModal(true);
  }, []);

  const handleChangeRename = React.useCallback(
    async (rename) => {
      setPageLoading(true);
      try {
        setShowRenameModal(false);
        setOldName(null);
        if (fileToRename) {
          const status = await accountSystem.renameFile(fileToRename.location, rename);
          toast(`${fileToRename.name} was renamed successfully.`);
        }
        if (folderToRename) {
          const status = await accountSystem.renameFolder(folderToRename.path, rename);
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

  const handleDeleteItem = React.useCallback((item: FileMetadata | FoldersIndexEntry, isFile: boolean) => {
    if (isFile) setFileToDelete(item as FileMetadata);
    else setFolderToDelete(item as FoldersIndexEntry);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteBrokenFile = React.useCallback(
    async (location: Uint8Array) => {
      await accountSystem._removeBrokenFile(currentPath, location).catch(() => {
        toast.error("Failed to remove broken file");
        throw new Error("Error remove file metdata");
      });
      setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
    },
    [accountSystem, currentPath]
  );

  const handleDeleteBrokenFolder = React.useCallback(
    async (location: Uint8Array) => {
      await accountSystem._removeBrokenFolder(location).catch(() => {
        toast.error("Failed to remove broken folder");
        throw new Error("Error remove broken folder");
      });
      setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
    },
    [accountSystem]
  );

  const handleDelete = async () => {
    setPageLoading(true);
    setShowDeleteModal(false);
    if (selectedFiles.length === 0) {
      if (folderToDelete) {
        isFileManaging();
        await deleteFolder(folderToDelete);
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
        setFolderToDelete(null);
        OnfinishFileManaging();
      } else {
        await deleteFile(fileToDelete);
        OnfinishFileManaging();
        setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
      }
    } else {
      await deleteMultiFile(selectedFiles);
      OnfinishFileManaging();
      setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
      setSelectedFiles([]);
    }
  };

  const onDrop = React.useCallback(
    (files) => {
      selectFiles(files);
    },
    [currentPath]
  );

  const { isDragActive, fileRejections, getRootProps } = useDropzone({
    onDrop,
    minSize: 0,
    multiple: true,
    disabled: isAccountExpired,
  });

  const handleSelectFolder = React.useCallback(
    (folder) => {
      if (folder.path !== currentPath) setCurrentPath(folder.path);
    },
    [currentPath]
  );
  const handleSelectFile = (file) => {
    let temp = selectedFiles.slice();
    let i = selectedFiles.findIndex((item) => arraysEqual(item.location, file.location));
    if (i !== -1) {
      temp.splice(i, 1);
    } else {
      temp = [...selectedFiles, file];
    }
    setSelectedFiles(temp);
  };
  const onSelectAll = async (e) => {
    e.stopPropagation();
    if (selectedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(fileMetaList.filter((item) => "uploaded" in item));
    }
  };
  const FilterbyName = async (searchName) => {
    if (searchName.length) {
      let filterfileList = [];
      let fileterfolderList = [];
      fileList.forEach((file) => {
        if (file.name.toLowerCase().includes(searchName.toLowerCase())) {
          filterfileList.push(file);
        }
      });
      folderList.forEach((folder) => {
        if (folder.path.toLowerCase().includes(searchName.toLowerCase())) {
          fileterfolderList.push(folder);
        }
      });
      setFileList(filterfileList);
      setFolderList(fileterfolderList);
    } else {
      toast.info("Search string empty!!");
    }
  };
  const getSelectedFileSize = () => {
    let size = 0;
    selectedFiles.map((item) => (size = size + (item.size || 0)));
    return formatBytes(size);
  };
  const handleMultiDownload = async () => {
    setFilesForZip([]);
    setPageLoading(true);
    for (const file of selectedFiles) {
      await fileDownload(file, selectedFiles.length > 1 ? true : false);
    }
    OnfinishFileManaging();
  };
  const handleMultiDelete = () => {
    setShowDeleteModal(true);
  };

  const compareName = (a, b, mode, type) => {
    var nameA = type === "file" ? a.name.toUpperCase() : a.path.toUpperCase();
    var nameB = type === "file" ? b.name.toUpperCase() : b.path.toUpperCase();
    if (!nameA || !nameB) return 0;

    if (nameA < nameB) {
      return mode === "down" ? 1 : -1;
    }
    if (nameA > nameB) {
      return mode === "down" ? -1 : 1;
    }
    return 0;
  };

  const compareType = (a, b, mode, type) => {
    const sourceList = type === "file" ? fileMetaList : folderMetaList;
    const Ameta = sourceList.find((meta) => bytesToHex(meta.location) === bytesToHex(a.location));
    const Bmeta = sourceList.find((meta) => bytesToHex(meta.location) === bytesToHex(b.location));
    
    if (!Ameta || !Bmeta) return 0;

    var nameA = type === "file" ? (Ameta.public.location ? "PUBLIC" : "PRIVATE") : Ameta.path.toUpperCase();
    var nameB = type === "file" ? (Bmeta.public.location ? "PUBLIC" : "PRIVATE") : Bmeta.path.toUpperCase();
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
    const Ameta = sourceList.find((meta) => bytesToHex(meta.location) === bytesToHex(a.location));
    const Bmeta = sourceList.find((meta) => bytesToHex(meta.location) === bytesToHex(b.location));
    
    if (!Ameta || !Bmeta) return 0;

    if (isBefore(new Date(Ameta.uploaded), new Date(Bmeta.uploaded))) {
      return mode === "down" ? 1 : -1;
    }
    if (isAfter(new Date(Ameta.uploaded), new Date(Bmeta.uploaded))) {
      return mode === "down" ? -1 : 1;
    }
    return 0;
  };

  const compareSize = (a, b, mode, type) => {
    const sourceList = type === "file" ? fileMetaList : folderMetaList;
    const Ameta = sourceList.find((meta) => bytesToHex(meta.location) === bytesToHex(a.location));
    const Bmeta = sourceList.find((meta) => bytesToHex(meta.location) === bytesToHex(b.location));

    if (!Ameta || !Bmeta) return 0;

    if (Ameta.size < Bmeta.size) {
      return mode === "down" ? 1 : -1;
    }
    if (Ameta.size > Bmeta.size) {
      return mode === "down" ? -1 : 1;
    }
    return 0;
  };

  const getFileMetaList = async (fileList: FolderFileEntry[]) => {
    setPageLoading(true);
    loadingFlagCnt++;
    const metaList = fileList.map(async (file) => {
      return await accountSystem
        ._getFileMetadata(file.location)
        .then((f) => {
          return f;
        })
        .catch(() => {
          return file;
        });
    });
    const tmp = await Promise.all(metaList);
    setFileMetaList(tmp);
    loadingFlagCnt--;
    loadingFlagCnt === 0 && setPageLoading(false);
    return tmp;
  }

  const getFolderMetaList = async (folderList: FoldersIndexEntry[]) => {
    setPageLoading(true);
    loadingFlagCnt++;
    const metaList = folderList.map(async (folder) => {
      return await accountSystem
        ._getFolderMetadataByLocation(folder.location)
        .then((f) => {
          return f;
        })
        .catch(() => {
          return folder;
        });
    });
    const tmp = await Promise.all(metaList);
    setFolderMetaList(tmp);
    loadingFlagCnt--;
    loadingFlagCnt === 0 && setPageLoading(false);
  }

  React.useEffect(() => {
    if (folderMetaList && fileMetaList && sortable.column !== "null") {
      const { column, method } = sortable;

      switch (column) {
        case "name":
          setFileList([...fileList].sort((a, b) => compareName(a, b, method, "file")));
          setFolderList([...folderList].sort((a, b) => compareName(a, b, method, "folder")));
          break;
        case "type":
          setFileList([...fileList].sort((a, b) => compareType(a, b, method, "file")));
          break;
        case "created":
          setFileList([...fileList].sort((a, b) => compareDate(a, b, method, "file")));
          setFolderList([...folderList].sort((a, b) => compareDate(a, b, method, "folder")));
          break;
        case "size":
          setFileList([...fileList].sort((a, b) => compareSize(a, b, method, "file")));
          setFolderList([...folderList].sort((a, b) => compareSize(a, b, method, "folder")));
          break;
        default:
          break;
      }
    }
  }, [fileMetaList, folderMetaList, sortable]);

  const handleSortTable = async (mode, method) => {
    setSortable({ column: mode, method });
  };

  const lastFour = localStorage.getItem("key")?.slice(-4);

  const keyDownHandler = (e) => {
    if (e.keyCode === 224 || e.keyCode === 91 || e.keyCode === 17) {
      e.preventDefault();
      e.stopPropagation();
      localStorage.setItem("cmd_status", "true");
    }

    if (e.keyCode === 65 && localStorage.cmd_status === "true") {
      e.preventDefault();
      e.stopPropagation();
      onSelectAll(e);
    }
  };

  const keyUpHandler = (e) => {
    if (e.keyCode === 224 || e.keyCode === 91 || e.keyCode === 17) localStorage.setItem("cmd_status", "false");
  };

  const renderMacTooltip = (props) => (
    <Tooltip id="download-tooltip" {...props}>
      <div className="tooltip-style">
        <div className="tooltip-header">Download MacOS Opacity Drive for desktop</div>
        <div className="tooltip-content">Work with all of your files right from your desktop using Opacity Drive</div>
      </div>
    </Tooltip>
  );
  const renderWinTooltip = (props) => (
    <Tooltip id="download-tooltip" {...props}>
      <div className="tooltip-style">
        <div className="tooltip-header">Download Windows Opacity Drive for desktop</div>
        <div className="tooltip-content">Work with all of your files right from your desktop using Opacity Drive</div>
      </div>
    </Tooltip>
  );

  return (
    <div className="page" onKeyDown={(e) => keyDownHandler(e)} onKeyUp={(e) => keyUpHandler(e)}>
      {showSignUpModal && currentPlan && (
        <SignUpModal
          show={showSignUpModal}
          handleClose={() => setShowSignUpModal(false)}
          isForRenew={true}
          initialPlan={currentPlan}
          doRefresh={doRefreshAfterRenew}
        />
      )}

      {openShareModal && (
        <FileShareModal
          open={openShareModal}
          onClose={() => {
            setOpenShareModal(false);
            setShareFile(null);
          }}
          doRefresh={() => {
            setFileList([]);
            setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch);
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
            <img src={logo} width="60" height="60" alt="Opacity" className="navbar-brand-image" />
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
        <div className="container-fluid collapse navbar-collapse" id="navbar-menu" style={{ position: "relative" }}>
          <h1 className="navbar-brand navbar-brand-autodark cursor-point" onClick={() => history.push("/")}>
            <Link to="/">
              <img src={logo} width="60" height="60" alt="Opacity" className="navbar-brand-image" />
            </Link>
            Opacity <span>v2.0.0</span>
          </h1>
          <div className="account-info">
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
            {!!lastFour && (
              <div>
                <Button
                  variant="default"
                  className="account-button"
                  onClick={() => {
                    navigator.clipboard.writeText(localStorage.getItem("key"));
                    toast.info("Copied to Clipboard", {
                      autoClose: 1500,
                      position: toast.POSITION.TOP_CENTER,
                    });
                  }}
                >
                  <span>Account</span>
                  <span className="ml-3">...{lastFour}</span>
                  <img src={copy} className="copy-icon" />
                </Button>
              </div>
            )}

            <ProgressBar
              now={accountInfo ? (100 * accountInfo.account.storageUsed) / accountInfo.account.storageLimit : 0}
              variant={storageWarning && "danger"}
              className={storageWarning && "danger"}
            />

            <div className="storage-info mb-0">
              <span>{formatGbs(accountInfo ? accountInfo.account.storageUsed : 0)} </span> of{" "}
              {formatGbs(accountInfo ? accountInfo.account.storageLimit : "...")} used
            </div>

            <div className="storage-info">
              {`Your plan expires on ${accountInfo ? formatDate(new Date(accountInfo.account.expirationDate), "MMM d, yyyy") : "..."}.`}
            </div>

            {upgradeAvailable && (
              <div className="upgrade text-right" onClick={() => history.push("/plans")}>
                GET MORE SPACE
              </div>
            )}
          </div>
          <div style={{ width: "100%" }}>
            <ul className="navbar-nav">
              <UploadForm
                isAccountExpired={isAccountExpired}
                isDirectory={true}
                onSelected={selectFiles}
                showWarningModal={() => setShowWarningModal(true)}
              >
                <li className="nav-item">
                  <span className="nav-icon nav-icon-folder"></span>
                  <Nav.Link>UPLOAD FOLDER</Nav.Link>
                </li>
              </UploadForm>
              <UploadForm
                isAccountExpired={isAccountExpired}
                isDirectory={false}
                onSelected={selectFiles}
                showWarningModal={() => setShowWarningModal(true)}
              >
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
                      <div key={key} className={props.isOpen ? "opened" : ""} onClick={() => handleSelectFolder(props)}>
                        <ItemComponent key={key} {...props} />
                      </div>
                    ))}
                  </ul>
                )}
              </TreeMenu>
            </div>
            <div className="download-section">
              <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={renderMacTooltip}>
                <Button variant="primary" className="position-mac" href={OPACITY_DRIVE_FOR_MAC}>
                  <span className="item-icon file-download mac-item"></span>
                  <span>Get Opacity Drive (MacOS)</span>
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={renderWinTooltip}>
                <Button variant="primary" className="position-window" href={OPACITY_DRIVE_FOR_WINDOWS}>
                  <span className="item-icon file-download"></span>
                  <span>Get Opacity Drive (Windows)</span>
                </Button>
              </OverlayTrigger>
            </div>
          </div>
          <div className="side-bar-footer">
            <div>@Opacity v2.0.0</div>
            <div>
              <a href="/privacy-policy" target="_blank">
                <span className="text-white">Privacy Policy</span>
              </a>{" "}
              and{" "}
              <a href="/terms-of-service" target="_blank">
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
            <UploadForm
              isAccountExpired={isAccountExpired}
              isDirectory={false}
              onSelected={selectFiles}
              showWarningModal={() => setShowWarningModal(true)}
            >
              <div className="d-flex header-item">
                <span className="item-icon file-upload"></span>
                <span>FILE UPLOAD</span>
              </div>
            </UploadForm>
            <div className=" d-flex header-item ml-3" onClick={() => !isAccountExpired && setShowNewFolderModal(true)}>
              <span className="item-icon new-folder"></span>
              <span>NEW FOLDER</span>
            </div>
            <div className="d-flex header-item ml-3">
              <NavLink className="custom-nav-icon" href="https://help.opacity.io/" target="__blank">
                <div className="item-icon help-center d-flex align-items-center justify-content-center mr-1">?</div>
                <span>HELP CENTER</span>
              </NavLink>
            </div>
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
              <div className=" d-flex header-item ml-3" onClick={() => handleMultiDownload()}>
                <span className="item-icon file-download"></span>
                <span className="item-text">DOWNLOAD</span>
              </div>
              <div className=" d-flex header-item ml-3" onClick={() => handleMultiDelete()}>
                <span className="item-icon file-delete"></span>
                <span className="item-text">DELETE</span>
              </div>
              <div className=" d-flex header-item ml-3" onClick={() => setSelectedFiles([])}>
                <span className="item-icon file-cancel"></span>
                <span className="item-text">CANCEL</span>
              </div>
            </div>
          </div>
        )}
        <Alert variant="danger" show={alertShow} onClose={() => setAlertShow(false)} className="limit-alert">
          {alertText}
          <Alert.Link
            onClick={() => {
              if (alertLink === "plans") {
                history.push("/plans");
              } else {
                setShowSignUpModal(true);
              }
            }}
          >
            {alertLinkText}
          </Alert.Link>
        </Alert>
        <div className="container-xl" style={{ paddingTop: alertShow === true ? "0px" : undefined }}>
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
          <div className="searchbox-container">
              <Form.Control
                className="searchbox-input"
                placeholder="Search folder and files"
                onChange={(e) => FilterbyName(e.target.value)}
              />
            </div>
          {fileList.length === 0 && folderList.length === 0 && (
            <div className="empty-list">
              <img src={empty} />
              <h4>This folder is empty</h4>
              <span>Upload files or folder by clicking the upload button, or drag & drop from your device.</span>
            </div>
          )}
          {(fileList.length > 0 || folderList.length > 0) && (
            <div>
              {!tableView && (
                <div className="d-flex header-item header-item-absolute list-view ml-3 justify-content-end position-absolute left-0 right-0">
                  <span
                    className="item-icon table-view"
                    onClick={() => {
                      setTableView(true);
                    }}
                  ></span>
                </div>
              )}

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
                          handleDeleteBrokenFolder={handleDeleteBrokenFolder}
                          setCurrentPath={setCurrentPath}
                          handlePasteFilePath={handlePasteFilePath}
                          isAccountExpired={isAccountExpired}
                          isFilechoosed={isFilechoosed}
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
                          handleDeleteBrokenFile={handleDeleteBrokenFile}
                          handleMoveFile={handleMoveFile}
                          downloadItem={async (f) => {
                            await fileDownload(f, false);
                            OnfinishFileManaging();
                          }}
                          handleSelectFile={handleSelectFile}
                          selectedFiles={selectedFiles}
                          isAccountExpired={isAccountExpired}
                        />
                      )
                  )}
                </div>
              )}

              {tableView && (
                <Table highlightRowOnHover hasOutline verticalAlign="center" className="text-nowrap">
                  <Table.Header>
                    <tr className="file-table-header">
                      <th
                        onClick={() =>
                          handleSortTable("name", sortable.column === "name" ? (sortable.method === "down" ? "up" : "down") : "down")
                        }
                        className={`sortable ${
                          sortable.column === "name" && (sortable.method === "up" ? "asc" : "desc")
                        } flex items-center`}
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          onClick={onSelectAll}
                          checked={!!selectedFiles.length}
                          disabled={!fileList.length}
                          onChange={(e) => null}
                        />
                        Name
                      </th>
                      {!isMobile && (
                        <th
                          onClick={() =>
                            handleSortTable("type", sortable.column === "type" ? (sortable.method === "down" ? "up" : "down") : "down")
                          }
                          className={`sortable type ${sortable.column === "type" && (sortable.method === "up" ? "asc" : "desc")}`}
                        >
                          Share Type
                          <Tooltip
                            content="'Type' lets you know if your files are private or if you have chosen to create a public link. A public file is not encrypted. You can choose to remove the public file sharing from the file menu on the right for highest privacy and security."
                            placement="bottom"
                          >
                            <Tag>
                              <span className="badge-content">?</span>
                            </Tag>
                          </Tooltip>
                        </th>
                      )}
                      {!isMobile && (
                        <th
                          onClick={() =>
                            handleSortTable(
                              "created",
                              sortable.column === "created" ? (sortable.method === "down" ? "up" : "down") : "down"
                            )
                          }
                          className={`sortable ${sortable.column === "created" && (sortable.method === "up" ? "asc" : "desc")}`}
                        >
                          Created
                        </th>
                      )}
                      <th
                        onClick={() =>
                          handleSortTable("size", sortable.column === "size" ? (sortable.method === "down" ? "up" : "down") : "down")
                        }
                        className={`sortable ${sortable.column === "size" && (sortable.method === "up" ? "asc" : "desc")}`}
                      >
                        Size
                      </th>
                      <th className="pt-0 pb-0">
                        <div className="d-flex header-item">
                          <span
                            className="item-icon grid-view"
                            onClick={() => {
                              setTableView(false);
                            }}
                          ></span>
                        </div>
                      </th>
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
                            handleDeleteBrokenFolder={handleDeleteBrokenFolder}
                            setCurrentPath={setCurrentPath}
                            handlePasteFilePath={handlePasteFilePath}
                            isAccountExpired={isAccountExpired}
                            isFilechoosed={isFilechoosed}
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
                            handleDeleteBrokenFile={handleDeleteBrokenFile}
                            handleMoveFile={handleMoveFile}
                            handleOpenRenameModal={handleOpenRenameModal}
                            downloadItem={async (f) => {
                              await fileDownload(f);
                              OnfinishFileManaging();
                            }}
                            handleSelectFile={handleSelectFile}
                            selectedFiles={selectedFiles}
                            isAccountExpired={isAccountExpired}
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
          isFile={!!fileToRename}
        />
      )}
      <DeleteModal show={showDeleteModal} handleClose={() => setShowDeleteModal(false)} setDelete={() => handleDelete()} />
      <WarningModal show={showWarningModal} handleClose={() => setShowWarningModal(false)} />
      <AddNewFolderModal show={showNewFolderModal} handleClose={() => setShowNewFolderModal(false)} addNewFolder={addNewFolder} />
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
            fileUploadingList = [];
            setUploadingList([]);
            setProcessChange({});
          }}
          notifications={uploadingList}
          uploadFinish={() => setUpdateCurrentFolderSwitch(!updateCurrentFolderSwitch)}
          onCancel={handleCancelUpload}
          onCancelAll={handleCancelAllUpload}
        />
      )}
    </div>
  );
};

const UploadForm = ({ children, onSelected, isDirectory, showWarningModal, isAccountExpired }) => {
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
          disabled={isAccountExpired}
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