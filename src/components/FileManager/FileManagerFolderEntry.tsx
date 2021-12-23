import moment from "moment";
import * as React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { Table } from "tabler-react";
import { useIntersectionObserver } from "@researchgate/react-intersection-observer";
import { AccountSystem, FolderFileEntry, FolderMetadata, FoldersIndexEntry } from "../../../ts-client-library/packages/account-system";
import { posix } from "path-browserify";
import { FileIcon } from "react-file-icon";
import { useMediaQuery } from "react-responsive";
import BrokenBadgeOnEntry from "./BrokenBadgeOnEntry";

export type FileManagerFolderEntryProps = {
  accountSystem: AccountSystem;
  folderEntry: FoldersIndexEntry;
  setCurrentPath: (p: string) => void;
  handleDeleteItem: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void;
  handleOpenRenameModal: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void;
  handlePasteFilePath: (p: string) => void;
  handleDeleteBrokenFolder: (location: Uint8Array) => void;
  isAccountExpired?: boolean;
  isFilechoosed?: boolean;
};

export const FileManagerFolderEntryGrid = ({
  accountSystem,
  folderEntry,
  setCurrentPath,
  handleDeleteItem,
  handleOpenRenameModal,
  handlePasteFilePath,
  handleDeleteBrokenFolder,
  isAccountExpired,
  isFilechoosed,
}: FileManagerFolderEntryProps) => {
  const [folderMeta, setFolderMeta] = React.useState<FolderMetadata>();
  const [isBroken, setIsBroken] = React.useState(false);

  const [ref, unobserve] = useIntersectionObserver((e) => {
    if (folderEntry && e.isIntersecting) {
      unobserve();
      setTimeout(() => {
        accountSystem
          ._getFolderMetadataByLocation(folderEntry.location)
          .then((f) => {
            setFolderMeta(f);
          })
          .catch(() => {
            setIsBroken(true);
          });
      }, 100);
    }
  });

  const deleteBrokenItem = (folderLocation) => {
    handleDeleteBrokenFolder(folderLocation);
  };

  return (
    <div className="grid-item">
      <div className="items" onClick={() => !isBroken && folderMeta && setCurrentPath(folderEntry.path)}>
        <div style={{ width: "40px" }}>
          <FileIcon color="#8A8A8A" labelColor="#A8A8A8" fold={false} extension="folder" />
        </div>
        <h3 className="file-name">{posix.basename(folderEntry.path)}</h3>
        <div className="file-info" ref={ref}>
          {folderMeta ? folderMeta.files.length : "..."} Files
        </div>
      </div>
      <div className="grid-context-menu-area">
        <DropdownButton menuAlign="right" title="" id="dropdown-menu-align-right">
          <Dropdown.Item
            eventKey="3"
            onClick={() => handleDeleteItem(folderEntry, false)}
            disabled={!folderMeta || isAccountExpired || !folderMeta.location}
          >
            <i className="icon-delete"></i>
            Delete
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            disabled={!folderMeta || isAccountExpired || !folderMeta.location}
            eventKey="4"
            onClick={() =>
              handleOpenRenameModal(
                Object.assign(folderEntry, {
                  name: posix.basename(folderEntry.path),
                }),
                false
              )
            }
          >
            <i className="icon-rename"></i>
            Rename
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item disabled={isFilechoosed} eventKey="6" onClick={() => handlePasteFilePath(folderEntry.path)}>
            <i className="icon-paste"></i>
            Paste
          </Dropdown.Item>
          {isBroken && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item eventKey="5" onClick={() => deleteBrokenItem(folderEntry.location)} style={{ color: "red" }}>
                <i className="icon-delete"></i>
                Delete Broken Folder
              </Dropdown.Item>
            </>
          )}
        </DropdownButton>
      </div>
    </div>
  );
};

export const FileManagerFolderEntryList = ({
  accountSystem,
  folderEntry,
  setCurrentPath,
  handleDeleteItem,
  handleOpenRenameModal,
  handlePasteFilePath,
  handleDeleteBrokenFolder,
  isAccountExpired,
  isFilechoosed,
}: FileManagerFolderEntryProps) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [folderMeta, setFolderMeta] = React.useState<FolderMetadata>();
  const [isBroken, setIsBroken] = React.useState(false);

  const [ref, unobserve] = useIntersectionObserver((e) => {
    if (folderEntry && e.isIntersecting) {
      unobserve();
      setTimeout(() => {
        accountSystem
          ._getFolderMetadataByLocation(folderEntry.location)
          .then((f) => {
            setFolderMeta(f);
          })
          .catch(() => {
            setIsBroken(true);
          });
      }, 100);
    }
  });

  const briefFolderName = (folderName) => {
    let resName = folderName;
    if (isMobile && folderName.length > 10) {
      resName = folderName.slice(0, 10) + " ...";
    }
    return resName;
  };

  const deleteBrokenItem = (folderLocation) => {
    handleDeleteBrokenFolder(folderLocation);
  };

  return (
    <Table.Row>
      <Table.Col className="file-name" onClick={() => !isBroken && folderMeta && setCurrentPath(folderEntry.path)}>
        <div className="d-flex" ref={ref}>
          <i className="icon-folder"></i>
          {briefFolderName(posix.basename(folderEntry.path))}
          {isBroken && <BrokenBadgeOnEntry />}
        </div>
      </Table.Col>
      {!isMobile && <Table.Col> </Table.Col>}
      {!isMobile && <Table.Col>{folderMeta ? moment(folderMeta.uploaded).calendar() : "..."}</Table.Col>}
      <Table.Col>{folderMeta ? folderMeta.files.length : "..."} items</Table.Col>
      <Table.Col className="text-nowrap">
        <DropdownButton menuAlign="right" title="" id="dropdown-menu-align-right">
          <Dropdown.Item
            eventKey="3"
            onClick={() => handleDeleteItem(folderEntry, false)}
            disabled={!folderMeta || isAccountExpired || !folderMeta.location}
          >
            <i className="icon-delete"></i>
            Delete
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            disabled={!folderMeta || isAccountExpired || !folderMeta.location}
            eventKey="4"
            onClick={() =>
              handleOpenRenameModal(
                Object.assign(folderEntry, {
                  name: posix.basename(folderEntry.path),
                }),
                false
              )
            }
          >
            <i className="icon-rename"></i>
            Rename
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item disabled={isFilechoosed} eventKey="6" onClick={() => handlePasteFilePath(folderEntry.path)}>
            <i className="icon-paste"></i>
            Paste
          </Dropdown.Item>
          {isBroken && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item eventKey="5" onClick={() => deleteBrokenItem(folderEntry.location)} style={{ color: "red" }}>
                <i className="icon-delete"></i>
                Delete Broken Folder
              </Dropdown.Item>
            </>
          )}
        </DropdownButton>
      </Table.Col>
    </Table.Row>
  );
};
