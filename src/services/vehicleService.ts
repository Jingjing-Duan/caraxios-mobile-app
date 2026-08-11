import { Platform } from 'react-native';

console.log(Platform.OS);

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://127.0.0.1:8000/api/v1'
    : 'http://10.0.2.2:8000/api/v1';
    

export type VehicleImageInput = {
  uri: string;
  isPrimary?: boolean;
  fileName?: string;
  mimeType?: string;
};

export async function getVehicles() {
  const response = await fetch(`${API_BASE_URL}/vehicles`);

  if (!response.ok) {
    throw new Error('Failed to load vehicles');
  }

  return response.json();
}

export async function getVehicleById(vehicleId: number) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}`
  );

  if (!response.ok) {
    throw new Error('Failed to load vehicle details');
  }

  return response.json();
}

export async function createVehicle(vehicle: any) {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicle),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || 'Failed to create vehicle'
    );
  }

  return data;
}

export async function decodeVin(vin: string) {
  const response = await fetch(`${API_BASE_URL}/vin/decode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vin }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || 'Failed to decode VIN'
    );
  }

  return data;
}

export async function updateVehicle(
  vehicleId: number,
  vehicle: any
) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicle),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || 'Failed to update vehicle'
    );
  }

  return data;
}

/**
 * Upload one or more vehicle images.
 *
 * Backend request:
 * multipart/form-data
 * - files: one or more image files
 * - primaryIndex: optional zero-based index
 */
  export async function uploadVehicleImages(
    vehicleId: number,
    images: VehicleImageInput[]
  ) {
    if (images.length === 0) {
      return [];
    }

    const formData = new FormData();

    for (let index = 0; index < images.length; index++) {
      const image = images[index];

      const fallbackName =
        image.uri.split('/').pop() ||
        `vehicle-${vehicleId}-${index}.jpg`;

      const fileName =
        image.fileName || fallbackName;

      const extension =
        fileName.split('.').pop()?.toLowerCase();

      let mimeType = image.mimeType;

      if (!mimeType) {
        if (extension === 'png') {
          mimeType = 'image/png';
        } else if (extension === 'webp') {
          mimeType = 'image/webp';
        } else {
          mimeType = 'image/jpeg';
        }
      }

      if (Platform.OS === 'web') {
        const imageResponse = await fetch(image.uri);
        const blob = await imageResponse.blob();

        const file = new File(
          [blob],
          fileName,
          {
            type: mimeType,
          }
        );

        formData.append('files', file);
      } else {
        formData.append(
          'files',
          {
            uri: image.uri,
            name: fileName,
            type: mimeType,
          } as any
        );
      }
    }

    const primaryIndex = images.findIndex(
      image => image.isPrimary
    );

    if (primaryIndex >= 0) {
      formData.append(
        'primaryIndex',
        String(primaryIndex)
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/vehicles/${vehicleId}/images`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Image upload response:',
        data
      );

      throw new Error(
        data?.error?.message ||
        data?.detail?.[0]?.msg ||
        'Failed to upload vehicle images'
      );
    }

    return data;
  }

/**
 * Load all images for one vehicle.
 */
export async function getVehicleImages(
  vehicleId: number
) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}/images`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        'Failed to load vehicle images'
    );
  }

  return data;
}

/**
 * Update one image.
 *
 * Exact supported fields depend on backend schema.
 * Common fields include:
 * - isPrimary
 * - displayOrder
 * - caption
 */
export async function updateVehicleImage(
  vehicleId: number,
  imageId: string | number,
  updates: {
    isPrimary?: boolean;
    displayOrder?: number;
    caption?: string | null;
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}/images/${imageId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        'Failed to update vehicle image'
    );
  }

  return data;
}

/**
 * Delete one vehicle image.
 */
export async function deleteVehicleImage(
  vehicleId: number,
  imageId: string | number
) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}/images/${imageId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.error?.message ||
        'Failed to delete vehicle image'
    );
  }

  return true;
}

/**
 * Reorder images and set the primary image.
 *
 * Backend body:
 * {
 *   orderedImageIds: string[],
 *   primaryImageId: string
 * }
 */
export async function reorderVehicleImages(
  vehicleId: number,
  orderedImageIds: Array<string | number>,
  primaryImageId: string | number
) {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}/images/order`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderedImageIds: orderedImageIds.map(String),
        primaryImageId: String(primaryImageId),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        'Failed to reorder vehicle images'
    );
  }

  return data;
}