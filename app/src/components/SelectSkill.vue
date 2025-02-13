<template>
  <v-container>
    <v-expansion-panels multiple v-model="expanded">
      <v-expansion-panel v-for="line in lines" :key="line" :value="line">
        <v-expansion-panel-title>
          {{ line }}
          <template v-if="line == 'WEAPON'">{{ getPointString(getMaximumPoint(selectedWeapon)) }}</template>
          <template v-if="line == 'SHIELD'">{{ getPointString(getMaximumPoint(selectedShield)) }}</template>
          <template v-if="line == 'DRIVE'">{{ getPointString(getMaximumPoint(selectedDrive)) }}</template>
          <template v-if="line == 'EXTRA'">{{ getPointString(getMaximumPoint(selectedExtra)) }}</template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <select-item v-if="line == 'WEAPON'" :items="line_skills[line]" title=""
            v-model:="selectedWeapon"></select-item>
          <select-item v-if="line == 'SHIELD'" :items="line_skills[line]" title=""
            v-model:="selectedShield"></select-item>
          <select-item v-if="line == 'DRIVE'" :items="line_skills[line]" title=""
            v-model:="selectedDrive"></select-item>
          <select-item v-if="line == 'EXTRA'" :items="line_skills[line]" title=""
            v-model:="selectedExtra"></select-item>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup lang="ts" generic="T extends Skill">
import { computed, ref, watchEffect } from 'vue';
import type { Ref } from 'vue';

import { getMaximumPoint, getPointString } from '@/util/searchLogic';
import SelectItem from './SelectItem.vue';

const { skills } = defineProps<{
  skills: T[]
}>()
const lines: Lines[] = ['WEAPON', 'SHIELD', 'DRIVE', 'EXTRA']
const expanded = ref<Lines[]>(['WEAPON', 'SHIELD', 'DRIVE', 'EXTRA'])
const line_skills = computed<{ [key in Lines]: T[] }>(
  () => {
    const ret: { [key in Lines]?: T[] } = {}
    lines.forEach(line => {
      ret[line] = skills.filter((skill) => {
        return skill.line === line
      }).sort((a, b) => a.id < b.id ? 1 : 0)
    })
    return ret as { [key in Lines]: T[] }
  }
) as Ref

const selected = defineModel<{ [key in Lines]: { requiredPoint: Point, selected: T[] } }>({
  default: {}
})
const selectedWeapon = ref<T[]>(selected.value['WEAPON']?.selected ?? [])
watchEffect(() => {
  selected.value['WEAPON'] = { selected: [...selectedWeapon.value] as T[], requiredPoint: getMaximumPoint([...selectedWeapon.value]) }
})
const selectedShield = ref<T[]>(selected.value['SHIELD']?.selected ?? [])
watchEffect(() => {
  selected.value['SHIELD'] = { selected: [...selectedShield.value] as T[], requiredPoint: getMaximumPoint([...selectedShield.value]) }
})
const selectedDrive = ref<T[]>(selected.value['DRIVE']?.selected ?? [])
watchEffect(() => {
  selected.value['DRIVE'] = { selected: [...selectedDrive.value] as T[], requiredPoint: getMaximumPoint([...selectedDrive.value]) }
})
const selectedExtra = ref<T[]>(selected.value['EXTRA']?.selected ?? [])
watchEffect(() => {
  selected.value['EXTRA'] = { selected: [...selectedExtra.value] as T[], requiredPoint: getMaximumPoint([...selectedExtra.value]) }
})

</script>

<style scoped></style>