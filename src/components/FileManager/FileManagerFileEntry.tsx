import * as moment from "moment"
import * as React from "react"
import { Dropdown, DropdownButton } from "react-bootstrap"
import { Table } from "tabler-react"
import { AccountSystem, FileMetadata, FolderFileEntry, FoldersIndexEntry } from "../../../ts-client-library/packages/account-system"
import { formatBytes } from "../../helpers"

export type FileManagerFileEntryProps = {
	key: React.Key
	accountSystem: AccountSystem
	fileEntry: FolderFileEntry
	fileShare: (f: FolderFileEntry) => Promise<void>
	handleDeleteItem: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
	handleOpenRenameModal: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
}

export const FileManagerFileEntry = ({
	key,
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
		<Table.Row key={key}>
			<Table.Col className='file-name'>
				<div className='d-flex'>
					<i className={`icon-${fileMeta && fileMeta.type}`}></i>
					{fileEntry.name}
				</div>
			</Table.Col>
			<Table.Col>{fileMeta ? moment(fileMeta.uploaded).calendar() : "..."}</Table.Col>
			<Table.Col>{fileMeta ? formatBytes(fileMeta.size) : "..."}</Table.Col>
			<Table.Col className='text-nowrap'>
				<DropdownButton menuAlign='right' title='' id='dropdown-menu-align-right'>
					<Dropdown.Item eventKey='1' onClick={() => fileShare(fileMeta)}>
						<i className='icon-share'></i>
						Share
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item eventKey='2'>
						<i className='icon-download'></i>
						Download
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item eventKey='3' onClick={() => handleDeleteItem(fileMeta, true)}>
						<i className='icon-delete'></i>
						Delete
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item eventKey='4' onClick={() => handleOpenRenameModal(fileMeta, true)}>
						<i className='icon-rename'></i>
						Rename
					</Dropdown.Item>
				</DropdownButton>
			</Table.Col>
		</Table.Row>
	)
}
