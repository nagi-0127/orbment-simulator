<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import '@/assets/searchresult.css'

type Result = (SlotSora & {
  quartz: QuartzSora | null;
})

const props = defineProps<{
  character: CharacterSora,
  arts: BaseQuarz[],
  result: Result[],
}>();

/**ライン数 */
const numLines: ComputedRef<number> = computed(() => {
  return Math.max(...props.character.slots.map(slot => slot.line))
})

// 検索結果をラインごとに分割
const lineResult: ComputedRef<Result[][]> = computed(() => {
  const res: Result[][] = []
  for (let i = 1; i <= numLines.value; i++) {
    const slots = props.character.slots.filter(slot => slot.line === i).sort((a, b) => a.no - b.no)
    res.push(slots.map(slot => {
      const resultItem = props.result.find(r => r.line === slot.line && r.no === slot.no)
      return {
        ...slot,
        quartz: resultItem?.quartz ?? null
      }
    }))
  }
  return res
})

// 共通スロットの結果取得
const sharedSlotResult: ComputedRef<Result | null> = computed(() => {
  const slot = props.character.slots.find(slot => slot.line === 0 && slot.no === 0)
  if (!slot) return null;
  return {
    ...slot,
    quartz: props.result.find(r => r.line === slot.line && r.no === slot.no)?.quartz ?? null
  }
})

/**ラインごとの最大スロット数 */
const maxLineSlots: ComputedRef<number> = computed(() => {
  return Math.max(...props.character.slots.map(slot => slot.no))
})

</script>
<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <v-table class="border">
            <thead>
              <tr>
                <th>LINE</th>
                <th>共通</th>
                <th v-for="i in maxLineSlots" :key="i">{{ i }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in numLines">
                <th>LINE {{ line }}</th>
                <td v-if="line == 1" :rowspan="numLines" :class="{border: true, [`${sharedSlotResult?.type ?? ''}`]: Boolean(sharedSlotResult?.type)}">
                  {{ sharedSlotResult?.quartz?.name ?? '-' }}
                </td>
                <td v-for="value in lineResult[line - 1]" :class="{ border: true, [`${value.type}`]: Boolean(value.type) }">
                  {{ value.quartz?.name ?? '-' }}
                </td>
                <!-- <td v-for="i in maxLineSlots"
                  :class="{ border: true, [`${props.character.orbment[line]?.[i - 1]?.type}`]: props.character.orbment[line]?.[i - 1]?.typeSpecified, none: !props.character.orbment[line]?.[i - 1] }">
                  {{ props.result?.[line]?.[i - 1]?.name }}
                </td> -->
              </tr>
            </tbody>
          </v-table>
        </v-col>
        <!-- <v-col cols="6">
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
</v-col> -->
      </v-row>
    </v-card-text>
  </v-card>
</template>
<style scoped></style>