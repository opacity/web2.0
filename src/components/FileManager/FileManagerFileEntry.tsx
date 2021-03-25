import moment from "moment"
import * as React from "react"
import { Dropdown, DropdownButton } from "react-bootstrap"
import { Table } from "tabler-react"
import { AccountSystem, FileMetadata, FolderFileEntry, FoldersIndexEntry } from "../../../ts-client-library/packages/account-system"
import { formatBytes } from "../../helpers"
const typeList = {
	"text/plain": 'document',
	"application/x-zip-compressed": 'zip',
	'application/zip': 'zip',
	'application/x-tar': 'zip',
	'application/vnd.rar': 'zip',
	"image/png": 'image',
	'video/mp4': 'video',
	'video/mpeg': 'video',
	'video/ogg': 'video',
	'video/mp2t': 'video',
	'video/webm': 'video',
	'video/3gpp': 'video',
	'video/3gpp2': 'video',
	'video/x-msvideo': 'video',
	'image/bmp': 'image',
	'image/gif': 'image',
	'image/vnd.microsoft.icon': 'image',
	'image/jpeg': 'image',
	'image/svg+xml': 'image',
	'image/tiff': 'image',
	'image/webp': 'image',
}
export type FileManagerFileEntryProps = {
	accountSystem: AccountSystem
	fileEntry: FolderFileEntry
	fileShare: (f: FolderFileEntry) => Promise<void>
	handleDeleteItem: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
	handleOpenRenameModal: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
	downloadItem: (f: FileMetadata) => Promise<void>
}

export const FileManagerFileEntryGrid = ({
	accountSystem,
	fileEntry,
	fileShare,
	handleDeleteItem,
	handleOpenRenameModal,
}: FileManagerFileEntryProps) => {
	const [fileMeta, setFileMeta] = React.useState<FileMetadata>()

	React.useEffect(() => {
		if (fileEntry) {
			accountSystem._getFileMetadata(fileEntry.location).then((f) => {
				setFileMeta(f)
			})
		}
	}, [fileEntry])

	return (
		<div className='grid-item' >
			<div className='items'>
				<i className={`icon-${fileMeta && typeList[fileMeta.type]}`}></i>
				<h3 className='file-name'>{fileEntry.name}</h3>
				<div className='file-info'>{fileMeta ? formatBytes(fileMeta.size) : "..."}</div>
			</div>
		</div>
	)
}

export const FileManagerFileEntryList = ({
	accountSystem,
	fileEntry,
	fileShare,
	handleDeleteItem,
	handleOpenRenameModal,
	downloadItem,
}: FileManagerFileEntryProps) => {
	const [fileMeta, setFileMeta] = React.useState<FileMetadata>()

	React.useEffect(() => {
		if (fileEntry) {
			accountSystem._getFileMetadata(fileEntry.location).then((f) => {
				setFileMeta(f)
			})
		}
	}, [fileEntry])

	return (
		<Table.Row>
			<Table.Col className='file-name'>
				<div className='d-flex'>
					<i className={`icon-${fileMeta && typeList[fileMeta.type]}`}></i>
					{fileEntry.name}
				</div>
			</Table.Col>
			<Table.Col>{fileMeta ? moment(fileMeta.uploaded).calendar() : "..."}</Table.Col>
			<Table.Col>{fileMeta ? formatBytes(fileMeta.size) : "..."}</Table.Col>
			<Table.Col className='text-nowrap'>
				<DropdownButton menuAlign='right' title='' id='dropdown-menu-align-right'>
					<Dropdown.Item disabled={!fileMeta} eventKey='1' onClick={() => fileShare(fileMeta)}>
						<i className='icon-share'></i>
						Share
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item disabled={!fileMeta} eventKey='2' onClick={() => downloadItem(fileMeta)}>
						<i className='icon-download'></i>
						Download
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item disabled={!fileMeta} eventKey='3' onClick={() => handleDeleteItem(fileMeta, true)}>
						<i className='icon-delete'></i>
						Delete
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item disabled={!fileMeta} eventKey='4' onClick={() => handleOpenRenameModal(fileMeta, true)}>
						<i className='icon-rename'></i>
						Rename
					</Dropdown.Item>
				</DropdownButton>
			</Table.Col>
		</Table.Row>
	)
}
