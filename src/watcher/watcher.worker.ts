import type { Monster } from "index";
import copy from "fast-copy";
import type { CachedMetadata } from "obsidian";
import { transformTraits } from "src/util/util";
import YAML from "yaml";

interface FileDetails {
    path: string;
    basename: string;
    mtime: number;
}

export interface DebugMessage {
    type: "debug";
    debug: boolean;
}

export interface QueueMessage {
    type: "queue";
    paths: string[];
}
export interface FileCacheMessage {
    type: "file";
    path: string;
    cache: CachedMetadata;
    file: FileDetails;
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
export interface ReadMessage {
    type: "read";
    path: string;
}
export interface ContentMessage {
    type: "content";
    path: string;
    content: string;
}

const ctx: Worker = self as any;
class Parser {
    queue: string[] = [];
    pendingContentProcessing: Map<string, FileDetails> = new Map<
        string,
        FileDetails
    >();
    parsing: boolean = false;
    debug: boolean;

    constructor() {
        //Add Files to Queue
        ctx.addEventListener("message", (event: MessageEvent<QueueMessage>) => {
            if (event.data.type == "queue") {
                this.add(...event.data.paths);

                if (this.debug) {
                    console.debug(
                        `Fantasy Statblocks: Received queue message for ${event.data.paths.length} paths`
                    );
                }
            }
        });
        ctx.addEventListener("message", (event: MessageEvent<DebugMessage>) => {
            if (event.data.type == "debug") {
                this.debug = event.data.debug;
            }
        });
        ctx.addEventListener(
            "message",
            (event: MessageEvent<ContentMessage>) => {
                if (event.data.type == "content") {
                    this.processContent(event.data.path, event.data.content);
                }
            }
        );
    }
    add(...paths: string[]) {
        if (this.debug) {
            console.debug(
                `Fantasy Statblocks: Adding ${paths.length} paths to queue`
            );
        }
        this.queue.push(...paths);
        if (!this.parsing) this.parse();
    }
    processContent(path: string, content: string) {
        if (this.debug)
            console.debug(`Fantasy Statblocks: Process Content: ${path}`);
        let fileDetails = this.pendingContentProcessing.get(path);
        let statBlock = this.findFirstStatBlock(content);
        if (statBlock) {
            if (this.debug)
                console.debug(
                    `Fantasy Statblocks: found Statblock: ${JSON.stringify(
                        statBlock
                    )}`
                );
            const monster: Monster = Object.assign({}, YAML.parse(statBlock), {
                note: path,
                mtime: fileDetails.mtime
            });
            if (this.debug)
                console.debug(`Fantasy Statblocks: ${JSON.stringify(monster)}`);
            this.processMonster(monster, fileDetails);
        }

        this.pendingContentProcessing.delete(path);
        this.checkForWorkComplete();
    }

    findFirstStatBlock(content: string): string {
        let matches = content.match(
            /^```[^\S\r\n]*statblock\s?\n([\s\S]+?)^```/m
        );
        if (matches) {
            return matches[1];
        }
        return null;
    }
    async parse() {
        this.parsing = true;
        while (this.queue.length) {
            const path = this.queue.shift();
            if (!path.endsWith(".md")) {
                continue;
            }
            if (this.debug) {
                console.debug(
                    `Fantasy Statblocks: Parsing ${path} for statblocks (${this.queue.length} to go)`
                );
            }
            const { file, cache } = await this.getFileData(path);
            this.parseFileForCreatures(file, cache);
            ctx.postMessage<FinishFileMessage>({ type: "done", path });
        }
        this.checkForWorkComplete();
    }

    private checkForWorkComplete() {
        if (this.pendingContentProcessing.size == 0) {
            this.parsing = false;
            ctx.postMessage<SaveMessage>({ type: "save" });
        }
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
    parseFileForCreatures(file: FileDetails, cache: CachedMetadata) {
        if (!cache) return;
        if (!cache.frontmatter) return;
        if (!cache.frontmatter.statblock) return;
        if (cache.frontmatter.statblock === "inline") {
            ctx.postMessage<ReadMessage>({
                type: "read",
                path: file.path
            });
            this.pendingContentProcessing.set(file.path, file);
            return;
        }
        if (!cache.frontmatter.name) return;
        const monster: Monster = this.validate(
            Object.assign({}, copy(cache.frontmatter), {
                note: file.path,
                mtime: file.mtime
            })
        );

        if (monster.traits) {
            monster.traits = transformTraits([], monster.traits);
        }
        this.processMonster(monster, file);
    }

    private processMonster(monster: Monster, file: FileDetails) {
        if (monster.actions) {
            monster.actions = transformTraits([], monster.actions);
        }
        if (monster.bonus_actions) {
            monster.bonus_actions = transformTraits([], monster.bonus_actions);
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
        if (
            monster["statblock-link"] &&
            monster["statblock-link"].startsWith("#")
        ) {
            monster[
                "statblock-link"
            ] = `[${monster.name}](${file.path}${monster["statblock-link"]})`;
        }

        if (this.debug)
            console.debug(
                `Fantasy Statblocks: Adding ${monster.name} to bestiary from ${file.basename}`
            );

        ctx.postMessage<UpdateEventMessage>({
            type: "update",
            monster,
            path: file.path
        });
    }
    validate(draft: Partial<Monster>): Monster {
        return draft as Monster;
    }
}
new Parser();
