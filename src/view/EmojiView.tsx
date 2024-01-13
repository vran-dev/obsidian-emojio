import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import { EMOJI_VIEW } from "src/constants";
import { Root, createRoot } from "react-dom/client";
import { EmojiVirtualTable } from "src/ui/emoji-table/EmojiTable";
import { StrictMode } from "react";
import { EditorView } from "@codemirror/view";

export class EmojiView extends ItemView {
	private root: Root;

	private editorView: EditorView;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.holdEditor();

		this.app.workspace.on("file-open", (file) => {
			if (file) {
				this.holdEditor();
			}
		});

		this.app.workspace.on("editor-change", (editor, info) => {
			// @ts-ignore
			this.editorView = editor.cm as EditorView;
		});
	}

	getViewType(): string {
		return EMOJI_VIEW;
	}

	getDisplayText(): string {
		return "Emojio";
	}

	getIcon(): string {
		return "smile";
	}

	protected async onOpen(): Promise<void> {
		const { contentEl } = this;
		this.root = createRoot(contentEl);
		this.root.render(
			<StrictMode>
				<EmojiVirtualTable
					close={() => {}}
					showSearch={true}
					onSelect={(emoji) => {}}
					emojiPreviewActions={[
						{
							name: "Append To Editor",
							execute: (emoji) => {
								if (this.editorView) {
									const selection =
										this.editorView.state.selection.main;
									const head = selection.head;
									this.editorView.dispatch({
										changes: {
											from: head,
											insert: emoji.skins[0].native,
										},
										selection: {
											anchor:
												head +
												emoji.skins[0].native.length,
										},
									});
									this.contentEl.blur();
									this.editorView.focus();
								}
							},
						},
					]}
				/>
			</StrictMode>
		);
	}

	protected async onClose(): Promise<void> {
		this.root.unmount();
		this.contentEl.empty();
	}

	holdEditor(): void {
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!markdownView) {
			return;
		}
		const editor = markdownView.editor;
		// @ts-ignore
		this.editorView = editor.cm as EditorView;
	}
}
