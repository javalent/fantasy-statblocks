export const stringify = (
    property: Record<string, any> | string | any[] | number | boolean,
    depth: number = 0
): string => {
    const ret = [];
    if (depth == 5) {
        return "";
    }
    if (!property || property == null) return ``;
    if (typeof property == "string") return property;
    if (typeof property == "number") return `${property}`;
    if (Array.isArray(property)) {
        ret.push(`(${property.map((p) => stringify(p, depth++)).join(" ")})`);
    } else if (typeof property == "object") {
        for (const value of Object.values(property)) {
            ret.push(stringify(value, depth++));
        }
    }
    return ret.join(" ");
};
export const stringifyWithKeys = (
    property: Record<string, any> | string | any[] | number | boolean,
    depth: number = 0
): string => {
    const ret = [];
    if (depth == 5) {
        return "";
    }
    if (!property || property == null) return ``;
    if (typeof property == "string") return property;
    if (typeof property == "number") return `${property}`;
    if (Array.isArray(property)) {
        ret.push(
            `${property.map((p) => stringifyWithKeys(p, depth++)).join(" ")}`
        );
    } else if (typeof property == "object") {
        for (const [key, value] of Object.entries(property)) {
            ret.push(
                stringifyWithKeys(key, depth++),
                stringifyWithKeys(value, depth++)
            );
        }
    }
    return ret.join(" ");
};
