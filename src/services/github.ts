import axios, { AxiosResponse } from "axios";
import { Asset, type Release } from "../types/github";

const token = Bun.env.GH_TOKEN;
const repository = Bun.env.GH_REPO;
let lastCall: Date | null = null;
const ttl = 10; // minutes
let lastResult: ReleasesAsset[] = [];

const timeDiff = (date: Date) =>
  Math.floor(Math.abs(new Date().getTime() - date.getTime()) / (1000 * 60));

export type ReleasesAsset = {
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

export const fetchReleases = async (): Promise<any[]> => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (lastCall !== null && timeDiff(lastCall) > ttl) {
    lastCall = null;
  }

  try {
    if (lastCall) {
      console.log("~~~ cache hit ~~~");
      return lastResult;
    }

    const response: AxiosResponse<Release[]> = await axios.get(
      `https://api.github.com/repos/${repository}/releases`,
      { headers },
    );
    const releasesAssets: ReleasesAsset[] = [];
    response.data.forEach((release) => {
      if (release.assets?.length > 0) {
        const { tag_name, name, draft, prerelease, created_at, published_at } =
          release;

        const assets = release.assets.map((asset) => ({
          id: asset.id,
          name: asset.name,
          content_type: asset.content_type,
          state: asset.state,
          size: asset.size,
          download_count: asset.download_count,
          created_at: asset.created_at,
          updated_at: asset.updated_at,
          browser_download_url: asset.browser_download_url,
        }));

        releasesAssets.push({
          tag_name,
          assets,
        });
      }
    });
    lastResult = releasesAssets;
    lastCall = new Date();
    return releasesAssets;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchAsset = async (assetId: string): Promise<any> => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/octet-stream",
  };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/releases/assets/${assetId}`,
      { headers, redirect: "manual" },
    );
    if (response.status === 302) {
      return response.headers.get("location");
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return {};
  }
};
