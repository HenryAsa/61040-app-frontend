<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import FileUploadBox from "../Media/FileUploadBox.vue";
import ImageUploader from "../Images/ImageUploader.vue";
import newUploadMedia from "../Media/newUploadMedia.vue";
import PasswordValidation from "./PasswordValidation.vue";

const first_name = ref("");
const last_name = ref("");
const username = ref("");
const password = ref("");
const profile_picture = ref("");
const { createUser, loginUser, updateSession } = useUserStore();

async function register() {
  if (profile_picture.value === "") {
    return;
  }
  console.log(username.value, password.value, first_name.value, last_name.value, profile_picture.value);
  console.log(`THIS IS THE PROFILE URL:   ${profile_picture.value}`);
  await createUser(username.value, password.value, first_name.value, last_name.value, profile_picture.value);
  await loginUser(username.value, password.value);
  void updateSession();
  void router.push({ name: "Home" });
}

async function assignURL(url: string) {
  profile_picture.value = url;
  console.log(`JUST SET THE URL           ${url}`);
}

function assignPassword(userPassword: string) {
  password.value = userPassword;
  console.log(password.value);
}
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="register">
    <h3>Register User</h3>
    <fieldset>
      <div class="pure-control-group">
        <label for="aligned-name">First Name</label>
        <input v-model.trim="first_name" type="text" id="aligned-name" placeholder="First Name" required />
      </div>
      <div class="pure-control-group">
        <label for="aligned-name">Last Name</label>
        <input v-model.trim="last_name" type="text" id="aligned-name" placeholder="Last Name" required />
      </div>
      <div class="pure-control-group">
        <label for="aligned-name">Username</label>
        <input v-model.trim="username" type="text" id="aligned-name" placeholder="Username" required />
      </div>
      <div class="pure-control-group">
        <PasswordValidation @userPassword="assignPassword" id="aligned-password" placeholder="Password" required></PasswordValidation>
      </div>
      <!-- <div class="pure-control-group">
        <ImageUploader @update:imageURL="assignURL"></ImageUploader>
      </div> -->
      <div class="pure-control-group">
        <newUploadMedia @update:imageURL="assignURL"></newUploadMedia>
      </div>
      <!-- <div class="pure-control-group">
        <FileUploadBox @update:imageURL="assignURL"></FileUploadBox>
      </div> -->
      <div class="pure-controls">
        <button type="submit" class="pure-button pure-button-primary">Register</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}
</style>
