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


export default function CreateVehicleScreen() {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [askPrice, setAskPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [description, setDescription] = useState('');

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





  const handleSave = () => {
    const vehicle = {
    year: Number(year),
    make,
    model,
    askPrice: Number(askPrice),
    mileage: Number(mileage),
    vin,
    description,
    status: 'available',
    images,
    };

    console.log('Vehicle to save:', vehicle);
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

      <TextInput
        style={styles.input}
        placeholder="VIN"
        value={vin}
        onChangeText={setVin}
      />

      <TextInput
        style={styles.input}
        placeholder="Year"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Make"
        value={make}
        onChangeText={setMake}
      />

      <TextInput
        style={styles.input}
        placeholder="Model"
        value={model}
        onChangeText={setModel}
      />

      <TextInput
        style={styles.input}
        placeholder="Ask Price"
        value={askPrice}
        onChangeText={setAskPrice}
        keyboardType="numeric"
      />

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
});