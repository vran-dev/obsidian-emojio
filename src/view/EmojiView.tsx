import { ItemView, MarkdownView, Notice, WorkspaceLeaf } from "obsidian";
import { EMOJI_VIEW } from "src/constants";
import { Root, createRoot } from "react-dom/client";
import { EmojiVirtualTable } from "src/ui/emoji-table/EmojiTable";
import { StrictMode } from "react";
import { EditorView } from "@codemirror/view";

export class EmojiView extends ItemView {
	private root: Root;

	private pos: number;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
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
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const editor = markdownView.editor;

			// @ts-ignore
			const editorView = editor.cm as EditorView;
			const selection = editorView.state.selection.main;
			const head = selection.head;
			this.pos = head;

            console.log('initialize pos ', this.pos)
			// set selection
			// editorView.dispatch({
			// 	changes: {
			// 		from: head,
			// 		to: head + (code ? code.length : 0),
			// 		insert: content,
			// 	},
			// });
		}

		const el = this.contentEl;
		this.root = createRoot(el);
		this.root.render(
			<StrictMode>
				<EmojiVirtualTable
					closeTypeahead={() => {}}
					onSelect={(emoji) => {
						const fileInfo = this.app.workspace.activeEditor;
						if (fileInfo && fileInfo.editor) {
							const editor = fileInfo.editor;
							editor.replaceSelection(emoji.skins[0].native);
							editor.focus();
						} else {
							new Notice("No active editor");
						}
					}}
				/>
			</StrictMode>
		);
	}

	protected async onClose(): Promise<void> {
		this.root.unmount();
		this.contentEl.empty();
	}
}
