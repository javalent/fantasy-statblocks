---
aliases: [Glossary]
has_children: false
has_toc: true
layout: default
nav_order: 1
parent: "The Basics of Fantasy Statblocks"
permalink: /:path/:basename
title: Glossary
---

# Glossary

When working with the Fantasy Bestiary, you may come across certain terminology that has multiple meanings in the English Language. This page has been created to define what those terms mean in the context of this plugin.

## Codeblock

In Markdown, a code block is a section of code that is displayed in a monospaced font and is usually surrounded by a contrasting background background to distinguish it from the rest of the text.

To define a code block in Obsidian, you can either use backticks (\`) to surround a small inline code snippet, or use triple backticks (\`\`\`) to surround a larger block of code. For example:

**Inline code block**
`dice: 100d100 + 100d100`

**Block code**

```js
//definition
getArrayRoller(options: any[], rolls: number = 1): Promise<ArrayRoller>;

ArrayRoller {
    /** Roll the array roller and generate a new set of results. */
    roll(): Promise<any>

    /** Property containing the container element of the array roller. Use this to attach it to the note's DOM */
    containerEl: HTMLElement;

    /** Property containing the array of randomly-generated results. This will change every time the array roller is rolled. */
    results: any[]
}

//example
const diceRoller = await diceRollerPlugin.getArrayRoller([1, 2, 3, 4, 5], 2);
```

## Key

`Aliases: Monster Property, Key-Value Pair`

A Key is a piece of data that is set. The Key should not change. It acts as an anchor for you to tell the rest of your code what to do with the data, or value, that goes next to your key.

HP: 200
*Key*: *Number*

Name: Ancient Red Dragon
*Key*: *[String](02-05-Glossary.md#String)*

Name: "Super Ancient Red Dragon"
*Key*: *[Wrapped String](02-05-Glossary.md#Wrapped%20Strings)*

In the case of Statblocks, a Key is what you will name your Monster Property, but it may not necessarily be the name that shows up as that property. For example:

```yaml
HP: 200
```

**Health**: 200

The Key is HP, but the block linked to HP allows for the text to render as Health.

The block can also change the value field with [Callbacks](../07_Callbacks/07-00-01-Index.md).

## String

`Aliases: Wrapped String`

In YAML, a string is a line of characters; akin to a sentence.

`Title: Smeller of Roses`
*Key*: *String*.

Colloquially, such as in discord, you may be asked if "your code is a string"? What is being asked in this case is: Is your String Wrapped in Quotes?

A Wrapped String is a way to force the code to parse its contents as they are written. Typically, this is done to preserve special characters:
    **+** A string wrapped by double quotes "" will parse escape characters, such as the backslash n `\n` to create a line break, or to allow an underscore `_` to be rendered to italicize a word. "I love pie.
    *Very Much*."
    **+** A string wrapped by single quotes '' will not parse escape characters. They will be presented as written. 'I love pie.\\n \_Very Much\_.'

### Wrapped Strings

You will see Wrapped Strings most commonly within the Trait blocks. However, they can be present in all property blocks depending upon the contents.

```yaml
abilities_mid:
  - name: "Frightful Presence"
    desc: " ([[aura]], [[emotion]], [[fear]], [[mental]]);  90 feet, DC 32."
  - name: "Deflecting Cloud"
    desc: "⬲ __Requirements__ The dragon is aware of the attack and has a free wing __Trigger__ The dragon is the target of a ranged attack __Effect__  The cloud dragon flexes a wing and creates a billowing cloud of mist. The dragon is treated as if they were [[hidden|hidden]] for the purposes of resolving the triggering attack, so normally the attacker must succeed at a DC 11 flat check to target them. The dragon also gains a +4 circumstance bonus to AC against the triggering attack."
```

## Value

In YAML, a value is defined as the data associated with a Key. It can be a scalar value, which is a single value like a number, string, or boolean, or a complex value like a list-value or a map.

**Scalar**

```yaml
Type: Dragon 
```

**List-Value**

```yaml
Type:
 - Dragon
 - Wyvern
 - Drake
 - Hatchling
```

**Map**

```yaml
Dragon:
  name: John Dragonson
  age: 3000
  occupation: Eater of Humans
```