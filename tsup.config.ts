import { defineConfig } from "tsup";
import "dotenv/config";

export default defineConfig(({ watch = false }) => ({
	clean: true,
	target: "es2022",
	dts: true,
	sourcemap: true,
	entry: {
		index: "src/index.ts",
		//test: "test/index.ts"
	},
	external: [],
	format: ["cjs", "esm"],
	env: {
		OSU_API_KEY: process.env.OSU_API_KEY!
	},
  watch,
}));