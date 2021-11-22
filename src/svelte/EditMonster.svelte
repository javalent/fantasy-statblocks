<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Monster } from "@types";
    import { ButtonComponent, ExtraButtonComponent } from "obsidian";

    const dispatch = createEventDispatcher();

    export let monster: Monster;
    let useJson = true;
    let textArea: HTMLTextAreaElement;

    const json = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon("code-glyph")
            .setTooltip("JSON")
            .onClick(() => {
                useJson = true;
            });
    };
    const ui = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon("bullet-list")
            .setTooltip("UI")
            .onClick(() => {
                useJson = false;
            });
    };
    const save = (node: HTMLElement) => {
        new ButtonComponent(node)
            .setIcon("checkmark")
            .setTooltip("Save Changes")
            .onClick(() => {
                if (useJson) {
                    try {
                        monster = JSON.parse(textArea.value);
                    } catch (e) {}
                }
                dispatch("save", monster);
            });
    };
    const cancel = (node: HTMLElement) => {
        new ExtraButtonComponent(node)
            .setIcon("cross")
            .setTooltip("Cancel")
            .onClick(() => {
                dispatch("cancel");
            });
    };
</script>

<div class="edit-monster-modal">
    <h2>Edit Monster</h2>
    <div class="top-level">
<!--         <div class="json">
            <div use:ui />
            <div use:json />
        </div> -->
        {#if useJson}
            <textarea bind:this={textArea}
                >{JSON.stringify(monster, null, 2)}
            </textarea>
<!--         {:else}
            <div class="info">
                <div>
                    <label for="name">Name</label>
                    <input id="name" type="text" bind:value={monster.name} />
                </div>
                <div>
                    <label for="source">Source</label>
                    <input
                        id="source"
                        type="text"
                        bind:value={monster.source}
                    />
                </div>
                <div>
                    <label for="type">Type</label>
                    <input id="type" type="text" bind:value={monster.type} />
                </div>
                <div>
                    <label for="size">Size</label>
                    <input id="size" type="text" bind:value={monster.size} />
                </div>
                <div>
                    <label for="alignment">Alignment</label>
                    <input
                        id="alignment"
                        type="text"
                        bind:value={monster.alignment}
                    />
                </div>
            </div>
            <div class="basic-stats">
                <div>
                    <label for="hp">Hit Points</label>
                    <input id="hp" type="text" bind:value={monster.hp} />
                </div>
                <div>
                    <label for="ac">Armor Class</label>
                    <input id="ac" type="text" bind:value={monster.ac} />
                </div>
                <div>
                    <label for="speed">Speed</label>
                    <input id="speed" type="text" bind:value={monster.speed} />
                </div>
                <div>
                    <label for="senses">Senses</label>
                    <input
                        id="senses"
                        type="text"
                        bind:value={monster.senses}
                    />
                </div>
                <div>
                    <label for="languages">Languages</label>
                    <input
                        id="languages"
                        type="text"
                        bind:value={monster.languages}
                    />
                </div>
                <div>
                    <label for="cr">Challenge</label>
                    <input id="cr" type="text" bind:value={monster.cr} />
                </div>
            </div>
            <div class="attributes">
                <div>
                    <label for="str">Str.</label>
                    <input id="str" type="text" bind:value={monster.stats[0]} />
                </div>
                <div>
                    <label for="dex">Dex.</label>
                    <input id="dex" type="text" bind:value={monster.stats[1]} />
                </div>
                <div>
                    <label for="con">Con.</label>
                    <input id="con" type="text" bind:value={monster.stats[2]} />
                </div>
                <div>
                    <label for="int">Int.</label>
                    <input id="int" type="text" bind:value={monster.stats[3]} />
                </div>
                <div>
                    <label for="wis">Wis.</label>
                    <input id="wis" type="text" bind:value={monster.stats[4]} />
                </div>
                <div>
                    <label for="cha">Cha.</label>
                    <input id="cha" type="text" bind:value={monster.stats[5]} />
                </div>
            </div>
            <div class="damages">
                <p>Damage Vulnerabilities</p>
                <p>Damage Resistances</p>
                <p>Damage Immunities</p>
            </div> -->
        {/if}
    </div>
    <div class="buttons">
        <div use:save />
        <div use:cancel />
    </div>
</div>

<style>
    .top-level {
        display: flex;
        flex-flow: column nowrap;
    }
    textarea {
        flex-grow: 1;
        height: 500px;
        max-height: 50vh;
    }
    /* .json {
        margin-bottom: 1rem;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    } */

    /* .attributes {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
    } */

    .buttons {
        margin-top: 1rem;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
</style>
