## Handmade AST parser for Javascript
AST - Abstract Syntax Tree

Source code:
```javascript
for (let i = 0; i < 5; i += 1) {
    c = 3;
}
```
Transfers into:
```javascript
{ i: 'Application',
  body: 
   [ { i: 'ForStatement',
       init: 
        { i: 'VariableDeclaration',
          type: 'let',
          iden: { i: 'Identifier', value: 'i' },
          expr: { i: 'NumberLiteral', value: 0 } },
       test: 
        { i: 'BinaryExpression',
          operation: '<',
          left: { i: 'Identifier', value: 'i' },
          right: { i: 'NumberLiteral', value: 5 } },
       update: 
        { i: 'Assignment',
          type: 'IncreaseBy',
          iden: { i: 'Identifier', value: 'i' },
          value: { i: 'NumberLiteral', value: 1 } },
       body: 
        { i: 'BlockStatement',
          statements: 
           [ { i: 'Assignment',
               type: 'Equal',
               iden: { i: 'Identifier', value: 'c' },
               value: { i: 'NumberLiteral', value: 3 } } ] } } ] }
```
