import { createFileRoute, useNavigate, Navigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Briefcase, 
  UserCircle, 
  Loader2, 
  BarChart3, 
  MapPin, 
  Smartphone, 
  Database, 
  LayoutDashboard, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    title: "TradeVision | Inteligência em Trade Marketing",
    meta: [
      { name: "description", content: "TradeVision é a plataforma completa para gestão de operações de campo, conectando promotores e indústria com dados em tempo real." },
    ],
  }),
});

function LandingPage() {
  const { user, profile, isLoading, profileError } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirecionamento automático se logado
  if (user && profile && !profileError && !isLoading) {
    if (!profile.empresa_id) {
      return <Navigate to="/onboarding" replace />;
    } else if (profile.tipo === "gestor") {
      return <Navigate to="/gestor/dashboard" replace />;
    } else if (profile.tipo === "promotor") {
      return <Navigate to="/promotor/roteiro" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <BarChart3 className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">TradeVision</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#solucao" className="hover:text-primary transition-colors">Solução</a>
            <a href="#tecnologias" className="hover:text-primary transition-colors">Tecnologias</a>
            <a href="#fluxo" className="hover:text-primary transition-colors">Como Funciona</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth/login">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 animate-fade-in">
              <Zap size={14} />
              Projeto Portfólio Full-Stack
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[1.1]">
              Visibilidade total da sua <span className="text-primary italic">operação de campo.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              O TradeVision conecta o trabalho dos promotores nos pontos de venda à estratégia da indústria com dados em tempo real, inteligência e simplicidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold group" onClick={() => navigate({ to: "/auth/login" as any })}>
                Acessar Demonstração
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold" asChild>
                <a href="#solucao">Ver Funcionalidades</a>
              </Button>
            </div>
          </div>

          {/* Abstract background shapes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[120px]" />
          </div>
        </div>
      </section>

      {/* Stats/Problem Section */}
      <section id="solucao" className="py-24 bg-slate-50 border-y">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Resolvendo o abismo entre a indústria e o PDV.
              </h2>
              <div className="space-y-6">
                {[
                  { 
                    icon: Package, 
                    title: "Gestão de Ruptura", 
                    desc: "Identifique itens em falta nas gôndolas antes que eles impactem suas vendas." 
                  },
                  { 
                    icon: LayoutDashboard, 
                    title: "Dashboards em Tempo Real", 
                    desc: "Métricas de execução, share de gôndola e performance por loja e promotor." 
                  },
                  { 
                    icon: Smartphone, 
                    title: "Execução Mobile-First", 
                    desc: "Aplicativo otimizado para que o promotor registre fotos e dados rapidamente no campo." 
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white border shadow-sm flex items-center justify-center text-primary">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border p-2 rotate-2 scale-105 hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" 
                  alt="Supermarket Dashboard" 
                  className="rounded-xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-2xl shadow-xl max-w-[200px] hidden lg:block -rotate-3">
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-xs font-medium uppercase tracking-wider opacity-80">Precisão na coleta de dados em campo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Section */}
      <section id="fluxo" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold">O Ciclo da Eficiência</h2>
            <p className="text-muted-foreground">Do planejamento estratégico à execução operacional em 3 passos.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Planejamento", 
                desc: "O gestor cadastra lojas, produtos e define os roteiros diários para a equipe." 
              },
              { 
                step: "02", 
                title: "Execução", 
                desc: "Promotores seguem seu roteiro no app, registram fotos, preços e rupturas no PDV." 
              },
              { 
                step: "03", 
                title: "Análise", 
                desc: "Dados consolidados viram inteligência competitiva no dashboard executivo." 
              }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-white border border-slate-100 hover:border-primary/50 transition-colors group">
                <div className="text-6xl font-black text-slate-50 absolute top-4 right-8 group-hover:text-primary/5 transition-colors">{item.step}</div>
                <h3 className="text-xl font-bold mb-3 relative">{item.title}</h3>
                <p className="text-muted-foreground relative">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="tecnologias" className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Stack Tecnológica Moderna</h2>
            <p className="text-slate-400">Desenvolvido com as melhores práticas e ferramentas de 2026.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, name: "TanStack Start", desc: "React 19 + SSR/SPA" },
              { icon: Database, name: "Supabase", desc: "BaaS & PostgreSQL" },
              { icon: ShieldCheck, name: "RLS & Auth", desc: "Segurança Multi-tenant" },
              { icon: Smartphone, name: "Tailwind CSS", desc: "Design Responsivo" }
            ].map((tech, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                  <tech.icon size={32} />
                </div>
                <h4 className="font-bold text-lg">{tech.name}</h4>
                <p className="text-sm text-slate-400">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profiles Cards (from old Index) */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Pronto para testar?</h2>
            <p className="text-muted-foreground mt-2">Escolha seu perfil e acesse a demonstração.</p>
          </div>
          
          <div className="grid w-full max-w-4xl mx-auto gap-8 md:grid-cols-2">
            <Card className="hover:border-primary transition-all cursor-pointer group shadow-lg" onClick={() => navigate({ to: "/auth/login" as any })}>
              <CardHeader className="text-center pt-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Briefcase size={40} />
                </div>
                <CardTitle className="text-2xl">Gestor da Indústria</CardTitle>
                <CardDescription className="text-base px-6">
                  Acesse o cockpit de controle, gerencie sua equipe e analise a performance da marca.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-10">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">Acessar Painel</Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary transition-all cursor-pointer group shadow-lg" onClick={() => navigate({ to: "/auth/login" as any })}>
              <CardHeader className="text-center pt-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <UserCircle size={40} />
                </div>
                <CardTitle className="text-2xl">Promotor de Campo</CardTitle>
                <CardDescription className="text-base px-6">
                  Visualize seu roteiro diário, faça check-in em lojas e registre a execução.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-10">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">Acessar App Mobile</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1 rounded-lg">
                <BarChart3 className="text-white h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-primary">TradeVision</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Portfólio</a>
              <a href="https://github.com" className="hover:text-primary transition-colors flex items-center gap-1">
                GitHub
              </a>
              <a href="#" className="hover:text-primary transition-colors">Linkedin</a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; 2026 TradeVision. Projeto fictício para fins de demonstração.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
