import { nanoid } from "src/data/constants";
import ImportWorker from "./importer.worker";
import type { Monster } from "@types";
import { Notice } from "obsidian";

export default class Importer {
    workers: Map<string, Worker> = new Map();
    async import(files: FileList, source: string): Promise<Monster[]> {
        return new Promise((resolve) => {
            const worker = new ImportWorker();
            const id = nanoid();
            this.workers.set(id, worker);

            worker.onmessage = (event) => {
                const { monsters } = event.data ?? {};
                if (monsters) {
                    console.log(monsters);
                }
                new Notice(`Successfully imported ${monsters.length} Monsters`);
                worker.terminate();
                this.workers.delete(id);
                resolve(monsters);
            };
            worker.onerror = (e) => {
                new Notice(
                    `There was an error importing the file.\n\n${e.message}`
                );
                worker.terminate();
                this.workers.delete(id);
                resolve([]);
            };
            worker.postMessage({ files, source });
        });
    }
}
