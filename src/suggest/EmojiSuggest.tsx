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
	queryMatchRegex = new RegExp(/[:：]([^:：\s]+)*$/);

	rootEl: HTMLElement;

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile | null
	): EditorSuggestTriggerInfo | null {
		const term = editor.getLine(cursor.line).slice(0, cursor.ch);
		const result = term.match(this.queryMatchRegex);

		if (!result) return null;
		if (result.index === undefined) {
			return null;
		}

		return {
			end: cursor,
			start: {
				ch: result.index,
				line: cursor.line,
			},
			query: result[1] || "",
		};
	}

	getSuggestions(context: EditorSuggestContext): Emoji[] | Promise<Emoji[]> {
		return getFlatEmojis(context.query);
	}

	renderSuggestion(value: Emoji, el: HTMLElement): void {
		const row = createDiv({
			parent: el,
			cls: "emoji-suggestion-item",
		});

		createSpan({
			text: value.skins[0].native,
			parent: row,
			cls: "emoji",
		});

		createSpan({
			text: value.name,
			parent: row,
			cls: "name",
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
