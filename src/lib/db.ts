import Dexie, { type Table } from "dexie";

export interface Document {
	id?: number;
	title: string;
	content: string;
	updatedAt: Date;
}

export class MdEditorDB extends Dexie {
	documents!: Table<Document>;

	constructor() {
		super("MdEditorDB");
		this.version(1).stores({
			documents: "++id, title, updatedAt", // Primary key and indexed props
		});
	}
}

export const db = new MdEditorDB();
