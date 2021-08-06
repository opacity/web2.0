import * as React from "react";
import { Table } from "tabler-react";


export const FileManagerFolderEntryList = ({
  folderEntry,
  currentPath,
  setCurrentPath,
}) => {
  const { name } = folderEntry;

  return (
    <Table.Row>
      <Table.Col
        className="file-name"
        onClick={() => setCurrentPath(`${currentPath === "/" ? "" : currentPath}/${name}`)}
      >
        <div className="d-flex">
          <i className="icon-folder"></i>
          {name}
        </div>
      </Table.Col>
      <Table.Col> </Table.Col>

      <Table.Col>
      </Table.Col>

      <Table.Col>
      </Table.Col>
    </Table.Row>
  );
};
