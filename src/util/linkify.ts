import { Component, TFile, parseFrontMatterAliases } from "obsidian";

declare module "obsidian" {
    interface MetadataCache {
        initialized: boolean;
        getLinkSuggestions(): { alias?: string; file: TFile; path: string }[];
    }
}

class LinkifierClass extends Component {
    #cache: Map<string, string> = new Map();
    buildCache() {
        //defer this
        setTimeout(() => {
            const links = app.metadataCache.getLinkSuggestions();
            for (const { alias, file } of links) {
                if (!alias) continue;
                this.#cache.set(alias, file.name);
            }
        }, 0);
    }
    getResolvedFile(
        input: string,
        context: string
    ): { alias: string | null; file: TFile | null } {
        input = input.trim();
        let filePath =
            this.#cache.get(input) ??
            this.#cache.get(input.toLowerCase()) ??
            input;
        let alias =
            this.#cache.has(input) || this.#cache.has(input.toLowerCase())
                ? input
                : null;
        return {
            alias,
            file: app.metadataCache.getFirstLinkpathDest(filePath, context)
        };
    }
    onload(): void {
        if (app.metadataCache.initialized) {
            this.buildCache();
        } else {
            const ref = app.metadataCache.on("resolved", () => {
                this.buildCache();
                app.metadataCache.offref(ref);
            });
            this.registerEvent(ref);
        }
        this.registerEvent(
            app.metadataCache.on("changed", (file) => {
                const { frontmatter } =
                    app.metadataCache.getFileCache(file) ?? {};
                if (!frontmatter) return;
                const aliases = parseFrontMatterAliases(frontmatter) ?? [];
                for (const alias of aliases) {
                    this.#cache.set(alias, file.name);
                    this.#cache.set(alias.toLowerCase(), file.name);
                }
            })
        );
    }

    /** Attempt to convert a string into a link, while maintaining any whitespace. **/
    linkify(input: string, context: string = ""): string {
        let trimmed = input.trim();
        const { file, alias } = this.getResolvedFile(trimmed, context);
        if (file != null) {
            return input.replace(
                trimmed,
                `<STATBLOCK-LINK>${file.basename}${
                    alias ? "|" + alias : ""
                }</STATBLOCK-LINK>`
            );
        }
        return input;
    }
    linkifySpells(spells: string, context: string = ""): string {
        return spells
            .split(",")
            .map((spell) => this.linkify(spell, context))
            .join(",");
    }
}

export const Linkifier = new LinkifierClass();
