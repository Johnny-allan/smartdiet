"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Database, FileCheck2, History, RefreshCw, ShieldCheck, TableProperties } from "lucide-react";

import { apiGet, requireApiData } from "@/shared/api/client";
import { SmartCard } from "@/shared/components/smart-card";
import { AppShell } from "@/shared/layout/app-shell";

type BrazilianFood = {
  source: string;
  name: string;
};

type AdminLog = {
  id: string;
  action: string;
  detail: string;
  status: "Concluido" | "Atencao";
  time: string;
};

const sources = [
  { name: "TACO", status: "Ativa", items: "597", license: "Revisao operacional documentada", tone: "text-forest" },
  { name: "TBCA", status: "Indexada", items: "5.875", license: "Uso publico com cautela juridica", tone: "text-terracotta" },
  { name: "Open Food Facts", status: "Complementar", items: "Sob demanda", license: "ODbL com atribuicao", tone: "text-petrol" },
  { name: "USDA", status: "Traducao tecnica", items: "Complementar", license: "Fonte publica", tone: "text-graphite" },
];

function nowLabel() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export default function EtlPage() {
  const [logs, setLogs] = useState<AdminLog[]>([
    {
      id: "initial",
      action: "Painel carregado",
      detail: "Fontes e politica de dados prontas para auditoria da Beta.",
      status: "Concluido",
      time: nowLabel(),
    },
  ]);
  const [checking, setChecking] = useState(false);
  const [apiSample, setApiSample] = useState<BrazilianFood[]>([]);

  const sourceSummary = useMemo(() => {
    const activeSources = sources.filter((source) => source.status !== "Complementar").length;
    return [
      { label: "Fontes monitoradas", value: String(sources.length), icon: Database },
      { label: "Bases nacionais", value: String(activeSources), icon: TableProperties },
      { label: "Revisao legal", value: "Ativa", icon: ShieldCheck },
    ];
  }, []);

  function addLog(action: string, detail: string, status: AdminLog["status"] = "Concluido") {
    setLogs((current) => [
      { id: `${Date.now()}-${action}`, action, detail, status, time: nowLabel() },
      ...current.slice(0, 5),
    ]);
  }

  async function verifyBrazilianSearch() {
    setChecking(true);
    try {
      const result = requireApiData(await apiGet<BrazilianFood[]>("/foods/brazilian/search?q=arroz"));
      setApiSample(result.slice(0, 5));
      addLog("Busca brasileira verificada", `${result.length} itens retornados para arroz pela API local.`);
    } catch {
      addLog("API indisponivel", "Nao foi possivel consultar /foods/brazilian/search agora.", "Atencao");
    } finally {
      setChecking(false);
    }
  }

  function validateLegalChecklist() {
    addLog("Checklist legal revisado", "Atribuicao, redistribuicao e fonte de origem conferidas no painel admin.");
  }

  function refreshLocalIndex() {
    addLog("Indice local revisado", "Cache visual do painel atualizado; importacao real permanece no backend/script autorizado.");
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-smart border border-line bg-surface p-6 shadow-subtle md:flex-row md:items-center">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-terracotta">Administracao de dados</p>
            <h2 className="mt-1 text-[28px] font-semibold leading-9 text-graphite">ETL alimentar</h2>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-graphite/70">
              Controle operacional das fontes alimentares, auditoria legal e verificacao da busca brasileira usada na prescricao.
            </p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-smart bg-orange-100 text-terracotta">
            <Database className="h-6 w-6" aria-hidden="true" />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {sourceSummary.map((item) => (
            <SmartCard className="p-5" key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-graphite/65">{item.label}</p>
                  <p className="mt-2 text-[26px] font-semibold leading-none text-graphite">{item.value}</p>
                </div>
                <item.icon className="h-6 w-6 text-terracotta" aria-hidden="true" />
              </div>
            </SmartCard>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <SmartCard className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-graphite">Fontes alimentares</h3>
                <p className="mt-1 text-[13px] leading-5 text-graphite/65">Visao admin do que pode entrar na prescricao e do que exige cuidado juridico.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex h-10 items-center rounded-smart bg-terracotta px-3 text-[13px] font-semibold text-white hover:bg-orange-600" type="button" onClick={verifyBrazilianSearch}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} aria-hidden="true" />
                  Verificar API
                </button>
                <button className="inline-flex h-10 items-center rounded-smart border border-line bg-surface px-3 text-[13px] font-semibold text-forest hover:border-sage hover:bg-mist" type="button" onClick={validateLegalChecklist}>
                  <FileCheck2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Validar checklist
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-smart border border-line">
              <div className="grid grid-cols-[0.8fr_0.7fr_0.7fr_1.2fr] bg-background px-4 py-3 text-[12px] font-semibold uppercase text-graphite/60">
                <span>Fonte</span>
                <span>Status</span>
                <span>Itens</span>
                <span>Licenca</span>
              </div>
              {sources.map((source) => (
                <div className="grid grid-cols-[0.8fr_0.7fr_0.7fr_1.2fr] border-t border-line px-4 py-3 text-[13px] text-graphite" key={source.name}>
                  <strong>{source.name}</strong>
                  <span className={`font-semibold ${source.tone}`}>{source.status}</span>
                  <span>{source.items}</span>
                  <span className="text-graphite/70">{source.license}</span>
                </div>
              ))}
            </div>

            {apiSample.length ? (
              <div className="mt-5 rounded-smart border border-line bg-background p-4">
                <p className="text-[14px] font-semibold text-graphite">Amostra da API brasileira</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {apiSample.map((food) => (
                    <div className="rounded-smart bg-surface px-3 py-2 text-[13px] text-graphite" key={`${food.source}-${food.name}`}>
                      <span className="font-semibold text-forest">{food.source}</span> - {food.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </SmartCard>

          <SmartCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-graphite">Operacoes</h3>
                <p className="mt-1 text-[13px] leading-5 text-graphite/65">Acoes administrativas sem prometer importacao inexistente no frontend.</p>
              </div>
              <History className="h-5 w-5 text-terracotta" aria-hidden="true" />
            </div>
            <button className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-smart border border-line bg-background px-3 text-[13px] font-semibold text-graphite hover:border-terracotta hover:text-terracotta" type="button" onClick={refreshLocalIndex}>
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Revisar indice local
            </button>
            <div className="mt-4 grid gap-3">
              {logs.map((log) => (
                <article className="rounded-smart border border-line bg-background p-3" key={log.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-graphite">{log.action}</p>
                    <span className={log.status === "Concluido" ? "text-[12px] font-semibold text-forest" : "text-[12px] font-semibold text-terracotta"}>{log.status}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-graphite/65">{log.detail}</p>
                  <p className="mt-2 text-[11px] font-semibold text-graphite/50">{log.time}</p>
                </article>
              ))}
            </div>
          </SmartCard>
        </section>
      </div>
    </AppShell>
  );
}
