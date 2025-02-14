<template>
  <v-container fluid>
    <v-tabs v-model="tab" align-tabs="start" color="secondary">
      <v-tab :value="1">スキル選択</v-tab>
      <v-tab :value="2">クオーツ</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="1">
        <select-skill :skills="(skills as Skill[])" v-model:model-value="selectedSkills"></select-skill>
      </v-tabs-window-item>
      <v-tabs-window-item :value="2">
        <select-quartz :quartz-list="(quarts as Quartz[])" v-model:model-value="selectedQuartz"></select-quartz>
      </v-tabs-window-item>
    </v-tabs-window>
    <v-container>
      <v-row>
        <v-col cols="2">
          <v-select :items="characters" item-title="name" v-model="selectedCharacter" density="compact" hide-details
            return-object></v-select>
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
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';

import characters from '@/assets/data/kai/characters.json'
import skills from '@/assets/data/kai/shard_skill.json'
import quarts from '@/assets/data/kai/quartz.json'

import SelectSkill from '@/components/SelectSkill.vue'
import SelectQuartz from '@/components/SelectQuartz.vue';
import SearchResult from '@/components/SearchResult.vue';

import { getZeroPoint, searchQuartz } from '@/util/searchLogic';

const tab = ref(null)

const selectedCharacter = shallowRef<Character>(characters[0] as Character)
// const selectedQuartz = shallowRef<Quartz[]>([])
const selectedQuartz = shallowRef<Quartz[]>([...quarts] as Quartz[])
const selectedSkills = shallowRef<{ [key in Lines]: { requiredPoint: Point, selected: Skill[] } }>({
  WEAPON: { selected: [], requiredPoint: getZeroPoint() },
  SHIELD: { selected: [], requiredPoint: getZeroPoint() },
  DRIVE: { selected: [], requiredPoint: getZeroPoint() },
  EXTRA: { selected: [], requiredPoint: getZeroPoint() }
})

const res = ref<{ [key in Lines]?: ( Quartz[] | null)[] }[] | null | undefined>(undefined)
const isProcessing = ref<boolean>(false)

watch(selectedCharacter, () => {
  // キャラ切り替えで検索結果クリア
  res.value = undefined
})

const onSearchClick = () => {
  isProcessing.value = true;
  res.value = [];
  const reader = searchQuartz({ ...selectedCharacter.value }, { ...selectedSkills.value }, [...selectedQuartz.value], 5).getReader()
  reader.read()
    .then(function readResult({ done, value }) {
      if (done) {
        if (res.value?.length === 0) {
          res.value = null
        }
        isProcessing.value = false;
        return
      }
      console.log(value)
      if (!res.value) {
        res.value = [value]
      } else {
        res.value.push(value)
      }
      reader.read().then(readResult)
    })
}

</script>

<style scoped></style>