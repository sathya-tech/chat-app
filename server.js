import dotenv from 'dotenv';

dotenv.config();

import express from "express";
import cors from "cors";

import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { signInWithEmailAndPassword } from 'firebase/auth';
import multer from "multer";
import {uploadBytes,listAll,deleteObject} from "firebase/storage"



const firebaseConfig = {
    apiKey:process.env.API_KEY ,
    authDomain: process.env.AUTH_DOMAIN,
    projectId:process.env.PROJECT_ID ,
    storageBucket:process.env.STORAGE_BUCKET ,
    messagingSenderId:process.env.MESSAGING_SENDER_ID ,
    appId: process.env.APP_ID,
};

const fire = initializeApp(firebaseConfig);
const auth = getAuth(fire);
const storage = getStorage(fire);
const db=getFirestore();

const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });
// const upload = multer();

const app = express();

app.use(cors());

app.use(express.urlencoded());
app.use(express.json());


app.post("/register", upload.single("pic"), async (req, res) => {
    const { email, password, displayName } = req.body;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const file = req.file;

    
    const date = new Date().getTime();
    

    const imageRef = ref(storage, `${displayName + date}`);
    // const metatype = { contentType: React, name: file.originalname };
    
    const snap = await uploadBytesResumable(imageRef, file.buffer)
    
    const downloadURL = await getDownloadURL(snap.ref);
    console.log(downloadURL);

    // result.user.displayName = displayName;
    // result.user.photoURL = downloadURL;

    await updateProfile(result.user, {
        displayName,
        photoURL: downloadURL,
    });

    await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        displayName,
        email,
        photoURL: downloadURL,
      });

    //   //create empty user chats on firesulttore
    await setDoc(doc(db, "userChats", result.user.uid), {});
    console.log(result);
    res.status(200).send("success");
})



app.listen(3001, () => {
    console.log("listening on port 3001");
})
