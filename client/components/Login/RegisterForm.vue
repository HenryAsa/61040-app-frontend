<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import ImageUploader from "../Images/ImageUploader.vue";

const first_name = ref("");
const last_name = ref("");
const username = ref("");
const password = ref("");
const profile_picture = ref("");
const { createUser, loginUser, updateSession } = useUserStore();

async function register() {
  await createUser(username.value, password.value, first_name.value, last_name.value, profile_picture.value);
  await loginUser(username.value, password.value);
  void updateSession();
  void router.push({ name: "Home" });
}

function uploadImage(url: string) {
  profile_picture.value = url;
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
        <label for="aligned-password">Password</label>
        <input type="password" v-model.trim="password" id="aligned-password" placeholder="Password" required />
      </div>
      <div class="pure-control-group">
        <ImageUploader @update:imageSrc="uploadImage"></ImageUploader>
      </div>
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
