export interface Vehicle {
    id: number;
    year: number;
    make: string;
    model: string;
    askPrice: number;
    mileage: number;
    status?: string;
    vin?: string;
    description?: string;
}