import {StyleSheet,Text,View,Dimensions,ImageBackground} from 'react-native';
import React from 'react';

const { width, height } = Dimensions.get('screen');

const colors =(id)=> {
    if (id === 2) return { color: '#E495A6',btnColor:"#E495A6",descColor:"#9A596E",btnBg:"#ffffff"  };
    if (id === 3) return { color: '#84317A',btnColor:"#B057A6",descColor:"#A467A6",btnBg:"#FFE3FC" };
    if (id === 4) return { color: '#84317A',btnColor:"#ffffff",descColor:"#A467A6",btnBg:"#5C1A54"  }; 
    return { color: '#25486D',btnColor:"#35577C",descColor:"#EEF6FF",btnBg:"#ffffff" }; // Default colors
    
};

const SlideItem = ({ item }) => {
   

    return (
        <View style={{ width, height }}>
            <ImageBackground
                source={item.img}

                style={
                    {
                        width: width,
                        height: height,
                    }
                }
            >
                <View style={styles.text}>
                <Text style={[styles.title,{color:colors(item.id).color}]} className='font-sf font-bold'>{item.title}</Text>
                <Text style={[styles.description,{color:colors(item.id).descColor}]} className='font-light'>{item.description}</Text>
                </View>
            </ImageBackground>

        </View>
    );
};

export default SlideItem;
export {colors};

const styles = StyleSheet.create({
    text:{
        position: 'absolute',
        bottom: 0,
        width: width,
        height: height / 2.5,
        justifyContent: 'top',
    },
    title: {
        fontSize: 36,
        top:0,
        width: width/1.2,
        marginHorizontal:'auto',
        lineHeight: 40,
    },
    description: {
        fontSize: 13,
        marginVertical: 12,
        width: width/1.2,
        marginHorizontal:'auto',
        flexWrap: 'wrap',
      },
});