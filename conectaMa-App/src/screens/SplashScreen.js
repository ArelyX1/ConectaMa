import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {

    const fakeAsyncTask = setTimeout(() => {

      navigation.replace('Login');
    }, 2000);


    return () => clearTimeout(fakeAsyncTask);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logoSimboloBlanco.png')} style={styles.logo}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#43A89B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 103,
    height: 150,
    resizeMode: 'cover'
  },
});

export default SplashScreen;
