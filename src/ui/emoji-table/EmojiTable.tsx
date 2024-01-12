/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import { getFlatEmojis, toTwoDimensional } from "src/suggest/getEmojis";
import { Emoji } from "@emoji-mart/data";
import { Icons } from "../icons";

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

export function EmojiVirtualTable(props: {
	onSelect: (emoji: Emoji) => void;
	showSearch: boolean;
	closeTypeahead: (resetPosition?: boolean) => void;
}): JSX.Element {
	const emojiPickerContainer = useRef<HTMLDivElement>(null);
	const [selectEmoji, setSelectEmoji] = useState<Emoji | null>(null);
	const [selectRow, setSelectRow] = useState(0);
	const [selectCol, setSelectCol] = useState(0);
	const [mouseSelectEnabled, settMouseSelectEnabled] = useState(false);
	const [query, setQuery] = useState("");
	const [emojis, setEmojis] = useState<Emoji[][]>([]);

	const numberOfColumns = 10;

	useEffect(() => {
		getFlatEmojis(query).then((matchedEmojiData) => {
			const emojiRows: Emoji[][] = toTwoDimensional(
				matchedEmojiData || [],
				numberOfColumns
			);
			setEmojis(emojiRows);
		});
	}, [query]);

	useEffect(() => {
		setSelectEmoji(null);
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

	useEffect(() => {
		if (exists(selectRow) && exists(selectCol) && emojis.length > 0) {
			const emoji = emojis[selectRow][selectCol];
			setSelectEmoji(emoji);
		} else {
			setSelectEmoji(null);
		}
	}, [selectRow, selectCol]);

	const onClickEmoji = (emoji: Emoji) => {
		props.onSelect(emoji);
	};

	const onSelectEmoji = (emoji: Emoji, row: number, col: number) => {
		setSelectRow(row);
		setSelectCol(col);
	};

	return (
		<div
			className="emoji-container"
			onMouseMove={() => settMouseSelectEnabled(true)}
		>
			<div className="emoji-search">
				<span className="emoji-search-icon">{Icons.SEARCH}</span>
				<input
					type="text"
					className="emoji-search-input"
					onChange={(e) => {
						setQuery(e.target.value);
					}}
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
									width: "100%",
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
												onClick={() =>
													onClickEmoji(emoji)
												}
												onMouseOver={() =>
													mouseSelectEnabled &&
													onSelectEmoji(
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
			{selectEmoji && (
				<div className="emoji-preview">{selectEmoji.name}</div>
			)}
		</div>
	);
}
