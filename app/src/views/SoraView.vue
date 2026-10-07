<template>
  <div>
    {{ props.characters }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  quartz: BaseSkillQuarz[];
  arts: BaseSkillQuarz[];
  characters: Character[];
}>();
</script>

<style scoped>

</style>