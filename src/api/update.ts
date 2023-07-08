import { ReleasesAsset, fetchAsset, fetchReleases } from "../services/github";
import { getOs, type OS } from "../utils/api";

const _target = null;

const router = {
  get: async (req: Request) => {
    const url = new URL(req.url);
    const platform = url.pathname.split("/")[2];
    const version = url.pathname.split("/")[3];
    let os: OS | null = null;
    if (platform && ["win32", "darwin", "linux"].includes(platform)) {
      os = platform as OS;
    } else {
      os = getOs(req);
    }

    if (!os) {
      return {};
    }
    const releases: ReleasesAsset[] = await fetchReleases();

    const target =
      (_target && releases.find((r) => r.tag_name === _target)) ?? releases[0];

    if (target.tag_name !== version) {
      const found = target.assets.find((asset) => {
        const ext = asset.browser_download_url.split(".").pop();
        return (
          (os === "win32" && (ext === "exe" || ext === "nupkg")) ||
          (os === "darwin" && ext === "dmg") ||
          (os === "linux" && (ext === "deb" || ext === "rpm"))
        );
      });

      if (found) {
        const downloadLink = await fetchAsset(`${found.id}`);
        return {
          code: 200,
          body: {
            name: target.tag_name,
            url: downloadLink,
          },
        };
      }
    }

    return {
      code: 204,
      body: {},
    };
  },
};

export default router;
