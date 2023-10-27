<script setup lang="ts">
import { computed, reactive } from "vue";

interface PasswordValidator {
  password: string;
  passwordType: string;
}

const state = reactive<PasswordValidator>({
  password: "",
  passwordType: "password",
});

const emit = defineEmits(["userPassword"]);

const isInitial = computed(() => {
  return state.password.length < 3;
});

const isShort = computed(() => {
  return state.password.length >= 3 && !isMinLength.value;
});

const isWeak = computed(() => {
  return isMinLength.value && (!hasSpecialCharacter.value || !hasUpperCase.value);
});

const isFair = computed(() => {
  return isMinLength.value && hasSpecialCharacter.value && hasUpperCase.value;
});

const isExcellent = computed(() => {
  return state.password.length >= 12 && hasSpecialCharacter.value && hasUpperCase.value && hasNumber.value;
});

const isValid = computed(() => {
  return isFair.value || isExcellent.value;
});

const hasUpperCase = computed(() => {
  const regex = /(?=.*[A-Z])/g;
  return state.password.match(regex);
});

const hasLowerCase = computed(() => {
  const regex = /[a-z]/g;
  return state.password.match(regex);
});

const hasSpecialCharacter = computed(() => {
  const regex = /[^A-Za-z0-9]/g;
  return state.password.match(regex);
});

const isMinLength = computed(() => {
  return state.password.length >= 7;
});

const hasNumber = computed(() => {
  const regex = /[0-9]/g;
  return state.password.match(regex);
});

// const hasWhiteSpace = computed(() => {
//   const regex = /\s/g;
//   return state.password.match(regex);
// });

const passwordStrength = computed(() => {
  let msg = "";
  msg = isShort.value ? "Very Weak" : msg;
  msg = isWeak.value ? "Weak" : msg;
  msg = isFair.value ? "Fair" : msg;
  msg = isExcellent.value ? "Strong" : msg;
  return msg;
});

function showPassword() {
  state.passwordType = state.passwordType === "password" ? "text" : "password";
}

const updatePassword = () => {
  emit("userPassword", state.password);
};
</script>

<template>
  <div class="password-setter box-shadow">
    <div class="input-with-button">
      <label for="new">Password</label>
      <input :type="state.passwordType" v-model="state.password" name="new" placeholder="Password" @change="updatePassword" required />
      <button @click="showPassword">{{ state.passwordType === "password" ? "Show Password" : "Hide Password" }}</button>
    </div>
    <label for="strength">
      Password Strength<span v-if="!isInitial">: </span>
      <span v-bind:class="{ initial: isInitial, short: isShort, weak: isWeak, fair: isFair, excellent: isExcellent }">{{ passwordStrength }}</span>
    </label>
    <div class="rg-bar">
      <div v-bind:class="{ highlight: true, initial: isInitial, bgShort: isShort, bgWeak: isWeak, bgFair: isFair, bgExcellent: isExcellent }"></div>
    </div>
    <p class="support-text">Your password must:</p>
    <ul class="support-text">
      <li v-bind:class="{ checked: hasUpperCase }">{{ hasUpperCase ? "✅" : "❌" }} Contain a capital letter</li>
      <li v-bind:class="{ checked: hasSpecialCharacter }">{{ hasSpecialCharacter ? "✅" : "❌" }} Contain a special character</li>
      <li v-bind:class="{ checked: hasLowerCase }">{{ hasLowerCase ? "✅" : "❌" }} Contain a lowercase letter</li>
      <li v-bind:class="{ checked: isMinLength }">{{ isMinLength ? "✅" : "❌" }} Must be at least 7 characters long</li>
      <li v-bind:class="{ checked: hasNumber }">{{ hasNumber ? "✅" : "❌" }} Must contain a number</li>
    </ul>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.input-with-button button {
  margin-left: 10px; /* Adjust the margin as needed for spacing */
}

.checked {
  color: limegreen;
}

.short {
  color: #ff4136;
}
.weak {
  color: orange;
}
.fair {
  color: deepskyblue;
}
.excellent {
  color: limegreen;
}

.rg-bar {
  background-color: lightgray;
  width: 100%;
  margin-top: 10px;
  height: 8px;
  border-radius: 2px;
  .highlight {
    height: 100%;
    transition: 0.5s;
    width: 5%;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    background-color: gray;
  }
  .bgShort {
    background-color: #ff4136;
    width: 15%;
  }
  .bgWeak {
    background-color: orange;
    width: 40%;
  }
  .bgFair {
    background-color: deepskyblue;
    width: 60%;
  }
  .bgExcellent {
    background-color: limegreen;
    width: 100%;
  }
}
</style>
