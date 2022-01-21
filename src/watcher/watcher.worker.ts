import type { Monster } from "@types";
import copy from "fast-copy";
import type { CachedMetadata } from "obsidian";
import { transformTraits } from "src/util/util";

export interface QueueMessage {
    type: "queue";
    paths: string[];
}
export interface FileCacheMessage {
    type: "file";
    path: string;
    cache: CachedMetadata;
    file: { path: string; basename: string };
}
export interface GetFileCacheMessage {
    type: "get";
    path: string;
}
export interface FinishFileMessage {
    type: "done";
    path: string;
}
export interface UpdateEventMessage {
    type: "update";
    monster: Monster;
    path: string;
}
export interface SaveMessage {
    type: "save";
}

const ctx: Worker = self as any;
class Parser {
    queue: string[] = [];
    parsing: boolean = false;

    constructor() {
        //Add Files to Queue
        ctx.addEventListener("message", (event: MessageEvent<QueueMessage>) => {
            if (event.data.type == "queue") {
                this.add(...event.data.paths);
            }
        });
    }
    add(...paths: string[]) {
        this.queue.push(...paths);
        if (!this.parsing) this.parse();
    }
    async parse() {
        this.parsing = true;
        while (this.queue.length) {
            const path = this.queue.shift();
            const { file, cache } = await this.getFileData(path);
            this.parseFileForCreatures(file, cache);
            ctx.postMessage<FinishFileMessage>({ type: "done", path });
        }
        this.parsing = false;
        ctx.postMessage<SaveMessage>({ type: "save" });
    }
    async getFileData(path: string): Promise<FileCacheMessage> {
        return new Promise((resolve) => {
            ctx.addEventListener(
                "message",
                (event: MessageEvent<FileCacheMessage>) => {
                    if (event.data.type == "file") {
                        resolve(event.data);
                    }
                }
            );
            ctx.postMessage<GetFileCacheMessage>({ path, type: "get" });
        });
    }
    parseFileForCreatures(
        file: { path: string; basename: string },
        cache: CachedMetadata
    ) {
        if (!cache) return;
        if (!cache.frontmatter) return;
        if (!cache.frontmatter.statblock) return;
        if (!cache.frontmatter.name) return;
        const monster: Monster = Object.assign({}, copy(cache.frontmatter), {
            note: file.path
        });

        if (monster.traits) {
            monster.traits = transformTraits([], monster.traits);
        }
        if (monster.actions) {
            monster.actions = transformTraits([], monster.actions);
        }
        if (monster.reactions) {
            monster.reactions = transformTraits([], monster.reactions);
        }
        if (monster.legendary_actions) {
            monster.legendary_actions = transformTraits(
                [],
                monster.legendary_actions
            );
        }

        ctx.postMessage<UpdateEventMessage>({
            type: "update",
            monster,
            path: file.path
        });
    }
}
new Parser();
