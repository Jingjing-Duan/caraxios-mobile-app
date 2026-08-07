import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';

import {
  createVehicle,
  decodeVin,
  uploadVehicleImages,
} from '../services/vehicleService';

type VehicleImage = {
  uri: string;
  isPrimary: boolean;
  fileName?: string;
  mimeType?: string;
};

type FormErrors = Record<string, string>;

const COLORS = {
  background: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceLow: '#F2F3FE',
  primary: '#0040A1',
  primaryContainer: '#0056D2',
  primarySoft: '#DAE2FF',
  secondaryContainer: '#D3E4FE',
  text: '#191B23',
  textMuted: '#424654',
  outline: '#737785',
  border: '#C3C6D6',
  error: '#BA1A1A',
  errorSoft: '#FFDAD6',
  success: '#18794E',
};

export default function CreateVehicleScreen({
  navigation,
  route,
}: any) {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [engine, setEngine] = useState('');

  const [askPrice, setAskPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');

  const [exteriorColor, setExteriorColor] =
    useState('');
  const [interiorColor, setInteriorColor] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [images, setImages] = useState<
    VehicleImage[]
  >([]);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [vinError, setVinError] = useState('');
  const [decodingVin, setDecodingVin] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [vinDecoded, setVinDecoded] =
    useState(false);

const aiDraft = route.params?.aiDraft;

useEffect(() => {
  if (!aiDraft) {
    return;
  }

  setYear(
    aiDraft.year != null
      ? String(aiDraft.year)
      : ''
  );

  setMake(aiDraft.make ?? '');

  setModel(aiDraft.model ?? '');

  setTrim(aiDraft.trim ?? '');

  setBodyType(
    aiDraft.bodyType ??
    aiDraft.body_type ??
    ''
  );

  setEngine(
    aiDraft.engineInfo ??
    aiDraft.engine_info ??
    ''
  );

  setAskPrice(
    aiDraft.askPrice != null
      ? String(aiDraft.askPrice)
      : aiDraft.ask_price != null
        ? String(aiDraft.ask_price)
        : ''
  );

  setMileage(
    aiDraft.mileage != null
      ? String(aiDraft.mileage)
      : ''
  );

  setVin(aiDraft.vin ?? '');

  setExteriorColor(
    aiDraft.color ?? ''
  );

  setInteriorColor(
    aiDraft.interiorColor ??
    aiDraft.interior_color ??
    ''
  );

  setDescription(
    aiDraft.description ?? ''
  );
}, [aiDraft]);

  const pickImages = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrors(current => ({
        ...current,
        images:
          'Photo library permission is required.',
      }));

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

    if (result.canceled) {
      return;
    }

    const selectedImages: VehicleImage[] =
      result.assets.map((asset, index) => ({
        uri: asset.uri,

        fileName:
          asset.fileName ??
          `vehicle-image-${Date.now()}-${index}.jpg`,

        mimeType:
          asset.mimeType ?? 'image/jpeg',

        isPrimary:
          images.length === 0 && index === 0,
      }));

    setImages(current => [
      ...current,
      ...selectedImages,
    ]);

    setErrors(current => ({
      ...current,
      images: '',
    }));
  };

  const setPrimaryImage = (index: number) => {
    setImages(current =>
      current.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages(current => {
      const updatedImages = current.filter(
        (_, imageIndex) => imageIndex !== index
      );

      const hasPrimaryImage =
        updatedImages.some(
          image => image.isPrimary
        );

      if (
        updatedImages.length > 0 &&
        !hasPrimaryImage
      ) {
        updatedImages[0] = {
          ...updatedImages[0],
          isPrimary: true,
        };
      }

      return updatedImages;
    });
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const numericYear = Number(year);
    const currentYear =
      new Date().getFullYear();

    if (!year.trim()) {
      newErrors.year = 'Year is required.';
    } else if (!Number.isInteger(numericYear)) {
      newErrors.year =
        'Year must be a whole number.';
    } else if (
      numericYear < 1886 ||
      numericYear > currentYear + 1
    ) {
      newErrors.year =
        'Enter a valid vehicle year.';
    }

    if (!make.trim()) {
      newErrors.make = 'Make is required.';
    }

    if (!model.trim()) {
      newErrors.model = 'Model is required.';
    }

    const numericPrice = Number(askPrice);

    if (!askPrice.trim()) {
      newErrors.askPrice =
        'Listing price is required.';
    } else if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      newErrors.askPrice =
        'Listing price must be greater than 0.';
    }

    if (
      mileage.trim() &&
      (!Number.isFinite(Number(mileage)) ||
        Number(mileage) < 0)
    ) {
      newErrors.mileage =
        'Mileage cannot be negative.';
    }

    if (
      vin.trim() &&
      vin.trim().length !== 17
    ) {
      newErrors.vin =
        'VIN should contain 17 characters.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleDecodeVin = async () => {
    const cleanedVin = vin
      .trim()
      .toUpperCase();

    if (!cleanedVin) {
      setVinError('Please enter a VIN.');
      return;
    }

    if (cleanedVin.length !== 17) {
      setVinError(
        'VIN should contain 17 characters.'
      );
      return;
    }

    try {
      setDecodingVin(true);
      setVinError('');
      setVinDecoded(false);

      const result =
        await decodeVin(cleanedVin);

      const decoded =
        result.decodedVehicle ??
        result.decoded_vehicle ??
        result.vehicle ??
        result;

      if (decoded.year) {
        setYear(String(decoded.year));
      }

      if (decoded.make) {
        setMake(String(decoded.make));
      }

      if (decoded.model) {
        setModel(String(decoded.model));
      }

      if (decoded.trim) {
        setTrim(String(decoded.trim));
      }

      if (
        decoded.bodyType ??
        decoded.body_type
      ) {
        setBodyType(
          String(
            decoded.bodyType ??
              decoded.body_type
          )
        );
      }

      if (decoded.engine) {
        setEngine(String(decoded.engine));
      }

      setVin(cleanedVin);
      setVinDecoded(true);

      console.log('VIN decoded:', result);
    } catch (error: any) {
      setVinError(
        error.message ||
          'Unable to decode VIN.'
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

      mileage: mileage.trim()
        ? Number(mileage)
        : null,

      vin: vin.trim()
        ? vin.trim().toUpperCase()
        : null,

      description:
        description.trim() || null,

      status: 'available',

      trim: trim.trim() || null,
      bodyType: bodyType.trim() || null,
      engine: engine.trim() || null,
      color: exteriorColor.trim() || null,
      interiorColor:
        interiorColor.trim() || null,
    };

    try {
      setSaving(true);

      setErrors(current => ({
        ...current,
        general: '',
      }));

      console.log(
        'Creating vehicle:',
        vehicle
      );

      // Step 1: Create the vehicle first
      const createdVehicle =
        await createVehicle(vehicle);

      console.log(
        'Vehicle created:',
        createdVehicle
      );

      // Support different possible backend response shapes
      const createdVehicleData =
        createdVehicle.item ??
        createdVehicle.vehicle ??
        createdVehicle;

      const createdVehicleId =
        createdVehicleData.id ??
        createdVehicleData.vehicleId ??
        createdVehicleData.vehicle_id;

      if (!createdVehicleId) {
        throw new Error(
          'Vehicle was created, but the returned vehicle ID is missing.'
        );
      }

      // Step 2: Upload selected images
      if (images.length > 0) {
        console.log(
          'Uploading vehicle images:',
          images
        );

        await uploadVehicleImages(
          Number(createdVehicleId),
          images
        );

        console.log(
          'Vehicle images uploaded successfully'
        );
      }

      // Step 3: Open All Inventory
      navigation.navigate('MainTabs', {
        screen: 'Inventory',
        params: {
          statusFilter: 'all',
        },
      });
    } catch (error: any) {
      console.error(
        'Create vehicle failed:',
        error
      );

      setErrors(current => ({
        ...current,
        general:
          error.message ||
          'Failed to create vehicle.',
      }));
    } finally {
      setSaving(false);
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
          styles.imageCard,
          item.isPrimary &&
            styles.primaryImageCard,
          isActive &&
            styles.draggingImageCard,
        ]}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.vehicleImage}
          resizeMode="cover"
        />

        {item.isPrimary ? (
          <View style={styles.primaryBadge}>
            <Ionicons
              name="star"
              size={13}
              color="#FFFFFF"
            />

            <Text
              style={styles.primaryBadgeText}
            >
              Primary
            </Text>
          </View>
        ) : null}

        <Pressable
          style={styles.removeImageButton}
          onPress={() =>
            removeImage(index)
          }
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={COLORS.error}
          />
        </Pressable>

        <View style={styles.imageCardFooter}>
          <Pressable
            style={styles.primarySelector}
            onPress={() =>
              setPrimaryImage(index)
            }
          >
            <View
              style={[
                styles.radioOuter,
                item.isPrimary &&
                  styles.radioOuterSelected,
              ]}
            >
              {item.isPrimary ? (
                <View
                  style={styles.radioInner}
                />
              ) : null}
            </View>

            <Text
              style={styles.primarySelectorText}
            >
              Primary
            </Text>
          </Pressable>

          <View style={styles.dragIndicator}>
            <Ionicons
              name="reorder-three-outline"
              size={20}
              color={COLORS.outline}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() =>
                navigation.goBack()
              }
            >
              <Ionicons
                name="close"
                size={25}
                color={COLORS.textMuted}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              New Vehicle
            </Text>
          </View>

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressTitle}>
              Vehicle Entry
            </Text>

            <Text style={styles.progressValue}>
              New Inventory
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={styles.progressFill}
            />
          </View>
        </View>

        <View style={styles.vinSection}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="finger-print-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.sectionTitle}>
              VIN Identification
            </Text>
          </View>

          <View style={styles.vinRow}>
            <TextInput
              style={[
                styles.input,
                styles.vinInput,
                vinError &&
                  styles.inputError,
              ]}
              placeholder="Enter 17-digit VIN"
              placeholderTextColor="#9296A1"
              value={vin}
              onChangeText={value => {
                setVin(
                  value
                    .toUpperCase()
                    .replace(/\s/g, '')
                );
                setVinError('');
                setVinDecoded(false);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={17}
            />

            <Pressable
              style={({ pressed }) => [
                styles.decodeButton,
                vinDecoded &&
                  styles.decodedButton,
                pressed && styles.pressed,
              ]}
              onPress={handleDecodeVin}
              disabled={decodingVin}
            >
              {decodingVin ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name={
                    vinDecoded
                      ? 'checkmark-circle-outline'
                      : 'sparkles-outline'
                  }
                  size={19}
                  color="#FFFFFF"
                />
              )}

              <Text
                style={
                  styles.decodeButtonText
                }
              >
                {decodingVin
                  ? 'Decoding'
                  : vinDecoded
                  ? 'Decoded'
                  : 'Decode'}
              </Text>
            </Pressable>
          </View>

          {vinError ? (
            <Text style={styles.errorText}>
              {vinError}
            </Text>
          ) : null}

          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={COLORS.textMuted}
            />

            <Text style={styles.infoText}>
              Decoding automatically fills
              available vehicle specifications.
            </Text>
          </View>
        </View>

        <FormSection
          title="Vehicle Specifications"
          icon="car-sport-outline"
        >
          <View style={styles.twoColumnRow}>
            <FormField
              label="Year"
              value={year}
              onChangeText={setYear}
              placeholder="2024"
              keyboardType="numeric"
              error={errors.year}
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Make"
              value={make}
              onChangeText={setMake}
              placeholder="Toyota"
              error={errors.make}
              containerStyle={
                styles.halfField
              }
            />
          </View>

          <View style={styles.twoColumnRow}>
            <FormField
              label="Model"
              value={model}
              onChangeText={setModel}
              placeholder="RAV4"
              error={errors.model}
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Trim"
              value={trim}
              onChangeText={setTrim}
              placeholder="XLE"
              containerStyle={
                styles.halfField
              }
            />
          </View>

          <View style={styles.twoColumnRow}>
            <FormField
              label="Body Type"
              value={bodyType}
              onChangeText={setBodyType}
              placeholder="SUV"
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Engine"
              value={engine}
              onChangeText={setEngine}
              placeholder="2.5L I4"
              containerStyle={
                styles.halfField
              }
            />
          </View>
        </FormSection>

        <FormSection
          title="Vehicle Media"
          icon="images-outline"
          rightAction={
            <Pressable
              style={styles.sectionAction}
              onPress={pickImages}
            >
              <Ionicons
                name="camera-outline"
                size={19}
                color={COLORS.primary}
              />

              <Text
                style={styles.sectionActionText}
              >
                Add Photos
              </Text>
            </Pressable>
          }
        >
          {images.length > 0 ? (
            <>
              <DraggableFlatList
                data={images}
                horizontal
                keyExtractor={(
                  item,
                  index
                ) =>
                  `${item.uri}-${index}`
                }
                renderItem={
                  renderImageItem
                }
                onDragEnd={({ data }) =>
                  setImages(data)
                }
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.imageListContent
                }
              />

              <Text
                style={styles.imageHelpText}
              >
                Long press and drag to reorder.
                On mobile, images can be moved
                horizontally using touch.
              </Text>
            </>
          ) : (
            <Pressable
              style={styles.uploadPlaceholder}
              onPress={pickImages}
            >
              <View style={styles.uploadIcon}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={31}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.uploadTitle}>
                Add vehicle photos
              </Text>

              <Text
                style={styles.uploadDescription}
              >
                Select multiple images and choose
                one as the primary image.
              </Text>
            </Pressable>
          )}

          {errors.images ? (
            <Text style={styles.errorText}>
              {errors.images}
            </Text>
          ) : null}
        </FormSection>

        <FormSection
          title="Pricing & Condition"
          icon="cash-outline"
        >
          <View style={styles.twoColumnRow}>
            <FormField
              label="Listing Price (CAD)"
              value={askPrice}
              onChangeText={setAskPrice}
              placeholder="0"
              keyboardType="numeric"
              error={errors.askPrice}
              containerStyle={
                styles.halfField
              }
              leadingText="$"
            />

            <FormField
              label="Mileage (km)"
              value={mileage}
              onChangeText={setMileage}
              placeholder="0"
              keyboardType="numeric"
              error={errors.mileage}
              containerStyle={
                styles.halfField
              }
            />
          </View>
        </FormSection>

        <FormSection
          title="Visual Details"
          icon="color-palette-outline"
        >
          <View style={styles.twoColumnRow}>
            <FormField
              label="Exterior Color"
              value={exteriorColor}
              onChangeText={
                setExteriorColor
              }
              placeholder="Deep Blue"
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Interior Color"
              value={interiorColor}
              onChangeText={
                setInteriorColor
              }
              placeholder="Black"
              containerStyle={
                styles.halfField
              }
            />
          </View>
        </FormSection>

        <FormSection
          title="Description"
          icon="document-text-outline"
        >
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
            placeholder="Add condition, features, history, or other details..."
            placeholderTextColor="#9296A1"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </FormSection>

        {errors.general ? (
          <View style={styles.generalError}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.error}
            />

            <Text
              style={styles.generalErrorText}
            >
              {errors.general}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
            saving &&
              styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="save-outline"
              size={22}
              color="#FFFFFF"
            />
          )}

          <Text style={styles.saveButtonText}>
            {saving
              ? 'Saving Vehicle...'
              : 'Save Vehicle'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type FormSectionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
};

function FormSection({
  title,
  icon,
  children,
  rightAction,
}: FormSectionProps) {
  return (
    <View style={styles.formSection}>
      <View style={styles.formSectionHeader}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name={icon}
              size={21}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.sectionTitle}>
            {title}
          </Text>
        </View>

        {rightAction}
      </View>

      {children}
    </View>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  containerStyle?: object;
  leadingText?: string;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  containerStyle,
  leadingText,
}: FormFieldProps) {
  return (
    <View
      style={[
        styles.fieldContainer,
        containerStyle,
      ]}
    >
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
      >
        {leadingText ? (
          <Text style={styles.leadingText}>
            {leadingText}
          </Text>
        ) : null}

        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9296A1"
          keyboardType={keyboardType}
        />
      </View>

      {error ? (
        <Text style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  header: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAF2',
    backgroundColor: COLORS.surface,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  cancelText: {
    padding: 10,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  progressTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },

  progressValue: {
    fontSize: 12,
    color: COLORS.outline,
  },

  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#E4E5EE',
  },

  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  vinSection: {
    marginHorizontal: 20,
    marginTop: 26,
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLow,
  },

  formSection: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 2,
  },

  formSectionHeader: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 6,
  },

  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  vinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 17,
  },

  vinInput: {
    flex: 1,
    marginBottom: 0,
  },

  input: {
    minHeight: 52,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D7D9E3',
    borderRadius: 15,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },

  decodeButton: {
    minWidth: 108,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: COLORS.primaryContainer,
  },

  decodedButton: {
    backgroundColor: COLORS.success,
  },

  decodeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 11,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },

  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  fieldContainer: {
    marginBottom: 15,
  },

  fieldLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  inputContainer: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7D9E3',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },

  fieldInput: {
    flex: 1,
    minHeight: 49,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
  },

  leadingText: {
    paddingLeft: 14,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  inputError: {
    borderColor: COLORS.error,
  },

  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.error,
  },

  fieldError: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.error,
  },

  uploadPlaceholder: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLow,
  },

  uploadIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: COLORS.primarySoft,
  },

  uploadTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  uploadDescription: {
    marginTop: 6,
    maxWidth: 280,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },

  imageListContent: {
    paddingVertical: 5,
    paddingRight: 12,
  },

  imageCard: {
    width: 180,
    marginRight: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7D9E3',
    borderRadius: 17,
    backgroundColor: COLORS.surface,
  },

  primaryImageCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  draggingImageCard: {
    opacity: 0.72,
    transform: [{ scale: 1.02 }],
  },

  vehicleImage: {
    width: '100%',
    height: 116,
    backgroundColor: COLORS.surfaceLow,
  },

  primaryBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.primaryContainer,
  },

  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  imageCardFooter: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  primarySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  primarySelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  radioOuter: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderRadius: 10,
  },

  radioOuterSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  dragIndicator: {
    padding: 4,
  },

  imageHelpText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },

  descriptionInput: {
    minHeight: 120,
    paddingTop: 14,
  },

  generalError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: COLORS.errorSoft,
  },

  generalErrorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#93000A',
  },

  bottomBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E9F0',
    backgroundColor: 'rgba(255,255,255,0.97)',
  },

  saveButton: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 6,
  },

  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
});