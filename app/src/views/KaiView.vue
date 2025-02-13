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
    <v-container fluid>
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
    <template v-if="isProcessing">
      <v-skeleton-loader type="card"></v-skeleton-loader>
    </template>
    <template v-else>
      <v-container fluid v-if="res !== null">
        <template v-for="result in res">
          <search-result :character="selectedCharacter" :skills="(skills as Skill[])" :result="result"></search-result>
        </template>
      </v-container>
      <v-container fluid v-else-if="res === null">
        <v-alert text="検索結果がありません" type="warning"></v-alert>
      </v-container>
    </template>
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

import { getZeroPoint, searchQuartzSet } from '@/util/searchLogic';

const tab = ref(null)

const selectedCharacter = shallowRef<Character>(characters[0] as Character)
const selectedQuartz = shallowRef<Quartz[]>([...quarts] as Quartz[])
const selectedSkills = shallowRef<{ [key in Lines]: { requiredPoint: Point, selected: Skill[] } }>({
  WEAPON: { selected: [], requiredPoint: getZeroPoint() },
  SHIELD: { selected: [], requiredPoint: getZeroPoint() },
  DRIVE: { selected: [], requiredPoint: getZeroPoint() },
  EXTRA: { selected: [], requiredPoint: getZeroPoint() }
})

const res = ref<{ [key in Lines]?: (Quartz | null)[] }[] | null | undefined>(undefined)
const isProcessing = ref<boolean>(false)

watch(selectedCharacter, () => {
  // キャラ切り替えで検索結果クリア
  res.value = undefined
})

const onSearchClick = () => {
  const result = searchQuartzSet({ ...selectedCharacter.value }, {...selectedSkills.value}, [...selectedQuartz.value], 1)
  console.log(result)
  result.then(result => {
    res.value = result
  }).finally(() => { isProcessing.value = false })
}

</script>

<style scoped></style>