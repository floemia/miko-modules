import { MapInfo, ModMap } from "@rian8337/osu-base";
import { ExtendedDroidDifficultyAttributes, OsuDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DroidMods } from "osu-droid-scraping";

interface NewDroidResponse {
	UserId: number;
	Username: string;
	GlobalRank: number;
	CountryRank: number;
	OverallScore: number;
	OverallPP: number;
	OverallPlaycount: number;
	OverallAccuracy: number;
	Registered: string;
	LastLogin: string;
	Region: string;
	Supporter: number;
	CoreDeveloper: number;
	Developer: number;
	Contributor: number;
	Top50Plays: NewDroidResponseScore[];
	Last50Scores: NewDroidResponseScore[];
}

interface DroidRXScoreResponse {
	error?: string;
	acc: number;
	beatmap: {
		ar: number;
		artist: string;
		bpm: number;
		creator: string;
		cs: number;
		hp: number;
		id: number;
		last_update: number;
		max_combo: number;
		md5: string;
		mode: number;
		od: number;
		set_id: number;
		star: number;
		status: number;
		title: string;
		total_length: number;
		version: string;
	};
	combo: number;
	date: number;
	hit100: number;
	hit300: number;
	hit50: number;
	hitgeki: number;
	hitkatsu: number;
	hitmiss: number;
	id: number;
	maphash: string;
	mods: string;
	pp: number;
	rank: string;
	score: number;
	status: number;
}
interface DroidRXScore {
	id: number;
	accuracy: number;
	combo: number;
	played_date: Date;
	hash: string;
	color: string;
	mods: ModMap;
	rank: string;
	score: number;
	count: HitStatistics;
	pp: number;
	beatmap: DroidRXBeatmap;
	user?: DroidRXUser;
}
interface DroidRXBeatmap {
	ar: number;
	artist: string;
	bpm: number;
	creator: string;
	cs: number;
	hp: number;
	id: number;
	last_update: number;
	max_combo: number;
	md5: string;
	mode: number;
	od: number;
	set_id: number;
	star: number;
	status: number;
	title: string;
	total_length: number;
	version: string;
}
interface DroidRXUser {
	error?: string;
	country: string;
	id: number;
	name: string;
	online: boolean;
	prefix: string | null;
	stats: {
		accuracy: number;
		id: number;
		is_playing: boolean | null;
		plays: number;
		pp: number;
		rank: number;
		ranked_score: number;
		total_score: number;
	};
}
interface NewDroidResponseScore {
	ScoreId: number;
	Filename: string;
	Mods: string[];
	MapScore: number;
	MapCombo: number;
	MapRank: string;
	MapGeki: number;
	MapPerfect: number;
	MapKatu: number;
	MapGood: number;
	MapBad: number;
	MapMiss: number;
	MapAccuracy: number;
	MapPP: number;
	PlayedDate: string;
}

interface HitStatistics {
	nGeki: number,
	n300: number,
	nKatu: number,
	n100: number,
	n50: number,
	nMiss: number
}

interface NewDroidUser {
	id: number;
	username: string;
	avatar_url: string;
	color: string;
	rank: {
		global: number;
		country: number;
	}
	total_score: number;
	dpp: number;
	playcount: number;
	accuracy: number;
	registered: Date;
	last_login: Date;
	region: string;
	supporter: boolean;
	core_developer: boolean;
	developer: boolean;
	contributor: boolean;
}

interface DroidScoreExtended {
	id: number;
	filename: string;
	score: number;
	combo: number;
	rank: string;
	played_date: Date;
	accuracy: number;
	hash: string;
	color: string;
	mods: DroidMods
	count: HitStatistics;
	stars: ScoreStars;
	performance: DroidScoreCalculatedData;
	user?: NewDroidUser;
	beatmap?: MapInfo;
	server: "ibancho" | "relax"
}

interface DroidPerformanceCalculatorParameters {
	combo?: number;
	accuracy?: number;
	mods: DroidMods;
	count: HitStatistics;
	beatmap: MapInfo
}

interface DroidCalculatedData {
	beatmap: MapInfo<true>;
	performance: DroidScoreCalculatedData;
	count: HitStatistics;
	mods: DroidMods;
	accuracy: number;
	combo: number
	rank: string;
	color: string;
	rating : {
		droid: ExtendedDroidDifficultyAttributes,
		osu: OsuDifficultyAttributes
	}
}

interface ScoreStars {
	osu: number | null;
	droid: number | null;
}
interface DroidScoreCalculatedData {
	penalty?: boolean
	pp: number | null;
	dpp: number | null;
	dpp_no_penalty?: number
	fc?: {
		pp: number;
		dpp: number;
		accuracy: number;
	}
}

interface DroidScoresParameters {
	type: "top" | "recent";
	uid?: number;
	username?: string;
	response?: NewDroidResponse
}

interface NewDroidRequestParameters {
	uid?: number;
	username?: string;
}
interface NewDroidUserParameters {
	uid?: number;
	username?: string;
	response?: NewDroidResponse
}

interface DroidRXUserParameters {
	uid?: number;
	username?: string;
}

interface DroidRXScoreParameters {
	uid?: number;
	username?: string;
	limit?: number;
}

interface DroidCardParameters {
	user?: NewDroidUser;
	uid?: number;
	username?: string;
}

interface DroidScoreListPaginationParameters {
	scores: DroidScoreExtended[];
	page: number;
	scores_per_page: number;
}

export { NewDroidResponse, DroidScoreExtended, NewDroidResponseScore, HitStatistics, NewDroidUser, DroidScoreCalculatedData, DroidScoresParameters, NewDroidUserParameters, NewDroidRequestParameters, DroidCardParameters, DroidScoreListPaginationParameters, DroidRXScoreResponse, DroidRXUser, DroidRXUserParameters, DroidRXScoreParameters, DroidPerformanceCalculatorParameters, DroidCalculatedData, DroidRXScore, DroidRXBeatmap }