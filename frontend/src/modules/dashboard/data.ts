export const metrics = [
  {
    label: "Pacientes ativos",
    value: "1",
    trend: "1 em acompanhamento",
    tone: "forest" as const,
  },
  {
    label: "Planos da semana",
    value: "0",
    trend: "Nenhum plano criado",
    tone: "petrol" as const,
  },
  {
    label: "Avaliacoes recentes",
    value: "2",
    trend: "Avaliacao fisica e bioimpedancia",
    tone: "terracotta" as const,
  },
];

export const patients = [
  {
    name: "Gordeli",
    goal: "Acompanhamento nutricional",
    status: "Ativo",
    nextAction: "Definir metas clinicas",
    lastMetric: "87 kg | 28% gordura",
  },
];

export const importedFoods = [
  {
    name: "Iogurte natural integral",
    source: "Base brasileira",
    kcal: "61 kcal",
    protein: "3.5 g",
    carbs: "4.7 g",
    fat: "3.3 g",
  },
  {
    name: "Aveia em flocos",
    source: "Base brasileira",
    kcal: "389 kcal",
    protein: "16.9 g",
    carbs: "66.3 g",
    fat: "6.9 g",
  },
  {
    name: "Frango, peito, sem pele, grelhado",
    source: "Base brasileira",
    kcal: "159 kcal",
    protein: "32 g",
    carbs: "0 g",
    fat: "2.5 g",
  },
];

export const meals = [
  {
    name: "Cafe da manha",
    time: "07:30",
    items: "Iogurte, aveia, banana",
    kcal: "410",
    protein: "22 g",
    carbs: "56 g",
    fat: "11 g",
  },
  {
    name: "Lanche da manha",
    time: "10:00",
    items: "Fruta e castanhas",
    kcal: "190",
    protein: "5 g",
    carbs: "21 g",
    fat: "10 g",
  },
  {
    name: "Almoco",
    time: "12:30",
    items: "Arroz, feijao, frango, salada",
    kcal: "640",
    protein: "42 g",
    carbs: "72 g",
    fat: "18 g",
  },
  {
    name: "Lanche da tarde",
    time: "16:00",
    items: "Sanduiche integral",
    kcal: "310",
    protein: "19 g",
    carbs: "38 g",
    fat: "9 g",
  },
  {
    name: "Jantar",
    time: "19:30",
    items: "Omelete, legumes, batata",
    kcal: "520",
    protein: "35 g",
    carbs: "46 g",
    fat: "20 g",
  },
  {
    name: "Ceia",
    time: "22:00",
    items: "Cha e fruta",
    kcal: "120",
    protein: "2 g",
    carbs: "28 g",
    fat: "1 g",
  },
];

export const timeline = [
  {
    title: "Paciente cadastrado",
    detail: "Gordeli recebeu avaliacao inicial e bioimpedancia.",
    time: "--:--",
  },
  {
    title: "Base alimentar disponivel",
    detail: "Dados brasileiros disponiveis para prescricao.",
    time: "--:--",
  },
];
