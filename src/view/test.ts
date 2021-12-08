const split = property.split(
    /([\+\-]\d+ to hit|\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)|\w+ [\+\-]\d+)/
);

const roller = (str: string) => {
    let text: string;
    let original: string;
    if (/\w+ [\+\-]\d+/.test(str.trim())) {
        let [, save, sign, number] = str.match(/(\w+ )([\+\-])(\d+)/) ?? [];
        let mult = 1;
        if (sign === "-") {
            mult = -1;
        }
        if (!isNaN(Number(number))) {
            text = `1d20+${mult * Number(number)}`;
            original = `${save} ${sign}${number}`;
        }
    } else if (/[\+\-]\d+ to hit/.test(str.trim())) {
        let [, sign, number] = str.match(/([\+\-])(\d+)/) ?? [];

        let mult = 1;
        if (sign === "-") {
            mult = -1;
        }
        if (!isNaN(Number(number))) {
            text = `1d20+${mult * Number(number)}`;
            original = str;
        }
    } else if (/\d+\s\(\d+d\d+(?:\s*[+\-]\s*\d+)?\)/.test(str.trim())) {
        let [, base, dice] =
            str.match(/(\d+)\s\((\d+d\d+(?:\s*[+\-]\s*\d+)?)\)/) ?? [];
        if (!isNaN(Number(base)) && dice) {
            text = dice;
        }
    }
    return { text, original };
};
