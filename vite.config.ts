import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5174,
		strictPort: true,
		host: "localhost",
	},
	define: {
		global: "globalThis",
	},
	optimizeDeps: {
		include: [
			"@perawallet/connect",
			"@blockshake/defly-connect",
			"@txnlab/use-wallet-svelte",
		],
	},
	resolve: {
		alias: {
			buffer: "buffer",
		},
	},
});
