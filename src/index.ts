import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport } from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const kLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        "( )": t.paren,
        "[ ]": t.squareBracket,
        "{ }": t.bracket,
        Adverb: t.operator,
        Backslash: t.operator,
        Comment: t.lineComment,
        Delimiter: t.separator,
        Minus: t.operator,
        MultilineComment: t.blockComment,
        MultilineCommentToEOF: t.blockComment,
        Name: t.name,
        Number: t.number,
        Slash: t.operator,
        String: t.string,
        Symbol: t.constant(t.name),
        Verb: t.operator,
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
