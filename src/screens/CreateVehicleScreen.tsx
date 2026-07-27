import React, { useState } from 'react';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  View,
  Image,
  Pressable,
} from 'react-native';



import * as ImagePicker from 'expo-image-picker';
import {
  createVehicle,
  decodeVin,
} from '../services/vehicleService';


export default function CreateVehicleScreen({ navigation }: any) {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [askPrice, setAskPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [decodingVin, setDecodingVin] = useState(false);
  const [vinError, setVinError] = useState('');


  // 图片数组
    type VehicleImage = {
    uri: string;
    isPrimary: boolean;
    };

    const [images, setImages] = useState<VehicleImage[]>([]);

  // 选择多张图片
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
        const selectedImages: VehicleImage[] = result.assets.map((asset, index) => ({
        uri: asset.uri,
        isPrimary: images.length === 0 && index === 0,
        }));

        setImages(prev => [
        ...prev,
        ...selectedImages,
        ]);
    }
  };

    const setPrimaryImage = (index: number) => {
    setImages(prev =>
        prev.map((image, i) => ({
        ...image,
        isPrimary: i === index,
        }))
    );
    };


    const removeImage = (index: number) => {
    setImages(prev => {
        const updated = prev.filter((_, i) => i !== index);

        // 如果删除的是主图，则自动把第一张设为主图
        if (updated.length > 0 && !updated.some(image => image.isPrimary)) {
        updated[0] = {
            ...updated[0],
            isPrimary: true,
        };
        }

        return updated;
    });
    };

    const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!year.trim()) {
        newErrors.year = 'Year is required.';
    } else if (isNaN(Number(year))) {
        newErrors.year = 'Year must be a number.';
    }

    if (!make.trim()) {
        newErrors.make = 'Make is required.';
    }

    if (!model.trim()) {
        newErrors.model = 'Model is required.';
    }

    if (!askPrice.trim()) {
        newErrors.askPrice = 'Ask price is required.';
    } else if (Number(askPrice) <= 0) {
        newErrors.askPrice = 'Ask price must be greater than 0.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
    };
 
const handleDecodeVin = async () => {
  if (!vin.trim()) {
    setVinError('Please enter a VIN.');
    return;
  }

  try {
    setDecodingVin(true);
    setVinError('');

    const result = await decodeVin(vin.trim());

    const decoded = result.decodedVehicle;

    if (decoded) {
      if (decoded.year) {
        setYear(String(decoded.year));
      }

      if (decoded.make) {
        setMake(decoded.make);
      }

      if (decoded.model) {
        setModel(decoded.model);
      }
    }

    console.log('VIN decoded:', result);

  } catch (error: any) {
    setVinError(
      error.message || 'Unable to decode VIN.'
    );
  } finally {
    setDecodingVin(false);
  }
};

const handleSave = async () => {
  if (!validateForm()) {
    return;
  }

  const vehicle = {
    year: Number(year),
    make: make.trim(),
    model: model.trim(),
    askPrice: Number(askPrice),
    mileage: mileage ? Number(mileage) : null,
    vin: vin.trim() || null,
    description: description.trim() || null,
    status: 'available',
  };

  try {
    console.log('Sending vehicle:', vehicle);

    const createdVehicle = await createVehicle(vehicle);

    console.log('Vehicle created:', createdVehicle);

    navigation.replace("Inventory", {
        statusFilter: "all",
    });
    
  } catch (error: any) {
    console.error('Create vehicle failed:', error);

    setErrors({
      general: error.message || 'Failed to create vehicle.',
    });
  }
};

  const renderImageItem = ({
  item,
  drag,
  isActive,
  getIndex,
}: RenderItemParams<VehicleImage>) => {
  
    const index = getIndex();

  if (index === undefined) {
    return null;
  }

  return (
    <Pressable
      onLongPress={drag}
      disabled={isActive}
      style={[
        styles.imageItem,
        isActive && styles.draggingItem,
      ]}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
      />

      <Pressable
        style={styles.radioRow}
        onPress={() => setPrimaryImage(index)}
      >
        <View
          style={[
            styles.radioOuter,
            item.isPrimary && styles.radioOuterSelected,
          ]}
        >
          {item.isPrimary && (
            <View style={styles.radioInner} />
          )}
        </View>

        <Text style={styles.radioLabel}>
          Primary Image
        </Text>
      </Pressable>

      <Text style={styles.dragHint}>
        Hold and drag to reorder
      </Text>

      <Pressable
        onPress={() => removeImage(index)}
        style={styles.removeButton}
      >
        <Text style={styles.removeText}>Remove</Text>
      </Pressable>
    </Pressable>
  );
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Vehicle</Text>

    <View style={styles.vinRow}>
    <TextInput
        style={[styles.input, styles.vinInput]}
        placeholder="VIN"
        value={vin}
        onChangeText={setVin}
        autoCapitalize="characters"
    />

    <Pressable
        style={styles.decodeButton}
        onPress={handleDecodeVin}
        disabled={decodingVin}
    >
        <Text style={styles.decodeButtonText}>
        {decodingVin ? 'Decoding...' : 'Decode VIN'}
        </Text>
    </Pressable>
    </View>

    {vinError ? (
    <Text style={styles.errorText}>
        {vinError}
    </Text>
    ) : null}

<TextInput
  style={[
    styles.input,
    errors.year && styles.inputError,
  ]}
  placeholder="Year"
  value={year}
  onChangeText={setYear}
  keyboardType="numeric"
/>

{errors.year && (
  <Text style={styles.errorText}>{errors.year}</Text>
)}

<TextInput
  style={[
    styles.input,
    errors.make && styles.inputError,
  ]}
  placeholder="Make"
  value={make}
  onChangeText={setMake}
/>

{errors.make && (
  <Text style={styles.errorText}>{errors.make}</Text>
)}
<TextInput
  style={[
    styles.input,
    errors.model ? styles.inputError : null,
  ]}
  placeholder="Model"
  value={model}
  onChangeText={setModel}
/>

{errors.model && (
  <Text style={styles.errorText}>
    {errors.model}
  </Text>
)}

<TextInput
  style={[
    styles.input,
    errors.askPrice ? styles.inputError : null,
  ]}
  placeholder="Ask Price"
  value={askPrice}
  onChangeText={setAskPrice}
  keyboardType="numeric"
/>

{errors.askPrice && (
  <Text style={styles.errorText}>
    {errors.askPrice}
  </Text>
)}

      <TextInput
        style={styles.input}
        placeholder="Mileage"
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.sectionTitle}>
        Vehicle Images
      </Text>

      <Pressable
        style={styles.imageButton}
        onPress={pickImages}
      >
        <Text style={styles.imageButtonText}>
          Select Images
        </Text>
      </Pressable>

      <DraggableFlatList
        data={images}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        renderItem={renderImageItem}
        onDragEnd={({ data }) => setImages(data)}
        horizontal
        contentContainerStyle={styles.imageContainer}
        />

        {errors.general && (
        <Text style={styles.errorText}>
            {errors.general}
        </Text>
        )}

      <Button
        title="Save Vehicle"
        onPress={handleSave}
      />
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

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },

  imageButton: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  imageButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },

imageContainer: {
  paddingVertical: 10,
  gap: 12,
},

image: {
  width: '100%',
  height: 110,
  borderRadius: 8,
},
imageItem: {
  width: 150,
  marginRight: 12,
  padding: 8,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 12,
  backgroundColor: '#fff',
},

draggingItem: {
  opacity: 0.7,
},
radioRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},

radioOuter: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#777',
  justifyContent: 'center',
  alignItems: 'center',
},

radioOuterSelected: {
  borderColor: '#333',
},

radioInner: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#333',
},

radioLabel: {
  marginLeft: 8,
  fontSize: 14,
},

dragHint: {
  marginTop: 8,
  fontSize: 12,
  color: '#777',
},
    primaryLabel: {
    marginTop: 6,
    fontWeight: 'bold',
    textAlign: 'center',
    },

    smallButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
    alignItems: 'center',
    },

    orderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    },

    removeButton: {
    marginTop: 6,
    padding: 6,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    },

    removeText: {
    fontWeight: '600',
    },
    inputError: {
  borderColor: 'red',
},

errorText: {
  color: 'red',
  fontSize: 13,
  marginTop: -8,
  marginBottom: 10,
},

vinRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 10,
},

vinInput: {
  flex: 1,
},

decodeButton: {
  paddingHorizontal: 14,
  paddingVertical: 13,
  borderRadius: 10,
  backgroundColor: '#333',
},

decodeButtonText: {
  color: '#fff',
  fontWeight: '600',
},

});

