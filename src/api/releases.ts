import { fetchReleases } from "../services/github";
import { Asset, Release } from "../types/github";

type ReleasesAsset = {
	tag_name: Release["tag_name"];
	assets: Array<
		Pick<
			Asset,
			| "id"
			| "name"
			| "content_type"
			| "state"
			| "size"
			| "download_count"
			| "created_at"
			| "updated_at"
			| "browser_download_url"
		>
	>;
};
const router = {
	get: async (req: Request) => {
		const releases: ReleasesAsset[] = await fetchReleases();

		return {
			releases: releases.map((ra) => {
				const platforms: Set<string> = new Set();

				ra.assets.forEach((asset) => {
					const ext = asset.browser_download_url.split(".").pop();
					if (ext === "exe" || ext === "nupkg" || ext === "zip") {
						platforms.add("win32");
					}
					if (ext === "dmg" || ext === "zip") {
						platforms.add("darwin");
					}
					if (ext === "deb" || ext === "rpm" || ext === "zip") {
						platforms.add("linux");
					}
				});
				return { [ra.tag_name]: [...platforms] };
			}),
		};
	},
};

export default router;
