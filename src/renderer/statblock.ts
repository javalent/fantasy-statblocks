import { MarkdownRenderChild, setIcon } from "obsidian";
import { AbilityAliases, CR, DiceBySize, SAVE_SYMBOL } from "../data/constants";
import { catchError, catchErrorAsync, getMod, toTitleCase } from "../util/util";
import { Spell, Monster, StatblockMonsterPlugin } from "@types";

export default class StatBlockRenderer extends MarkdownRenderChild {
    topBar: HTMLDivElement;
    bottomBar: HTMLDivElement;
    monster: Monster;
    loaded: boolean = false;
    statblockEl: HTMLDivElement;
    contentEl: HTMLDivElement;
    constructor(
        container: HTMLElement,
        monster: Monster,
        private plugin: StatblockMonsterPlugin,
        private canSave: boolean
    ) {
        super(container);
        this.monster = monster;
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
        if (this.monster.stats) {
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
            this._buildSpells(this.contentEl, this.monster.spells);
        }
        this.monster.traits.forEach(({ name, desc }) => {
            try {
                this._buildPropertyBlock(this.contentEl, name, desc);
            } catch (e) {}
        });

        /** Add Actions, if any */
        if (this.monster.actions.length) {
            this._createSectionHeader(this.contentEl, "Actions");
            this.monster.actions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(this.contentEl, name, desc);
                } catch (e) {}
            });
        }

        /** Add Legendary Actions, if any */
        if (this.monster.legendary_actions.length) {
            this._createSectionHeader(this.contentEl, "Legendary Actions");
            this.monster.legendary_actions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(this.contentEl, name, desc);
                } catch (e) {}
            });
        }

        /** Add Reactions, if any */
        if (this.monster.reactions.length) {
            this._createSectionHeader(this.contentEl, "Reactions");
            this.monster.reactions.forEach(({ name, desc }) => {
                try {
                    this._buildPropertyBlock(this.contentEl, name, desc);
                } catch (e) {}
            });
        }
    }
    @catchError
    private _buildBottomStats() {
        let needRule = false;
        /** Build Saving Throws */
        if (this.monster.saves) {
            let save = [];
            for (let i = 0; i < this.monster.saves.length; i++) {
                let ability = this.monster.saves[i];
                if (typeof ability != "object" || ability == null) continue;
                let key = Object.keys(ability).shift();
                if (!AbilityAliases[key.toLowerCase()]) continue;

                let value = Object.values(ability).shift();
                save.push(
                    `${AbilityAliases[key.toLowerCase()]} ${
                        value > 0 ? "+" : ""
                    }${value}`
                );
            }

            this._buildProperty(
                this.contentEl,
                `Saving Throws`,
                save.join(", ")
            );
            needRule = true;
        }
        /** Build Skill Saves */
        if (this.monster.skillsaves) {
            let save = [];
            for (let i = 0; i < this.monster.skillsaves.length; i++) {
                let ability = this.monster.skillsaves[i];
                if (typeof ability != "object" || ability == null) continue;
                let key = Object.keys(ability).shift();
                let value = Object.values(ability).shift();
                save.push(
                    `${toTitleCase(key)} ${value > 0 ? "+" : ""}${value}`
                );
            }

            this._buildProperty(this.contentEl, `Skills`, save.join(", "));
            needRule = true;
        }

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
            needRule = true;
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
            needRule = true;
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
            needRule = true;
        }

        /** Build Vulnerabilities */
        if (
            this.monster.damage_vulnerabilities &&
            this.monster.damage_vulnerabilities.length
        ) {
            this._buildProperty(
                this.contentEl,
                `Damage Vulnerabilities`,
                this.monster.damage_vulnerabilities
            );
            needRule = true;
        }

        /** Build Senses */
        if (this.monster.senses && this.monster.senses.length) {
            this._buildProperty(this.contentEl, `Senses`, this.monster.senses);
            needRule = true;
        }

        /** Build Languages */
        if (this.monster.languages) {
            this._buildProperty(
                this.contentEl,
                `Languages`,
                this.monster.languages && this.monster.languages.length
                    ? this.monster.languages
                    : "—"
            );
            needRule = true;
        }
        if (this.monster.cr) {
            this._buildCR(this.monster.cr);
            needRule = true;
        }

        /** End of Section */

        if (needRule) {
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
        /** Build Structure */
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
    setWidth(pixels: number) {
        if (!this.loaded) return;
        if (this.contentEl.getBoundingClientRect().height <= 500) {
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
            if (this.canSave) {
                const iconEl = nameEl.createDiv("clickable-icon");
                this.monster.source = "Homebrew";
                iconEl.onclick = () => this.plugin.saveMonster(this.monster);
                setIcon(iconEl, SAVE_SYMBOL.toString());
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
    private _buildCR(cr: string | number) {
        if (!cr) return;
        if (typeof cr !== "string" && typeof cr !== "number") return;
        if (!CR[`${cr}`]) return;

        this._buildProperty(
            this.contentEl,
            `Challenge`,
            cr + ` (${CR[`${cr}`].xp} XP)`
        );
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
