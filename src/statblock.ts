import { MarkdownRenderChild } from "obsidian";
import { CR } from "./data/cr";
import { getMod } from "./util";

export default class StatBlockRenderer extends MarkdownRenderChild {
    topBar: HTMLDivElement;
    bottomBar: HTMLDivElement;
    monster: StatblockMonster;
    loaded: boolean = false;
    statblockEl: HTMLDivElement;
    contentEl: HTMLDivElement;
    constructor(container: HTMLElement, monster: StatblockMonster) {
        super(container);
        this.monster = monster;
    }
    async onload() {
        this.loaded = true;
        /** Build Structure */
        this.statblockEl = this.containerEl.createDiv({
            cls: "obsidian-statblock-plugin",
            attr: { style: "visibility: hidden;" }
        });
        this.topBar = this.statblockEl.createDiv("bar top");
        this.contentEl = this.statblockEl.createDiv("content-wrap");
        this.bottomBar = this.statblockEl.createDiv("bar bottom");

        /** Build Inner Blocks */
        // Name Block
        this._buildName(
            this.contentEl.createDiv("creature-heading"),
            this.monster.name,
            this.monster.size,
            this.monster.type,
            this.monster.subtype,
            this.monster.alignment
        );
        this.contentEl.createDiv("tapered-rule");

        // Top Stats ( ac, hp, speed )
        this._buildTopStats(
            this.contentEl.createDiv("top-stats"),
            this.monster.ac,
            this.monster.hp,
            this.monster.speed
        );
        this.contentEl.createDiv("tapered-rule");

        // Ability Score Table
        this._buildAbilityScores(this.contentEl.createDiv("abilities"), [
            ...(this.monster.stats ?? [10, 10, 10, 10, 10, 10])
        ]);
        this.contentEl.createDiv("tapered-rule");

        /** Build Immunities */
        if (
            this.monster.damage_immunities &&
            this.monster.damage_immunities.length
        ) {
            this._buildProperty(
                this.contentEl,
                `Damage Immunities`,
                this.monster.damage_immunities
            );
        }
        /** Build Immunities */
        if (
            this.monster.condition_immunities &&
            this.monster.condition_immunities.length
        ) {
            this._buildProperty(
                this.contentEl,
                `Condition Immunities`,
                this.monster.condition_immunities
            );
        }

        /** Build Resistances */
        if (
            this.monster.damage_resistances &&
            this.monster.damage_resistances.length
        ) {
            this._buildProperty(
                this.contentEl,
                `Resistances`,
                this.monster.damage_resistances
            );
        }

        /** Build Resistances */
        if (
            this.monster.damage_vulnerabilities &&
            this.monster.damage_vulnerabilities.length
        ) {
            this._buildProperty(
                this.contentEl,
                `Damage Vulnerabilities`,
                this.monster.damage_vulnerabilities
            );
        }

        /** Build Senses */
        if (this.monster.senses && this.monster.senses.length) {
            this._buildProperty(this.contentEl, `Senses`, this.monster.senses);
        }

        /** Build Languages & CR (always displayed) */
        this._buildProperty(
            this.contentEl,
            `Languages`,
            this.monster.languages && this.monster.languages.length
                ? this.monster.languages
                : "—"
        );
        this._buildCR(this.monster.cr);

        /** End of Section */
        this.contentEl.createDiv("tapered-rule");

        /** Add Traits, if any */
        this.monster.traits.forEach(({ name, desc }) => {
            try {
                this._buildPropertyBlock(this.contentEl, name, desc);
            } catch (e) {}
        });

        /** Add Actions, if any */
        if (this.monster.actions.size) {
            this._createSectionHeader(this.contentEl, "Actions");
            this.monster.actions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(this.contentEl, name, desc);
                } catch (e) {}
            });
        }

        /** Add Legendary Actions, if any */
        if (this.monster.legendary_actions.size) {
            this._createSectionHeader(this.contentEl, "Legendary Actions");
            this.monster.legendary_actions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(this.contentEl, name, desc);
                } catch (e) {}
            });
        }

        /** Add Reactions, if any */
        if (this.monster.reactions.size) {
            this._createSectionHeader(this.contentEl, "Reactions");
            this.monster.reactions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(this.contentEl, name, desc);
                } catch (e) {}
            });
        }
    }
    setMaxWidth(pixels: number) {
        if (!this.loaded) return;
        if (this.contentEl.getBoundingClientRect().height <= 500) {
            pixels = 400;
        }
        this._setStyleAttr("maxWidth", pixels);
    }
    setWidth(pixels: number) {
        if (!this.loaded) return;
        if (this.contentEl.getBoundingClientRect().height <= 500) {
            pixels = 400;
        }
        this._setStyleAttr("width", pixels);
    }

    private _createSectionHeader(el: HTMLElement, text: string) {
        el.createEl("h3", { cls: "section-header", text: text });
    }

    private _buildAbilityScores(abilityScoresEl: HTMLElement, stats: any) {
        ["STR", "DEX", "CON", "INT", "WIS", "CHA"].forEach((stat, index) => {
            let el = abilityScoresEl.createDiv("ability-score");
            el.createEl("strong", { text: stat });

            el.createDiv({
                text: `${stats[index]} (${getMod(stats[index])})`
            });
        });
    }
    private _buildName(
        creatureHeadingEl: HTMLElement,
        name: string,
        size: string,
        type: string,
        subtype: string,
        alignment: string
    ) {
        if (name) creatureHeadingEl.createDiv({ cls: "name", text: name });
        let sub = creatureHeadingEl.createDiv({
            cls: "subheading"
        });
        let text = "";
        if (size)
            text += `${size[0].toUpperCase() + size.slice(1).toLowerCase()}`;
        if (type) {
            text += `${text.length ? " " : ""}` + type;
            if (subtype) text += ` (${subtype})`;
        }
        if (alignment) text += `${text.length ? ", " : ""}` + alignment;
        sub.appendText(text);
    }
    private _buildTopStats(
        topStatsEl: HTMLElement,
        ac: number,
        hp: number,
        speed: string
    ) {
        if (ac) this._buildProperty(topStatsEl, `Armor Class`, `${ac}`);
        if (hp) this._buildProperty(topStatsEl, `Hit Points`, `${hp}`);
        if (speed) this._buildProperty(topStatsEl, `Speed`, speed);
    }
    private _buildCR(cr: string | number) {
        this._buildProperty(
            this.contentEl,
            `Challenge`,
            cr && `${cr}`.length ? cr + ` (${CR[`${cr}`].xp} XP)` : "—"
        );
    }
    private _buildProperty(el: HTMLElement, header: string, text: string) {
        const property = el.createDiv("property-line");
        property.createDiv({ cls: "property-name", text: header });
        property.createDiv({ cls: "property-text", text: text });
    }
    private _buildPropertyBlock(el: HTMLElement, header: string, text: string) {
        const property = el.createDiv("property");
        property.createDiv({ cls: "property-name", text: header });
        property.createDiv({ cls: "property-text", text: text });
    }

    private _setStyleAttr(type: "width" | "maxWidth", pixels: number) {
        this.statblockEl.style[type] = `calc(${pixels}px + ${
            pixels / 400
        }em + 4px)`;
        this.topBar.style[type] = `calc(${pixels}px + ${pixels / 400}em + 4px)`;
        this.bottomBar.style[type] = `calc(${pixels}px + ${
            pixels / 400
        }em + 4px)`;
        this.contentEl.style[type] = `calc(${pixels}px + ${
            pixels / 400
        }em + 4px)`;
    }
}
