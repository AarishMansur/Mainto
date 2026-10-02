import { defineLive } from "next-sanity/live";
import { client } from "./client";

const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || "";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: readToken,
  browserToken: readToken,
});
