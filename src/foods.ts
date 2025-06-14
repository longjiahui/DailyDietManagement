import type { Food } from "./App.vue";

// 每一百克
export default [
  {
    id: "beaf",
    name: "牛肉",
    carbohydrate: 0,
    fat: 2,
    protein: 17.8,
  },
  {
    id: "chickenChest",
    name: "鸡胸肉",
    carbohydrate: 0,
    fat: 0.6,
    protein: 24.2,
  },
  {
    id: "egg",
    name: "鸡蛋(个)",
    per: 1,
    carbohydrate: 0.3,
    fat: 4.5,
    protein: 6.3,
  },
  {
    name: "蛋白粉(勺)",
    id: "proteinPowder",
    carbohydrate: 4,
    fat: 0.5,
    protein: 24.0,
    per: 1,
  },
  {
    id: "nuts",
    name: "坚果",
    carbohydrate: 46.2,
    fat: 32,
    protein: 12.6,
  },
  {
    id: "noodlesFullEgg",
    name: "全蛋面",
    carbohydrate: 75,
    fat: 1,
    protein: 12,
  },
  {
    id: "multicolorrice",
    name: "五色米",
    carbohydrate: 62.2,
    protein: 7.3,
    fat: 2.3,
  },
  {
    name: "黑燕麦",
    id: "blackOat",
    carbohydrate: 61.5,
    protein: 13.5,
    fat: 1.6,
  },

  {
    id: "milkfullfat",
    name: "全脂牛奶(100ml)",
    protein: 3.3,
    fat: 3.4,
    carbohydrate: 5.1,
  },
] satisfies Food[] as Food[];
