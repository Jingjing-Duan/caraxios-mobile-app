import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { vehicles } from '../mocks/vehicles';

export default function DashboardScreen({ navigation }: any) {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const soldVehicles = vehicles.filter(v => v.status === 'Sold').length;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>CarAxios Dashboard</Text>

            <View style={styles.statsContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardNumber}>{totalVehicles}</Text>
                    <Text style={styles.cardLabel}>Total Inventory</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>{availableVehicles}</Text>
                    <Text style={styles.cardLabel}>Available</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>{soldVehicles}</Text>
                    <Text style={styles.cardLabel}>Sold</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.buttonWrapper}>
                    <Button
                        title="View Inventory"
                        onPress={() => navigation.navigate('Inventory')}
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <Button
                        title="Add Vehicle"
                        onPress={() => navigation.navigate('CreateVehicle')}
                    />
                </View>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    statsContainer: {
        gap: 12,
        marginBottom: 30,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 14,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    cardNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    cardLabel: {
        fontSize: 16,
        color: '#666',
    },
    actions: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
    },
    buttonWrapper: {
        marginBottom: 14,
    },
});