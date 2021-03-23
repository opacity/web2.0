import { posix } from "path-browserify"
import Automerge from "automerge/src/automerge"

import { arraysEqual } from "@opacity/util/src/arrayEquality"
import { bytesToB64 } from "@opacity/util/src/b64"
import { bytesToHex } from "@opacity/util/src/hex"
import { cleanPath, isPathChild } from "@opacity/util/src/path"
import { entropyToKey } from "@opacity/util/src/mnemonic"
import { MetadataAccess } from "./MetadataAccess"

export type FilesIndexEntry = {
	location: Uint8Array
	finished: boolean
	public: boolean
	handle: Uint8Array
	deleted: boolean
}

export type FilesIndex = { files: FilesIndexEntry[] }

export type FileCreationMetadata = {
	size: number
	lastModified: number
	type: string
}

export type FileMetadata = {
	location: Uint8Array
	handle: Uint8Array
	name: string
	path: string
	folderDerive: Uint8Array
	size: number
	uploaded: number
	modified: number
	type: string
	finished: boolean
	public: boolean
}

export type FoldersIndexEntry = {
	location: Uint8Array
	path: string
}

export type FoldersIndex = { folders: FoldersIndexEntry[] }

export type FolderFileEntry = {
	location: Uint8Array
	name: string
}

export type FolderMetadata = {
	location: Uint8Array
	name: string
	path: string
	size: number
	uploaded: number
	modified: number
	files: FolderFileEntry[]
}

export type ShareIndexEntry = {
	locationKey: Uint8Array
	encryptionKey: Uint8Array
}

export type ShareIndex = { shared: ShareIndexEntry[] }

export type ShareFileMetadataInit = {
	/**
	 * Metadata location.
	 * Used to pull in file metadata
	 */
	location: Uint8Array
	/**
	 * Path within the shared structure
	 */
	path: string
}

export type ShareFileMetadata = {
	handle: Uint8Array
	name: string
	path: string
	size: number
	uploaded: number
	modified: number
	type: string
	finished: boolean
	public: boolean
}

export type ShareMetadata = {
	locationKey: Uint8Array
	encryptionKey: Uint8Array
	dateShared: number
	files: ShareFileMetadata[]
}

export class AccountSystemLengthError extends Error {
	constructor (item: string, min: number, max: number, recieved: number) {
		super(`AccountSystemLengthError: Invalid length of "${item}". Expected between ${min} and ${max}. Got ${recieved}`)
	}
}

export class AccountSystemAlreadyExistsError extends Error {
	constructor (type: string, path: string) {
		super(`AccountSystemAlreadyExistsError: ${type} "${path}" already exists`)
	}
}

export class AccountSystemSanitizationError extends Error {
	constructor (type: string, path: string, illegal: string[]) {
		super(
			`AccountSystemSanitizationError: ${type} "${path}" includes illegal characters "${illegal
				.map((s) => `"${s}"`)
				.join(", ")}"`,
		)
	}
}

export class AccountSystemNotFoundError extends Error {
	constructor (type: string, path: string) {
		super(`AccountSystemNotFoundError: ${type} "${path}" not found`)
	}
}

export class AccountSystemNotEmptyError extends Error {
	constructor (type: string, path: string, action: string) {
		super(`AccountSystemNotEmptyError: ${type} "${path}" must be empty to ${action}`)
	}
}

const validateFilename = (name: string) => {
	// https://serverfault.com/questions/9546/filename-length-limits-on-linux
	if (name.length < 1 || name.length > 255) {
		throw new AccountSystemLengthError(`filename ("${name}")`, 1, 255, name.length)
	}

	//https://stackoverflow.com/questions/457994/what-characters-should-be-restricted-from-a-unix-file-name
	if (name.includes(posix.sep) || name.includes("\0")) {
		throw new AccountSystemSanitizationError("file", name, [posix.sep, "\0"])
	}
}

const validateDirectoryPath = (path: string) => {
	if (path == "/") {
		return
	}

	for (let dir of path.split(posix.sep).slice(1)) {
		try {
			validateFilename(dir)
		} catch (err) {
			if (err instanceof AccountSystemLengthError) {
				throw new AccountSystemLengthError(`directory ("${dir}" of "${path}")`, 1, 255, dir.length)
			}
			else if (err instanceof AccountSystemSanitizationError) {
				throw new AccountSystemSanitizationError("directory", dir, [posix.sep, "\0"])
			}
			else {
				throw err
			}
		}
	}
}

const unfreezeUint8Array = (arr: Automerge.FreezeObject<Uint8Array>) => {
	return new Uint8Array(Object.values<number>(arr))
}

export type AccountSystemConfig = {
	metadataAccess: MetadataAccess
}

export class AccountSystem {
	config: AccountSystemConfig

	guid = "5b7c0640-bc3a-4fa8-b588-ca6a922c1475"
	version = 2
	prefix = "/" + this.guid + "/v" + this.version

	indexes = {
		// preferences: this.prefix + "/preferences",
		files: this.prefix + "/files",
		folders: this.prefix + "/folders",
		// tags: this.prefix + "/tags",
		share: this.prefix + "/share",
	}

	constructor (config: AccountSystemConfig) {
		this.config = config
	}

	///////////////////////////////
	///////// Preferences /////////
	///////////////////////////////

	///////////////////////////////
	//////////// Files ////////////
	///////////////////////////////

	getFileDerivePath (location: Uint8Array): string {
		return this.prefix + "/file/" + bytesToB64(location)
	}

	async getFilesIndex (): Promise<FilesIndex> {
		const filesIndex =
			(await this.config.metadataAccess.get<FilesIndex>(this.indexes.files)) ||
			Automerge.from<FilesIndex>({ files: [] })

		// TODO: find orphans

		return {
			files: filesIndex.files.map((file) => ({
				location: unfreezeUint8Array(file.location),
				finished: !!file.finished,
				public: !!file.public,
				handle: unfreezeUint8Array(file.handle),
				deleted: !!file.deleted,
			})),
		}
	}

	async getFileLocationByHandle (handle: Uint8Array): Promise<Uint8Array> {
		const filesIndex = await this.getFilesIndex()

		const fileEntry = filesIndex.files.find((file) => arraysEqual(file.handle, handle))

		if (!fileEntry) {
			throw new AccountSystemNotFoundError("file of handle", bytesToHex(handle.slice(0, 32)) + "...")
		}

		return fileEntry.location
	}

	async getFileIndexEntryByLocation (location: Uint8Array): Promise<FilesIndexEntry> {
		const filesIndex = await this.getFilesIndex()
		const fileEntry = filesIndex.files.find((file) => arraysEqual(file.location, location))

		if (!fileEntry) {
			// TODO: orphan?
			throw new AccountSystemNotFoundError("file", bytesToB64(location))
		}

		return {
			location: fileEntry.location,
			finished: !!fileEntry.finished,
			public: !!fileEntry.public,
			handle: fileEntry.handle,
			deleted: !!fileEntry.deleted,
		}
	}

	async getFileMetadata (location: Uint8Array): Promise<FileMetadata> {
		const filePath = this.getFileDerivePath(location)

		const doc = await this.config.metadataAccess.get<FileMetadata>(filePath)

		if (!doc) {
			throw new AccountSystemNotFoundError("file", filePath)
		}

		return {
			location: unfreezeUint8Array(doc.location),
			handle: unfreezeUint8Array(doc.handle),
			name: doc.name,
			path: doc.path,
			folderDerive: unfreezeUint8Array(doc.folderDerive),
			size: doc.size,
			uploaded: doc.uploaded,
			modified: doc.modified,
			type: doc.type,
			finished: !!doc.finished,
			public: !!doc.public,
		}
	}

	async addUpload (
		handle: Uint8Array,
		path: string,
		filename: string,
		meta: FileCreationMetadata,
		pub: boolean,
	): Promise<FileMetadata> {
		path = cleanPath(path)
		validateDirectoryPath(path)
		validateFilename(filename)

		const folder = await this.addFolder(path)
		const folderDerive = folder.location

		const location = await this.config.metadataAccess.config.crypto.getRandomValues(32)
		const filePath = this.getFileDerivePath(location)

		await this.config.metadataAccess.change<FilesIndex>(
			this.indexes.files,
			`Add file "${bytesToB64(location)}" to file index`,
			(doc) => {
				if (!doc.files) {
					doc.files = []
				}
				doc.files.push({
					location,
					finished: false,
					public: pub,
					handle,
					deleted: false,
				})
			},
		)

		await this.config.metadataAccess.change<FolderMetadata>(
			this.getFolderDerivePath(folderDerive),
			`Add file "${bytesToB64(location)}" to folder`,
			(doc) => {
				if (!doc.files) {
					doc.files = []
				}
				doc.files.push({
					name: filename,
					location: location,
				})
			},
		)

		const file = await this.config.metadataAccess.change<FileMetadata>(
			filePath,
			`Init file metadata for "${bytesToB64(location)}"`,
			(doc) => {
				doc.location = location
				doc.handle = handle
				doc.name = filename
				doc.path = path
				doc.folderDerive = folderDerive
				doc.modified = meta.lastModified
				doc.size = meta.size
				doc.type = meta.type
				doc.uploaded = Date.now()
				doc.finished = false
				doc.public = pub
			},
		)

		return {
			location: unfreezeUint8Array(file.location),
			handle: unfreezeUint8Array(file.handle),
			name: file.name,
			path: file.path,
			folderDerive: unfreezeUint8Array(file.folderDerive),
			size: file.size,
			uploaded: file.uploaded,
			modified: file.modified,
			type: file.type,
			finished: !!file.finished,
			public: !!file.public,
		}
	}

	async finishUpload (location: Uint8Array): Promise<void> {
		const fileMeta = await this.config.metadataAccess.change<FileMetadata>(
			this.getFileDerivePath(location),
			"Mark upload finished",
			(doc) => {
				doc.finished = true
			},
		)

		await this.config.metadataAccess.change<FilesIndex>(
			this.indexes.files,
			`Mark upload ${bytesToB64(location)} finished`,
			(doc) => {
				const fileEntry = doc.files.find((file) => arraysEqual(location, file.location))

				if (!fileEntry) {
					throw new AccountSystemNotFoundError(
						"file entry",
						`"${bytesToB64(location)}" in "${bytesToB64(unfreezeUint8Array(fileMeta.folderDerive))}"`,
					)
				}

				fileEntry.finished = true
			},
		)
	}

	async renameFile (location: Uint8Array, newName: string): Promise<FileMetadata> {
		validateFilename(newName)

		const fileIndexEntry = await this.getFileIndexEntryByLocation(location)
		if (!fileIndexEntry) {
			throw new AccountSystemNotFoundError("file", bytesToB64(location))
		}

		const fileMeta = await this.config.metadataAccess.change<FileMetadata>(
			this.getFileDerivePath(fileIndexEntry.location),
			"Rename file",
			(doc) => {
				doc.name = newName
			},
		)

		await this.config.metadataAccess.change<FolderMetadata>(
			this.getFolderDerivePath(unfreezeUint8Array(fileMeta.folderDerive)),
			`Rename file ${bytesToB64(location)}`,
			(doc) => {
				const fileEntry = doc.files.find((file) => arraysEqual(location, file.location))

				if (!fileEntry) {
					throw new AccountSystemNotFoundError(
						"file entry",
						`"${bytesToB64(location)}" in "${bytesToB64(unfreezeUint8Array(fileMeta.folderDerive))}"`,
					)
				}

				fileEntry.name = newName
			},
		)

		return {
			location: unfreezeUint8Array(fileMeta.location),
			handle: unfreezeUint8Array(fileMeta.handle),
			name: fileMeta.name,
			path: fileMeta.path,
			folderDerive: unfreezeUint8Array(fileMeta.folderDerive),
			size: fileMeta.size,
			uploaded: fileMeta.uploaded,
			modified: fileMeta.modified,
			type: fileMeta.type,
			finished: !!fileMeta.finished,
			public: !!fileMeta.public,
		}
	}

	async moveFile (location: Uint8Array, newPath: string): Promise<FileMetadata> {
		newPath = cleanPath(newPath)
		validateDirectoryPath(newPath)

		const folder = await this.addFolder(newPath)
		const folderDerive = folder.location

		const oldFileMeta = await this.getFileMetadata(location)

		await this.config.metadataAccess.change<FolderMetadata>(
			this.getFolderDerivePath(oldFileMeta.folderDerive),
			`Rename file ${bytesToB64(location)}`,
			(doc) => {
				const fileEntryIndex = doc.files.findIndex((file) => arraysEqual(location, file.location))

				if (fileEntryIndex == -1) {
					throw new AccountSystemNotFoundError(
						"file entry",
						`"${bytesToB64(location)}" in "${bytesToB64(oldFileMeta.folderDerive)}"`,
					)
				}

				doc.files.splice(fileEntryIndex, 1)
			},
		)

		const newFileMeta = await this.config.metadataAccess.change<FileMetadata>(
			this.getFileDerivePath(location),
			"Rename file",
			(doc) => {
				doc.path = newPath
				doc.folderDerive = folderDerive
			},
		)

		return {
			location: unfreezeUint8Array(newFileMeta.location),
			handle: unfreezeUint8Array(newFileMeta.handle),
			name: newFileMeta.name,
			path: newFileMeta.path,
			folderDerive: unfreezeUint8Array(newFileMeta.folderDerive),
			size: newFileMeta.size,
			uploaded: newFileMeta.uploaded,
			modified: newFileMeta.modified,
			type: newFileMeta.type,
			finished: !!newFileMeta.finished,
			public: !!newFileMeta.public,
		}
	}

	async removeFile (location: Uint8Array) {
		await this.config.metadataAccess.change<FilesIndex>(this.indexes.files, "Mark upload deleted", (doc) => {
			const fileEntry = doc.files.find((file) => arraysEqual(unfreezeUint8Array(file.location), location))

			if (!fileEntry) {
				throw new AccountSystemNotFoundError("file entry", bytesToB64(location))
			}

			fileEntry.deleted = true
		})

		const fileMeta = await this.getFileMetadata(location)
		await this.config.metadataAccess.delete(this.getFileDerivePath(location))

		await this.config.metadataAccess.change<FolderMetadata>(
			this.getFolderDerivePath(fileMeta.folderDerive),
			`Remove file ${location}`,
			(doc) => {
				const fileIndex = doc.files.findIndex((file) => arraysEqual(unfreezeUint8Array(file.location), location))

				doc.files.splice(fileIndex, 1)
			},
		)
	}

	///////////////////////////////
	/////////// Folders ///////////
	///////////////////////////////

	getFolderDerivePath (location: Uint8Array): string {
		return this.prefix + "/folder/" + bytesToB64(location)
	}

	async getFoldersIndex (): Promise<FoldersIndex> {
		const foldersIndex =
			(await this.config.metadataAccess.get<FoldersIndex>(this.indexes.folders)) ||
			Automerge.from<FoldersIndex>({ folders: [] })

		// TODO: find orphans

		const duplicates = new Set(foldersIndex.folders.map(({ path }) => path).filter((p, i, arr) => arr.indexOf(p) != i))

		// TODO: merge duplicate folders
		for (let dup of duplicates) {
		}

		return {
			folders: foldersIndex.folders.map((folder) => ({
				location: unfreezeUint8Array(folder.location),
				path: folder.path,
			})),
		}
	}

	async getFolderIndexEntryByPath (path: string): Promise<FoldersIndexEntry> {
		path = cleanPath(path)
		validateDirectoryPath(path)

		const foldersIndex = await this.getFoldersIndex()
		const folderEntry = foldersIndex.folders.find((folder) => folder.path == path)

		if (!folderEntry) {
			// TODO: orphan?
			throw new AccountSystemNotFoundError("folder", path)
		}

		return {
			location: folderEntry.location,
			path: folderEntry.path,
		}
	}

	async getFoldersInFolderByPath (path: string): Promise<FoldersIndexEntry[]> {
		path = cleanPath(path)
		validateDirectoryPath(path)

		const foldersIndex = await this.getFoldersIndex()

		return foldersIndex.folders.filter((folder) => isPathChild(path, folder.path))
	}

	async getFoldersInFolderByLocation (location: Uint8Array): Promise<FoldersIndexEntry[]> {
		const foldersIndex = await this.getFoldersIndex()

		const folderEntry = foldersIndex.folders.find((folder) => arraysEqual(folder.location, location))

		if (!folderEntry) {
			throw new AccountSystemNotFoundError("folder entry", bytesToB64(location))
		}

		const path = folderEntry.path

		return foldersIndex.folders.filter((folder) => isPathChild(path, folder.path))
	}

	async getFolderMetadataByPath (path: string): Promise<FolderMetadata> {
		path = cleanPath(path)

		const folderEntry = await this.getFolderIndexEntryByPath(path)

		return await this.getFolderMetadataByLocation(folderEntry.location)
	}

	async getFolderMetadataByLocation (location: Uint8Array): Promise<FolderMetadata> {
		const folderPath = this.getFolderDerivePath(location)

		const doc = await this.config.metadataAccess.get<FolderMetadata>(folderPath)

		if (!doc) {
			throw new AccountSystemNotFoundError("folder", folderPath)
		}

		return {
			location: unfreezeUint8Array(doc.location),
			name: doc.name,
			path: doc.path,
			size: doc.size,
			uploaded: doc.uploaded,
			modified: doc.modified,
			files: doc.files.map((fileEntry) => ({
				location: unfreezeUint8Array(fileEntry.location),
				name: fileEntry.name,
			})),
		}
	}

	async addFolder (path: string): Promise<FolderMetadata> {
		path = cleanPath(path)
		validateDirectoryPath(path)

		if (path != "/") {
			await this.addFolder(posix.dirname(path))
		}

		let foldersIndexDoc = await this.getFoldersIndex()

		const dup = foldersIndexDoc.folders.find((entry) => entry.path == path)

		if (dup) {
			return this.getFolderMetadataByLocation(dup.location)
		}

		const location = await this.config.metadataAccess.config.crypto.getRandomValues(32)

		await this.config.metadataAccess.change<FoldersIndex>(this.indexes.folders, "Add folder to index", (doc) => {
			if (!doc.folders) {
				doc.folders = []
			}
			doc.folders.push({
				location: location,
				path,
			})
		})

		const doc = await this.config.metadataAccess.change<FolderMetadata>(
			this.getFolderDerivePath(location),
			"Init folder metadata",
			(doc) => {
				doc.location = location
				doc.name = posix.basename(path)
				doc.path = path
				doc.modified = Date.now()
				doc.size = 0
				doc.uploaded = Date.now()
				doc.files = []
			},
		)

		return {
			location: unfreezeUint8Array(doc.location),
			name: doc.name,
			path: doc.path,
			size: doc.size,
			uploaded: doc.uploaded,
			modified: doc.modified,
			files: doc.files.map((file) => ({
				location: unfreezeUint8Array(file.location),
				name: file.name,
			})),
		}
	}

	async renameFolder (path: string, newName: string): Promise<FolderMetadata> {
		path = cleanPath(path)
		validateDirectoryPath(path)
		validateFilename(newName)

		return await this.moveFolder(path, posix.join(posix.dirname(path), newName))
	}

	async moveFolder (oldPath: string, newPath: string): Promise<FolderMetadata> {
		oldPath = cleanPath(oldPath)
		newPath = cleanPath(newPath)
		validateDirectoryPath(oldPath)
		validateDirectoryPath(newPath)

		const op = posix.dirname(oldPath) == posix.dirname(newPath) ? "Rename" : "Move"

		const newFolder = await this.getFolderIndexEntryByPath(newPath)
		if (newFolder) {
			throw new AccountSystemAlreadyExistsError("folder", newPath)
		}

		const folderIndexEntry = await this.getFolderIndexEntryByPath(oldPath)
		if (!folderIndexEntry) {
			throw new AccountSystemNotFoundError("folder", newPath)
		}

		await this.config.metadataAccess.change<FoldersIndex>(this.indexes.folders, `${op} folder`, (doc) => {
			const folderIndexEntry = doc.folders.find((folder) => folder.path == oldPath)
			if (folderIndexEntry) {
				folderIndexEntry.path = newPath
			}
		})

		const doc = await this.config.metadataAccess.change<FolderMetadata>(
			this.getFolderDerivePath(folderIndexEntry.location),
			`${op} folder`,
			(doc) => {
				doc.name = posix.basename(newPath)
				doc.path = newPath
			},
		)

		return {
			location: unfreezeUint8Array(doc.location),
			name: doc.name,
			path: doc.path,
			size: doc.size,
			uploaded: doc.uploaded,
			modified: doc.modified,
			files: doc.files.map((file) => ({
				location: unfreezeUint8Array(file.location),
				name: file.name,
			})),
		}
	}

	async removeFolderByPath (path: string) {
		path = cleanPath(path)

		const folderEntry = await this.getFolderIndexEntryByPath(path)

		return await this.removeFolderByLocation(folderEntry.location)
	}

	async removeFolderByLocation (location: Uint8Array) {
		const folderMeta = await this.getFolderMetadataByLocation(location)

		if (folderMeta.files.length) {
			throw new AccountSystemNotEmptyError("folder", bytesToB64(location), "remove")
		}

		const childFolders = await this.getFoldersInFolderByLocation(location)

		if (childFolders.length) {
			throw new AccountSystemNotEmptyError("folder", bytesToB64(location), "remove")
		}

		await this.config.metadataAccess.delete(this.getFolderDerivePath(location))

		await this.config.metadataAccess.change<FoldersIndex>(
			this.indexes.folders,
			`Remove folder ${bytesToB64(location)}`,
			(doc) => {
				const folderIndex = doc.folders.findIndex((file) => arraysEqual(unfreezeUint8Array(file.location), location))

				doc.folders.splice(folderIndex, 1)
			},
		)
	}

	///////////////////////////////
	//////////// Tags  ////////////
	///////////////////////////////

	///////////////////////////////
	//////////// Share ////////////
	///////////////////////////////

	getShareHandle (meta: ShareMetadata): Uint8Array {
		return new Uint8Array(Array.from(meta.locationKey).concat(Array.from(meta.encryptionKey)))
	}

	async getShareIndex (): Promise<ShareIndex> {
		const sharedIndex =
			(await this.config.metadataAccess.get<ShareIndex>(this.indexes.share)) ||
			Automerge.from<ShareIndex>({ shared: [] })

		// TODO: find orphans

		return {
			shared: sharedIndex.shared.map((shareEntry) => ({
				locationKey: unfreezeUint8Array(shareEntry.locationKey),
				encryptionKey: unfreezeUint8Array(shareEntry.encryptionKey),
			})),
		}
	}

	async share (filesInit: ShareFileMetadataInit[]): Promise<ShareMetadata> {
		const files = await Promise.all(
			filesInit.map(
				async (fileInit): Promise<ShareFileMetadata> => {
					const meta = await this.getFileMetadata(fileInit.location)

					return {
						handle: meta.handle,
						modified: meta.modified,
						uploaded: meta.uploaded,
						name: meta.name,
						path: fileInit.path,
						size: meta.size,
						type: meta.type,
						finished: !!meta.finished,
						public: !!meta.public,
					}
				},
			),
		)

		const locationKey = await entropyToKey(await this.config.metadataAccess.config.crypto.getRandomValues(32))
		const encryptionKey = await this.config.metadataAccess.config.crypto.getRandomValues(32)

		await this.config.metadataAccess.change<ShareIndex>(this.indexes.share, "Share files", (doc) => {
			if (!doc.shared) {
				doc.shared = []
			}
			doc.shared.push({
				locationKey,
				encryptionKey,
			})
		})

		const shareMeta = await this.config.metadataAccess.changePublic<ShareMetadata>(
			locationKey,
			"Share files",
			(doc) => {
				doc.locationKey = locationKey
				doc.encryptionKey = encryptionKey
				doc.dateShared = Date.now()
				doc.files = files
			},
			encryptionKey,
		)

		return {
			locationKey: unfreezeUint8Array(shareMeta.locationKey),
			encryptionKey: unfreezeUint8Array(shareMeta.encryptionKey),
			dateShared: shareMeta.dateShared,
			files: shareMeta.files.map((file) => ({
				handle: unfreezeUint8Array(file.handle),
				name: file.name,
				path: file.path,
				size: file.size,
				uploaded: file.uploaded,
				modified: file.modified,
				type: file.type,
				finished: !!file.finished,
				public: !!file.public,
			})),
		}
	}

	async getShared (handle: Uint8Array): Promise<ShareMetadata> {
		const locationKey = handle.slice(0, 32)
		const encryptionKey = handle.slice(32)

		const shareMeta = await this.config.metadataAccess.getPublic<ShareMetadata>(locationKey, encryptionKey)

		if (!shareMeta) {
			throw new AccountSystemNotFoundError("shared", bytesToB64(handle))
		}

		return {
			locationKey: unfreezeUint8Array(shareMeta.locationKey),
			encryptionKey: unfreezeUint8Array(shareMeta.encryptionKey),
			dateShared: shareMeta.dateShared,
			files: shareMeta.files.map((file) => ({
				handle: unfreezeUint8Array(file.handle),
				name: file.name,
				path: file.path,
				size: file.size,
				uploaded: file.uploaded,
				modified: file.modified,
				type: file.type,
				finished: !!file.finished,
				public: !!file.public,
			})),
		}
	}
}
