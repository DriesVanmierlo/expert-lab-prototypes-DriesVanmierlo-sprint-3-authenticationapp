import { StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native'
import React, {useState, useEffect} from 'react'
// import { auth } from '../config'
import { useNavigation } from '@react-navigation/native'

import * as ImagePicker from 'expo-image-picker';
import { firebaseConfig, auth, upload, saveUser, getUser, addPhotoURLToCurrentUser } from '../config'


const HomeScreen = () => {
    const [image, setImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [userData, setUserData] = useState(null)
    
    const navigation = useNavigation()

    useEffect(() => {
        if(auth.currentUser?.photoURL){
            setImage(auth.currentUser.photoURL)
            const [firstName, lastName] = auth.currentUser.displayName.split(' ')
            setFirstName(firstName)
            setLastName(lastName)
            getCurrentUser()
            if(!userData?.profileURL){
                addPhotoToCurrentUser()
            }
        }
    }, [auth.currentUser])

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


  return (
    <View style={styles.container}>
        <Text style={{fontWeight: 'bold'}}>Welcome to the app, {firstName}!</Text>
        <Text>Name: {auth.currentUser?.displayName}</Text>
        <Text>Email: {auth.currentUser?.email}</Text>
        <Text>Phone: {userData?.user.phoneNumber}</Text>
        <TouchableOpacity
            onPress={handleSignOut}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
            onPress={getCurrentUser}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Get user info</Text>
        </TouchableOpacity> */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Button disabled={loading} title="Pick an image from camera roll" onPress={handlePickImage} />
            <Button disabled={loading} title="upload" onPress={handleUpload} />
            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
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
        marginTop: 40
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    },
})