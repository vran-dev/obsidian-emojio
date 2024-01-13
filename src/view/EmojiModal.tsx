import { EditorView } from "@codemirror/view";
import { App, MarkdownView, Modal, Notice } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import { EmojiVirtualTable } from "src/ui/emoji-table/EmojiTable";

export class EmojiModal extends Modal {
	private root: Root;

	constructor(app: App) {
		super(app);
	}

	onOpen(): void {
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!markdownView) {
			new Notice("No active markdown view");
			return;
		}
		const editor = markdownView.editor;
		// @ts-ignore
		const editorView = editor.cm as EditorView;
		const selection = editorView.state.selection.main;
		let head = selection.head;

		const { contentEl } = this;
		this.root = createRoot(contentEl);
		this.root.render(
			<StrictMode>
				<EmojiVirtualTable
					close={() => {
						this.close();
					}}
					showSearch={true}
					onSelect={(emoji) => {
						editorView.dispatch({
							changes: {
								from: head,
								insert: emoji.skins[0].native,
							},
							selection: {
								anchor: head + emoji.skins[0].native.length,
							},
						});

						head += emoji.skins[0].native.length;
					}}
				/>
			</StrictMode>
		);
	}

	onClose(): void {
		this.root.unmount();
		this.contentEl.empty();
	}
}
