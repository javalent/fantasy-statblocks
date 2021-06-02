import { MarkdownPostProcessorContext, Plugin } from "obsidian";

export declare class StatblockMonsterPlugin extends Plugin {
    postprocessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): Promise<void>;

    saveMonster(monster: StatblockMonster): Promise<void>;
}
