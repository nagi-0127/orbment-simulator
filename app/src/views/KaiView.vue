<template>
  <v-container fluid>
    <select-skill :skills="(skills as Skill[])" v-model:model-value="selectedSkills"></select-skill>
    <v-container fluid>
      <v-row>
        <v-col cols="2">
          <v-select :items="characters" item-title="name" v-model="selectedCharacter" density="compact" hide-details
            return-object></v-select>
        </v-col>
        <v-col>
          <v-btn @click="onSearchClick">Search</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-if="res !== null">
      <template v-for="result in res">
        <search-result :character="selectedCharacter" :skills="(skills as Skill[])" :result="result"></search-result>
      </template>
    </v-container>
    <v-container fluid v-else-if="res === null">
      <v-alert text="検索結果がありません" type="warning"></v-alert>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch  } from 'vue';

import characters from '@/assets/data/kai/characters.json'
import skills from '@/assets/data/kai/shard_skill.json'
import quarts from '@/assets/data/kai/quartz.json'

import SelectSkill from '@/components/SelectSkill.vue'
import SearchResult from '@/components/SearchResult.vue';

import { getZeroPoint, searchQuartzSet } from '@/util/searchLogic';

const selectedCharacter = ref<Character>(characters[0] as Character)
const selectedQuartz = ref<Quartz[]>(quarts as Quartz[])
const selectedSkills = ref<{ [key in Lines]: { requiredPoint: Point, selected: Skill[] } }>({
  WEAPON: { selected: [], requiredPoint: getZeroPoint() },
  SHIELD: { selected: [], requiredPoint: getZeroPoint() },
  DRIVE: { selected: [], requiredPoint: getZeroPoint() },
  EXTRA: { selected: [], requiredPoint: getZeroPoint() }
})

const res = ref<{ [key in Lines]?: (Quartz | null)[] }[] | null | undefined>(undefined)

watch(selectedCharacter, () => {
  // キャラ切り替えで検索結果クリア
  res.value = undefined
})
const onSearchClick = () => {
  const result = searchQuartzSet(selectedCharacter.value, selectedSkills.value, selectedQuartz.value, )
  res.value = result
}

</script>

<style scoped></style>