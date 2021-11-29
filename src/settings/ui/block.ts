import type { StatblockItem } from "src/data/constants";

import Group from "./Blocks/Group.svelte";
import Inline from "./Blocks/Inline.svelte";
import Heading from "./Blocks/Heading.svelte";
import Subheading from "./Blocks/Subheading.svelte";

export const blockBuilder = (node: HTMLElement, block: StatblockItem) => {
    switch (block.type) {
        case "inline": {
            new Inline({
                target: node,
                props: {
                    block
                }
            });
            break;
        }
        
        case "group": {
            new Group({
                target: node,
                props: {
                    block
                }
            });
            break;
        }
        case "heading": {
            new Heading({
                target: node
            });
            break;
        }

        case "subheading": {
            new Subheading({ target: node });
            break;
        }
        default: {
            node.setText(block.type);
        }
    }
};
