import { labels } from "./labels.ts";

const text = await Deno.readTextFile(
	"working_on/formatdetect/wikipedia/train_data.csv",
);
const map = new Map<string, string[]>();

text.split("\n").map((line) => {
	const div = line.lastIndexOf(",");
	const [para, id]: [string, number] = [
		line.slice(0, div),
		Number(line.slice(div + 1, line.length)),
	];
	const langcode = labels[id];
	const curr = map.get(langcode) || [];
	curr.push(para);
	map.set(langcode, curr);
});
for (const key of map.keys()) {
	Deno.writeTextFile(
		`working_on/formatdetect/wikipedia/data/${key}.html`,
		map.get(key)!.join("\n"),
	).then(() => console.log("Did", key));
}
