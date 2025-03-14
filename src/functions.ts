import { DroidScoreExtended, NewDroidResponse, NewDroidRequestParameters, DroidScoresParameters, NewDroidUser, NewDroidUserParameters } from "../typings";
import { MapInfo, Accuracy, ModUtil, OsuAPIRequestBuilder } from "@rian8337/osu-base";
import { getAverageColor } from "fast-average-color-node";
import {
	DifficultyCalculationOptions,
	DroidDifficultyCalculator,
	DroidPerformanceCalculator,
	OsuDifficultyCalculator,
	OsuPerformanceCalculator,
	PerformanceCalculationOptions,
} from "@rian8337/osu-difficulty-calculator";
import { droid } from "osu-droid-scraping";

OsuAPIRequestBuilder.setAPIKey(process.env.OSU_API_KEY!)

export const request = async (params: NewDroidRequestParameters): Promise<NewDroidResponse> => {
	const base_url = `https://new.osudroid.moe/apitest`
	const endpoint = params.uid ? `/profile-uid/${params.uid}` : `/profile-username/${params.username}`
	const response = await fetch(base_url + endpoint)
	return await response.json()
}

export const user = async (params: NewDroidUserParameters): Promise<NewDroidUser | undefined> => {
	if (!params.username && !params.uid && !params.response) return undefined
	let profile: NewDroidResponse
	if (!params.response)
		profile= await miko.request({ uid: params.uid, username: params.username })
	else
		profile = params.response
	
	if (profile.error) return undefined
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

export const scores = async (params: DroidScoresParameters): Promise<DroidScoreExtended[] | undefined> => {
	if (!params.username && !params.uid && !params.response) return undefined
	let profile: NewDroidResponse

	if (!params.response)
		profile = await miko.request({ uid: params.uid, username: params.username })
	else
		profile = params.response

	if (profile.error) return undefined
	const scores = await droid.scores({ uid: profile.UserId, type: params.type })
	if (!scores) return undefined

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
		array.push({
			id: new_scores[i].ScoreId,
			filename: new_scores[i].Filename,
			score: new_scores[i].MapScore,
			combo: new_scores[i].MapCombo,
			rank: new_scores[i].MapRank,
			accuracy: new_scores[i].MapAccuracy,
			played_date: new Date(new_scores[i].PlayedDate),
			hash: score.hash,
			color: undefined,
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
				fc: {
					pp: null,
					dpp: null,
					accuracy: null
				}
			},
			beatmap: undefined,
			user: user
		})
		i++
	}
	return array
}

const calculate = async (score: DroidScoreExtended) => {
	const beatmapInfo = await MapInfo.getInformation(score.hash)
	if (!beatmapInfo || score.beatmap) return
	score.beatmap = beatmapInfo

	try {
		const color = await getAverageColor(`https://assets.ppy.sh/beatmaps/${beatmapInfo.beatmapSetId}/covers/card.jpg`)
		score.color = color.hex
	} catch {
		score.color = "#dedede"
	}

	const mods = ModUtil.pcStringToMods(score.mods.acronyms.join());

	const stats: DifficultyCalculationOptions = {
		mods: mods,
		customSpeedMultiplier: score.mods.speed
	}
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

	const droid_rating = new DroidDifficultyCalculator(beatmapInfo.beatmap).calculate(stats);
	const osu_rating = new OsuDifficultyCalculator(beatmapInfo.beatmap).calculate(stats);

	score.stars.droid = droid_rating.total
	score.stars.osu = osu_rating.total

	const osu_performance = new OsuPerformanceCalculator(osu_rating.attributes).calculate(perf_stats);
	score.performance.pp = osu_performance.total

	if (!score.performance.dpp) {
		const droid_performance = new DroidPerformanceCalculator(droid_rating.attributes).calculate(perf_stats)
		score.performance.dpp = droid_performance.total
	}

	if (score.count.nMiss != 0 || score.combo < beatmapInfo.maxCombo!) {
		const accuracy_fc = new Accuracy({
			nmiss: 0,
			n300: score.count.n300 + score.count.nMiss,
			n100: score.count.n100,
			n50: score.count.n50,
			nobjects: beatmapInfo.objects,
		});

		score.performance.fc.accuracy = accuracy_fc.value() * 100
		const perf_stats_fc: PerformanceCalculationOptions = {
			accPercent: accuracy_fc,
			miss: 0,
		}
		const osu_performance_fc = new OsuPerformanceCalculator(osu_rating.attributes).calculate(perf_stats_fc);
		score.performance.fc.pp = osu_performance_fc.total
		const droid_performance_fc = new DroidPerformanceCalculator(droid_rating.attributes).calculate(perf_stats_fc);
		score.performance.fc.dpp = droid_performance_fc.total
	}
}

// const card = async (params: DroidCardParameters) => {
// 	if (!params.user && !params.uid && !params.username) return undefined
// 	let profile: NewDroidUser
// 	if (params.user) profile = params.user
// 	if (params.uid || params.username) {

// 	}
// }


export const miko = { user, scores, request, calculate }