import React from 'react';
import { Text } from 'react-native';

/**
 * Simple text component that replaces the previous TranslatedText component
 * without any translation logic
 */
const AppText = ({ text, children, className, style, ...props }) => {
  return (
    <Text className={className} style={style} {...props}>
      {text || children}
    </Text>
  );
};

export default AppText; 