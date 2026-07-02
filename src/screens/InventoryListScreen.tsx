import React, { useState } from 'react';
import { Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import VehicleCard from '../components/VehicleCard';
import { vehicles } from '../mocks/vehicles';

export default function InventoryListScreen({ navigation }: any) {
    const [searchText, setSearchText] = useState('');

    const filteredVehicles = vehicles.filter(vehicle => {
        const keyword = searchText.toLowerCase();

        return (
            vehicle.make.toLowerCase().includes(keyword) ||
            vehicle.model.toLowerCase().includes(keyword) ||
            String(vehicle.year).includes(keyword)
        );
    });

    return (
        <ScrollView style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by make, model, or year"
                value={searchText}
                onChangeText={setSearchText}
            />

            {filteredVehicles.map(vehicle => (
                <Pressable
                    key={vehicle.id}
                    onPress={() => navigation.navigate('VehicleDetail')}
                >
                    <VehicleCard vehicle={vehicle} />
                </Pressable>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        margin: 16,
        fontSize: 16,
    },
});