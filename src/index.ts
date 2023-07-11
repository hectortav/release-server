import releasesRouter from "./api/releases";
import downloadRouter from "./api/download";
import updateRouter from "./api/update";
import S3 from "./services/s3";

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
  "/upload": async (req) => {
    if (!req.body) {
      return new Response(null, { status: 400 });
    }
    const cd = req.headers.get("content-disposition");
    if (!cd) {
      return new Response(null, { status: 400 });
    }
    const cdFileName = cd.split(";")[1];
    if (!cdFileName) {
      return new Response(null, { status: 400 });
    }
    const fileName = cdFileName.split("=")[1];
    if (!fileName) {
      return new Response(null, { status: 400 });
    }
    // await Bun.write("/var/tmp/", await Bun.readableStreamToBlob(req.body));
    S3.upload({ key: fileName, body: req.body });
    return new Response(null, { status: 201 });
  },
  "/list-files": async (req) => {
    const body = S3.list({});
    return Response.json(body, { status: 200 });
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
