import { miko } from "../src";

const test = async() => {
	const data = await miko.request({ uid: 177955 })
	if (data.error) return

	const user = await miko.user({ response: data })
	const recent = await miko.scores({ response: data, type: "recent" })
	const top = await miko.scores({ response: data, type: "top" })
	
	console.log(user)
	console.log(recent?.length ? recent[0] : recent)
	console.log(top?.length ? top[0] : recent)
}

test()
