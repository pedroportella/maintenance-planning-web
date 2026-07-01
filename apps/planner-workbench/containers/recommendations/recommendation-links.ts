export function packageRecommendationHref(
  packageId: string,
  params: Record<string, string> = {}
) {
  const path = `/recommendations/${encodeURIComponent(packageId)}`;
  const query = new URLSearchParams(params).toString();

  return query ? `${path}?${query}` : path;
}

export function recommendationsHref(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();

  return query ? `/recommendations?${query}` : "/recommendations";
}
