import { Plugin } from "obsidian";
import { EmojiSuggest } from "./suggest/EmojiSuggest";
import { EMOJI_VIEW } from "./constants";
import { EmojiView } from "./view/EmojiView";
import { EmojiModal } from "./view/EmojiModal";

export default class EmojioPlugin extends Plugin {
	async onload() {
		this.registerEditorSuggest(new EmojiSuggest(this.app));
		this.registerView(EMOJI_VIEW, (leaf) => {
			return new EmojiView(leaf);
		});

		this.addCommand({
			id: "open-emojio-view",
			name: "open emoji view",
			callback: () => {
				this.initLeaf();
			},
		});

		this.addCommand({
			id: "open-emojio-modal",
			name: "open emoji modal",
			editorCallback: () => {
				new EmojiModal(this.app).open();
			},
		});
		this.app.workspace.onLayoutReady(() => {
			this.initLeaf();
		});
	}

	onunload() {}

	initLeaf(): void {
		const views = this.app.workspace.getLeavesOfType(EMOJI_VIEW);
		if (views.length) {
			views[0].setViewState({
				type: EMOJI_VIEW,
				active: true,
			});
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: EMOJI_VIEW,
			active: true,
		});
	}
}
