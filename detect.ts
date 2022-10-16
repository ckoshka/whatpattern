import { makeMap } from "./3letter_codes.js";

import {
	instantiate,
	instantiateWithInstance,
} from "./lib/langdetect_wasm.generated.js";

import { langs } from "./udhr_list.js";
import { labels } from "./wikipedia/labels.ts";

type Extract<T> = T extends Promise<infer K>
	? K extends { exports: infer B }
		? B extends { Detector: infer D } ? D : never
	: never
	: never;
export type LanguageDetector = Extract<
	ReturnType<typeof instantiateWithInstance>
>;
export type Summary = {
	language_name: string;
	likelihood: number;
};
export const FormatDetector = async () => {
	const { Detector } = await instantiate();
	const detector = new Detector();
	return {
		addStr: detector.add_str.bind(detector),
		addBytes: detector.add_bytes.bind(detector),
		detect: (text: string) => {
			try {
                return JSON.parse(detector.detect(text)).reverse() as Summary[]
            } catch {
                return []
            }
        }
	};
};

export type LanguageDetectorOpts = {
	all: boolean;
	dataset: "wikipedia" | "udhr"
};

export const LanguageDetector = async (opts: LanguageDetectorOpts) => {
	const detector = await FormatDetector();
	const map = makeMap();
	if (opts.all) {
		if (opts.dataset === "udhr") {
			for (const lang of langs) {
				const u = new URL(`./languages_udhr/${lang}`, import.meta.url);
				const data = await fetch(u).then((t) => t.text());
				detector.addStr(data, lang.replace(".html", ""));
			}
		} else if (opts.dataset === "wikipedia") {
			for (const lang of labels.slice(1)) {
				const u = new URL(`./wikipedia/data/${lang}.html`, import.meta.url);
				const data = await fetch(u).then((t) => t.text()).then(t => t.replace("\n", ""));
				detector.addStr(data, lang);
			}
		} else {
			throw new Error("Unrecognised dataset: valid ones are: wikipedia | udhr")
		}
	}
	const detect = (text: string) =>
		detector.detect(text).map((s) => ({
			languageName: map.get(s.language_name.split("_")[0]) ||
				"unknown",
			code: s.language_name,
			likelihood: s.likelihood,
		}));
	const self = {
		...detector,
		detect: (text: string) => {
			const result = [...new Intl.Segmenter(undefined, {granularity: "sentence"}).segment(text.replace("\n", " "))]
                .map(s => s.segment)
                .reduce((prev, curr) => prev.slice(-1)[0] && prev.slice(-1)[0].length > 100 ? prev.concat([curr]) : [...prev.slice(0, -1), prev.slice(-1)[0] + curr], [] as string[])
				.filter(l => l.length > 0)
				.map(detect)
				.reduce(
					(prev, curr) => (curr.forEach((item) =>
						prev[item.code]
							? prev[item.code].likelihood += item.likelihood
							: (prev[item.code] = item)
					),
						prev),
					{} as Record<
						string,
						{ languageName: string; likelihood: number }
					>,
				);
            
            const sorted = Object.entries(result).map(([code, item]) => ({code, ...item})).sort((a, b) => b.likelihood - a.likelihood);
			//if (sorted.slice(-1)[0] && sorted.slice(-1)[0].likelihood < 0) {
			//	sorted.forEach(s => s.likelihood *= -1);
			//	return sorted;
			//}
			// it's being divided by the highest one, which makes them negative sometimes
			return sorted;
                
		},
	};
	return self;
};
// todo: add a method for segmenting into sentences or paragraphs (or just normal slices), then totalling them together
