<script lang="ts">
    import {
        ColorComponent,
        DropdownComponent,
        ExtraButtonComponent,
        TextComponent
    } from "obsidian";
    import {
        type CSSPropertyDefinition,
        PropertiesByType,
        resolveProperty,
        isDerived,
        resolveRawProperty
    } from "src/layouts/layout.types";
    import { getContext } from "../context";
    import { writable } from "svelte/store";

    export let property: CSSPropertyDefinition;
    const layout = getContext("layout");

    let existing =
        resolveProperty($layout.cssProperties, property.property) ?? "";

    let prop = writable(property.property);

    let linked = isDerived($layout.cssProperties, $prop);

    const propertyControl = (node: HTMLElement) => {
        if (linked) {
            const options = PropertiesByType.get(property.type).filter(
                (d) => d.property != property.property
            );
            console.log(existing, property.property, options);
            const linkDrop = new DropdownComponent(node);
            for (const option of options) {
                linkDrop.addOption(option.property, option.name);
            }
            linkDrop.setValue(
                resolveRawProperty($layout.cssProperties, $prop) ??
                    options[0].property
            );
        } else {
            switch (property.type) {
                case "Color": {
                    new ColorComponent(node).setValue(existing);
                    break;
                }
                case "Style": /*  {
                    new DropdownComponent(node);
                    break;
                } */
                case "Variant": /*  {
                    new DropdownComponent(node);
                    break;
                } */
                case "Font":
                case "Weight":
                case "Size": {
                    new TextComponent(node).setValue(existing);
                    break;
                }
                case "Number": {
                    break;
                }
            }
        }

        new ExtraButtonComponent(node)
            .setIcon(linked ? "unlink" : "link")
            .onClick(() => (linked = !linked));
    }; /* 
    const referenceControl = (node: HTMLElement) => {
        const drop = new DropdownComponent(node);
    }; */
</script>

<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-name">
            {property.name}
        </div>
        <div class="setting-item-description">{property.desc ?? ""}</div>
    </div>
    {#key linked}
        <div class="setting-item-control" use:propertyControl />
    {/key}
</div>

<style scoped>
</style>
