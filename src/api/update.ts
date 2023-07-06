import { ReleasesAsset, fetchAsset, fetchReleases } from "../services/github";
import { getOs, type OS } from "../utils/api";

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

    for (let i = 0; i < releases.length; i++) {
      const ra = releases[i];
      if (version && version !== ra.tag_name) {
        continue;
      }
      const found = ra.assets.find((asset) => {
        const ext = asset.browser_download_url.split(".").pop();
        return (
          (os === "win32" && (ext === "exe" || ext === "nupkg")) ||
          (os === "darwin" && ext === "dmg") ||
          (os === "linux" && (ext === "deb" || ext === "rpm"))
        );
      });
      if (found) {
        const downloadLink = await fetchAsset(`${found.id}`);
        return { downloadLink };
      }
    }
    return {};
  },
};

export default router;
