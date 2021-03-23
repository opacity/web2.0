import { readUInt32BE, uint32ToUint8BE } from "@opacity/util/src/uint"

export class CyclicReferenceError extends Error {
	constructor (id: number, stack: number[]) {
		super(`DAG: Cyclic reference detected ${id} in ${JSON.stringify(stack)}`)
	}
}

export class BinarySerializationError extends Error {
	constructor (why: string, data: Uint8Array) {
		super(`DAG: Invalid binary ${data} because of "${why}"`)
	}
}

export class VertexExistsError extends Error {
	constructor (id: number) {
		super(`DAG: Vertex id ${id} already exists in dag`)
	}
}

export class EdgeExistsError extends Error {
	constructor (edge: DAGEdge) {
		super(`DAG: Edge already exists ${edge.child} -> ${edge.parent}`)
	}
}
export class VertexNotFoundError extends Error {
	constructor (id: number, stack: DAGVertex[]) {
		super(`DAG: Vertex ${id} not found in in ${JSON.stringify(stack)}`)
	}
}

enum DAGBinaryTypes {
	DAG,
	VERTEX,
	EDGE,
}

enum DAGDigestTypes {
	LEAF,
	BRANCH,
}

const checkLength = (b: Uint8Array, actual: number) => {
	if (actual > b.length) {
		throw new BinarySerializationError("invalid length", b)
	}
}

export class DAG {
	static fromBinary (b: Uint8Array): DAG {
		const d = new DAG()
		let i = 0

		checkLength(b, i + 1)
		const type = b[0]
		i += 1

		if (type != DAGBinaryTypes.DAG) {
			throw new BinarySerializationError(`invalid type, expected ${DAGBinaryTypes.DAG}, got ${type}`, b)
		}

		checkLength(b, i + 4)
		const nodesLength = readUInt32BE(b, i)
		i += 4

		for (let n = 0; n < nodesLength; n++) {
			checkLength(b, i + 4)
			const l = readUInt32BE(b, i)
			i += 4
			checkLength(b, i + l)
			const nbin = b.slice(i, i + l)
			i += l
			d.add(DAGVertex.fromBinary(nbin))
		}

		checkLength(b, i + 4)
		const edgesLength = readUInt32BE(b, i)
		i += 4

		for (let e = 0; e < edgesLength; e++) {
			checkLength(b, i + 4)
			const l = readUInt32BE(b, i)
			i += 4
			checkLength(b, i + l)
			const ebin = b.slice(i, i + l)
			i += l
			d.addEdge(DAGEdge.fromBinary(ebin))
		}

		return d
	}

	get binary (): Uint8Array {
		return new Uint8Array(
			([] as number[]).concat(
				Array.from(uint32ToUint8BE(this.nodes.length)),
				this.nodes
					.map((node) => Array.from(uint32ToUint8BE(node.binary.length)).concat(Array.from(node.binary)))
					.flat(),
				Array.from(uint32ToUint8BE(this.edges.length)),
				this.edges
					.map((edge) => Array.from(uint32ToUint8BE(edge.binary.length)).concat(Array.from(edge.binary)))
					.flat(),
			),
		)
	}

	nodes: DAGVertex[] = []
	edges: DAGEdge[] = []
	sinks: number[] = []

	clone () {
		return DAG.fromBinary(this.binary)
	}

	add (node: DAGVertex) {
		if (this.nodes.find(({ id }) => id == node.id)) {
			console.warn(new VertexExistsError(node.id))
			return
		}

		this.nodes.push(node)
		this.sinks.push(node.id)
	}

	addReduced (node: DAGVertex) {
		for (let sink of this.sinks.slice()) {
			this.addEdge(new DAGEdge(node.id, sink))
		}

		this.add(node)
	}

	addEdge (edge: DAGEdge) {
		if (this.edges.find(({ child, parent }) => child == edge.child && parent == edge.parent)) {
			console.warn(new EdgeExistsError(edge))

			return
		}

		this.edges.push(edge)

		try {
			this.dependencies(edge.child)
		} catch (err) {
			this.edges.pop()

			throw err
		}

		const sinkIndex = this.sinks.findIndex((sink) => sink == edge.parent)

		if (sinkIndex != -1) {
			this.sinks.splice(sinkIndex, 1)
		}
	}

	parentEdges (id: number): DAGEdge[] {
		return this.edges.filter(({ child }) => child == id)
	}

	depth (id: number): number {
		const parents = this.parentEdges(id)
			.map(({ parent }) => parent)
			.sort((a, b) => a - b)

		if (parents.length) {
			return (1 +
				Math.max.apply(
					undefined,
					parents.map((to) => this.depth(to)),
				)) as number
		}

		return 0
	}

	dependencies (id: number, seen: number[] = []): number[] {
		if (seen.includes(id)) {
			throw new CyclicReferenceError(id, seen)
		}

		const parents = this.parentEdges(id)
			.map(({ parent }) => parent)
			.sort((a, b) => a - b)

		const newSeen: number[] = ([] as number[]).concat(seen, [id])

		return ([] as number[]).concat(parents, parents.map((to) => this.dependencies(to, newSeen)).flat())
	}

	async digest (id: number, hash: (d: Uint8Array) => Uint8Array | Promise<Uint8Array>): Promise<Uint8Array> {
		if (!id) {
			const parents = this.sinks.sort((a, b) => a - b)

			const hashes = await Promise.all(
				parents.map(async (parent) => [DAGDigestTypes.BRANCH].concat(Array.from(await this.digest(parent, hash)))),
			)
			const data = new Uint8Array(([] as number[]).concat(...hashes))

			return hash(data)
		}

		const node = this.nodes.find((node) => id == node.id)

		if (!node) {
			throw new VertexNotFoundError(id, this.nodes)
		}

		const leaf = [DAGDigestTypes.LEAF].concat(Array.from(await hash(node.binary)))
		const parents = this.parentEdges(id)
			.map(({ parent }) => parent)
			.sort((a, b) => a - b)

		if (!parents.length) {
			return hash(new Uint8Array(leaf))
		}

		const branches = await Promise.all(
			parents.map(async (parent) => [DAGDigestTypes.BRANCH].concat(Array.from(await this.digest(parent, hash)))),
		)
		const data = new Uint8Array(([] as number[]).concat(Array.from(leaf), branches.flat()))

		return hash(data)
	}
}

export class DAGEdge {
	static fromBinary (b: Uint8Array): DAGEdge {
		let i = 0

		checkLength(b, i)
		const type = b[i]
		i += 1

		if (type != DAGBinaryTypes.EDGE) {
			throw new BinarySerializationError(`invalid type, expected ${DAGBinaryTypes.EDGE}, got ${type}`, b)
		}

		checkLength(b, i + 4)
		const from = readUInt32BE(b, i)
		i += 4
		checkLength(b, i + 4)
		const to = readUInt32BE(b, i)
		i += 4

		return new DAGEdge(from, to)
	}

	get binary (): Uint8Array {
		return new Uint8Array(
			([] as number[]).concat(
				// 1
				[DAGBinaryTypes.EDGE],
				// 4
				Array.from(uint32ToUint8BE(this.child)),
				//
				Array.from(uint32ToUint8BE(this.parent)),
			),
		)
	}

	child: number
	parent: number

	constructor (child: number, parent: number) {
		this.child = child
		this.parent = parent
	}
}

export class DAGVertex {
	static fromBinary (b: Uint8Array): DAGVertex {
		let i = 0

		checkLength(b, i)
		const type = b[i]
		i += 1

		if (type != DAGBinaryTypes.VERTEX) {
			throw new BinarySerializationError(`invalid type, expected ${DAGBinaryTypes.VERTEX}, got ${type}`, b)
		}

		checkLength(b, i + 4)
		const id = readUInt32BE(b, i)
		i += 4

		checkLength(b, i + 4)
		const dataLength = readUInt32BE(b, i)
		i += 4
		checkLength(b, i + dataLength)
		const data = b.slice(i, i + dataLength)
		i += dataLength

		if (i != b.length) {
			throw new BinarySerializationError("invalid length", b)
		}

		const node = new DAGVertex(data)
		node.id = id

		return node
	}

	get binary (): Uint8Array {
		return new Uint8Array(
			([] as number[]).concat(
				// 1
				[DAGBinaryTypes.VERTEX],
				// 4
				Array.from(uint32ToUint8BE(this.id)),
				// 4
				Array.from(uint32ToUint8BE(this.data.length)),
				// this.data.length
				Array.from(this.data),
			),
		)
	}

	// random uint32 not 0
	id = Math.floor(Math.random() * (2 ** 32 - 1)) + 1
	data: Uint8Array

	constructor (data: Uint8Array) {
		this.data = data
	}
}
