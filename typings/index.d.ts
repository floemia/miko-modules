import { MapInfo } from "@rian8337/osu-base";
import { DroidMods } from "osu-droid-scraping";

interface NewDroidResponse {
	error?: string;
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

interface DroidRXUserResponse {
	error?: string;
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
	beatmap: MapInfo | undefined;
}

interface ScoreStars {
	osu: number | null;
	droid: number | null;
}
interface DroidScoreCalculatedData {
	penalty: boolean
	pp: number | null;
	dpp: number | null;
	dpp_no_penalty: number | null
	fc: {
		pp: number | null;
		dpp: number | null;
		accuracy: number | null;
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
	uid: number;
}

interface DroidRXScoreParameters {
	uid: number;
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

export { NewDroidResponse, DroidScoreExtended, NewDroidResponseScore, HitStatistics, NewDroidUser, DroidScoreCalculatedData, DroidScoresParameters, NewDroidUserParameters, NewDroidRequestParameters, DroidCardParameters, DroidScoreListPaginationParameters, DroidRXScoreResponse, DroidRXUserResponse, DroidRXUserParameters, DroidRXScoreParameters }