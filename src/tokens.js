/* Hand-written tokenizers for K tokens that can't be
   expressed by lezer's built-in tokenizer. */

import { ExternalTokenizer } from "@lezer/lr";
import { Backslash, Comment, Minus, MultilineComment, MultilineCommentToEOF, Number, Slash } from "./parser.terms.js";

const A = 65, a = 97, backslash = 92, closeBrackets = 125, closeParenthesis = 41,
    closeSquareBrackets = 93, e = 101, eof = -1, minus = 45, N = 78, n = 110, newline = 10, nine = 57, period = 46,
    slash = 47, space = 32, x = 120, Z = 90, z = 122, zero = 48;

// This tokenizer is needed to determine whether a `/` is used as an adverb or is
// the beginning of a comment. This requires looking at the previous character and
// the position in the input. This tokenizer is also used to parse multiline comments.
export const slashOrComment = new ExternalTokenizer(input => {
    if (input.next !== slash) {
        return;
    }

    const prev = input.peek(-1);
    const pos = input.pos;
    input.advance();

    if (prev !== space && prev !== newline && pos !== 0) {
        input.acceptToken(Slash);
        return;
    }

    if (input.next === newline && (prev === newline || pos === 0)) {
        // It's a multiline comment.
        while (input.next !== eof) {
            if (input.next === backslash && input.peek(-1) === newline) {
                input.advance();
                if (input.next === newline) {
                    break;
                }
            }
            input.advance();
        }
        input.acceptToken(MultilineComment);
        return;
    }

    while (input.next !== newline && input.next !== eof) {
        input.advance();
    }
    input.acceptToken(Comment);
});

// This tokenizer is needed to determine whether a `\` is used as an adverb or is
// the beginning of a comment to the end of the file. This requires looking at the previous
// character and the position in the input.
export const backslashOrMultilineCommentToEOF = new ExternalTokenizer(input => {
    if (input.next !== backslash) {
        return;
    }

    const prev = input.peek(-1);
    const pos = input.pos;
    input.advance();

    if (input.next === backslash && (pos === 0 || prev === newline)) {
        input.advance();

        if (input.next === newline || input.next === eof) {
            input.advance();
            while (input.next !== eof) {
                input.advance();
            }
            input.acceptToken(MultilineCommentToEOF);
            return;
        }
        return;
    }

    input.acceptToken(Backslash);
});

// This tokenizer is needed to determine whether a `-` is used as an verb or
// the beginning of a number. This requires looking at the previous character.
// This tokenizer also includes full support for parsing floating point numbers
// and is a convenient way to avoid some overlapping tokens, such as `.e`, that
// would occur when using the built-in tokenizer.
export const minusOrNumber = new ExternalTokenizer(input => {
    // Don't allow a trailing `x`, since that overlaps with hexadecimal constants like `0x100`.
    if (input.next >= zero && input.next <= nine && input.peek(1) !== x) {
        parseNumber(input);
        input.acceptToken(Number);
        return;
    }

    if (input.next !== minus) {
        return;
    }

    const prev = input.peek(-1);

    input.advance();

    if ((prev < zero || prev > nine) && (prev < A || prev > Z) && (prev < a || prev > z) &&
        prev !== closeBrackets && prev !== closeParenthesis && prev !== closeSquareBrackets) {
        if (parseNumber(input)) {
            input.acceptToken(Number);
            return;
        }
    }

    input.acceptToken(Minus);
});

const parseNumber = input => {
    let isNumber;
    let isSingleZero;
    while (input.next >= zero && input.next <= nine) {
        isSingleZero = !isNumber && input.next === zero;
        isNumber = true;
        input.advance();
    }

    if (isSingleZero) {
        // Support `0N` and `0n`.
        if (input.next === n || input.next === N) {
            input.advance();
        }
        return true;
    }

    if (isNumber) {
        if (input.next === period) {
            input.advance();
        }

        while (input.next >= zero && input.next <= nine) {
            input.advance();
        }

        if (input.next === e) {
            input.advance()

            if (input.next === minus) {
                input.advance();
            }

            while (input.next >= zero && input.next <= nine) {
                input.advance();
            }
        }
    }
    return isNumber;
};
