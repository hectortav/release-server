import releasesRouter from "./api/releases";
import downloadRouter from "./api/download";
import updateRouter from "./api/update";

const router: Record<string, (req: Request) => Promise<Response>> = {
  "/": async (req) => Response.json(await releasesRouter.get(req)),
  "/download": async (req) => {
    const { code: status, body } = await downloadRouter.get(req);
    return Response.json(body, { status });
  },
  "/update": async (req) => {
    const { code: status, body } = await updateRouter.get(req);
    return Response.json(body, { status });
  },
};

const server = Bun.serve({
  port: 1337,
  async fetch(req) {
    const url = new URL(req.url);
    console.log(`[${req.method}]: ${url}`);
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
