import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, TextInput, StyleSheet, ScrollView, Text} from 'react-native';
import VehicleCard from '../components/VehicleCard';
import { getVehicles } from '../services/vehicleService';

export default function InventoryListScreen({ navigation, route }: any) {
    const [searchText, setSearchText] = useState('');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const loadVehicles = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getVehicles();

            console.log('Vehicles from backend:', data);

            setVehicles(data.items ?? data);

        } catch (err) {
            console.error('Failed to load vehicles:', err);
            setError('Failed to load vehicles.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadVehicles();
        }, [])
    );

    const statusFilter = route.params?.statusFilter ?? 'all';

    useEffect(() => {
    let title = 'All Inventory';

    if (statusFilter === 'available') {
        title = 'Available Vehicles';
    } else if (statusFilter === 'sold') {
        title = 'Sold Vehicles';
    }

    navigation.setOptions({
        title: title,
    });

}, [navigation, statusFilter]);

    const filteredVehicles = vehicles.filter(vehicle => {
        const keyword = searchText.toLowerCase();

        const matchesSearch =
            vehicle.make?.toLowerCase().includes(keyword) ||
            vehicle.model?.toLowerCase().includes(keyword) ||
            String(vehicle.year).includes(keyword);

        const matchesStatus =
            statusFilter === 'all' ||
            vehicle.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <Text>Loading vehicles...</Text>;
    }

    if (error) {
        return <Text>{error}</Text>;
    }

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
                    onPress={() =>
                        navigation.navigate('VehicleDetail', {
                            vehicleId: vehicle.id,
                        })
                        }
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
    title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 4,
    },
});