import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect} from "react";
import { Camera } from 'expo-camera'
import { StyleSheet, Text, View, Button, Image, Alert  } from 'react-native'; 
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as cocossd from '@tensorflow-models/coco-ssd'


export default function cameraFunction(){
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [camera, setCamera] = useState(null);
    const [image, setImage] = useState(null);
    const [objImage, setObjImage] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [objModel, setObjModel] = useState(null);
    
    useEffect(() => {
        (async () => {
            tf.setBackend('cpu');
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
            const model = await cocossd.load();
            setObjModel(model);
            // const model = await downloadModel();

            // const net = await cocossd.load();
            // setInterval(() => {
            //     detect(net);
            //   }, 10);
            
        })();
    }, []);

    const takePicture = async () => {
        const data = await camera.takePictureAsync(null);
        setImage(data.uri);
        setObjImage(data.uri);
        if (camera){
            if (objModel != null) {
                console.log("Got model");
            } else {
                console.log("Have not got model");
            }

            detect(objModel, objImage);
            
                // detect(model);


            // const data = await camera.takePictureAsync(null);
            // const imgB64 = await FileSystem.readAsStringAsync(data.uri, {
            //   encoding: FileSystem.EncodingType.Base64,
            // })
            // console.log('Detecting on');
            // tf.engine().startScope();
            // const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            // const raw = new Uint8Array(imgBuffer);
            // const imageTensor = decodeJpeg(raw);
            // console.log('tensor', imageTensor);
            // const model = await cocossd.load();
            // let [modelWidth, modelHeight] = model.inputs[0].shape.slice(1,3);
            // console.log(modelWidth, modelHeight);
            // const input = tf.tidy(() => {
            //   return tf.image
            //     .resizeBilinear(imageTensor, [modelWidth, modelHeight])
            //     .div(255.0)
            //     .expandDims(0);
            // });
            // console.log('input tensor', input);

            // const objects = await model.
            // setImage(data.uri);

        }
    }

    const detect = async (net, picture) => {
        // Check data is available
        // if (
        //   typeof webcamRef.current !== "undefined" &&
        //   webcamRef.current !== null &&
        //   webcamRef.current.video.readyState === 4
        // ) {
        //   // Get Video Properties
        //   const video = webcamRef.current.video;
        //   const videoWidth = webcamRef.current.video.videoWidth;
        //   const videoHeight = webcamRef.current.video.videoHeight;
    
        //   // Set video width
        //   webcamRef.current.video.width = videoWidth;
        //   webcamRef.current.video.height = videoHeight;
    
        //   // Set canvas height and width
        //   canvasRef.current.width = videoWidth;
        //   canvasRef.current.height = videoHeight;
    
          // 4. TODO - Make Detections
          // e.g. const obj = await net.detect(video);
          console.log("detection On");
          const obj =  await net.detect(picture);
          console.log(obj);
    
          // Draw mesh
          const ctx = canvasRef.current.getContext("2d");
    
          // 5. TODO - Update drawing utility
          // drawSomething(obj, ctx)  
          drawRect(obj, ctx);
        }
    



    if (hasCameraPermission === false) {
        return <text>No Camera Access</text>;
    }


    return (
        <View style ={{flex:1}}>
            <View style = {styles.cameraContainer}>
                <Camera ref = {ref => setCamera(ref)}
                style={styles.fixedRatio}
                type={type}
                ratio={'1:1'}
                />

            </View>

            
            <Button 
            title="Flip Camera"
            onPress={() => {
                setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front:Camera.Constants.Type.back);   
            }}></Button>
            <Button title="Take Picture"
            onPress={() => takePicture()}
            />
            {image && <Image source={{uri: image}} style={{flex:1}}/>}

        </View>

    )

}

const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    fixedRatio: {
        flex: 1,
        aspectRatio: 1
    }
});