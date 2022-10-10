import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport } from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const kLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Number: t.number,
        Comment: t.lineComment,
        MultilineComment: t.blockComment,
        MultilineCommentToEOF: t.blockComment,
        String: t.string,
        Name: t.name,
        Symbol: t.constant(t.name),
        Delimiter: t.separator,
        Adverb: t.operator,
        Slash: t.operator,
        Backslash: t.operator,
        Minus: t.operator,
        Verb: t.operator,
        "( )": t.paren,
        "[ ]": t.squareBracket,
        "{ }": t.bracket,
      })
    ]
  }),
  languageData: {
    commentTokens: { line: "/" },
    closeBrackets: { brackets: ["(", "[", "{", '"'] },
  }
});

export function k() {
  return new LanguageSupport(kLanguage);
}
