<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { UserDoc } from "@/utils/interfaces";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const props = defineProps(["activity"]);
const emit = defineEmits(["joinActivity", "refreshActivities"]);
const { currentUsername } = storeToRefs(useUserStore());

const showInput = ref("");
const join_code = ref("");

const joinActivity = async () => {
  try {
    await fetchy(`api/activities/join/${props.activity.name}`, "PATCH", { body: { name: props.activity.name, join_code: join_code.value } });
  } catch {
    return;
  }
  emit("refreshActivities");
};

function isMember() {
  const usernames = props.activity.members.map((member: UserDoc) => member.username);
  console.log(usernames.includes(currentUsername.value));
  return usernames.includes(currentUsername.value);
}

function showInputFunc() {
  showInput.value = "PRESSED";
}
</script>

<template>
  <div class="base">
    <menu v-if="!isMember()">
      <li v-if="!showInput"><button class="btn-small pure-button" @click="showInputFunc()">Join Activity</button></li>
      <li v-if="showInput"><input v-model.trim="join_code" type="password" placeholder="Join Code" /></li>
      <li v-if="showInput"><button class="btn-small pure-button" @click="joinActivity">Submit</button></li>
    </menu>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.name {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
