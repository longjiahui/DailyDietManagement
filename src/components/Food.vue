<script setup lang="ts">
import type { Food } from "../App.vue";

defineProps<{
  food?: Food;
}>();
</script>
<template>
  <ATooltip overlay-class-name="pointer-events-none">
    <template #title>
      <div class="flex flex-col gap-1">
        <div>carbohydrate {{ food?.carbohydrate }}</div>
        <div>protein {{ food?.protein }}</div>
        <div>fat {{ food?.fat }}</div>
      </div>
    </template>
    <div
      class="flex items-end gap-1 bg-blue-500 text-white rounded px-1 text-sm"
    >
      <div>
        {{ food?.name || "unknown" }}
      </div>
      <div class="text-xs">/{{ food?.per ?? 100 }}</div>
    </div>
  </ATooltip>
</template>
