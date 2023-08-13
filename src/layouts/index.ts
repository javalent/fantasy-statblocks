import { Layout5e } from "./basic 5e/basic5e";
import { LayoutFateCore } from "./fate core/fateCore";
import { LayoutPF2e } from "./pathfinder 2e/pf2e";
import { Layout13thAgeMonster} from "./13th age/monster/13th-age-monster";
import { LayoutBnBBestiary } from "./BnB/bestiary/bnb-bestiary";
import { LayoutBnBFamiliar } from "./BnB/familiar/bnb-familiar";

export * from "./basic 5e/basic5e";
export * from "./fate core/fateCore";
export * from "./pathfinder 2e/pf2e";
export * from "./13th age/monster/13th-age-monster";
export * from "./BnB/bestiary/bnb-bestiary";
export * from "./BnB/familiar/bnb-familiar";

export const DefaultLayouts = [
    Layout5e,
    LayoutFateCore,
    LayoutPF2e,
    Layout13thAgeMonster,
    LayoutBnBBestiary,
    LayoutBnBFamiliar
    /** Additional Default Layouts should be added here. */
];
