"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Ban,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  Inbox,
  Loader2,
  Menu,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import { CompanyCard } from "@/components/dashboard/company-card";
import { InfluencerCard } from "@/components/dashboard/influencer-card";
import {
  SidebarNav,
  type NavGroupData,
} from "@/components/ui/dashboard-sidebar";
import { Input } from "@/components/ui/input";
import {
  countLeads,
  DISPONIBILITY_LABELS,
  FOLLOWER_RANGE_LABELS,
  getAllCompanies,
  getAllInfluencers,
  getCompanyCounts,
  getInfluencerCounts,
  LEAD_STATUS_LABELS,
  updateCompanyStatus,
  updateInfluencerStatus,
  type CompanyLead,
  type InfluencerLead,
  type LeadCounts,
  type LeadStatus,
} from "@/lib/api/dashboard";
import type { Disponibility, FollowerRange } from "@/lib/api/types";
import { clearTokens } from "@/lib/auth";
import { notifyLead, type LeadRecipient } from "@/lib/lead-notifications";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type TabId = "companies" | "influencers";
type StatusFilter = "ALL" | LeadStatus;

interface DashboardData {
  companies: CompanyLead[];
  influencers: InfluencerLead[];
  companyCounts: LeadCounts | null;
  influencerCounts: LeadCounts | null;
}

const PAGE_SIZE = 6;
const DEMO_AVAILABLE = process.env.NODE_ENV !== "production";
const LOAD_ERROR =
  "Não foi possível carregar os cadastros. Confira a conexão com o servidor e tente novamente.";

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "companies", label: "Empresas", icon: Building2 },
  { id: "influencers", label: "Influencers", icon: Users },
];

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "PENDING", label: "Pendentes" },
  { id: "APPROVED", label: "Aprovados" },
  { id: "REJECTED", label: "Recusados" },
];

const STATUS_BADGE_STYLES: Record<LeadStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-600",
};

function countStatuses<T extends { status: LeadStatus }>(
  items: T[]
): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = {
    ALL: items.length,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };

  for (const item of items) {
    counts[item.status] += 1;
  }

  return counts;
}

function shiftCounts(
  counts: LeadCounts,
  from: LeadStatus,
  to: LeadStatus
): LeadCounts {
  if (from === to) return counts;

  const next = { ...counts };
  next[from] = Math.max(0, next[from] - 1);
  next[to] += 1;
  return next;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Building2;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          {label}
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand/15 text-foreground">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full truncate rounded-lg border border-black/[0.1] bg-white px-2.5 text-xs text-foreground outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 sm:w-auto sm:min-w-[160px]"
    >
      {children}
    </select>
  );
}

function LeadActions({
  status,
  loading = false,
  recipient,
  onChange,
  onNotice,
}: {
  status: LeadStatus;
  loading?: boolean;
  recipient: LeadRecipient;
  onChange: (status: LeadStatus) => void;
  onNotice: (message: string) => void;
}) {
  function notify(decision: "APPROVED" | "REJECTED") {
    const channel = notifyLead(recipient, decision, () =>
      onNotice("Sem WhatsApp válido: mensagem copiada. Cole na conversa do Instagram.")
    );

    if (channel === "none") {
      onNotice("Cadastro sem WhatsApp ou Instagram válido para notificação.");
    }

    onChange(decision);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] pt-3">
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
          STATUS_BADGE_STYLES[status]
        )}
      >
        {LEAD_STATUS_LABELS[status]}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        {loading && (
          <Loader2
            aria-hidden="true"
            className="size-3.5 animate-spin text-muted-foreground"
          />
        )}

        {status !== "APPROVED" && (
          <button
            type="button"
            onClick={() => notify("APPROVED")}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="size-3.5" />
            Aprovar
          </button>
        )}

        {status === "REJECTED" ? (
          <button
            type="button"
            onClick={() => onChange("PENDING")}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-black/[0.1] bg-white px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="size-3.5" />
            Reativar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => notify("REJECTED")}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Ban className="size-3.5" />
            Recusar
          </button>
        )}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-black/[0.08] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-2">
          <div className="h-4 w-2/3 rounded bg-black/[0.06]" />
          <div className="h-3 w-1/3 rounded bg-black/[0.04]" />
        </div>
        <div className="h-5 w-16 shrink-0 rounded-full bg-black/[0.04]" />
      </div>
      <div className="mt-5 space-y-2.5">
        <div className="h-3 w-3/4 rounded bg-black/[0.04]" />
        <div className="h-3 w-1/2 rounded bg-black/[0.04]" />
        <div className="h-3 w-2/5 rounded bg-black/[0.04]" />
      </div>
      <div className="mt-5 h-12 rounded bg-black/[0.03]" />
    </div>
  );
}

export function DashboardView() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyLead[]>([]);
  const [influencers, setInfluencers] = useState<InfluencerLead[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [companyTotals, setCompanyTotals] = useState<LeadCounts>({
    total: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  const [influencerTotals, setInfluencerTotals] = useState<LeadCounts>({
    total: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  const [tab, setTab] = useState<TabId>("companies");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [disponibilityFilter, setDisponibilityFilter] = useState<
    Disponibility | "ALL"
  >("ALL");
  const [nicheFilter, setNicheFilter] = useState("ALL");
  const [rangeFilter, setRangeFilter] = useState<FollowerRange | "ALL">("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const initialFetchRef = useRef<Promise<DashboardData> | null>(null);

  const applyDemoData = useCallback(async () => {
    const { demoCompanies, demoInfluencers } = await import(
      "@/lib/api/demo-data"
    );

    setCompanies(demoCompanies);
    setInfluencers(demoInfluencers);
    setCompanyTotals(countLeads(demoCompanies));
    setInfluencerTotals(countLeads(demoInfluencers));
    setDemoMode(true);
    setError(null);
    setStatusError(null);
    setStatus("ready");
  }, []);

  const applyDashboardData = useCallback((data: DashboardData) => {
    setCompanies(data.companies);
    setInfluencers(data.influencers);
    setCompanyTotals(data.companyCounts ?? countLeads(data.companies));
    setInfluencerTotals(data.influencerCounts ?? countLeads(data.influencers));
    setDemoMode(false);
    setError(null);
    setStatusError(null);
    setStatus("ready");
  }, []);

  const fetchDashboard =
    useCallback(async (): Promise<DashboardData> => {
      const [companyData, influencerData] = await Promise.all([
        getAllCompanies(),
        getAllInfluencers(),
      ]);

      let companyCounts: LeadCounts | null = null;
      let influencerCounts: LeadCounts | null = null;

      try {
        [companyCounts, influencerCounts] = await Promise.all([
          getCompanyCounts(),
          getInfluencerCounts(),
        ]);
      } catch {
        // Contadores são opcionais; a lista usa fallback calculado localmente.
      }

      return {
        companies: companyData,
        influencers: influencerData,
        companyCounts,
        influencerCounts,
      };
    }, []);

  const handleLoadFailure = useCallback(async () => {
    if (DEMO_AVAILABLE) {
      await applyDemoData();
    } else {
      setError(LOAD_ERROR);
      setStatus((current) => (current === "ready" ? current : "error"));
    }
  }, [applyDemoData]);

  const load = useCallback(async () => {
    try {
      const data = await fetchDashboard();
      applyDashboardData(data);
    } catch {
      await handleLoadFailure();
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboard, applyDashboardData, handleLoadFailure]);

  useEffect(() => {
    let active = true;
    const request = initialFetchRef.current ?? fetchDashboard();
    initialFetchRef.current = request;

    request
      .then((data) => {
        if (active) applyDashboardData(data);
      })
      .catch(async () => {
        if (active) await handleLoadFailure();
      });

    return () => {
      active = false;
    };
  }, [fetchDashboard, applyDashboardData, handleLoadFailure]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  function showNotice(message: string) {
    setNotice(message);

    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 4000);
  }

  function refresh() {
    setRefreshing(true);
    void load();
  }

  function retry() {
    setStatus("loading");
    void load();
  }

  const companyTotal = companyTotals.total || companies.length;
  const influencerTotal = influencerTotals.total || influencers.length;
  const pendingCount = companyTotals.PENDING + influencerTotals.PENDING;
  const rejectedCount = companyTotals.REJECTED + influencerTotals.REJECTED;

  const normalizedQuery = query.trim().toLowerCase();

  const companiesBySearch = useMemo(() => {
    return companies.filter((company) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          company.tradeName,
          company.personName,
          company.contactEmail,
          company.cnpj,
          company.reason,
          ...company.partnershipFormats.map((format) => format.format),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFormat =
        formatFilter === "ALL" ||
        company.partnershipFormats.some(
          (format) => format.format === formatFilter
        );

      const matchesDisponibility =
        disponibilityFilter === "ALL" ||
        company.disponibility === disponibilityFilter;

      return matchesQuery && matchesFormat && matchesDisponibility;
    });
  }, [companies, normalizedQuery, formatFilter, disponibilityFilter]);

  const influencersBySearch = useMemo(() => {
    return influencers.filter((influencer) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          influencer.name,
          influencer.instagram,
          influencer.niche,
          influencer.city,
          influencer.state,
          influencer.reason,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesNiche =
        nicheFilter === "ALL" || influencer.niche === nicheFilter;
      const matchesRange =
        rangeFilter === "ALL" || influencer.followerRange === rangeFilter;
      const matchesState =
        stateFilter === "ALL" || influencer.state === stateFilter;

      return matchesQuery && matchesNiche && matchesRange && matchesState;
    });
  }, [
    influencers,
    normalizedQuery,
    nicheFilter,
    rangeFilter,
    stateFilter,
  ]);

  const companyCounts = useMemo(
    () => countStatuses(companiesBySearch),
    [companiesBySearch]
  );
  const influencerCounts = useMemo(
    () => countStatuses(influencersBySearch),
    [influencersBySearch]
  );
  const currentCounts = tab === "companies" ? companyCounts : influencerCounts;

  const filteredCompanies = useMemo(
    () =>
      statusFilter === "ALL"
        ? companiesBySearch
        : companiesBySearch.filter(
            (company) => company.status === statusFilter
          ),
    [companiesBySearch, statusFilter]
  );

  const filteredInfluencers = useMemo(
    () =>
      statusFilter === "ALL"
        ? influencersBySearch
        : influencersBySearch.filter(
            (influencer) => influencer.status === statusFilter
          ),
    [influencersBySearch, statusFilter]
  );

  const formatOptions = useMemo(
    () =>
      Array.from(
        new Set(
          companies.flatMap((company) =>
            company.partnershipFormats.map((format) => format.format)
          )
        )
      ).sort((a, b) => a.localeCompare(b)),
    [companies]
  );

  const nicheOptions = useMemo(
    () =>
      Array.from(new Set(influencers.map((influencer) => influencer.niche))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [influencers]
  );

  const stateOptions = useMemo(
    () =>
      Array.from(
        new Set(
          influencers.map((influencer) => influencer.state).filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [influencers]
  );

  const totalItems =
    tab === "companies" ? filteredCompanies.length : filteredInfluencers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const visibleInfluencers = filteredInfluencers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const hasActiveFilters =
    normalizedQuery !== "" ||
    statusFilter !== "ALL" ||
    (tab === "companies"
      ? formatFilter !== "ALL" || disponibilityFilter !== "ALL"
      : nicheFilter !== "ALL" ||
        rangeFilter !== "ALL" ||
        stateFilter !== "ALL");

  const navGroups: NavGroupData[] = useMemo(
    () => [
      {
        items: [
          {
            id: "companies",
            title: "Empresas",
            icon: Building2,
            badge: companyTotal,
          },
          {
            id: "influencers",
            title: "Influencers",
            icon: Users,
            badge: influencerTotal,
          },
        ],
      },
    ],
    [companyTotal, influencerTotal]
  );

  function clearFilters() {
    setQuery("");
    setStatusFilter("ALL");
    setFormatFilter("ALL");
    setDisponibilityFilter("ALL");
    setNicheFilter("ALL");
    setRangeFilter("ALL");
    setStateFilter("ALL");
    setPage(1);
  }

  function handleNavSelect(id: string) {
    setMenuOpen(false);

    if (id === "companies" || id === "influencers") {
      setTab(id);
      clearFilters();
      return;
    }

    if (id === "logout") {
      clearTokens();
      router.replace("/login");
    }
  }

  function handleTabChange(nextTab: TabId) {
    setTab(nextTab);
    clearFilters();
  }

  async function changeCompanyStatus(id: string, nextStatus: LeadStatus) {
    if (updatingLeadId) return;

    const previous = companies.find((company) => company.id === id);
    if (!previous || previous.status === nextStatus) return;

    if (demoMode) {
      setCompanies((current) =>
        current.map((company) =>
          company.id === id ? { ...company, status: nextStatus } : company
        )
      );
      setCompanyTotals((current) =>
        shiftCounts(current, previous.status, nextStatus)
      );
      return;
    }

    setUpdatingLeadId(id);
    setStatusError(null);
    setCompanies((current) =>
      current.map((company) =>
        company.id === id ? { ...company, status: nextStatus } : company
      )
    );
    setCompanyTotals((current) =>
      shiftCounts(current, previous.status, nextStatus)
    );

    try {
      const updated = await updateCompanyStatus(id, nextStatus);
      setCompanies((current) =>
        current.map((company) => (company.id === id ? updated : company))
      );
    } catch {
      setCompanies((current) =>
        current.map((company) => (company.id === id ? previous : company))
      );
      setCompanyTotals((current) =>
        shiftCounts(current, nextStatus, previous.status)
      );
      setStatusError("Não foi possível atualizar o status. Tente novamente.");
    } finally {
      setUpdatingLeadId(null);
    }
  }

  async function changeInfluencerStatus(id: string, nextStatus: LeadStatus) {
    if (updatingLeadId) return;

    const previous = influencers.find((influencer) => influencer.id === id);
    if (!previous || previous.status === nextStatus) return;

    if (demoMode) {
      setInfluencers((current) =>
        current.map((influencer) =>
          influencer.id === id
            ? { ...influencer, status: nextStatus }
            : influencer
        )
      );
      setInfluencerTotals((current) =>
        shiftCounts(current, previous.status, nextStatus)
      );
      return;
    }

    setUpdatingLeadId(id);
    setStatusError(null);
    setInfluencers((current) =>
      current.map((influencer) =>
        influencer.id === id ? { ...influencer, status: nextStatus } : influencer
      )
    );
    setInfluencerTotals((current) =>
      shiftCounts(current, previous.status, nextStatus)
    );

    try {
      const updated = await updateInfluencerStatus(id, nextStatus);
      setInfluencers((current) =>
        current.map((influencer) =>
          influencer.id === id ? updated : influencer
        )
      );
    } catch {
      setInfluencers((current) =>
        current.map((influencer) =>
          influencer.id === id ? previous : influencer
        )
      );
      setInfluencerTotals((current) =>
        shiftCounts(current, nextStatus, previous.status)
      );
      setStatusError("Não foi possível atualizar o status. Tente novamente.");
    } finally {
      setUpdatingLeadId(null);
    }
  }

  const currentTabLabel = TABS.find((item) => item.id === tab)?.label ?? "";

  const emptyTitle = normalizedQuery
    ? "Nenhum resultado encontrado"
    : statusFilter === "REJECTED"
      ? "Nenhum cadastro recusado"
      : statusFilter === "APPROVED"
        ? "Nenhum cadastro aprovado"
        : statusFilter === "PENDING"
          ? "Nenhum cadastro aguardando análise"
          : `Nenhum cadastro de ${tab === "companies" ? "empresa" : "influencer"} ainda`;

  const emptyDescription =
    statusFilter === "REJECTED"
      ? "Quando você marcar um cadastro como sem interesse, ele aparece aqui."
      : normalizedQuery || hasActiveFilters
        ? "Ajuste a busca ou limpe os filtros para ver outros cadastros."
        : "Os cadastros enviados pelo formulário aparecerão aqui automaticamente.";

  return (
    <div className="min-h-[100dvh] bg-[#f7f8f8]">
      <div className="flex min-h-[100dvh]">
        <aside className="sticky top-0 hidden h-[100dvh] shrink-0 lg:block">
          <SidebarNav
            groups={navGroups}
            activeId={tab}
            onSelect={handleNavSelect}
          />
        </aside>

        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            menuOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
          aria-hidden={!menuOpen}
          inert={!menuOpen}
        >
          <div
            className={cn(
              "absolute inset-0 bg-[#04131f]/40 backdrop-blur-sm transition-opacity duration-200",
              menuOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={cn(
              "relative h-full w-[280px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300",
              menuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <SidebarNav
              className="w-full border-none bg-white"
              groups={navGroups}
              activeId={tab}
              onSelect={handleNavSelect}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/85 backdrop-blur-md">
            <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menu"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground lg:hidden"
              >
                <Menu className="size-5" />
              </button>

              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden text-muted-foreground sm:inline">
                  LeadEvent
                </span>
                <span className="hidden text-muted-foreground/40 sm:inline">
                  /
                </span>
                <span className="truncate font-medium text-foreground">
                  {currentTabLabel}
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={refresh}
                  disabled={refreshing}
                  aria-label="Atualizar cadastros"
                  className="flex size-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-muted-foreground transition-colors hover:bg-black/[0.03] hover:text-foreground disabled:opacity-60"
                >
                  <RefreshCw
                    className={cn("size-4", refreshing && "animate-spin")}
                  />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-14 pt-5 sm:px-6 sm:pt-6 lg:px-8">
            <section className="rounded-3xl bg-[#061a2b] p-5 text-white shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Cadastros do LeadEvent
                  </h1>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/60">
                    Acompanhe as empresas e os influencers que se inscreveram no
                    evento.
                  </p>
                </div>
                <p className="text-sm text-white/60">
                  <span className="block text-2xl font-semibold text-white">
                    {companyTotal + influencerTotal}
                  </span>
                  cadastros no total
                </p>
              </div>
            </section>

            <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Empresas"
                value={companyTotal}
                hint="Total recebido"
                icon={Building2}
              />
              <StatCard
                label="Influencers"
                value={influencerTotal}
                hint="Total recebido"
                icon={Users}
              />
              <StatCard
                label="Aguardando"
                value={pendingCount}
                hint="Para analisar"
                icon={Clock}
              />
              <StatCard
                label="Recusados"
                value={rejectedCount}
                hint="Sem interesse"
                icon={Ban}
              />
            </section>

            {demoMode && (
              <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center">
                <FlaskConical className="size-4 shrink-0" />
                <p className="flex-1">
                  Modo demonstração: dados fictícios porque o servidor não
                  respondeu. Aprovar, recusar e paginar funciona apenas nesta
                  sessão e não é salvo.
                </p>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={refreshing}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-60"
                >
                  <RefreshCw
                    className={cn("size-3.5", refreshing && "animate-spin")}
                  />
                  Tentar servidor
                </button>
              </div>
            )}

            {statusError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p className="flex-1">{statusError}</p>
                <button
                  type="button"
                  onClick={() => setStatusError(null)}
                  className="shrink-0 font-semibold underline underline-offset-2"
                >
                  Fechar
                </button>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                role="tablist"
                aria-label="Tipo de cadastro"
                className="flex w-full rounded-xl border border-black/[0.08] bg-white p-1 sm:w-auto"
              >
                {TABS.map(({ id, label, icon: Icon }) => {
                  const count =
                    id === "companies" ? companyTotal : influencerTotal;
                  const isActive = tab === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleTabChange(id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4",
                        isActive
                          ? "bg-[#061a2b] text-white"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                      {label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-black/[0.05] text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={
                    tab === "companies"
                      ? "Buscar empresa, contato ou CNPJ"
                      : "Buscar influencer, nicho ou cidade"
                  }
                  aria-label="Buscar cadastros"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-black/[0.08] bg-white p-2.5">
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map(({ id, label }) => {
                  const isActive = statusFilter === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setStatusFilter(id);
                        setPage(1);
                      }}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "border-[#061a2b] bg-[#061a2b] text-white"
                          : "border-black/[0.08] bg-white text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[10px] font-semibold",
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-black/[0.05] text-muted-foreground"
                        )}
                      >
                        {currentCounts[id]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                {tab === "companies" ? (
                  <>
                    <FilterSelect
                      label="Disponibilidade"
                      value={disponibilityFilter}
                      onChange={(value) => {
                        setDisponibilityFilter(
                          value as Disponibility | "ALL"
                        );
                        setPage(1);
                      }}
                    >
                      <option value="ALL">Disponibilidade</option>
                      {Object.entries(DISPONIBILITY_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </FilterSelect>

                    <FilterSelect
                      label="Formato de parceria"
                      value={formatFilter}
                      onChange={(value) => {
                        setFormatFilter(value);
                        setPage(1);
                      }}
                    >
                      <option value="ALL">Formato de parceria</option>
                      {formatOptions.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </FilterSelect>
                  </>
                ) : (
                  <>
                    <FilterSelect
                      label="Nicho"
                      value={nicheFilter}
                      onChange={(value) => {
                        setNicheFilter(value);
                        setPage(1);
                      }}
                    >
                      <option value="ALL">Nicho</option>
                      {nicheOptions.map((niche) => (
                        <option key={niche} value={niche}>
                          {niche}
                        </option>
                      ))}
                    </FilterSelect>

                    <FilterSelect
                      label="Faixa de seguidores"
                      value={rangeFilter}
                      onChange={(value) => {
                        setRangeFilter(value as FollowerRange | "ALL");
                        setPage(1);
                      }}
                    >
                      <option value="ALL">Faixa de seguidores</option>
                      {Object.entries(FOLLOWER_RANGE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </FilterSelect>

                    <FilterSelect
                      label="Estado"
                      value={stateFilter}
                      onChange={(value) => {
                        setStateFilter(value);
                        setPage(1);
                      }}
                    >
                      <option value="ALL">Estado</option>
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </FilterSelect>
                  </>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-black/[0.1] px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-black/[0.03] hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {error && status === "ready" && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p className="flex-1">{error}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="shrink-0 font-semibold underline underline-offset-2"
                >
                  Tentar de novo
                </button>
              </div>
            )}

            <section className="mt-5">
              {status === "loading" && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-white px-6 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <AlertCircle className="size-5" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-foreground">
                    Não foi possível carregar os cadastros
                  </h2>
                  <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#061a2b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0b2b45]"
                  >
                    {refreshing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    Recarregar
                  </button>
                </div>
              )}

              {status === "ready" && totalItems === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-white px-6 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-black/[0.04] text-muted-foreground">
                    <Inbox className="size-5" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-foreground">
                    {emptyTitle}
                  </h2>
                  <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                    {emptyDescription}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/[0.1] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.03]"
                    >
                      <RotateCcw className="size-4" />
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}

              {status === "ready" && totalItems > 0 && (
                <>
                  {statusFilter === "REJECTED" && (
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/70 px-3 py-2 text-xs text-red-700">
                      <Ban className="mt-0.5 size-3.5 shrink-0" />
                      <p>
                        Área de recusados: cadastros marcados como sem
                        interesse. Use <strong>Reativar</strong> para
                        devolvê-los à análise.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {tab === "companies"
                      ? visibleCompanies.map((company) => (
                          <CompanyCard
                            key={company.id}
                            company={company}
                            actions={
                              <LeadActions
                                status={company.status}
                                loading={updatingLeadId === company.id}
                                recipient={{
                                  kind: "company",
                                  name: company.personName,
                                  companyName: company.tradeName,
                                  instagram: company.socialMedia,
                                  availability: company.disponibility,
                                }}
                                onNotice={showNotice}
                                onChange={(nextStatus) =>
                                  void changeCompanyStatus(
                                    company.id,
                                    nextStatus
                                  )
                                }
                              />
                            }
                          />
                        ))
                      : visibleInfluencers.map((influencer) => (
                          <InfluencerCard
                            key={influencer.id}
                            influencer={influencer}
                            actions={
                              <LeadActions
                                status={influencer.status}
                                loading={updatingLeadId === influencer.id}
                                recipient={{
                                  kind: "influencer",
                                  name: influencer.name,
                                  phone: influencer.phone,
                                  instagram: influencer.instagram,
                                }}
                                onNotice={showNotice}
                                onChange={(nextStatus) =>
                                  void changeInfluencerStatus(
                                    influencer.id,
                                    nextStatus
                                  )
                                }
                              />
                            }
                          />
                        ))}
                  </div>

                  <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                      Mostrando{" "}
                      <strong className="font-semibold text-foreground">
                        {startIndex + 1}–
                        {Math.min(startIndex + PAGE_SIZE, totalItems)}
                      </strong>{" "}
                      de {totalItems}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        disabled={safePage === 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-black/[0.1] bg-white px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="size-4" />
                        Anterior
                      </button>

                      <span className="min-w-[76px] text-center text-xs font-medium text-muted-foreground">
                        Página {safePage} de {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) =>
                            Math.min(totalPages, current + 1)
                          )
                        }
                        disabled={safePage === totalPages}
                        className="inline-flex items-center gap-1 rounded-lg border border-black/[0.1] bg-white px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Próxima
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            <footer className="mt-10 flex flex-col items-center justify-between gap-1 border-t border-black/[0.06] pt-5 text-[11px] text-muted-foreground/70 sm:flex-row">
              <span>{brand.product.name}</span>
              <span>
                {brand.company.shortName} — {brand.company.name}
              </span>
            </footer>
          </main>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-black/10 bg-foreground px-4 py-3 text-center text-xs font-medium text-background shadow-lg"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
