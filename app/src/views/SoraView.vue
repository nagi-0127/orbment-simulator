<template>
  <div>
    {{ props.characters }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  quartz: QuartzSora[];
  arts: BaseSkillQuarz[];
  characters: CharacterSora[];
}>();
</script>

<style scoped>

</style>