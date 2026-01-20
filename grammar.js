module.exports = grammar({
  name: 'ml_lang',

  extras: $ => [
    /\s/,
    $.line_comment,
  ],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.module_item,
      $.function_item,
      $.let_declaration,
      $.if_statement,
      $.while_statement,
      $.expression_statement,
    ),

    module_item: $ => seq('module', $.identifier, ';'),

    function_item: $ => seq(
      optional('pub'),
      'function',
      $.identifier,
      optional($.type_parameters),
      $.parameters,
      optional(seq('->', $._type)),
      $.block,
      'end',
      'function',
    ),

    let_declaration: $ => seq(
      'let',
      optional('mut'),
      $.identifier,
      optional(seq(':', $._type)),
      optional(seq('=', $._expression)),
      ';',
    ),

    if_statement: $ => seq(
      'if',
      $._expression,
      'then',
      repeat($._statement),
      optional($.else_clause),
      'end',
      'if',
    ),

    else_clause: $ => seq('else', repeat($._statement)),

    while_statement: $ => seq(
      'while',
      $._expression,
      repeat($._statement),
      'end',
      'while',
    ),

    expression_statement: $ => seq($._expression, ';'),

    parameters: $ => seq(
      '(',
      optional(seq(
        $.identifier,
        ':',
        $._type,
        repeat(seq(',', $.identifier, ':', $._type)),
      )),
      ')',
    ),

    type_parameters: $ => seq(
      '<',
      $.identifier,
      repeat(seq(',', $.identifier)),
      '>',
    ),

    _type: $ => choice(
      $.identifier,
      $.generic_type,
      $.array_type,
      'i32',
      'bool',
      'str',
    ),

    generic_type: $ => seq(
      $.identifier,
      '<',
      $._type,
      repeat(seq(',', $._type)),
      '>',
    ),

    array_type: $ => seq(
      'vector',
      '<',
      $._type,
      '>',
    ),

    _expression: $ => choice(
      $.identifier,
      $.call_expression,
      $.binary_expression,
      $.unary_expression,
      $.string_literal,
      $.integer_literal,
      $.boolean_literal,
      $.array_expression,
      $.field_expression,
      $.index_expression,
      seq('(', $._expression, ')'),
    ),

    call_expression: $ => prec(10, seq(
      $._expression,
      '(',
      optional(seq($._expression, repeat(seq(',', $._expression)))),
      ')',
    )),

    binary_expression: $ => choice(
      prec.left(1, seq($._expression, '==', $._expression)),
      prec.left(1, seq($._expression, '!=', $._expression)),
      prec.left(1, seq($._expression, '<', $._expression)),
      prec.left(1, seq($._expression, '>', $._expression)),
      prec.left(1, seq($._expression, '<=', $._expression)),
      prec.left(1, seq($._expression, '>=', $._expression)),
      prec.left(2, seq($._expression, '+', $._expression)),
      prec.left(2, seq($._expression, '-', $._expression)),
      prec.left(3, seq($._expression, '*', $._expression)),
      prec.left(3, seq($._expression, '/', $._expression)),
      prec.left(4, seq($._expression, '&&', $._expression)),
      prec.left(4, seq($._expression, '||', $._expression)),
    ),

    unary_expression: $ => prec(9, choice(
      seq('-', $._expression),
      seq('!', $._expression),
    )),

    array_expression: $ => seq(
      '[',
      optional(seq($._expression, repeat(seq(',', $._expression)))),
      ']',
    ),

    field_expression: $ => seq($._expression, '.', $.identifier),

    index_expression: $ => prec(11, seq($._expression, '[', $._expression, ']')),

    block: $ => seq(
      '{',
      repeat($._statement),
      optional($._expression),
      '}',
    ),

    string_literal: $ => /"[^"]*"/,

    integer_literal: $ => /\d+/,

    boolean_literal: $ => choice('true', 'false'),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    line_comment: $ => /\/\/.*/,
  },
});

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}