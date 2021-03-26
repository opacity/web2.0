import moment from "moment"
import * as React from "react"
import { Dropdown, DropdownButton } from "react-bootstrap"
import { Table } from "tabler-react"
import { useIntersectionObserver } from "@researchgate/react-intersection-observer"
import { AccountSystem, FolderFileEntry, FolderMetadata, FoldersIndexEntry } from "../../../ts-client-library/packages/account-system"
import { formatBytes } from "../../helpers"
import { posix } from "path-browserify"

export type FileManagerFolderEntryProps = {
	accountSystem: AccountSystem
	folderEntry: FoldersIndexEntry
	setCurrentPath: (p: string) => void
	handleDeleteItem: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
	handleOpenRenameModal: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
}

export const FileManagerFolderEntryGrid = ({
	accountSystem,
	folderEntry,
	setCurrentPath,
	handleDeleteItem,
	handleOpenRenameModal,
}: FileManagerFolderEntryProps) => {
	const [folderMeta, setFolderMeta] = React.useState<FolderMetadata>()

	const [ref, unobserve] = useIntersectionObserver((e) => {
		if (folderEntry && e.isIntersecting) {
			unobserve()
			accountSystem._getFolderMetadataByLocation(folderEntry.location).then((f) => {
				setFolderMeta(f)
			})
		}
	})

	return (
		<div className='grid-item'>
			<div className='items' onDoubleClick={() => setCurrentPath(folderEntry.path)}>
				<i className='icon-folder'></i>
				<h3 className='file-name'>{posix.basename(folderEntry.path)}</h3>
				<div className='file-info' ref={ref}>{folderMeta ? folderMeta.files.length : "..."} Files</div>
			</div>
		</div>
	)
}

export const FileManagerFolderEntryList = ({
	accountSystem,
	folderEntry,
	setCurrentPath,
	handleDeleteItem,
	handleOpenRenameModal,
}: FileManagerFolderEntryProps) => {
	const [folderMeta, setFolderMeta] = React.useState<FolderMetadata>()

	const [ref, unobserve] = useIntersectionObserver((e) => {
		if (folderEntry && e.isIntersecting) {
			unobserve()
			accountSystem._getFolderMetadataByLocation(folderEntry.location).then((f) => {
				setFolderMeta(f)
			})
		}
	})

	return (
		<Table.Row >
			<Table.Col className='file-name' onDoubleClick={() => setCurrentPath(folderEntry.path)}>
				<div className='d-flex' ref={ref}>
					<i className='icon-folder'></i>
					{posix.basename(folderEntry.path)}
				</div>
			</Table.Col>
			<Table.Col>{folderMeta ? moment(folderMeta.uploaded).calendar() : "..."}</Table.Col>
			{/* <Table.Col>{moment(item.created).format("MM/DD/YYYY")}</Table.Col> */}
			<Table.Col>{folderMeta ? folderMeta.files.length : "..."} items</Table.Col>
			<Table.Col className='text-nowrap'>
				<DropdownButton menuAlign='right' title='' id='dropdown-menu-align-right'>
					{/* <Dropdown.Item eventKey='1'>
						<i className='icon-share'></i>
						Share
					</Dropdown.Item>
					<Dropdown.Divider /> */}
					{/* <Dropdown.Item eventKey='2'>
						<i className='icon-download'></i>
						Download
					</Dropdown.Item>
					<Dropdown.Divider /> */}
					<Dropdown.Item eventKey='3' onClick={() => handleDeleteItem(folderEntry, false)}>
						<i className='icon-delete'></i>
						Delete
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item eventKey='4' onClick={() => handleOpenRenameModal(Object.assign(folderEntry, { name: posix.basename(folderEntry.path) }), false)}>
						<i className='icon-rename'></i>
						Rename
					</Dropdown.Item>
				</DropdownButton>
			</Table.Col>
		</Table.Row>
	)
}
