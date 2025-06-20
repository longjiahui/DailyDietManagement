import type { Food } from "./App.vue";

// 每一百克
export default [
  {
    id: "beaf",
    name: "牛肉",
    carbohydrate: 0,
    fat: 2,
    protein: 17.8,
    // 106-125 kcal
    calories: 118,
  },
  {
    id: "chickenChest",
    name: "鸡胸肉",
    carbohydrate: 0,
    fat: 0.6,
    protein: 24.2,
    calories: 133,
  },
  {
    id: "egg",
    name: "鸡蛋(个)",
    per: 1,
    carbohydrate: 0.3,
    fat: 4.5,
    protein: 6.3,
    calories: 32,
  },
  {
    name: "蛋白粉(勺)",
    id: "proteinPowder",
    carbohydrate: 4,
    fat: 0.5,
    protein: 24.0,
    per: 1,
    calories: 495 * 0.239,
  },
  {
    id: "nuts",
    name: "坚果果干混合(京东京造1.1kg款)",
    carbohydrate: 46.2,
    fat: 32,
    protein: 12.6,
    calories: 2184 * 0.239,
  },
  {
    id: "noodlesFullEgg",
    name: "全蛋面",
    carbohydrate: 75,
    fat: 1,
    protein: 12,
    calories: 131,
  },
  {
    id: "multicolorrice",
    name: "五色米",
    carbohydrate: 62.2,
    protein: 7.3,
    fat: 2.3,
    calories: 1367 * 0.239,
  },
  {
    name: "黑燕麦",
    id: "blackOat",
    carbohydrate: 61.5,
    protein: 13.5,
    fat: 1.6,
    calories: 1422 * 0.239,
  },
  {
    id: "milkfullfat",
    name: "全脂牛奶(100ml)",
    protein: 3.3,
    fat: 3.4,
    carbohydrate: 5.1,
    calories: 2184 * 0.239,
  },
  {
    name: "东北米(煮前100g)",
    id: "northeastrice",
    carbohydrate: 77.6,
    protein: 6.7,
    fat: 1,
    calories: 365,
  },
  {
    name: "绿豆(煮前100g)",
    id: "mungbean",
    carbohydrate: 59,
    protein: 22.1,
    fat: 0.8,
    calories: 316,
  },
  {
    name: "一般牛筋丸(颗)",
    id: "generalbeefNoodleBall",
    carbohydrate: 3 / 5,
    protein: 16 / 5,
    fat: 17 / 5,
    per: 1,
    calories: 62,
  },
  {
    name: "板烧鸡腿堡+玉米杯（大）四件套",
    id: "banshaojituibaosijiantao",
    carbohydrate: 61,
    protein: 39,
    fat: 30,
    calories: 2893 * 0.239,
    per: 1,
  },
] satisfies Food[] as Food[];
