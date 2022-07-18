import type { Monster } from "@types";
import {
    buildMonsterFromAppFile,
    buildMonsterFromCritterFile,
    buildMonsterFromImprovedInitiativeFile
} from ".";
import { build5eMonsterFromFile } from "./5eToolsImport";
import { buildMonsterFromTetraCube } from "./TetraCubeImport";
import { buildMonsterFromDDBFile } from "./DDBImport";

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
    if (!event.data) return;

    const { files, source } = event.data;
    const monsters: Monster[] = [];
    for (const file of files) {
        switch (source) {
            case "5e": {
                const imported = await build5eMonsterFromFile(file);
                monsters.push(...(imported ?? []));
                break;
            }
            case "critter": {
                const imported = await buildMonsterFromCritterFile(file);
                monsters.push(...(imported ?? []));
                break;
            }
            case "improved": {
                const imported = await buildMonsterFromImprovedInitiativeFile(
                    file
                );
                monsters.push(...(imported ?? []));
                break;
            }
            case "appfile": {
                const imported = await buildMonsterFromAppFile(file);
                monsters.push(...(imported ?? []));
                break;
            }
            case "tetra": {
                const imported = await buildMonsterFromTetraCube(file);
                monsters.push(...(imported ?? []));
                break;
            }
            case "ddb": {
                const imported = await buildMonsterFromDDBFile(file);
                monsters.push(...(imported ?? []));
                break;
            }
        }
    }

    ctx.postMessage({ monsters });
};

ctx.addEventListener(
    "unhandledrejection",
    function (event: PromiseRejectionEvent) {
        // the event object has two special properties:
        // event.promise - the promise that generated the error
        // event.reason  - the unhandled error object
        throw event.reason;
    }
);
