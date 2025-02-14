<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-table class="border">
            <tr v-for="line in lines">
              <th class="border">{{ line }}</th>
              <td v-for="i in 4"
                :class="{ border: true, [`${props.character.orbment[line]?.[i - 1]?.type}`]: props.character.orbment[line]?.[i - 1]?.typeSpecified, none: !props.character.orbment[line]?.[i - 1] }">
                {{ props.result?.[line]?.[i - 1]?.name }}
              </td>
            </tr>
          </v-table>
        </v-col>
        <v-col cols="6">
          <p>発動スキル</p>
          <v-list v-model:opened="opened" density="compact">
            <v-list-group v-for="line in lines" :value="line" :key="line">
              <template v-slot:activator="{ props }">
                <v-list-item :title="line" v-bind="props"></v-list-item>
              </template>
              <v-list-item v-for="skill in activeSkills[line]" :title="skill.name" :subtitle="skill.description"
                :key="skill.id"></v-list-item>
            </v-list-group>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import '@/assets/searchresult.css'

import { pointAdd, getZeroPoint } from '@/util/searchLogic'

const props = defineProps<{
  character: Character,
  skills: Skill[],
  result: { [key in Lines]?: (Quartz | null)[] },
  isSearching?: boolean
}>()

const lines: Lines[] = ['WEAPON', 'SHIELD', 'DRIVE', 'EXTRA']
const opened = ref<Lines[]>([])
const activeSkills = computed<{ [key in Lines]?: (Skill)[] }>(() => {
  const result: { [key in Lines]?: (Skill)[] } = {}
  for (const key of Object.keys(props.result)) {
    let p = getZeroPoint()
    const resultQuartz = props.result[key as Lines]
    resultQuartz?.forEach(r => {
      p = pointAdd(p, r?.point ?? getZeroPoint())
    })
    const activeSkill = props.skills.filter(skill => skill.line === key).filter(skill => {
      return Object.keys(skill.point).reduce((prev, cur) => {
        return prev && (skill.point[cur as Types] <= p[cur as Types])
      }, true)
    })
    result[key as Lines] = activeSkill
  }
  return result
})

</script>

<style scoped></style>