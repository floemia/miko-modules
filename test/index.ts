import { miko } from "../src";

const test_ibancho = async () => {
	const data = await miko.request({ uid: 177955 })
	if ("error" in data) return console.log(data)

	//const user = await miko.user({ response: data })
	//const recent = await miko.scores({ response: data, type: "recent" })
	const recent = await miko.scores({ response: data, type: "top" })
	if ("error" in recent) return

	await miko.calculate(recent[0])
}

// const test_rx = async () => {
// 	const data = await miko.rx_scores_request({ uid: 27 })
// 	console.log(data)
// 	if (!data) return
// }

// const test_perf = async () => {
// 	let beatmap = await MapInfo.getInformation(4303461)
// 	if (!beatmap) return
// 	const data = await miko.performance({
// 		beatmap: beatmap,
// 		mods: { speed: 1.5, acronyms: ["FL"] },
// 		accuracy: 99,
// 		count: {
// 			nMiss: 0,
// 			n300: -1,
// 			n100: 0,
// 			n50: 0,
// 			nGeki: 0,
// 			nKatu: 0,
// 		}
// 	})
// 	data
// }
test_ibancho()
