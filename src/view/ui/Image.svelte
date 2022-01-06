<script lang="ts">
    import type { Monster } from "@types";
    import type { ImageItem } from "src/data/constants";
    import type StatBlockPlugin from "src/main";
    import { getContext } from "svelte";
    import type { App, TFile } from "obsidian";

    export let monster: Monster;
    export let item: ImageItem;

    const plugin = getContext<StatBlockPlugin>("plugin");
    const context = getContext<string>("context");
    function parseLink(link: string) {
        return link?.replace(/(\[|\])/g, "");
    }
    async function getBlob(url: string, app: App) {
        let response, blob: Blob;
        url = decodeURIComponent(url);
        try {
            if (/https?:/.test(url)) {
                //url
                response = await fetch(url);
                blob = await response.blob();
            } else if (/obsidian:\/\/open/.test(url)) {
                //obsidian link
                let [, filePath] = url.match(/\?vault=[\s\S]+?&file=([\s\S]+)/);

                filePath = decodeURIComponent(filePath);
                let file = app.vault.getAbstractFileByPath(filePath);
                if (!file) throw new Error();
                let buffer = await app.vault.readBinary(file as TFile);
                blob = new Blob([new Uint8Array(buffer)]);
            } else {
                //file exists on disk;
                let file = app.metadataCache.getFirstLinkpathDest(
                    parseLink(url).split("|").shift(),
                    context
                );
                if (!file) throw new Error();

                let buffer = await app.vault.readBinary(file);
                blob = new Blob([new Uint8Array(buffer)]);
            }
        } catch (e) {
            console.error(e);
        }
        return { blob, id: encodeURIComponent(url) };
    }
    function toDataURL(blob: Blob): Promise<string> {
        //determine link type
        return new Promise(async (resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    let data = reader.result.slice(
                        reader.result.indexOf(";base64,")
                    );
                    resolve(data);
                } else {
                    reject();
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
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

            const { blob } = await getBlob(path, plugin.app);
            if (!blob) return;

            const data = await toDataURL(blob);

            if (!data) return;

            return `data:image/png${data}`;
        }
    };
    let promise = getImage();
</script>

{#each item.properties as property}
    {#if property in monster}
        {#await promise then image}
            {#if image}
                <div class="image">
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
    img {
        object-fit: cover;
        width: 100%;
        height: 100%;
        border-radius: 100%;
        border: 2px solid var(--statblock-primary-color);
        object-position: center;
    }
</style>
