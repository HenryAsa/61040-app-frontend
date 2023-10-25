<script setup lang="ts">
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { ref as firebaseRef, getDownloadURL, uploadBytes } from "firebase/storage";
import { defineEmits, ref } from "vue";
import { storage } from "../../../server/firebase";
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

const imageUpload = ref();
const imageURL = ref();

const emit = defineEmits(["update:imageURL"]);

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
  const imageRef = firebaseRef(storage, `images/${file.name}`);

  await uploadBytes(imageRef, imageUpload.value).then(async (response) => {
    console.log(response);
    await getDownloadURL(firebaseRef(storage, response.ref.fullPath)).then(async (url) => {
      console.log(`GOT THE URL ${url}`);
      imageURL.value = url;
      emit("update:imageURL", url);
    });
  });
};
</script>

<template>
  <div>
    <v-flex></v-flex>
    <img class="center" v-if="imageURL" :src="imageURL" alt="Image that was just uploaded" />
    <br />
    <input type="file" @change="handleFileChange" />
    <button @click="uploadImage">Upload Image</button>
    <br />
  </div>
</template>

<style></style>
