const Move = monster.MovementType;
const Types = ['move', 'flight', 'swim', 'burrow', 'teleport', 'leap', 'hover', 'climb',];
const Symbols = ['⭇', '󡔂', '󡔄', '󡔆', '󡔃', '󡔁', '󡔀', '󡔅',];

let Output = '';
for (let i = 0; i < Types.length; i++) {
    for (let j = 0; j <= 10; j++) {
        if (Move.includes(`${Types[i]} ${j}`)) {
            Output += `${Symbols[i]} ${j} Square${j > 1 ? 's' : ''}\n`;
        }
    }
}

return Output.trim();
