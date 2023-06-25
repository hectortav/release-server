import releasesRouter from "./api/releases";
import downloadRouter from "./api/download";

const router: Record<string, (req: Request) => Promise<Response>> = {
	"/": async (req) => Response.json(await releasesRouter.get(req)),
	"/download": async (req) => {
		const { downloadLink } = await downloadRouter.get(req);
		return downloadLink
			? Response.redirect(downloadLink, 301)
			: new Response(null, { status: 404 });
	},
};

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url);
		const pathname = `/${url.pathname.split("/")[1]}`;
		return router[pathname]?.(req) ?? new Response(`404!`);
	},
	error(error: Error) {
		return new Response(`<pre>${error}\n${error.stack}</pre>`, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	},
});

console.log(`Listening on http://localhost:${server.port}...`);
