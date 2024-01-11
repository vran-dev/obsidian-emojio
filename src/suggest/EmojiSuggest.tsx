import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import { getFlatEmojis } from "./getEmojis";
import { Emoji } from "@emoji-mart/data";

export class EmojiSuggest extends EditorSuggest<Emoji> {
	queryRegex = new RegExp(/:[^\s:0][^:]*$/);

	endsWithColonRegex = new RegExp(/:$/);

	rootEl: HTMLElement;

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile | null
	): EditorSuggestTriggerInfo | null {
		const term = editor.getLine(cursor.line).slice(0, cursor.ch);
		if (term.match(this.endsWithColonRegex)) {
			return {
				end: cursor,
				start: {
					ch: term.lastIndexOf(":"),
					line: cursor.line,
				},
				query: "",
			};
		}

		const match = term.match(this.queryRegex)?.first();
		if (!match) return null;
		return {
			end: cursor,
			start: {
				ch: term.lastIndexOf(match),
				line: cursor.line,
			},
			query: match,
		};
	}

	getSuggestions(context: EditorSuggestContext): Emoji[] | Promise<Emoji[]> {
		const query = context.query.substring(1);
		console.log("query is ", query);
		return getFlatEmojis(query);
	}

	renderSuggestion(value: Emoji, el: HTMLElement): void {
		console.log("value is ", value);
		const row = createDiv({
			parent: el,
			cls: "emoji-suggestion-item",
		});

		const emojiValue = createSpan({
			text: value.skins[0].native,
			parent: row,
			cls: 'emoji'
		});

		const emojiName = createSpan({
			text: value.name,
			parent: row,
			cls: 'name'
		});
	}

	selectSuggestion(emoji: Emoji, evt: MouseEvent | KeyboardEvent): void {
		if (!this.context) {
			return;
		}
		const { start, end } = this.context;
		const emojiSkin = emoji.skins[0].native;
		this.context.editor.replaceRange(emojiSkin, start, end);
	}
}
