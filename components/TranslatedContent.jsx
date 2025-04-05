import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import useTranslatedData from '../hooks/useTranslatedData';

/**
 * TranslatedContent component for demonstrating dynamic data translation
 * 
 * @param {object} props
 * @param {object|array|string} props.data - The data to be translated
 * @param {array} props.textFields - Array of field keys that should be translated (for objects)
 * @param {boolean} props.deepTranslate - Whether to translate nested objects
 * @param {function} props.renderItem - Custom render function for each item (for arrays)
 */
const TranslatedContent = ({ 
  data, 
  textFields = [], 
  deepTranslate = false,
  renderItem,
  style
}) => {
  const { translatedData, isLoading, error } = useTranslatedData(
    data, 
    textFields, 
    deepTranslate
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.loadingText}>Translating content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Translation error. Showing original content.
        </Text>
      </View>
    );
  }

  // Handle different data types
  if (typeof translatedData === 'string') {
    return <Text style={[styles.text, style]}>{translatedData}</Text>;
  }

  if (Array.isArray(translatedData)) {
    return (
      <View style={styles.listContainer}>
        {translatedData.map((item, index) => {
          if (renderItem) {
            return renderItem(item, index);
          }
          
          if (typeof item === 'string') {
            return (
              <Text key={index} style={styles.listItem}>
                {item}
              </Text>
            );
          }
          
          if (typeof item === 'object' && item !== null) {
            return (
              <View key={index} style={styles.objectItem}>
                {Object.entries(item).map(([key, value]) => (
                  <Text key={key} style={styles.objectProperty}>
                    <Text style={styles.propertyKey}>{key}: </Text>
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </Text>
                ))}
              </View>
            );
          }
          
          return null;
        })}
      </View>
    );
  }

  if (typeof translatedData === 'object' && translatedData !== null) {
    return (
      <View style={[styles.objectContainer, style]}>
        {Object.entries(translatedData).map(([key, value]) => (
          <Text key={key} style={styles.objectProperty}>
            <Text style={styles.propertyKey}>{key}: </Text>
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </Text>
        ))}
      </View>
    );
  }

  // For all other data types
  return <Text style={style}>{JSON.stringify(translatedData)}</Text>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  errorContainer: {
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ff8080',
  },
  errorText: {
    color: '#cc3333',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  listContainer: {
    marginVertical: 8,
  },
  listItem: {
    padding: 8,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  objectContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
  },
  objectItem: {
    padding: 8,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  objectProperty: {
    marginBottom: 4,
    fontSize: 14,
  },
  propertyKey: {
    fontWeight: 'bold',
  },
});

export default TranslatedContent; 