<script lang="ts">
export interface Food {
  id: string;
  name: string;
  protein: number;
  fat: number;
  carbohydrate: number;
  per?: number; // default per100g
}
export interface FoodItem {
  id: string;
  type: "predefined" | "custom";
  amount: number;

  foodId?: string;
  food?: Food;
}

interface Meal {
  id: string;
  name: string;
  foods: FoodItem[];
  time?: Dayjs;
  isFinished?: boolean; // 是否已经吃了
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs, { Dayjs } from "dayjs";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons-vue";
import Food from "./components/Food.vue";
import { shortid } from "./util";
import defualtFoods from "./foods";
import { useLocalStorage } from "@vueuse/core";

const currentDate = ref<Dayjs>(dayjs());

const foods = ref<Food[]>(defualtFoods);
const meals = useLocalStorage<Meal[]>(
  computed(() => currentDate.value.format("YYYY-MM-DD") + "meals"),
  []
);

// createmealdialog
const createMealModalVisible = ref(false);
const mealModalData = ref<Partial<Meal & { foods?: Partial<FoodItem>[] }>>({});

watch(
  createMealModalVisible,
  (val) => {
    if (!val) {
      mealModalData.value = {
        foods: [],
      };
    }
  },
  { deep: true }
);
watch(
  mealModalData,
  () => {
    if (!mealModalData.value.id) {
      // edit
      mealModalData.value.foods = mealModalData.value.foods ?? [];
    }
    if (!mealModalData.value.foods) {
      mealModalData.value.foods = [];
    }
    if (mealModalData.value.foods.length === 0) {
      mealModalData.value.foods.push({
        id: shortid(),
        food: {
          carbohydrate: 0,
          fat: 0,
          protein: 0,
          id: shortid(),
          name: "",
        },
      });
    }
    if (mealModalData.value.foods[mealModalData.value.foods.length - 1].type) {
      mealModalData.value.foods.push({
        id: shortid(),
        food: {
          carbohydrate: 0,
          fat: 0,
          protein: 0,
          id: shortid(),
          name: "",
        },
      });
    }
  },
  { deep: true, immediate: true }
);

function handleOK() {
  const d = JSON.parse(
    JSON.stringify(mealModalData.value)
  ) as typeof mealModalData.value;
  d.foods = d.foods?.filter(
    (f) =>
      f.id &&
      f.type &&
      f.amount &&
      ((f.type === "predefined" &&
        foods.value.find((ff) => ff.id === f.foodId)) ||
        (f.type === "custom" && f.food?.id))
  );
  if (d.id) {
    const ind = meals.value.findIndex((m) => m.id === d.id);
    if (ind > -1) {
      meals.value[ind] = d as Meal;
    }
  } else {
    meals.value.push(d as Meal);
  }
  if (!d.id) {
    d.id = shortid();
  }
  createMealModalVisible.value = false;
}

function getFinalFoods(meal: Meal) {
  return meal.foods.map((f) => {
    if (f.type === "predefined") {
      return {
        ...foods.value.find((ff) => ff.id === f.foodId),
        amount: f.amount,
      };
    } else {
      return { ...f.food, amount: f.amount };
    }
  });
}
function totalCarbohydrate(meal: Meal) {
  const finalFoods = getFinalFoods(meal);
  return finalFoods.reduce(
    (t, f) => t + ((f?.carbohydrate || 0) * f.amount) / (f.per || 100),
    0
  );
}
function totalProtein(meal: Meal) {
  const finalFoods = getFinalFoods(meal);
  return finalFoods.reduce(
    (t, f) => t + ((f?.protein || 0) * f.amount) / (f.per || 100),
    0
  );
}
function totalFat(meal: Meal) {
  const finalFoods = getFinalFoods(meal);
  return finalFoods.reduce(
    (t, f) => t + ((f?.fat || 0) * f.amount) / (f.per || 100),
    0
  );
}

const maxNutritionStructure = {
  carbohydrate: 183,
  protein: 116,
  fat: 49,
};
function getFinishedMeals() {
  return meals.value.filter((m) => !!m.time);
}
const finishedTotalCarbohydrate = computed(() =>
  getFinishedMeals().reduce((t, m) => t + totalCarbohydrate(m), 0)
);
const finishedTotalProtein = computed(() =>
  getFinishedMeals().reduce((t, m) => t + totalProtein(m), 0)
);
const finishedTotalFat = computed(() =>
  getFinishedMeals().reduce((t, m) => t + totalFat(m), 0)
);
const planTotalCarbohydrate = computed(() =>
  meals.value.reduce((t, m) => t + totalCarbohydrate(m), 0)
);
const planTotalProtein = computed(() =>
  meals.value.reduce((t, m) => t + totalProtein(m), 0)
);
const planTotalFat = computed(() =>
  meals.value.reduce((t, m) => t + totalFat(m), 0)
);
</script>
<template>
  <div class="size-full flex flex-col gap-10 p-4 max-w-[800px] mx-auto">
    <ADatePicker
      class="w-[200px] font-bold"
      v-model:value="currentDate"
    ></ADatePicker>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <div
          v-for="d in [
            {
              name: 'Carbohydrate',
              finished: finishedTotalCarbohydrate,
              planed: planTotalCarbohydrate,
              total: maxNutritionStructure.carbohydrate,
            },
            {
              name: 'Protein',
              finished: finishedTotalProtein,
              planed: planTotalProtein,
              total: maxNutritionStructure.protein,
            },
            {
              name: 'Fat',
              finished: finishedTotalFat,
              planed: planTotalFat,
              total: maxNutritionStructure.fat,
            },
          ]"
          class="flex items-center gap-2 [&>div:first-child]:w-[100px]"
        >
          <div>{{ d.name }}</div>
          <div
            class="bg-[#efefef] h-3 rounded stretch relative overflow-hidden"
          >
            <ATooltip
              :title="'已摄入量: ' + d.finished"
              overlay-class-name="pointer-events-none"
            >
              <div
                class="z-10 absolute top-0 left-0 h-full bg-blue-500 rounded hover:bg-emerald-500 duration-300 cursor-pointer"
                :style="{
                  width: (d.finished / d.total) * 100 + '%',
                }"
              ></div>
            </ATooltip>
            <ATooltip
              :title="'计划的摄入量: ' + d.planed"
              overlay-class-name="pointer-events-none"
            >
              <div
                class="z-0 absolute top-0 left-0 h-full bg-blue-200 rounded hover:bg-yellow-300 duration-300 cursor-pointer"
                :style="{
                  width: (d.planed / d.total) * 100 + '%',
                }"
              ></div>
            </ATooltip>
          </div>
          <div class="w-[160px] text-sm font-semibold">
            {{ d.finished }} /
            <span class="text-gray-400 text-xs">
              {{ d.total }}
            </span>
            <span class="ml-2 bg-gray-100 text-xs rounded px-2"
              >- {{ d.total - d.finished }}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <div class="font-semibold flex items-center gap-2">
        <div class="w-1 h-full bg-black rounded"></div>
        <div>Meals</div>
        <PlusCircleOutlined
          class="cursor-pointer hover:opacity-75"
          @click="createMealModalVisible = true"
        />
      </div>
      <div class="flex flex-col gap-4">
        <div
          v-for="(m, i) in meals.sort(
            (a, b) => (a.time ? 0 : 1) - (b.time ? 0 : 1)
          )"
          :class="[
            'bg-[#f3f3f3] flex flex-col gap-2 rounded p-3 hover:translate-x-2 duration-300',
            !!m.time ? 'opacity-35' : '',
          ]"
        >
          <div class="flex items-center gap-2 cursor-pointer">
            <ACheckbox
              :checked="!!m.time"
              @update:checked="
                (val: boolean) => {
                  if (val) {
                    m.time = dayjs();
                  }else{
                    m.time = undefined;
                  }
                }
              "
            >
            </ACheckbox>
            <EditOutlined
              @click="
                () => {
                  mealModalData = {
                    ...JSON.parse(JSON.stringify({ ...m, time: undefined })),
                    time: m.time ? dayjs(m.time) : undefined,
                  };
                  createMealModalVisible = true;
                }
              "
            />
            <APopconfirm @confirm="meals.splice(i, 1)">
              <DeleteOutlined />
            </APopconfirm>
          </div>
          <div class="flex items-center gap-2">
            <div>time</div>
            <div v-if="m.time">{{ dayjs(m.time).format("HH:mm:ss") }}</div>
            <div v-else class="text-gray-500">未完成</div>
          </div>
          <div class="font-semibold">foods</div>
          <div class="flex items-center gap-4">
            <div v-for="f in m.foods" class="flex items-end gap-1">
              <Food
                :food="
                  f.type === 'custom'
                    ? f.food
                    : foods.find((ff) => ff.id === f.foodId)
                "
              />
              <div class="font-semibold text-sm">x{{ f.amount }}</div>
            </div>
          </div>
          <div class="flex flex-col gap-2 text-sm">
            <div>
              Carbohydrate Total:
              <span class="font-semibold">{{ totalCarbohydrate(m) }}</span>
            </div>
            <div>
              Protein Total:
              <span class="font-semibold">{{ totalProtein(m) }}</span>
            </div>
            <div>
              Fat Total: <span class="font-semibold">{{ totalFat(m) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AModal
      @ok="handleOK"
      v-model:open="createMealModalVisible"
      title="编辑Meal"
    >
      <div class="flex flex-col gap-4">
        <div class="font-semibold">Foods</div>
        <div class="flex flex-col gap-2">
          <div
            v-for="d in mealModalData.foods"
            :key="d.id"
            class="flex flex-col gap-2 bg-[#efefef] p-2 rounded"
          >
            <ASelect class="w-[120px]" v-model:value="d.type">
              <ASelectOption value="predefined">Predefined</ASelectOption>
              <ASelectOption value="custom">Custom</ASelectOption>
            </ASelect>
            <ASelect
              v-if="d.type === 'predefined'"
              class="w-[200px]"
              v-model:value="d.foodId"
            >
              <ASelectOption v-for="f in foods" :value="f.id">{{
                f.name
              }}</ASelectOption>
            </ASelect>
            <div>Amount</div>
            <AInput v-model:value="d.amount"></AInput>
            <template v-if="d.type === 'custom'">
              <div>
                <div>name</div>
                <AInput v-model:value="d.food!.name"></AInput>
              </div>
              <div>
                <div>Carbohydrate</div>
                <AInput v-model:value="d.food!.carbohydrate"></AInput>
              </div>
              <div>
                <div>Protein</div>
                <AInput v-model:value="d.food!.protein"></AInput>
              </div>
              <div>
                <div>Fat</div>
                <AInput v-model:value="d.food!.fat"></AInput>
              </div>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div>完成时间</div>
            <span
              @click="mealModalData.time = dayjs()"
              class="cursor-pointer text-blue-500"
              >设置成现在</span
            >
            <span
              v-if="mealModalData.time"
              @click="mealModalData.time = undefined"
              class="cursor-pointer text-blue-500"
              >设置为未完成</span
            >
          </div>
          <ATimePicker v-model:value="mealModalData.time"></ATimePicker>
        </div>
      </div>
    </AModal>
  </div>
</template>

<style scoped></style>
