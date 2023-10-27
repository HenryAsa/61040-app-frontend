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

const mediaUpload = ref();
const mediaURL = ref();

const emit = defineEmits(["update:mediaURL", "createdMedia"]);

import { fetchy } from "../../utils/fetchy";

const createMediaInDB = async () => {
  try {
    await fetchy(`api/media`, "POST");
  } catch {
    return;
  }
  emit("createdMedia");
};

async function handleFileChange(event: Event) {
  if (event.target) {
    const target = event.target as HTMLInputElement;
    if (target?.files?.length) {
      mediaUpload.value = target.files[0];
      await uploadMedia();
    }
  }
}

const uploadMedia = async () => {
  const file = mediaUpload.value as File;
  const mediaRef = firebaseRef(storage, `media/${file.name}`);

  await uploadBytes(mediaRef, mediaUpload.value).then(async (response) => {
    console.log(response);
    await getDownloadURL(firebaseRef(storage, response.ref.fullPath)).then(async (url) => {
      console.log(`GOT THE URL ${url}`);
      mediaURL.value = url;
      emit("update:mediaURL", url);
    });
  });
};
</script>

<template>
    <v-flex></v-flex>
</template>