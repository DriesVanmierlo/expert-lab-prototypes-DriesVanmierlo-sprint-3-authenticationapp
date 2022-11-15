import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Button, Image, Alert } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { firebaseConfig, auth, upload} from '../config'
import firebase from 'firebase/compat/app'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha'

const SignupScreen = () => {

    const navigation = useNavigation()
    
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(false)
    
    const [phoneNumber, setPhoneNumber] = useState('')
    const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('')
    const [code, setCode] = useState('')
    const [verificationId, setVerificationId] = useState(null)
    const recaptchaVerifier = useRef(null)
    const [smsWaiting, setSmsWaiting] = useState(false)
    const [phoneVerified, setPhoneVerified] = useState(false)
    const [phoneCredential, setPhoneCredential] = useState(null)

    useEffect(() => {
        console.log(image);
    }, [image])

    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged(user => {
    //         if(user){
    //             navigation.replace("Home")
    //         }
    //     })
    //     return unsubscribe
    // }, [])

    const registerAccount = () => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if(user){
                navigation.replace("Home")
            }
        })
        return unsubscribe
    }

    const handleSignup = () => {
        if(!firstName || !lastName || !email || !password || !image || !phoneVerified){
            return Alert.alert("All fields must be filled in, and you need to add a profile picture")
        }

        auth
            .createUserWithEmailAndPassword(email, password)
            .then(userCredentials => {
                userCredentials.user.updateProfile({displayName: firstName + ' ' + lastName})
                userCredentials.user.updatePhoneNumber({credential: phoneCredential})
                const uploadImage = handleUpload(image, auth.currentUser, setLoading)
                const user = userCredentials.user;
                console.log('Registered in with: ', user.email);
                registerAccount()
            })
            .catch(error => alert(error.message))
    }

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,5]
        })
        
        // const source = {uri: result.assets[0].uri}

        if (!result.canceled) {
            setImage(result.assets[0].uri)
            console.log("URIIII", result.assets[0].uri)
        }
        
    }
    
    const handleUpload = async () => {
        upload(image, auth.currentUser, setLoading)
    }

    const sendVerification = () => {
        const phoneProvider = new firebase.auth.PhoneAuthProvider();
        phoneProvider
        .verifyPhoneNumber(phoneNumber, recaptchaVerifier.current)
        .then(setVerificationId);
        setSmsWaiting(true)
      };
    
      const confirmCode = () => {
        const credential = firebase.auth.PhoneAuthProvider.credential(
            verificationId,
            code
        );
        // firebase.auth().signInWithCredential(credential)
        //     .then(() => {
        //         setCode('')
        //         setSmsWaiting(false)
        //         setPhoneVerified(true)
        //     })
        //     .catch((error) => {
        //         //show an alert in case of error
        //         alert(error);
        //     })

        if(credential){
            setPhoneCredential(credential)
            setVerifiedPhoneNumber(phoneNumber)
            setPhoneVerified(true)
            setSmsWaiting(false)
           Alert.alert(
                'Phone is correctly verified!'
            ); 
        }   
      }
    

  return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
    >
        <FirebaseRecaptchaVerifierModal 
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
        />
      <View style={styles.inputContainer}>
      <TextInput
        placeholder='First name'
        value={firstName}
        onChangeText={text => setFirstName(text)}
        style={styles.input}
        />
        <TextInput
        placeholder='Last name'
        value={lastName}
        onChangeText={text => setLastName(text)}
        style={styles.input}
        />
        <TextInput
        placeholder='Email'
        value={email}
        onChangeText={text => setEmail(text)}
        style={styles.input}
        />
        <TextInput
        placeholder='Password'
        value={password}
        onChangeText={text => setPassword(text)}
        style={styles.input}
        secureTextEntry
        />
      </View>

      <View style={styles.inputContainerPhone}>
      <TextInput
        placeholder='Phonenumber'
        value={phoneNumber}
        onChangeText={text => setPhoneNumber(text)}
        style={styles.inputPhone}
        keyboardType='phone-pad'
        autoCompleteType='tel'
        secureTextEntry
        />
        <TouchableOpacity disabled={smsWaiting || phoneVerified} style={styles.buttonPhone} onPress={sendVerification}>
            <Text style={styles.buttonTextPhone}>Verify SMS</Text>
        </TouchableOpacity>
      </View>

      { smsWaiting && <View style={styles.inputContainerPhone}>
      <TextInput
        placeholder='Confirm code'
        value={code}
        onChangeText={text => setCode(text)}
        style={styles.inputPhone}
        keyboardType='number-pad'
        secureTextEntry
        />
        <TouchableOpacity  style={styles.buttonPhone} onPress={confirmCode}>
            <Text style={styles.buttonTextPhone}>Confirm code</Text>
        </TouchableOpacity>
      </View>}

      <View style={styles.imageContainer}>
            <Button style={styles.imageButton} disabled={loading} title="Pick an image from camera roll" onPress={handlePickImage} />
           <Image style={styles.image} source={{ uri: image }} />
        </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
            onPress={handleSignup}
            style={[styles.button, styles.buttonOutline]}
        >
            <Text style={styles.buttonOutlineText}>Register</Text>

        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default SignupScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputContainer: {
        width: '80%'
    },
    inputContainerPhone: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5
    },
    inputPhone: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
        width: '60%'
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40
    },
    button: {
        backgroundColor: '#0782F9',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    buttonPhone: {
        backgroundColor: '#0782F9',
        width: '35%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 5,
    },
    buttonOutline: {
        backgroundColor: '#fff',
        marginTop: 5,
        borderColor: '#0782F9',
        borderWidth: 2
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    },
    buttonTextPhone: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12
    },
    buttonOutlineText: {
        color: '#0782F9',
        fontWeight: '700',
        fontSize: 16
    },
    imageContainer: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 160, 
        height: 200,
        marginTop: 10,
        backgroundColor: '#c3c3c3'
    }
})