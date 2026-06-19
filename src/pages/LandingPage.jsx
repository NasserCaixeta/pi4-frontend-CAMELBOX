import { useNavigate } from "react-router-dom";
import useRevealOnScroll from "../hooks/useRevealOnScroll";

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

function scrollToSection(id) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

function Logo() {
  return (
    <div className="landing-logo">
      <div className="landing-logo__mark">
        C
      </div>
      <div>
        <div className="landing-logo__name">CamelBox</div>
        <div className="landing-logo__sub">Análise Financeira</div>
      </div>
    </div>
  );
}

function CTAButton({ children = "Criar conta grátis", secondary = false }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/auth?mode=register")}
      className={`cb-button ${secondary ? "cb-button--outline" : "cb-button--primary"}`}
    >
      {children}
    </button>
  );
}

function Header() {
  return (
    <header className="landing-header">
      <div className="cb-container landing-header__inner">
        <Logo />
        <nav className="landing-nav">
          {[
            ["Produto", "produto"],
            ["Como funciona", "como-funciona"],
            ["Planos", "planos"],
            ["Sobre", "sobre"],
          ].map(([label, id]) => (
            <button
              key={id}
              type="button"
              className="landing-nav__link"
              onClick={() => scrollToSection(id)}
            >
              {label}
            </button>
          ))}
          <CTAButton />
        </nav>
      </div>
    </header>
  );
}

function HeroPreview() {
  return (
    <div className="cb-card cb-reveal cb-animate-delay-2 landing-preview">
      <div className="landing-preview__top">
        <strong>Dashboard</strong>
        <span className="landing-preview__date">Junho 2026</span>
      </div>
      <div className="landing-preview__summary">
        {[
          ["Receitas", "R$ 5.000", false],
          ["Despesas", "R$ 3.248", false],
          ["Saldo", "R$ 1.752", true],
        ].map(([label, value, success]) => (
          <div key={label} className="landing-preview__metric">
            <div className="landing-preview__metric-label">{label}</div>
            <b className={`landing-preview__metric-value${success ? " landing-preview__metric-value--success" : ""}`}>{value}</b>
          </div>
        ))}
      </div>
      <div className="landing-preview__grid">
        <div className="landing-preview__panel">
          <div className="landing-preview__donut" />
        </div>
        <div className="landing-preview__panel">
          {[
            ["Alimentação", "R$ 850", "82%", "var(--cb-color-amber)"],
            ["Transporte", "R$ 420", "54%", "var(--cb-color-blue)"],
            ["Assinaturas", "R$ 189", "32%", "#8B5CF6"],
          ].map(([label, value, width, color]) => (
            <div key={label} className="landing-preview__bar-row">
              <div className="landing-preview__bar-label">
                <span>{label}</span><span>{value}</span>
              </div>
              <div className="landing-preview__bar-track">
                <div className="landing-preview__bar-fill" style={{ width, background: color }} />
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
    <section className="cb-container landing-hero">
      <div className="cb-reveal">
        <div className="landing-eyebrow">
          Análise financeira sem planilha
        </div>
        <h1 className="landing-hero__title">
          Entenda seus gastos sem planilhas.
        </h1>
        <p className="landing-hero__text">
          Envie seu extrato ou fatura em PDF e o CamelBox organiza transações, categorias e sinais do mês em um dashboard simples de ler.
        </p>
        <div className="landing-hero__actions">
          <CTAButton />
          <button
            type="button"
            onClick={() => scrollToSection("como-funciona")}
            className="cb-button cb-button--outline"
          >
            Ver como funciona
          </button>
        </div>
        <div className="landing-hero__note">
          Comece com 3 análises grátis.
        </div>
      </div>
      <HeroPreview />
    </section>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="landing-section-heading cb-reveal">
      <div className="landing-eyebrow">
        {eyebrow}
      </div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="cb-card cb-reveal landing-feature-card">
      <h3 className="landing-feature-card__title">{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <div className="cb-card cb-reveal landing-step-card">
      <div className="landing-step-card__number">{number}</div>
      <h3 className="landing-step-card__title">{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function PricingCard({ plan }) {
  return (
    <div className={`cb-card cb-reveal landing-pricing-card${plan.highlight ? " landing-pricing-card--highlight" : ""}`}>
      {plan.highlight && (
        <div className="landing-pricing-card__badge">
          Popular
        </div>
      )}
      <h3 className="landing-pricing-card__title">{plan.name}</h3>
      <p className="landing-pricing-card__description">{plan.description}</p>
      <div className="landing-pricing-card__price">
        <span>{plan.price}</span>
        {plan.period && <small>{plan.period}</small>}
      </div>
      <ul className="landing-pricing-card__features">
        {plan.features.map((feature) => (
          <li key={feature} className="landing-pricing-card__feature">
            <span aria-hidden="true">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <CTAButton secondary={!plan.highlight}>Criar conta grátis</CTAButton>
    </div>
  );
}

export default function LandingPage() {
  useRevealOnScroll();

  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />

        <section id="produto" className="cb-container landing-section">
          <SectionHeading
            eyebrow="Produto"
            title="Do PDF ao dashboard em poucos passos."
            text="O CamelBox pega documentos financeiros que você já tem e organiza o mês em uma leitura mais clara."
          />
          <div className="landing-card-grid landing-card-grid--four">
            {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
          </div>
        </section>

        <section id="como-funciona" className="cb-container landing-section">
          <SectionHeading
            eyebrow="Como funciona"
            title="Menos tempo revisando lançamento por lançamento."
            text="O fluxo foi pensado para sair rápido do arquivo bruto para uma visão que ajuda a decidir."
          />
          <div className="landing-card-grid landing-card-grid--three">
            {steps.map((step) => <StepCard key={step.number} {...step} />)}
          </div>
        </section>

        <section id="planos" className="cb-container landing-section">
          <SectionHeading
            eyebrow="Planos"
            title="Comece grátis e aumente quando fizer sentido."
            text="As análises são consumidas ao processar PDFs ou gerar feedback de gastos."
          />
          <div className="landing-pricing-grid">
            {plans.map((plan) => <PricingCard key={plan.name} plan={plan} />)}
          </div>
        </section>

        <section id="sobre" className="cb-container landing-section">
          <div className="cb-card cb-reveal landing-about-card">
            <SectionHeading eyebrow="Sobre nós" title="Uma leitura financeira que dá para usar." />
            <p className="landing-about-card__text">
              O CamelBox nasceu da sensação comum de abrir a fatura, reconhecer alguns gastos e ainda assim não entender o mês.
              A ideia é simples: transformar documentos que já existem em uma leitura financeira que dá para usar.
              Menos tempo caçando lançamento, mais clareza para decidir o que manter, cortar ou acompanhar.
            </p>
          </div>
        </section>

        <section className="cb-container landing-section landing-section--final">
          <div className="cb-card cb-reveal landing-final-card">
            <div>
              <h2>Comece pelo seu próximo extrato.</h2>
              <p>Crie uma conta grátis e use suas primeiras análises para entender seu mês.</p>
            </div>
            <CTAButton />
          </div>
        </section>
      </main>
    </div>
  );
}
