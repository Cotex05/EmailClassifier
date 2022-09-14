import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, TextInput, Image, Keyboard, Dimensions, ImageBackground, TouchableWithoutFeedback } from 'react-native';

import { Button, Overlay } from 'react-native-elements';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as Animatable from 'react-native-animatable';

function HomeScreen() {

  const [text, setText] = useState("");
  const [response, setResponse] = useState(null);
  const [spam, setSpam] = useState(false)
  const [percent, setPercent] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(50);

  var score = 0;

  const toggleOverlay = () => {
    setVisible(!visible);
    setShowLoading(false);
    setText("");
    setHeight(50);
  };

  // handle functions
  const handleInputHeight = (e) => {
    if (height < 150) {
      setHeight(e.nativeEvent.contentSize.height);
    } else {
      if (e.nativeEvent.contentSize.height < 150) {
        setHeight(e.nativeEvent.contentSize.height);
      } else {
        setHeight(150);
      }
    }
  };

  // useEffect(() => {
  //   const testing = () => {
  //     axios({
  //       method: 'post',
  //       url: "https://unspammer.herokuapp.com/v1/models/email_model:predict",
  //       headers: {},
  //       data: {
  //         "instances": [
  //           "Is it Spam!"
  //         ]
  //       }
  //     }).then((res) => {
  //       console.log(res.data);
  //       setResponse(res.data);
  //     }).catch((err) => {
  //       console.log(err.message);
  //       Alert.alert("Server Error!", err.message);
  //     });
  //   }
  //   testing();
  // }, [])

  const postDataUsingSimplePostCall = () => {

    if (text.trim().length > 15) {
      setShowLoading(true);
      axios({
        method: 'post',
        url: "https://unspammer.herokuapp.com/v1/models/email_model:predict",
        headers: {},
        data: {
          "instances": [
            text
          ]
        }
      }).then((res) => {
        // handle success
        setTimeout(() => {
          setShowLoading(false);
          setVisible(true);
        }, 4000);
        Keyboard.dismiss();
        setResponse(res.data);
        console.log(res.data);
        score = res.data['predictions'][0][0];
        setPercent(Math.floor(score * 100))
        if (score > 0.50) {
          setSpam(true);
        } else {
          setSpam(false);
        }
      }).catch((error) => {
        // handle error
        setShowLoading(false);
        Alert.alert(error.message, error);
        console.log(error.message)
      });
    }
    else {
      Alert.alert("Write Something...", "Too short sentence to classify.")
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: "https://wallpaperset.com/w/full/2/a/0/225676.jpg" }} resizeMode="cover" style={styles.image}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.box}>
            <Text style={styles.title}>SMS/Email Classifier</Text>
            <Text style={{ color: 'gray', fontSize: 20 }}>Spam vs Ham</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { height: height }]}
                onChangeText={txt => setText(txt)}
                value={text}
                placeholder="Write or paste text message/email here..."
                multiline
                numberOfLines={5}
                onContentSizeChange={e => handleInputHeight(e)}
              />
            </View>
            {/* <Text selectable={true} style={{ color: "gray", padding: 12, fontSize: 16 }}>Eg. </Text> */}
            <View style={{ padding: 15, width: Dimensions.get('window').width - 120, margin: 30, height: 120, justifyContent: 'space-between', flexDirection: 'column' }}>
              <Button
                title="Get Sample"
                type="clear"
                onPress={() => { setText("Urgent! Your account is blocked due to privacy issue, please update you password at https://bit.ly/zxcvbn to secure your account.") }}
              />
              <Button loading={showLoading} title="Check" onPress={() => postDataUsingSimplePostCall()} />
            </View>
          </View>
        </TouchableWithoutFeedback>
        <Overlay isVisible={visible} onBackdropPress={toggleOverlay} overlayStyle={{ backgroundColor: '#001212', borderRadius: 20, marginHorizontal: 12, borderWidth: 2, borderColor: (spam ? 'red' : 'lime'), paddingVertical: 20 }}>
          <Animatable.View animation="zoomIn" easing="ease" style={{ alignItems: 'center' }}>
            <Text ellipsizeMode="tail" numberOfLines={6} style={{ fontFamily: 'serif', fontSize: 18, color: 'gray', padding: 10 }}>"{text}"</Text>
            <View style={{ display: (response != null ? 'flex' : 'none') }}>
              <Image style={{ width: 250, height: 200 }} source={{ uri: (spam ? "https://38.media.tumblr.com/7628e177c3ba3ce89f8f7f8eb47f23e0/tumblr_mv2vb2YTNP1s5wnpzo1_400.gif" : "https://media.giphy.com/media/3HDW3amyAVijmArDfK/giphy.gif") }} />
              <Text style={{ color: (spam ? 'red' : 'lime'), fontSize: 20, padding: 10 }}>{spam ? percent : 100 - percent}% {spam ? "Chance of a spam" : "Chance of not a spam"}</Text>
            </View>
            <Button type="outline" constainerStyle={{ margin: 15 }} buttonStyle={{ width: 250 }} title="Close" onPress={toggleOverlay} />
          </Animatable.View>
        </Overlay>
        <StatusBar style="light" />
      </ImageBackground>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Spam Detector',
            headerStyle: {
              backgroundColor: '#008fff',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontFamily: 'serif'
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,255,0.2)',
  },
  image: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center'
  },
  box: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    margin: 10,
    padding: 5,
    borderRadius: 25,
    borderColor: '#007fff',
    borderWidth: 2,
    alignItems: 'center'
  },
  title: {
    color: '#ff7200',
    fontFamily: 'monospace',
    fontSize: 25,
    marginTop: 20,
    alignSelf: 'center'
  },
  inputContainer: {
    marginTop: 50,
    padding: 5,
    justifyContent: 'center'
  },
  input: {
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 18,
    width: Dimensions.get('window').width - 30,
    alignSelf: 'center'
  }
});
