import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { vehicles } from '../mocks/vehicles';

export default function VehicleDetailScreen() {
    const vehicle = vehicles[0];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>Vehicle Image</Text>
            </View>

            <Text style={styles.title}>
                {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>

            <Text style={styles.price}>
                ${vehicle.askPrice.toLocaleString()} CAD
            </Text>

            <View style={styles.section}>
                <Text style={styles.label}>Mileage</Text>
                <Text style={styles.value}>{vehicle.mileage.toLocaleString()} km</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{vehicle.status}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>VIN</Text>
                <Text style={styles.value}>WA1ANAFY1M2000000</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.description}>
                    Well-maintained vehicle with clean interior, smooth driving experience, and great features.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    imagePlaceholder: {
        height: 220,
        borderRadius: 16,
        backgroundColor: '#e5e5e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageText: {
        fontSize: 18,
        color: '#666',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
    },
    section: {
        marginBottom: 18,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
    },
    description: {
        fontSize: 17,
        lineHeight: 24,
    },
});