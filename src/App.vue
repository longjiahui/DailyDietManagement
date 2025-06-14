<script lang="ts">
export interface Food {
  id: string;
  name: string;
  protein: number;
  fat: number;
  carbohydrate: number;
  per?: number; // default per100g
  /**
   * 总结关系公式：
    1大卡 = 1千卡
    1千卡 = 4.184千焦
    1千焦 ≈ 0.239千卡
    例如：

    如果一个食物标注热量为500千卡，相当于500大卡或约2092千焦（500×4.184）
    反之，1000千焦的热量约等于239千卡（或大卡）
   */
  calories: number; // 千卡
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
  SettingOutlined,
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

const modifyMaxValueModalVisible = ref(false);
const modifyMaxValueModalData = ref({
  carbohydrate: 0,
  protein: 0,
  fat: 0,
  calories: 0,
});
watch(modifyMaxValueModalVisible, (val) => {
  if (val) {
    modifyMaxValueModalData.value = {
      carbohydrate: maxNutritionStructure.value.carbohydrate,
      protein: maxNutritionStructure.value.protein,
      fat: maxNutritionStructure.value.fat,
      calories: maxNutritionStructure.value.calories,
    };
  }
});

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
        type: "predefined",
        food: {
          calories: 0,
          carbohydrate: 0,
          fat: 0,
          protein: 0,
          id: shortid(),
          name: "",
        },
      });
    }
    const last =
      mealModalData.value.foods[mealModalData.value.foods.length - 1];
    if (
      last.amount ||
      (last.type === "predefined" && last.foodId) ||
      (last.type === "custom" && last.food?.name)
    ) {
      mealModalData.value.foods.push({
        id: shortid(),
        type: "predefined",
        food: {
          calories: 0,
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
function totalCalories(meal: Meal) {
  const finalFoods = getFinalFoods(meal);
  return finalFoods.reduce(
    (t, f) => t + ((f?.calories || 0) * f.amount) / (f.per || 100),
    0
  );
}

const defaultMaxNutritionStructure = {
  carbohydrate: 183,
  protein: 116,
  fat: 49,
  calories: 2248,
};
const maxNutritionStructure = useLocalStorage(
  computed(() => `${currentDate.value.format("YYYY-MM-DD")}max`),
  { ...defaultMaxNutritionStructure }
);
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
const finishedTotalCalories = computed(() =>
  getFinishedMeals().reduce((t, m) => t + totalCalories(m), 0)
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
const planTotalCalories = computed(() =>
  meals.value.reduce((t, m) => t + totalCalories(m), 0)
);
</script>
<template>
  <div class="size-full flex flex-col gap-10 p-4 max-w-[800px] mx-auto">
    <ADatePicker
      class="w-[200px] font-bold"
      v-model:value="currentDate"
    ></ADatePicker>
    <div
      @click="modifyMaxValueModalVisible = true"
      class="cursor-pointer flex items-center gap-2"
    >
      <SettingOutlined />
      <div class="text-sm">修改今日最大值</div>
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <div
          v-for="d in [
            {
              name: 'Carbohydrate' as const,
              finished: finishedTotalCarbohydrate,
              planed: planTotalCarbohydrate,
              total: maxNutritionStructure.carbohydrate,
            },
            {
              name: 'Protein' as const,
              finished: finishedTotalProtein,
              planed: planTotalProtein,
              total: maxNutritionStructure.protein,
            },
            {
              name: 'Fat' as const,
              finished: finishedTotalFat,
              planed: planTotalFat,
              total: maxNutritionStructure.fat,
            },
            {
              name: 'Calories' as const,
              finished: finishedTotalCalories,
              planed: planTotalCalories,
              total: maxNutritionStructure.calories,
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
          <div class="w-[240px] text-sm flex gap-2">
            <span>{{ ((d.finished / d.total) * 100).toFixed(2) }}%</span>
            <span
              :class="[
                ' font-semibold ',
                Math.abs(d.total - d.finished) >
                {
                  Carbohydrate: 15,
                  Protein: 10,
                  Fat: 15,
                  Calories: 100,
                }[d.name]
                  ? 'text-amber-500'
                  : '',
              ]"
            >
              {{ d.finished.toFixed(2) }}
            </span>
            /
            <span class="text-gray-400 text-xs">
              {{ d.total.toFixed(2) }}
            </span>
            <span class="ml-2 bg-gray-100 text-xs rounded px-2">{{
              (d.total - d.finished).toFixed(2)
            }}</span>
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
            'bg-[#f3f3f3] flex flex-col gap-2 rounded p-3 outline outline-transparent hover:outline-[#d3d3d3] duration-300',
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
              <span class="font-semibold">{{
                totalCarbohydrate(m).toFixed(2)
              }}</span>
            </div>
            <div>
              Protein Total:
              <span class="font-semibold">{{
                totalProtein(m).toFixed(2)
              }}</span>
            </div>
            <div>
              Fat Total:
              <span class="font-semibold">{{ totalFat(m).toFixed(2) }}</span>
            </div>
            <div>
              Calories Total:
              <span class="font-semibold">{{
                totalCalories(m).toFixed(2)
              }}</span>
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
            v-for="(d, i) in mealModalData.foods"
            :key="d.id"
            class="flex flex-col gap-2 bg-[#efefef] p-2 rounded"
          >
            <div
              class="flex items-center justify-end gap-2"
              v-if="(mealModalData.foods?.length || 0) - 1 !== i"
            >
              <APopconfirm @confirm="mealModalData.foods?.splice(i, 1)">
                <DeleteOutlined />
              </APopconfirm>
            </div>
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
    <AModal
      @ok="
        () => {
          ;(['protein', 'carbohydrate', 'fat', 'calories'] as const satisfies (keyof typeof defaultMaxNutritionStructure)[]).forEach((k)=>{
            modifyMaxValueModalData[k] = isNaN(
                +modifyMaxValueModalData[k]
              ) || +modifyMaxValueModalData[k] <= 0
                ? defaultMaxNutritionStructure[k]
                : +modifyMaxValueModalData[k];
          })
          maxNutritionStructure = modifyMaxValueModalData;
          modifyMaxValueModalVisible = false;
        }
      "
      v-model:open="modifyMaxValueModalVisible"
      title="编辑最大值"
    >
      <div class="flex flex-col gap-4 [&>div>div:first-child]:w-[200px]">
        <div class="flex items-center gap-2">
          <div>Carbohydrate</div>
          <AInput
            v-model:value="modifyMaxValueModalData.carbohydrate"
            type="number"
          ></AInput>
        </div>
        <div class="flex items-center gap-2">
          <div>Protein</div>
          <AInput
            v-model:value="modifyMaxValueModalData.protein"
            type="number"
          ></AInput>
        </div>
        <div class="flex items-center gap-2">
          <div>Fat</div>
          <AInput
            v-model:value="modifyMaxValueModalData.fat"
            type="number"
          ></AInput>
        </div>
        <div class="flex items-center gap-2">
          <div>Calories</div>
          <AInput
            v-model:value="modifyMaxValueModalData.calories"
            type="number"
          ></AInput>
        </div>
      </div>
    </AModal>
  </div>
</template>

<style scoped></style>
