import { StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native'
import React, {useState, useEffect} from 'react'
// import { auth } from '../config'
import { useNavigation } from '@react-navigation/native'

import * as ImagePicker from 'expo-image-picker';
import { firebaseConfig, auth, upload, saveUser, getUser, addPhotoURLToCurrentUser } from '../config'

import QRCode from 'react-native-qrcode-svg'
import { BarCodeScanner } from 'expo-barcode-scanner'

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowAlert: true,
      };
    },
  });

 


const HomeScreen = () => {
    const [image, setImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [userData, setUserData] = useState(null)
    
    const [scanLoading, setScanLoading] = useState(true)
    const [scanData, setScanData] = useState(null)
    const [permission, setPermission] = useState(true)
    const [scanCode, setScanCode] = useState(false)
    
    const payload = { uid: userData?.user.uid, name: userData?.user.firstname + ' ' + userData?.user.lastname, pushToken: userData?.user.pushToken }
    
    const navigation = useNavigation()

    useEffect(() => {
    Notifications.getPermissionsAsync()
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          return Notifications.requestPermissionsAsync();
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          // alert();
          throw new Error("Permission not granted.");
        }
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }, []);

 useEffect(() => {
    const backgroundSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
      });
    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    };
  }, []);

    useEffect(() => {
        if(auth.currentUser?.photoURL){
            setImage(auth.currentUser.photoURL)

            getCurrentUser()
            if(!userData?.profileURL){
                addPhotoToCurrentUser()
            }
        }
    }, [auth.currentUser])

    useEffect(() => {
        if(userData){
            setFirstName(userData.user.firstname)
            setLastName(userData.user.lastname)
        }
    }, [userData])

    useEffect(() => {
        if(scanCode){
            requestCameraPermission()
        }
    },[scanCode])

    useEffect(() => {
        console.log("SCAN DATA", scanData)
        sendFriendAddNotification()
    }, [scanData])

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,5]
        })
        
        // const source = {uri: result.assets[0].uri}

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
        
    }
    
    const handleUpload = async () => {
        upload(image, auth.currentUser, setLoading)
    }

    const handleSignOut = () => {
        auth
            .signOut()
            .then(() => {
                navigation.replace("Login")
            })
            .catch(error => alert(error.message))
    }
    const getCurrentUser = async () => {
        const userDatas = await getUser(auth.currentUser.uid)

        setUserData(userDatas)
        addPhotoToCurrentUser()
    }

    const addPhotoToCurrentUser = async () => {

        const user = {
            "profileURL": auth.currentUser.photoURL 
        }

        const profileURL = auth.currentUser.photoURL

        await addPhotoURLToCurrentUser(user, auth.currentUser.uid)
    }

    const requestCameraPermission = async () => {
        try{
            const {status, granted} = await BarCodeScanner.requestPermissionsAsync()
            console.log(`status: ${status}, granted: ${granted}`)

            if(status === 'granted'){
                console.log('Acces granted');
                setPermission(true)
            } else {
                setPermission(false)
            }
        } catch (error) {
            console.log(error)
            setPermission(false)
        } finally {
            setScanLoading(false)
        }
    }

    if(scanLoading && scanCode) return (<View style={styles.container}><Text>Requesting permission ...</Text></View>)
    if(scanData && scanCode) {
        setScanCode(false)
    }
    // <View style={styles.container}>
    //     <Text>UID: {scanData.uid}, Name: {scanData.name}, pushToken: {scanData.pushToken}</Text>
    //     <Button title="Scan again" onPress={() => setScanData(undefined)} />
    // </View>
    if(permission && scanCode) return (
        <BarCodeScanner 
        style={[styles.container]}
        onBarCodeScanned={({type, data}) => {
            try {
                console.log("DATA INCOMING: ", data)
                console.log(type)
                console.log(data)
                let _data = JSON.parse(data)
                setScanData(_data)
                
            } catch (error) {
                console.log('Unable to parse: ', error)
            }
        }}
        >
            <Text style={styles.text}>Scan the QR code</Text>
        </BarCodeScanner>
    )

    const sendFriendAddNotification = async () => {
        console.log("SEND NOTIFY")
        fetch("https://exp.host/--/api/v2/push/send/", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Accept-Encoding": "gzip, deflate",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: `${scanData?.pushToken}`,
              data: { url: `friend/${firstName} ${lastName}` },
              title: "New friend!",
              body: `${firstName} added you as a friend, go say hello!`
            }),
        });
    }


  return (
    <View style={styles.container}>
        <Text style={{fontWeight: 'bold'}}>Welcome to the app, {firstName}!</Text>
        {/* <Text>Name: {auth.currentUser?.displayName}</Text> */}
        <Text>Name: {firstName} {lastName}</Text>
        <Text>Email: {auth.currentUser?.email}</Text>
        <Text>Phone: {userData?.user.phoneNumber}</Text>
        <TouchableOpacity
            onPress={handleSignOut}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => setScanCode(true)}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Scan QR code</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
            onPress={getCurrentUser}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Get user info</Text>
        </TouchableOpacity> */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
            <Button style={styles.button2} disabled={loading} title="Pick an image from camera roll" onPress={handlePickImage} />
            <Button style={styles.button2} disabled={loading} title="upload" onPress={handleUpload} />
            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        </View>
        <View>
            <QRCode value={JSON.stringify(payload)} />
            {scanData && <Text>UID: {scanData.uid}, Name: {scanData.name}, pushToken: {scanData.pushToken}</Text>}
        </View>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        backgroundColor: '#0782F9',
        width: '60%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 5
    },
    button2: {
        marginTop: 5
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    },
})