const IMAGE_BASE_URL = 'http://127.0.0.1:8000';

export function getVehicleImageUrl(vehicle: any): string | undefined {
  let rawUrl =
    vehicle.primaryImage?.url ??
    vehicle.primary_image?.url ??
    vehicle.primary_image_url ??
    vehicle.image_url;

  if (!rawUrl && vehicle.images?.length) {
    const primaryImage =
      vehicle.images.find(
        (image: any) =>
          image.isPrimary || image.is_primary
      ) ?? vehicle.images[0];

    rawUrl =
      typeof primaryImage === 'string'
        ? primaryImage
        : primaryImage.url ??
          primaryImage.imageUrl ??
          primaryImage.image_url ??
          primaryImage.uri;
  }

  if (!rawUrl) {
    return undefined;
  }

  if (
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://') ||
    rawUrl.startsWith('blob:')
  ) {
    return rawUrl;
  }

  return normalizeImageUrl(rawUrl);
  
}

export function normalizeImageUrl(
  rawUrl?: string
): string | undefined {
  if (!rawUrl) {
    return undefined;
  }

  if (
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://') ||
    rawUrl.startsWith('blob:')
  ) {
    return rawUrl;
  }

  return `http://127.0.0.1:8000${
    rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  }`;
}