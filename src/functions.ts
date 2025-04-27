// @ts-ignore
import { DroidScoreExtended, NewDroidResponse, NewDroidRequestParameters, DroidScoresParameters, NewDroidUser, NewDroidUserParameters, DroidScoreListPaginationParameters, DroidRXUserParameters, DroidRXScoreParameters, DroidRXScoreResponse, DroidPerformanceCalculatorParameters, DroidCalculatedData, DroidRXUser, DroidRXScore } from "../typings";
import { MapInfo, Accuracy, ModUtil, OsuAPIRequestBuilder, ModCustomSpeed } from "@rian8337/osu-base";
import { getAverageColor } from "fast-average-color-node";
import { DroidLegacyModConverter } from "@rian8337/osu-base";

import {
	DroidDifficultyCalculator,
	DroidPerformanceCalculator,
	OsuDifficultyCalculator,
	OsuPerformanceCalculator,
	PerformanceCalculationOptions,
} from "@rian8337/osu-difficulty-calculator";
import { droid } from "osu-droid-scraping";

OsuAPIRequestBuilder.setAPIKey(process.env.OSU_API_KEY!)
export const request = async (params: NewDroidRequestParameters): Promise<NewDroidResponse | { error: string }> => {
	const base_url = `https://new.osudroid.moe/apitest`
	const endpoint = params.uid ? `/profile-uid/${params.uid}` : `/profile-username/${params.username}`
	try {
		const response = await fetch(base_url + endpoint)

		if (!response.ok) {
			if (response.status === 404) return { error: "User not found." }
			else return { error: "Request error." }
		}
		try {
			let data = await response.json()
			return data
		} catch (error) {
			if (typeof error === "string") return { error: error }
			else if (error instanceof Error) return { error: error.message }
		}
	} catch (error) {
		return { error: "Network / address / internal error." }
	}
	return { error: "Unknown error." }
}

export const rx = {
	user: async (params: DroidRXUserParameters): Promise<DroidRXUser | { error: string }> => {
		if (!params.username && !params.uid) return { error: "No parameters were provided." }
		let url = `https://v4rx.me/api/get_user/`
		if (params.uid) url += `?id=${params.uid}`
		else url += `?name=${params.username}`
		try {
			const response = await fetch(url)
			if (!response.ok) {
				if (response.status === 404) return { error: "User not found." }
				else return { error: "Request error." }
			}
			try {
				let data = await response.json()
				try {
					fetch(`https://v4rx.me/user/avatar/${data.id}.png`)
					data.avatar_url = `https://v4rx.me/user/avatar/${data.id}.png`
					data.color = (await getAverageColor(data.avatar_url)).hex
				} catch {
					data.avatar_url = `https://osudroid.moe/user/avatar/0.png`
					data.color = "#dedede"
				}
				return data
			} catch (error) {
				if (typeof error === "string") return { error: error }
				else if (error instanceof Error) return { error: error.message }
			}
		} catch (error) {
			return { error: "Network / address / internal error." }
		}
		return { error: "Unknown error." }

	},
	scores: {
		recent: async (params: DroidRXScoreParameters): Promise<DroidRXScore[] | { error: string }> => {
			if (!params.uid && !params.username) return { error: "No parameters were provided." }
			const rx_user = await miko.rx.user({ uid: params.uid, username: params.username })
			if ("error" in rx_user) return { error: `${rx_user.error}` }
			params.uid = rx_user.id
			const base_url = `https://v4rx.me/api/`
			const endpoint = `get_scores/?id=${params.uid}&limit=${params.limit || 50}`
			let response: Response
			try {
				response = await fetch(base_url + endpoint)
				if (!response.ok) return { error: "Request failed" }
				try {
					let data: DroidRXScoreResponse[] | { error: string } = await response.json()
					if ("error" in data) return { error: data.error }
					let scores: DroidRXScore[] = []
					for (const score of data)
						scores.push(parse_score_rx(score, rx_user))

					return scores
				} catch (error) {
					if (typeof error === "string") return { error: error }
					else if (error instanceof Error) return { error: error.message }
				}
			} catch (error) {
				return { error: "Network / address / internal error." }
			}
			return { error: "Unknown error." }
		},
		top: async (params: DroidRXScoreParameters): Promise<DroidRXScore[] | { error: string }> => {
			if (!params.uid && !params.username) return { error: "No parameters were provided." }
			const rx_user = await miko.rx.user({ uid: params.uid, username: params.username })
			if ("error" in rx_user) return { error: `${rx_user.error}` }
			params.uid = rx_user.id
			const base_url = `https://v4rx.me/api/`
			const endpoint = `top_scores/?id=${params.uid}&limit=${params.limit || 50}`
			let response: Response
			try {
				response = await fetch(base_url + endpoint)
				if (!response.ok) return { error: "Request failed" }
				try {
					let data: DroidRXScoreResponse[] | { error: string } = await response.json()
					if ("error" in data) return { error: data.error }
					let scores: DroidRXScore[] = []
					for (const score of data)
						scores.push(parse_score_rx(score, rx_user))

					return scores
				} catch (error) {
					if (typeof error === "string") return { error: error }
					else if (error instanceof Error) return { error: error.message }
				}
			} catch (error) {
				return { error: "Network / address / internal error." }
			}
			return { error: "Unknown error." }
		}
	}
}

const parse_score_rx = (score: DroidRXScoreResponse, user?: DroidRXUser): DroidRXScore => {
	return {
		id: score.id,
		accuracy: score.acc,
		combo: score.combo,
		played_date: new Date(score.date),
		hash: score.maphash,
		color: "#dedede",
		mods: mods(score.mods),
		rank: score.rank,
		score: score.score,
		count: {
			n300: score.hit300,
			nGeki: score.hitgeki,
			nKatu: score.hitkatsu,
			n100: score.hit100,
			n50: score.hit50,
			nMiss: score.hitmiss,
		},
		pp: score.pp,
		beatmap: score.beatmap,
		user: user,
	}
}
export const user = async (params: NewDroidUserParameters): Promise<NewDroidUser | { error: string }> => {
	if (!params.username && !params.uid && !params.response) return { error: "No parameters were provided." }
	let profile: NewDroidResponse | { error: string }
	if (!params.response)
		profile = await miko.request({ uid: params.uid, username: params.username })
	else
		profile = params.response

	if ("error" in profile) return { error: profile.error }

	let avatar_url: string
	if ((await fetch(`https://osudroid.moe/user/avatar/${profile.UserId}.png`)).status != 404)
		avatar_url = `https://osudroid.moe/user/avatar/${profile.UserId}.png`
	else
		avatar_url = `https://osudroid.moe/user/avatar/0.png`

	const user: NewDroidUser = {
		id: profile.UserId,
		username: profile.Username,
		avatar_url: avatar_url,
		color: (await getAverageColor(avatar_url)).hex,
		rank: {
			global: profile.GlobalRank,
			country: profile.CountryRank
		},
		total_score: profile.OverallScore,
		dpp: profile.OverallPP,
		playcount: profile.OverallPlaycount,
		accuracy: profile.OverallAccuracy,
		registered: new Date(profile.Registered),
		last_login: new Date(profile.LastLogin),
		region: profile.Region,
		supporter: (profile.Supporter == 1),
		core_developer: (profile.CoreDeveloper == 1),
		developer: (profile.Developer == 1),
		contributor: (profile.Contributor == 1),
	}
	return user
}


export const scores = async (params: DroidScoresParameters): Promise<DroidScoreExtended[] | { error: string }> => {
	if (!params.username && !params.uid && !params.response) return { error: "No parameters were provided." }
	let profile: NewDroidResponse | { error: string }

	if (!params.response)
		profile = await miko.request({ uid: params.uid, username: params.username })
	else
		profile = params.response

	if ("error" in profile) return { error: profile.error }
	const scores = await droid.scores({ uid: profile.UserId, type: params.type })
	if ("error" in scores) return { error: scores.error }

	const array: DroidScoreExtended[] = []
	if (!scores.length) return array
	let i = 0
	const new_scores = params.type == "top" ? profile.Top50Plays : profile.Last50Scores
	const user: NewDroidUser = {
		id: profile.UserId,
		username: profile.Username,
		avatar_url: scores[0].user.avatar_url,
		color: (await getAverageColor(scores[0].user.avatar_url)).hex,
		rank: {
			global: profile.GlobalRank,
			country: profile.CountryRank
		},
		total_score: profile.OverallScore,
		dpp: profile.OverallPP,
		playcount: profile.OverallPlaycount,
		accuracy: profile.OverallAccuracy,
		registered: new Date(profile.Registered),
		last_login: new Date(profile.LastLogin),
		region: profile.Region,
		supporter: (profile.Supporter == 1),
		core_developer: (profile.CoreDeveloper == 1),
		developer: (profile.Developer == 1),
		contributor: (profile.Contributor == 1),
	}
	for (const score of scores) {
		if (score.mods.speed != 1) score.mods.acronyms.push("CS")
		array.push({
			id: new_scores[i].ScoreId,
			filename: new_scores[i].Filename,
			score: new_scores[i].MapScore,
			combo: new_scores[i].MapCombo,
			rank: new_scores[i].MapRank,
			accuracy: new_scores[i].MapAccuracy,
			played_date: new Date(new_scores[i].PlayedDate),
			hash: score.hash,
			color: "#dedede",
			mods: score.mods,
			count: {
				n300: new_scores[i].MapPerfect,
				nGeki: new_scores[i].MapGeki,
				nKatu: new_scores[i].MapKatu,
				n100: new_scores[i].MapGood,
				n50: new_scores[i].MapBad,
				nMiss: new_scores[i].MapMiss
			},
			stars: {
				osu: null,
				droid: null
			},
			performance: {
				pp: null,
				dpp: new_scores[i].MapPP,
			},
			beatmap: undefined,
			user: user,
			server: "ibancho"
		})
		i++
	}
	return array
}
const calculate = async (score: DroidScoreExtended) => {
	if (score.beatmap) return
	const beatmapInfo = await MapInfo.getInformation(score.hash)
	if (!beatmapInfo) return
	score.beatmap = beatmapInfo
	try {
		const color = await getAverageColor(`https://assets.ppy.sh/beatmaps/${beatmapInfo.beatmapSetId}/covers/card.jpg`)
		score.color = color.hex
	} catch {
		score.color = "#dedede"
	}
	const mods = ModUtil.pcStringToMods(score.mods.acronyms.join())
	if (mods.has(ModCustomSpeed)) mods.set(new ModCustomSpeed(score.mods.speed))

	const accuracy = new Accuracy({
		nmiss: score.count.nMiss,
		n300: score.count.n300,
		n100: score.count.n100,
		n50: score.count.n50,
		nobjects: beatmapInfo.objects,
	});
	const perf_stats: PerformanceCalculationOptions = {
		combo: score.combo,
		accPercent: accuracy,
		miss: score.count.nMiss,
	}
	const droid_rating = new DroidDifficultyCalculator().calculate(beatmapInfo.beatmap, mods);
	const osu_rating = new OsuDifficultyCalculator().calculate(beatmapInfo.beatmap, mods);
	score.stars.droid = droid_rating.starRating
	score.stars.osu = osu_rating.starRating

	const osu_performance = new OsuPerformanceCalculator(osu_rating).calculate(perf_stats);
	score.performance.pp = osu_performance.total
	const droid_performance = new DroidPerformanceCalculator(droid_rating).calculate(perf_stats)
	if (score.performance.dpp) {
		if (droid_performance.total - score.performance.dpp > 0.1) {
			score.performance.penalty = true
			score.performance.dpp_no_penalty = droid_performance.total
		}
	} else score.performance.dpp = droid_performance.total

	if (score.count.nMiss != 0 || score.combo < beatmapInfo.maxCombo! - 10) {
		const accuracy_fc = new Accuracy({
			nmiss: 0,
			n300: score.count.n300 + score.count.nMiss,
			n100: score.count.n100,
			n50: score.count.n50,
			nobjects: beatmapInfo.objects,
		});
		score.performance.fc = {
			accuracy: accuracy_fc.value() * 100,
			pp: 0,
			dpp: 0,
		}
		const perf_stats_fc: PerformanceCalculationOptions = {
			accPercent: accuracy_fc,
			miss: 0,
		}
		const osu_performance_fc = new OsuPerformanceCalculator(osu_rating).calculate(perf_stats_fc);
		score.performance.fc.pp = osu_performance_fc.total
		const droid_performance_fc = new DroidPerformanceCalculator(droid_rating).calculate(perf_stats_fc);
		score.performance.fc.dpp = droid_performance_fc.total
	}
}

const performance = async (details: DroidPerformanceCalculatorParameters): Promise<DroidCalculatedData> => {
	let color_hex = "#dedede"
	try {
		const color = await getAverageColor(`https://assets.ppy.sh/beatmaps/${details.beatmap!.beatmapSetId}/covers/card.jpg`)
		color_hex = color.hex
	} catch {
		color_hex = "#dedede"
	}
	let beatmap = details.beatmap!

	const mods = ModUtil.pcStringToMods(details.mods.acronyms.join())
	if (mods.has(ModCustomSpeed)) mods.set(new ModCustomSpeed(details.mods.speed))
	let acc = details.accuracy

	const accuracy = new Accuracy({
		percent: acc,
		nmiss: details.count.nMiss,
		n300: acc ? undefined : details.count.n300,
		n100: acc ? undefined : details.count.n100,
		n50: acc ? undefined : details.count.n50,
		nobjects: beatmap.objects,
	});

	let n300 = accuracy.n300
	let n100 = accuracy.n100
	let n50 = accuracy.n50
	let nMiss = accuracy.nmiss

	if (details.combo == -1) details.combo = beatmap.maxCombo!

	let silver = /HD|FL/i.test(details.mods.acronyms.join())
	let total = n300 + n100 + n50 + nMiss;

	let r300 = n300 / total;
	let r50 = n50 / total;
	let rank: string;
	if (r300 === 1) rank = silver ? 'XH' : 'X';
	else if (r300 > 0.9 && r50 < 0.01 && nMiss === 0) rank = silver ? 'SH' : 'S';
	else if ((r300 > 0.8 && nMiss === 0) || r300 > 0.9) rank = 'A';
	else if ((r300 > 0.7 && nMiss === 0) || r300 > 0.8) rank = 'B';
	else if (r300 > 0.6) rank = 'C';
	else rank = 'D';

	const perf_stats: PerformanceCalculationOptions = {
		combo: details.combo,
		accPercent: accuracy,
		miss: details.count.nMiss,
	}

	const droid_rating = new DroidDifficultyCalculator().calculate(beatmap.beatmap!, mods);
	const osu_rating = new OsuDifficultyCalculator().calculate(beatmap.beatmap!, mods);
	const osu_performance = new OsuPerformanceCalculator(osu_rating).calculate(perf_stats);
	const droid_performance = new DroidPerformanceCalculator(droid_rating).calculate(perf_stats)

	let mods_str = mods.serializeMods().map(mod => mod.acronym)
	return {
		beatmap: beatmap,
		accuracy: accuracy.value(),
		mods: {
			acronyms: mods_str,
			speed: details.mods.speed,
		},
		rank: rank,
		combo: details.combo || beatmap.maxCombo!,
		performance: {
			pp: osu_performance.total,
			dpp: droid_performance.total,
		},
		count: {
			n300: n300,
			n100: n100,
			n50: n50,
			nMiss: nMiss,
			nGeki: 0,
			nKatu: 0,
		},
		rating: {
			droid: droid_rating,
			osu: osu_rating,
		},
		color: color_hex,
	}
}

const score_pagination = async (params: DroidScoreListPaginationParameters): Promise<DroidScoreExtended[]> => {
	if (!params.scores.length) return []
	const start = 5 * params.page
	const end = start + 5
	return params.scores.slice(start, end)
}

const mods = (droid_mods: string) => DroidLegacyModConverter.convert(droid_mods)



// const card = async (params: DroidCardParameters) => {
// 	if (!params.user && !params.uid && !params.username) return undefined
// 	let profile: NewDroidUser
// 	if (params.user) profile = params.user
// 	if (params.uid || params.username) {

// 	}
// }


export const miko = { user, scores, request, calculate, score_pagination, rx, performance, mods }