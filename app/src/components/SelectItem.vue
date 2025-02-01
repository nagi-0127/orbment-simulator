<template>
  <v-container class="d-flex">
    <v-row no-gutters>
      <v-col cols="2" v-for="item in items" :key="item.id">
        <v-checkbox v-model="selected" :label="item.name" :value="item" density="compact" :hide-details="true" color="secondary">
          <v-tooltip :text="item.description" activator="parent">
          </v-tooltip>
        </v-checkbox>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts" generic="T extends BaseSkillQuarz">
const { title, items } = defineProps<{
  title: string;
  items: T[];
}>()

const selected = defineModel<T[]>({ default:  []})

</script>

<style scoped></style>