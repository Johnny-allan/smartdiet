"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Apple,
  BookOpen,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Database,
  Download,
  Edit3,
  FileText,
  Info,
  Loader2,
  NotebookTabs,
  Printer,
  Repeat2,
  Scale,
  Salad,
  Star,
  Target,
  Trash2,
  X,
  Users,
} from "lucide-react";

import { NutritionBadge } from "@/shared/components/nutrition-badge";
import { SmartCard } from "@/shared/components/smart-card";
import { tacoFoods, type TacoFood } from "@/modules/foods/taco-foods";
import { tbcaFoods } from "@/modules/foods/tbca-foods";
import { API_BASE_URL, apiDelete, apiGet, apiPatch, apiPost, apiPut, apiUrl, requireApiData } from "@/shared/api/client";

type Patient = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  goal: string;
  status: string;
  notes: string;
};

type BackendPatient = {
  id: number;
  full_name: string;
  birth_date?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  status: string;
  notes?: string | null;
};

type BackendRecipe = {
  id: number;
  title: string;
  description?: string | null;
  preparation_method?: string | null;
  servings: number;
  tags: string[];
  professional_notes?: string | null;
};

type BackendAssessment = {
  id: number;
  patient_id: number;
  date: string;
  weight_kg: string;
  height_cm: string;
  bmi: string;
  notes?: string | null;
};

type BackendAnamnesis = {
  patient_id: number;
  main_goal?: string | null;
  clinical_history?: string | null;
  family_history?: string | null;
  allergies?: string | null;
  intolerances?: string | null;
  medications?: string | null;
  diseases?: string | null;
  sleep_quality?: string | null;
  stress_level?: string | null;
  bowel_function?: string | null;
  water_intake?: string | null;
  alcohol_use?: string | null;
  smoking?: string | null;
  food_preferences?: string | null;
  food_restrictions?: string | null;
  physical_activity?: string | null;
  objective_type?: string | null;
  suggested_strategy?: string[] | null;
  suggested_meals?: Record<string, string> | null;
  suggested_goals?: Array<Record<string, string | null>> | null;
};

type BackendPatientGoal = {
  id: number;
  patient_id: number;
  focus: string;
  metric: string;
  metric_type?: string | null;
  unit?: string | null;
  direction?: GoalDirection | null;
  baseline_value?: string | null;
  current_value?: string | null;
  target_value?: string | null;
  status: string;
  notes?: string | null;
};

type BackendMealPlanItem = {
  id: number;
  notes?: string | null;
  grams: string;
};

type BackendMealPlanMeal = {
  id: number;
  meal_type: string;
  notes?: string | null;
  items: BackendMealPlanItem[];
};

type BackendMealPlan = {
  id: number;
  patient_id: number;
  title: string;
  meals: BackendMealPlanMeal[];
};

type BackendBioimpedance = {
  id: number;
  patient_id: number;
  date: string;
  body_fat_percent?: string | null;
  fat_mass_kg?: string | null;
  lean_mass_kg?: string | null;
  muscle_mass_kg?: string | null;
  total_body_water_l?: string | null;
  basal_metabolic_rate_kcal?: string | null;
  visceral_fat_level?: string | null;
  metabolic_age?: number | null;
  notes?: string | null;
};

type BackendDiaryEntry = {
  id: number;
  patient_id: number;
  date: string;
  meal_type: string;
  grams: string;
  notes?: string | null;
};

type Recipe = {
  id: string;
  patientId: string;
  title: string;
  servings: string;
  ingredients: string;
  kcal: string;
  protein: string;
  tags: string;
};

type Assessment = {
  id: string;
  patientId: string;
  date: string;
  weight: string;
  height: string;
  bmi: string;
  skinfolds?: SkinfoldMeasurements;
  skinfoldSum?: string;
  bodyFatPercent?: string;
  notes: string;
};

type SkinfoldKey = "chest" | "midaxillary" | "triceps" | "subscapular" | "abdominal" | "suprailiac" | "thigh";

type SkinfoldMeasurements = Record<SkinfoldKey, string>;

type MealPlan = {
  patientId: string;
  meals: Record<string, string>;
  mealTimes?: Record<string, string>;
  structuredItems?: StructuredPlanItem[];
};

type StructuredPlanItem = {
  id: string;
  meal: string;
  foodId: string;
  grams: string;
};

type Food = {
  id: string;
  name: string;
  source: string;
  kcal: string;
  protein: string;
  carbs: string;
  fat: string;
};

type Anamnesis = {
  patientId: string;
  mainGoal: string;
  restrictions: string;
  routine: string;
  clinicalNotes: string;
};

type Bioimpedance = {
  id: string;
  patientId: string;
  date: string;
  device?: string;
  protocol?: string;
  bodyFat: string;
  fatMass?: string;
  leanMass?: string;
  muscleMass?: string;
  water: string;
  visceralFat?: string;
  metabolicAge?: string;
  phaseAngle?: string;
  boneMass?: string;
  bmr: string;
  notes?: string;
};

type DiaryEntry = {
  id: string;
  patientId: string;
  date: string;
  meal: string;
  description: string;
  adherence: string;
};

type GoalDirection = "increase" | "decrease" | "range";

type PatientFocusGoal = {
  id: string;
  patientId: string;
  focus: string;
  metric: string;
  metricType: string;
  unit: string;
  direction: GoalDirection;
  baseline: string;
  current: string;
  target: string;
  status: string;
  notes: string;
};

type Store = {
  patients: Patient[];
  recipes: Recipe[];
  assessments: Assessment[];
  mealPlans: MealPlan[];
  foods: Food[];
  anamnesis: Anamnesis[];
  bioimpedance: Bioimpedance[];
  diary: DiaryEntry[];
  focusGoals: PatientFocusGoal[];
};

type NutrientTotals = {
  kcal: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  fiber_g: string;
  sodium_mg: string;
};

type MealPlanAnalysis = {
  meals: Array<{ name: string; totals: NutrientTotals }>;
  daily_totals: NutrientTotals;
  adequacy: {
    kcal_percent?: string | null;
    protein_percent?: string | null;
    carbs_percent?: string | null;
    fat_percent?: string | null;
  };
};

type EnergyTarget = {
  bmr_kcal: string;
  tdee_kcal: string;
  target_kcal: string;
  objective_adjustment_kcal: string;
};

type MacroTargets = {
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  protein_percent: string;
  carbs_percent: string;
  fat_percent: string;
};

type EquivalentSubstitution = {
  strategy: string;
  reference_grams: string;
  candidate_grams: string;
  reference_totals: NutrientTotals;
  candidate_totals: NutrientTotals;
  delta: NutrientTotals;
};

type ClinicalAlerts = {
  alerts: Array<{ code: string; severity: "info" | "warning" | "critical"; message: string }>;
};

type PatientReportSummary = {
  patient_id: number;
  sections: string[];
  export_pdf_available: boolean;
};

const requiredMeals = [
  "Cafe da manha",
  "Lanche da manha",
  "Almoco",
  "Lanche da tarde",
  "Jantar",
  "Ceia",
];

const defaultMealTimes: Record<string, string> = {
  "Cafe da manha": "07:00",
  "Lanche da manha": "10:00",
  Almoco: "12:30",
  "Lanche da tarde": "16:00",
  Jantar: "19:30",
  Ceia: "22:00",
};

const brazilianSourceNames = ["TACO", "TACO 4a edicao", "TBCA"];

const emptySkinfolds: SkinfoldMeasurements = {
  chest: "",
  midaxillary: "",
  triceps: "",
  subscapular: "",
  abdominal: "",
  suprailiac: "",
  thigh: "",
};

const skinfoldFields: Array<{ key: SkinfoldKey; label: string }> = [
  { key: "chest", label: "Peitoral mm" },
  { key: "midaxillary", label: "Axilar media mm" },
  { key: "triceps", label: "Tricipital mm" },
  { key: "subscapular", label: "Subescapular mm" },
  { key: "abdominal", label: "Abdominal mm" },
  { key: "suprailiac", label: "Suprailiaca mm" },
  { key: "thigh", label: "Coxa mm" },
];

const skinfoldMarkerStart = "[DOBRAS_7]";
const skinfoldMarkerEnd = "[/DOBRAS_7]";

function formatNutrient(value: number | string | null | undefined, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return `${value}${suffix}`;
  return `${numberValue.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}${suffix}`;
}

function scaledNutrient(value: number | null | undefined, grams: number) {
  if (value === null || value === undefined || !grams) return null;
  return (value * grams) / 100;
}

function normalizeQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const defaultBrazilianFoodId =
  tbcaFoods.find((food) => normalizeQuery(food.name).includes("arroz") && food.kcal !== null)?.id ?? tbcaFoods[0]?.id ?? "taco-3";

function hasNutrientData(food: TacoFood) {
  return food.kcal !== null || food.protein !== null || food.carbs !== null || food.fat !== null;
}

function foodMacroGroup(food: TacoFood) {
  const protein = food.protein ?? 0;
  const carbs = food.carbs ?? 0;
  const fat = food.fat ?? 0;
  if (protein >= carbs && protein >= fat && protein >= 8) return "Proteina";
  if (carbs >= protein && carbs >= fat && carbs >= 8) return "Carboidrato";
  if (fat >= protein && fat >= carbs && fat >= 6) return "Gordura";
  return "Misto";
}

function suggestBrazilianSubstitutions(reference: TacoFood, grams: number, objective: string, candidates: TacoFood[]) {
  const referenceKcal = scaledNutrient(reference.kcal, grams) ?? 0;
  const referenceCarbs = scaledNutrient(reference.carbs, grams) ?? 0;
  const referenceProtein = scaledNutrient(reference.protein, grams) ?? 0;
  const group = foodMacroGroup(reference);
  const objectiveNeedle = normalizeQuery(objective);

  return candidates
    .filter((food) => food.id !== reference.id && food.kcal !== null)
    .map((food) => {
      const macroPenalty = foodMacroGroup(food) === group ? 0 : 35;
      const categoryPenalty = food.category === reference.category ? 0 : 10;
      const objectivePenalty =
        objectiveNeedle.includes("massa") || objectiveNeedle.includes("peso")
          ? Math.abs((food.protein ?? 0) - (reference.protein ?? 0)) * 1.2
          : Math.abs((food.carbs ?? 0) - (reference.carbs ?? 0)) * 1.4;
      const score =
        Math.abs((food.kcal ?? 0) - (reference.kcal ?? 0)) +
        Math.abs((food.carbs ?? 0) - (reference.carbs ?? 0)) * 2 +
        Math.abs((food.protein ?? 0) - (reference.protein ?? 0)) * 1.5 +
        macroPenalty +
        categoryPenalty +
        objectivePenalty;
      return { food, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 8)
    .map(({ food }) => ({
      food,
      grams,
      kcal: scaledNutrient(food.kcal, grams),
      carbs: scaledNutrient(food.carbs, grams),
      protein: scaledNutrient(food.protein, grams),
      fat: scaledNutrient(food.fat, grams),
      fiber: scaledNutrient(food.fiber, grams),
      kcalDelta: (scaledNutrient(food.kcal, grams) ?? 0) - referenceKcal,
      carbsDelta: (scaledNutrient(food.carbs, grams) ?? 0) - referenceCarbs,
      proteinDelta: (scaledNutrient(food.protein, grams) ?? 0) - referenceProtein,
    }));
}

function tacoFoodToNutritionInput(food: TacoFood, grams: string | number) {
  return {
    name: food.name,
    grams: String(grams || 0),
    kcal_per_100g: food.kcal === null ? undefined : String(food.kcal),
    protein_per_100g: food.protein === null ? undefined : String(food.protein),
    carbs_per_100g: food.carbs === null ? undefined : String(food.carbs),
    fat_per_100g: food.fat === null ? undefined : String(food.fat),
    fiber_per_100g: food.fiber === null ? undefined : String(food.fiber),
    sodium_per_100g: food.sodium === null ? undefined : String(food.sodium),
  };
}

function goalToObjective(goal: string) {
  const normalized = normalizeQuery(goal);
  if (normalized.includes("massa")) return "lean_mass_gain";
  if (normalized.includes("peso")) return "weight_gain";
  if (normalized.includes("glic")) return "glycemic_control";
  if (normalized.includes("gordura") || normalized.includes("emag")) return "fat_loss";
  return "maintenance";
}

function genderToSex(gender: string) {
  return normalizeQuery(gender).startsWith("masc") ? "male" : "female";
}

function parseAssessmentNotes(notes: string | null | undefined) {
  const value = notes ?? "";
  const markerPattern = /\[DOBRAS_7\]([\s\S]*?)\[\/DOBRAS_7\]/;
  const match = value.match(markerPattern);
  if (!match) return { cleanNotes: value, skinfolds: undefined as SkinfoldMeasurements | undefined };

  try {
    const parsed = JSON.parse(match[1]) as Partial<SkinfoldMeasurements>;
    return {
      cleanNotes: value.replace(markerPattern, "").trim(),
      skinfolds: { ...emptySkinfolds, ...parsed },
    };
  } catch {
    return { cleanNotes: value.replace(markerPattern, "").trim(), skinfolds: undefined };
  }
}

function buildAssessmentNotes(notes: string, skinfolds: SkinfoldMeasurements) {
  const hasSkinfold = Object.values(skinfolds).some((value) => value.trim() !== "");
  if (!hasSkinfold) return notes || null;
  return [notes, `${skinfoldMarkerStart}${JSON.stringify(skinfolds)}${skinfoldMarkerEnd}`].filter(Boolean).join("\n");
}

function calculateSkinfoldMetrics(skinfolds: SkinfoldMeasurements, patient?: Patient) {
  const values = skinfoldFields.map((field) => Number(skinfolds[field.key].replace(",", ".")));
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    return { sum: "", bodyFatPercent: "" };
  }
  const sum = values.reduce((total, value) => total + value, 0);
  const age = ageFromBirthDate(patient?.birthDate ?? "");
  const isMale = normalizeQuery(patient?.gender ?? "").startsWith("masc");
  const density = isMale
    ? 1.112 - 0.00043499 * sum + 0.00000055 * sum * sum - 0.00028826 * age
    : 1.097 - 0.00046971 * sum + 0.00000056 * sum * sum - 0.00012828 * age;
  const bodyFatPercent = 495 / density - 450;
  return {
    sum: sum.toFixed(1),
    bodyFatPercent: Number.isFinite(bodyFatPercent) ? bodyFatPercent.toFixed(1) : "",
  };
}

function patientFromApi(patient: BackendPatient): Patient {
  return {
    id: String(patient.id),
    name: patient.full_name,
    birthDate: patient.birth_date ?? "",
    gender: patient.gender ?? "",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    goal: "",
    status: patient.status === "active" ? "Ativo" : patient.status,
    notes: patient.notes ?? "",
  };
}

function patientToForm(patient: Patient) {
  return {
    name: patient.name,
    birthDate: patient.birthDate,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    goal: patient.goal,
    notes: patient.notes,
  };
}

function hasBackendId(value: string) {
  return Number.isInteger(Number(value));
}

function normalizeGoalDirection(value: string | null | undefined): GoalDirection {
  return value === "decrease" || value === "range" ? value : "increase";
}

function structuredGoalDefaults(goal: Partial<PatientFocusGoal> & { focus?: string; metric?: string }): Pick<PatientFocusGoal, "metricType" | "unit" | "direction" | "baseline"> {
  const normalizedFocus = normalizeQuery(goal.focus ?? "");
  const normalizedMetric = normalizeQuery(goal.metric ?? "");
  const isDecrease = ["perda", "reduc", "hipertens", "sodio", "sintoma"].some((term) => normalizedFocus.includes(term));
  const inferredUnit = goal.unit || (normalizedMetric.includes("peso") ? "kg" : normalizedMetric.includes("aderencia") ? "%" : "");
  const inferredType = goal.metricType || (normalizedMetric.includes("peso") ? "body_weight" : normalizedMetric.includes("pressao") ? "blood_pressure" : normalizedMetric.includes("aderencia") ? "adherence" : "number");
  return {
    metricType: inferredType,
    unit: inferredUnit,
    direction: goal.direction ? normalizeGoalDirection(goal.direction) : isDecrease ? "decrease" : "increase",
    baseline: goal.baseline || "",
  };
}

function normalizePatientGoal(goal: PatientFocusGoal): PatientFocusGoal {
  return {
    ...goal,
    ...structuredGoalDefaults(goal),
  };
}

function goalFromApi(goal: BackendPatientGoal): PatientFocusGoal {
  return normalizePatientGoal({
    id: String(goal.id),
    patientId: String(goal.patient_id),
    focus: goal.focus,
    metric: goal.metric,
    metricType: goal.metric_type ?? "number",
    unit: goal.unit ?? "",
    direction: normalizeGoalDirection(goal.direction),
    baseline: goal.baseline_value ?? "",
    current: goal.current_value ?? "",
    target: goal.target_value ?? "",
    status: goal.status,
    notes: goal.notes ?? "",
  });
}

function goalToApi(goal: Partial<PatientFocusGoal> & Pick<PatientFocusGoal, "focus" | "metric" | "current" | "target" | "status" | "notes">) {
  const structured = structuredGoalDefaults(goal);
  return {
    focus: goal.focus,
    metric: goal.metric,
    metric_type: structured.metricType,
    unit: structured.unit || null,
    direction: structured.direction,
    baseline_value: structured.baseline || null,
    current_value: goal.current,
    target_value: goal.target,
    status: goal.status,
    notes: goal.notes,
  };
}

function mealPlanFromApi(plan: BackendMealPlan): MealPlan {
  const meals = Object.fromEntries(requiredMeals.map((meal) => [meal, ""]));
  const mealTimes = { ...defaultMealTimes };
  for (const meal of plan.meals) {
    const notes = meal.notes ?? "";
    const timeMatch = notes.match(/Horario:\s*([0-2]\d:[0-5]\d)/i);
    if (timeMatch) mealTimes[meal.meal_type] = timeMatch[1];
    meals[meal.meal_type] = [
      notes.replace(/Horario:\s*[0-2]\d:[0-5]\d/i, "").trim(),
      ...meal.items.map((item) => item.notes || `${item.grams} g`),
    ].filter(Boolean).join("\n");
  }
  return { patientId: String(plan.patient_id), meals, mealTimes };
}

function recipeFromApi(recipe: BackendRecipe): Recipe {
  return {
    id: String(recipe.id),
    patientId: "api",
    title: recipe.title,
    servings: String(recipe.servings),
    ingredients: recipe.description ?? recipe.preparation_method ?? "",
    kcal: "",
    protein: "",
    tags: recipe.tags.join(", "),
  };
}

function assessmentFromApi(item: BackendAssessment): Assessment {
  const parsedNotes = parseAssessmentNotes(item.notes);
  const metrics = parsedNotes.skinfolds ? calculateSkinfoldMetrics(parsedNotes.skinfolds) : { sum: "", bodyFatPercent: "" };
  return {
    id: String(item.id),
    patientId: String(item.patient_id),
    date: item.date,
    weight: item.weight_kg,
    height: item.height_cm,
    bmi: item.bmi,
    skinfolds: parsedNotes.skinfolds,
    skinfoldSum: metrics.sum,
    bodyFatPercent: metrics.bodyFatPercent,
    notes: parsedNotes.cleanNotes,
  };
}

function bioimpedanceFromApi(item: BackendBioimpedance): Bioimpedance {
  return {
    id: String(item.id),
    patientId: String(item.patient_id),
    date: item.date,
    bodyFat: item.body_fat_percent ?? "",
    fatMass: item.fat_mass_kg ?? "",
    leanMass: item.lean_mass_kg ?? "",
    muscleMass: item.muscle_mass_kg ?? "",
    water: item.total_body_water_l ?? "",
    visceralFat: item.visceral_fat_level ?? "",
    metabolicAge: item.metabolic_age ? String(item.metabolic_age) : "",
    bmr: item.basal_metabolic_rate_kcal ?? "",
    notes: item.notes ?? "",
  };
}

function diaryFromApi(item: BackendDiaryEntry): DiaryEntry {
  return {
    id: String(item.id),
    patientId: String(item.patient_id),
    date: item.date,
    meal: item.meal_type,
    description: item.notes ?? `${item.grams} g registrados`,
    adherence: "Registrado",
  };
}

function anamnesisFromApi(patientId: string, item: BackendAnamnesis): Anamnesis {
  return {
    patientId,
    mainGoal: item.main_goal ?? "",
    restrictions: [item.food_restrictions, item.allergies, item.intolerances].filter(Boolean).join("\n"),
    routine: item.physical_activity ?? "",
    clinicalNotes: [item.clinical_history, item.diseases, item.medications, item.food_preferences].filter(Boolean).join("\n"),
  };
}

function ageFromBirthDate(birthDate: string) {
  if (!birthDate) return 35;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 35;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(10, age);
}

const mealPlanTemplates: Record<string, Record<string, string>> = {
  "Perda de gordura": {
    "Cafe da manha": "Ovos mexidos, fruta com fibra e cafe sem acucar. Ajustar carboidrato conforme treino.",
    "Lanche da manha": "Iogurte natural ou fruta com castanhas.",
    Almoco: "Proteina magra, arroz ou tuberculo em porcao controlada, feijao e salada volumosa.",
    "Lanche da tarde": "Sanduiche integral com proteina magra ou iogurte proteico.",
    Jantar: "Proteina magra, legumes e carboidrato menor se nao houver treino noturno.",
    Ceia: "Cha, fruta pequena ou fonte proteica leve conforme fome noturna.",
  },
  "Ganho de massa magra": {
    "Cafe da manha": "Aveia, leite ou iogurte, banana e ovos. Priorizar proteina ao acordar.",
    "Lanche da manha": "Vitamina com fruta, leite/iogurte e pasta de amendoim.",
    Almoco: "Arroz, feijao, carne/frango/peixe, legumes e azeite. Manter superavit controlado.",
    "Lanche da tarde": "Pre-treino com carboidrato de facil digestao e proteina.",
    Jantar: "Proteina, carboidrato complexo e vegetais. Ajustar ao horario do treino.",
    Ceia: "Iogurte, queijo cottage ou leite com aveia se precisar completar proteina.",
  },
  "Ganho de peso": {
    "Cafe da manha": "Pao integral, ovos, queijo, fruta e vitamina calorica.",
    "Lanche da manha": "Mix de castanhas, fruta seca e iogurte.",
    Almoco: "Prato completo com arroz, feijao, proteina, legumes e gordura boa.",
    "Lanche da tarde": "Shake com leite, banana, aveia e pasta de amendoim.",
    Jantar: "Refeicao semelhante ao almoco, com carboidrato suficiente.",
    Ceia: "Leite, iogurte ou sanduiche pequeno para aumentar aporte calorico.",
  },
  "Controle glicemico": {
    "Cafe da manha": "Proteina, fruta com baixo indice glicemico e fibra. Evitar sucos.",
    "Lanche da manha": "Oleaginosas ou iogurte natural sem acucar.",
    Almoco: "Carboidrato integral ou leguminosa, proteina magra e vegetais.",
    "Lanche da tarde": "Fruta com fonte de proteina ou gordura boa.",
    Jantar: "Baixa carga glicemica, com legumes e proteina.",
    Ceia: "Opcional conforme glicemia, fome e conduta profissional.",
  },
  Hipertensao: {
    "Cafe da manha": "Opcoes naturais, baixo sodio, fruta e proteina.",
    "Lanche da manha": "Fruta, castanhas sem sal ou iogurte natural.",
    Almoco: "DASH adaptado: vegetais, leguminosas, proteina magra e pouco ultraprocessado.",
    "Lanche da tarde": "Pao integral com recheio baixo sodio ou fruta.",
    Jantar: "Legumes, proteina magra e temperos naturais.",
    Ceia: "Cha sem acucar ou fruta, se necessario.",
  },
  Vegetariano: {
    "Cafe da manha": "Iogurte ou bebida vegetal fortificada, aveia, fruta e sementes.",
    "Lanche da manha": "Fruta com pasta de amendoim ou castanhas.",
    Almoco: "Arroz, feijao/lentilha/grao-de-bico, tofu/ovos se permitido e salada.",
    "Lanche da tarde": "Sanduiche com homus, queijo ou tofu.",
    Jantar: "Leguminosas, legumes, carboidrato complexo e fonte proteica vegetal.",
    Ceia: "Leite, iogurte, bebida vegetal fortificada ou fruta.",
  },
};

const mealPlanTemplateTimes: Record<string, Record<string, string>> = {
  "Perda de gordura": {
    "Cafe da manha": "07:00",
    "Lanche da manha": "10:00",
    Almoco: "12:30",
    "Lanche da tarde": "16:00",
    Jantar: "19:30",
    Ceia: "22:00",
  },
  "Ganho de massa magra": {
    "Cafe da manha": "07:00",
    "Lanche da manha": "10:00",
    Almoco: "12:30",
    "Lanche da tarde": "16:30",
    Jantar: "20:00",
    Ceia: "22:30",
  },
  "Ganho de peso": {
    "Cafe da manha": "07:00",
    "Lanche da manha": "09:30",
    Almoco: "12:30",
    "Lanche da tarde": "16:00",
    Jantar: "19:30",
    Ceia: "22:00",
  },
  "Controle glicemico": {
    "Cafe da manha": "07:00",
    "Lanche da manha": "10:00",
    Almoco: "12:30",
    "Lanche da tarde": "16:00",
    Jantar: "19:00",
    Ceia: "21:30",
  },
  Hipertensao: {
    "Cafe da manha": "07:00",
    "Lanche da manha": "10:00",
    Almoco: "12:30",
    "Lanche da tarde": "16:00",
    Jantar: "19:00",
    Ceia: "21:30",
  },
  Vegetariano: {
    "Cafe da manha": "07:30",
    "Lanche da manha": "10:00",
    Almoco: "12:30",
    "Lanche da tarde": "16:00",
    Jantar: "19:30",
    Ceia: "22:00",
  },
};

const mealPlanTemplateItems: Record<string, Array<{ meal: string; search: string[]; grams: string }>> = {
  "Perda de gordura": [
    { meal: "Cafe da manha", search: ["ovo"], grams: "100" },
    { meal: "Cafe da manha", search: ["banana"], grams: "80" },
    { meal: "Lanche da manha", search: ["iogurte"], grams: "170" },
    { meal: "Almoco", search: ["arroz"], grams: "90" },
    { meal: "Almoco", search: ["feijao"], grams: "80" },
    { meal: "Almoco", search: ["frango"], grams: "120" },
    { meal: "Lanche da tarde", search: ["pao"], grams: "50" },
    { meal: "Jantar", search: ["frango"], grams: "120" },
    { meal: "Jantar", search: ["legumes"], grams: "160" },
    { meal: "Ceia", search: ["maca"], grams: "100" },
  ],
  "Ganho de massa magra": [
    { meal: "Cafe da manha", search: ["aveia"], grams: "50" },
    { meal: "Cafe da manha", search: ["leite"], grams: "200" },
    { meal: "Cafe da manha", search: ["banana"], grams: "100" },
    { meal: "Lanche da manha", search: ["iogurte"], grams: "170" },
    { meal: "Almoco", search: ["arroz"], grams: "150" },
    { meal: "Almoco", search: ["feijao"], grams: "100" },
    { meal: "Almoco", search: ["frango"], grams: "150" },
    { meal: "Lanche da tarde", search: ["banana"], grams: "100" },
    { meal: "Lanche da tarde", search: ["aveia"], grams: "30" },
    { meal: "Jantar", search: ["batata"], grams: "180" },
    { meal: "Jantar", search: ["ovo"], grams: "100" },
    { meal: "Ceia", search: ["leite"], grams: "200" },
  ],
  "Ganho de peso": [
    { meal: "Cafe da manha", search: ["pao"], grams: "80" },
    { meal: "Cafe da manha", search: ["ovo"], grams: "100" },
    { meal: "Cafe da manha", search: ["banana"], grams: "120" },
    { meal: "Lanche da manha", search: ["castanha"], grams: "30" },
    { meal: "Almoco", search: ["arroz"], grams: "180" },
    { meal: "Almoco", search: ["feijao"], grams: "120" },
    { meal: "Almoco", search: ["carne"], grams: "150" },
    { meal: "Lanche da tarde", search: ["leite"], grams: "250" },
    { meal: "Lanche da tarde", search: ["aveia"], grams: "40" },
    { meal: "Jantar", search: ["arroz"], grams: "150" },
    { meal: "Jantar", search: ["frango"], grams: "150" },
    { meal: "Ceia", search: ["iogurte"], grams: "170" },
  ],
  "Controle glicemico": [
    { meal: "Cafe da manha", search: ["ovo"], grams: "100" },
    { meal: "Cafe da manha", search: ["aveia"], grams: "30" },
    { meal: "Lanche da manha", search: ["castanha"], grams: "20" },
    { meal: "Almoco", search: ["feijao"], grams: "120" },
    { meal: "Almoco", search: ["frango"], grams: "130" },
    { meal: "Almoco", search: ["salada"], grams: "120" },
    { meal: "Lanche da tarde", search: ["iogurte"], grams: "170" },
    { meal: "Jantar", search: ["peixe"], grams: "130" },
    { meal: "Jantar", search: ["legumes"], grams: "160" },
  ],
  Hipertensao: [
    { meal: "Cafe da manha", search: ["banana"], grams: "100" },
    { meal: "Cafe da manha", search: ["aveia"], grams: "30" },
    { meal: "Lanche da manha", search: ["maca"], grams: "100" },
    { meal: "Almoco", search: ["arroz"], grams: "100" },
    { meal: "Almoco", search: ["feijao"], grams: "100" },
    { meal: "Almoco", search: ["frango"], grams: "130" },
    { meal: "Lanche da tarde", search: ["iogurte"], grams: "170" },
    { meal: "Jantar", search: ["peixe"], grams: "130" },
    { meal: "Jantar", search: ["legumes"], grams: "160" },
  ],
  Vegetariano: [
    { meal: "Cafe da manha", search: ["iogurte"], grams: "170" },
    { meal: "Cafe da manha", search: ["aveia"], grams: "40" },
    { meal: "Lanche da manha", search: ["banana"], grams: "100" },
    { meal: "Almoco", search: ["arroz"], grams: "130" },
    { meal: "Almoco", search: ["feijao"], grams: "140" },
    { meal: "Almoco", search: ["ovo"], grams: "100" },
    { meal: "Lanche da tarde", search: ["pao"], grams: "60" },
    { meal: "Jantar", search: ["lentilha"], grams: "140" },
    { meal: "Jantar", search: ["legumes"], grams: "160" },
    { meal: "Ceia", search: ["leite"], grams: "200" },
  ],
};

const seedStore: Store = {
  patients: [
    {
      id: "patient-gordeli",
      name: "Gordelice",
      birthDate: "1998-07-08",
      gender: "Feminino",
      phone: "(11) 98888-1020",
      email: "gordelice.teste@smartdiet.local",
      goal: "Perda de gordura com preservacao de massa magra",
      status: "Ativo",
      notes: "Paciente de teste preenchida como atendimento completo. Queixa principal: dificuldade de organizar refeicoes durante o trabalho e fome no fim da tarde.",
    },
  ],
  recipes: [
    {
      id: "recipe-gordeli-1",
      patientId: "patient-gordeli",
      title: "Frango desfiado para marmitas",
      servings: "5",
      ingredients: "Peito de frango cozido e desfiado, cebola, alho, tomate, cheiro-verde e temperos naturais. Preparar sem excesso de oleo para usar no almoco e lanche da tarde.",
      kcal: "165",
      protein: "31",
      tags: "marmita, proteina, baixo teor de gordura",
    },
    {
      id: "recipe-gordeli-2",
      patientId: "patient-gordeli",
      title: "Iogurte com aveia e banana",
      servings: "1",
      ingredients: "Iogurte natural desnatado, aveia em flocos, banana nanica e canela. Opcao de cafe da manha para dias de treino.",
      kcal: "310",
      protein: "15",
      tags: "cafe da manha, pre-treino, fibra",
    },
  ],
  assessments: [
    {
      id: "assessment-gordeli-1",
      patientId: "patient-gordeli",
      date: "2026-07-09",
      weight: "86.4",
      height: "160",
      bmi: "33.75",
      notes: "Retorno: reducao discreta de peso, boa adesao ao cafe da manha e almoco. Reforcar lanche da tarde para reduzir fome noturna.",
    },
    {
      id: "assessment-gordeli-2",
      patientId: "patient-gordeli",
      date: "2026-06-25",
      weight: "87",
      height: "160",
      bmi: "33.98",
      notes: "Avaliacao inicial: circunferencia abdominal 101 cm, cintura 96 cm, quadril 116 cm. PA 124/82 mmHg.",
    },
  ],
  mealPlans: [
    {
      patientId: "patient-gordeli",
      mealTimes: {
        "Cafe da manha": "07:15",
        "Lanche da manha": "10:00",
        Almoco: "12:45",
        "Lanche da tarde": "16:30",
        Jantar: "19:45",
        Ceia: "22:00",
      },
      meals: {
        "Cafe da manha": "Aveia com banana e iogurte natural. Manter cafe sem acucar ou com adocante se necessario.",
        "Lanche da manha": "Maca com castanhas. Usar este lanche nos dias de maior fome ou reunioes longas.",
        Almoco: "Prato base: arroz, feijao, frango grelhado e salada/legumes. Priorizar metade do prato de vegetais.",
        "Lanche da tarde": "Pao integral com frango desfiado ou iogurte natural. Refeicao chave para evitar beliscos a noite.",
        Jantar: "Frango ou ovos com batata-doce e legumes. Reduzir ultraprocessados e manter jantar ate 20h30.",
        Ceia: "Iogurte natural ou cha sem acucar se houver fome. Se nao houver fome, pode pular.",
      },
      structuredItems: [
        { id: "plan-gordeli-1", meal: "Cafe da manha", foodId: "taco-7", grams: "35" },
        { id: "plan-gordeli-2", meal: "Cafe da manha", foodId: "taco-179", grams: "90" },
        { id: "plan-gordeli-3", meal: "Cafe da manha", foodId: "taco-449", grams: "170" },
        { id: "plan-gordeli-4", meal: "Lanche da manha", foodId: "taco-222", grams: "130" },
        { id: "plan-gordeli-5", meal: "Lanche da manha", foodId: "taco-589", grams: "15" },
        { id: "plan-gordeli-6", meal: "Almoco", foodId: "taco-3", grams: "90" },
        { id: "plan-gordeli-7", meal: "Almoco", foodId: "taco-561", grams: "100" },
        { id: "plan-gordeli-8", meal: "Almoco", foodId: "taco-410", grams: "130" },
        { id: "plan-gordeli-9", meal: "Almoco", foodId: "taco-546", grams: "160" },
        { id: "plan-gordeli-10", meal: "Lanche da tarde", foodId: "taco-52", grams: "60" },
        { id: "plan-gordeli-11", meal: "Lanche da tarde", foodId: "taco-410", grams: "70" },
        { id: "plan-gordeli-12", meal: "Jantar", foodId: "taco-88", grams: "160" },
        { id: "plan-gordeli-13", meal: "Jantar", foodId: "taco-410", grams: "120" },
        { id: "plan-gordeli-14", meal: "Jantar", foodId: "taco-546", grams: "180" },
        { id: "plan-gordeli-15", meal: "Ceia", foodId: "taco-449", grams: "120" },
      ],
    },
  ],
  foods: [],
  anamnesis: [
    {
      patientId: "patient-gordeli",
      mainGoal: "Reduzir gordura corporal, melhorar disposicao e criar rotina alimentar possivel para dias de trabalho.",
      restrictions: "Sem alergias relatadas. Relata baixa tolerancia a leite integral em grande volume; prefere iogurte natural ou desnatado.",
      routine: "Acorda 06:30, trabalha sentada das 08:00 as 17:30, treina musculacao 3x/semana as 18:30 e faz caminhadas leves no fim de semana.",
      clinicalNotes: "Sono 6-7h/noite, intestino regular, ingestao hidrica media 1,8 L/dia. Refere fome maior entre 17h e 20h e consumo eventual de doces apos jantar.",
    },
  ],
  bioimpedance: [
    {
      id: "bio-gordeli-1",
      patientId: "patient-gordeli",
      date: "2026-07-09",
      device: "InBody 270",
      protocol: "Jejum de 3h, sem treino nas 12h anteriores",
      bodyFat: "37.8",
      fatMass: "32.7",
      leanMass: "53.7",
      muscleMass: "29.4",
      water: "38.9",
      visceralFat: "12",
      metabolicAge: "35",
      phaseAngle: "5.4",
      boneMass: "2.8",
      bmr: "1548",
      notes: "Bioimpedancia de retorno: foco em reduzir massa gorda preservando massa magra. Reavaliar em 30 dias.",
    },
    {
      id: "bio-gordeli-2",
      patientId: "patient-gordeli",
      date: "2026-06-25",
      device: "InBody 270",
      protocol: "Avaliacao inicial",
      bodyFat: "38.6",
      fatMass: "33.6",
      leanMass: "53.4",
      muscleMass: "29.1",
      water: "38.6",
      visceralFat: "13",
      metabolicAge: "36",
      phaseAngle: "5.2",
      boneMass: "2.8",
      bmr: "1536",
      notes: "Avaliacao inicial com percentual de gordura elevado e boa base de massa magra para preservacao.",
    },
  ],
  diary: [
    {
      id: "diary-gordeli-1",
      patientId: "patient-gordeli",
      date: "2026-07-08",
      meal: "Dia completo",
      description: "Seguiu cafe da manha, almoco e jantar. Trocou lanche da tarde por iogurte e comeu 2 quadrados de chocolate apos o jantar.",
      adherence: "85%",
    },
    {
      id: "diary-gordeli-2",
      patientId: "patient-gordeli",
      date: "2026-07-05",
      meal: "Fim de semana",
      description: "Manteve almoco planejado, consumiu pizza no jantar social e bebeu pouca agua.",
      adherence: "70%",
    },
    {
      id: "diary-gordeli-3",
      patientId: "patient-gordeli",
      date: "2026-07-02",
      meal: "Dia completo",
      description: "Boa organizacao das marmitas. Relatou fome controlada quando fez o lanche da tarde.",
      adherence: "90%",
    },
  ],
  focusGoals: [
    {
      id: "focus-gordeli-1",
      patientId: "patient-gordeli",
      focus: "Acompanhamento de peso",
      metric: "Peso",
      metricType: "body_weight",
      unit: "kg",
      direction: "decrease",
      baseline: "87",
      current: "86.4",
      target: "80",
      status: "Em progresso",
      notes: "Meta inicial para 12-16 semanas, com reavaliacao mensal.",
    },
    {
      id: "focus-gordeli-2",
      patientId: "patient-gordeli",
      focus: "Gordura corporal",
      metric: "Percentual de gordura",
      metricType: "body_measure",
      unit: "%",
      direction: "decrease",
      baseline: "38.6",
      current: "37.8",
      target: "34",
      status: "Em progresso",
      notes: "Reduzir percentual de gordura preservando massa magra.",
    },
    {
      id: "focus-gordeli-3",
      patientId: "patient-gordeli",
      focus: "Aderencia ao cardapio",
      metric: "Aderencia",
      metricType: "adherence",
      unit: "%",
      direction: "increase",
      baseline: "70",
      current: "85",
      target: "90",
      status: "Indo bem",
      notes: "Prioridade: manter lanche da tarde para reduzir fome noturna.",
    },
    {
      id: "focus-gordeli-4",
      patientId: "patient-gordeli",
      focus: "Ingestao de agua",
      metric: "Agua",
      metricType: "number",
      unit: "L",
      direction: "increase",
      baseline: "1.8",
      current: "2.1",
      target: "2.5",
      status: "Em progresso",
      notes: "Distribuir garrafa de 700 ml em tres blocos do dia.",
    },
  ],
};

function removeLegacySeedPatients(store: Store): Store {
  const legacyPatientIds = new Set(["patient-1", "patient-2"]);
  return {
    ...store,
    patients: store.patients.filter((patient) => !legacyPatientIds.has(patient.id)),
    recipes: store.recipes.filter((item) => !legacyPatientIds.has(item.patientId)),
    assessments: store.assessments.filter((item) => !legacyPatientIds.has(item.patientId)),
    mealPlans: store.mealPlans.filter((item) => !legacyPatientIds.has(item.patientId)),
    anamnesis: store.anamnesis.filter((item) => !legacyPatientIds.has(item.patientId)),
    bioimpedance: store.bioimpedance.filter((item) => !legacyPatientIds.has(item.patientId)),
    diary: store.diary.filter((item) => !legacyPatientIds.has(item.patientId)),
    focusGoals: store.focusGoals.filter((item) => !legacyPatientIds.has(item.patientId)),
  };
}

function mergeRequestedInitialPatient(store: Store): Store {
  const hasGordeli = store.patients.some((patient) => patient.id === "patient-gordeli");
  if (hasGordeli) {
    return {
      ...store,
      patients: [seedStore.patients[0], ...store.patients.filter((patient) => patient.id !== "patient-gordeli")],
      recipes: [...seedStore.recipes, ...store.recipes.filter((item) => item.patientId !== "patient-gordeli")],
      assessments: [...seedStore.assessments, ...store.assessments.filter((item) => item.patientId !== "patient-gordeli")],
      mealPlans: [...seedStore.mealPlans, ...store.mealPlans.filter((item) => item.patientId !== "patient-gordeli")],
      anamnesis: [...seedStore.anamnesis, ...store.anamnesis.filter((item) => item.patientId !== "patient-gordeli")],
      bioimpedance: [...seedStore.bioimpedance, ...store.bioimpedance.filter((item) => item.patientId !== "patient-gordeli")],
      diary: [...seedStore.diary, ...store.diary.filter((item) => item.patientId !== "patient-gordeli")],
      focusGoals: [...seedStore.focusGoals, ...store.focusGoals.filter((item) => item.patientId !== "patient-gordeli")],
    };
  }
  return {
    ...store,
    patients: [...seedStore.patients, ...store.patients],
    recipes: [...seedStore.recipes, ...store.recipes],
    assessments: [...seedStore.assessments, ...store.assessments],
    mealPlans: [...seedStore.mealPlans, ...store.mealPlans],
    anamnesis: [...seedStore.anamnesis, ...store.anamnesis],
    bioimpedance: [...seedStore.bioimpedance, ...store.bioimpedance],
    diary: [...seedStore.diary, ...store.diary],
    focusGoals: [...seedStore.focusGoals, ...store.focusGoals],
  };
}

const inputClass =
  "h-10 w-full rounded-smart border border-line bg-surface px-3 text-[14px] text-graphite transition duration-200 placeholder:text-graphite/45 hover:border-sage focus:border-petrol";
const textareaClass =
  "min-h-[92px] w-full rounded-smart border border-line bg-surface px-3 py-2 text-[14px] text-graphite transition duration-200 placeholder:text-graphite/45 hover:border-sage focus:border-petrol";
const labelClass = "space-y-1 text-[13px] font-medium text-graphite";
const patientGenderOptions = ["Masculino", "Feminino"];
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-smart bg-forest px-4 text-[14px] font-semibold text-white shadow-subtle transition duration-200 hover:bg-petrol";
const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-smart border border-line bg-background px-4 text-[14px] font-semibold text-graphite transition duration-200 hover:border-sage hover:bg-mist hover:text-forest";
const dangerButtonClass =
  "inline-flex h-10 items-center justify-center rounded-smart border border-terracotta/30 bg-terracotta/10 px-4 text-[14px] font-semibold text-terracotta transition duration-200 hover:border-terracotta hover:bg-terracotta hover:text-white";

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

function goalProgressPercent(goal: PatientFocusGoal) {
  const current = Number(goal.current.replace(",", "."));
  const targetParts = goal.target.split(/[-–a]/).map((part) => Number(part.trim().replace(",", "."))).filter(Number.isFinite);
  const target = Number(goal.target.replace(",", "."));
  const baseline = Number(goal.baseline.replace(",", "."));
  if (!Number.isFinite(current)) return 0;

  if (goal.direction === "range") {
    if (targetParts.length < 2) return 0;
    const [min, max] = [Math.min(...targetParts), Math.max(...targetParts)];
    if (current >= min && current <= max) return 100;
    const distance = current < min ? min - current : current - max;
    const span = Math.max(1, max - min);
    return Math.max(0, Math.min(100, 100 - (distance / span) * 100));
  }

  if (!Number.isFinite(target)) return 0;
  const inferredBaseline = Number.isFinite(baseline) ? baseline : goal.direction === "decrease" ? Math.max(current, target) : Math.min(current, target);
  const totalDelta = Math.abs(target - inferredBaseline);
  if (totalDelta === 0) return current === target ? 100 : 0;
  const currentDelta = goal.direction === "decrease" ? inferredBaseline - current : current - inferredBaseline;
  const percent = (currentDelta / totalDelta) * 100;
  return Math.max(0, Math.min(100, percent));
}

function goalStatusTone(status: string) {
  const normalized = normalizeQuery(status);
  if (normalized.includes("bat") || normalized.includes("bom") || normalized.includes("ok")) return "bg-mist text-forest";
  if (normalized.includes("atenc") || normalized.includes("risco")) return "bg-terracotta/10 text-terracotta";
  return "bg-background text-graphite";
}

function goalStatusColor(status: string) {
  const normalized = normalizeQuery(status);
  if (normalized.includes("bat")) return "bg-forest";
  if (normalized.includes("bem")) return "bg-petrol";
  if (normalized.includes("atenc")) return "bg-terracotta";
  return "bg-sage";
}

function goalFocusShortLabel(focus: string) {
  const words = focus.split(" ").filter(Boolean);
  return words.slice(0, 2).join(" ");
}

function PatientGoalCharts({ goals }: { goals: PatientFocusGoal[] }) {
  const progressItems = goals.map((goal) => ({ ...goal, progress: goalProgressPercent(goal) }));
  const averageProgress = progressItems.length
    ? Math.round(progressItems.reduce((total, goal) => total + goal.progress, 0) / progressItems.length)
    : 0;
  const statusCounts = ["Meta batida", "Indo bem", "Em progresso", "Atencao"].map((status) => ({
    status,
    count: goals.filter((goal) => normalizeQuery(goal.status) === normalizeQuery(status)).length,
  }));
  const maxStatusCount = Math.max(1, ...statusCounts.map((item) => item.count));
  const circumference = 2 * Math.PI * 42;
  const ringOffset = circumference - (averageProgress / 100) * circumference;

  if (goals.length === 0) return null;

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-smart border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-graphite">Progresso medio</p>
            <p className="mt-1 text-[12px] text-graphite/65">{goals.length} metas acompanhadas</p>
          </div>
          <div className="relative grid h-[112px] w-[112px] place-items-center">
            <svg className="h-[112px] w-[112px] -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#F97316"
                strokeLinecap="round"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span className="absolute text-[24px] font-semibold text-graphite">{averageProgress}%</span>
          </div>
        </div>
        <div className="mt-3 grid gap-2">
          {statusCounts.map((item) => (
            <div className="grid grid-cols-[92px_1fr_28px] items-center gap-2 text-[12px]" key={item.status}>
              <span className="truncate font-medium text-graphite/70">{item.status}</span>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div className={`h-full rounded-full ${goalStatusColor(item.status)}`} style={{ width: `${(item.count / maxStatusCount) * 100}%` }} />
              </div>
              <span className="text-right font-semibold text-graphite">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-smart border border-line bg-surface p-4">
        <p className="text-[13px] font-semibold text-graphite">Metas por prioridade</p>
        <div className="mt-4 flex h-[180px] items-end gap-3 overflow-x-auto pb-1">
          {progressItems.map((goal) => (
            <div className="flex min-w-[76px] flex-1 flex-col items-center justify-end gap-2" key={goal.id}>
              <div className="flex h-[128px] w-full max-w-[58px] items-end rounded-smart bg-background p-1">
                <div
                  className={`w-full rounded-smart ${goalStatusColor(goal.status)}`}
                  style={{ height: `${Math.max(8, goal.progress)}%` }}
                  title={`${goal.focus}: ${Math.round(goal.progress)}%`}
                />
              </div>
              <div className="min-h-[34px] text-center">
                <p className="text-[12px] font-semibold leading-4 text-graphite">{Math.round(goal.progress)}%</p>
                <p className="h-8 overflow-hidden text-[11px] leading-4 text-graphite/60">{goalFocusShortLabel(goal.focus)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function useSmartDietStore() {
  const [store, setStore] = useState<Store>(seedStore);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("smartdiet-store");
    if (raw) {
      const parsed = JSON.parse(raw) as Store;
      const migrated = removeLegacySeedPatients({
        ...seedStore,
        ...parsed,
        foods: [],
        focusGoals: (parsed.focusGoals ?? seedStore.focusGoals).map((goal) => normalizePatientGoal(goal as PatientFocusGoal)),
      });
      setStore(mergeRequestedInitialPatient(migrated));
      window.localStorage.setItem("smartdiet-gordeli-seeded", "true");
    } else {
      window.localStorage.setItem("smartdiet-gordeli-seeded", "true");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    async function loadBackendPatients() {
      try {
        const patients = requireApiData(await apiGet<BackendPatient[]>("/patients"));
        if (patients.length > 0) {
          setStore((current) => ({
            ...current,
            patients: patients.map(patientFromApi),
          }));
        }
      } catch {
        // The local Beta workspace remains usable when the API is offline.
      }
    }

    void loadBackendPatients();
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem("smartdiet-store", JSON.stringify(store));
    }
  }, [ready, store]);

  return { ready, store, setStore };
}

function PageHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: typeof Users;
}) {
  return (
    <section className="flex flex-col justify-between gap-4 rounded-smart border border-line bg-surface p-6 shadow-subtle md:flex-row md:items-center">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-forest">Workspace funcional</p>
        <h2 className="mt-1 text-[28px] font-semibold leading-9 text-graphite">{title}</h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-graphite/70">{subtitle}</p>
      </div>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-smart bg-mist text-forest">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
    </section>
  );
}

function StateBanner({
  tone,
  title,
  detail,
}: {
  tone: "info" | "success" | "warning" | "error" | "loading";
  title: string;
  detail?: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "loading" ? Loader2 : tone === "error" || tone === "warning" ? AlertCircle : Info;
  const toneClass =
    tone === "success"
      ? "border-sage/70 bg-mist text-forest"
      : tone === "error"
        ? "border-terracotta/30 bg-terracotta/10 text-terracotta"
        : tone === "warning"
          ? "border-sage bg-surface text-graphite"
          : "border-line bg-background text-graphite";
  return (
    <div className={`flex items-start gap-3 rounded-smart border p-3 ${toneClass}`} role={tone === "error" ? "alert" : "status"}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold">{title}</p>
        {detail ? <p className="mt-1 text-[12px] leading-5 opacity-80">{detail}</p> : null}
      </div>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-smart border border-dashed border-line bg-background p-4 text-center">
      <p className="text-[13px] font-semibold text-graphite">{title}</p>
      <p className="mt-1 text-[12px] leading-5 text-graphite/65">{detail}</p>
    </div>
  );
}

function PatientSelect({
  patients,
  value,
  onChange,
}: {
  patients: Patient[];
  value: string;
  onChange: (patientId: string) => void;
}) {
  return (
    <label className={labelClass}>
      Paciente
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {patients.length === 0 ? <option value="">Cadastre um paciente</option> : null}
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PatientsWorkspace() {
  const { store, setStore } = useSmartDietStore();
  const [selectedId, setSelectedId] = useState("");
  const selected = store.patients.find((patient) => patient.id === selectedId) ?? store.patients[0];
  const [saveMessage, setSaveMessage] = useState("");
  const emptyPatientForm = {
    name: "",
    birthDate: "",
    gender: "",
    phone: "",
    email: "",
    goal: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyPatientForm);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [focusForm, setFocusForm] = useState({
    focus: "Perda de peso",
    metric: "Peso",
    metricType: "body_weight",
    unit: "kg",
    direction: "decrease" as GoalDirection,
    baseline: "",
    current: "",
    target: "",
    status: "Em progresso",
    notes: "",
  });
  const selectedGoals = store.focusGoals.filter((goal) => goal.patientId === selected?.id);

  useEffect(() => {
    if (store.patients.length > 0 && !store.patients.some((patient) => patient.id === selectedId)) {
      setSelectedId(store.patients[0].id);
    }
  }, [selectedId, store.patients]);

  useEffect(() => {
    async function loadGoals() {
      if (!hasBackendId(selectedId)) return;
      try {
        const goals = requireApiData(await apiGet<BackendPatientGoal[]>(`/patients/${selectedId}/goals`));
        setStore((current) => ({
          ...current,
          focusGoals: [
            ...goals.map(goalFromApi),
            ...current.focusGoals.filter((goal) => goal.patientId !== selectedId),
          ],
        }));
      } catch {
        setSaveMessage("Metas locais exibidas. Nao foi possivel carregar metas do backend agora.");
      }
    }

    void loadGoals();
  }, [selectedId, setStore]);

  function clearPatientForm() {
    setForm(emptyPatientForm);
    setEditingPatientId(null);
  }

  function startEditingPatient(patient: Patient) {
    setSelectedId(patient.id);
    setEditingPatientId(patient.id);
    setForm(patientToForm(patient));
    setSaveMessage("");
  }

  async function savePatient() {
    if (!form.name.trim()) return;
    if (editingPatientId) {
      const updatedLocal: Patient = {
        ...(store.patients.find((patient) => patient.id === editingPatientId) ?? {
          id: editingPatientId,
          status: "Ativo",
        } as Patient),
        name: form.name,
        birthDate: form.birthDate,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        goal: form.goal,
        notes: form.notes,
      };

      let patient = updatedLocal;
      if (hasBackendId(editingPatientId)) {
        try {
          const updated = requireApiData(
            await apiPut<BackendPatient>(`/patients/${editingPatientId}`, {
              full_name: form.name,
              birth_date: form.birthDate || null,
              gender: form.gender || null,
              phone: form.phone || null,
              email: form.email || null,
              notes: [form.goal ? `Objetivo: ${form.goal}` : "", form.notes].filter(Boolean).join("\n") || null,
              status: "active",
            }),
          );
          patient = { ...patientFromApi(updated), goal: form.goal };
          setSaveMessage("Paciente atualizado na API real.");
        } catch {
          setSaveMessage("API indisponivel: alteracao mantida apenas no workspace local.");
        }
      } else {
        setSaveMessage("Paciente local atualizado no workspace da Beta.");
      }

      setStore((current) => ({
        ...current,
        patients: current.patients.map((item) => (item.id === editingPatientId ? patient : item)),
      }));
      setSelectedId(patient.id);
      clearPatientForm();
      return;
    }

    let patient: Patient;
    try {
      const created = requireApiData(
        await apiPost<BackendPatient>("/patients", {
          full_name: form.name,
          birth_date: form.birthDate || null,
          gender: form.gender || null,
          phone: form.phone || null,
          email: form.email || null,
          notes: [form.goal ? `Objetivo: ${form.goal}` : "", form.notes].filter(Boolean).join("\n") || null,
          status: "active",
        }),
      );
      patient = { ...patientFromApi(created), goal: form.goal };
      setSaveMessage("Paciente cadastrado na API e disponivel para persistencia no PostgreSQL.");
    } catch {
      patient = {
        id: createId("patient"),
        name: form.name,
        birthDate: form.birthDate,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        goal: form.goal,
        status: "Ativo",
        notes: form.notes,
      };
      setSaveMessage("API indisponivel: paciente salvo apenas no workspace local.");
    }

    setStore((current) => ({ ...current, patients: [patient, ...current.patients] }));
    setSelectedId(patient.id);
    clearPatientForm();
  }

  async function deletePatient(patient: Patient) {
    if (hasBackendId(patient.id)) {
      try {
        await apiDelete(`/patients/${patient.id}`);
        setSaveMessage("Paciente removido da API real e do workspace.");
      } catch {
        setSaveMessage("API indisponivel: paciente removido apenas do workspace local.");
      }
    } else {
      setSaveMessage("Paciente local removido do workspace da Beta.");
    }

    const nextSelectedId = store.patients.find((item) => item.id !== patient.id)?.id ?? "";
    setStore((current) => ({
      ...current,
      patients: current.patients.filter((item) => item.id !== patient.id),
      recipes: current.recipes.filter((item) => item.patientId !== patient.id),
      assessments: current.assessments.filter((item) => item.patientId !== patient.id),
      mealPlans: current.mealPlans.filter((item) => item.patientId !== patient.id),
      anamnesis: current.anamnesis.filter((item) => item.patientId !== patient.id),
      bioimpedance: current.bioimpedance.filter((item) => item.patientId !== patient.id),
      diary: current.diary.filter((item) => item.patientId !== patient.id),
      focusGoals: current.focusGoals.filter((item) => item.patientId !== patient.id),
    }));
    setSelectedId(nextSelectedId);
    if (editingPatientId === patient.id) clearPatientForm();
  }

  async function addFocusGoal() {
    if (!selected || !focusForm.focus.trim()) return;
    const goal: PatientFocusGoal = {
      id: createId("focus"),
      patientId: selected.id,
      ...focusForm,
    };
    const nextGoals = [goal, ...selectedGoals];
    setStore((current) => ({ ...current, focusGoals: [goal, ...current.focusGoals] }));
    if (hasBackendId(selected.id)) {
      try {
        const saved = requireApiData(
          await apiPut<BackendPatientGoal[]>(`/patients/${selected.id}/goals`, nextGoals.map(goalToApi)),
        );
        setStore((current) => ({
          ...current,
          focusGoals: [
            ...saved.map(goalFromApi),
            ...current.focusGoals.filter((item) => item.patientId !== selected.id),
          ],
        }));
      } catch {
        setSaveMessage("Meta salva localmente, mas nao foi possivel gravar no backend.");
      }
    }
    setFocusForm({
      focus: "Perda de peso",
      metric: "Peso",
      metricType: "body_weight",
      unit: "kg",
      direction: "decrease",
      baseline: "",
      current: "",
      target: "",
      status: "Em progresso",
      notes: "",
    });
  }

  async function updateFocusGoal(id: string, next: Partial<PatientFocusGoal>) {
    setStore((current) => ({
      ...current,
      focusGoals: current.focusGoals.map((goal) => (goal.id === id ? { ...goal, ...next } : goal)),
    }));
    if (hasBackendId(id)) {
      try {
        await apiPatch<BackendPatientGoal>(`/patients/${selected?.id}/goals/${id}`, {
          current_value: next.current,
          target_value: next.target,
          baseline_value: next.baseline,
          unit: next.unit,
          direction: next.direction,
          metric_type: next.metricType,
          status: next.status,
          focus: next.focus,
          metric: next.metric,
          notes: next.notes,
        });
      } catch {
        setSaveMessage("Alteracao de meta mantida localmente, mas nao sincronizada no backend.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Pacientes" subtitle="Cadastro, focos clinicos, metas e acompanhamento do que o paciente ja bateu." />
      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[16px] font-semibold text-graphite">{editingPatientId ? "Editar paciente" : "Novo paciente"}</h3>
            {editingPatientId ? (
              <button className={secondaryButtonClass} type="button" onClick={clearPatientForm}>
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Cancelar
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3">
            <label className={labelClass}>Nome completo<input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={labelClass}>Nascimento<input className={inputClass} type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
              <label className={labelClass}>
                Genero
                <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Nao informado</option>
                  {patientGenderOptions.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={labelClass}>Telefone<input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label className={labelClass}>Email<input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            </div>
            <label className={labelClass}>Objetivo<input className={inputClass} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></label>
            <label className={labelClass}>Observacoes<textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <button className={primaryButtonClass} type="button" onClick={savePatient}>
              {editingPatientId ? "Salvar alteracoes" : "Cadastrar paciente"}
            </button>
            {saveMessage ? <p className="text-[13px] font-medium text-graphite/70">{saveMessage}</p> : null}
          </div>
        </SmartCard>

        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[16px] font-semibold text-graphite">Perfil do paciente</h3>
            <span className="rounded-smart bg-mist px-3 py-1 text-[12px] font-semibold text-forest">{store.patients.length} pacientes</span>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-2">
              {store.patients.map((patient) => (
                <button
                  className={`w-full rounded-smart border px-3 py-3 text-left transition duration-200 ${patient.id === selected?.id ? "border-forest bg-mist" : "border-line bg-background hover:border-sage"}`}
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedId(patient.id)}
                >
                  <p className="truncate text-[14px] font-semibold text-graphite">{patient.name}</p>
                  <p className="mt-1 truncate text-[12px] text-graphite/65">{patient.goal || "Sem objetivo registrado"}</p>
                </button>
              ))}
            </div>
            {selected ? (
              <div className="space-y-4">
                <div className="rounded-smart border border-line bg-background p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <h4 className="text-[20px] font-semibold text-graphite">{selected.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      <button className={secondaryButtonClass} type="button" onClick={() => startEditingPatient(selected)}>
                        <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Editar
                      </button>
                      <button className={dangerButtonClass} type="button" onClick={() => deletePatient(selected)}>
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Remover
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <NutritionBadge label="Status" value={selected.status} />
                    <NutritionBadge label="Objetivo" value={selected.goal || "-"} />
                    <NutritionBadge label="Nascimento" value={selected.birthDate || "-"} />
                  </div>
                  <p className="mt-4 text-[14px] leading-6 text-graphite/75">{selected.notes || "Nenhuma observacao registrada."}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-smart bg-surface p-3 text-[13px] text-graphite"><strong>Email:</strong> {selected.email || "-"}</div>
                    <div className="rounded-smart bg-surface p-3 text-[13px] text-graphite"><strong>Telefone:</strong> {selected.phone || "-"}</div>
                  </div>
                </div>

                <div className="rounded-smart border border-terracotta/30 bg-terracotta/5 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-graphite">Manutencao do paciente</p>
                      <p className="mt-1 text-[12px] leading-5 text-graphite/65">
                        Remova o cadastro quando o paciente encerrar o acompanhamento ou nao se consultar mais.
                      </p>
                    </div>
                    <button className={dangerButtonClass} type="button" onClick={() => deletePatient(selected)}>
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Remover paciente
                    </button>
                  </div>
                </div>

                <div className="rounded-smart border border-line bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-graphite">Focos e metas do paciente</p>
                      <p className="mt-1 text-[12px] leading-5 text-graphite/65">Registre o alvo, o valor atual e se o paciente esta evoluindo bem.</p>
                    </div>
                    <Target className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <label className={labelClass}>
                      Foco clinico
                      <select className={inputClass} value={focusForm.focus} onChange={(event) => setFocusForm({ ...focusForm, focus: event.target.value })}>
                        <option>Perda de peso</option>
                        <option>Ganho de massa</option>
                        <option>Hipertensao</option>
                        <option>Controle glicemico</option>
                        <option>Aderencia ao cardapio</option>
                        <option>Educacao alimentar</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Metrica
                      <input className={inputClass} placeholder="Peso, cintura, aderencia, PA..." value={focusForm.metric} onChange={(event) => setFocusForm({ ...focusForm, metric: event.target.value })} />
                    </label>
                    <label className={labelClass}>
                      Tipo
                      <select className={inputClass} value={focusForm.metricType} onChange={(event) => setFocusForm({ ...focusForm, metricType: event.target.value })}>
                        <option value="body_weight">Peso corporal</option>
                        <option value="body_measure">Medida corporal</option>
                        <option value="adherence">Aderencia</option>
                        <option value="blood_pressure">Pressao arterial</option>
                        <option value="lab_marker">Exame/laboratorio</option>
                        <option value="habit">Habito</option>
                        <option value="number">Numero livre</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Unidade
                      <input className={inputClass} placeholder="kg, cm, %, dias/semana..." value={focusForm.unit} onChange={(event) => setFocusForm({ ...focusForm, unit: event.target.value })} />
                    </label>
                    <label className={labelClass}>
                      Direcao do progresso
                      <select className={inputClass} value={focusForm.direction} onChange={(event) => setFocusForm({ ...focusForm, direction: event.target.value as GoalDirection })}>
                        <option value="decrease">Diminuir ate a meta</option>
                        <option value="increase">Aumentar ate a meta</option>
                        <option value="range">Manter dentro de faixa</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Inicial
                      <input className={inputClass} inputMode="decimal" value={focusForm.baseline} onChange={(event) => setFocusForm({ ...focusForm, baseline: event.target.value })} />
                    </label>
                    <label className={labelClass}>
                      Atual
                      <input className={inputClass} inputMode="decimal" value={focusForm.current} onChange={(event) => setFocusForm({ ...focusForm, current: event.target.value })} />
                    </label>
                    <label className={labelClass}>
                      Meta ou faixa
                      <input className={inputClass} inputMode="decimal" value={focusForm.target} onChange={(event) => setFocusForm({ ...focusForm, target: event.target.value })} />
                    </label>
                    <label className={labelClass}>
                      Status
                      <select className={inputClass} value={focusForm.status} onChange={(event) => setFocusForm({ ...focusForm, status: event.target.value })}>
                        <option>Em progresso</option>
                        <option>Indo bem</option>
                        <option>Meta batida</option>
                        <option>Atencao</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Observacao
                      <input className={inputClass} value={focusForm.notes} onChange={(event) => setFocusForm({ ...focusForm, notes: event.target.value })} />
                    </label>
                  </div>
                  <button className={`${primaryButtonClass} mt-3`} type="button" onClick={addFocusGoal}>
                    Adicionar meta
                  </button>
                  <PatientGoalCharts goals={selectedGoals} />
                  <div className="mt-4 grid gap-3">
                    {selectedGoals.map((goal) => {
                      const progress = goalProgressPercent(goal);
                      return (
                        <article className="rounded-smart border border-line bg-surface p-3" key={goal.id}>
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-graphite">{goal.focus}</p>
                              <p className="mt-1 text-[12px] text-graphite/65">
                                {goal.metric} ({goal.unit || "sem unidade"}): inicial {goal.baseline || "-"} / atual {goal.current || "-"} / meta {goal.target || "-"}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold uppercase text-terracotta">
                                {goal.direction === "decrease" ? "Diminuir" : goal.direction === "range" ? "Faixa alvo" : "Aumentar"} - {goal.metricType}
                              </p>
                            </div>
                            <select
                              className={`h-8 rounded-smart border border-line px-2 text-[12px] font-semibold ${goalStatusTone(goal.status)}`}
                              value={goal.status}
                              onChange={(event) => updateFocusGoal(goal.id, { status: event.target.value })}
                            >
                              <option>Em progresso</option>
                              <option>Indo bem</option>
                              <option>Meta batida</option>
                              <option>Atencao</option>
                            </select>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                            <div className="h-full rounded-full bg-forest" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="mt-3 grid gap-2 md:grid-cols-3">
                            <input
                              className={inputClass}
                              inputMode="decimal"
                              value={goal.baseline}
                              onChange={(event) => updateFocusGoal(goal.id, { baseline: event.target.value })}
                            />
                            <input
                              className={inputClass}
                              inputMode="decimal"
                              value={goal.current}
                              onChange={(event) => updateFocusGoal(goal.id, { current: event.target.value })}
                            />
                            <input
                              className={inputClass}
                              inputMode="decimal"
                              value={goal.target}
                              onChange={(event) => updateFocusGoal(goal.id, { target: event.target.value })}
                            />
                          </div>
                          <div className="mt-2 grid gap-2 md:grid-cols-3">
                            <input
                              className={inputClass}
                              value={goal.unit}
                              onChange={(event) => updateFocusGoal(goal.id, { unit: event.target.value })}
                            />
                            <select
                              className={inputClass}
                              value={goal.direction}
                              onChange={(event) => updateFocusGoal(goal.id, { direction: event.target.value as GoalDirection })}
                            >
                              <option value="decrease">Diminuir</option>
                              <option value="increase">Aumentar</option>
                              <option value="range">Faixa</option>
                            </select>
                            <select
                              className={inputClass}
                              value={goal.metricType}
                              onChange={(event) => updateFocusGoal(goal.id, { metricType: event.target.value })}
                            >
                              <option value="body_weight">Peso corporal</option>
                              <option value="body_measure">Medida corporal</option>
                              <option value="adherence">Aderencia</option>
                              <option value="blood_pressure">Pressao arterial</option>
                              <option value="lab_marker">Exame/laboratorio</option>
                              <option value="habit">Habito</option>
                              <option value="number">Numero livre</option>
                            </select>
                          </div>
                          {goal.notes ? <p className="mt-2 text-[12px] leading-5 text-graphite/65">{goal.notes}</p> : null}
                        </article>
                      );
                    })}
                    {selectedGoals.length === 0 ? <p className="text-[13px] text-graphite/65">Nenhum foco cadastrado para este paciente.</p> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </SmartCard>
      </section>
    </div>
  );
}

export function RecipesWorkspace() {
  const { store, setStore } = useSmartDietStore();
  const [patientId, setPatientId] = useState(store.patients[0]?.id ?? "");
  const emptyRecipeForm = { title: "", servings: "1", ingredients: "", kcal: "", protein: "", tags: "" };
  const [form, setForm] = useState(emptyRecipeForm);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const recipes = store.recipes.filter((recipe) => recipe.patientId === patientId || recipe.patientId === "api");

  useEffect(() => {
    async function loadRecipes() {
      try {
        const recipesFromApi = requireApiData(await apiGet<BackendRecipe[]>("/recipes"));
        setStore((current) => ({
          ...current,
          recipes: [
            ...recipesFromApi.map(recipeFromApi),
            ...current.recipes.filter((recipe) => recipe.patientId !== "api"),
          ],
        }));
      } catch {
        setStatusMessage("API indisponivel: exibindo receitas locais.");
      }
    }

    void loadRecipes();
  }, [setStore]);

  function recipePayload() {
    return {
      title: form.title,
      description: form.ingredients,
      preparation_method: form.ingredients,
      servings: Number(form.servings) || 1,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      professional_notes: [form.kcal ? `Kcal informada: ${form.kcal}` : "", form.protein ? `Proteina informada: ${form.protein} g` : ""]
        .filter(Boolean)
        .join("\n") || null,
      items: [],
    };
  }

  function clearRecipeForm() {
    setForm(emptyRecipeForm);
    setEditingRecipeId(null);
  }

  function startEditingRecipe(recipe: Recipe) {
    setEditingRecipeId(recipe.id);
    if (recipe.patientId !== "api") setPatientId(recipe.patientId);
    setForm({
      title: recipe.title,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      kcal: recipe.kcal,
      protein: recipe.protein,
      tags: recipe.tags,
    });
    setStatusMessage("");
  }

  async function saveRecipe() {
    if (!form.title.trim() || !patientId) return;

    if (editingRecipeId) {
      let recipe: Recipe = {
        id: editingRecipeId,
        patientId: hasBackendId(editingRecipeId) ? "api" : patientId,
        ...form,
      };
      if (hasBackendId(editingRecipeId)) {
        try {
          const updated = requireApiData(await apiPut<BackendRecipe>(`/recipes/${editingRecipeId}`, recipePayload()));
          recipe = recipeFromApi(updated);
          setStatusMessage("Receita atualizada na API real.");
        } catch {
          setStatusMessage("API indisponivel: receita atualizada apenas no workspace local.");
        }
      } else {
        setStatusMessage("Receita local atualizada no workspace da Beta.");
      }
      setStore((current) => ({
        ...current,
        recipes: current.recipes.map((item) => (item.id === editingRecipeId ? recipe : item)),
      }));
      clearRecipeForm();
      return;
    }

    let recipe: Recipe = { id: createId("recipe"), patientId, ...form };
    try {
      const created = requireApiData(await apiPost<BackendRecipe>("/recipes", recipePayload()));
      recipe = recipeFromApi(created);
      setStatusMessage("Receita salva na API real.");
    } catch {
      setStatusMessage("API indisponivel: receita salva apenas no workspace local.");
    }

    setStore((current) => ({ ...current, recipes: [recipe, ...current.recipes] }));
    clearRecipeForm();
  }

  async function deleteRecipe(recipe: Recipe) {
    if (hasBackendId(recipe.id)) {
      try {
        await apiDelete(`/recipes/${recipe.id}`);
        setStatusMessage("Receita removida da API real.");
      } catch {
        setStatusMessage("API indisponivel: receita removida apenas do workspace local.");
      }
    } else {
      setStatusMessage("Receita local removida do workspace da Beta.");
    }
    setStore((current) => ({ ...current, recipes: current.recipes.filter((item) => item.id !== recipe.id) }));
    if (editingRecipeId === recipe.id) clearRecipeForm();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title="Receitas por paciente" subtitle="Formulario funcional para criar receitas e vincular ao perfil do paciente." />
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[16px] font-semibold text-graphite">{editingRecipeId ? "Editar receita" : "Nova receita"}</h3>
            {editingRecipeId ? (
              <button className={secondaryButtonClass} type="button" onClick={clearRecipeForm}>
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Cancelar
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3">
            <PatientSelect patients={store.patients} value={patientId} onChange={setPatientId} />
            <label className={labelClass}>Titulo<input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className={labelClass}>Ingredientes<textarea className={textareaClass} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /></label>
            <div className="grid gap-3 md:grid-cols-3">
              <label className={labelClass}>Porcoes<input className={inputClass} value={form.servings} onChange={(e) => setForm({ ...form, servings: e.target.value })} /></label>
              <label className={labelClass}>Kcal<input className={inputClass} value={form.kcal} onChange={(e) => setForm({ ...form, kcal: e.target.value })} /></label>
              <label className={labelClass}>Proteinas (g)<input className={inputClass} value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} /></label>
            </div>
            <label className={labelClass}>Etiquetas<input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label>
            <button className={primaryButtonClass} type="button" onClick={saveRecipe}>
              {editingRecipeId ? "Salvar alteracoes" : "Salvar receita"}
            </button>
            {statusMessage ? <p className="text-[13px] font-medium text-graphite/70">{statusMessage}</p> : null}
          </div>
        </SmartCard>
        <SmartCard className="p-5">
          <h3 className="text-[16px] font-semibold text-graphite">Receitas vinculadas</h3>
          <div className="mt-4 grid gap-3">
            {recipes.map((recipe) => (
              <article className="rounded-smart border border-line bg-background p-4" key={recipe.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <h4 className="text-[15px] font-semibold text-graphite">{recipe.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className={secondaryButtonClass} type="button" onClick={() => startEditingRecipe(recipe)}>
                      <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Editar
                    </button>
                    <button className={dangerButtonClass} type="button" onClick={() => deleteRecipe(recipe)}>
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Remover
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[13px] leading-5 text-graphite/70">{recipe.ingredients}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <NutritionBadge label="Porcoes" value={recipe.servings} />
                  <NutritionBadge label="kcal" value={recipe.kcal || "-"} />
                  <NutritionBadge label="P" value={`${recipe.protein || "-"} g`} />
                </div>
              </article>
            ))}
            {recipes.length === 0 ? <p className="text-[14px] text-graphite/65">Nenhuma receita para este paciente.</p> : null}
          </div>
        </SmartCard>
      </section>
    </div>
  );
}

export function MealPlansWorkspace() {
  const { store, setStore } = useSmartDietStore();
  const [patientId, setPatientId] = useState(store.patients[0]?.id ?? "");
  const [selectedTemplate, setSelectedTemplate] = useState("Ganho de massa magra");
  const [selectedSubMeal, setSelectedSubMeal] = useState("Almoco");
  const prescriptionFoods = useMemo(() => [...tbcaFoods, ...tacoFoods].filter(hasNutrientData), []);
  const fallbackFood = prescriptionFoods[0] ?? tacoFoods[0];
  const [referenceFoodId, setReferenceFoodId] = useState(defaultBrazilianFoodId);
  const [referenceGrams, setReferenceGrams] = useState("100");
  const [structuredMeal, setStructuredMeal] = useState("Almoco");
  const [structuredFoodId, setStructuredFoodId] = useState(defaultBrazilianFoodId);
  const [structuredGrams, setStructuredGrams] = useState("100");
  const [productQuery, setProductQuery] = useState("");
  const defaultStructuredItems = useMemo(
    () => [{ id: "plan-item-1", meal: "Almoco", foodId: defaultBrazilianFoodId, grams: "100" }],
    [],
  );
  const [energyTarget, setEnergyTarget] = useState<EnergyTarget | null>(null);
  const [macroTargets, setMacroTargets] = useState<MacroTargets | null>(null);
  const [mealAnalysis, setMealAnalysis] = useState<MealPlanAnalysis | null>(null);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlerts | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [persistenceStatus, setPersistenceStatus] = useState<"idle" | "saving" | "saved" | "local" | "error">("idle");
  const [persistenceMessage, setPersistenceMessage] = useState("");
  const selectedPatient = store.patients.find((patient) => patient.id === patientId);
  const patientAssessment = store.assessments.find((assessment) => assessment.patientId === patientId);
  const patientAnamnesis = store.anamnesis.find((item) => item.patientId === patientId);
  const currentPlan = store.mealPlans.find((plan) => plan.patientId === patientId);
  const [meals, setMeals] = useState<Record<string, string>>(() => {
    const base = Object.fromEntries(requiredMeals.map((meal) => [meal, ""]));
    return { ...base, ...(currentPlan?.meals ?? {}) };
  });
  const [mealTimes, setMealTimes] = useState<Record<string, string>>(() => ({
    ...defaultMealTimes,
    ...(currentPlan?.mealTimes ?? {}),
  }));
  const [structuredItems, setStructuredItems] = useState<StructuredPlanItem[]>(currentPlan?.structuredItems ?? defaultStructuredItems);
  const grams = Math.max(1, Number(referenceGrams) || 100);
  const referenceFood = prescriptionFoods.find((food) => food.id === referenceFoodId) ?? fallbackFood;
  const structuredFood = prescriptionFoods.find((food) => food.id === structuredFoodId) ?? fallbackFood;
  const referenceMacros = {
    kcal: scaledNutrient(referenceFood.kcal, grams),
    carbs: scaledNutrient(referenceFood.carbs, grams),
    protein: scaledNutrient(referenceFood.protein, grams),
    fat: scaledNutrient(referenceFood.fat, grams),
    fiber: scaledNutrient(referenceFood.fiber, grams),
  };
  const substitutionSuggestions = suggestBrazilianSubstitutions(
    referenceFood,
    grams,
    `${selectedPatient?.goal ?? ""} ${selectedTemplate}`,
    prescriptionFoods,
  );
  const mealRecords = requiredMeals.map((meal) => {
    const items = structuredItems.filter((item) => item.meal === meal);
    const kcal = items.reduce((total, item) => {
      const food = prescriptionFoods.find((candidate) => candidate.id === item.foodId) ?? fallbackFood;
      return total + (scaledNutrient(food.kcal, Number(item.grams)) ?? 0);
    }, 0);
    return { meal, time: mealTimes[meal] ?? "", notes: meals[meal] ?? "", items, kcal };
  });
  const productQuickSearches = ["banana", "maca", "aveia", "mingau", "iogurte", "ovo", "arroz", "feijao"];
  const filteredProducts = useMemo(() => {
    const needle = normalizeQuery(productQuery);
    return prescriptionFoods
      .filter((food) => {
        if (!needle) return productQuickSearches.some((term) => normalizeQuery(food.name).includes(term));
        return normalizeQuery(`${food.name} ${food.category} ${food.source}`).includes(needle);
      })
      .slice(0, 12);
  }, [prescriptionFoods, productQuery]);

  useEffect(() => {
    if (store.patients.length > 0 && !store.patients.some((patient) => patient.id === patientId)) {
      setPatientId(store.patients[0].id);
    }
  }, [patientId, store.patients]);

  useEffect(() => {
    const plan = store.mealPlans.find((item) => item.patientId === patientId);
    const base = Object.fromEntries(requiredMeals.map((meal) => [meal, ""]));
    setMeals({ ...base, ...(plan?.meals ?? {}) });
    setMealTimes({ ...defaultMealTimes, ...(plan?.mealTimes ?? {}) });
    setStructuredItems(plan?.structuredItems ?? defaultStructuredItems);
  }, [defaultStructuredItems, patientId, store.mealPlans]);

  useEffect(() => {
    async function loadBackendPlans() {
      if (!hasBackendId(patientId)) return;
      try {
        const plans = requireApiData(await apiGet<BackendMealPlan[]>(`/patients/${patientId}/meal-plans`));
        if (plans.length === 0) return;
        const plan = mealPlanFromApi(plans[0]);
        setStore((current) => ({
          ...current,
          mealPlans: [plan, ...current.mealPlans.filter((item) => item.patientId !== patientId)],
        }));
      } catch {
        setPersistenceMessage("Cardapio local exibido. Nao foi possivel carregar cardapio salvo no backend.");
      }
    }

    void loadBackendPlans();
  }, [patientId, setStore]);

  async function savePlan() {
    setStore((current) => ({
      ...current,
      mealPlans: [
        { patientId, meals, mealTimes, structuredItems },
        ...current.mealPlans.filter((plan) => plan.patientId !== patientId),
      ],
    }));
    const backendPatientId = Number(patientId);
    if (!Number.isInteger(backendPatientId)) {
      setPersistenceStatus("local");
      setPersistenceMessage("Plano salvo no workspace local. Para gravar no PostgreSQL, carregue um paciente criado pela API.");
      return;
    }

    setPersistenceStatus("saving");
    setPersistenceMessage("");
    try {
      await apiPost("/patients/" + backendPatientId + "/meal-plans", {
        title: `Plano alimentar - ${selectedPatient?.name ?? "Paciente"}`,
        target_kcal: energyTarget?.target_kcal,
        target_protein_g: macroTargets?.protein_g,
        target_carbs_g: macroTargets?.carbs_g,
        target_fat_g: macroTargets?.fat_g,
        notes: "Plano criado pelo workspace SmartDiet Beta.",
        meals: requiredMeals.map((meal) => ({
          meal_type: meal,
          notes: [mealTimes[meal] ? `Horario: ${mealTimes[meal]}` : "", meals[meal] || ""].filter(Boolean).join("\n") || null,
          items: structuredItems
            .filter((item) => item.meal === meal)
            .map((item) => {
              const food = prescriptionFoods.find((candidate) => candidate.id === item.foodId) ?? fallbackFood;
              return {
                quantity: item.grams,
                unit: "g",
                grams: item.grams,
                notes: food.name,
              };
            }),
        })),
      });
      setPersistenceStatus("saved");
      setPersistenceMessage("Plano alimentar gravado no backend.");
    } catch {
      setPersistenceStatus("error");
      setPersistenceMessage("O plano foi salvo localmente, mas nao foi possivel gravar no backend.");
    }
  }

  function openMealPlanPdf() {
    if (!hasBackendId(patientId)) {
      setPersistenceStatus("local");
      setPersistenceMessage("Para gerar PDF pelo backend, selecione um paciente criado pela API.");
      return;
    }
    window.open(apiUrl(`/patients/${patientId}/reports/meal-plan.pdf`), "_blank", "noopener,noreferrer");
  }

  function findFoodIdForTemplate(searchTerms: string[]) {
    const normalizedTerms = searchTerms.map(normalizeQuery);
    return (
      prescriptionFoods.find((food) => {
        const name = normalizeQuery(food.name);
        return normalizedTerms.every((term) => name.includes(term));
      })?.id ?? fallbackFood.id
    );
  }

  function templateStructuredItems(templateName: string) {
    return (mealPlanTemplateItems[templateName] ?? []).map((item, index) => ({
      id: createId(`plan-${templateName}-${index}`),
      meal: item.meal,
      foodId: findFoodIdForTemplate(item.search),
      grams: item.grams,
    }));
  }

  function applyTemplate(templateName: string) {
    setSelectedTemplate(templateName);
    setMeals({ ...meals, ...mealPlanTemplates[templateName] });
    setMealTimes({ ...mealTimes, ...(mealPlanTemplateTimes[templateName] ?? {}) });
    setStructuredItems(templateStructuredItems(templateName));
    setMealAnalysis(null);
    setClinicalAlerts(null);
    setAnalysisStatus("idle");
    setPersistenceMessage("Modelo aplicado com horarios e itens estruturados para calculo de kcal.");
  }

  function addSubstitutionToMeal(food: TacoFood) {
    const line = `Substituicao: ${formatNutrient(grams, " g")} de ${referenceFood.name} -> ${formatNutrient(grams, " g")} de ${food.name} (${formatNutrient(scaledNutrient(food.kcal, grams), " kcal")}, ${formatNutrient(scaledNutrient(food.carbs, grams), " g C")}).`;
    setMeals((current) => ({
      ...current,
      [selectedSubMeal]: `${current[selectedSubMeal] ? `${current[selectedSubMeal]}\n` : ""}${line}`,
    }));
  }

  function addStructuredItem() {
    addProductToMeal(structuredFood);
  }

  function addProductToMeal(food: TacoFood) {
    const grams = structuredGrams || "100";
    setStructuredItems((current) => [
      ...current,
      { id: createId("plan-item"), meal: structuredMeal, foodId: food.id, grams },
    ]);
    const line = `${formatNutrient(grams, " g")} de ${food.name}.`;
    setMeals((current) => ({
      ...current,
      [structuredMeal]: `${current[structuredMeal] ? `${current[structuredMeal]}\n` : ""}${line}`,
    }));
    setStructuredFoodId(food.id);
  }

  function removeStructuredItem(id: string) {
    setStructuredItems((current) => current.filter((item) => item.id !== id));
  }

  function inferConditions() {
    const text = normalizeQuery(
      `${selectedPatient?.goal ?? ""} ${patientAnamnesis?.restrictions ?? ""} ${patientAnamnesis?.clinicalNotes ?? ""}`,
    );
    return [
      text.includes("diabet") || text.includes("glic") ? "diabetes" : null,
      text.includes("hipertens") || text.includes("pressao") ? "hypertension" : null,
      text.includes("renal") ? "renal" : null,
      text.includes("dislip") || text.includes("colesterol") ? "dyslipidemia" : null,
    ].filter(Boolean);
  }

  async function analyzeStructuredPlan() {
    const weight = Number(patientAssessment?.weight || 70);
    const height = Number(patientAssessment?.height || 165);
    const objective = goalToObjective(selectedPatient?.goal ?? selectedTemplate);
    setAnalysisStatus("loading");
    setAnalysisMessage("");

    try {
      const energy = requireApiData(
        await apiPost<EnergyTarget>("/nutrition/energy-target", {
          sex: genderToSex(selectedPatient?.gender ?? ""),
          age: ageFromBirthDate(selectedPatient?.birthDate ?? ""),
          weight_kg: String(weight),
          height_cm: String(height),
          activity_level: "moderate",
          objective,
          formula: "mifflin",
        }),
      );
      const macros = requireApiData(
        await apiPost<MacroTargets>("/nutrition/macro-targets", {
          target_kcal: energy.target_kcal,
          weight_kg: String(weight),
          objective,
        }),
      );
      const mealsPayload = requiredMeals.map((meal) => ({
        name: meal,
        items: structuredItems
          .filter((item) => item.meal === meal)
          .map((item) => tacoFoodToNutritionInput(prescriptionFoods.find((food) => food.id === item.foodId) ?? fallbackFood, item.grams)),
      }));
      const analysis = requireApiData(
        await apiPost<MealPlanAnalysis>("/nutrition/meal-plan/analyze", {
          meals: mealsPayload,
          target_kcal: energy.target_kcal,
          target_protein_g: macros.protein_g,
          target_carbs_g: macros.carbs_g,
          target_fat_g: macros.fat_g,
        }),
      );
      const alerts = requireApiData(
        await apiPost<ClinicalAlerts>("/nutrition/clinical-alerts", {
          daily_totals: analysis.daily_totals,
          conditions: inferConditions(),
        }),
      );

      setEnergyTarget(energy);
      setMacroTargets(macros);
      setMealAnalysis(analysis);
      setClinicalAlerts(alerts);
      setAnalysisStatus("ready");
    } catch {
      setAnalysisStatus("error");
      setAnalysisMessage(`Nao foi possivel consultar o backend nutricional. Confira se NEXT_PUBLIC_API_BASE_URL aponta para ${API_BASE_URL.includes("/api/v1") ? API_BASE_URL : `${API_BASE_URL}/api/v1`}.`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Salad} title="Cardapio do paciente" subtitle="Registro de refeicoes, sugestoes por objetivo e analise nutricional para revisao profissional." />
      <SmartCard className="p-5">
        <div className="mb-4 grid gap-4 xl:grid-cols-[360px_1fr]">
          <PatientSelect patients={store.patients} value={patientId} onChange={setPatientId} />
          <div className="rounded-smart border border-sage/70 bg-mist p-3">
            <p className="text-[13px] font-semibold text-forest">Objetivo do paciente</p>
            <p className="mt-1 text-[14px] text-graphite">{selectedPatient?.goal || "Defina o objetivo no cadastro do paciente."}</p>
          </div>
        </div>
        {patientAnamnesis ? (
          <div className="mb-5 rounded-smart border border-sage/70 bg-mist p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[13px] font-semibold text-forest">Direcionamento da anamnese</p>
                <p className="mt-1 text-[14px] leading-6 text-graphite">{patientAnamnesis.mainGoal}</p>
              </div>
              <NutritionBadge label="Guia ativo" value="Anamnese" />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-smart bg-surface p-3">
                <p className="text-[12px] font-semibold text-graphite">Restricoes e preferencias</p>
                <p className="mt-1 text-[12px] leading-5 text-graphite/65">{patientAnamnesis.restrictions || "Sem restricoes registradas."}</p>
              </div>
              <div className="rounded-smart bg-surface p-3">
                <p className="text-[12px] font-semibold text-graphite">Rotina para montar refeicoes</p>
                <p className="mt-1 text-[12px] leading-5 text-graphite/65">{patientAnamnesis.routine || "Sem rotina registrada."}</p>
              </div>
            </div>
          </div>
        ) : null}
        <div className="mb-5 rounded-smart border border-line bg-background p-4">
          <p className="text-[13px] font-semibold text-graphite">Sugestoes comuns para prescricao</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(mealPlanTemplates).map((name) => (
              <button
                className="h-9 rounded-smart border border-line bg-surface px-3 text-[13px] font-semibold text-forest transition duration-200 hover:border-sage hover:bg-mist"
                key={name}
                type="button"
                onClick={() => applyTemplate(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5 rounded-smart border border-line bg-background p-4">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
            <div>
              <p className="text-[13px] font-semibold text-graphite">Registro de cardapio do paciente</p>
              <p className="mt-1 text-[12px] leading-5 text-graphite/65">Resumo das refeicoes cadastradas para consulta rapida antes de salvar ou analisar.</p>
            </div>
            <NutritionBadge label="Base" value="Brasileira" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {mealRecords.map((record) => (
              <article className="rounded-smart border border-line bg-surface p-3" key={record.meal}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-graphite">{record.meal}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-terracotta">{record.time || "Horario livre"}</p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-graphite/65">
                      {record.notes || "Sem orientacao textual registrada."}
                    </p>
                  </div>
                  <NutritionBadge label="kcal" value={record.kcal ? formatNutrient(record.kcal) : "-"} />
                </div>
                <p className="mt-2 text-[12px] font-medium text-forest">
                  {record.items.length} {record.items.length === 1 ? "item estruturado" : "itens estruturados"}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="mb-5 rounded-smart border border-line bg-background p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-[13px] font-semibold text-graphite">Produtos para inserir na dieta</p>
              <p className="mt-1 text-[12px] leading-5 text-graphite/65">
                Escolha alimentos unitarios da base brasileira, defina refeicao e quantidade, e insira direto no cardapio.
              </p>
            </div>
            <Apple className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[160px_120px_1fr]">
            <label className={labelClass}>
              Refeicao
              <select className={inputClass} value={structuredMeal} onChange={(event) => setStructuredMeal(event.target.value)}>
                {requiredMeals.map((meal) => (
                  <option key={meal} value={meal}>{meal}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Gramas
              <input className={inputClass} inputMode="decimal" value={structuredGrams} onChange={(event) => setStructuredGrams(event.target.value)} />
            </label>
            <label className={labelClass}>
              Buscar produto
              <input
                className={inputClass}
                placeholder="Ex.: banana, maca, aveia, mingau..."
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {productQuickSearches.map((item) => (
              <button
                className="h-8 rounded-smart border border-line bg-surface px-3 text-[12px] font-semibold text-forest transition duration-200 hover:border-sage hover:bg-mist"
                key={item}
                type="button"
                onClick={() => setProductQuery(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((food) => (
              <article className="rounded-smart border border-line bg-surface p-3" key={food.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-graphite">{food.name}</p>
                    <p className="mt-1 text-[12px] text-graphite/65">{food.category}</p>
                  </div>
                  <NutritionBadge label="kcal" value={formatNutrient(scaledNutrient(food.kcal, Number(structuredGrams) || 100))} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <NutritionBadge label="P" value={formatNutrient(scaledNutrient(food.protein, Number(structuredGrams) || 100), " g")} />
                  <NutritionBadge label="C" value={formatNutrient(scaledNutrient(food.carbs, Number(structuredGrams) || 100), " g")} />
                  <NutritionBadge label="G" value={formatNutrient(scaledNutrient(food.fat, Number(structuredGrams) || 100), " g")} />
                </div>
                <button
                  className="mt-3 h-8 rounded-smart bg-forest px-3 text-[12px] font-semibold text-white transition duration-200 hover:bg-petrol"
                  type="button"
                  onClick={() => addProductToMeal(food)}
                >
                  Inserir na refeicao
                </button>
              </article>
            ))}
            {filteredProducts.length === 0 ? (
              <p className="text-[13px] text-graphite/65">Nenhum produto encontrado para a busca atual.</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {requiredMeals.map((meal) => (
            <div className="rounded-smart border border-line bg-background p-3" key={meal}>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <label className={labelClass}>
                  Refeicao
                  <input className={inputClass} value={meal} readOnly />
                </label>
                <label className={labelClass}>
                  Horario
                  <input className={inputClass} type="time" value={mealTimes[meal] ?? ""} onChange={(e) => setMealTimes({ ...mealTimes, [meal]: e.target.value })} />
                </label>
              </div>
              <label className={`${labelClass} mt-3 block`}>
                Orientacao do cardapio
                <textarea className={textareaClass} value={meals[meal] ?? ""} onChange={(e) => setMeals({ ...meals, [meal]: e.target.value })} />
              </label>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-smart border border-line bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-graphite">Substituicoes vinculadas a prescricao</p>
              <p className="mt-1 text-[12px] text-graphite/65">Escolha o alimento base brasileira e revise alternativas com energia e macros antes de inserir no plano.</p>
            </div>
            <Repeat2 className="h-5 w-5 text-forest" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_140px_180px]">
            <label className={labelClass}>
              Alimento base da prescricao
              <select className={inputClass} value={referenceFoodId} onChange={(event) => setReferenceFoodId(event.target.value)}>
                {prescriptionFoods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Quantidade g
              <input className={inputClass} inputMode="decimal" value={referenceGrams} onChange={(event) => setReferenceGrams(event.target.value)} />
            </label>
            <label className={labelClass}>
              Inserir em
              <select className={inputClass} value={selectedSubMeal} onChange={(event) => setSelectedSubMeal(event.target.value)}>
                {requiredMeals.map((meal) => (
                  <option key={meal} value={meal}>{meal}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 rounded-smart border border-sage/70 bg-mist p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-forest">{referenceFood.name}</span>
              <NutritionBadge label="kcal" value={formatNutrient(referenceMacros.kcal)} />
              <NutritionBadge label="C" value={formatNutrient(referenceMacros.carbs, " g")} />
              <NutritionBadge label="P" value={formatNutrient(referenceMacros.protein, " g")} />
              <NutritionBadge label="G" value={formatNutrient(referenceMacros.fat, " g")} />
              <NutritionBadge label="Fibra" value={formatNutrient(referenceMacros.fiber, " g")} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {substitutionSuggestions.map((suggestion) => (
              <article className="rounded-smart border border-line bg-surface p-4" key={suggestion.food.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-graphite">{suggestion.food.name}</h3>
                    <p className="mt-1 text-[12px] text-graphite/65">{suggestion.food.category}</p>
                  </div>
                  <button
                    className="h-9 shrink-0 rounded-smart border border-line bg-background px-3 text-[12px] font-semibold text-forest transition duration-200 hover:border-sage hover:bg-mist"
                    type="button"
                    onClick={() => addSubstitutionToMeal(suggestion.food)}
                  >
                    Inserir
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <NutritionBadge label="kcal" value={formatNutrient(suggestion.kcal)} />
                  <NutritionBadge label="C" value={formatNutrient(suggestion.carbs, " g")} />
                  <NutritionBadge label="P" value={formatNutrient(suggestion.protein, " g")} />
                  <NutritionBadge label="G" value={formatNutrient(suggestion.fat, " g")} />
                  <NutritionBadge label="Δ kcal" value={formatNutrient(suggestion.kcalDelta)} />
                  <NutritionBadge label="Δ C" value={formatNutrient(suggestion.carbsDelta, " g")} />
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-5 rounded-smart border border-line bg-background p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-[13px] font-semibold text-graphite">Analise nutricional pelo backend</p>
              <p className="mt-1 text-[12px] text-graphite/65">Monte itens estruturados por refeicao para calcular energia, macros, adequacao e alertas clinicos na API.</p>
            </div>
            <button className={primaryButtonClass} type="button" onClick={analyzeStructuredPlan}>
              {analysisStatus === "loading" ? "Calculando..." : "Analisar plano"}
            </button>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[160px_1fr_120px_120px]">
            <label className={labelClass}>
              Refeicao
              <select className={inputClass} value={structuredMeal} onChange={(event) => setStructuredMeal(event.target.value)}>
                {requiredMeals.map((meal) => (
                  <option key={meal} value={meal}>{meal}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Alimento
              <select className={inputClass} value={structuredFoodId} onChange={(event) => setStructuredFoodId(event.target.value)}>
                {prescriptionFoods.map((food) => (
                  <option key={food.id} value={food.id}>{food.name}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Gramas
              <input className={inputClass} inputMode="decimal" value={structuredGrams} onChange={(event) => setStructuredGrams(event.target.value)} />
            </label>
            <button className="mt-5 h-10 rounded-smart border border-line bg-surface px-3 text-[13px] font-semibold text-forest transition duration-200 hover:border-sage hover:bg-mist" type="button" onClick={addStructuredItem}>
              Inserir item
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {structuredItems.map((item) => {
              const food = prescriptionFoods.find((candidate) => candidate.id === item.foodId) ?? fallbackFood;
              return (
                <div className="flex flex-col gap-2 rounded-smart border border-line bg-surface p-3 md:flex-row md:items-center md:justify-between" key={item.id}>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-graphite">{item.meal} - {food.name}</p>
                    <p className="mt-1 text-[12px] text-graphite/65">{formatNutrient(item.grams, " g")} | {formatNutrient(scaledNutrient(food.kcal, Number(item.grams)), " kcal")}</p>
                  </div>
                  <button className="h-8 rounded-smart border border-line bg-background px-3 text-[12px] font-semibold text-graphite/70 transition duration-200 hover:border-sage hover:text-forest" type="button" onClick={() => removeStructuredItem(item.id)}>
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
          {analysisStatus === "error" ? <p className="mt-3 text-[13px] font-medium text-terracotta">{analysisMessage}</p> : null}
          {mealAnalysis ? (
            <div className="mt-4 grid gap-3 xl:grid-cols-3">
              <div className="rounded-smart border border-sage/70 bg-mist p-3">
                <p className="text-[12px] font-semibold text-forest">Meta diaria</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <NutritionBadge label="kcal" value={formatNutrient(energyTarget?.target_kcal)} />
                  <NutritionBadge label="P" value={formatNutrient(macroTargets?.protein_g, " g")} />
                  <NutritionBadge label="C" value={formatNutrient(macroTargets?.carbs_g, " g")} />
                  <NutritionBadge label="G" value={formatNutrient(macroTargets?.fat_g, " g")} />
                </div>
              </div>
              <div className="rounded-smart border border-line bg-surface p-3">
                <p className="text-[12px] font-semibold text-graphite">Total prescrito</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <NutritionBadge label="kcal" value={formatNutrient(mealAnalysis.daily_totals.kcal)} />
                  <NutritionBadge label="P" value={formatNutrient(mealAnalysis.daily_totals.protein_g, " g")} />
                  <NutritionBadge label="C" value={formatNutrient(mealAnalysis.daily_totals.carbs_g, " g")} />
                  <NutritionBadge label="G" value={formatNutrient(mealAnalysis.daily_totals.fat_g, " g")} />
                </div>
              </div>
              <div className="rounded-smart border border-line bg-surface p-3">
                <p className="text-[12px] font-semibold text-graphite">Alertas</p>
                <div className="mt-2 grid gap-2">
                  {clinicalAlerts?.alerts.map((alert) => (
                    <p className="rounded-smart bg-background px-3 py-2 text-[12px] leading-5 text-graphite" key={alert.code}>
                      {alert.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <button className={primaryButtonClass} type="button" onClick={savePlan}>
            {persistenceStatus === "saving" ? "Salvando..." : "Salvar plano alimentar"}
          </button>
          <button
            className="h-10 rounded-smart border border-line bg-background px-4 text-[14px] font-semibold text-forest transition duration-200 hover:border-sage hover:bg-mist"
            type="button"
            onClick={openMealPlanPdf}
          >
            Gerar PDF do cardapio
          </button>
          {persistenceMessage ? (
            <p className={`text-[13px] font-medium ${persistenceStatus === "error" ? "text-terracotta" : "text-graphite/70"}`}>
              {persistenceMessage}
            </p>
          ) : null}
        </div>
      </SmartCard>
    </div>
  );
}

export function AssessmentsWorkspace() {
  const { store, setStore } = useSmartDietStore();
  const [patientId, setPatientId] = useState(store.patients[0]?.id ?? "");
  const emptyAssessmentForm = { date: "2026-07-07", weight: "", height: "", skinfolds: emptySkinfolds, notes: "" };
  const [form, setForm] = useState(emptyAssessmentForm);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const selectedPatient = store.patients.find((patient) => patient.id === patientId);
  const patientAssessments = store.assessments.filter((item) => item.patientId === patientId);
  const bmi = useMemo(() => {
    const weight = Number(form.weight);
    const heightM = Number(form.height) / 100;
    if (!weight || !heightM) return "";
    return (weight / (heightM * heightM)).toFixed(2);
  }, [form.weight, form.height]);
  const skinfoldMetrics = useMemo(
    () => calculateSkinfoldMetrics(form.skinfolds, selectedPatient),
    [form.skinfolds, selectedPatient],
  );

  useEffect(() => {
    if (store.patients.length > 0 && !store.patients.some((patient) => patient.id === patientId)) {
      setPatientId(store.patients[0].id);
    }
  }, [patientId, store.patients]);

  useEffect(() => {
    async function loadAssessments() {
      if (!hasBackendId(patientId)) return;
      try {
        const assessments = requireApiData(await apiGet<BackendAssessment[]>(`/patients/${patientId}/assessments`));
        setStore((current) => ({
          ...current,
          assessments: [
            ...assessments.map(assessmentFromApi),
            ...current.assessments.filter((item) => item.patientId !== patientId),
          ],
        }));
      } catch {
        setStatusMessage("API indisponivel: exibindo avaliacoes locais.");
      }
    }

    void loadAssessments();
  }, [patientId, setStore]);

  function assessmentPayload() {
    return {
      date: form.date,
      weight_kg: form.weight,
      height_cm: form.height,
      notes: buildAssessmentNotes(form.notes, form.skinfolds),
    };
  }

  function clearAssessmentForm() {
    setForm(emptyAssessmentForm);
    setEditingAssessmentId(null);
  }

  function startEditingAssessment(item: Assessment) {
    setEditingAssessmentId(item.id);
    setPatientId(item.patientId);
    setForm({ date: item.date, weight: item.weight, height: item.height, skinfolds: item.skinfolds ?? emptySkinfolds, notes: item.notes });
    setStatusMessage("");
  }

  async function saveAssessment() {
    if (!patientId || !form.weight || !form.height) return;
    if (editingAssessmentId) {
      let assessment: Assessment = { id: editingAssessmentId, patientId, ...form, bmi, skinfoldSum: skinfoldMetrics.sum, bodyFatPercent: skinfoldMetrics.bodyFatPercent };
      if (hasBackendId(patientId) && hasBackendId(editingAssessmentId)) {
        try {
          const updated = requireApiData(
            await apiPut<BackendAssessment>(`/patients/${patientId}/assessments/${editingAssessmentId}`, assessmentPayload()),
          );
          assessment = assessmentFromApi(updated);
          setStatusMessage("Avaliacao atualizada na API real.");
        } catch {
          setStatusMessage("API indisponivel: avaliacao atualizada apenas no workspace local.");
        }
      } else {
        setStatusMessage("Avaliacao local atualizada no workspace da Beta.");
      }
      setStore((current) => ({
        ...current,
        assessments: current.assessments.map((item) => (item.id === editingAssessmentId ? assessment : item)),
      }));
      clearAssessmentForm();
      return;
    }

    let assessment: Assessment = { id: createId("assessment"), patientId, ...form, bmi, skinfoldSum: skinfoldMetrics.sum, bodyFatPercent: skinfoldMetrics.bodyFatPercent };
    if (hasBackendId(patientId)) {
      try {
        const created = requireApiData(await apiPost<BackendAssessment>(`/patients/${patientId}/assessments`, assessmentPayload()));
        assessment = assessmentFromApi(created);
        setStatusMessage("Avaliacao salva na API real.");
      } catch {
        setStatusMessage("API indisponivel: avaliacao salva apenas no workspace local.");
      }
    }
    setStore((current) => ({ ...current, assessments: [assessment, ...current.assessments] }));
    clearAssessmentForm();
  }

  async function deleteAssessment(item: Assessment) {
    if (hasBackendId(patientId) && hasBackendId(item.id)) {
      try {
        await apiDelete(`/patients/${patientId}/assessments/${item.id}`);
        setStatusMessage("Avaliacao removida da API real.");
      } catch {
        setStatusMessage("API indisponivel: avaliacao removida apenas do workspace local.");
      }
    } else {
      setStatusMessage("Avaliacao local removida do workspace da Beta.");
    }
    setStore((current) => ({ ...current, assessments: current.assessments.filter((assessment) => assessment.id !== item.id) }));
    if (editingAssessmentId === item.id) clearAssessmentForm();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Activity} title="Avaliacoes" subtitle="Avaliacao antropometrica com 7 dobras, percentual de gordura estimado e IMC secundario." />
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[16px] font-semibold text-graphite">{editingAssessmentId ? "Editar avaliacao" : "Nova avaliacao"}</h3>
            {editingAssessmentId ? (
              <button className={secondaryButtonClass} type="button" onClick={clearAssessmentForm}>
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Cancelar
              </button>
            ) : null}
          </div>
          <div className="grid gap-3">
            <PatientSelect patients={store.patients} value={patientId} onChange={setPatientId} />
            <label className={labelClass}>Data<input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <div className="grid gap-3 md:grid-cols-3">
              <label className={labelClass}>Peso kg<input className={inputClass} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></label>
              <label className={labelClass}>Altura cm<input className={inputClass} value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} /></label>
              <label className={labelClass}>IMC secundario<input className={inputClass} value={bmi} readOnly /></label>
            </div>
            <div className="rounded-smart border border-line bg-background p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-graphite">Protocolo de 7 dobras</p>
                  <p className="mt-1 text-[12px] leading-5 text-graphite/65">Use medidas em milimetros para estimar composicao corporal com mais clareza que o IMC isolado.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <NutritionBadge label="Soma" value={skinfoldMetrics.sum ? `${skinfoldMetrics.sum} mm` : "-"} />
                  <NutritionBadge label="Gordura" value={skinfoldMetrics.bodyFatPercent ? `${skinfoldMetrics.bodyFatPercent}%` : "-"} />
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {skinfoldFields.map((field) => (
                  <label className={labelClass} key={field.key}>
                    {field.label}
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={form.skinfolds[field.key]}
                      onChange={(e) => setForm({ ...form, skinfolds: { ...form.skinfolds, [field.key]: e.target.value } })}
                    />
                  </label>
                ))}
              </div>
            </div>
            <label className={labelClass}>Observacoes<textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <button className={primaryButtonClass} type="button" onClick={saveAssessment}>
              {editingAssessmentId ? "Salvar alteracoes" : "Salvar avaliacao"}
            </button>
            {statusMessage ? <p className="text-[13px] font-medium text-graphite/70">{statusMessage}</p> : null}
          </div>
        </SmartCard>
        <HistoryCard
          title="Historico"
          items={patientAssessments.map((item) => ({
            title: `${item.date} - gordura ${item.bodyFatPercent || "-"}%`,
            detail: `7 dobras ${item.skinfoldSum || "-"} mm | peso ${item.weight} kg | altura ${item.height} cm | IMC ${item.bmi}. ${item.notes}`,
            actions: (
              <>
                <button className={secondaryButtonClass} type="button" onClick={() => startEditingAssessment(item)}>
                  <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Editar
                </button>
                <button className={dangerButtonClass} type="button" onClick={() => deleteAssessment(item)}>
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Remover
                </button>
              </>
            ),
          }))}
        />
      </section>
    </div>
  );
}

function HistoryCard({
  title,
  items,
}: {
  title: string;
  items: { title: string; detail: string; actions?: ReactNode }[];
}) {
  return (
    <SmartCard className="p-5">
      <h3 className="text-[16px] font-semibold text-graphite">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <article className="rounded-smart border border-line bg-background p-4" key={item.title}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <h4 className="text-[14px] font-semibold text-graphite">{item.title}</h4>
              {item.actions ? <div className="flex shrink-0 flex-wrap gap-2">{item.actions}</div> : null}
            </div>
            <p className="mt-2 text-[13px] leading-5 text-graphite/70">{item.detail}</p>
          </article>
        ))}
        {items.length === 0 ? <p className="text-[14px] text-graphite/65">Nenhum registro ainda.</p> : null}
      </div>
    </SmartCard>
  );
}

export function FoodsWorkspace() {
  useSmartDietStore();
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [selectedFood, setSelectedFood] = useState<TacoFood | null>(null);
  const [portionGrams, setPortionGrams] = useState("100");
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    preferBrazilianFoods: true,
    compactFoodCards: false,
    showFoodSodium: true,
  });
  const normalizedQuery = normalizeQuery(query);
  const brazilianFoodTables = useMemo(() => [...tbcaFoods, ...tacoFoods], []);
  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(brazilianFoodTables.map((food) => food.category))).sort((a, b) => a.localeCompare(b))],
    [brazilianFoodTables],
  );
  const brazilianResults = brazilianFoodTables
    .filter((food) => {
      const matchesQuery = normalizeQuery(`${food.name} ${food.category} ${food.source}`).includes(normalizedQuery);
      const matchesCategory = categoryFilter === "Todas" || food.category === categoryFilter;
      return matchesQuery && matchesCategory;
    })
    .sort((left, right) => {
      const leftFavorite = favoriteFoodIds.includes(left.id) ? 0 : 1;
      const rightFavorite = favoriteFoodIds.includes(right.id) ? 0 : 1;
      if (leftFavorite !== rightFavorite) return leftFavorite - rightFavorite;
      return left.name.localeCompare(right.name);
    })
    .slice(0, query.trim() ? 80 : 32);
  const visibleTotal = brazilianResults.length;
  const commonSearches = ["arroz", "feijao", "frango", "ovo", "banana", "aveia", "leite", "batata"];
  const portion = Math.max(1, Number(portionGrams) || 100);
  const selectedPortion = selectedFood
    ? {
        kcal: scaledNutrient(selectedFood.kcal, portion),
        protein: scaledNutrient(selectedFood.protein, portion),
        carbs: scaledNutrient(selectedFood.carbs, portion),
        fat: scaledNutrient(selectedFood.fat, portion),
        fiber: scaledNutrient(selectedFood.fiber, portion),
        sodium: scaledNutrient(selectedFood.sodium, portion),
      }
    : null;

  useEffect(() => {
    const raw = window.localStorage.getItem("smartdiet-settings");
    if (raw) {
      setSettings((current) => ({ ...current, ...(JSON.parse(raw) as Partial<typeof settings>) }));
    }
    const favorites = window.localStorage.getItem("smartdiet-favorite-foods");
    if (favorites) {
      setFavoriteFoodIds(JSON.parse(favorites) as string[]);
    }
    const recent = window.localStorage.getItem("smartdiet-recent-food-searches");
    if (recent) {
      setRecentSearches(JSON.parse(recent) as string[]);
    }

    function handleSettings(event: Event) {
      setSettings((current) => ({ ...current, ...((event as CustomEvent<Partial<typeof settings>>).detail ?? {}) }));
    }

    window.addEventListener("smartdiet-settings-changed", handleSettings);
    return () => window.removeEventListener("smartdiet-settings-changed", handleSettings);
  }, []);

  function rememberSearch(value: string) {
    const clean = value.trim();
    if (!clean) return;
    const next = [clean, ...recentSearches.filter((item) => normalizeQuery(item) !== normalizeQuery(clean))].slice(0, 6);
    setRecentSearches(next);
    window.localStorage.setItem("smartdiet-recent-food-searches", JSON.stringify(next));
  }

  function applySearch(value: string) {
    setQuery(value);
    rememberSearch(value);
  }

  function toggleFavorite(foodId: string) {
    const next = favoriteFoodIds.includes(foodId)
      ? favoriteFoodIds.filter((id) => id !== foodId)
      : [foodId, ...favoriteFoodIds].slice(0, 40);
    setFavoriteFoodIds(next);
    window.localStorage.setItem("smartdiet-favorite-foods", JSON.stringify(next));
  }

  function inspectBrazilianFood(food: TacoFood) {
    setSelectedFood(food);
    rememberSearch(food.name);
    setStatusMessage(`${food.name} selecionado para consulta nutricional.`);
  }

  function clearFilters() {
    setQuery("");
    setCategoryFilter("Todas");
    setSelectedFood(null);
    setPortionGrams("100");
    setStatusMessage("Busca e filtros limpos.");
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Apple} title="Alimentos" subtitle="Consulta da base alimentar brasileira para prescricao, porcoes e composicao nutricional." />
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <SmartCard className="p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h3 className="text-[16px] font-semibold text-graphite">Busca alimentar</h3>
              <p className="mt-1 text-[13px] leading-5 text-graphite/65">
                Digite uma comida comum, filtre por grupo e consulte os valores por porcao.
              </p>
            </div>
            <div className="rounded-smart border border-sage/70 bg-mist px-3 py-2 text-[12px] font-semibold text-forest">
              {visibleTotal} resultados
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <label className={labelClass}>
              Buscar alimento
              <input
                className="h-12 w-full rounded-smart border border-line bg-surface px-4 text-[16px] text-graphite transition duration-200 placeholder:text-graphite/45 hover:border-sage focus:border-petrol"
                placeholder="Ex.: arroz, feijao, frango, banana..."
                value={query}
                onBlur={(event) => rememberSearch(event.target.value)}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") rememberSearch(query);
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSearches.map((item) => (
                <button
                  className="h-8 rounded-smart border border-line bg-background px-3 text-[12px] font-semibold text-graphite/70 transition duration-200 hover:border-sage hover:bg-mist hover:text-forest"
                  key={item}
                  type="button"
                  onClick={() => applySearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {recentSearches.length > 0 ? (
              <div className="rounded-smart border border-line bg-background p-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-graphite/70">
                  <Clock3 className="h-4 w-4 text-forest" aria-hidden="true" />
                  Buscas recentes
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentSearches.map((item) => (
                    <button
                      className="h-8 rounded-smart bg-surface px-3 text-[12px] font-semibold text-forest transition duration-200 hover:bg-mist"
                      key={item}
                      type="button"
                      onClick={() => applySearch(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="grid gap-3 md:grid-cols-[1fr_110px]">
              <label className={labelClass}>
                Grupo
                <select className={inputClass} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <button
                className="mt-5 h-10 rounded-smart border border-line bg-background px-3 text-[13px] font-semibold text-graphite/70 transition duration-200 hover:border-sage hover:bg-mist hover:text-forest"
                type="button"
                onClick={clearFilters}
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-smart border border-line bg-background p-3">
              <p className="text-[12px] text-graphite/65">Base alimentar</p>
              <p className="mt-1 text-[22px] font-semibold text-graphite">{tbcaFoods.length}</p>
              <p className="mt-1 text-[12px] text-graphite/60">Itens brasileiros principais</p>
            </div>
            <div className="rounded-smart border border-line bg-background p-3">
              <p className="text-[12px] text-graphite/65">Complementares</p>
              <p className="mt-1 text-[22px] font-semibold text-graphite">{tacoFoods.length}</p>
              <p className="mt-1 text-[12px] text-graphite/60">Usados automaticamente quando necessario</p>
            </div>
            <div className="rounded-smart border border-line bg-background p-3">
              <p className="text-[12px] text-graphite/65">Consulta</p>
              <p className="mt-1 text-[22px] font-semibold text-graphite">{visibleTotal}</p>
              <p className="mt-1 text-[12px] text-graphite/60">Resultados visiveis</p>
            </div>
          </div>
          <div className="mt-3 rounded-smart border border-sage/70 bg-mist p-3 text-[13px] leading-5 text-graphite">
            A base alimentar brasileira ja esta priorizada. O sistema usa dados complementares automaticamente quando necessario.
          </div>

          <div className="mt-4 grid gap-3">
            {brazilianResults.map((food) => (
              <article className={`rounded-smart border border-line bg-background ${settings.compactFoodCards ? "p-3" : "p-4"}`} key={food.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <button
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-smart border border-line transition duration-200 hover:border-sage hover:bg-mist ${
                        favoriteFoodIds.includes(food.id) ? "bg-mist text-forest" : "bg-surface text-graphite/55"
                      }`}
                      title="Favoritar alimento"
                      type="button"
                      onClick={() => toggleFavorite(food.id)}
                    >
                      <Star className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button className="min-w-0 text-left" type="button" onClick={() => setSelectedFood(food)}>
                      <h4 className="text-[14px] font-semibold text-graphite">{food.name}</h4>
                      <p className="mt-1 text-[12px] text-forest">{food.category}</p>
                    </button>
                  </div>
                  <NutritionBadge label="kcal" value={formatNutrient(food.kcal)} />
                </div>
                {!settings.compactFoodCards ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <NutritionBadge label="P" value={formatNutrient(food.protein, " g")} />
                    <NutritionBadge label="C" value={formatNutrient(food.carbs, " g")} />
                    <NutritionBadge label="G" value={formatNutrient(food.fat, " g")} />
                    <NutritionBadge label="Fibra" value={formatNutrient(food.fiber, " g")} />
                    {settings.showFoodSodium ? <NutritionBadge label="Na" value={formatNutrient(food.sodium, " mg")} /> : null}
                  </div>
                ) : null}
                <button
                  className="mt-3 h-8 rounded-smart bg-forest px-3 text-[12px] font-semibold text-white transition duration-200 hover:bg-petrol"
                  type="button"
                  onClick={() => inspectBrazilianFood(food)}
                >
                  Ver porcao
                </button>
              </article>
            ))}
            {brazilianResults.length === 0 ? (
              <p className="text-[14px] text-graphite/65">Nenhum alimento brasileiro encontrado.</p>
            ) : null}
          </div>
        </SmartCard>

        <SmartCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-semibold text-graphite">Detalhe nutricional</h3>
              <p className="mt-1 text-[13px] leading-5 text-graphite/65">Selecione um alimento da base para calcular porcao e revisar nutrientes.</p>
            </div>
            {selectedFood ? <NutritionBadge label="Codigo" value={String(selectedFood.tacoCode)} /> : null}
          </div>
          <div className="mt-4 grid gap-3">
            {selectedFood ? (
              <div className="rounded-smart border border-sage/70 bg-mist p-3">
                <p className="text-[13px] font-semibold text-forest">{selectedFood.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <NutritionBadge label="Fibra" value={formatNutrient(selectedFood.fiber, " g")} />
                  <NutritionBadge label="Na" value={formatNutrient(selectedFood.sodium, " mg")} />
                  <NutritionBadge label="Grupo" value={selectedFood.category} />
                </div>
              </div>
            ) : null}
            <div className="rounded-smart border border-line bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-graphite">Calculadora de porcao</p>
                </div>
                <input
                  className="h-9 w-24 rounded-smart border border-line bg-surface px-3 text-[13px] text-graphite hover:border-sage focus:border-petrol"
                  inputMode="decimal"
                  value={portionGrams}
                  onChange={(event) => setPortionGrams(event.target.value)}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["30", "50", "80", "100", "150", "200"].map((value) => (
                  <button
                    className="h-8 rounded-smart border border-line bg-surface px-3 text-[12px] font-semibold text-graphite/70 transition duration-200 hover:border-sage hover:bg-mist hover:text-forest"
                    key={value}
                    type="button"
                    onClick={() => setPortionGrams(value)}
                  >
                    {value} g
                  </button>
                ))}
              </div>
              {selectedPortion ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <NutritionBadge label="kcal" value={formatNutrient(selectedPortion.kcal)} />
                  <NutritionBadge label="P" value={formatNutrient(selectedPortion.protein, " g")} />
                  <NutritionBadge label="C" value={formatNutrient(selectedPortion.carbs, " g")} />
                  <NutritionBadge label="G" value={formatNutrient(selectedPortion.fat, " g")} />
                  <NutritionBadge label="Fibra" value={formatNutrient(selectedPortion.fiber, " g")} />
                  {settings.showFoodSodium ? <NutritionBadge label="Na" value={formatNutrient(selectedPortion.sodium, " mg")} /> : null}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-graphite/65">Selecione um alimento da busca para calcular a porcao.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="h-10 rounded-smart border border-line bg-background px-4 text-[14px] font-semibold text-graphite/70 transition duration-200 hover:border-sage hover:bg-mist hover:text-forest"
                type="button"
                onClick={() => {
                  setSelectedFood(null);
                }}
              >
                Limpar selecao
              </button>
            </div>
            {statusMessage ? <p className="text-[13px] font-medium text-graphite/70">{statusMessage}</p> : null}
          </div>
        </SmartCard>
      </section>
    </div>
  );
}

export function AnamnesisWorkspace() {
  const { store, setStore } = useSmartDietStore();
  const [patientId, setPatientId] = useState(store.patients[0]?.id ?? "");
  const selectedPatient = store.patients.find((patient) => patient.id === patientId) ?? store.patients[0];
  const current = store.anamnesis.find((item) => item.patientId === patientId);
  const [form, setForm] = useState({
    mainGoal: "Perda de peso",
    clinicalConditions: [] as string[],
    dietaryStyle: "Comida brasileira simples",
    mealPreference: "Cardapio pratico para rotina de trabalho",
    restrictions: "",
    routine: "",
    clinicalNotes: "",
    sleepQuality: "Regular",
    stressLevel: "Moderado",
    bowelFunction: "Regular",
    waterIntake: "1,5 a 2 L/dia",
  });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setForm({
      mainGoal: current?.mainGoal || selectedPatient?.goal || "Perda de peso",
      clinicalConditions: [],
      dietaryStyle: "Comida brasileira simples",
      mealPreference: "Cardapio pratico para rotina de trabalho",
      restrictions: current?.restrictions ?? "",
      routine: current?.routine ?? "",
      clinicalNotes: current?.clinicalNotes ?? "",
      sleepQuality: "Regular",
      stressLevel: "Moderado",
      bowelFunction: "Regular",
      waterIntake: "1,5 a 2 L/dia",
    });
  }, [current?.clinicalNotes, current?.mainGoal, current?.restrictions, current?.routine, patientId, selectedPatient?.goal]);

  const objectiveProfiles = [
    {
      name: "Perda de peso",
      type: "Composicao corporal",
      strategy: [
        "Deficit calorico leve, proteina em todas as refeicoes e alto volume de verduras.",
        "Controlar beliscos, bebidas caloricas e ultraprocessados sem prescricao restritiva demais.",
        "Acompanhar peso, cintura, fome, sono e aderencia semanal.",
      ],
      focusGoals: [
        { focus: "Perda de peso", metric: "Peso", current: "", target: "", status: "Em progresso", notes: "Definir alvo realista apos avaliacao." },
        { focus: "Aderencia ao cardapio", metric: "Aderencia", current: "", target: "85", status: "Em progresso", notes: "Meta inicial: 80-90% de aderencia." },
      ],
      meals: {
        "Cafe da manha": "Ovos ou iogurte natural, fruta e aveia/chia medida.",
        "Lanche da manha": "Fruta, iogurte ou castanhas em porcao pequena.",
        Almoco: "Arroz ou tuberculo medido, feijao, proteina magra, salada grande e legumes.",
        "Lanche da tarde": "Sanduiche simples, iogurte ou fruta com aveia.",
        Jantar: "Proteina magra, legumes/salada e carboidrato ajustado conforme fome/treino.",
        Ceia: "Cha, fruta ou iogurte se houver fome real.",
      },
    },
    {
      name: "Ganho de massa",
      type: "Hipertrofia",
      strategy: [
        "Superavit calorico controlado com proteina distribuida em 4 a 6 momentos.",
        "Carboidratos proximos ao treino e refeicoes com boa densidade energetica.",
        "Monitorar peso, medidas, desempenho no treino e desconforto gastrointestinal.",
      ],
      focusGoals: [
        { focus: "Ganho de massa", metric: "Peso", current: "", target: "", status: "Em progresso", notes: "Subida gradual para reduzir ganho de gordura." },
        { focus: "Performance no treino", metric: "Carga/volume", current: "", target: "", status: "Em progresso", notes: "Cruzar evolucao alimentar com treino." },
      ],
      meals: {
        "Cafe da manha": "Ovos, pao/tapioca, fruta e leite/iogurte conforme tolerancia.",
        "Lanche da manha": "Iogurte com aveia, banana e pasta de amendoim se adequado.",
        Almoco: "Arroz, feijao, frango/carne/peixe, legumes, salada e azeite medido.",
        "Lanche da tarde": "Vitamina, sanduiche proteico ou mingau de aveia.",
        Jantar: "Carboidrato base, proteina magra e legumes.",
        Ceia: "Leite, iogurte, cottage ou outra fonte proteica pratica.",
      },
    },
    {
      name: "Reeducacao alimentar",
      type: "Habitos",
      strategy: [
        "Criar rotina previsivel com comida brasileira simples e substituicoes praticas.",
        "Reduzir ultraprocessados por etapas e manter alimentos preferidos com porcao ajustada.",
        "Acompanhar consistencia, fome/saciedade, agua e organizacao de compras.",
      ],
      focusGoals: [
        { focus: "Educacao alimentar", metric: "Refeicoes planejadas", current: "", target: "5", status: "Em progresso", notes: "Meta semanal de refeicoes planejadas." },
        { focus: "Agua", metric: "Litros/dia", current: "", target: "2", status: "Em progresso", notes: "Ajustar por peso, clima e treino." },
      ],
      meals: {
        "Cafe da manha": "Pao ou tapioca, ovos/queijo/iogurte e fruta.",
        "Lanche da manha": "Fruta ou iogurte natural.",
        Almoco: "Prato brasileiro: arroz, feijao, proteina, salada e legumes.",
        "Lanche da tarde": "Fruta com aveia, sanduiche simples ou iogurte.",
        Jantar: "Versao mais leve do almoco ou omelete com legumes.",
        Ceia: "Opcional conforme fome.",
      },
    },
    {
      name: "Hipertensao",
      type: "Cardiometabolico",
      strategy: [
        "Reduzir sodio, embutidos, temperos prontos e ultraprocessados.",
        "Priorizar frutas, legumes, verduras, feijoes, cereais integrais e laticinios naturais.",
        "Acompanhar pressao arterial, peso, ingestao de sodio e aderencia.",
      ],
      focusGoals: [
        { focus: "Hipertensao", metric: "Pressao arterial", current: "", target: "130/80", status: "Em progresso", notes: "Registrar medidas domiciliares se houver." },
        { focus: "Reducao de sodio", metric: "Ultraprocessados/semana", current: "", target: "0", status: "Em progresso", notes: "Evitar embutidos e temperos prontos." },
      ],
      meals: {
        "Cafe da manha": "Aveia com banana, leite/iogurte natural e sementes.",
        "Lanche da manha": "Fruta com castanhas sem sal.",
        Almoco: "Arroz integral, feijao, frango/peixe, salada grande e pouco sal.",
        "Lanche da tarde": "Iogurte natural ou sanduiche sem embutidos.",
        Jantar: "Peixe/omelete, legumes cozidos e salada.",
        Ceia: "Cha sem acucar ou fruta.",
      },
    },
    {
      name: "Diabetes / resistencia insulinica",
      type: "Controle glicemico",
      strategy: [
        "Distribuir carboidratos com porcoes medidas, fibra e combinacao com proteina.",
        "Evitar bebidas acucaradas e grandes cargas glicemicas isoladas.",
        "Acompanhar glicemia, sintomas, exames e aderencia ao plano.",
      ],
      focusGoals: [
        { focus: "Controle glicemico", metric: "Glicemia/HbA1c", current: "", target: "", status: "Em progresso", notes: "Alinhar alvo com conduta clinica." },
        { focus: "Fibra alimentar", metric: "Porcoes vegetais/dia", current: "", target: "4", status: "Em progresso", notes: "Vegetais, frutas inteiras e feijoes." },
      ],
      meals: {
        "Cafe da manha": "Ovos ou iogurte natural, fruta inteira e aveia medida.",
        "Lanche da manha": "Fruta pequena com castanhas ou queijo.",
        Almoco: "Carboidrato medido, feijao, proteina magra e salada.",
        "Lanche da tarde": "Iogurte com chia ou sanduiche integral simples.",
        Jantar: "Proteina magra, legumes e pequena porcao de carboidrato.",
        Ceia: "Opcional, conforme glicemia/fome e conduta.",
      },
    },
    {
      name: "Performance esportiva",
      type: "Esporte",
      strategy: [
        "Ajustar carboidratos por horario e intensidade de treino.",
        "Garantir proteina diaria, hidratacao e refeicao de recuperacao.",
        "Monitorar rendimento, fadiga, composicao corporal e sintomas gastrointestinais.",
      ],
      focusGoals: [
        { focus: "Performance esportiva", metric: "Treinos bons/semana", current: "", target: "4", status: "Em progresso", notes: "Cruzar com sono e ingestao pre-treino." },
        { focus: "Hidratacao", metric: "Litros/dia", current: "", target: "2.5", status: "Em progresso", notes: "Ajustar por sudorese." },
      ],
      meals: {
        "Cafe da manha": "Carboidrato base, proteina e fruta.",
        "Lanche da manha": "Fruta, iogurte ou sanduiche simples.",
        Almoco: "Arroz/massa/tuberculo, feijao, proteina e vegetais.",
        "Lanche da tarde": "Pre-treino com banana, aveia, pao ou vitamina conforme horario.",
        Jantar: "Refeicao de recuperacao com carboidrato, proteina e legumes.",
        Ceia: "Fonte proteica leve se necessario.",
      },
    },
    {
      name: "Saude intestinal",
      type: "Gastrointestinal",
      strategy: [
        "Mapear sintomas, gatilhos, frequencia intestinal e tolerancia alimentar.",
        "Ajustar fibra, agua, gorduras e fermentaveis conforme resposta.",
        "Evitar exclusoes amplas sem necessidade clinica.",
      ],
      focusGoals: [
        { focus: "Saude intestinal", metric: "Evacuacoes/semana", current: "", target: "7", status: "Em progresso", notes: "Avaliar consistencia e desconforto." },
        { focus: "Sintomas gastrointestinais", metric: "Dias com sintomas", current: "", target: "0", status: "Em progresso", notes: "Registrar gatilhos." },
      ],
      meals: {
        "Cafe da manha": "Fruta tolerada, aveia ou pao simples, proteina leve.",
        "Lanche da manha": "Fruta tolerada ou iogurte conforme tolerancia.",
        Almoco: "Arroz, proteina, legumes tolerados e salada ajustada.",
        "Lanche da tarde": "Lanche simples de baixa irritacao conforme sintomas.",
        Jantar: "Proteina, carboidrato simples e legumes cozidos.",
        Ceia: "Opcional, evitando gatilhos individuais.",
      },
    },
  ];
  const selectedObjectiveProfile = objectiveProfiles.find((profile) => profile.name === form.mainGoal) ?? objectiveProfiles[0];
  const goalPresets = objectiveProfiles.map((profile) => profile.name);
  const conditionPresets = ["Hipertensao", "Diabetes", "Dislipidemia", "Esteatose hepatica", "Gastrite/refluxo", "Constipacao", "SOP", "Hipotireoidismo", "Doenca renal", "Ansiedade/compulsao"];
  const preferencePresets = ["Comida brasileira simples", "Baixo custo", "Vegetariano", "Sem lactose", "Sem gluten", "Marmitas", "Pouco tempo para cozinhar", "Rotina de restaurante"];

  const suggestedPlan = useMemo(() => {
    const conditions = form.clinicalConditions.join(" ").toLowerCase();
    const strategy = [
      ...selectedObjectiveProfile.strategy,
      conditions.includes("hipertensao") && selectedObjectiveProfile.name !== "Hipertensao"
        ? "Ajuste adicional: reduzir sodio, embutidos e temperos prontos."
        : "",
      conditions.includes("diabetes") && selectedObjectiveProfile.name !== "Diabetes / resistencia insulinica"
        ? "Ajuste adicional: medir carboidratos e evitar carboidrato isolado."
        : "",
    ].filter(Boolean);

    return {
      strategy,
      meals: selectedObjectiveProfile.meals,
      focusGoals: selectedObjectiveProfile.focusGoals,
      type: selectedObjectiveProfile.type,
      alerts: [
        form.restrictions ? `Respeitar restricoes: ${form.restrictions}` : "",
        form.routine ? `Ajustar aos horarios/rotina: ${form.routine}` : "",
        form.mealPreference ? `Preferencia declarada: ${form.mealPreference}` : "",
      ].filter(Boolean),
    };
  }, [form, selectedObjectiveProfile]);

  useEffect(() => {
    async function loadAnamnesis() {
      if (!hasBackendId(patientId)) return;
      try {
        const item = requireApiData(await apiGet<BackendAnamnesis>(`/patients/${patientId}/anamnesis`));
        setStore((state) => ({
          ...state,
          anamnesis: [
            {
              patientId,
              mainGoal: item.main_goal ?? "",
              restrictions: [item.food_restrictions, item.allergies, item.intolerances].filter(Boolean).join("\n"),
              routine: item.physical_activity ?? "",
              clinicalNotes: [item.clinical_history, item.diseases, item.medications, item.food_preferences].filter(Boolean).join("\n"),
            },
            ...state.anamnesis.filter((entry) => entry.patientId !== patientId),
          ],
        }));
      } catch {
        setStatusMessage("Anamnese ainda nao encontrada na API ou API indisponivel.");
      }
    }

    void loadAnamnesis();
  }, [patientId, setStore]);

  function toggleCondition(condition: string) {
    setForm((currentForm) => ({
      ...currentForm,
      clinicalConditions: currentForm.clinicalConditions.includes(condition)
        ? currentForm.clinicalConditions.filter((item) => item !== condition)
        : [...currentForm.clinicalConditions, condition],
    }));
  }

  function applyMealPlanDraft() {
    setStore((state) => ({
      ...state,
      mealPlans: [
        { patientId, meals: suggestedPlan.meals },
        ...state.mealPlans.filter((item) => item.patientId !== patientId),
      ],
    }));
    setStatusMessage("Rascunho de cardapio aplicado ao Plano Alimentar do paciente.");
  }

  function buildSuggestedFocusGoals() {
    return suggestedPlan.focusGoals.map((goal) => normalizePatientGoal({
      id: createId("focus"),
      patientId,
      ...goal,
      ...structuredGoalDefaults(goal),
    }));
  }

  async function save() {
    const clinicalSummary = [
      form.clinicalConditions.length ? `Condicoes selecionadas: ${form.clinicalConditions.join(", ")}` : "",
      `Sono: ${form.sleepQuality}`,
      `Estresse: ${form.stressLevel}`,
      `Intestino: ${form.bowelFunction}`,
      `Agua: ${form.waterIntake}`,
      form.clinicalNotes,
      "Sugestao inicial:",
      ...suggestedPlan.strategy,
      ...suggestedPlan.alerts,
    ]
      .filter(Boolean)
      .join("\n");

    setStore((state) => ({
      ...state,
      patients: state.patients.map((patient) => (patient.id === patientId ? { ...patient, goal: form.mainGoal } : patient)),
      anamnesis: [
        {
          patientId,
          mainGoal: form.mainGoal,
          restrictions: form.restrictions,
          routine: form.routine,
          clinicalNotes: clinicalSummary,
        },
        ...state.anamnesis.filter((item) => item.patientId !== patientId),
      ],
      focusGoals: [
        ...buildSuggestedFocusGoals(),
        ...state.focusGoals.filter((goal) => goal.patientId !== patientId),
      ],
      mealPlans: [
        { patientId, meals: suggestedPlan.meals },
        ...state.mealPlans.filter((item) => item.patientId !== patientId),
      ],
    }));
    if (!hasBackendId(patientId)) {
      setStatusMessage("Anamnese salva. Objetivo, metas e rascunho do cardapio foram enviados para as abas seguintes.");
      return;
    }

    try {
      await apiPost<BackendAnamnesis>(`/patients/${patientId}/anamnesis`, {
        main_goal: form.mainGoal || null,
        diseases: form.clinicalConditions.join(", ") || null,
        food_restrictions: form.restrictions || null,
        physical_activity: form.routine || null,
        clinical_history: clinicalSummary || null,
        sleep_quality: form.sleepQuality || null,
        stress_level: form.stressLevel || null,
        bowel_function: form.bowelFunction || null,
        water_intake: form.waterIntake || null,
        food_preferences: `${form.dietaryStyle}; ${form.mealPreference}`,
        objective_type: suggestedPlan.type,
        suggested_strategy: suggestedPlan.strategy,
        suggested_meals: suggestedPlan.meals,
        suggested_goals: suggestedPlan.focusGoals.map(goalToApi),
      });
      await apiPut<BackendPatientGoal[]>(`/patients/${patientId}/goals`, buildSuggestedFocusGoals().map(goalToApi));
      setStatusMessage("Anamnese salva na API real. Objetivo, metas e rascunho do cardapio foram enviados para as abas seguintes.");
    } catch {
      setStatusMessage("API indisponivel: anamnese salva localmente com metas e rascunho de cardapio.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={NotebookTabs}
        title="Anamnese"
        subtitle="Entrevista guiada com objetivos, condicoes, preferencias e sugestao inicial de planejamento."
      />

      <SmartCard className="p-5">
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <PatientSelect patients={store.patients} value={patientId} onChange={setPatientId} />
          <div className="rounded-smart border border-line bg-background p-4">
            <p className="text-[13px] font-semibold text-graphite">Resumo do paciente</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <NutritionBadge label="Nome" value={selectedPatient?.name ?? "-"} />
              <NutritionBadge label="Objetivo atual" value={selectedPatient?.goal || form.mainGoal} />
              <NutritionBadge label="Tipo" value={suggestedPlan.type} />
              <NutritionBadge label="Status" value={selectedPatient?.status ?? "-"} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <section>
              <p className="text-[13px] font-semibold text-graphite">Objetivo principal</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {goalPresets.map((goal) => (
                  <button
                    className={`rounded-smart border px-3 py-3 text-left text-[13px] font-semibold transition duration-200 ${
                      form.mainGoal === goal ? "border-forest bg-mist text-forest" : "border-line bg-background text-graphite/70 hover:border-sage"
                    }`}
                    key={goal}
                    type="button"
                    onClick={() => setForm({ ...form, mainGoal: goal })}
                  >
                    <span className="block">{goal}</span>
                    <span className="mt-1 block text-[11px] font-medium opacity-70">
                      {objectiveProfiles.find((profile) => profile.name === goal)?.type}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[13px] font-semibold text-graphite">Condicoes e pontos de atencao</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {conditionPresets.map((condition) => (
                  <button
                    className={`h-9 rounded-smart border px-3 text-[13px] font-semibold transition duration-200 ${
                      form.clinicalConditions.includes(condition)
                        ? "border-forest bg-mist text-forest"
                        : "border-line bg-background text-graphite/70 hover:border-sage"
                    }`}
                    key={condition}
                    type="button"
                    onClick={() => toggleCondition(condition)}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className={labelClass}>
                Padrao alimentar desejado
                <select className={inputClass} value={form.dietaryStyle} onChange={(event) => setForm({ ...form, dietaryStyle: event.target.value })}>
                  {preferencePresets.map((preference) => (
                    <option key={preference}>{preference}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Estilo do cardapio
                <select className={inputClass} value={form.mealPreference} onChange={(event) => setForm({ ...form, mealPreference: event.target.value })}>
                  <option>Cardapio pratico para rotina de trabalho</option>
                  <option>Cardapio com marmitas</option>
                  <option>Cardapio para treino</option>
                  <option>Cardapio baixo custo</option>
                  <option>Cardapio familiar</option>
                </select>
              </label>
              <label className={labelClass}>
                Sono
                <select className={inputClass} value={form.sleepQuality} onChange={(event) => setForm({ ...form, sleepQuality: event.target.value })}>
                  <option>Bom</option>
                  <option>Regular</option>
                  <option>Ruim</option>
                </select>
              </label>
              <label className={labelClass}>
                Estresse
                <select className={inputClass} value={form.stressLevel} onChange={(event) => setForm({ ...form, stressLevel: event.target.value })}>
                  <option>Baixo</option>
                  <option>Moderado</option>
                  <option>Alto</option>
                </select>
              </label>
              <label className={labelClass}>
                Funcao intestinal
                <select className={inputClass} value={form.bowelFunction} onChange={(event) => setForm({ ...form, bowelFunction: event.target.value })}>
                  <option>Regular</option>
                  <option>Constipacao</option>
                  <option>Diarreia frequente</option>
                  <option>Oscilante</option>
                </select>
              </label>
              <label className={labelClass}>
                Agua
                <select className={inputClass} value={form.waterIntake} onChange={(event) => setForm({ ...form, waterIntake: event.target.value })}>
                  <option>Menos de 1 L/dia</option>
                  <option>1 a 1,5 L/dia</option>
                  <option>1,5 a 2 L/dia</option>
                  <option>Mais de 2 L/dia</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className={labelClass}>
                Restricoes, alergias e alimentos que nao aceita
                <textarea
                  className={textareaClass}
                  placeholder="Ex.: lactose, frutos do mar, nao gosta de ovo..."
                  value={form.restrictions}
                  onChange={(event) => setForm({ ...form, restrictions: event.target.value })}
                />
              </label>
              <label className={labelClass}>
                Rotina, horarios, treino e trabalho
                <textarea
                  className={textareaClass}
                  placeholder="Ex.: treina 18h, almoca fora, leva marmita..."
                  value={form.routine}
                  onChange={(event) => setForm({ ...form, routine: event.target.value })}
                />
              </label>
            </div>

            <label className={labelClass}>
              Observacoes clinicas do profissional
              <textarea
                className={textareaClass}
                placeholder="Medicacoes, exames relevantes, historico clinico, condutas..."
                value={form.clinicalNotes}
                onChange={(event) => setForm({ ...form, clinicalNotes: event.target.value })}
              />
            </label>
          </div>

          <aside className="space-y-4">
            <div className="rounded-smart border border-line bg-background p-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-forest" aria-hidden="true" />
                <p className="text-[13px] font-semibold text-graphite">Planejamento sugerido</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <NutritionBadge label="Projeto" value={form.mainGoal} />
                <NutritionBadge label="Tipo" value={suggestedPlan.type} />
              </div>
              <ul className="mt-3 space-y-2 text-[13px] leading-5 text-graphite/75">
                {suggestedPlan.strategy.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {suggestedPlan.alerts.length > 0 ? (
                <div className="mt-3 rounded-smart bg-mist p-3 text-[13px] leading-5 text-forest">
                  {suggestedPlan.alerts.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-smart border border-line bg-background p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-forest" aria-hidden="true" />
                <p className="text-[13px] font-semibold text-graphite">Metas que serao criadas</p>
              </div>
              <div className="mt-3 space-y-2">
                {suggestedPlan.focusGoals.map((goal) => (
                  <div className="rounded-smart border border-line bg-surface p-3" key={`${goal.focus}-${goal.metric}`}>
                    <p className="text-[13px] font-semibold text-graphite">{goal.focus}</p>
                    <p className="mt-1 text-[12px] text-graphite/65">{goal.metric} | meta inicial: {goal.target || "definir na consulta"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-smart border border-line bg-background p-4">
              <div className="flex items-center gap-2">
                <Salad className="h-4 w-4 text-forest" aria-hidden="true" />
                <p className="text-[13px] font-semibold text-graphite">Cardapio inicial</p>
              </div>
              <div className="mt-3 space-y-3">
                {Object.entries(suggestedPlan.meals).map(([meal, description]) => (
                  <div className="rounded-smart border border-line bg-surface p-3" key={meal}>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-forest">{meal}</p>
                    <p className="mt-1 text-[13px] leading-5 text-graphite/75">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className={primaryButtonClass} type="button" onClick={save}>
                Salvar e guiar abas
              </button>
              <button
                className="inline-flex h-10 items-center justify-center rounded-smart border border-line bg-background px-4 text-[14px] font-semibold text-graphite/70 transition duration-200 hover:border-sage hover:bg-mist hover:text-forest"
                type="button"
                onClick={applyMealPlanDraft}
              >
                Aplicar no plano
              </button>
            </div>
            {statusMessage ? <p className="text-[13px] font-medium text-graphite/70">{statusMessage}</p> : null}
          </aside>
        </div>
      </SmartCard>
    </div>
  );
}

function SimpleClinicalEditor<T extends Record<string, string>>({
  icon,
  title,
  subtitle,
  patients,
  patientId,
  setPatientId,
  fields,
  form,
  setForm,
  onSave,
  statusMessage,
}: {
  icon: typeof Users;
  title: string;
  subtitle: string;
  patients: Patient[];
  patientId: string;
  setPatientId: (value: string) => void;
  fields: [keyof T, string][];
  form: T;
  setForm: (value: T) => void;
  onSave: () => void;
  statusMessage?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader icon={icon} title={title} subtitle={subtitle} />
      <SmartCard className="p-5">
        <div className="max-w-[380px]"><PatientSelect patients={patients} value={patientId} onChange={setPatientId} /></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {fields.map(([key, label]) => (
            <label className={labelClass} key={String(key)}>
              {label}
              <textarea className={textareaClass} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </label>
          ))}
        </div>
        <button className={`${primaryButtonClass} mt-4`} type="button" onClick={onSave}>Salvar</button>
        {statusMessage ? <p className="mt-3 text-[13px] font-medium text-graphite/70">{statusMessage}</p> : null}
      </SmartCard>
    </div>
  );
}

export function BioimpedanceWorkspace() {
  const { store, setStore } = useSmartDietStore();
  const [patientId, setPatientId] = useState(store.patients[0]?.id ?? "");
  const emptyForm = {
    date: "2026-07-07",
    device: "",
    protocol: "",
    bodyFat: "",
    fatMass: "",
    leanMass: "",
    water: "",
    visceralFat: "",
    metabolicAge: "",
    phaseAngle: "",
    boneMass: "",
    bmr: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [editingBioimpedanceId, setEditingBioimpedanceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const items = store.bioimpedance.filter((item) => item.patientId === patientId);

  useEffect(() => {
    if (store.patients.length > 0 && !store.patients.some((patient) => patient.id === patientId)) {
      setPatientId(store.patients[0].id);
    }
  }, [patientId, store.patients]);

  useEffect(() => {
    async function loadBioimpedance() {
      if (!hasBackendId(patientId)) return;
      try {
        const entries = requireApiData(await apiGet<BackendBioimpedance[]>(`/patients/${patientId}/bioimpedance`));
        setStore((state) => ({
          ...state,
          bioimpedance: [
            ...entries.map(bioimpedanceFromApi),
            ...state.bioimpedance.filter((item) => item.patientId !== patientId),
          ],
        }));
      } catch {
        setStatusMessage("API indisponivel: exibindo bioimpedancias locais.");
      }
    }

    void loadBioimpedance();
  }, [patientId, setStore]);

  function bioimpedancePayload() {
    return {
      date: form.date,
      body_fat_percent: form.bodyFat || null,
      fat_mass_kg: form.fatMass || null,
      lean_mass_kg: form.leanMass || null,
      muscle_mass_kg: null,
      total_body_water_l: form.water || null,
      basal_metabolic_rate_kcal: form.bmr || null,
      visceral_fat_level: form.visceralFat || null,
      metabolic_age: form.metabolicAge ? Number(form.metabolicAge) : null,
      notes: [
        form.device ? `Equipamento: ${form.device}` : "",
        form.protocol ? `Protocolo: ${form.protocol}` : "",
        form.phaseAngle ? `Angulo de fase: ${form.phaseAngle}` : "",
        form.boneMass ? `Massa ossea: ${form.boneMass} kg` : "",
        form.notes,
      ].filter(Boolean).join("\n") || null,
    };
  }

  function clearBioimpedanceForm() {
    setForm(emptyForm);
    setEditingBioimpedanceId(null);
  }

  function startEditingBioimpedance(item: Bioimpedance) {
    setEditingBioimpedanceId(item.id);
    setPatientId(item.patientId);
    setForm({
      date: item.date,
      device: item.device ?? "",
      protocol: item.protocol ?? "",
      bodyFat: item.bodyFat,
      fatMass: item.fatMass ?? "",
      leanMass: item.leanMass ?? "",
      water: item.water,
      visceralFat: item.visceralFat ?? "",
      metabolicAge: item.metabolicAge ?? "",
      phaseAngle: item.phaseAngle ?? "",
      boneMass: item.boneMass ?? "",
      bmr: item.bmr,
      notes: item.notes ?? "",
    });
    setStatusMessage("");
  }

  async function save() {
    if (editingBioimpedanceId) {
      let entry: Bioimpedance = { id: editingBioimpedanceId, patientId, ...form };
      if (hasBackendId(patientId) && hasBackendId(editingBioimpedanceId)) {
        try {
          const updated = requireApiData(
            await apiPut<BackendBioimpedance>(`/patients/${patientId}/bioimpedance/${editingBioimpedanceId}`, bioimpedancePayload()),
          );
          entry = bioimpedanceFromApi(updated);
          setStatusMessage("Bioimpedancia atualizada na API real.");
        } catch {
          setStatusMessage("API indisponivel: bioimpedancia atualizada apenas no workspace local.");
        }
      } else {
        setStatusMessage("Bioimpedancia local atualizada no workspace da Beta.");
      }
      setStore((state) => ({
        ...state,
        bioimpedance: state.bioimpedance.map((item) => (item.id === editingBioimpedanceId ? entry : item)),
      }));
      clearBioimpedanceForm();
      return;
    }

    let entry: Bioimpedance = { id: createId("bio"), patientId, ...form };
    if (hasBackendId(patientId)) {
      try {
        const created = requireApiData(
          await apiPost<BackendBioimpedance>(`/patients/${patientId}/bioimpedance`, bioimpedancePayload()),
        );
        entry = bioimpedanceFromApi(created);
        setStatusMessage("Bioimpedancia salva na API real.");
      } catch {
        setStatusMessage("API indisponivel: bioimpedancia salva apenas no workspace local.");
      }
    }
    setStore((state) => ({ ...state, bioimpedance: [entry, ...state.bioimpedance] }));
    clearBioimpedanceForm();
  }

  async function deleteBioimpedance(item: Bioimpedance) {
    if (hasBackendId(patientId) && hasBackendId(item.id)) {
      try {
        await apiDelete(`/patients/${patientId}/bioimpedance/${item.id}`);
        setStatusMessage("Bioimpedancia removida da API real.");
      } catch {
        setStatusMessage("API indisponivel: bioimpedancia removida apenas do workspace local.");
      }
    } else {
      setStatusMessage("Bioimpedancia local removida do workspace da Beta.");
    }
    setStore((state) => ({ ...state, bioimpedance: state.bioimpedance.filter((entry) => entry.id !== item.id) }));
    if (editingBioimpedanceId === item.id) clearBioimpedanceForm();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Scale} title="Bioimpedancia" subtitle="Registro profissional de composicao corporal, protocolo e qualidade da medida." />
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[16px] font-semibold text-graphite">{editingBioimpedanceId ? "Editar bioimpedancia" : "Nova bioimpedancia"}</h3>
            {editingBioimpedanceId ? (
              <button className={secondaryButtonClass} type="button" onClick={clearBioimpedanceForm}>
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Cancelar
              </button>
            ) : null}
          </div>
          <div className="grid gap-3">
            <PatientSelect patients={store.patients} value={patientId} onChange={setPatientId} />
            <div className="grid gap-3 md:grid-cols-3">
              <label className={labelClass}>Data<input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label className={labelClass}>Equipamento<input className={inputClass} placeholder="InBody, Tanita..." value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} /></label>
              <label className={labelClass}>Protocolo<input className={inputClass} placeholder="Jejum, hidratacao, horario" value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })} /></label>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <label className={labelClass}>Gordura %<input className={inputClass} value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} /></label>
              <label className={labelClass}>Massa gorda kg<input className={inputClass} value={form.fatMass} onChange={(e) => setForm({ ...form, fatMass: e.target.value })} /></label>
              <label className={labelClass}>Massa magra kg<input className={inputClass} value={form.leanMass} onChange={(e) => setForm({ ...form, leanMass: e.target.value })} /></label>
              <label className={labelClass}>Agua corporal L<input className={inputClass} value={form.water} onChange={(e) => setForm({ ...form, water: e.target.value })} /></label>
              <label className={labelClass}>Gordura visceral<input className={inputClass} value={form.visceralFat} onChange={(e) => setForm({ ...form, visceralFat: e.target.value })} /></label>
              <label className={labelClass}>Idade metabolica<input className={inputClass} value={form.metabolicAge} onChange={(e) => setForm({ ...form, metabolicAge: e.target.value })} /></label>
              <label className={labelClass}>Angulo de fase<input className={inputClass} value={form.phaseAngle} onChange={(e) => setForm({ ...form, phaseAngle: e.target.value })} /></label>
              <label className={labelClass}>Massa ossea kg<input className={inputClass} value={form.boneMass} onChange={(e) => setForm({ ...form, boneMass: e.target.value })} /></label>
              <label className={labelClass}>TMB kcal<input className={inputClass} value={form.bmr} onChange={(e) => setForm({ ...form, bmr: e.target.value })} /></label>
            </div>
            <label className={labelClass}>Observacoes clinicas<textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <button className={primaryButtonClass} type="button" onClick={save}>
              {editingBioimpedanceId ? "Salvar alteracoes" : "Salvar bioimpedancia"}
            </button>
            {statusMessage ? <p className="text-[13px] font-medium text-graphite/70">{statusMessage}</p> : null}
          </div>
        </SmartCard>
        <HistoryCard
          title="Historico"
          items={items.map((item) => ({
            title: `${item.date} - gordura ${item.bodyFat || "-"}%`,
            detail: `${item.device || "Equipamento nao informado"} | Massa magra ${item.leanMass || "-"} kg, visceral ${item.visceralFat || "-"}, fase ${item.phaseAngle || "-"}, TMB ${item.bmr || "-"} kcal. ${item.notes || ""}`,
            actions: (
              <>
                <button className={secondaryButtonClass} type="button" onClick={() => startEditingBioimpedance(item)}>
                  <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Editar
                </button>
                <button className={dangerButtonClass} type="button" onClick={() => deleteBioimpedance(item)}>
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Remover
                </button>
              </>
            ),
          }))}
        />
      </section>
    </div>
  );
}

export function DiaryWorkspace() {
  const { store, setStore } = useSmartDietStore();
  const [patientId, setPatientId] = useState(store.patients[0]?.id ?? "");
  const emptyDiaryForm = { date: "2026-07-07", meal: "Almoco", description: "", adherence: "Boa" };
  const [form, setForm] = useState(emptyDiaryForm);
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const entries = store.diary.filter((item) => item.patientId === patientId);

  useEffect(() => {
    async function loadDiary() {
      if (!hasBackendId(patientId)) return;
      try {
        const entriesFromApi = requireApiData(await apiGet<BackendDiaryEntry[]>(`/patients/${patientId}/diary`));
        setStore((state) => ({
          ...state,
          diary: [
            ...entriesFromApi.map(diaryFromApi),
            ...state.diary.filter((item) => item.patientId !== patientId),
          ],
        }));
      } catch {
        setStatusMessage("API indisponivel: exibindo diario local.");
      }
    }

    void loadDiary();
  }, [patientId, setStore]);

  function diaryPayload() {
    return {
      date: form.date,
      meal_type: form.meal,
      quantity: "1",
      grams: "100",
      notes: `${form.description}\nAderencia: ${form.adherence}`,
    };
  }

  function clearDiaryForm() {
    setForm(emptyDiaryForm);
    setEditingDiaryId(null);
  }

  function startEditingDiary(item: DiaryEntry) {
    setEditingDiaryId(item.id);
    setPatientId(item.patientId);
    setForm({
      date: item.date,
      meal: item.meal,
      description: item.description,
      adherence: item.adherence,
    });
    setStatusMessage("");
  }

  async function save() {
    if (!form.description.trim()) return;
    if (editingDiaryId) {
      let entry: DiaryEntry = { id: editingDiaryId, patientId, ...form };
      if (hasBackendId(patientId) && hasBackendId(editingDiaryId)) {
        try {
          const updated = requireApiData(
            await apiPut<BackendDiaryEntry>(`/patients/${patientId}/diary/${editingDiaryId}`, diaryPayload()),
          );
          entry = diaryFromApi(updated);
          setStatusMessage("Diario atualizado na API real.");
        } catch {
          setStatusMessage("API indisponivel: diario atualizado apenas no workspace local.");
        }
      } else {
        setStatusMessage("Diario local atualizado no workspace da Beta.");
      }
      setStore((state) => ({
        ...state,
        diary: state.diary.map((item) => (item.id === editingDiaryId ? entry : item)),
      }));
      clearDiaryForm();
      return;
    }

    let entry: DiaryEntry = { id: createId("diary"), patientId, ...form };
    if (hasBackendId(patientId)) {
      try {
        const created = requireApiData(await apiPost<BackendDiaryEntry>(`/patients/${patientId}/diary`, diaryPayload()));
        entry = diaryFromApi(created);
        setStatusMessage("Diario salvo na API real.");
      } catch {
        setStatusMessage("API indisponivel: diario salvo apenas no workspace local.");
      }
    }
    setStore((state) => ({ ...state, diary: [entry, ...state.diary] }));
    clearDiaryForm();
  }

  async function deleteDiary(item: DiaryEntry) {
    if (hasBackendId(patientId) && hasBackendId(item.id)) {
      try {
        await apiDelete(`/patients/${patientId}/diary/${item.id}`);
        setStatusMessage("Diario removido da API real.");
      } catch {
        setStatusMessage("API indisponivel: diario removido apenas do workspace local.");
      }
    } else {
      setStatusMessage("Diario local removido do workspace da Beta.");
    }
    setStore((state) => ({ ...state, diary: state.diary.filter((entry) => entry.id !== item.id) }));
    if (editingDiaryId === item.id) clearDiaryForm();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={ClipboardList} title="Diario alimentar" subtitle="Registro funcional de refeicoes, aderencia e observacoes por paciente." />
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[16px] font-semibold text-graphite">{editingDiaryId ? "Editar registro" : "Novo registro"}</h3>
            {editingDiaryId ? (
              <button className={secondaryButtonClass} type="button" onClick={clearDiaryForm}>
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Cancelar
              </button>
            ) : null}
          </div>
          <div className="grid gap-3">
            <PatientSelect patients={store.patients} value={patientId} onChange={setPatientId} />
            <div className="grid gap-3 md:grid-cols-3">
              <label className={labelClass}>Data<input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label className={labelClass}>Refeicao<input className={inputClass} value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value })} /></label>
              <label className={labelClass}>Aderencia<input className={inputClass} value={form.adherence} onChange={(e) => setForm({ ...form, adherence: e.target.value })} /></label>
            </div>
            <label className={labelClass}>Registro<textarea className={textareaClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className={primaryButtonClass} type="button" onClick={save}>
              {editingDiaryId ? "Salvar alteracoes" : "Registrar diario"}
            </button>
            {statusMessage ? <p className="text-[13px] font-medium text-graphite/70">{statusMessage}</p> : null}
          </div>
        </SmartCard>
        <HistoryCard
          title="Registros"
          items={entries.map((item) => ({
            title: `${item.date} - ${item.meal}`,
            detail: `${item.description} Aderencia: ${item.adherence}.`,
            actions: (
              <>
                <button className={secondaryButtonClass} type="button" onClick={() => startEditingDiary(item)}>
                  <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Editar
                </button>
                <button className={dangerButtonClass} type="button" onClick={() => deleteDiary(item)}>
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Remover
                </button>
              </>
            ),
          }))}
        />
      </section>
    </div>
  );
}

export function SubstitutionsWorkspace() {
  return (
    <div className="space-y-6">
      <PageHeader icon={Repeat2} title="Substituicoes" subtitle="Gerador profissional de alternativas equivalentes para revisao humana." />
      <SmartCard className="p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["Arroz branco cozido", "Batata inglesa cozida", "Mandioca cozida"],
            ["Peito de frango", "Ovos", "Tilapia grelhada"],
            ["Iogurte natural", "Kefir", "Bebida vegetal fortificada"],
          ].map((group, index) => (
            <article className="rounded-smart border border-line bg-background p-4" key={group[0]}>
              <h3 className="text-[15px] font-semibold text-graphite">Grupo {index + 1}</h3>
              <div className="mt-3 space-y-2">
                {group.map((item) => <p className="rounded-smart bg-surface px-3 py-2 text-[13px] text-graphite" key={item}>{item}</p>)}
              </div>
            </article>
          ))}
        </div>
      </SmartCard>
    </div>
  );
}

export function ReportsWorkspace() {
  const { ready, store, setStore } = useSmartDietStore();
  const [patientId, setPatientId] = useState(store.patients[0]?.id ?? "");
  const [reportTab, setReportTab] = useState<"clinical" | "meal">("clinical");
  const [summaryStatus, setSummaryStatus] = useState<"idle" | "loading" | "ready" | "local" | "error">("idle");
  const [summary, setSummary] = useState<PatientReportSummary | null>(null);
  const selectedPatient = store.patients.find((patient) => patient.id === patientId) ?? store.patients[0];
  const selectedAssessments = store.assessments.filter((item) => item.patientId === selectedPatient?.id);
  const selectedBioimpedance = store.bioimpedance.filter((item) => item.patientId === selectedPatient?.id);
  const selectedDiary = store.diary.filter((item) => item.patientId === selectedPatient?.id);
  const selectedPlan = store.mealPlans.find((item) => item.patientId === selectedPatient?.id);
  const selectedAnamnesis = store.anamnesis.find((item) => item.patientId === selectedPatient?.id);
  const selectedGoals = store.focusGoals.filter((item) => item.patientId === selectedPatient?.id);
  const latestAssessment = selectedAssessments[0];
  const latestBioimpedance = selectedBioimpedance[0];
  const latestDiary = selectedDiary[0];
  const diaryAdherenceValues = selectedDiary
    .map((entry) => {
      const match = entry.adherence.match(/\d+(?:[,.]\d+)?/);
      return match ? Number(match[0].replace(",", ".")) : NaN;
    })
    .filter(Number.isFinite);
  const averageDiaryAdherence = diaryAdherenceValues.length
    ? Math.round(diaryAdherenceValues.reduce((total, value) => total + value, 0) / diaryAdherenceValues.length)
    : null;
  const adherenceGoal = selectedGoals.find((goal) => {
    const text = normalizeQuery(`${goal.focus} ${goal.metric}`);
    return text.includes("aderencia");
  });
  const prescriptionFoods = useMemo(() => [...tbcaFoods, ...tacoFoods].filter(hasNutrientData), []);
  const mealPlanItems = selectedPlan?.structuredItems ?? [];
  const mealPlanTotalKcal = mealPlanItems.reduce((total, item) => {
    const food = prescriptionFoods.find((candidate) => candidate.id === item.foodId);
    return total + (scaledNutrient(food?.kcal, Number(item.grams)) ?? 0);
  }, 0);
  const reportSections = [
    { label: "Anamnese", ready: Boolean(selectedAnamnesis), detail: selectedAnamnesis?.mainGoal ?? "Sem anamnese registrada." },
    { label: "Avaliacoes", ready: selectedAssessments.length > 0, detail: `${selectedAssessments.length} registro(s)` },
    { label: "Bioimpedancia", ready: selectedBioimpedance.length > 0, detail: `${selectedBioimpedance.length} registro(s)` },
    { label: "Plano alimentar", ready: Boolean(selectedPlan), detail: selectedPlan ? "Cardapio preenchido" : "Sem plano salvo." },
    { label: "Diario", ready: selectedDiary.length > 0, detail: `${selectedDiary.length} registro(s)` },
    { label: "Metas", ready: selectedGoals.length > 0, detail: `${selectedGoals.length} meta(s)` },
  ];

  useEffect(() => {
    if (store.patients.length > 0 && !store.patients.some((patient) => patient.id === patientId)) {
      setPatientId(store.patients[0].id);
    }
  }, [patientId, store.patients]);

  useEffect(() => {
    async function loadReportWorkspaceData() {
      if (!hasBackendId(patientId)) return;
      try {
        const [plans, assessments, bioimpedance, diary, goals] = await Promise.all([
          apiGet<BackendMealPlan[]>(`/patients/${patientId}/meal-plans`).then(requireApiData),
          apiGet<BackendAssessment[]>(`/patients/${patientId}/assessments`).then(requireApiData),
          apiGet<BackendBioimpedance[]>(`/patients/${patientId}/bioimpedance`).then(requireApiData),
          apiGet<BackendDiaryEntry[]>(`/patients/${patientId}/diary`).then(requireApiData),
          apiGet<BackendPatientGoal[]>(`/patients/${patientId}/goals`).then(requireApiData),
        ]);
        let anamnesis: Anamnesis | null = null;
        try {
          anamnesis = anamnesisFromApi(patientId, requireApiData(await apiGet<BackendAnamnesis>(`/patients/${patientId}/anamnesis`)));
        } catch {
          anamnesis = null;
        }
        setStore((current) => ({
          ...current,
          mealPlans: [
            ...plans.slice(0, 1).map(mealPlanFromApi),
            ...current.mealPlans.filter((item) => item.patientId !== patientId),
          ],
          assessments: [
            ...assessments.map(assessmentFromApi),
            ...current.assessments.filter((item) => item.patientId !== patientId),
          ],
          bioimpedance: [
            ...bioimpedance.map(bioimpedanceFromApi),
            ...current.bioimpedance.filter((item) => item.patientId !== patientId),
          ],
          diary: [
            ...diary.map(diaryFromApi),
            ...current.diary.filter((item) => item.patientId !== patientId),
          ],
          focusGoals: [
            ...goals.map(goalFromApi),
            ...current.focusGoals.filter((item) => item.patientId !== patientId),
          ],
          anamnesis: anamnesis
            ? [anamnesis, ...current.anamnesis.filter((item) => item.patientId !== patientId)]
            : current.anamnesis,
        }));
      } catch {
        setSummaryStatus("error");
      }
    }

    void loadReportWorkspaceData();
  }, [patientId, setStore]);

  useEffect(() => {
    async function loadSummary() {
      setSummary(null);
      if (!hasBackendId(patientId)) {
        setSummaryStatus("local");
        return;
      }
      setSummaryStatus("loading");
      try {
        const result = requireApiData(await apiGet<PatientReportSummary>(`/patients/${patientId}/reports/summary`));
        setSummary(result);
        setSummaryStatus("ready");
      } catch {
        setSummaryStatus("error");
      }
    }

    void loadSummary();
  }, [patientId]);

  function openClinicalPdf() {
    if (!hasBackendId(patientId)) {
      setSummaryStatus("local");
      return;
    }
    window.open(apiUrl(`/patients/${patientId}/reports/clinical-summary.pdf`), "_blank", "noopener,noreferrer");
  }

  function openMealPlanPdfFromReports() {
    if (!hasBackendId(patientId)) {
      setSummaryStatus("local");
      return;
    }
    window.open(apiUrl(`/patients/${patientId}/reports/meal-plan.pdf`), "_blank", "noopener,noreferrer");
  }

  function escapeHtml(value: string | number | undefined | null) {
    return String(value ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mealTextLines(meal: string) {
    return (selectedPlan?.meals?.[meal] ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function localClinicalReportHtml() {
    const rows = [
      ["Nome", selectedPatient?.name],
      ["Status", selectedPatient?.status],
      ["Objetivo", selectedPatient?.goal || "Nao registrado"],
      ["Nascimento", selectedPatient?.birthDate || "Nao informado"],
      ["Genero", selectedPatient?.gender || "Nao informado"],
      ["Telefone", selectedPatient?.phone || "Nao informado"],
      ["Email", selectedPatient?.email || "Nao informado"],
      ["Observacoes do cadastro", selectedPatient?.notes || "Sem observacoes."],
      ["Peso", latestAssessment?.weight ? `${latestAssessment.weight} kg` : "Nao registrado"],
      ["Altura", latestAssessment?.height ? `${latestAssessment.height} cm` : "Nao registrado"],
      ["Soma 7 dobras", latestAssessment?.skinfoldSum ? `${latestAssessment.skinfoldSum} mm` : "Nao registrado"],
      ["Gordura estimada por dobras", latestAssessment?.bodyFatPercent ? `${latestAssessment.bodyFatPercent}%` : "Nao registrado"],
      ["IMC secundario", latestAssessment?.bmi || "Nao registrado"],
      ["Gordura corporal", latestBioimpedance?.bodyFat ? `${latestBioimpedance.bodyFat}%` : "Nao registrado"],
      ["Massa magra", latestBioimpedance?.leanMass ? `${latestBioimpedance.leanMass} kg` : "Nao registrado"],
      ["TMB", latestBioimpedance?.bmr ? `${latestBioimpedance.bmr} kcal` : "Nao registrado"],
    ];
    return `
      <h1>Relatorio clinico</h1>
      <p class="muted">Resumo fisico e clinico para acompanhamento do paciente.</p>
      <section>
        <h2>Resumo fisico</h2>
        <table>${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table>
      </section>
      <section>
        <h2>Historico de avaliacoes</h2>
        ${
          selectedAssessments.length
            ? `<table>${selectedAssessments.map((item) => `<tr><th>${escapeHtml(item.date)}</th><td>${escapeHtml(`7 dobras ${item.skinfoldSum || "-"} mm | gordura ${item.bodyFatPercent || "-"}% | peso ${item.weight} kg | altura ${item.height} cm | IMC ${item.bmi}`)}<br />${escapeHtml(item.notes || "Sem observacoes.")}</td></tr>`).join("")}</table>`
            : "<p>Nenhuma avaliacao registrada.</p>"
        }
      </section>
      <section>
        <h2>Bioimpedancia completa</h2>
        ${
          selectedBioimpedance.length
            ? selectedBioimpedance.map((item) => `
              <article>
                <h3>${escapeHtml(item.date)} <span>${escapeHtml(item.device || "Equipamento nao informado")}</span></h3>
                <table>
                  <tr><th>Protocolo</th><td>${escapeHtml(item.protocol || "Nao informado")}</td></tr>
                  <tr><th>Gordura corporal</th><td>${escapeHtml(item.bodyFat ? `${item.bodyFat}%` : "Nao registrado")}</td></tr>
                  <tr><th>Massa gorda</th><td>${escapeHtml(item.fatMass ? `${item.fatMass} kg` : "Nao registrado")}</td></tr>
                  <tr><th>Massa magra</th><td>${escapeHtml(item.leanMass ? `${item.leanMass} kg` : "Nao registrado")}</td></tr>
                  <tr><th>Agua corporal</th><td>${escapeHtml(item.water ? `${item.water} L` : "Nao registrado")}</td></tr>
                  <tr><th>Gordura visceral</th><td>${escapeHtml(item.visceralFat || "Nao registrado")}</td></tr>
                  <tr><th>Idade metabolica</th><td>${escapeHtml(item.metabolicAge || "Nao registrado")}</td></tr>
                  <tr><th>Angulo de fase</th><td>${escapeHtml(item.phaseAngle || "Nao registrado")}</td></tr>
                  <tr><th>Massa ossea</th><td>${escapeHtml(item.boneMass ? `${item.boneMass} kg` : "Nao registrado")}</td></tr>
                  <tr><th>TMB</th><td>${escapeHtml(item.bmr ? `${item.bmr} kcal` : "Nao registrado")}</td></tr>
                  <tr><th>Observacoes</th><td>${escapeHtml(item.notes || "Sem observacoes.")}</td></tr>
                </table>
              </article>
            `).join("")
            : "<p>Nenhuma bioimpedancia registrada.</p>"
        }
      </section>
      <section>
        <h2>Anamnese e conduta</h2>
        <p><strong>Objetivo principal:</strong> ${escapeHtml(selectedAnamnesis?.mainGoal || selectedPatient?.goal || "Nao registrado")}</p>
        <p><strong>Restricoes:</strong> ${escapeHtml(selectedAnamnesis?.restrictions || "Sem restricoes registradas.")}</p>
        <p><strong>Rotina:</strong> ${escapeHtml(selectedAnamnesis?.routine || "Sem rotina registrada.")}</p>
        <p><strong>Notas clinicas:</strong> ${escapeHtml(selectedAnamnesis?.clinicalNotes || "Sem notas clinicas registradas.")}</p>
      </section>
      <section>
        <h2>Metas acompanhadas</h2>
        ${
          selectedGoals.length
            ? `<ul>${selectedGoals.map((goal) => `<li><strong>${escapeHtml(goal.focus)}</strong>: ${escapeHtml(goal.current || "-")} de ${escapeHtml(goal.target || "-")} ${escapeHtml(goal.unit || "")} (${escapeHtml(goal.status)}). ${escapeHtml(goal.notes || "")}</li>`).join("")}</ul>`
            : "<p>Nenhuma meta registrada.</p>"
        }
      </section>
      <section>
        <h2>Diario alimentar</h2>
        ${
          selectedDiary.length
            ? `<table>${selectedDiary.map((entry) => `<tr><th>${escapeHtml(`${entry.date} - ${entry.meal}`)}</th><td>${escapeHtml(entry.description)}<br /><strong>Aderencia:</strong> ${escapeHtml(entry.adherence)}</td></tr>`).join("")}</table>`
            : "<p>Nenhum diario alimentar registrado.</p>"
        }
      </section>
    `;
  }

  function localMealReportHtml() {
    const patientRows = [
      ["Nome", selectedPatient?.name],
      ["Status", selectedPatient?.status],
      ["Objetivo atual", selectedPatient?.goal || selectedAnamnesis?.mainGoal || "Nao registrado"],
      ["Nascimento", selectedPatient?.birthDate || "Nao informado"],
      ["Genero", selectedPatient?.gender || "Nao informado"],
      ["Restricoes", selectedAnamnesis?.restrictions || "Sem restricoes registradas."],
      ["Rotina alimentar", selectedAnamnesis?.routine || "Sem rotina registrada."],
      ["Meta de aderencia ao cardapio", adherenceGoal?.target ? `${adherenceGoal.target}${adherenceGoal.unit || ""}` : "Sem meta cadastrada"],
      ["Aderencia media registrada", averageDiaryAdherence !== null ? `${averageDiaryAdherence}%` : "Sem registro no diario"],
      ["Ultimo registro de aderencia", latestDiary ? `${latestDiary.date} - ${latestDiary.meal}: ${latestDiary.adherence || "Nao informado"}` : "Sem registro no diario"],
      ["Registros no diario alimentar", selectedDiary.length ? `${selectedDiary.length} registro(s)` : "Sem registros"],
      ["Total energetico estruturado", formatNutrient(mealPlanTotalKcal, " kcal")],
      ["Refeicoes no cardapio", `${requiredMeals.filter((meal) => selectedPlan?.meals?.[meal] || mealPlanItems.some((item) => item.meal === meal)).length} de ${requiredMeals.length}`],
    ];
    const mealGoalRows = [
      ["Objetivo do plano", selectedAnamnesis?.mainGoal || selectedPatient?.goal || "Nao registrado"],
      ["Restricoes e preferencias", selectedAnamnesis?.restrictions || "Sem restricoes registradas."],
      ["Rotina considerada", selectedAnamnesis?.routine || "Sem rotina registrada."],
      ["Conduta/observacoes", selectedAnamnesis?.clinicalNotes || selectedPatient?.notes || "Sem observacoes registradas."],
      ["Meta de aderencia", adherenceGoal?.target ? `${adherenceGoal.target}${adherenceGoal.unit || ""}` : "Sem meta cadastrada"],
      ["Aderencia media", averageDiaryAdherence !== null ? `${averageDiaryAdherence}%` : "Sem registro no diario"],
    ];
    const bioimpedanceRows = [
      ["Data", latestBioimpedance?.date || "Nao registrado"],
      ["Gordura corporal", latestBioimpedance?.bodyFat ? `${latestBioimpedance.bodyFat}%` : "Nao registrado"],
      ["Massa gorda", latestBioimpedance?.fatMass ? `${latestBioimpedance.fatMass} kg` : "Nao registrado"],
      ["Massa magra", latestBioimpedance?.leanMass ? `${latestBioimpedance.leanMass} kg` : "Nao registrado"],
      ["Agua corporal", latestBioimpedance?.water ? `${latestBioimpedance.water} L` : "Nao registrado"],
      ["Gordura visceral", latestBioimpedance?.visceralFat || "Nao registrado"],
      ["TMB", latestBioimpedance?.bmr ? `${latestBioimpedance.bmr} kcal` : "Nao registrado"],
    ];
    return `
      <h1>Resumo alimentar / Plano alimentar</h1>
      <p class="muted">Dieta organizada a partir dos dados preenchidos pelo nutricionista para o paciente seguir e revisar.</p>
      <section>
        <h2>Dados do paciente</h2>
        <table>${patientRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table>
      </section>
      <section>
        <h2>Bioimpedancia</h2>
        <table>${bioimpedanceRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table>
      </section>
      <section>
        <h2>Orientacoes do nutricionista</h2>
        <table>${mealGoalRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table>
      </section>
      <section>
        <h2>Plano por refeicao</h2>
        ${requiredMeals.map((meal) => {
          const items = mealPlanItems.filter((item) => item.meal === meal);
          const kcal = items.reduce((total, item) => {
            const food = prescriptionFoods.find((candidate) => candidate.id === item.foodId);
            return total + (scaledNutrient(food?.kcal, Number(item.grams)) ?? 0);
          }, 0);
          return `
            <article>
              <h3>${escapeHtml(meal)} <span>${escapeHtml(selectedPlan?.mealTimes?.[meal] || defaultMealTimes[meal] || "")}</span></h3>
              ${
                mealTextLines(meal).length
                  ? `<ul>${mealTextLines(meal).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
                  : "<p>Sem orientacao textual.</p>"
              }
              <p><strong>Kcal estruturadas:</strong> ${escapeHtml(kcal ? formatNutrient(kcal, " kcal") : "-")}</p>
              ${
                items.length
                  ? `<ul>${items.map((item) => {
                      const food = prescriptionFoods.find((candidate) => candidate.id === item.foodId);
                      return `<li>${escapeHtml(item.grams)} g - ${escapeHtml(food?.name || "Alimento")} (${escapeHtml(formatNutrient(scaledNutrient(food?.kcal, Number(item.grams)), " kcal"))})</li>`;
                    }).join("")}</ul>`
                  : "<p>Nenhum item estruturado nesta refeicao.</p>"
              }
            </article>
          `;
        }).join("")}
      </section>
      <section>
        <h2>Diario e aderencia</h2>
        ${
          selectedDiary.length
            ? `<table>${selectedDiary.map((entry) => `<tr><th>${escapeHtml(`${entry.date} - ${entry.meal}`)}</th><td>${escapeHtml(entry.description)}<br /><strong>Aderencia:</strong> ${escapeHtml(entry.adherence)}</td></tr>`).join("")}</table>`
            : "<p>Nenhum diario alimentar registrado.</p>"
        }
      </section>
    `;
  }

  function localReportDocument(kind: "clinical" | "meal") {
    const title = kind === "clinical" ? "Relatorio clinico" : "Versao para paciente";
    const body = kind === "clinical" ? localClinicalReportHtml() : localMealReportHtml();
    return `<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(title)} - ${escapeHtml(selectedPatient?.name)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #2f3742; line-height: 1.45; }
            h1 { margin: 0 0 6px; color: #168A5A; }
            h2 { margin: 24px 0 10px; color: #3F4652; border-bottom: 2px solid #F97316; padding-bottom: 6px; }
            h3 { margin: 16px 0 6px; }
            h3 span { color: #F97316; font-size: 13px; margin-left: 8px; }
            section, article { break-inside: avoid; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #D6DAE1; padding: 9px; text-align: left; vertical-align: top; }
            th { width: 210px; background: #F3F4F6; }
            ul { margin-top: 8px; }
            .muted { color: #68717d; margin-top: 0; }
          </style>
        </head>
        <body>${body}</body>
      </html>`;
  }

  function printLocalReport(kind: "clinical" | "meal") {
    const popup = window.open("", "_blank", "width=900,height=1200");
    if (!popup) return;
    popup.document.write(localReportDocument(kind));
    popup.document.close();
    popup.onload = () => {
      popup.focus();
      popup.print();
    };
    window.setTimeout(() => {
      popup.focus();
      popup.print();
    }, 250);
  }

  function downloadLocalReport(kind: "clinical" | "meal") {
    const html = localReportDocument(kind);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${kind === "clinical" ? "relatorio-clinico" : "plano-alimentar-paciente"}-${normalizeQuery(selectedPatient?.name ?? "paciente").replace(/\s+/g, "-")}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Database} title="Relatorios" subtitle="Relatorio clinico e versao para paciente com plano alimentar completo." />
      {!ready ? <StateBanner tone="loading" title="Carregando workspace" detail="Sincronizando dados locais antes de montar os relatorios." /> : null}
      <section className="grid gap-4 md:grid-cols-4">
        <SmartCard className="p-5"><p className="text-[13px] text-graphite/65">Pacientes</p><p className="mt-2 text-[28px] font-semibold">{store.patients.length}</p></SmartCard>
        <SmartCard className="p-5"><p className="text-[13px] text-graphite/65">Planos</p><p className="mt-2 text-[28px] font-semibold">{store.mealPlans.length}</p></SmartCard>
        <SmartCard className="p-5"><p className="text-[13px] text-graphite/65">Avaliacoes</p><p className="mt-2 text-[28px] font-semibold">{store.assessments.length}</p></SmartCard>
        <SmartCard className="p-5"><p className="text-[13px] text-graphite/65">Diarios</p><p className="mt-2 text-[28px] font-semibold">{store.diary.length}</p></SmartCard>
      </section>
      <SmartCard className="p-5">
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <PatientSelect patients={store.patients} value={patientId} onChange={setPatientId} />
            {summaryStatus === "loading" ? <StateBanner tone="loading" title="Consultando backend" detail="Buscando disponibilidade de exportacao e secoes do relatorio." /> : null}
            {summaryStatus === "ready" ? (
              <StateBanner
                tone="success"
                title="PDF disponivel"
                detail={`${summary?.sections.length ?? 0} secoes confirmadas pela API para este paciente.`}
              />
            ) : null}
            {summaryStatus === "local" ? (
              <StateBanner
                tone="warning"
                title="Paciente local da Beta"
                detail="O resumo na tela esta completo, mas o PDF backend exige paciente salvo no PostgreSQL."
              />
            ) : null}
            {summaryStatus === "error" ? (
              <StateBanner
                tone="error"
                title="API indisponivel"
                detail={`Confira se o backend esta online e se NEXT_PUBLIC_API_BASE_URL aponta para ${API_BASE_URL}.`}
              />
            ) : null}
            <div className="grid grid-cols-2 gap-2 rounded-smart border border-line bg-background p-1">
              <button
                className={`h-9 rounded-smart text-[12px] font-semibold transition duration-200 ${reportTab === "clinical" ? "bg-forest text-white" : "text-graphite hover:bg-mist hover:text-forest"}`}
                type="button"
                onClick={() => setReportTab("clinical")}
              >
                Relatorio clinico
              </button>
              <button
                className={`h-9 rounded-smart text-[12px] font-semibold transition duration-200 ${reportTab === "meal" ? "bg-forest text-white" : "text-graphite hover:bg-mist hover:text-forest"}`}
                type="button"
                onClick={() => setReportTab("meal")}
              >
                Resumo alimentar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button className={primaryButtonClass} type="button" onClick={reportTab === "clinical" ? openClinicalPdf : openMealPlanPdfFromReports}>
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {reportTab === "clinical" ? "Baixar relatorio clinico PDF" : "Baixar cardapio PDF"}
              </button>
              <button className={secondaryButtonClass} type="button" onClick={() => downloadLocalReport(reportTab)}>
                <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                Baixar versao para paciente
              </button>
              <button className={secondaryButtonClass} type="button" onClick={() => printLocalReport(reportTab)}>
                <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                Imprimir versao para paciente
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {selectedPatient ? (
              <div className="rounded-smart border border-line bg-background p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="text-[12px] font-semibold text-forest">Paciente selecionado</p>
                    <h3 className="mt-1 text-[20px] font-semibold text-graphite">{selectedPatient.name}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-graphite/70">{selectedPatient.goal || "Objetivo ainda nao registrado."}</p>
                  </div>
                  <NutritionBadge label="Status" value={selectedPatient.status} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <NutritionBadge label="Avaliacoes" value={String(selectedAssessments.length)} />
                  <NutritionBadge label="Bioimpedancia" value={String(selectedBioimpedance.length)} />
                  <NutritionBadge label="Diario" value={String(selectedDiary.length)} />
                </div>
                {reportTab === "meal" ? (
                  <div className="mt-4 rounded-smart border border-line bg-surface p-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-graphite">Bioimpedancia</p>
                        <p className="mt-1 text-[12px] leading-5 text-graphite/65">
                          Composicao corporal de apoio para interpretar o plano alimentar e as metas energeticas.
                        </p>
                      </div>
                      <NutritionBadge label="Data" value={latestBioimpedance?.date || "-"} />
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      <NutritionBadge label="Gordura" value={latestBioimpedance?.bodyFat ? `${latestBioimpedance.bodyFat}%` : "-"} />
                      <NutritionBadge label="Massa magra" value={latestBioimpedance?.leanMass ? `${latestBioimpedance.leanMass} kg` : "-"} />
                      <NutritionBadge label="TMB" value={latestBioimpedance?.bmr ? `${latestBioimpedance.bmr} kcal` : "-"} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState title="Nenhum paciente encontrado" detail="Cadastre um paciente para liberar os resumos e PDFs." />
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {reportSections.map((section) => (
                <article className="min-h-[104px] rounded-smart border border-line bg-background p-4" key={section.label}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-graphite">{section.label}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-graphite/65">{section.detail}</p>
                    </div>
                    {section.ready ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    )}
                  </div>
                </article>
              ))}
            </div>
            {reportSections.every((section) => !section.ready) ? (
              <EmptyState title="Relatorio sem conteudo clinico" detail="Preencha anamnese, avaliacoes, diario ou plano alimentar para compor o resumo." />
            ) : null}
            {reportTab === "clinical" ? (
              <div className="rounded-smart border border-line bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-graphite">Relatorio clinico e resumo fisico</p>
                    <p className="mt-1 text-[12px] leading-5 text-graphite/65">Conteudo voltado para avaliacao, bioimpedancia, anamnese e metas acompanhadas.</p>
                  </div>
                  <NutritionBadge label="7 dobras" value={latestAssessment?.skinfoldSum ? `${latestAssessment.skinfoldSum} mm` : "-"} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <NutritionBadge label="Peso" value={latestAssessment?.weight ? `${latestAssessment.weight} kg` : "-"} />
                  <NutritionBadge label="Gordura dobras" value={latestAssessment?.bodyFatPercent ? `${latestAssessment.bodyFatPercent}%` : "-"} />
                  <NutritionBadge label="Gordura bio" value={latestBioimpedance?.bodyFat ? `${latestBioimpedance.bodyFat}%` : "-"} />
                </div>
              </div>
            ) : (
              <div className="rounded-smart border border-line bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-graphite">Resumo alimentar estruturado</p>
                    <p className="mt-1 text-[12px] leading-5 text-graphite/65">Mostra horarios, orientacoes e calorias dos itens estruturados do plano alimentar.</p>
                  </div>
                  <NutritionBadge label="kcal" value={mealPlanTotalKcal ? formatNutrient(mealPlanTotalKcal) : "-"} />
                </div>
                <div className="mt-4 grid gap-2">
                  {requiredMeals.map((meal) => {
                    const items = mealPlanItems.filter((item) => item.meal === meal);
                    return (
                      <div className="rounded-smart border border-line bg-surface p-3" key={meal}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-semibold text-graphite">{meal}</p>
                            <p className="mt-1 text-[12px] text-terracotta">{selectedPlan?.mealTimes?.[meal] || defaultMealTimes[meal]}</p>
                          </div>
                          <NutritionBadge label="Itens" value={String(items.length)} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-graphite/65">{selectedPlan?.meals?.[meal] || "Sem orientacao textual."}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </SmartCard>
    </div>
  );
}
