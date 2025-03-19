import {StyleSheet, Animated, View, Dimensions} from 'react-native';
import React,{useEffect,useRef} from 'react';

const {width,height} = Dimensions.get('screen');
const getDotColors = (index) => {
  if (index === 1) return { default: '#E4BCCF', active: '#EDB1CD' }; 
  if (index === 2) return { default: '#AF55A4', active: '#84317A' }; 
  if (index === 3) return { default: '#AF55A4', active: '#84317A' };
  return { default: '#e0ddde', active: '#feeeef' }; // Default colors
};

const Pagination = ({data, index}) => {
  const animatedIndex = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.timing(animatedIndex, {
      toValue: index,
      duration: 100, // Smooth transition
      useNativeDriver: false,
    }).start();
  }, [index]);

  return (
    <View style={styles.container}>
      {data.map((_, idx) => {
         const { default: defaultColor, active: activeColor } = getDotColors(index);
       const inputRange = [idx - 1, idx, idx + 1];

        const dotWidth = animatedIndex.interpolate({
          inputRange,
          outputRange: [12, 30, 12],
          extrapolate: 'clamp',
        });

        const opacity = animatedIndex.interpolate({
          inputRange,
          outputRange: [0.5, 1, 0.5],
          extrapolate: 'clamp',
        });

        const backgroundColor = animatedIndex.interpolate({
          inputRange,
          outputRange: [
            defaultColor,   // Before active
            activeColor,    // Active
            defaultColor,   // After active
          ],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={idx.toString()}
            style={[
              styles.dot,
              {width: dotWidth, backgroundColor,opacity},
              idx === index && [styles.dotActive,{backgroundColor:activeColor}],
            ]}
          />
        );
      })}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: height / 2.4,
    left: 0,
    flexDirection: 'row',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#e0ddde',
  },
  dotActive: {
    backgroundColor: '#ffffff',
  },
});