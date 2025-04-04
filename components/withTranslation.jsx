import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import useAppTranslation from '../utils/useAppTranslation';

/**
 * Higher-order component that provides translation capabilities to any component
 * 
 * @param {React.ComponentType} Component - The component to wrap
 * @returns {React.ComponentType} - The wrapped component with translation capabilities
 */
const withTranslation = (WrappedComponent) => {
  // Use function name to help with debugging
  const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  // Create the wrapped component
  const WithTranslation = (props) => {
    const { currentLanguage, isInitialized } = useLanguage();
    const { translate } = useAppTranslation();
    const [loading, setLoading] = useState(true);
    const [preTranslatedProps, setPreTranslatedProps] = useState({});
    
    // Pre-translate static props when language changes or component mounts
    useEffect(() => {
      if (!isInitialized) return;
      
      setLoading(true);
      
      // Find all string props that might need translation
      const propsToTranslate = {};
      
      // Create a simple translation for static props
      const translateProps = async () => {
        try {
          for (const key in props) {
            if (
              typeof props[key] === 'string' && 
              !key.startsWith('on') && 
              key !== 'style' && 
              key !== 'className'
            ) {
              propsToTranslate[key] = await translate(props[key]);
            }
          }
          
          setPreTranslatedProps(propsToTranslate);
          setLoading(false);
        } catch (error) {
          console.error(`Error pre-translating props for ${componentName}:`, error);
          setLoading(false);
        }
      };
      
      translateProps();
    }, [currentLanguage, props, isInitialized]);
    
    // Combine translation info into a single object
    const translationProps = useMemo(() => ({
      translation: {
        language: currentLanguage,
        isRTL: ['ar', 'he', 'ur'].includes(currentLanguage),
        isLoading: loading,
        preTranslated: preTranslatedProps
      }
    }), [currentLanguage, loading, preTranslatedProps]);
    
    // Return the wrapped component with translation props
    return <WrappedComponent {...props} {...translationProps} />;
  };
  
  // Set display name for debugging
  WithTranslation.displayName = `withTranslation(${componentName})`;
  
  return WithTranslation;
};

export default withTranslation; 