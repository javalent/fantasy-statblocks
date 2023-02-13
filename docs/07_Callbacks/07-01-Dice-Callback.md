---
has_children: false
has_toc: false
layout: default
nav_order: 7
parent: Callback Functions
permalink: /:path/:basename
title: Dice Callback
---

# Dice Callback

The dice callback expects you to return an array of strings or objects, that it will then combine into a combination of text and dice rollers.

The object is:

```js
interface DiceCallbackObject {
    text: string //string to be parsed into a dice roll
    original?: string //optional. will be placed after the dice roll in parenthesis
}
```

For example, `return ["The monster has: ", { text: "1d20 + 2" }];` will result in "`The monster has <dice roll 1d20 + 2>`".
