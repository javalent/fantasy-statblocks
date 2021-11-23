import { MarkdownRenderChild, setIcon } from "obsidian";
import {
    AbilityAliases,
    CR,
    DiceBySize,
    EXPORT_SYMBOL,
    SAVE_SYMBOL,
    Statblock5e,
    StatblockItem
} from "../data/constants";
import { catchError, catchErrorAsync, getMod, toTitleCase } from "../util/util";
import type { Spell, Monster } from "@types";

import Statblock from "./Statblock.svelte";
import type StatBlockPlugin from "src/main";

export default class StatBlockRenderer extends MarkdownRenderChild {
    topBar: HTMLDivElement;
    bottomBar: HTMLDivElement;
    loaded: boolean = false;
    statblockEl: HTMLDivElement;
    contentEl: HTMLDivElement;
    statblock: StatblockItem[] = Statblock5e;
    constructor(
        container: HTMLElement,
        public monster: Monster,
        private plugin: StatBlockPlugin,
        private canSave: boolean,
        private canExport: boolean = true
    ) {
        super(container);

        new Statblock({
            target: this.containerEl,
            props: {
                monster: this.monster,
                statblock: this.statblock,
                plugin: this.plugin
            }
        });
    }

    old() {
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

        // Top Stats ( ac, hp, speed )
        this._buildTopStats(
            this.contentEl.createDiv("top-stats"),
            this.monster
        );

        // Ability Score Table
        if (this.monster.fage_stats) {
            this._buildFAbilityScores(
                this.contentEl.createDiv("abilities fage"),
                this.monster.fage_stats
            );
            this.contentEl.createDiv("tapered-rule");
        } else if (this.monster.stats) {
            this._buildAbilityScores(
                this.contentEl.createDiv("abilities"),
                this.monster.stats
            );
            this.contentEl.createDiv("tapered-rule");
        }

        this._buildBottomStats();

        /** Add Traits, if any */
        // Spellcasting first
        if (this.monster.spells && this.monster.spells.length) {
            let spellsEl = this.contentEl.createDiv();
            this._buildSpells(spellsEl, this.monster.spells);
        }
        if (this.monster.traits.length) {
            let traitEl = this.contentEl.createDiv();
            this.monster.traits.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(traitEl, name, desc);
                } catch (e) {}
            });
        }

        /** Add Actions, if any */
        if (this.monster.actions.length) {
            let actionEl = this.contentEl.createDiv();
            this._createSectionHeader(actionEl, "Actions");
            this.monster.actions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(actionEl, name, desc);
                } catch (e) {}
            });
        }

        /** Add Legendary Actions, if any */
        if (this.monster.legendary_actions.length) {
            let actionEl = this.contentEl.createDiv();
            this._createSectionHeader(actionEl, "Legendary Actions");
            this.monster.legendary_actions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(actionEl, name, desc);
                } catch (e) {}
            });
        }

        /** Add Reactions, if any */
        if (this.monster.reactions.length) {
            let actionEl = this.contentEl.createDiv();
            this._createSectionHeader(actionEl, "Reactions");
            this.monster.reactions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(actionEl, name, desc);
                } catch (e) {}
            });
        }
    }
    @catchError
    private _buildBottomStats() {
        let needRule = false;
        let element = createDiv();
        /** Build Saving Throws */
        if (this.monster.saves && this.monster.saves.length) {
            let save = [];
            for (let i = 0; i < this.monster.saves.length; i++) {
                let ability = this.monster.saves[i];
                if (typeof ability != "object" || ability == null) continue;
                let key = Object.keys(ability).shift();
                if (!key) continue;
                if (!AbilityAliases[key.toLowerCase()]) continue;

                let value = Object.values(ability).shift();
                save.push(
                    `${AbilityAliases[key.toLowerCase()]} ${
                        value > 0 ? "+" : ""
                    }${value}`
                );
            }

            this._buildProperty(element, `Saving Throws`, save.join(", "));
            needRule = true;
        }
        /** Build Skill Saves */
        if (this.monster.skillsaves && this.monster.skillsaves.length) {
            let save = [];
            for (let i = 0; i < this.monster.skillsaves.length; i++) {
                let ability = this.monster.skillsaves[i];
                if (typeof ability != "object" || ability == null) continue;
                let key = Object.keys(ability).shift();
                if (!key) continue;
                let value = Object.values(ability).shift();
                if (!value) continue;
                save.push(
                    `${toTitleCase(key)} ${value > 0 ? "+" : ""}${value}`
                );
            }

            this._buildProperty(element, `Skills`, save.join(", "));
            needRule = true;
        }

        /** Build Immunities */
        if (
            this.monster.damage_immunities &&
            this.monster.damage_immunities.length
        ) {
            this._buildProperty(
                element,
                `Damage Immunities`,
                this.monster.damage_immunities
            );
            needRule = true;
        }
        /** Build Immunities */
        if (
            this.monster.condition_immunities &&
            this.monster.condition_immunities.length
        ) {
            this._buildProperty(
                element,
                `Condition Immunities`,
                this.monster.condition_immunities
            );
            needRule = true;
        }

        /** Build Resistances */
        if (
            this.monster.damage_resistances &&
            this.monster.damage_resistances.length
        ) {
            this._buildProperty(
                element,
                `Resistances`,
                this.monster.damage_resistances
            );
            needRule = true;
        }

        /** Build Vulnerabilities */
        if (
            this.monster.damage_vulnerabilities &&
            this.monster.damage_vulnerabilities.length
        ) {
            this._buildProperty(
                element,
                `Damage Vulnerabilities`,
                this.monster.damage_vulnerabilities
            );
            needRule = true;
        }

        /** Build Senses */
        if (this.monster.senses && this.monster.senses.length) {
            this._buildProperty(element, `Senses`, this.monster.senses);
            needRule = true;
        }

        /** Build Languages */
        if (this.monster.languages) {
            this._buildProperty(
                element,
                `Languages`,
                this.monster.languages && this.monster.languages.length
                    ? this.monster.languages
                    : "—"
            );
            needRule = true;
        }
        if (this.monster.cr) {
            this._buildCR(element, this.monster.cr);
            needRule = true;
        }

        /** End of Section */

        if (needRule) {
            this.contentEl.appendChild(element);
            this.contentEl.createDiv("tapered-rule");
        }
    }

    @catchError
    private _buildSpells(el: HTMLElement, spells: Spell[]) {
        const spellEl = el.createDiv("statblock-spellcasting");
        let spellText = `${this.monster.name} knows the following spells:`;
        if (typeof spells[0] == "string") {
            spellText = spells.shift() as unknown as string;
        }
        if (spellText[spellText.length - 1] != ":") spellText += ":";
        this._buildPropertyBlock(spellEl, `Spellcasting`, spellText);

        const listEl = spellEl.createEl("ul", "spell-list");
        for (let i = 0; i < spells.length; i++) {
            const spell = spells[i];
            if (typeof spell === "string") {
                listEl.createSpan({ cls: `spell-line`, text: spell });
                continue;
            }
            try {
                const innerSpellEl = listEl.createEl("li", `spell-line`);
                innerSpellEl.createSpan({
                    cls: `spell-level`,
                    text: Object.keys(spell)[0] + ": "
                });
                innerSpellEl.createSpan({
                    cls: `spells`,
                    text: Object.values(spell)[0]
                });
            } catch (e) {
                continue;
            }
        }
    }

    @catchErrorAsync
    async onload() {
        this.loaded = true;
    }

    @catchError
    setMaxWidth(pixels: number) {
        if (!this.loaded) return;
        if (this.contentEl.getBoundingClientRect().height <= 500) {
            pixels = 400;
        }
        this._setStyleAttr("maxWidth", pixels);
    }

    @catchError
    setWidth(pixels: number, override: boolean = false) {
        if (!this.loaded) return;
        if (!override && this.contentEl.getBoundingClientRect().height <= 500) {
            pixels = 400;
        }
        this._setStyleAttr("width", pixels);
    }

    @catchError
    private _createSectionHeader(el: HTMLElement, text: string) {
        el.createEl("h3", { cls: "section-header", text: text });
    }

    @catchError
    private _buildAbilityScores(abilityScoresEl: HTMLElement, stats: any) {
        ["STR", "DEX", "CON", "INT", "WIS", "CHA"].forEach((stat, index) => {
            let el = abilityScoresEl.createDiv("ability-score");
            el.createEl("strong", { text: stat });

            el.createDiv({
                text: `${stats[index]} (${getMod(stats[index])})`
            });
        });
    }

    @catchError
    private _buildFAbilityScores(abilityScoresEl: HTMLElement, stats: any) {
        const top = abilityScoresEl.createDiv("top");
        const bottom = abilityScoresEl.createDiv("bottom");
        [
            "Accuracy",
            "Communication",
            "Constitution",
            "Dexterity",
            "Fighting"
        ].forEach((stat, index) => {
            let el = top.createDiv("ability-score");
            el.createEl("strong", { text: `${stat}` });

            el.createDiv({
                text: `${stats[index]}` /*  (${getMod(stats[index])}) */
            });
        });
        ["Intelligence", "Perception", "Strength", "Willpower"].forEach(
            (stat, index) => {
                let el = bottom.createDiv("ability-score");
                el.createEl("strong", { text: `${stat}` });

                el.createDiv({
                    text: `${stats[index + 5]}` /*  (${getMod(stats[index])}) */
                });
            }
        );
    }

    @catchError
    private _buildName(
        creatureHeadingEl: HTMLElement,
        name: string,
        size: string,
        type: string,
        subtype: string,
        alignment: string
    ) {
        let needRule = false;
        if (name) {
            const nameEl = creatureHeadingEl.createDiv({ cls: "name" });
            nameEl.createSpan({ text: name });
            const iconsEl = nameEl.createDiv("statblock-icons");
            if (this.canSave) {
                const saveEl = iconsEl.createDiv({
                    cls: "clickable-icon",
                    attr: { "aria-label": "Save as Homebrew" }
                });
                this.monster.source = "Homebrew";
                saveEl.onclick = () => this.plugin.saveMonster(this.monster);
                setIcon(saveEl, SAVE_SYMBOL);
            }
            if (this.canExport) {
                const iconEl = iconsEl.createDiv({
                    cls: "clickable-icon",
                    attr: { "aria-label": "Export as PNG" }
                });
                iconEl.onclick = () =>
                    this.plugin.exportAsPng(name, this.containerEl);
                setIcon(iconEl, EXPORT_SYMBOL);
            }

            needRule = true;
        }
        if (size || type || alignment) {
            let sub = creatureHeadingEl.createDiv({
                cls: "subheading"
            });
            let text = "";
            if (size)
                text += `${
                    size[0].toUpperCase() + size.slice(1).toLowerCase()
                }`;
            if (type) {
                text += `${text.length ? " " : ""}` + type;
                if (subtype) text += ` (${subtype})`;
            }
            if (alignment) text += `${text.length ? ", " : ""}` + alignment;
            sub.appendText(text);
            needRule = true;
        }

        if (needRule) this.contentEl.createDiv("tapered-rule");
    }

    @catchError
    private _buildTopStats(
        topStatsEl: HTMLElement,
        /* ac: number,
        hp: number,
        hit_dice: string,
        speed: string */
        monster: Monster
    ) {
        let { ac, hp, hit_dice, speed } = monster;
        let needRule = false;
        if (ac) {
            this._buildProperty(topStatsEl, `Armor Class`, `${ac}`);
            needRule = true;
        }
        if (hp) {
            let line = `${hp}`;
            if (hit_dice) {
                line += ` (${hit_dice})`;
            } else {
                //try to calculate
                const { size = "medium", stats = [] } = monster;
                const [, , con = 10] = stats;
                const mod = getMod(con);
                const dice = DiceBySize[size] ?? 8;
                const average = dice / 2 + 0.5;

                const needed = Math.ceil(Number(hp) / (average + Number(mod)));
                line += ` (${needed}d${dice} + ${needed * Number(mod)})`;
            }
            this._buildProperty(topStatsEl, `Hit Points`, line);
            needRule = true;
        }
        if (speed) {
            this._buildProperty(topStatsEl, `Speed`, speed);
            needRule = true;
        }
        if (needRule) {
            this.contentEl.createDiv("tapered-rule");
        }
    }

    @catchError
    private _buildCR(el: HTMLElement, cr: string | number) {
        if (!cr) return;
        if (typeof cr !== "string" && typeof cr !== "number") return;
        if (!CR[`${cr}`]) return;

        this._buildProperty(el, `Challenge`, cr + ` (${CR[`${cr}`].xp} XP)`);
    }

    @catchError
    private _buildProperty(el: HTMLElement, header: string, text: string) {
        const property = el.createDiv("property-line");
        property.createDiv({ cls: "property-name", text: header });
        property.createSpan({ cls: "property-text", text: text });
    }

    @catchError
    private _buildPropertyBlock(el: HTMLElement, header: string, text: string) {
        const property = el.createDiv("property");
        property.createDiv({ cls: "property-name", text: header });
        property.createSpan({ cls: "property-text", text: text });
    }

    @catchError
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
