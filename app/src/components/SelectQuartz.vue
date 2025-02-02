<template>
  <v-container>
    <v-expansion-panels multiple v-model="expanded">
      <v-expansion-panel v-for="type in typeList" :key="type" :value="type">
        <v-expansion-panel-title>
          <template v-if="type == 'EARTH'">地</template>
          <template v-if="type == 'WATER'">水</template>
          <template v-if="type == 'FIRE'">火</template>
          <template v-if="type == 'WIND'">風</template>
          <template v-if="type == 'TIME'">時</template>
          <template v-if="type == 'SKY'">空</template>
          <template v-if="type == 'MIRAGE'">幻</template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <select-item :items="quartzList.filter(q => q.type == type)" title="" v-model:model-value="selected"></select-item>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup lang="ts" generic="T extends Quartz">
import { ref } from 'vue';
import SelectItem from './SelectItem.vue';
const { quartzList } = defineProps<{
  quartzList: T[]
}>()

const selected = defineModel<T[]>({
  default: []
})

const typeList: Types[] = ['EARTH', 'WATER', 'FIRE', 'WIND', 'TIME', 'SKY', 'MIRAGE']
const expanded = ref<Types[]>(['EARTH', 'WATER', 'FIRE', 'WIND', 'TIME', 'SKY', 'MIRAGE'])
</script>

<style scoped>

</style>