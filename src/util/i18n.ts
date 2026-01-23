import { moment } from "obsidian";
import { _, register, init, getLocaleFromNavigator } from "svelte-i18n";
import { get } from "svelte/store";

export function initI18n() {
    const lang = moment.locale();

    //register("en", () => import("./../data/translations/en.json"));
    register("pt-br", () => import("./../data/translations/pt-br.json"));

    init({
        fallbackLocale: lang,
        initialLocale: getLocaleFromNavigator(),
        handleMissingMessage: ({ locale, id, defaultValue }) => {
            if ("en" === lang) return;
            console.log(`Missing translation: "${id}"`);
            return defaultValue;
        }
    });
}

export const t = get(_);
