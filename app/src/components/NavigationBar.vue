<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-app-bar-title>{{ props.title }}</v-app-bar-title>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" :location="void (0)" temporary>
    <v-list>
      <v-list-item v-for="item in titles" :key="item.id" :title="item.name" :to="item.to"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import titles from '@/assets/data/titles.json'

const props = defineProps<{
  title: string
}>()

const drawer = ref<boolean>(false)
</script>

<style scoped></style>