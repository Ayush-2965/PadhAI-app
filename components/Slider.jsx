import { Animated, FlatList, View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import React, { useRef, useState ,useEffect} from 'react';
import Slides from '../data/index';
import SlideItem, { colors } from './SliderItem';
import Pagination from './Pagination';
import Icon from 'react-native-vector-icons/AntDesign';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('screen');
const Slider = () => {
    const router=useRouter();
    const [index, setIndex] = useState(0);
    const flatListRef = useRef(null);
    const translateX = useRef(new Animated.Value(0)).current; // Check session

    const handleNext = () => {
        if (index < Slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: index + 1, animated: true });
            setIndex(index + 1);

            translateX.setValue(0);

            Animated.sequence([
                Animated.timing(translateX, {
                    toValue: 5, 
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();

        }
        if (index===Slides.length-1) {
            router.push("/(auth)")
        }
    }
        
    
    return (
        <>
            <FlatList
                data={Slides}
                renderItem={({ item }) => <SlideItem item={item} />}
                ref={flatListRef}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                snapToInterval={Dimensions.get('screen').width}
                decelerationRate="fast"
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, i) => i.toString()}
                getItemLayout={(data, i) => ({
                    length: width,
                    offset: width * i,
                    index: i,
                })}

            />
            <Pagination data={Slides} index={index} />
            <View style={styles.buttonsContainer} >

                <TouchableOpacity onPress={()=>{handleNext()}} style={[styles.button, { backgroundColor: colors(index + 1).btnBg }]} >

                    <Text style={[styles.buttonText, { color: colors(index + 1).btnColor }]}>{index === Slides.length - 1 ? 'Start Learning' : 'Continue'}
                    </Text>
                    <Animated.View style={{ transform: [{ translateX }] }}>
                        <Icon name="arrowright" size={22} height={18} color={colors(index + 1).btnColor} />
                    </Animated.View>

                </TouchableOpacity>
            </View>
        </>
    );
};

export default Slider;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 48,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        width: '64%'
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlignVertical: 'center',
    },
    disabled: {
        backgroundColor: '#A0A0A0',
    },
});