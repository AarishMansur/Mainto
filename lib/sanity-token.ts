export function sanityWriteToken(): string | undefined {
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  return token || undefined;
}

export function sanityReadToken(): string | undefined {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  return token || undefined;
}
