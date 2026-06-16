import { useNavigate } from "react-router-dom";

const C = {
  bg: "#0F0D08",
  surface: "#1C1810",
  card: "#231F14",
  border: "#3A3120",
  amber: "#D4A843",
  text: "#F5ECD7",
  textMuted: "#8A7A5A",
  success: "#5A9A6A",
  blue: "#4A8DB5",
  purple: "#9B6DB5",
};

const features = [
  {
    title: "PDF em dados organizados",
    text: "Envie extratos ou faturas em PDF e transforme lançamentos soltos em uma visão estruturada do mês.",
  },
  {
    title: "Categorias que fazem sentido",
    text: "Veja alimentação, transporte, assinaturas, compras e outros gastos separados de forma clara.",
  },
  {
    title: "Comparativo por período",
    text: "Acompanhe receitas, despesas e mudanças entre períodos para entender o que saiu do padrão.",
  },
  {
    title: "Análise de gastos",
    text: "Identifique assinaturas, gastos reduzíveis e sugestões práticas para acompanhar melhor seu dinheiro.",
  },
];

const steps = [
  {
    number: "01",
    title: "Envie seu PDF",
    text: "Use um extrato bancário ou fatura de cartão em PDF. O CamelBox lê o arquivo e prepara as transações.",
  },
  {
    number: "02",
    title: "Veja seu mês organizado",
    text: "Receitas, despesas, saldo, categorias e transações aparecem em um dashboard simples de escanear.",
  },
  {
    number: "03",
    title: "Gere uma análise de gastos",
    text: "Receba um resumo com assinaturas, despesas que podem ser reduzidas e pontos de atenção.",
  },
];

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "",
    description: "Para testar o CamelBox com seus primeiros arquivos.",
    features: ["3 análises", "Dashboard completo", "Ideal para testar"],
    highlight: false,
  },
  {
    name: "Super",
    price: "R$ 9,99",
    period: "/mês",
    description: "Para acompanhar o mês com mais frequência.",
    features: ["20 análises por mês", "Todas as categorias", "Dashboard completo", "Suporte por email"],
    highlight: true,
  },
  {
    name: "Master",
    price: "R$ 19,99",
    period: "/mês",
    description: "Para usar sem se preocupar com limite.",
    features: ["Análises ilimitadas", "Todas as categorias", "Dashboard completo", "Suporte prioritário"],
    highlight: false,
  },
];

const page = {
  minHeight: "100vh",
  background: C.bg,
  color: C.text,
  fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const container = {
  width: "min(1120px, calc(100% - 32px))",
  margin: "0 auto",
};

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 34, height: 34, background: C.amber, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: C.bg, lineHeight: 1,
      }}>
        C
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>CamelBox</div>
        <div style={{ fontSize: 11, color: C.textMuted }}>Análise Financeira</div>
      </div>
    </div>
  );
}

function CTAButton({ children = "Criar conta grátis", secondary = false }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/auth?mode=register")}
      style={{
        padding: secondary ? "10px 15px" : "11px 16px",
        borderRadius: 9,
        border: secondary ? `1px solid ${C.amber}` : "none",
        background: secondary ? "transparent" : C.amber,
        color: secondary ? C.amber : C.bg,
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Header() {
  return (
    <header className="landing-header" style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "rgba(15,13,8,0.92)", backdropFilter: "blur(10px)",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", gap: 16 }}>
        <Logo />
        <nav style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {[
            ["Produto", "#produto"],
            ["Como funciona", "#como-funciona"],
            ["Planos", "#planos"],
            ["Sobre", "#sobre"],
          ].map(([label, href]) => (
            <a key={href} className="landing-nav-link" href={href} style={{ color: C.textMuted, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
              {label}
            </a>
          ))}
          <CTAButton />
        </nav>
      </div>
    </header>
  );
}

function HeroPreview() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: 16, boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <strong style={{ fontSize: 15 }}>Dashboard</strong>
        <span style={{ fontSize: 11, color: C.textMuted }}>Junho 2026</span>
      </div>
      <div className="landing-preview-summary" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 14 }}>
        {[
          ["Receitas", "R$ 5.000", C.text],
          ["Despesas", "R$ 3.248", C.text],
          ["Saldo", "R$ 1.752", C.success],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: 10, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{label}</div>
            <b style={{ color, fontSize: 15, whiteSpace: "nowrap" }}>{value}</b>
          </div>
        ))}
      </div>
      <div className="landing-preview-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 12 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
          <div style={{
            width: 124, height: 124, borderRadius: "50%", margin: "6px auto",
            background: `conic-gradient(${C.amber} 0 34%, ${C.success} 34% 52%, ${C.blue} 52% 70%, ${C.purple} 70% 84%, #6A7A6A 84%)`,
          }} />
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
          {[
            ["Alimentação", "R$ 850", "82%", C.amber],
            ["Transporte", "R$ 420", "54%", C.blue],
            ["Assinaturas", "R$ 189", "32%", "#8B5CF6"],
          ].map(([label, value, width, color]) => (
            <div key={label} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted, marginBottom: 6, gap: 8 }}>
                <span>{label}</span><span>{value}</span>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 4 }}>
                <div style={{ height: "100%", width, background: color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="landing-hero" style={{ ...container, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center", padding: "64px 0 42px" }}>
      <div>
        <div style={{ fontSize: 11, color: C.amber, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.6px", marginBottom: 12 }}>
          Análise financeira sem planilha
        </div>
        <h1 style={{ fontSize: 54, lineHeight: 1.02, fontWeight: 800, margin: "0 0 16px", letterSpacing: 0 }}>
          Entenda seus gastos sem planilhas.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: C.textMuted, margin: "0 0 22px", maxWidth: 520 }}>
          Envie seu extrato ou fatura em PDF e o CamelBox organiza transações, categorias e sinais do mês em um dashboard simples de ler.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <CTAButton />
          <a href="#como-funciona" style={{
            padding: "10px 15px", borderRadius: 9, border: `1px solid ${C.border}`,
            color: C.amber, fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}>
            Ver como funciona
          </a>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: C.textMuted }}>
          Comece com 3 análises grátis.
        </div>
      </div>
      <HeroPreview />
    </section>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: C.amber, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.6px", marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 28, lineHeight: 1.15, margin: "0 0 8px", letterSpacing: 0 }}>{title}</h2>
      {text && <p style={{ fontSize: 14, lineHeight: 1.6, color: C.textMuted, margin: 0, maxWidth: 620 }}>{text}</p>}
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.1rem" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>{text}</p>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.25rem" }}>
      <div style={{ color: C.amber, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>{number}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>{text}</p>
    </div>
  );
}

function PricingCard({ plan }) {
  return (
    <div style={{
      background: C.card,
      border: `2px solid ${plan.highlight ? C.amber : C.border}`,
      borderRadius: 14,
      padding: "1.35rem",
      position: "relative",
    }}>
      {plan.highlight && (
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          background: C.amber, color: C.bg, fontSize: 11, fontWeight: 800,
          padding: "3px 12px", borderRadius: 20, textTransform: "uppercase",
        }}>
          Popular
        </div>
      )}
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{plan.name}</div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: C.textMuted, minHeight: 40, margin: "0 0 14px" }}>{plan.description}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: C.amber }}>{plan.price}</span>
        {plan.period && <span style={{ fontSize: 13, color: C.textMuted }}>{plan.period}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
        {plan.features.map((feature) => (
          <div key={feature} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textMuted }}>
            <span style={{ color: C.success }}>✓</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <CTAButton secondary={!plan.highlight}>Criar conta grátis</CTAButton>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={page}>
      <style>{`
        html { scroll-behavior: smooth; }
        @media (max-width: 860px) {
          .landing-header { position: static !important; }
          .landing-nav-link { display: none !important; }
          .landing-hero,
          .landing-card-grid,
          .landing-pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .landing-hero { padding-top: 38px !important; }
          .landing-hero h1 { font-size: 38px !important; }
          .landing-preview-summary,
          .landing-preview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <Header />
      <main>
        <Hero />

        <section id="produto" style={{ ...container, padding: "36px 0" }}>
          <SectionHeading
            eyebrow="Produto"
            title="Do PDF ao dashboard em poucos passos."
            text="O CamelBox pega documentos financeiros que você já tem e organiza o mês em uma leitura mais clara."
          />
          <div className="landing-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
          </div>
        </section>

        <section id="como-funciona" style={{ ...container, padding: "36px 0" }}>
          <SectionHeading
            eyebrow="Como funciona"
            title="Menos tempo revisando lançamento por lançamento."
            text="O fluxo foi pensado para sair rápido do arquivo bruto para uma visão que ajuda a decidir."
          />
          <div className="landing-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            {steps.map((step) => <StepCard key={step.number} {...step} />)}
          </div>
        </section>

        <section id="planos" style={{ ...container, padding: "36px 0" }}>
          <SectionHeading
            eyebrow="Planos"
            title="Comece grátis e aumente quando fizer sentido."
            text="As análises são consumidas ao processar PDFs ou gerar feedback de gastos."
          />
          <div className="landing-pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            {plans.map((plan) => <PricingCard key={plan.name} plan={plan} />)}
          </div>
        </section>

        <section id="sobre" style={{ ...container, padding: "36px 0" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.5rem" }}>
            <SectionHeading eyebrow="Sobre nós" title="Uma leitura financeira que dá para usar." />
            <p style={{ fontSize: 15, lineHeight: 1.75, color: C.textMuted, margin: 0, maxWidth: 780 }}>
              O CamelBox nasceu da sensação comum de abrir a fatura, reconhecer alguns gastos e ainda assim não entender o mês.
              A ideia é simples: transformar documentos que já existem em uma leitura financeira que dá para usar.
              Menos tempo caçando lançamento, mais clareza para decidir o que manter, cortar ou acompanhar.
            </p>
          </div>
        </section>

        <section style={{ ...container, padding: "36px 0 64px" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: 24, margin: "0 0 6px", letterSpacing: 0 }}>Comece pelo seu próximo extrato.</h2>
              <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>Crie uma conta grátis e use suas primeiras análises para entender seu mês.</p>
            </div>
            <CTAButton />
          </div>
        </section>
      </main>
    </div>
  );
}
