import { Layout5e } from "./basic 5e/basic5e";
import { LayoutFateCore } from "./fate core/fateCore";
import { LayoutPF2e } from "./pathfinder 2e/pf2e";

export * from "./basic 5e/basic5e";
export * from "./fate core/fateCore";
export * from "./pathfinder 2e/pf2e";

export const DefaultLayouts = [
    Layout5e,
    LayoutFateCore,
    LayoutPF2e
    /** Additional Default Layouts should be added here. */
];
