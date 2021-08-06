import * as React from "react"
import { Dropdown, DropdownButton } from "react-bootstrap"
import { Table } from "tabler-react"
import { FileIcon, defaultStyles } from 'react-file-icon';
import moment from "moment"
import { formatBytes } from "../../helpers";


const getFileExtension = (name) => {
  const lastDot = name.lastIndexOf('.');

  const ext = name.substring(lastDot + 1);
  return ext
}


export const FileManagerFileEntryList = ({
  fileEntry,
  downloadFile,
}) => {
  const { name, created } = fileEntry;

  const briefName = (name) => {
    let resName = name;
    if (name.length > 150) {
      resName = name.slice(0, 150) + ' ...';
    }
    return resName
  }

  return (
    <Table.Row>
      <Table.Col className='file-name'>
        <div className='d-flex'>
          <div style={{ width: '18px', marginRight: '40px' }}>
            <FileIcon
              color="#A8A8A8"
              glyphColor="#ffffff"
              {...defaultStyles[getFileExtension(name)]}
              extension={getFileExtension(name)}
            />
          </div>
          {briefName(name)}
        </div>
      </Table.Col>
      <Table.Col>{moment(created).format("MM/DD/YYYY")}</Table.Col>
      <Table.Col>{formatBytes(fileEntry.versions[0].size)}</Table.Col>
      <Table.Col className="text-nowrap">
        <DropdownButton
          menuAlign="right"
          title=""
          id="dropdown-menu-align-right"
        >
          <Dropdown.Item
            eventKey="1"
            onClick={() => downloadFile(fileEntry.versions[0].handle)}
          >
            <i className="icon-download"></i>
            Donwload
          </Dropdown.Item>
        </DropdownButton>
      </Table.Col>
    </Table.Row>
  )
}
