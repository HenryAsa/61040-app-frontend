<script setup lang="ts">
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAg8w-PHMXNn9Ji7bn4im8kwoBM5azV4YA",
  authDomain: "uploading-images-b5337.firebaseapp.com",
  projectId: "uploading-images-b5337",
  storageBucket: "uploading-images-b5337.appspot.com",
  messagingSenderId: "1055327096317",
  appId: "1:1055327096317:web:8ac5991adf495316e55d94",
  measurementId: "G-QL17FDF52X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { defineEmits, ref as vueRef } from "vue";
import { v4 } from "uuid";

const imageUpload = vueRef();
const imageUrl = vueRef();

const emit = defineEmits(["update:imageUrl"]);

initializeApp(firebaseConfig);

const storage = getStorage();

function handleFileChange(event: Event) {
  if (event.target) {
    const target = event.target as HTMLInputElement;
    if (target?.files?.length) {
      imageUpload.value = target.files[0];
    }
  }
}

const uploadImage = async () => {
  const file = imageUpload.value as File;
  const imageRef = ref(storage, `images/${file.name + v4()}`);

  await uploadBytes(imageRef, imageUpload.value).then(async (response) => {
    console.log(response);
    await getDownloadURL(ref(storage, response.ref.fullPath)).then((url) => {
      imageURL.value = url;
      emit("update:imageURL", url);
    });
  });
};
</script>

<template>
  <div>
    <img v-if="imageUrl" :src="imageUrl" alt="Your Image" />
    <br />
    <input type="file" @change="handleFileChange" />
    <button class="pure-button pure-button-primary" @click="uploadImage">Upload ID</button>
    <br />
  </div>
</template>

<style></style>
