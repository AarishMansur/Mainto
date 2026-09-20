import { defineLive } from "next-sanity/live";
import { client } from './client'

const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token || '',
  browserToken: token || '',
})
