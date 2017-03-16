const util = require('util');

const showErrorsFor = [];

const assignmentTypes = {
    '=': 'Equal',
    '-=': 'ReduceBy',
    '+=': 'IncreaseBy',
    '*=': 'MultiplyBy',
    '/=': 'DivideBy',
};

let i = 0;
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

const res = parseCode(code);

console.log('\nRESULT:\n');
console.log(util.inspect(res, {
    colors: true,
    depth:  10,
}));

function parseCode(_text) {
    let text = _text.replace(/\n/g, ' ').trim() + ' ';

    return {
        i:    'Application',
        body: readBlock(text)[1]
    };
}

function readBlock(_text, closingWith) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    const statements = [];
    let statement;

    while (text && (!closingWith || !text.startsWith(closingWith))) {
        [text, statement] = readStatement(text);

        statements.push(statement);

        text = t(text);

        if (text && text[0] !== ';') {
            console.log('Expected ; but found:', text);
            e();
        }

        text = t(text.substr(1));
    }

    return [text, statements];
}

function readStatement(_text) {
    l(arguments.callee.name, _text);

    let fail;
    let text = t(_text);

    fail = try_();
    try {
        return readWhileLoop(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readForLoop(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readVariableDeclaration(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readBlockStatement(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readExpression(text);
    } catch(err) {
        fail(err);
    }

    e();
}

function readWhileLoop(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    let [whileL] = text.match(/^while\s*\(/);

    let expr;
    [text, expr] = readExpression(sub(text, whileL));
    text = t(text);

    [] = text.match(/^\)/);

    text = text.substr(1);

    let block;
    [text, block] = readBlockStatement(text);

    return [text, {
        i:    'WhileStatement',
        test: expr,
        body: block,
    }];
}

function readForLoop(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    let [forL] = text.match(/^for\s*\(/);

    text = sub(text, forL);

    let decl = null;
    let expr = null;
    let test = null;
    let update = null;
    let body;

    if (text.startsWith(';')) {
        text = text.substr(1);
    } else {
        try {
            [text, decl] = readVariableDeclaration(text);

        } catch(err) {
            [text, expr] = readExpression(text);
        }

        [] = text.match(/;/);
        text = text.substr(1);
    }

    text = t(text);

    if (text.startsWith(';')) {
        text = text.substr(1);
    } else {
        [text, test] = readExpression(text);

        [] = text.match(/;/);
        text = text.substr(1);
    }

    text = t(text);

    if (!text.startsWith(')')) {
        [text, update] = readExpression(text);
    }

    [] = text.match(/^\)/);

    text = text.substr(1);

    [text, body] = readBlockStatement(text);

    return [text, {
        i: 'ForStatement',
        init: decl || expr,
        test,
        update,
        body,
    }];
}

function readBlockStatement(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    [] = text.match(/^\{/);

    text = text.substr(1);

    let statements;
    [text, statements] = readBlock(text, '}');

    text = t(text);

    [] = text.match(/^\}/);

    text = text.substr(1);

    return [text, {
        i: 'BlockStatement',
        statements,
    }];
}

function readVariableDeclaration(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);
    let iden;

    const [, type] = text.match(/^(const|let|var)\s/);

    [text, iden] = readIdentifier(sub(text, type));

    [] = text.match(/^=/);

    text = text.substr(1);

    let expr;
    [text, expr] = readExpression(text);

    return [text, {
        i: 'VariableDeclaration',
        type,
        iden,
        expr,
    }];
}

function readIdentifier(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    const [iden] = text.match(/^[a-z_][a-z\d_]*/i);

    return [sub(text, iden), {
        i:     'Identifier',
        value: iden,
    }];
}

function readExpression(_text, ignoreBinaryExpression) {
    l(arguments.callee.name, _text);
    let fail;

    let text = t(_text);

    fail = try_();
    try {
        return readInBrackets(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readAssignment(text);
    } catch(err) {
        fail(err);
    }

    if (!ignoreBinaryExpression) {
        fail = try_();
        try {
            return readBinaryExpressionList(text);
        } catch(err) {
            fail(err);
        }
    }

    fail = try_();
    try {
        return readNumber(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readString(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readBoolean(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readFunctionCall(text);
    } catch(err) {
        fail(err);
    }

    fail = try_();
    try {
        return readIdentifier(text);
    } catch(err) {
        fail(err);
    }
}

function readInBrackets(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    [] = text.match(/^\(/);

    let expr;
    [text, expr] = readExpression(text.substr(1));

    text = t(text);

    [] = text.match(/^\)/);

    return [text.substr(1), expr];
}

function readBinaryExpressionList(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);
    let expr, sign;

    const expressions = [];
    const operations = [];

    let first = true;

    while (text && !/^[,;)]/.test(text)) {
        if (first) {
            first = !first;
        } else {
            [sign] = text.match(/^[+*\/<>-]/);

            if ((sign === '<' || sign === '>') && text[1] === '=') {
                sign += '=';
            }

            operations.push(sign);

            text = sub(text, sign);
        }

        console.log('DDDD', text);

        [text, expr] = readExpression(text, true);
        expressions.push(expr);

        text = t(text);
    }

    let op;
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < operations.length; i++) {
            op = operations[i];

            if (j === 0 && (op === '*' || op === '/') ||
                j === 1 && (op === '+' || op === '-') ||
                j === 2
            ) {
                expressions[i] = {
                    i: 'BinaryExpression',
                    operation: op,
                    left: expressions[i],
                    right: expressions[i + 1],
                };

                expressions.splice(i + 1, 1);
                operations.splice(i, 1);
                i--;
            }
        }
    }

    return [text, expressions[0]];
}

function readAssignment(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    let iden;
    [text, iden] = readIdentifier(text);

    text = t(text);

    let [sign] = text.match(/^(?:=|\+=|-=|\*=|\\=)/);

    console.log('!!!!!!!!!!', sign);

    text = t(sub(text, sign));

    let expr;
    [text, expr] = readExpression(text);

    console.log('SUCCESS ASSIG', _text, iden, sign, expr);

    return [text, {
        i:     'Assignment',
        type:  assignmentTypes[sign],
        iden,
        value: expr,
    }];
}

function readFunctionCall(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    let iden;
    [text, iden] = readIdentifier(text);

    [] = text.match(/\(/);

    let list;
    [text, list] = readExpressionList(text.substr(1), ')');

    text = t(text);

    return [text.substr(1), {
        i: 'FunctionCall',
        iden,
        arguments: list,
    }];
}

function readExpressionList(_text, bound) {
    l(arguments.callee.name, _text);

    let text = t(_text);
    let expr;
    const list = [];

    while (!text.startsWith(bound)) {
        [text, expr] = readExpression(text);
        list.push(expr);
        text = t(text);
    }

    return [text, list];
}

function readNumber(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);
    const [, val] = text.match(/^(\d+(?:\.\d+)?)[;\s()+-:\/\[\]]/);

    return [sub(text, val), {
        i:     'NumberLiteral',
        value: Number(val),
    }];
}

function readString(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    const [, val] = text.match(/^"([^"]*)"[\s()+-:\/\[\]]/);

    return [sub(text, val), {
        i:     'StringLiteral',
        value: val,
    }];
}

function readBoolean(_text) {
    l(arguments.callee.name, _text);

    let text = t(_text);

    const [, val] = text.match(/^(true|false)[ ;,|)=*\/\]-]/);

    return [sub(text, val), {
        i:     'BooleanLiteral',
        value: val === 'true',
    }];
}


function t(text) {
    return text.trimLeft();
}

function e() {
    const err = new Error();
    Error.captureStackTrace(err, e);
    throw err;
}

function sub(text, part) {
    return text.substr(part.length).trimLeft();
}

function l(funcName, text) {
    console.log(`   >>> ${funcName} : ${text}`);
}

function try_() {
    const n = ++i;

    console.log(`   try ${n}`);
    return err => {
        if (showErrorsFor.includes(n)) {
            console.log(`   :fail ${n}`, err);
            console.log('!!! showErrorsFor !!!');
            process.exit(1);
        } else {
            console.log(`   :fail ${n}`);
        }
    }
}

module.exports = {
    parseCode
};
