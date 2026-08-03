import { View, Text , StyleSheet} from 'react-native';
import { Vehicle } from '../types/vehicle';

type Props = {
    vehicle: Vehicle;
};

export default function VehicleCard({ vehicle }: Props) {
    return (
        <View style={styles.card}>

            <Text style={styles.title}>
                {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>

            <Text style={styles.price}>
                ${vehicle.askPrice.toLocaleString()} CAD
            </Text>

            <Text style={styles.mileage}>
                {vehicle.mileage.toLocaleString()} km
            </Text>
            
            <View
            style={[
                styles.statusBadge,
                vehicle.status === 'available' && styles.statusBadgeAvailable,
            ]}
            >
            <Text
                style={[
                styles.statusText,
                vehicle.status === 'available' && styles.statusTextAvailable,
                ]}
            >
                {vehicle.status
                    ? vehicle.status[0].toUpperCase() + vehicle.status.slice(1)
                    : 'Unknown'}
            </Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    card: {
        borderWidth: 1,
        borderColor: '#ccc',

        borderRadius: 15,

        padding: 20,

        marginVertical: 10,
        marginHorizontal: 20,

        backgroundColor: 'white',
    },

    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 10,
    },

    price: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },

    mileage: {
        fontSize: 18,
        color: 'gray',
        marginBottom: 5,
    },

    status: {
        fontSize: 16,
    },
    statusAvailable: {
        color: 'green',
        fontWeight: '600',
    },

    statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginTop: 6,
    },

    statusBadgeAvailable: {
    backgroundColor: '#E8F5E9',
    },

    statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    },

    statusTextAvailable: {
    color: '#2E7D32',
    },

});