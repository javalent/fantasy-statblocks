const getStatLine = (statName, statValue) => {
    const statLine = document.createElement("div");
    const statClass = `${statName.toLowerCase()}-block`;
    statLine.classList.add("stat-line");
    statLine.classList.add(statClass);

    const statNameBlock = document.createElement("span");
    statNameBlock.classList.add("stat-name");
    statNameBlock.innerText = statName.toUpperCase();

    const statValueBlock = document.createElement("span");
    statValueBlock.classList.add("stat-value");

    if (statName === "HP" && monster.mook !== undefined) {
        statValue = `${statValue} (mook)`;
    }

    statValueBlock.innerText = statValue;

    statLine.append(statNameBlock);
    statLine.append(statValueBlock);

    return statLine;
}

const statFullBlock = document.createElement("div");
statFullBlock.classList.add("stat-block");
statFullBlock.append(getStatLine("AC", monster.ac));
statFullBlock.append(getStatLine("PD", monster.pd));
statFullBlock.append(getStatLine("MD", monster.md));
statFullBlock.append(getStatLine("HP", monster.hp));

return statFullBlock;
