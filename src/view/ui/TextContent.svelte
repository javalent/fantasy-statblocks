<script lang="ts">
    import { stringify } from "src/util/util";

    //Note: All final rendered text should be wrapped in this element.
    import { getContext } from "svelte";

    export let textToRender: string;
    /* export let inline: boolean; */

    const tryToRenderLinks = getContext<boolean>("tryToRenderLinks");
    const context = getContext<string>("context");

    type SplitLink =
        | { text: string; isLink: false }
        | {
              text: string;
              isLink: true;
              href: string;
              title: string;
              isAlias: boolean;
          };

    const generateLink = (link: string) => {
        let title = "";
        let aliasIndex = link.indexOf("|");

        if (aliasIndex > 0) {
            title = link.slice(aliasIndex + 1);
            link = link.slice(0, aliasIndex);
        } else {
            title = link

                .split("#")
                .filter(function (e) {
                    return !!e;
                })
                .join(" > ");
        }
        if (link.endsWith("\\")) {
            link = link.slice(0, link.length - 1);
        }
        return {
            href: (link = link.replace(/\u00A0/g, " ")),
            title,
            isAlias: aliasIndex > 0
        };
    };

    const splitByLinks = (text: string): SplitLink[] => {
        return stringify(text)
            .split(/(<STATBLOCK-LINK>[\s\S]+?<\/STATBLOCK-LINK>)/)
            .filter((s) => s && s.length)
            .map((str) => {
                if (/<STATBLOCK-LINK>([\s\S]+?)<\/STATBLOCK-LINK>/.test(str)) {
                    let link = str.match(
                        /<STATBLOCK-LINK>([\s\S]+?)<\/STATBLOCK-LINK>/
                    )[1];
                    const { href, title, isAlias } = generateLink(link);

                    return {
                        isLink: true,
                        text: link,
                        href,
                        isAlias,
                        title
                    };
                }
                return { isLink: false, text: str };
            });
    };
</script>

<div class="statblock-rendered-text-content inline">
    {#if !tryToRenderLinks}
        {textToRender}
    {:else}
        {#each splitByLinks(textToRender) as split}
            {#if split.isLink}
                {#if split.isAlias}
                    <!-- svelte-ignore a11y-unknown-aria-attribute -->
                    <a
                        data-href={split.href}
                        href={split.href}
                        class="internal-link"
                        target="_blank"
                        rel="noreferrer"
                        aria-label={split.href}
                        aria-label-position="top">{split.title}</a
                    >
                {:else}
                    <a
                        data-href={split.href}
                        href={split.href}
                        class="internal-link"
                        target="_blank"
                        rel="noopener">{split.text}</a
                    >
                {/if}
            {:else}
                {split.text}
            {/if}
        {/each}
    {/if}
</div>

<style>
    .inline {
        display: inline;
    }
</style>
