// @ts-ignore
import data from "@emoji-mart/data";
import { init, SearchIndex } from "emoji-mart";
import { EmojiMartData, Emoji } from "@emoji-mart/data";

init({ data });

export interface EmojiData {
	categoryId: string;
	emojis: Emoji[];
}

export const getFlatEmojis = (query: string): Promise<Emoji[]> => {
	return getEmojis({ query }).then(data => {
		return data.flatMap((emojiData) => emojiData.emojis);
	})
}

export const getEmojis = async ({
	query,
}: {
	query: string;
}): Promise<EmojiData[]> => {
	if (!query || query === "") {
		const emojiData = data as EmojiMartData;
		return emojiData.categories.map((category) => {
			const categoryEmojis = category.emojis.map((emoji) => {
				return data.emojis[emoji];
			});
			return {
				categoryId: category.id,
				emojis: categoryEmojis,
			} as EmojiData;
		});
	}

	const emojis = await SearchIndex.search(query);
	return [
		{
			categoryId: "search",
			emojis,
		},
	];
};

export function toTwoDimensional<T>(array: T[], columns: number): T[][] {
	const result = [];
	let row = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const start = row * columns;
		const end = start + columns;
		const items = array.slice(start, end);
		if (items.length == 0) {
			// @ts-ignore
			return result;
		}
		result.push(items);
		row++;
		if (items.length < columns) {
			// @ts-ignore
			return result;
		}
	}
}
