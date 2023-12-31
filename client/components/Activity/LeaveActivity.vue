<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { UserDoc } from "@/utils/interfaces";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const props = defineProps(["activity"]);
const emit = defineEmits(["leaveActivity", "refreshActivities"]);
const { currentUsername } = storeToRefs(useUserStore());

const showInput = ref("");
const user_to_promote = ref("");

const leaveActivity = async () => {
  try {
    await fetchy(`/api/activities/leave/${props.activity.name}`, "PATCH", { body: { activity_name: props.activity.name } });
  } catch {
    return;
  }
  emit("refreshActivities");
  showInputFunc("");
};

function isMember() {
  const usernames = props.activity.members.map((member: UserDoc) => member.username);
  return usernames.includes(currentUsername.value);
}

function isManager() {
  const usernames = props.activity.managers.map((manager: UserDoc) => manager.username);
  return usernames.includes(currentUsername.value);
}

function showInputFunc(text: string) {
  showInput.value = text;
}
</script>

<template>
  <div class="base">
    <menu v-if="isMember()">
      <li v-if="!showInput"><button class="btn-small pure-button" @click="showInputFunc('PRESSED')">Leave This Activity</button></li>
      <!-- <li v-if="showInput"><input v-model.trim="user_to_promote" type="text" placeholder="Member's Username" /></li> -->
      <li v-if="showInput"><button class="button-error btn-small pure-button" @click="leaveActivity">Are you sure?</button></li>
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
