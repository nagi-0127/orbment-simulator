<script setup lang="ts">
import { ref, shallowRef, watch, watchEffect } from 'vue';
import SelectQuartz from '@/components/SelectQuartz.vue';

const props = defineProps<{
  quartz: QuartzSora[];
  arts: BaseQuarz[];
  characters: CharacterSora[];
}>();

const selectedQuartz = shallowRef<QuartzSora[]>([...props.quartz] as QuartzSora[])
const selectedArts = shallowRef<BaseQuarz[]>([] as BaseQuarz[])
const tab = ref(null)

</script>

<template>
  <v-container fluid>
    <v-tabs v-model="tab" align-tabs="start" color="secondary">
      <v-tab :value="1">アーツ選択</v-tab>
      <v-tab :value="2">クオーツ</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="1">
        <select-quartz :quartz-list="(arts as BaseQuarz[])" v-model:model-value="selectedArts"></select-quartz>
      </v-tabs-window-item>
      <v-tabs-window-item :value="2">
        <select-quartz :quartz-list="(quartz)" v-model:model-value="selectedQuartz"></select-quartz>
      </v-tabs-window-item>
    </v-tabs-window>
    <!-- <v-container>
      <v-row>
        <v-col cols="2">
          <v-select :items="characters" item-title="name" v-model="selectedCharacter" density="compact" hide-details
            return-object></v-select>
        </v-col>
        <v-col cols="3">
          <v-select label="必須クオーツ" :items="selectedQuartz" v-model:model-value="requiredQuartz"
            :item-props="(item => { return { title: item.name, subtitle: item.description } })" density="compact"
            hide-details multiple></v-select>
        </v-col>
        <v-col>
          <v-btn @click="() => onSearchClick()" :disabled="isProcessing">Search</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="res !== null">
      <v-row dense>
        <v-col v-for="result in res" cols="12">
          <search-result :character="selectedCharacter" :skills="(skills as Skill[])" :result="result"
            :is-searching="isProcessing"></search-result>
        </v-col>
        <v-col cols="12">
          <v-skeleton-loader v-if="isProcessing" type="card"></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-else-if="res === null">
      <v-alert text="検索結果がありません" type="warning"></v-alert>
    </v-container> -->
  </v-container>
</template>
<style scoped></style>