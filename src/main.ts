import { Plugin } from "obsidian";
import { EmojiSuggest } from "./suggest/EmojiSuggest";

export default class MyPlugin extends Plugin {
	async onload() {
		this.registerEditorSuggest(new EmojiSuggest(this.app));
	}

	onunload() {}
}
