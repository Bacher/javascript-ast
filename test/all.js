const ast = require('../lib/ast');

const listings = [
    'a = 3',
    'const a = 3',
    'let a = 3',
    'let a = 3; a += 4',
    'log()',
    'log(3)',
];

for (let code of listings) {
    try {
        ast.parseCode(code);
    } catch(err) {
        console.error(`Failed code: "${code}"`, err);
        process.exit(2);
        break;
    }
}

console.log('\nOK\nAll tests passed!');
