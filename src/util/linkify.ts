import {
    Component,
    TFile,
    normalizePath,
    parseFrontMatterAliases
} from "obsidian";
import { stringify } from "src/util/util";

declare module "obsidian" {
    interface MetadataCache {
        initialized: boolean;
        getLinkSuggestions(): { alias?: string; file: TFile; path: string }[];
    }
}

class LinkifierClass extends Component {
    #cache: Map<string, string> = new Map();
    #addAliasesToCache(aliases: string[], file: TFile) {
        for (const alias of aliases) {
            this.#cache.set(alias, file.name);
            this.#cache.set(alias.toLowerCase(), file.name);
        }
    }
    buildCache() {
        //defer this
        setTimeout(() => {
            const links = app.metadataCache.getLinkSuggestions();
            for (const { alias, file } of links) {
                if (!alias) continue;
                this.#addAliasesToCache([alias], file);
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
                this.#addAliasesToCache(aliases, file);
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
                this.#replaceWikiLink(
                    `${file.basename}${alias ? "|" + alias : ""}`
                )
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

    WIKILINK = "STATBLOCK-WIKI-LINK";
    WIKILINK_REGEX = new RegExp(
        `<${this.WIKILINK}>([\\s\\S]+?)<${this.WIKILINK}>`
    );
    MARKDOWN = "STATBLOCK-MARKDOWN-LINK";
    MARKDOWN_REGEX = new RegExp(
        `<${this.MARKDOWN}>([\\s\\S]+?)(?:\\|([\\s\\S]+?))?<${this.MARKDOWN}>`
    );
    GENERIC_REGEX =
        /(<STATBLOCK-(?:WIKI|MARKDOWN)-LINK>[\s\S]+?<STATBLOCK-(?:WIKI|MARKDOWN)-LINK>)/;

    #replaceWikiLink(link: string) {
        return `<${this.WIKILINK}>${link}<${this.WIKILINK}>`;
    }
    #replaceMarkdownLink(link: string, alias?: string) {
        return `<${this.MARKDOWN}>${link}${alias ? "|" + alias : ""}<${
            this.MARKDOWN
        }>`;
    }
    /**
     * This method can be used to replace any markdown or wikilinks in a source, so that it
     * can safely be transformed into YAML.
     *
     * @param {string} source The string to be transformed.
     * @returns {string} A transformed source, with links replaced.
     */
    transformSource(source: string) {
        return source
            .replace(/\[\[([\s\S]+?)\]\]/g, (_, $1) =>
                this.#replaceWikiLink($1)
            )
            .replace(
                /\[([\s\S]*?)\]\(([\s\S]+?)\)/g,
                (_, alias: string, path: string) =>
                    this.#replaceMarkdownLink(path, alias)
            );
    }
    /**
     * This can be used to transform a source coming from frontmatter, that could possibly
     * have wikilinks defined as an array.
     * @param source Source to transform.
     * @returns {string} A transformed source, with links replaced.
     */
    transformYamlSource(source: string) {
        return this.transformSource(source);
    }

    stringifyLinks(source: string) {
        return source
            .replace(
                new RegExp(this.WIKILINK_REGEX, "g"),
                (_, $1) => `[[${$1}]]`
            )
            .replace(
                new RegExp(this.MARKDOWN_REGEX, "g"),
                (_, path, alias) => `[${alias ? alias : ""}](${path})`
            );
    }

    splitByLinks(text: string, context: string, render?: boolean): SplitLink[] {
        return stringify(text)
            .split(this.GENERIC_REGEX)
            .filter((s) => s && s.length)
            .map((str) => {
                if (this.WIKILINK_REGEX.test(str)) {
                    let link = str.match(this.WIKILINK_REGEX)[1];
                    return {
                        isLink: render,
                        text: `[[${normalizePath(link)}]]`
                    };
                }
                if (this.MARKDOWN_REGEX.test(str)) {
                    const [_, path, alias] = str.match(this.MARKDOWN_REGEX);

                    return {
                        isLink: render,
                        text: `[${alias ? alias : ""}](${path})`
                    };
                }
                return { isLink: false, text: str };
            });
    }
}
type SplitLink = { text: string; isLink: boolean };

export const Linkifier = new LinkifierClass();
