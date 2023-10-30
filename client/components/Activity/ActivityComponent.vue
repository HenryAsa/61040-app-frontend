<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { UserDoc } from "@/utils/interfaces";
import JoinActivity from "@/components/Activity/JoinActivity.vue";
import LeaveActivity from "@/components/Activity/LeaveActivity.vue";
import MiniUserView from "@/components/User/MiniUserView.vue";
import PromoteToManager from "@/components/Activity/PromoteToManager.vue";

const props = defineProps(["activity"]);
const emit = defineEmits(["editActivity", "refreshActivities"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteActivity = async () => {
  try {
    await fetchy(`api/activities/${props.activity._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshActivities");
};

const someUpdate = async () => {
  emit("refreshActivities");
};

function isMember() {
  const usernames = props.activity.members.map((member: UserDoc) => member.username);
  console.log(usernames.includes(currentUsername.value));
  return usernames.includes(currentUsername.value);
}

function isManager() {
  const usernames = props.activity.managers.map((manager: UserDoc) => manager.username);
  console.log(usernames.includes(currentUsername.value));
  return usernames.includes(currentUsername.value);
}
</script>

<template>
  <p class="name">{{ props.activity.name.toString() }}</p>
  <!-- <p>{{ props.activity.members.map((member) => member) }}</p> -->
  <div class="base">
    <div class="members-section">
      <p class="heading">Members</p>
      <p v-if="!isMember()">To see the members of this</p>
      <p v-if="!isMember()">activity, you must join it!</p>
      <article class="members" v-for="member in props.activity.members" :key="member">
        <MiniUserView v-if="isMember()" :user="member" @refreshActivities="someUpdate" />
      </article>
    </div>
    <div class="members-section">
      <p class="heading">Managers</p>
      <article class="members" v-for="manager in props.activity.managers" :key="manager">
        <MiniUserView :user="manager" @refreshActivities="someUpdate" />
      </article>
    </div>
    <!-- <article class="timestamp">
      <p v-if="props.activity.dateCreated !== props.activity.dateUpdated">Edited on: {{ formatDate(props.activity.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.activity.dateCreated) }}</p>
    </article> -->
    <menu class="right-menu">
      <!-- <li><button class="btn-small pure-button" @click="emit('editActivity', props.activity._id)">Edit</button></li> -->
      <li v-if="isMember()"><LeaveActivity :activity="props.activity" @refresh-activities="someUpdate" /></li>
      <li v-if="!isMember()"><JoinActivity :activity="props.activity" @refreshActivities="someUpdate" /></li>
      <li v-if="isManager()"><PromoteToManager :activity="props.activity" @refresh-activities="someUpdate" /></li>
      <li v-if="isManager()"><button class="button-error btn-small pure-button" @click="deleteActivity">Delete</button></li>
    </menu>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.name {
  font-weight: bold;
  font-size: 1.5em;
}

.heading {
  font-weight: bold;
  font-size: 1.2em;
  padding-bottom: 0.5em;
}

.members-section {
  padding: 0.5em;
  border-radius: 16px;
  border: 3px solid;
}

.members {
  display: flex;
  flex-direction: row;
  padding: 0.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: column;
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

.right-menu {
  align-items: end;
}

.base article:only-child {
  margin-left: auto;
}
</style>
