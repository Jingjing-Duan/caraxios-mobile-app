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

            <Text style={styles.status}>
                Available
            </Text>

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
        color: 'green',
    },
});