import { miko } from "../src";

// const test_ibancho = async() => {
// 	const data = await miko.request({ uid: 177955 })
// 	if (data.error) return

// 	//const user = await miko.user({ response: data })
// 	//const recent = await miko.scores({ response: data, type: "recent" })
// 	const top = (await miko.scores({ response: data, type: "top" }))!

// 	let page = 0
// 	const top5 = await miko.score_pagination({ scores: top, page: page, scores_per_page: 5 })
// 	let i = 5*page
// 	for (const score of top5) {
// 		console.log(`${i+1}. ${score.beatmap?.title} - ${score.performance.dpp?.toFixed(2)}`)
// 		i++
// 	}
// }

const test_rx = async() => {
	const data = await miko.rx_scores_request({ uid: 27 })
	console.log(data)
	if (!data) return
}
test_rx()
