"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ClipboardList, Download, FileText, Loader2, Plus, Save, Users } from "lucide-react";

import { SmartCard } from "@/shared/components/smart-card";
import { ApiError, apiBlob, apiGet, apiPost, apiPut, requireApiData } from "@/shared/api/client";

type Patient = {
  id: number;
  full_name: string;
  birth_date: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
};

type Anamnesis = {
  main_goal: string | null;
  clinical_history: string | null;
  family_history: string | null;
  allergies: string | null;
  intolerances: string | null;
  medications: string | null;
  diseases: string | null;
  surgeries: string | null;
  sleep_quality: string | null;
  stress_level: string | null;
  bowel_function: string | null;
  water_intake: string | null;
  alcohol_use: string | null;
  smoking: string | null;
  physical_activity: string | null;
  food_preferences: string | null;
  food_restrictions: string | null;
};

type PhysicalAssessment = {
  id: number;
  date: string;
  weight_kg: string;
  height_cm: string;
  bmi: string;
  body_fat_percent: string | null;
  chest_skinfold_mm: string | null;
  midaxillary_skinfold_mm: string | null;
  triceps_skinfold_mm: string | null;
  subscapular_skinfold_mm: string | null;
  abdominal_skinfold_mm: string | null;
  suprailiac_skinfold_mm: string | null;
  thigh_skinfold_mm: string | null;
};

type Bioimpedance = {
  id: number;
  date: string;
  body_fat_percent: string | null;
  fat_mass_kg: string | null;
  lean_mass_kg: string | null;
  muscle_mass_kg: string | null;
  total_body_water_l: string | null;
  basal_metabolic_rate_kcal: string | null;
  visceral_fat_level: string | null;
  metabolic_age: number | null;
};

type MealPlan = {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  target_kcal: string | null;
  target_protein_g: string | null;
  target_carbs_g: string | null;
  target_fat_g: string | null;
  notes: string | null;
  meals: Array<{
    meal_type: string;
    time: string | null;
    notes: string | null;
    items: Array<{ notes: string | null; grams: string }>;
  }>;
};

type ReportSummary = {
  patient_id: number;
  patient_name: string;
  patient_status: string;
  main_goal: string | null;
  clinical_history: string | null;
  food_restrictions: string | null;
  latest_weight_kg: string | null;
  latest_bmi: string | null;
  latest_body_fat_percent: string | null;
  latest_assessment_date: string | null;
  active_meal_plan: string | null;
  assessment_count: number;
  bioimpedance_count: number;
  meal_plan_count: number;
  diary_count: number;
  goal_count: number;
};

const inputClass = "h-10 w-full rounded-smart border border-line bg-surface px-3 text-[14px] text-graphite outline-none transition focus:border-forest focus:ring-2 focus:ring-sage/40";
const textareaClass = "min-h-[92px] w-full resize-y rounded-smart border border-line bg-surface px-3 py-2 text-[14px] leading-5 text-graphite outline-none transition focus:border-forest focus:ring-2 focus:ring-sage/40";
const labelClass = "grid gap-1.5 text-[13px] font-semibold text-graphite";
const secondaryButtonClass = "inline-flex h-10 items-center justify-center gap-2 rounded-smart border border-line bg-surface px-4 text-[14px] font-semibold text-graphite transition hover:border-sage hover:text-forest";
const requiredMeals = ["Cafe da manha", "Lanche da manha", "Almoco", "Lanche da tarde", "Jantar", "Ceia"];
const defaultTimes: Record<string, string> = {
  "Cafe da manha": "07:00",
  "Lanche da manha": "10:00",
  Almoco: "12:30",
  "Lanche da tarde": "16:00",
  Jantar: "19:30",
  Ceia: "22:00",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nullable(value: string) {
  return value.trim() || null;
}

function apiFailure(error: unknown) {
  if (error instanceof ApiError && error.status === 422) return "Revise os campos obrigatórios e os valores informados.";
  return "Não foi possível salvar no banco de dados. Verifique a API e tente novamente.";
}

function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setPatients(requireApiData(await apiGet<Patient[]>("/patients")));
      setError("");
    } catch {
      setError("Não foi possível carregar os pacientes do banco de dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { patients, loading, error, reload };
}

function usePatientSelection(patients: Patient[]) {
  const [patientId, setPatientId] = useState(0);
  useEffect(() => {
    if (!patients.length) return;
    const requested = Number(new URLSearchParams(window.location.search).get("patient"));
    const initial = patients.some((patient) => patient.id === requested) ? requested : patients[0].id;
    if (!patients.some((patient) => patient.id === patientId)) setPatientId(initial);
  }, [patientId, patients]);
  return [patientId, setPatientId] as const;
}

function PageIntro({ icon: Icon, title, description }: { icon: typeof Users; title: string; description: string }) {
  return (
    <section className="flex items-start justify-between gap-4 rounded-smart border border-line bg-surface p-5 shadow-subtle">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-forest">Prontuário do paciente</p>
        <h2 className="mt-1 text-[26px] font-semibold text-graphite">{title}</h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-graphite/70">{description}</p>
      </div>
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-smart bg-mist text-forest"><Icon className="h-5 w-5" /></div>
    </section>
  );
}

function PatientPicker({ patients, value, onChange }: { patients: Patient[]; value: number; onChange: (id: number) => void }) {
  return (
    <label className={labelClass}>
      Paciente
      <select className={inputClass} value={value || ""} onChange={(event) => onChange(Number(event.target.value))}>
        {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.full_name}</option>)}
      </select>
    </label>
  );
}

function SaveButton({ busy, label = "Salvar" }: { busy: boolean; label?: string }) {
  return (
    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-smart bg-forest px-5 text-[14px] font-semibold text-white shadow-subtle transition hover:bg-petrol disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} type="submit">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {busy ? "Salvando..." : label}
    </button>
  );
}

function Feedback({ message, error }: { message: string; error?: boolean }) {
  if (!message) return null;
  return <p className={`text-[13px] font-medium ${error ? "text-terracotta" : "text-forest"}`}>{message}</p>;
}

function PatientTabs({ patientId }: { patientId: number }) {
  const tabs = [
    ["Ficha", "/patients"],
    ["Anamnese", "/anamnesis"],
    ["Avaliações", "/assessments"],
    ["Plano alimentar", "/meal-plans"],
    ["Relatórios", "/reports"],
  ];
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Registro do paciente">
      {tabs.map(([label, href]) => <Link className={secondaryButtonClass} href={`${href}?patient=${patientId}`} key={href}>{label}</Link>)}
    </nav>
  );
}

const emptyPatientForm = { full_name: "", birth_date: "", gender: "", email: "", phone: "", objective: "", notes: "" };

function patientForm(patient: Patient | undefined) {
  if (!patient) return emptyPatientForm;
  const lines = (patient.notes ?? "").split("\n");
  const objective = lines.find((line) => line.startsWith("Objetivo: "))?.replace("Objetivo: ", "") ?? "";
  return {
    full_name: patient.full_name,
    birth_date: patient.birth_date ?? "",
    gender: patient.gender ?? "",
    email: patient.email ?? "",
    phone: patient.phone ?? "",
    objective,
    notes: lines.filter((line) => !line.startsWith("Objetivo: ")).join("\n"),
  };
}

export function PatientRecordPage() {
  const { patients, loading, error, reload } = usePatients();
  const [patientId, setPatientId] = usePatientSelection(patients);
  const selected = patients.find((patient) => patient.id === patientId);
  const [creating, setCreating] = useState(true);
  const [form, setForm] = useState(emptyPatientForm);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (selected && !creating) setForm(patientForm(selected));
  }, [creating, selected]);

  function edit(patient: Patient) {
    setPatientId(patient.id);
    setCreating(false);
    setForm(patientForm(patient));
    setFeedback("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim()) return;
    setBusy(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        birth_date: nullable(form.birth_date),
        gender: nullable(form.gender),
        email: nullable(form.email),
        phone: nullable(form.phone),
        notes: nullable([form.objective ? `Objetivo: ${form.objective}` : "", form.notes].filter(Boolean).join("\n")),
        status: "active",
      };
      const saved = creating
        ? requireApiData(await apiPost<Patient>("/patients", payload))
        : requireApiData(await apiPut<Patient>(`/patients/${patientId}`, payload));
      await reload();
      setPatientId(saved.id);
      setCreating(false);
      setForm(patientForm(saved));
      setFailed(false);
      setFeedback("Ficha salva no banco de dados.");
    } catch (saveError) {
      setFailed(true);
      setFeedback(apiFailure(saveError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageIntro icon={Users} title="Ficha do paciente" description="Cadastro simples e centralizado. Os dados ficam vinculados ao paciente e disponíveis em qualquer computador conectado à aplicação." />
      {error ? <Feedback error message={error} /> : null}
      <section className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <SmartCard className="p-4">
          <button className="mb-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-smart bg-forest px-4 text-[14px] font-semibold text-white" type="button" onClick={() => { setCreating(true); setForm(emptyPatientForm); setFeedback(""); }}>
            <Plus className="h-4 w-4" /> Novo paciente
          </button>
          <div className="space-y-2">
            {loading ? <p className="text-[13px] text-graphite/60">Carregando...</p> : patients.map((patient) => (
              <button className={`w-full rounded-smart border p-3 text-left ${patient.id === patientId && !creating ? "border-forest bg-mist" : "border-line bg-background"}`} key={patient.id} type="button" onClick={() => edit(patient)}>
                <p className="text-[14px] font-semibold text-graphite">{patient.full_name}</p>
                <p className="mt-1 text-[12px] text-graphite/60">{patient.email || patient.phone || "Sem contato"}</p>
              </button>
            ))}
          </div>
        </SmartCard>
        <SmartCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="text-[18px] font-semibold text-graphite">{creating ? "Novo paciente" : selected?.full_name}</h3><p className="mt-1 text-[13px] text-graphite/60">Informações essenciais da ficha.</p></div>
            {!creating && patientId ? <PatientTabs patientId={patientId} /> : null}
          </div>
          <form className="mt-5 grid gap-4" onSubmit={save}>
            <label className={labelClass}>Nome completo<input className={inputClass} required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>Data de nascimento<input className={inputClass} type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></label>
              <label className={labelClass}>Gênero<select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">Não informado</option><option>Feminino</option><option>Masculino</option><option>Outro</option></select></label>
              <label className={labelClass}>Telefone<input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label className={labelClass}>E-mail<input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            </div>
            <label className={labelClass}>Objetivo principal<input className={inputClass} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></label>
            <label className={labelClass}>Observações<textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <div className="flex flex-wrap items-center gap-4"><SaveButton busy={busy} label="Salvar paciente" /><Feedback error={failed} message={feedback} /></div>
          </form>
        </SmartCard>
      </section>
    </div>
  );
}

const emptyAnamnesis: Record<keyof Anamnesis, string> = {
  main_goal: "", clinical_history: "", family_history: "", allergies: "", intolerances: "", medications: "", diseases: "", surgeries: "", sleep_quality: "", stress_level: "", bowel_function: "", water_intake: "", alcohol_use: "", smoking: "", physical_activity: "", food_preferences: "", food_restrictions: "",
};

export function AnamnesisRecordPage() {
  const { patients, error } = usePatients();
  const [patientId, setPatientId] = usePatientSelection(patients);
  const [form, setForm] = useState(emptyAnamnesis);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    setFeedback("");
    apiGet<Anamnesis>(`/patients/${patientId}/anamnesis`).then((response) => {
      const data = requireApiData(response);
      setForm(Object.fromEntries(Object.keys(emptyAnamnesis).map((key) => [key, data[key as keyof Anamnesis] ?? ""])) as typeof emptyAnamnesis);
    }).catch((loadError) => {
      setForm(emptyAnamnesis);
      if (!(loadError instanceof ApiError && loadError.status === 404)) {
        setFailed(true);
        setFeedback("Não foi possível carregar a anamnese do banco.");
      }
    });
  }, [patientId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!patientId) return;
    setBusy(true);
    try {
      await apiPost(`/patients/${patientId}/anamnesis`, Object.fromEntries(Object.entries(form).map(([key, value]) => [key, nullable(value)])));
      setFailed(false);
      setFeedback("Anamnese salva no prontuário do paciente.");
    } catch (saveError) {
      setFailed(true);
      setFeedback(apiFailure(saveError));
    } finally { setBusy(false); }
  }

  const fields: Array<[keyof Anamnesis, string]> = [
    ["main_goal", "Objetivo e motivo da consulta"], ["clinical_history", "Histórico clínico"], ["family_history", "Histórico familiar"], ["diseases", "Doenças e diagnósticos"], ["medications", "Medicamentos"], ["surgeries", "Cirurgias"], ["allergies", "Alergias"], ["intolerances", "Intolerâncias"], ["food_restrictions", "Restrições alimentares"], ["food_preferences", "Preferências alimentares"], ["physical_activity", "Atividade física"], ["sleep_quality", "Sono"], ["stress_level", "Estresse"], ["bowel_function", "Função intestinal"], ["water_intake", "Consumo de água"], ["alcohol_use", "Álcool"], ["smoking", "Tabagismo"],
  ];

  return (
    <div className="space-y-5">
      <PageIntro icon={ClipboardList} title="Anamnese" description="Uma única ficha clínica e um único botão para salvar todas as informações no prontuário do paciente." />
      <SmartCard className="p-5">
        <div className="max-w-md"><PatientPicker patients={patients} value={patientId} onChange={setPatientId} /></div>
        {patientId ? <div className="mt-4"><PatientTabs patientId={patientId} /></div> : null}
        <form className="mt-5" onSubmit={save}>
          <div className="grid gap-4 lg:grid-cols-2">
            {fields.map(([key, label]) => <label className={labelClass} key={key}>{label}<textarea className={textareaClass} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4"><SaveButton busy={busy} label="Salvar anamnese" /><Feedback error={failed} message={feedback || error} /></div>
        </form>
      </SmartCard>
    </div>
  );
}

const emptyAssessment = {
  date: today(), weight: "", height: "", waist: "", hip: "", arm: "", calf: "", physicalBodyFat: "", physicalMuscle: "",
  chest: "", midaxillary: "", triceps: "", subscapular: "", abdominal: "", suprailiac: "", thigh: "",
  bioBodyFat: "", fatMass: "", leanMass: "", muscleMass: "", water: "", bmr: "", visceral: "", metabolicAge: "", notes: "",
};

export function AssessmentsRecordPage() {
  const { patients, error } = usePatients();
  const [patientId, setPatientId] = usePatientSelection(patients);
  const [form, setForm] = useState(emptyAssessment);
  const [physicalHistory, setPhysicalHistory] = useState<PhysicalAssessment[]>([]);
  const [bioHistory, setBioHistory] = useState<Bioimpedance[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!patientId) return;
    try {
      const [physical, bio] = await Promise.all([
        apiGet<PhysicalAssessment[]>(`/patients/${patientId}/assessments`).then(requireApiData),
        apiGet<Bioimpedance[]>(`/patients/${patientId}/bioimpedance`).then(requireApiData),
      ]);
      setPhysicalHistory(physical);
      setBioHistory(bio);
    } catch {
      setFailed(true);
      setFeedback("Não foi possível carregar o histórico de avaliações.");
    }
  }, [patientId]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const skinfoldTotal = useMemo(() => [form.chest, form.midaxillary, form.triceps, form.subscapular, form.abdominal, form.suprailiac, form.thigh].reduce((sum, value) => sum + (Number(value) || 0), 0), [form]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!patientId) return;
    setBusy(true);
    const bioValues = [form.bioBodyFat, form.fatMass, form.leanMass, form.muscleMass, form.water, form.bmr, form.visceral, form.metabolicAge];
    try {
      await apiPost(`/patients/${patientId}/assessments/complete`, {
        physical: {
          date: form.date, weight_kg: form.weight, height_cm: form.height, waist_cm: nullable(form.waist), hip_cm: nullable(form.hip), arm_cm: nullable(form.arm), calf_cm: nullable(form.calf), body_fat_percent: nullable(form.physicalBodyFat), muscle_mass_kg: nullable(form.physicalMuscle),
          chest_skinfold_mm: nullable(form.chest), midaxillary_skinfold_mm: nullable(form.midaxillary), triceps_skinfold_mm: nullable(form.triceps), subscapular_skinfold_mm: nullable(form.subscapular), abdominal_skinfold_mm: nullable(form.abdominal), suprailiac_skinfold_mm: nullable(form.suprailiac), thigh_skinfold_mm: nullable(form.thigh), notes: nullable(form.notes),
        },
        bioimpedance: bioValues.some(Boolean) ? {
          date: form.date, body_fat_percent: nullable(form.bioBodyFat), fat_mass_kg: nullable(form.fatMass), lean_mass_kg: nullable(form.leanMass), muscle_mass_kg: nullable(form.muscleMass), total_body_water_l: nullable(form.water), basal_metabolic_rate_kcal: nullable(form.bmr), visceral_fat_level: nullable(form.visceral), metabolic_age: form.metabolicAge ? Number(form.metabolicAge) : null, notes: nullable(form.notes),
        } : null,
      });
      setForm({ ...emptyAssessment, date: today() });
      await loadHistory();
      setFailed(false);
      setFeedback("Avaliação completa salva no prontuário do paciente.");
    } catch (saveError) {
      setFailed(true);
      setFeedback(apiFailure(saveError));
    } finally { setBusy(false); }
  }

  const physicalFields: Array<[keyof typeof form, string]> = [["weight", "Peso (kg)"], ["height", "Altura (cm)"], ["waist", "Cintura (cm)"], ["hip", "Quadril (cm)"], ["arm", "Braço (cm)"], ["calf", "Panturrilha (cm)"], ["physicalBodyFat", "Gordura corporal (%)"], ["physicalMuscle", "Massa muscular (kg)"]];
  const skinfoldFields: Array<[keyof typeof form, string]> = [["chest", "Peitoral"], ["midaxillary", "Axilar média"], ["triceps", "Tricipital"], ["subscapular", "Subescapular"], ["abdominal", "Abdominal"], ["suprailiac", "Supra-ilíaca"], ["thigh", "Coxa"]];
  const bioFields: Array<[keyof typeof form, string]> = [["bioBodyFat", "Gordura (%)"], ["fatMass", "Massa gorda (kg)"], ["leanMass", "Massa magra (kg)"], ["muscleMass", "Massa muscular (kg)"], ["water", "Água corporal (L)"], ["bmr", "TMB (kcal)"], ["visceral", "Gordura visceral"], ["metabolicAge", "Idade metabólica"]];

  return (
    <div className="space-y-5">
      <PageIntro icon={Activity} title="Avaliações" description="Antropometria, protocolo de 7 dobras e bioimpedância reunidos em uma única avaliação do paciente." />
      <SmartCard className="p-5">
        <div className="grid gap-4 md:grid-cols-2"><PatientPicker patients={patients} value={patientId} onChange={setPatientId} /><label className={labelClass}>Data da avaliação<input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label></div>
        {patientId ? <div className="mt-4"><PatientTabs patientId={patientId} /></div> : null}
        <form className="mt-5 space-y-5" onSubmit={save}>
          <section className="rounded-smart border border-line bg-background p-4"><h3 className="text-[16px] font-semibold text-graphite">Antropometria</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{physicalFields.map(([key, label], index) => <label className={labelClass} key={key}>{label}<input className={inputClass} inputMode="decimal" required={index < 2} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}</div></section>
          <section className="rounded-smart border border-line bg-background p-4"><div className="flex items-center justify-between"><h3 className="text-[16px] font-semibold text-graphite">Protocolo de 7 dobras</h3><span className="rounded-smart bg-mist px-3 py-1 text-[12px] font-semibold text-forest">Soma: {skinfoldTotal || 0} mm</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{skinfoldFields.map(([key, label]) => <label className={labelClass} key={key}>{label} (mm)<input className={inputClass} inputMode="decimal" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}</div></section>
          <section className="rounded-smart border border-line bg-background p-4"><h3 className="text-[16px] font-semibold text-graphite">Bioimpedância</h3><p className="mt-1 text-[12px] text-graphite/60">Preencha quando a avaliação utilizar o equipamento.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{bioFields.map(([key, label]) => <label className={labelClass} key={key}>{label}<input className={inputClass} inputMode="decimal" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}</div></section>
          <label className={labelClass}>Observações da avaliação<textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="flex flex-wrap items-center gap-4"><SaveButton busy={busy} label="Salvar avaliação" /><Feedback error={failed} message={feedback || error} /></div>
        </form>
      </SmartCard>
      <SmartCard className="p-5"><h3 className="text-[16px] font-semibold text-graphite">Histórico do paciente</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{physicalHistory.map((item) => { const bio = bioHistory.find((entry) => entry.date === item.date); return <article className="rounded-smart border border-line bg-background p-4" key={item.id}><p className="text-[14px] font-semibold text-graphite">{item.date}</p><p className="mt-2 text-[13px] leading-5 text-graphite/70">Peso {item.weight_kg} kg · IMC {item.bmi} · Gordura {bio?.body_fat_percent ?? item.body_fat_percent ?? "-"}%</p><p className="mt-1 text-[12px] text-graphite/60">Antropometria e 7 dobras {bio ? "· Bioimpedância registrada" : ""}</p></article>; })}{!physicalHistory.length ? <p className="text-[13px] text-graphite/60">Nenhuma avaliação registrada.</p> : null}</div></SmartCard>
    </div>
  );
}

function emptyMeals() {
  return Object.fromEntries(requiredMeals.map((meal) => [meal, { time: defaultTimes[meal], description: "" }])) as Record<string, { time: string; description: string }>;
}

export function MealPlanRecordPage() {
  const { patients, error } = usePatients();
  const [patientId, setPatientId] = usePatientSelection(patients);
  const [planId, setPlanId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "Plano alimentar atual", startDate: today(), endDate: "", kcal: "", protein: "", carbs: "", fat: "", notes: "", meals: emptyMeals() });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    apiGet<MealPlan[]>(`/patients/${patientId}/meal-plans`).then((response) => {
      const plan = requireApiData(response)[0];
      if (!plan) { setPlanId(null); setForm((current) => ({ ...current, meals: emptyMeals() })); return; }
      const meals = emptyMeals();
      plan.meals.forEach((meal) => { if (meals[meal.meal_type]) meals[meal.meal_type] = { time: meal.time?.slice(0, 5) || defaultTimes[meal.meal_type], description: meal.items.map((item) => item.notes).filter(Boolean).join("\n") || meal.notes || "" }; });
      setPlanId(plan.id);
      setForm({ title: plan.title, startDate: plan.start_date ?? "", endDate: plan.end_date ?? "", kcal: plan.target_kcal ?? "", protein: plan.target_protein_g ?? "", carbs: plan.target_carbs_g ?? "", fat: plan.target_fat_g ?? "", notes: plan.notes ?? "", meals });
      setFeedback("");
    }).catch(() => { setFailed(true); setFeedback("Não foi possível carregar o plano alimentar."); });
  }, [patientId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!patientId) return;
    setBusy(true);
    const payload = {
      title: form.title || "Plano alimentar atual", start_date: nullable(form.startDate), end_date: nullable(form.endDate), target_kcal: nullable(form.kcal), target_protein_g: nullable(form.protein), target_carbs_g: nullable(form.carbs), target_fat_g: nullable(form.fat), notes: nullable(form.notes),
      meals: requiredMeals.map((meal) => ({ meal_type: meal, time: nullable(form.meals[meal].time), notes: null, items: form.meals[meal].description.trim() ? [{ quantity: 1, unit: "porção", grams: 100, notes: form.meals[meal].description.trim() }] : [] })),
    };
    try {
      const saved = planId
        ? requireApiData(await apiPut<MealPlan>(`/patients/${patientId}/meal-plans/${planId}`, payload))
        : requireApiData(await apiPost<MealPlan>(`/patients/${patientId}/meal-plans`, payload));
      setPlanId(saved.id);
      setFailed(false);
      setFeedback("Plano alimentar salvo no prontuário do paciente.");
    } catch (saveError) { setFailed(true); setFeedback(apiFailure(saveError)); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <PageIntro icon={ClipboardList} title="Plano alimentar" description="Plano direto, organizado por horário e refeição, com um único botão para gravar tudo no paciente selecionado." />
      <SmartCard className="p-5">
        <div className="max-w-md"><PatientPicker patients={patients} value={patientId} onChange={setPatientId} /></div>
        {patientId ? <div className="mt-4"><PatientTabs patientId={patientId} /></div> : null}
        <form className="mt-5 space-y-5" onSubmit={save}>
          <div className="grid gap-3 md:grid-cols-3"><label className={`${labelClass} md:col-span-2`}>Nome do plano<input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label className={labelClass}>Meta energética (kcal)<input className={inputClass} inputMode="decimal" value={form.kcal} onChange={(e) => setForm({ ...form, kcal: e.target.value })} /></label><label className={labelClass}>Início<input className={inputClass} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label><label className={labelClass}>Fim<input className={inputClass} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label></div>
          <div className="grid gap-3 sm:grid-cols-3"><label className={labelClass}>Proteínas (g)<input className={inputClass} inputMode="decimal" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} /></label><label className={labelClass}>Carboidratos (g)<input className={inputClass} inputMode="decimal" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} /></label><label className={labelClass}>Gorduras (g)<input className={inputClass} inputMode="decimal" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} /></label></div>
          <div className="grid gap-3 lg:grid-cols-2">{requiredMeals.map((meal) => <section className="rounded-smart border border-line bg-background p-4" key={meal}><div className="grid grid-cols-[1fr_110px] items-end gap-3"><h3 className="pb-2 text-[15px] font-semibold text-graphite">{meal}</h3><label className={labelClass}>Horário<input className={inputClass} type="time" value={form.meals[meal].time} onChange={(e) => setForm({ ...form, meals: { ...form.meals, [meal]: { ...form.meals[meal], time: e.target.value } } })} /></label></div><label className={`${labelClass} mt-3`}>Alimentos, quantidades e substituições<textarea className={textareaClass} placeholder="Ex.: 2 fatias de pão integral + 2 ovos. Substituição: tapioca..." value={form.meals[meal].description} onChange={(e) => setForm({ ...form, meals: { ...form.meals, [meal]: { ...form.meals[meal], description: e.target.value } } })} /></label></section>)}</div>
          <label className={labelClass}>Orientações gerais<textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="flex flex-wrap items-center gap-4"><SaveButton busy={busy} label="Salvar plano alimentar" /><Feedback error={failed} message={feedback || error} /></div>
        </form>
      </SmartCard>
    </div>
  );
}

export function ReportsSummaryPage() {
  const { patients, error } = usePatients();
  const [patientId, setPatientId] = usePatientSelection(patients);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!patientId) return;
    setSummary(null);
    apiGet<ReportSummary>(`/patients/${patientId}/reports/summary`).then((response) => { setSummary(requireApiData(response)); setFeedback(""); }).catch(() => setFeedback("Não foi possível gerar o resumo do paciente."));
  }, [patientId]);

  async function download(path: string, filename: string) {
    try {
      const blob = await apiBlob(path);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch { setFeedback("Não foi possível baixar o relatório."); }
  }

  return (
    <div className="space-y-5">
      <PageIntro icon={FileText} title="Relatórios" description="Resumo objetivo de toda a consulta, sempre montado a partir dos dados salvos no prontuário do paciente." />
      <SmartCard className="p-5"><div className="max-w-md"><PatientPicker patients={patients} value={patientId} onChange={setPatientId} /></div>{patientId ? <div className="mt-4"><PatientTabs patientId={patientId} /></div> : null}<Feedback error message={feedback || error} /></SmartCard>
      {summary ? <>
        <SmartCard className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[12px] font-semibold uppercase tracking-wide text-forest">Resumo da consulta</p><h3 className="mt-1 text-[22px] font-semibold text-graphite">{summary.patient_name}</h3><p className="mt-2 text-[14px] text-graphite/70">{summary.main_goal || "Objetivo ainda não registrado."}</p></div><div className="flex flex-wrap gap-2"><button className={secondaryButtonClass} type="button" onClick={() => void download(`/patients/${patientId}/reports/clinical-summary.pdf`, `relatorio-${patientId}.pdf`)}><Download className="h-4 w-4" />Resumo clínico</button>{summary.meal_plan_count ? <button className={secondaryButtonClass} type="button" onClick={() => void download(`/patients/${patientId}/reports/meal-plan.pdf`, `plano-${patientId}.pdf`)}><Download className="h-4 w-4" />Plano alimentar</button> : null}</div></div></SmartCard>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Peso", summary.latest_weight_kg ? `${summary.latest_weight_kg} kg` : "-"], ["IMC", summary.latest_bmi || "-"], ["Gordura corporal", summary.latest_body_fat_percent ? `${summary.latest_body_fat_percent}%` : "-"], ["Última avaliação", summary.latest_assessment_date || "-"]].map(([label, value]) => <SmartCard className="p-4" key={label}><p className="text-[12px] font-semibold uppercase text-forest">{label}</p><p className="mt-2 text-[22px] font-semibold text-graphite">{value}</p></SmartCard>)}</section>
        <section className="grid gap-4 lg:grid-cols-2"><SmartCard className="p-5"><h3 className="text-[16px] font-semibold text-graphite">Anamnese resumida</h3><p className="mt-3 text-[13px] leading-6 text-graphite/70">{summary.clinical_history || "Histórico clínico não registrado."}</p><p className="mt-3 text-[13px] leading-6 text-graphite/70"><strong>Restrições:</strong> {summary.food_restrictions || "Nenhuma registrada."}</p></SmartCard><SmartCard className="p-5"><h3 className="text-[16px] font-semibold text-graphite">Registros do acompanhamento</h3><div className="mt-3 grid grid-cols-2 gap-3 text-[13px] text-graphite/70"><p>{summary.assessment_count} avaliações físicas</p><p>{summary.bioimpedance_count} bioimpedâncias</p><p>{summary.meal_plan_count} planos alimentares</p><p>{summary.diary_count} registros de diário</p><p>{summary.goal_count} metas</p><p>{summary.active_meal_plan || "Sem plano ativo"}</p></div></SmartCard></section>
      </> : null}
    </div>
  );
}
