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

async function handleFileChange(event: Event) {
  if (event.target) {
    const target = event.target as HTMLInputElement;
    if (target?.files?.length) {
      imageUpload.value = target.files[0];
      await uploadImage();
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

// const dropZoneId: string = "drop-zone";
// const buttonId: string = "clickHere";
// const mouseOverClass: string = "mouse-over";

// const dropZone: JQuery<HTMLElement> = $("#" + dropZoneId);
// const ooleft: number = dropZone.offset().left;
// const ooright: number = dropZone.outerWidth() + ooleft;
// const ootop: number = dropZone.offset().top;
// const oobottom: number = dropZone.outerHeight() + ootop;
// const inputFile: JQuery<HTMLElement> = dropZone.find("input");
// document.getElementById(dropZoneId).addEventListener(
//   "dragover",
//   function (e: DragEvent) {
//     e.preventDefault();
//     e.stopPropagation();
//     dropZone.addClass(mouseOverClass);
//     const x: number = e.pageX;
//     const y: number = e.pageY;

//     if (!(x < ooleft || x > ooright || y < ootop || y > oobottom)) {
//       inputFile.offset({ top: y - 15, left: x - 100 });
//     } else {
//       inputFile.offset({ top: -400, left: -400 });
//     }
//   },
//   true,
// );

// if (buttonId != "") {
//   const clickZone: JQuery<HTMLElement> = $("#" + buttonId);

//   const oleft: number = clickZone.offset().left;
//   const oright: number = clickZone.outerWidth() + oleft;
//   const otop: number = clickZone.offset().top;
//   const obottom: number = clickZone.outerHeight() + otop;

//   $("#" + buttonId).mousemove(function (e: MouseEvent) {
//     const x: number = e.pageX;
//     const y: number = e.pageY;
//     if (!(x < oleft || x > oright || y < otop || y > obottom)) {
//       inputFile.offset({ top: y - 15, left: x - 160 });
//     } else {
//       inputFile.offset({ top: -400, left: -400 });
//     }
//   });
// }

// document.getElementById(dropZoneId).addEventListener(
//   "drop",
//   function (e: DragEvent) {
//     $("#" + dropZoneId).removeClass(mouseOverClass);
//   },
//   true,
// );

// // image_uploader.ondragover = image_uploader.ondragenter = function(evt) {
// //   evt.preventDefault();
// // };

// // dropContainer.ondrop = function(evt) {
// //   // pretty simple -- but not for IE :(
// //   fileInput.files = evt.dataTransfer.files;

// //   // If you want to use some of the dropped files
// //   const dT = new DataTransfer();
// //   dT.items.add(evt.dataTransfer.files[0]);
// //   dT.items.add(evt.dataTransfer.files[3]);
// //   fileInput.files = dT.files;

// //   evt.preventDefault();
// // };
</script>

<template>
  <div id="image_uploader">
    <v-flex></v-flex>
    <input type="file" @change="handleFileChange" />
    <img class="profile_photo" v-if="imageURL" :src="imageURL" alt="Image that was just uploaded" />
    <br />
  </div>
</template>

<style>
.profile_photo {
  width: 20vw;
  height: 20vw;
  object-fit: cover;
  align-self: auto;
  border: 3px solid #e3e8f4;
  border-radius: 16px;
  display: block;
  margin: 1rem auto;
  max-width: 100%;
}
#image_uploader {
  border: 3px solid #e3e8f4;
  border-radius: 16px;
  display: block;
  margin: 1rem auto;
}
</style>
