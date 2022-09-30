<script lang="ts">
    import type { Monster } from "@types";
    import type { ImageItem } from "src/layouts/types";
    import type StatBlockPlugin from "src/main";
    import { getContext } from "svelte";
    import {
        App,
        HoverPopover,
        MarkdownPreviewView,
        MarkdownView,
        Platform,
        TFile,
        WorkspaceLeaf
    } from "obsidian";

    export let monster: Monster;
    export let item: ImageItem;

    const plugin = getContext<StatBlockPlugin>("plugin");
    const context = getContext<string>("context");

    function parseLink(link: string) {
        return link?.replace(/(\[|\])/g, "");
    }
    let file: TFile;
    async function getLink(url: string) {
        url = decodeURIComponent(url);
        let link: string;
        try {
            if (/https?:/.test(url)) {
                //url
                const [linkpath] = parseLink(url).split("|");
                link = linkpath;
            } else {
                const [linkpath] = parseLink(url).split("|");

                file = plugin.app.metadataCache.getFirstLinkpathDest(
                    linkpath.replace(/<\/?STATBLOCK-LINK>/g, ""),
                    context
                );
                if (!file) throw new Error();
                link = plugin.app.vault.getResourcePath(file);
            }
        } catch (e) {
            console.error(e);
        }
        return link;
    }
    const getImage = async (): Promise<string> => {
        if (
            item.properties.length &&
            item.properties.some(
                (p) => p in monster && typeof monster[p] == "string"
            )
        ) {
            const props = item.properties.filter(
                (p) => p in monster && typeof monster[p] == "string"
            );
            if (props.length > 1) {
                console.log(
                    "TTRPG Statblocks: Multiple image properties provided, using first."
                );
            }
            const path = monster[props[0]] as string;

            return getLink(path);
        }
    };
    let promise = getImage();

    const modifier = Platform.isMacOS ? "Meta" : "Control";
    function open(evt: MouseEvent) {
        if (!file) return;
        const leaf = plugin.app.workspace.getLeaf(
            evt.getModifierState(modifier) ? "window" : "split"
        );
        leaf.openFile(file);
    }
    function popover(evt: MouseEvent & { currentTarget: HTMLDivElement }) {
        plugin.app.workspace.trigger(
            "link-hover",
            {},
            evt.currentTarget,
            file.path,
            context
        );
    }
</script>

{#each item.properties as property}
    {#if property in monster}
        {#await promise then image}
            {#if image}
                <div
                    class="image"
                    class:pointer={file != null}
                    on:click={(evt) => open(evt)}
                    on:mouseenter={(evt) => popover(evt)}
                >
                    <img src={image} alt={monster.name} />
                </div>
            {/if}
        {/await}
    {/if}
{/each}

<style>
    .image {
        width: 75px;
        height: 75px;
    }
    .image.pointer {
        cursor: pointer;
    }
    img {
        object-fit: cover;
        width: 100%;
        height: 100%;
        border-radius: 100%;
        border: 2px solid var(--statblock-primary-color);
        object-position: center;
    }
</style>
