import moment from "moment"
import * as React from "react"
import { Dropdown, DropdownButton } from "react-bootstrap"
import { Table } from "tabler-react"
import { useIntersectionObserver } from "@researchgate/react-intersection-observer"
import { AccountSystem, FileMetadata, FolderFileEntry, FoldersIndexEntry } from "../../../ts-client-library/packages/account-system"
import { formatBytes } from "../../helpers"
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useMediaQuery } from 'react-responsive'
import { arraysEqual } from "../../../ts-client-library/packages/util/src/arrayEquality"

const typeList = {
	"text/plain": 'document',
	"application/x-zip-compressed": 'compressed',
	'application/zip': 'compressed',
	'application/x-tar': 'compressed',
	'application/vnd.rar': 'compressed',
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

const getFileExtension = (name) => {
	const lastDot = name.lastIndexOf('.');

	const ext = name.substring(lastDot + 1);
	return ext
}

export type FileManagerFileEntryProps = {
	accountSystem: AccountSystem
	fileEntry: FolderFileEntry
	fileShare: (f: FolderFileEntry) => Promise<void>
	filePublicShare: (f: FolderFileEntry) => Promise<void>
	handleDeleteItem: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
	handleOpenRenameModal: (f: FolderFileEntry | FoldersIndexEntry, isFile: boolean) => void
	downloadItem: (f: FileMetadata) => Promise<void>
	handleSelectFile: Function
	selectedFiles?: FileMetadata[]
}

export const FileManagerFileEntryGrid = ({
	accountSystem,
	fileEntry,
	fileShare,
	filePublicShare,
	downloadItem,
	handleDeleteItem,
	handleOpenRenameModal,
	handleSelectFile,
	selectedFiles
}: FileManagerFileEntryProps) => {
	const [fileMeta, setFileMeta] = React.useState<FileMetadata>()
	const [isSelected, setSelected] = React.useState(false);

	const [ref, unobserve] = useIntersectionObserver(() => {
		if (fileEntry) {
			unobserve()
			setTimeout(() => {
				accountSystem._getFileMetadata(fileEntry.location).then((f) => {
					setFileMeta(f)
				})
			}, 100)
		}
	})

	React.useEffect(() => {
		if (fileMeta) {
			if (selectedFiles.filter(ele => arraysEqual(ele.location, fileMeta.location)).length > 0) {
				setSelected(true)
			} else {
				setSelected(false)
			}
		}

	}, [selectedFiles])

	return (
		<div className='grid-item'>
			<div
				className={`items ${isSelected && 'grid-item-selected'}`}
				onClick={() => fileMeta && handleSelectFile(fileMeta)}
			>
				{/* <i className={`icon-${fileMeta && typeList[fileMeta.type]}`}></i> */}
				<div style={{ width: '40px' }}>
					<FileIcon
						color="#A8A8A8"
						glyphColor="#ffffff"
						{...defaultStyles[fileMeta && getFileExtension(fileMeta.name)]}
						extension={fileMeta && getFileExtension(fileMeta.name)}
					/>
				</div>
				<h3 className='file-name'>{fileEntry.name}</h3>
				<div className='file-info' ref={ref}>{fileMeta ? formatBytes(fileMeta.size) : "..."}</div>
			</div>
			{
				isSelected &&
				<div className='grid-selected-icon'>
				</div>
			}
			<div className="grid-context-menu-area">
				<DropdownButton menuAlign='right' title='' id='grid-dropdown-menu-align-right' className="grid-context-menu-toggle">
					<Dropdown.Item disabled={!fileMeta || !fileMeta.private.handle} eventKey='1' onClick={() => fileShare(fileMeta)}>
						<i className='icon-share'></i>
						Private Share
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item disabled={!fileMeta || (!fileMeta.private.handle && (!fileMeta.public.location || !fileMeta.public.shortLinks.length))} eventKey='1' onClick={() => filePublicShare(fileMeta)}>
						<i className='icon-link'></i>
						Public Share
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
			</div>
		</div>
	)
}

export const FileManagerFileEntryList = ({
	accountSystem,
	fileEntry,
	fileShare,
	filePublicShare,
	handleDeleteItem,
	handleOpenRenameModal,
	downloadItem,
	handleSelectFile,
	selectedFiles
}: FileManagerFileEntryProps) => {
	const isMobile = useMediaQuery({ maxWidth: 768 })
	const [fileMeta, setFileMeta] = React.useState<FileMetadata>()
	const [isSelected, setSelected] = React.useState(false);
	const [ref, unobserve] = useIntersectionObserver((e) => {
		if (fileEntry && e.isIntersecting) {
			unobserve()
			setTimeout(() => {
				accountSystem._getFileMetadata(fileEntry.location).then((f) => {
					setFileMeta(f)
				})
			}, 100)
		}
	})

	React.useEffect(() => {
		if (fileMeta) {
			if (selectedFiles.filter(ele => arraysEqual(ele.location, fileMeta.location)).length > 0) {
				setSelected(true)
			} else {
				setSelected(false)
			}
		}

	}, [selectedFiles])

	const briefName = (name) => {
		let resName = name;
		if (isMobile && name.length > 10) {
			resName = name.slice(0, 10) + ' ...';
		} else if (name.length > 50) {
			resName = name.slice(0, 50) + ' ...';
		}
		return resName
	}

	const typeCheck = (meta) => {
		if (meta.public.location && meta.public.shortLinks.length > 0) {
			return 'Public'
		}
		if (meta.private.handle) {
			return 'Private'
		} 
		return 'NoLink'
	}

	return (
		<Table.Row className={isSelected ? 'selected' : ''}>
			<Table.Col className='file-name' onClick={() => fileMeta && handleSelectFile(fileMeta)}>
				<div className='d-flex' ref={ref}>
					{/* <i className={`icon-${fileMeta && typeList[fileMeta.type]}`}></i> */}
					<div style={{ width: '18px', marginRight: '40px' }}>
						<FileIcon
							color="#A8A8A8"
							glyphColor="#ffffff"
							{...defaultStyles[fileMeta && getFileExtension(fileMeta.name)]}
							extension={fileMeta && getFileExtension(fileMeta.name)}
						/>
					</div>
					{briefName(fileEntry.name)}
					{fileMeta && !fileMeta.finished && <span style={{ display: "inline-block", background: "rgba(0,0,0,.1)", padding: "4px 6px", borderRadius: 4, marginInline: "1em" }}>Pending</span>}
				</div>
			</Table.Col>
			{ !isMobile && <Table.Col onClick={() => fileMeta && handleSelectFile(fileMeta)}>{fileMeta ? typeCheck(fileMeta) : "..."}</Table.Col>}
			{ !isMobile && <Table.Col onClick={() => fileMeta && handleSelectFile(fileMeta)}>{fileMeta ? moment(fileMeta.uploaded).calendar() : "..."}</Table.Col>}
			<Table.Col onClick={() => fileMeta && handleSelectFile(fileMeta)}>{fileMeta ? formatBytes(fileMeta.size) : "..."}</Table.Col>
			<Table.Col className='text-nowrap'>
				<DropdownButton menuAlign='right' title='' id='dropdown-menu-align-right' className={isSelected ? "file-selected" : ""}>
					<Dropdown.Item disabled={!fileMeta || (!!fileMeta.public.location || !!fileMeta.public.shortLinks.length)} eventKey='1' onClick={() => fileShare(fileMeta)}>
						<i className='icon-share'></i>
						Private Share
					</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item eventKey='1' onClick={() => filePublicShare(fileMeta)}>
						<i className='icon-link'></i>
						Public Share
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
