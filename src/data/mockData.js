export const MONTHLY_DATA = {
  "Jan/2025": { receitas: 8200, despesas: 5800, categorias: { Alimentação: 1450, Moradia: 1800, Transporte: 680, Lazer: 920, Saúde: 440, Outros: 510 } },
  "Fev/2025": { receitas: 8200, despesas: 6100, categorias: { Alimentação: 1620, Moradia: 1800, Transporte: 700, Lazer: 1100, Saúde: 360, Outros: 520 } },
  "Mar/2025": { receitas: 9400, despesas: 5400, categorias: { Alimentação: 1380, Moradia: 1800, Transporte: 590, Lazer: 780, Saúde: 500, Outros: 350 } },
  "Abr/2025": { receitas: 8800, despesas: 6700, categorias: { Alimentação: 1700, Moradia: 1800, Transporte: 810, Lazer: 1300, Saúde: 620, Outros: 470 } },
  "Mai/2025": { receitas: 9100, despesas: 5900, categorias: { Alimentação: 1500, Moradia: 1800, Transporte: 720, Lazer: 980, Saúde: 410, Outros: 490 } },
  "Jun/2025": { receitas: 10200, despesas: 7100, categorias: { Alimentação: 1850, Moradia: 1800, Transporte: 880, Lazer: 1450, Saúde: 580, Outros: 540 } },
};

export const PERIODS = Object.keys(MONTHLY_DATA);

export const TRANSACTIONS = [
  { id: 1,  desc: "Supermercado Extra",    categoria: "Alimentação", data: "18/06/2025", valor: -284.50,  tipo: "debit" },
  { id: 2,  desc: "Salário",              categoria: "Outros",      data: "17/06/2025", valor: 8200.00,  tipo: "credit" },
  { id: 3,  desc: "Farmácia Droga Raia",  categoria: "Saúde",       data: "16/06/2025", valor: -127.80,  tipo: "debit" },
  { id: 4,  desc: "Uber",                 categoria: "Transporte",  data: "15/06/2025", valor: -42.30,   tipo: "debit" },
  { id: 5,  desc: "Netflix",              categoria: "Lazer",       data: "14/06/2025", valor: -55.90,   tipo: "debit" },
  { id: 6,  desc: "Aluguel Junho",        categoria: "Moradia",     data: "10/06/2025", valor: -1800.00, tipo: "debit" },
  { id: 7,  desc: "iFood",               categoria: "Alimentação", data: "09/06/2025", valor: -68.40,   tipo: "debit" },
  { id: 8,  desc: "Freelance design",     categoria: "Outros",      data: "08/06/2025", valor: 2000.00,  tipo: "credit" },
  { id: 9,  desc: "Academia Smart Fit",   categoria: "Saúde",       data: "07/06/2025", valor: -109.90,  tipo: "debit" },
  { id: 10, desc: "Posto Shell",          categoria: "Transporte",  data: "06/06/2025", valor: -210.00,  tipo: "debit" },
];
