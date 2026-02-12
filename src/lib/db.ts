import Dexie, { type Table } from "dexie";

export interface Document {
	id?: number;
	title: string;
	content: string;
	updatedAt: Date;
}

export interface Image {
	id?: number;
	blob: Blob;
	mimeType: string;
	createdAt: Date;
}

export class MdEditorDB extends Dexie {
	documents!: Table<Document>;
	images!: Table<Image>;

	constructor() {
		super("MdEditorDB");
		this.version(1).stores({
			documents: "++id, title, updatedAt",
		});
		this.version(2).stores({
			documents: "++id, title, updatedAt",
			images: "++id, createdAt",
		});
	}
}

export const db = new MdEditorDB();
