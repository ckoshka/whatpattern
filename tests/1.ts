import { resolve } from "https://deno.land/std@0.130.0/path/posix.ts";
import { LanguageDetector } from "../detect.ts";
import { labels } from "../wikipedia/labels.ts";

const d = await LanguageDetector({ all: true, dataset: "wikipedia" });

const results = {
	passed: 0,
	failed: 0,
	positionsOfCorrect: [] as number[]
}
const u = new URL("./test_data.csv", import.meta.url);
const text = await fetch(u).then(t => t.text());
type Langcode = string;
type Paragraph = string;
const testData: [Langcode, Paragraph][] = [];

text.split("\n").map(line => {
    const div = line.lastIndexOf(',');
    const [para, id]: [string, number] = [line.slice(0, div), Number(line.slice(div+1, line.length))];
    const langcode = labels[id];
    testData.push([langcode, para]);
});

testData.slice(10).forEach(data => {
	const spectrum = d.detect(data[1]);
	console.log(data[1]);
	if (spectrum.length === 0) {
		results.failed += 1;
		return;
	}
	console.log(spectrum[0].code, spectrum[0].likelihood);
	spectrum[0].code === data[0] ? results.passed += 1 : results.failed += 1;
	const idx = spectrum.findIndex(s => s.code === data[0]);
	if (idx === 234) {
		console.log(spectrum.reverse());
		throw new Error();
	}
	results.positionsOfCorrect.push(spectrum.findIndex(s => s.code === data[0]));
	console.log(results);
	console.log(results.positionsOfCorrect.reduce((a, b) => a + b, 0) / results.positionsOfCorrect.length);
})