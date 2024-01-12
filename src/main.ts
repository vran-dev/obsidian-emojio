import { Plugin } from "obsidian";
import { EmojiSuggest } from "./suggest/EmojiSuggest";
import { EMOJI_VIEW } from "./constants";
import { EmojiView } from "./view/EmojiView";
import { EmojiModal } from "./view/EmojiModal";

export default class EmojioPlugin extends Plugin {
	async onload() {
		this.registerEditorSuggest(new EmojiSuggest(this.app));
		this.registerView(EMOJI_VIEW, (leaf) => {
			return new EmojiView(leaf)
		})

		this.addCommand({
			id: "open-emojio",
			name: "open emojio",
			callback: () => {
				this.initLeaf()
			},
		})

		this.addCommand({
			id: "open-emojio-modal",
			name: "open emojio modal",
			callback: () => {
				new EmojiModal(this.app).open()
			},
		})
		this.app.workspace.onLayoutReady(() => {
			this.initLeaf();
		})
	}

	onunload() { }

	initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(EMOJI_VIEW).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: EMOJI_VIEW,
		});
	}
}
