const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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