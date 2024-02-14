<script lang="ts">
    import { Setting } from "obsidian";
    import { getContext } from "../context";
    import { DefaultProperties } from "src/settings/settings.constants";

    import SettingComponent from "./Setting.svelte";
    import type { LayoutCSSProperties } from "types/layout";

    const layout = getContext("layout");
    $: cssProperties = {
        ...DefaultProperties,
        ...($layout.cssProperties ?? {})
    };

    function update<T extends keyof LayoutCSSProperties>(
        prop: T,
        value: LayoutCSSProperties[T]
    ) {
        if (!$layout.cssProperties) {
            $layout.cssProperties = {};
        }
        $layout.cssProperties[prop] = value;
    }

    const description = (node: HTMLElement) => {
        new Setting(node)
            .setHeading()
            .setName("Colors")
            .setDesc(
                "Set the default colors for the layout here. You can choose to set the color directly, or link the color to a different property."
            );
    };
</script>

<div use:description></div>
<div class="statblock-additional-container">
    <div class="additional">
        <SettingComponent
            name={"Primary Color"}
            desc={"This property acts as a base color for other properties to reference."}
            value={cssProperties.primaryColor}
            on:change={(e) => update("primaryColor", e.detail)}
        />
        <SettingComponent
            name={"Background Color"}
            desc={"Set the color of the background."}
            value={cssProperties.backgroundColor}
            on:change={(e) => update("backgroundColor", e.detail)}
        />
        <SettingComponent
            name={"Border Color"}
            desc={"This controls the color of the Statblock borders."}
            value={cssProperties.borderColor}
            on:change={(e) => update("borderColor", e.detail)}
        />
        <SettingComponent
            name={"Font Color"}
            desc={"Control the base font color."}
            value={cssProperties.fontColor}
            on:change={(e) => update("fontColor", e.detail)}
        />
        <SettingComponent
            name={"Rule Color"}
            desc={"Control the color of horizontal rules."}
            value={cssProperties.ruleColor}
            on:change={(e) => update("ruleColor", e.detail)}
        />
        <SettingComponent
            name={"Bar Color"}
            desc={"This controls the color of top and bottom bar."}
            value={cssProperties.barColor}
            on:change={(e) => update("barColor", e.detail)}
        />
        <SettingComponent
            name={"Bar Border Color"}
            desc={"This controls the color of top and bottom bar borders."}
            value={cssProperties.barBorderColor}
            on:change={(e) => update("barBorderColor", e.detail)}
        />
    </div>
</div>

<style scoped>
    .statblock-additional-container {
        padding: 0px;
    }
</style>
