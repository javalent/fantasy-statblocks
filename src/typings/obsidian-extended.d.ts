import "obsidian";

interface StatblockEvents {
    "dice-roller:rendered-result": number;
    "dice-roller:unload": null;
    "dice-roller:loaded": null;
    "fantasy-statblocks:settings-change": StatblockData;
    "fantasy-statblocks:frontmatter-change": boolean;
    "fantasy-statblocks:srd-change": boolean;
}

declare module "obsidian" {
    interface App {
        plugins: {
            getPlugin<T extends keyof Plugins>(plugin: T): Plugins[T];
        };
        commands: {
            listCommands: () => Command[];
            executeCommandById: (id: string) => boolean;
        };
        setting: {
            close: () => void;
        };
    }
    interface MetadataCache {
        initialized: boolean;
        getLinkSuggestions(): { alias?: string; file: TFile; path: string }[];
    }
    interface Workspace {
        on<T extends keyof StatblockEvents>(
            name: T,
            callback: (data: StatblockEvents[T]) => void
        ): EventRef;
        trigger<T extends keyof StatblockEvents>(
            name: T,
            data: StatblockEvents[T]
        ): void;
        trigger(
            name: "link-hover",
            popover: object,
            target: HTMLElement,
            link: string,
            source: string
        );
    }
}
