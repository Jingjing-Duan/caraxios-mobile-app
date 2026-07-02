import React from 'react';
import VehicleCard from '../components/VehicleCard';
import { Pressable } from 'react-native';

export default function InventoryListScreen({ navigation }: any) {

    const vehicles = [
        {
            id: 1,
            year: 2021,
            make: 'Audi',
            model: 'Q5',
            askPrice: 38000,
            mileage: 80000
        },
        {
            id: 2,
            year: 2020,
            make: 'Toyota',
            model: 'RAV4',
            askPrice: 32000,
            mileage: 60000
        }
    ];

    return (
        <>
            {vehicles.map(vehicle => (
                <Pressable
                    key={vehicle.id}
                    onPress={() => navigation.navigate('VehicleDetail')}
                >
                    <VehicleCard vehicle={vehicle} />
                </Pressable>
            ))}
        </>
    );
}