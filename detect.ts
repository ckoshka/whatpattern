import { makeMap } from "./3letter_codes.js";

import {
	instantiate,
	instantiateWithInstance,
} from "./lib/langdetect_wasm.generated.js";

import { langs } from "./udhr_list.js";

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
};

export const LanguageDetector = async (opts: LanguageDetectorOpts) => {
	const detector = await FormatDetector();
	const map = makeMap();
	if (opts.all) {
		for (const lang of langs) {
			const u = new URL(`./languages_udhr/${lang}`, import.meta.url);
			const data = await fetch(u).then((t) => t.text());
			detector.addStr(data, lang.replace(".html", ""));
			//console.log("Added", lang);
		}
	}
	const self = {
		...detector,
		detect: (text: string) =>
			detector.detect(text).map((s) => ({
				languageName: map.get(s.language_name.split("_")[0]) ||
					"unknown",
				code: s.language_name,
				likelihood: s.likelihood,
			})),
		detectSliced: (text: string) => {
			const result = [...new Intl.Segmenter(undefined, {granularity: "sentence"}).segment(text.replace("\n", " "))]
                .map(s => s.segment)
                .reduce((prev, curr) => prev.slice(-1)[0] && prev.slice(-1)[0].length > 100 ? prev.concat([curr]) : [...prev.slice(0, -1), prev.slice(-1)[0] + curr], [] as string[])
				.map(self.detect)
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
            
            return Object.entries(result).map(([code, item]) => ({code, ...item})).sort((a, b) => b.likelihood - a.likelihood)
                
		},
	};
	return self;
};
// todo: add a method for segmenting into sentences or paragraphs (or just normal slices), then totalling them together

const d = await LanguageDetector({ all: true });

console.log(
	d.detectSliced(
		`# İNSAN AQLARINIÑ UMUMİY BEYANNAMESİ ## MUQADDEME İnsan ailesiniñ cemi azalarına has olğan menlik duyğusı em de olarnıñ musaviy ve ayırılmaz aqlarınıñ tanılması adalet ve umumiy barışıqlıqnıñ temeli olğanını nazarğa alaraq; ve insan aqlarına lâqaydlıq ve aqaret beşeriyetniñ vicdanını ğadaplandırğan vahşiy amellerge alıp kelgeni ve insanlarnıñ söz ve aqide serbestligine malik olacağı, qorqu ve muhtaclıqtan azat olacağı bir dünyanıñ yaratılması insanlarnıñ eñ büyük arzusı kibi beyan etilgenini nazarğa alaraq; ve insannıñ istibdat ve basqığa qarşı eñ soñ çare olaraq baş kötermege mecbur qalmamasını temin etmek maqsadında insan aqlarınıñ uquq üstünligi ile qorulmasınıñ zarurlığını nazarğa alaraq; ve milletler arasında dostluq munasebetleriniñ inkişafını desteklemekniñ zarur olğanını nazarğa alaraq; ve Birleşken Milletler halqlarınıñ Nizamnamede insannıñ esas aqlarına, insan şahsınıñ degerligi ve qıymetine, erler ve qadınlarnıñ musaviyligine olğan işançlarını tasdiqlağanları, içtimaiy teraqqiyat ve yaşayış şaraitleriniñ daa ziyade serbestlik müitinde yahşılaştırılmasına qoltutmağa qarar bergenlerini nazarğa alaraq; ve aza devletler Birleşken Milletler Teşkilâtı ile işbirlikte bulunıp, insan aqlarına ve temelli üriyetlerine bütün dünyanıñ kerçekten de sayğı köstermesi ve riayet etmesini teminlemek mecburiyetini alğanlarını nazarğa alaraq; ve bu aqlar ve üriyetler er kes tarafından aynı şekilde añlaşılması yuqarıda qayd etilgen mecburiyetniñ tolusınen yerine ketirilmesi içün büyük emiyetke malik olğanını nazarğa alaraq, Birleşken Milletlerniñ Baş Assambleyası er kes ve cemiyetniñ er bir qurumı mezkür Beyannameni daima köz ögünde tutaraq, bu aqlarğa ve üriyetlerge, maarif ve tasil yolunen, terakqqiy milliy ve halqara tedbirler yolunen, olarnıñ em de Teşkilâtqa aza olğan devletlerniñ halqları, em de bu devletlerniñ idaresi altında olğan topraqlarda yaşağan milletler arasında bu aqlarnıñ dünyaca ve semereli şekilde tanılması ve tadbiq etilmesini teminlemege ğayret etmeleri içün mezkür İnsan Aqlarınıñ Umumiy Beyannamesini ilân ete. ## 1-nci madde Bütün insanlar serbestlik, menlik ve uquqlarda musaviy olıp dünyağa keleler. Olar aqıl ve vicdan saibidirler ve biri-birilerinen qardaşçasına munasebette bulunmalıdırlar ## 2 -nci madde Er kes ırqı, tüsü, cınsı, tili, dini, siyasiy ve diger aqideleri, milliy ya da içtimaiy, bir de-bir tabaqağa mensüpliginden, serveti ve diger er angi alından qatiy nazar mezkür Beyannamede ilân etilgen tekmil aqlar ve bütün serbestliklerge malik olmalıdır. Bundan ğayrı mensüp olğan memleketniñ ya da hududnıñ siyasiy, uquqiy ve halqara statusına, bu hududnıñ mustaqil, özüni idare etmegen ve ya da mustaqilligi er angi bir şekilde sıñırlanğan olıp-olmamasından qatiy nazar insanğa nisbeten iç bir farq kösterilmemelidir. ## 3-nci madde Er kes yaşamaq, serbestlik ve şahsiy havfsızlıq aqqına maliktir. ## 4-nci madde İç bir kimse qullıq ya da esaret altında bulunmamalıdır; qullıq ve qul ticaretiniñ bütün çeşitleri yasaqtır. ## 5-nci madde İç kimse iskence ve yahut zalımane, ve ya da onıñ degerligini aqsımlağan munasebet ve cezağa oğratılmamalıdır. ## 6-ncı madde Er kes qayerde olsa olsun, kendisiniñ uquq subyekti olaraq qabul etilüv aqqına maliktir. ## 7-nci madde Qanun qarşısında er kes birdir ve farqsız olaraq uquq tarafından musaviy qorçalanılmaq aqqına maliktir. Er kes, işbu Beyannameni bozğan er türlü aqsımlav ve böyle aqsımlavnı qızıştıruvdan qorçalanılmaq musaviy aqqına maliktir. ## 8-nci madde Er kes onıñ, anayasa ya da qanun teminlegen, esas aqları bozulğan taqdirde, selâhiyetli milliy mahkemeler tarafından bu aqları tiklenmek aqqına maliktir. ## 9-ncı madde İç kimse esassız yaqalanmaz, tutuvlanmaz yahut sürgün etilmez. ## 10-ncı madde Er kes, onıñ aqları ve borcunı belgilemek em de oña qarşı kösterilgen cinaiy qabaatlanuvnıñ delilligini tesbit etmek içün, tolu musaviylik esasında, onıñ işi mustaqil ve bitaraf mahkeme tarafından aşkâr ve adaletli tarzda baqılmaq aqqına maliktir. ## 11-nci madde 1. Cinaiy suçı olmasında qabaatlanğan er kes, onıñ qabaatı qanuniy tertip ile, aşkâr mahkeme esnasında ve bütün qorçalav imkânları teminlengen alda belgilenmegence, qabaatsız, dep tanılmaq aqqına maliktir. 2. İç kimse, nasıldır areket esasında cinayet etkeni ya da areketsizligi içün, olar yapılğan vaqıtta milliy yahut halqara uquq boyunca cinayet sayılmasa, mahküm etilmez. Yapılğan cinayetke kesilmek ihtimalı olğan ceza, o berilgen vaqıtqa köre, daa da qattı ola bilmez. ## 12-nci madde Kimse, onıñ şahsiy ve aileviy ömürine, meskenine tiyilmemezlik, yazışmaq sırına yahut onıñ namus ve itibarına esassız kirişmek, qast etmek areketlerine oğratıla bilmez. Er kes, böyle kirişmek yahut qastlardan qanun qorçalavı aqqına maliktir. ## 13-nci madde 1. Er kes, devlet çerçivesinde serbest yürmek ve yaşağan yerini seçip almaq aqqına maliktir. 2. Er kes, er angi, şu cümleden, öz memleketini terk etmek ve öz memleketine qaytmaq aqqına maliktir. ## 14-nci madde 1. Er kes, taqipke oğrağanda başka memleketlerde sığınaq bulmaq ve ondan faydalanmaq aqqına maliktir. 2. Bu aq, taqip asılında siyasiy olmağan cinayetke ya da Birleşken Milletlerniñ maqsadı ve mevamlarına zıt kelgen areketke esaslanğan taqdirde, işletile bilmez. ## 15-nci madde 1. Er kes vatandaşlıq aqqına maliktir. 2. Kimse öz vatandaşlığından yahut, vatandaşlığını deñiştirmek aqqından esassız marum etilmez. ## 16-ncı madde 1. Çağına yetken erler ve qadınlar, ırq, milliy ya da diniy alâmetlerine baqmadan, evlenmek ve aile qurmaq aqqına malikler. Olar, evlenecekte, evli olğanda ve ayrılışqanda aynı aqlarnı qullanmaqtalar. 2. Nikâh yalıñız evlenecek eki tarafnıñ da serbest ve tolusınen razılığı ile olabilir. 3. Aile cemiyetniñ tabiiy ve esas birlemidir em de cemiyet ve devlet tarafından qorçalanmaq aqqına maliktir. ## 17-nci madde 1. Er kes, şahsiy ve başqalarnen beraberlikteki mal-mülk saibi olmaq aqqına maliktir. 2. Kimse esassız alda öz mal-mülkünden marum etilmez. ## 18-nci madde Er kes fikir, itiqat ve din serbestligi aqqına malik; bu aq – em şahsiy tarzda, em de başqalarnen beraberlikte, alem-aşkâre ya da hususiy alda, oquvda, ibadet etüvde ve diniy merasimlerni becergende – öz dinini yahut itiqatlarını deñiştirmek ve öz dinini yahut itiqatlarnı izar etmek serbestligini içine almaqta. ## 19-ncı madde Er kes, tış qarışuvına oğramağan fikirler ve olarnı serbest ifade etmek aqqına malik; bu aq, öz itiqatlarına riayet etmek serbestliginden ve istegen vastalarnen em de, sıñırlardan qatiy nazar, malümat ve ğayelerni qıdırmaq, almaq ve darqatmaq serbestliginden ibarettir. ## 20-nci madde 1. Er kes tınç toplaşuvlar ve birleşmeler serbestligi aqqına maliktir. 2. Kimse, qaysı bir birleşmege kirmek içün mecbur etilmez. ## 21-nci madde 1. Er kes bivasta ya da serbest saylanğan vekiller vastasınen öz memleketiniñ idaresinde iştirak etmek aqqına maliktir. 2. Er kes öz memleketiniñ devlet qurumlarınla musaviy iştirak etmek aqqına maliktir. 3. Halq iradesi ükümet akimiyetiniñ temeli olmalıdır; bu irade gizli ya da başqa böyle serbest saylav usulları vastasınen umumiy ve musaviy saylav aqqı ile ötkerilgen devriy ve açıq saylavlarda öz ifadesini tapmalıdır. ## 22-nci madde Er kes, cemiyetniñ azası olaraq, içtimaiy qorçalav aqqına maliktir; degerligi ve şçahsiyetiniñ serbest inkişaf etmesi içün zarur olğan iqtisadiy, içtimaiy ve medeniy saalardaki aqlarnıñ milliy ğayret ve halqara işbirlik vastasınen ve er devletniñ resursları ve qurulışına köre teminlev aqqına maliktir. ## 23-nci madde 1. Er kes çalışmaq, işini serbest seçmek, adaletli, oñaytlı iş şaraitlerine malik olmaq ve işsizlikten qorçalanmaq aqqına maliktir. 2. Er kes, iç bir aqsımlavsız, musaviy emegi içün musaviy maaş almaq aqqına maliktir. 3. Er çalışqan insan, özü ve qorantası içün insanğa munasip yaşayış teminlegen adaletli ve lâyıq odev, lâzim olğanda, başqa qoşulğan içtimaiy teminat vastalarını qullanmaq aqqına maliktir. 4. Er kes zenaat birliklerini meydanğa ketirmek ve öz menfaatını qorçalamaq içün zenaat birliklerine qoşulmaq aqqına maliktir. ## 24-nci madde Er kes raatlanmaq, eglenmek, şu cümleden iş saatleriniñ aqılane sıñırlanması ve ödenilgen devriy tatil aqqına maliktir. ## 25-nci madde 1. Er kes özü ve qorantasınıñ sağlığı ve abadanlığı içün ğıda, urba, mesken, tibbiy baqım ve kerekli içtimaiy hızmetlerine saip olmaq aqqına maliktir. Er kes işsizlik, hastalıq, saqatlıq, tullıq, qartlıq ya da oña bağlı olmağan şartlardan asıl olğan fuqarelik allarında qorçalanuv aqqına maliktir. 2. Analıq ve balalıq ayrıca qayğıruv ve yardım aqqını bere. Epsi balalar, nikâh ile ya da nikâhsız dünyağa kelgenler, aynı içtimaiy qoruvğa maliktirler. ## 26-ncı madde 1. Er kes tasil aluv aqqına maliktir. İç olmağanda, başlanğıç ve umumiy tasil bedava olmalıdır. Başlanğıç tasil mecburiy olmalıdır. Tehnikiy ve zenaat tasilden er kes faydalanmalıdır, er kim elde etken neticelerine köre musaviy şekilde aliy tasil alabilir. 2. Tasil insan şahsınıñ tolu inkişafına, aqları ve esas serbestliklerine sayğı arttıruvğa doğrultılmalıdır. Tasil halqlar, ırq ve diniy taqımlar arasında özara añlaşuv, sabır ve dostluqqa, ve Milletler Birleşmesiniñ tınçlıq saqlamaq faaliyetine qoltutmaq kerek. 3. Ana-babalarnıñ öz balalarına tasil çeşitini saylavda üstün olmaq aqqı bar. ## 27-nci madde 1. Er kes cemiyetniñ medeniy ömürine serbest qatılmaq, sanattan zevqlanmaq, ilmiy teraqqiyatta iştirak etmek ve bundan faydalanmaq aqqına maliktir. 2. Er kes ilmiy, edebiy ya da bediiy eserleriniñ müellifi olaraq, ahlâqiy ve maddiy menfaatı qorçalanması aqqına maliktir. ## 28-nci madde Er kes, bu Beyannamede ifade etilgen aqlar ve üriyetler tolusınen ömürge keçirilgende, cemaa ve halqara tertip aqqına maliktir. ## 29-ncı madde 1. Er kes yalıñız, onıñ şahsiyeti serbest ve tolu inkişaf ola bilecek, cemiyet ögünde borcludır. 2. Öz aqları ve serbestliklerini ömürge keçirgende, er kes yalıñız, qanun başqalarnıñ aqları ve serbestliklerini tanımaq ve ürmet etmek em de demokratik cemiyetteki ahlâq, cemaa tertibi ve umumiy eyiallıqnıñ adaletli talaplarını qanaatlendirmesini teminlemek maqsadınen belgilegen sıñırlanuvlarğa oğratıla. 3. Bu aqqlar ve serbestlikler ömürge keçirilgende Milletler Birleşmesiniñ maqsatları ve printsiplerine zıt olması iç te mümkün degil. ## 30-ncı madde İşbu Beyannamedeki iç bir madde, nasıldır bir devlet, şahıslar taqımı ya da ayrı şahısqa, yuqarıda kösterilgen er angi aqlar ve serbestliklerge zarar ketirilmesine doğrultılğan faaliyetke ya da areketke aq bere, dep izaa etilmez. `,
	),
);
