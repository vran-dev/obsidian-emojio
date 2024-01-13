/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { getFlatEmojis, toTwoDimensional } from "src/suggest/getEmojis";
import { Emoji } from "@emoji-mart/data";
import { Icons } from "../icons";
import { Notice } from "obsidian";

const exists = (obj: any): boolean => {
	return obj !== null && obj !== undefined;
};

const emojiButtonColors = [
	"rgba(155,223,88,.7)",
	"rgba(149,211,254,.7)",
	"rgba(247,233,34,.7)",
	"rgba(238,166,252,.7)",
	"rgba(255,213,143,.7)",
	"rgba(211,209,255,.7)",
];

// const numberKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export class EmojiPreviewAction {
	public name: string;
	public execute: (emoji: Emoji) => void;
}

export function EmojiVirtualTable(props: {
	onSelect: (emoji: Emoji) => void;
	showSearch: boolean;
	close: () => void;
	emojiPreviewActions?: EmojiPreviewAction[];
	defaultShowPreview?: boolean;
}): JSX.Element {
	const emojiPickerContainer = useRef<HTMLDivElement>(null);
	const emojiContainerRef = useRef<HTMLDivElement>(null);
	const [selectEmoji, setSelectEmoji] = useState<Emoji | null>(null);
	const [selectRow, setSelectRow] = useState(0);
	const [selectCol, setSelectCol] = useState(0);
	const [mouseSelectEnabled, settMouseSelectEnabled] = useState(false);
	const [query, setQuery] = useState("");
	const [emojis, setEmojis] = useState<Emoji[][]>([]);
	const [numberOfColumns, setNumberOfColumns] = useState(10);
	const [showPreview, setShowPreview] = useState(
		props.defaultShowPreview === true
	);
	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		getFlatEmojis(query).then((matchedEmojiData) => {
			const emojiRows: Emoji[][] = toTwoDimensional(
				matchedEmojiData || [],
				numberOfColumns
			);
			setEmojis(emojiRows);
		});
	}, [query, numberOfColumns]);

	useEffect(() => {
		if (!emojiContainerRef.current) {
			return;
		}
		const observe = new ResizeObserver((entries) => {
			const { width } = entries[0].contentRect;
			const newNumberOfColumns = Math.max(Math.floor(width / 36) - 1, 5);
			const normalized =
				newNumberOfColumns > 15 ? 15 : newNumberOfColumns;
			setNumberOfColumns(normalized);
		});
		observe.observe(emojiContainerRef.current);
		return () => {
			observe.disconnect();
		};
	}, [emojiContainerRef]);

	useEffect(() => {
		setSelectCol(0);
		setSelectRow(0);
	}, [emojis]);

	const rowVirtualizer = useVirtualizer({
		count: emojis.length,
		scrollPaddingStart: 12,
		scrollPaddingEnd: 12,
		getScrollElement: () => emojiPickerContainer.current,
		estimateSize: (index) => {
			const item = emojis[index];
			if (item) {
				return 36;
			}
			return 0;
		},
	});
	useEffect(() => {
		if (exists(selectRow) && exists(rowVirtualizer) && emojis.length > 0) {
			rowVirtualizer.scrollToIndex(selectRow);
		}
	}, [selectRow]);

	const onClickEmoji = (emoji: Emoji) => {
		if (exists(selectRow) && exists(selectCol) && emojis.length > 0) {
			const emoji = emojis[selectRow][selectCol];
			setSelectEmoji(emoji);
		} else {
			setSelectEmoji(null);
		}
		setShowPreview(true);
		props.onSelect(emoji);
		props.close();
	};

	const onSelectChange = (emoji: Emoji, row: number, col: number) => {
		setSelectRow(row);
		setSelectCol(col);
	};

	useEffect(() => {
		if (!emojiContainerRef.current) {
			return;
		}
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopImmediatePropagation();
				props.close();
				return true;
			}

			if (e.key === "Enter") {
				e.preventDefault();
				e.stopImmediatePropagation();
				onClickEmoji(emojis[selectRow][selectCol]);
				return true;
			}

			if (emojis.length === 0) {
				return false;
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				e.stopImmediatePropagation();
				setSelectRow((selectRow + 1) % emojis.length);
				return true;
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				e.stopImmediatePropagation();
				setSelectRow((selectRow - 1 + emojis.length) % emojis.length);
			}

			if (e.key === "ArrowLeft") {
				e.preventDefault();
				e.stopImmediatePropagation();
				if (selectCol === 0 && selectRow === 0) {
					return true;
				}
				if (selectCol === 0) {
					setSelectRow(Math.max(selectRow - 1, 0) % emojis.length);
				}
				const currCols = emojis[selectRow].length;
				setSelectCol((selectCol - 1 + currCols) % currCols);
				return true;
			}

			if (e.key === "ArrowRight") {
				e.preventDefault();
				e.stopImmediatePropagation();
				if (selectCol === emojis[selectRow].length - 1) {
					setSelectRow((selectRow + 1) % emojis.length);
				}
				const currCols = emojis[selectRow].length;
				setSelectCol((selectCol + 1) % currCols);
				return true;
			}
		};

		emojiContainerRef.current.addEventListener("keydown", handleKeyDown);
		return () => {
			emojiContainerRef.current?.removeEventListener(
				"keydown",
				handleKeyDown
			);
		};
	}, [emojis, selectRow, selectCol]);

	return (
		<div
			className="emoji-container"
			ref={emojiContainerRef}
			onMouseMove={() => {
				settMouseSelectEnabled(true);
			}}
		>
			<div className="emoji-search">
				<span className="emoji-search-icon">{Icons.SEARCH}</span>
				<input
					type="text"
					className="emoji-search-input"
					onChange={(e) => {
						setQuery(e.target.value);
					}}
					ref={searchInputRef}
				/>
			</div>
			<div className="emoji-picker" ref={emojiPickerContainer}>
				<div
					className="inner"
					style={{
						width: "100%",
						height: `${rowVirtualizer.getTotalSize()}px`,
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						return (
							<div
								className="row"
								key={virtualRow.index}
								style={{
									top: 0,
									left: 0,
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								{emojis[virtualRow.index].map(
									(emoji, colIndex) => {
										return (
											<div
												className="col"
												key={colIndex}
												onClick={() => {
													onSelectChange(
														emoji,
														virtualRow.index,
														colIndex
													);
													onClickEmoji(emoji);
												}}
												onMouseOver={() =>
													mouseSelectEnabled &&
													onSelectChange(
														emoji,
														virtualRow.index,
														colIndex
													)
												}
											>
												<div
													className={`emoji ${
														selectRow ===
															virtualRow.index &&
														selectCol === colIndex
															? "selected"
															: ""
													}`}
													style={{
														backgroundColor:
															selectRow ===
																virtualRow.index &&
															selectCol ===
																colIndex
																? emojiButtonColors[
																		selectCol %
																			emojiButtonColors.length
																  ]
																: "",
														transition:
															"background-color 0.2s linear",
													}}
												>
													{virtualRow.index ===
														selectRow && (
														<span className="indicator">
															{(colIndex + 1) %
																numberOfColumns}
														</span>
													)}
													{emoji.skins[0].native}
												</div>
											</div>
										);
									}
								)}
							</div>
						);
					})}
				</div>
			</div>
			{showPreview && emojis.length > 0 && (
				<div className="emoji-preview">
					<button
						className="close-button"
						onClick={(e) => setShowPreview(false)}
					>
						x
					</button>
					<div className="content">
						<span className="left">
							{selectEmoji?.skins[0].native || "👆"}
						</span>
						<div className="right">
							<div className="emoji-name">
								{selectEmoji?.name || "Select an emoji"}
							</div>
							<div className="emoji-actions">
								<button
									onClick={(e) => {
										if (selectEmoji) {
											navigator.clipboard.writeText(
												selectEmoji?.skins[0].native ||
													""
											);
											new Notice(
												"Copied " +
													selectEmoji?.skins[0]
														.native +
													" success"
											);
										} else {
											new Notice("Select an emoji first");
										}
									}}
								>
									Copy
								</button>
								{props.emojiPreviewActions?.map((action) => {
									return (
										<button
											key={action.name}
											onClick={() => {
												action.execute(selectEmoji!);
											}}
										>
											{action.name}
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
