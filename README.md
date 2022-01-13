# Obsidian 5e Statblocks

Create 5e-styled statblocks in Obsidian.md notes.

<img src="https://raw.githubusercontent.com/valentine195/obsidian-5e-statblocks/master/images/example.PNG">

## Usage

A statblock may be defined in a note using the syntax below.

All fields are optional - if not provided, that Statblock will simply not render them.

The `monster` field may be combined with other fields to override the field. See [Overriding Fields](#Overriding-Fields).

The spellcasting trait requires a special field (`spells`) - See [Spellcasting](#Spellcasting)

````
```statblock
monster: <SRD Monster Name>
```
````

OR

````
```statblock
name: string
size: string
type: string
subtype: string
alignment: string
ac: number
hp: number
hit_dice: string
speed: string
stats: [number, number, number, number, number, number]
fage_stats: [number, number, number, number, number, number, number, number, number]
saves:
    - <ability-score>: number
skillsaves:
    - <skill-name>: number
damage_vulnerabilities: string
damage_resistances: string
damage_immunities: string
condition_immunities: string
senses: string
languages: string
cr: number
spells:
    - <description>
    - <spell level>: <spell-list>
traits:
    - [<trait-name>, <trait-description>]
    - ...
actions:
    - [<trait-name>, <trait-description>]
    - ...
legendary_actions:
    - [<legendary_actions-name>, <legendary_actions-description>]
    - ...
reactions:
    - [<reaction-name>, <reaction-description>]
    - ...
```
````

### Overriding Fields

The `monster` field may be combined with other fields to override the field of the specified SRD monster. For example:

````
```statblock
monster: Ancient Black Dragon
name: Paarthunax
```
````

<img src="https://raw.githubusercontent.com/valentine195/obsidian-5e-statblocks/master/images/override.PNG">

### Spellcasting

The spellcasting trait requires a special `spells` field using the following syntax:

> **Please Note:**
>
> Overriding an existing monster's spells replaces the spells, _it does not combine_.

````
```statblock
spells:
    - The archmage is an 18th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 17, +9 to hit with spell attacks). The archmage can cast disguise self and invisibility at will and has the following wizard spells prepared
    - Cantrips (at will): fire bolt, light, mage hand, prestidigitation, shocking grasp
    - 1st level (4 slots): detect magic, identify, mage armor*, magic missile
    - 2nd level (3 slots): detect thoughts, mirror image, misty step
    - 3rd level (3 slots): counterspell, fly, lightning bolt
    - 4th level (3 slots): banishment, fire shield, stoneskin*
    - 5th level (3 slots): cone of cold, scrying, wall of force
    - 6th level (1 slot): globe of invulnerability
    - 7th level (1 slot): teleport
    - 8th level (1 slot): mind blank*
    - 9th level (1 slot): time stop
    - * The archmage casts these spells on itself before combat.
```
````

### Fantasy AGE

Those of you using the plugin for Fantasy AGE may use `fage_stats` to set the nine stats.

### Full Example

````
```statblock
name: Ancient Black Dragon
size: Gargantuan
type: dragon
subtype:
alignment: chaotic evil
ac: 22
hp: 367
hit_dice: 21d20
speed: 40 ft., fly 80 ft., swim 40 ft.
stats: [27, 14, 25, 16, 15, 19]
saves:
    - dexterity: 9
    - constitution: 14
    - wisdom: 9
    - charisma: 11
skillsaves:
    - perception: 16
    - stealth: 9
damage_vulnerabilities:
damage_resistances:
damage_immunities: acid
condition_immunities:
senses: blindsight 60 ft., darkvision 120 ft., passive Perception 26
languages: Common, Draconic
cr: 21
traits:
    - [Amphibious, The dragon can breathe air and water.]
    - [Legendary Resistance (3/Day), If the dragon fails a saving throw, it can choose to succeed instead.]
actions:
    - [Multiattack, The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.]
    - [Bite, Melee Weapon Attack:+ 15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 9 (2d8) acid damage.]
    - [Claw, Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage.]
    - [Tail, Melee Weapon Attack: +15 to hit, reach 20 ft ., one target. Hit: 17 (2d8 + 8) bludgeoning damage.]
    - [Frightful Presence, Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.]
    - [Acid Breath (Recharge 5-6), The dragon exhales acid in a 90-foot line that is 10 feet wide. Each creature in that line must make a DC 22 Dexterity saving throw, taking 67 (15d8) acid damage on a failed save, or half as much damage on a successful one.]
reactions:
legendary_actions:
    - [Detect, The dragon makes a Wisdom (Perception) check.]
    - [Tail Attack, The dragon makes a tail attack.]
    - [Wing Attack (Costs 2 Actions), The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 23 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.]
```
````

# Installation

## From within Obsidian

From Obsidian v0.9.8, you can activate this plugin within Obsidian by doing the following:

-   Open Settings > Third-party plugin
-   Make sure Safe mode is **off**
-   Click Browse community plugins
-   Search for this plugin
-   Click Install
-   Once installed, close the community plugins window and activate the newly installed plugin

## From GitHub

-   Download the Latest Release from the Releases section of the GitHub Repository
-   Extract the plugin folder from the zip to your vault's plugins folder: `<vault>/.obsidian/plugins/`  
    Note: On some machines the `.obsidian` folder may be hidden. On MacOS you should be able to press `Command+Shift+Dot` to show the folder in Finder.
-   Reload Obsidian
-   If prompted about Safe Mode, you can disable safe mode and enable the plugin.
    Otherwise head to Settings, third-party plugins, make sure safe mode is off and
    enable the plugin from there.

### Updates

You can follow the same procedure to update the plugin

# Warning

This plugin comes with no guarantee of stability and bugs may delete data.
Please ensure you have automated backups.

# TTRPG plugins

If you're using Obsidian to run/plan a TTRPG, you may find my other plugin useful:

-   [Obsidian Leaflet](https://github.com/valentine195/obsidian-leaflet-plugin) - Add interactive maps to Obsidian.md notes
-   [Dice Roller](https://github.com/valentine195/obsidian-dice-roller) - Inline dice rolling for Obsidian.md
-   [Initiative Tracker](https://github.com/valentine195/obsidian-initiative-tracker) - Track TTRPG Initiative in Obsidian 

<a href="https://www.buymeacoffee.com/valentine195"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=valentine195&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=ff0000"></a>