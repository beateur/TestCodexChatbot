import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Settings,
  Car,
  Gauge,
  Fuel,
  Info,
  Sparkles,
  Sun,
  Moon,
  FileSearch,
  ClipboardList,
  GitCompare,
  Binary,
  History,
  CheckCircle,
  AlertCircle,
  TimerReset,
  Loader2,
  Cpu,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

/**
 * AutoChatbot – Interface Front (React + Tailwind + shadcn/ui)
 *
 * ✅ Points clés
 * - Disposition 3 panneaux : (gauche) Raccourcis & outils, (centre) conversation, (droite) modules auto
 * - Belles bulles de messages, citations (sources), et état de "réponse en cours"
 * - Outils intégrés : Décodage VIN, Comparateur modèles, Coût carburant/TCO rapide, Entretien & rappels
 * - Paramètres de modèle (sélecteur, température), mode sombre/clair, effacer l’historique
 * - Mode MOCK intégré pour développer sans backend (toggle)
 *
 * 🔌 Brancher le backend
 * - Remplacez `chatEndpoint`, `vinEndpoint`, `compareEndpoint` par vos URLs
 * - Chaque appel envoie un payload clair. Voir fonctions `callChat`, `decodeVIN`, `compareVehicles`
 */

// ----------------------
// Config & données
// ----------------------
const chatEndpoint = "/api/chat"; // à remplacer
const vinEndpoint = "/api/vin"; // à remplacer
const compareEndpoint = "/api/compare"; // à remplacer

const QUICK_PROMPTS: { label: string; text: string }[] = [
  { label: "Comparer deux modèles", text: "Compare la Peugeot 208 1.2 PureTech 100 2021 et la Renault Clio TCe 90 2021 (performances, conso WLTP/EPA, fiabilité, coûts)." },
  { label: "Entretien", text: "Quel est le plan d'entretien pour une Toyota Yaris Hybrid 2020 et les coûts moyens en France ?" },
  { label: "Normes", text: "Explique la différence entre Euro 6d et la future Euro 7, impacts sur les NOx/particules et contrôle technique." },
  { label: "Électrique", text: "Autonomie réelle sur autoroute pour une Tesla Model 3 RWD 2024 à 130 km/h par 5°C, et conseils de charge ?" },
  { label: "Rappels", text: "Y a‑t‑il des rappels de sécurité récents pour la Dacia Sandero 2022 ?" },
];

const BRANDS = [
  "Audi","BMW","Citroën","Cupra","Dacia","Ferrari","Fiat","Ford","Honda","Hyundai","Kia","Lexus","Mazda","Mercedes-Benz","Mini","Nissan","Opel","Peugeot","Renault","Seat","Skoda","Suzuki","Tesla","Toyota","Volkswagen","Volvo",
];

const MODELS_BY_BRAND: Record<string, string[]> = {
  Peugeot: ["208","2008","308","3008","5008"],
  Renault: ["Clio","Captur","Mégane","Austral"],
  Toyota: ["Yaris","Corolla","C-HR","RAV4"],
  Tesla: ["Model 3","Model Y","Model S","Model X"],
};

// ----------------------
// Types
// ----------------------
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: { title: string; url?: string }[];
}

// ----------------------
// Helpers
// ----------------------
const uid = () => Math.random().toString(36).slice(2);

function classNames(...arr: (string | undefined | false)[]) {
  return arr.filter(Boolean).join(" ");
}

// ----------------------
// Composants UI
// ----------------------
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={classNames(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Car className="h-5 w-5" />
        </div>
      )}

      <div
        className={classNames(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">{msg.content}</div>
        {msg.sources && msg.sources.length > 0 && (
          <div className={classNames("mt-3 flex flex-wrap gap-2", isUser ? "opacity-90" : "opacity-80")}> 
            {msg.sources.map((s, i) => (
              <Badge key={i} variant={isUser ? "secondary" : "outline"}>
                <FileSearch className="mr-1 h-3 w-3" /> {s.title}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-5 w-5" />
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ onUsePrompt }: { onUsePrompt: (text: string) => void }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Démarrez la conversation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Posez une question ou utilisez un raccourci ci‑dessous pour comparer des modèles, décoder un VIN, estimer des coûts d'usage et plus encore.
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <Button key={p.label} variant="secondary" size="sm" onClick={() => onUsePrompt(p.text)}>
              {p.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RightPanel({
  onDecodeVIN,
  onCompare,
  onFuelCalc,
}: {
  onDecodeVIN: (vin: string) => void;
  onCompare: (a: VehicleSpec, b: VehicleSpec) => void;
  onFuelCalc: (args: FuelArgs) => void;
}) {
  // Local state for tools
  const [vin, setVin] = useState("");
  const [brandA, setBrandA] = useState("Peugeot");
  const [modelA, setModelA] = useState("208");
  const [brandB, setBrandB] = useState("Renault");
  const [modelB, setModelB] = useState("Clio");

  // Fuel calc
  const [kma, setKma] = useState(15000);
  const [lPer100, setLPer100] = useState(5.5);
  const [fuelPrice, setFuelPrice] = useState(1.95);

  useEffect(() => {
    setModelA(MODELS_BY_BRAND[brandA]?.[0] ?? "");
  }, [brandA]);

  useEffect(() => {
    setModelB(MODELS_BY_BRAND[brandB]?.[0] ?? "");
  }, [brandB]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Binary className="h-5 w-5"/>Décodage VIN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Ex: VF3CUHNYNMT000123" value={vin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVin(e.target.value.toUpperCase())} />
          <Button onClick={() => onDecodeVIN(vin)} disabled={!vin || vin.length < 11} className="w-full">
            <FileSearch className="mr-2 h-4 w-4"/> Décoder
          </Button>
          <p className="text-xs text-muted-foreground">Le VIN (17 caractères) permet d'identifier précisément un véhicule.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GitCompare className="h-5 w-5"/>Comparateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={brandA} onValueChange={setBrandA}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BRANDS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={brandB} onValueChange={setBrandB}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BRANDS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={modelA} onValueChange={setModelA}>
              <SelectTrigger><SelectValue placeholder="Modèle A"/></SelectTrigger>
              <SelectContent>
                {(MODELS_BY_BRAND[brandA] ?? ["—"]).map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={modelB} onValueChange={setModelB}>
              <SelectTrigger><SelectValue placeholder="Modèle B"/></SelectTrigger>
              <SelectContent>
                {(MODELS_BY_BRAND[brandB] ?? ["—"]).map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            onClick={() => onCompare({ brand: brandA, model: modelA }, { brand: brandB, model: modelB })}
          >
            <GitCompare className="mr-2 h-4 w-4"/> Comparer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Fuel className="h-5 w-5"/>Coût carburant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">km/an</label>
              <Input type="number" value={kma} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKma(parseInt(e.target.value || "0"))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">L/100 km</label>
              <Input type="number" step="0.1" value={lPer100} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLPer100(parseFloat(e.target.value || "0"))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">€/L</label>
              <Input type="number" step="0.01" value={fuelPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFuelPrice(parseFloat(e.target.value || "0"))} />
            </div>
          </div>
          <Button className="w-full" onClick={() => onFuelCalc({ kmPerYear: kma, lPer100, pricePerLiter: fuelPrice })}>
            <Gauge className="mr-2 h-4 w-4"/> Estimer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------------
// Outils Métier (types & fcts)
// ----------------------
interface VehicleSpec { brand: string; model: string; year?: number }
interface FuelArgs { kmPerYear: number; lPer100: number; pricePerLiter: number }

async function callChat(api: string, body: any, mock = false): Promise<Message> {
  if (mock) {
    await new Promise(r => setTimeout(r, 900));
    return {
      id: uid(),
      role: "assistant",
      content: "(MOCK) Réponse synthétique avec points clés (performances, conso WLTP/EPA, fiabilité, coûts d'entretien, TCO 5 ans). Inclut des conseils pratiques et des mises en garde.",
      sources: [
        { title: "WLTP/EPA" },
        { title: "Fiabilité (rapports)" },
      ],
    };
  }
  const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("Échec appel chat API");
  return await res.json();
}

async function decodeVIN(vin: string, mock = false) {
  if (mock) {
    await new Promise(r => setTimeout(r, 700));
    return {
      vin,
      brand: "Peugeot",
      model: "208",
      year: 2021,
      engine: "1.2 PureTech 100",
      power: "74 kW",
      fuel: "Essence",
      transmission: "BVM6",
    };
  }
  const res = await fetch(vinEndpoint + `?vin=${encodeURIComponent(vin)}`);
  if (!res.ok) throw new Error("VIN non trouvé");
  return await res.json();
}

async function compareVehicles(a: VehicleSpec, b: VehicleSpec, mock = false) {
  if (mock) {
    await new Promise(r => setTimeout(r, 800));
    return {
      a,
      b,
      highlights: [
        "208 plus légère → meilleure conso urbaine",
        "Clio TCe 90 plus douce en usage mixte",
        "Coûts d'entretien proches, assurance variable",
      ],
      table: [
        { label: "0-100 km/h", a: "10.1 s", b: "11.8 s" },
        { label: "Conso mixte WLTP", a: "5.3 L/100", b: "5.6 L/100" },
        { label: "Coffre", a: "311 L", b: "340 L" },
      ],
    };
  }
  const res = await fetch(compareEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ a, b }) });
  if (!res.ok) throw new Error("Comparaison indisponible");
  return await res.json();
}

function fuelCost({ kmPerYear, lPer100, pricePerLiter }: FuelArgs) {
  const liters = (kmPerYear / 100) * lPer100;
  const annual = liters * pricePerLiter;
  const monthly = annual / 12;
  return { annual: Math.round(annual), monthly: Math.round(monthly) };
}

// ----------------------
// Composant principal
// ----------------------
export default function AutoChatbotApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [model, setModel] = useState("gpt-5-auto");
  const [temperature, setTemperature] = useState(0.4);
  const [mockMode, setMockMode] = useState(true);
  const [dark, setDark] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Outil: comparaison (résumé côté chat)
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [vinResult, setVinResult] = useState<any | null>(null);
  const [fuelResult, setFuelResult] = useState<{ annual: number; monthly: number } | null>(null);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, compareResult, vinResult, fuelResult]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: Message = { id: uid(), role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const assistant = await callChat(chatEndpoint, { messages: [...messages, userMsg], model, temperature }, mockMode);
      setMessages((m) => [...m, assistant]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", content: `Désolé, l'appel API a échoué. ${e?.message ?? ""}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const doDecodeVIN = async (vin: string) => {
    if (!vin) return;
    setVinResult(null);
    setSending(true);
    try {
      const data = await decodeVIN(vin, mockMode);
      setVinResult(data);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content: `VIN ${vin}: ${data.brand} ${data.model} ${data.year ?? ""} — ${data.engine ?? ""} · ${data.fuel ?? ""} · ${data.transmission ?? ""}`,
        },
      ]);
    } catch (e: any) {
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: `Échec du décodage VIN: ${e?.message ?? ""}` }]);
    } finally {
      setSending(false);
    }
  };

  const doCompare = async (a: VehicleSpec, b: VehicleSpec) => {
    setCompareResult(null);
    setSending(true);
    try {
      const data = await compareVehicles(a, b, mockMode);
      setCompareResult(data);
      const bullets = (data.highlights ?? []).map((h: string) => `• ${h}`).join("\n");
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", content: `Comparatif ${a.brand} ${a.model} vs ${b.brand} ${b.model}:\n${bullets}` },
      ]);
    } catch (e: any) {
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: `Échec de la comparaison: ${e?.message ?? ""}` }]);
    } finally {
      setSending(false);
    }
  };

  const doFuelCalc = (args: FuelArgs) => {
    const res = fuelCost(args);
    setFuelResult(res);
    setMessages((m) => [
      ...m,
      { id: uid(), role: "assistant", content: `Estimation carburant: ~${res.monthly} €/mois · ~${res.annual} €/an (suppose ${args.lPer100} L/100 km, ${args.kmPerYear} km/an, ${args.pricePerLiter} €/L).` },
    ]);
  };

  const clearAll = () => {
    setMessages([]);
    setCompareResult(null);
    setVinResult(null);
    setFuelResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-primary/15 flex items-center justify-center"><Car className="h-5 w-5"/></div>
            <div>
              <div className="font-semibold leading-tight">AutoBot · Assistant Automobile</div>
              <div className="text-xs text-muted-foreground">Comparatifs · Entretien · Électrique · VIN · Rappels</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden md:inline-flex"><Cpu className="mr-1 h-3 w-3"/> {model}</Badge>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Settings className="h-5 w-5"/></Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Paramètres</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-6">
                  <div>
                    <label className="text-sm font-medium">Modèle</label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-5-auto">GPT‑5 Auto</SelectItem>
                        <SelectItem value="gpt-4o">GPT‑4o</SelectItem>
                        <SelectItem value="llama-Next">Llama Next</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">Température <Info className="h-3 w-3"/></label>
      <div className="pt-3"><Slider value={[temperature]} max={1} step={0.05} onValueChange={(v: number[]) => setTemperature(v[0])} /></div>
                    <div className="text-xs text-muted-foreground">{temperature.toFixed(2)} — plus haut = plus créatif</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Mode MOQUETTE (mock)</div>
                    <Switch checked={mockMode} onCheckedChange={setMockMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Mode sombre</div>
                    <Switch checked={dark} onCheckedChange={setDark} />
                  </div>
                  <div className="pt-2">
                    <Button variant="destructive" onClick={clearAll}><TimerReset className="mr-2 h-4 w-4"/> Effacer la session</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2"><Workflow className="h-4 w-4"/> Outils</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Accélérateurs</DropdownMenuLabel>
                {QUICK_PROMPTS.map((p) => (
                  <DropdownMenuItem key={p.label} onClick={() => handleSend(p.text)}>{p.label}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAll}>Effacer l'historique</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
            </Button>
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px,1fr,320px] gap-4 p-4">
        {/* Panneau gauche */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5"/>Raccourcis</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <Button key={p.label} variant="secondary" size="sm" onClick={() => handleSend(p.text)}>{p.label}</Button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5"/>Marques</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {BRANDS.map((b) => (
                <Badge key={b} variant="outline" className="cursor-pointer" onClick={() => handleSend(`Parle‑moi des nouveautés ${b} et des modèles recommandés pour un budget 20‑25k€.`)}>{b}</Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="flex flex-col min-h-[70vh]">
          <div ref={scrollRef} className="flex-1 rounded-2xl border p-4 bg-card overflow-y-auto space-y-3">
            {messages.length === 0 && !sending ? (
              <EmptyState onUsePrompt={(t) => handleSend(t)} />
            ) : (
              <>
                {messages.map((m) => (<MessageBubble key={m.id} msg={m} />))}
                {sending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Rédaction en cours…</div>
                )}

                {/* Résultats outils contextualisés */}
                {vinResult && (
                  <Card className="mt-2">
                    <CardHeader><CardTitle>Fiche VIN</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      {Object.entries(vinResult).map(([k,v]) => (
                        <div key={k} className="rounded-lg bg-muted px-2 py-1"><span className="text-muted-foreground capitalize">{k}</span>: <span className="font-medium">{String(v)}</span></div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {compareResult && (
                  <Card className="mt-2">
                    <CardHeader>
                      <CardTitle>Comparatif — {compareResult?.a?.brand} {compareResult?.a?.model} vs {compareResult?.b?.brand} {compareResult?.b?.model}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        {compareResult.table?.map((row: any) => (
                          <div key={row.label} className="grid grid-cols-3 items-center gap-2">
                            <div className="text-muted-foreground">{row.label}</div>
                            <div className="rounded-lg bg-muted px-2 py-1">{row.a}</div>
                            <div className="rounded-lg bg-muted px-2 py-1">{row.b}</div>
                          </div>
                        ))}
                      </div>
                      {compareResult.highlights?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {compareResult.highlights.map((h: string, i: number) => (
                            <Badge key={i} variant="secondary">{h}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {fuelResult && (
                  <Card className="mt-2">
                    <CardHeader><CardTitle>Coût carburant estimé</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                      <div className="rounded-xl bg-muted px-3 py-2 text-sm"><span className="text-muted-foreground">Mensuel</span><div className="text-lg font-semibold">~ {fuelResult.monthly} €</div></div>
                      <div className="rounded-xl bg-muted px-3 py-2 text-sm"><span className="text-muted-foreground">Annuel</span><div className="text-lg font-semibold">~ {fuelResult.annual} €</div></div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="mt-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                    placeholder="Posez votre question (ex: Quelle citadine essence fiable sous 20k€ ?)…"
                    className="min-h-[48px] resize-none"
                  />
                  <Button onClick={() => handleSend()} disabled={!input.trim() || sending}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Panneau droit */}
        <RightPanel onDecodeVIN={doDecodeVIN} onCompare={doCompare} onFuelCalc={doFuelCalc} />
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <span>Astuce :</span> demandez « Checklist occasion » pour recevoir une liste de points à vérifier avant d'acheter un véhicule d'occasion.
        </div>
      </div>
    </div>
  );
}
