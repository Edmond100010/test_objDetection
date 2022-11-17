import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
// import * as Permissions from "expo-permissions";
import * as cocossd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs';
import * as FileSystem from 'expo-file-system'
import '@tensorflow/tfjs-react-native';

import * as MediaLibrary from "expo-media-library";

export default function App() {
  const camRef = useRef(null)
  const [type, setType] = useState(Camera.Constants.Type.back)
  const [hasPermission, setHasPermission] = useState(null)
  const [hasMediaPermission, setHasMediaPermission] = useState(null)
  const [cpaturedPic, setCpaturedPic] = useState(null)
  const [open, setOpen] = useState(null)
  const [objModel, setObjModel] = useState(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    (async () => {
      tf.setBackend('cpu');
      const { status } = await Camera.requestCameraPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");
      const model = await cocossd.load();
      setObjModel(model);
    })();
  }, [])


  const takePicture = async () => {
    // console.log("take picture")
    if (camRef) {
      const data = await camRef.current.takePictureAsync()
      // console.log(data)
      console.log("detection On", data.uri);
      // const img = FileSystem.readAsStringAsync(data.uri,FileSystem.EncodingType.Base64);
      console.log("permissionResponse", permissionResponse);
      // const obj =  await objModel.detect(data.uri);
      // console.log(obj);
      setCpaturedPic(data.uri)
      setOpen(true)
    }
  }


  


  // 儲存照片
  const savePicture = async () => {
    // console.log("save picture")
    const asset = await MediaLibrary.createAssetAsync(cpaturedPic)
      .then(() => {
        Alert.alert("Success", "照片存檔成功")
        setOpen(false)
      }).catch((e) => {
        console.log("error: ", e)
      });

  }
  

  //另一寫法
  // async function takePicture() {
  //   if (camRef) {
  //     const data = await camRef.current.takePictureAsync()
  //     console.log(data)
  //   }
  // }


  if (hasPermission === null) {
    return <View />
  } else if (hasPermission === false) {
    return <Text>沒有照相機的使用權限!!!</Text>
  }


  return (
    <SafeAreaView style={styles.container}>
      {/* 拍照區塊 */}
      <Camera
        style={{ flex: 1, }}
        type={type}
        ref={camRef}
      >
        <View style={{ flex: 1, backgroundColor: "transparent", flexDirection: "row" }}>
          <TouchableOpacity style={{
            position: "absolute",
            bottom: 20,
            left: 20,
          }}
            onPress={() => {
              setType(type === Camera.Constants.Type.back)
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            }}
          >
            {/* 前後鏡頭交換 的圖示按鈕 */}
            {/* <Text style={{ fontSize: 20, marginBottom: 15, color: "#fff" }}> 前後鏡頭交換</Text> */}
            <Ionicons name="ios-camera-reverse-sharp" size={24} color="white" />
          </TouchableOpacity>

        </View>
      </Camera>
      <TouchableOpacity
        style={styles.button}
        onPress={takePicture}
      >
        <FontAwesome
          name="camera"
          size={25}
          color="#fff"
        />
      </TouchableOpacity>

      {/* 展示照片區 */}
      {cpaturedPic &&
        <Modal
          animationType="slide"
          transparent={false}
          visible={open}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", margin: 20 }}>
            <View style={{ margin: 10, flexDirection: "row" }}>
              {/* 關閉的圖示按鈕 */}
              <TouchableOpacity
                style={{ margin: 10 }}
                onPress={() => setOpen(false)}
              >
                <FontAwesome
                  name="window-close"
                  size={50}
                  color="red"
                />
              </TouchableOpacity>

              {/* 存檔的圖示按鈕 */}
              <TouchableOpacity
                style={{ margin: 10 }}
                onPress={savePicture}
              >
                <FontAwesome
                  name="upload"
                  size={50}
                  color="#121212"
                />
              </TouchableOpacity>
            </View>
            {/* 在畫面中秀出照片 */}
            <Image
              style={{
                width: "100%",
                height: 450,
                borderRadius: 20,
              }}
              source={{ uri: cpaturedPic }}
            />
          </View>
        </Modal>
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#121212",
    margin: 20,
    borderRadius: 10,
    height: 50,
  },
});