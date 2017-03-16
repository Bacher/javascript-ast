const util = require('util');
const ast = require('../lib/ast');

let code;

// code = `
//     let a = 3;
//     a = 4;
//     a += 3;
//     b = 4;
// `;

//code = `call(3);`;

//code = '3 * (4 + 8) / get(1);';

// code = `
//     a = 4;
//     while (3) {
//       b = true;
//     }
// `;

code = `
    for (let i = 0; i < 5; i += 1) {
      c = 3;
    }
`;

const res = ast.parseCode(code);

console.log('\nRESULT:\n');
console.log(util.inspect(res, {
    colors: true,
    depth:  10,
}));
