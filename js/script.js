/* Brasa Burger — cardápio digital com carrinho e simulação de pedido */

const WHATSAPP = '5551999999999'; // troque pelo número real
const TAXA_ENTREGA = 7, ENTREGA_GRATIS = 80;
const CUPONS = { BEMVINDO10: { tipo: 'pct', valor: 10, nome: '10% de desconto' }, FRETEGRATIS: { tipo: 'frete', valor: 0, nome: 'Entrega grátis' } };

const $ = (s) => document.querySelector(s);
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Ilustrações em SVG (troque por fotos se quiser) ---------- */
const ARTE = {
  burger: (c = '#7a3b1d') => `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="82" rx="46" ry="5" fill="#000" opacity=".12"/><path d="M16 40a44 30 0 0 1 88 0z" fill="#e9a13b"/><g fill="#fff6dc"><ellipse cx="40" cy="24" rx="3" ry="1.6"/><ellipse cx="58" cy="18" rx="3" ry="1.6"/><ellipse cx="76" cy="24" rx="3" ry="1.6"/><ellipse cx="66" cy="30" rx="3" ry="1.6"/><ellipse cx="48" cy="32" rx="3" ry="1.6"/></g><path d="M12 44h96l-6 8H18z" fill="#6cbf3c"/><rect x="14" y="50" width="92" height="12" rx="6" fill="${c}"/><path d="M18 60h84l-8 7H26z" fill="#f5c400"/><path d="M16 66h88v6a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10z" fill="#e9a13b"/></svg>`,
  fritas: () => `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="84" rx="34" ry="4" fill="#000" opacity=".12"/><g fill="#f5c400">${[30, 40, 50, 60, 70, 80, 88].map((x, i) => `<rect x="${x}" y="${10 + (i % 3) * 6}" width="8" height="40" rx="2" transform="rotate(${(i - 3) * 4} ${x} 50)"/>`).join('')}</g><path d="M28 40h64l-8 42H36z" fill="#e63b19"/><path d="M50 52a10 10 0 0 0 20 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  bebida: (c = '#e63b19') => `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="86" rx="22" ry="3" fill="#000" opacity=".12"/><path d="M66 4l-4 18" stroke="#1c1714" stroke-width="4" stroke-linecap="round"/><path d="M38 20h44l-6 64H44z" fill="${c}"/><rect x="34" y="16" width="52" height="8" rx="3" fill="#1c1714"/><path d="M42 44h36" stroke="#fff" stroke-width="5" opacity=".8"/></svg>`,
  shake: (c = '#f4a6c0') => `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="86" rx="20" ry="3" fill="#000" opacity=".12"/><path d="M70 2l-6 22" stroke="#e63b19" stroke-width="4" stroke-linecap="round"/><path d="M40 26q20-16 40 0z" fill="#fff"/><circle cx="60" cy="14" r="5" fill="#e63b19"/><path d="M38 26h44l-8 58H46z" fill="${c}"/><path d="M40 40h40" stroke="#fff" stroke-width="3" opacity=".6"/></svg>`,
  doce: () => `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="84" rx="40" ry="4" fill="#000" opacity=".12"/><path d="M22 50h76v22a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10z" fill="#5a2e1a"/><path d="M22 50q38-30 76 0" fill="#7a3b1d"/><path d="M26 50q6 10 12 0t12 0 12 0 12 0 12 0 10 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="30" r="7" fill="#e63b19"/></svg>`
};

const CATEGORIAS = [
  { id: 'burgers', nome: 'Burgers' },
  { id: 'porcoes', nome: 'Porções' },
  { id: 'bebidas', nome: 'Bebidas' },
  { id: 'shakes', nome: 'Shakes' },
  { id: 'sobremesas', nome: 'Sobremesas' }
];

const PRODUTOS = [
  { id: 1, cat: 'burgers', nome: 'Brasa Clássico', desc: 'Pão brioche, blend 160g, queijo cheddar, alface, tomate e molho da casa.', preco: 32, arte: ARTE.burger(), fundo: '#f6e2c8', selo: 'Mais pedido' },
  { id: 2, cat: 'burgers', nome: 'Duplo Bacon', desc: 'Dois blends de 120g, muito bacon crocante, cheddar duplo e cebola caramelizada.', preco: 42, arte: ARTE.burger('#5b2a12'), fundo: '#f3d7c2' },
  { id: 3, cat: 'burgers', nome: 'Smash da Casa', desc: 'Dois smash de 90g, queijo prato, picles e maionese de alho.', preco: 29, arte: ARTE.burger('#8a4a26'), fundo: '#f8e7cf' },
  { id: 4, cat: 'burgers', nome: 'Veggie Brasa', desc: 'Burger de grão-de-bico, queijo coalho grelhado, rúcula e geleia de pimenta.', preco: 34, arte: ARTE.burger('#6b8e23'), fundo: '#e6efd7', selo: 'Vegetariano' },
  { id: 5, cat: 'porcoes', nome: 'Fritas da Brasa', desc: 'Batata rústica com páprica e alecrim. Serve 2 pessoas.', preco: 22, arte: ARTE.fritas(), fundo: '#fbe9b7' },
  { id: 6, cat: 'porcoes', nome: 'Fritas com Cheddar e Bacon', desc: 'Batata, cheddar cremoso e bacon em cubos. Serve 2 pessoas.', preco: 32, arte: ARTE.fritas(), fundo: '#f7dfa5' },
  { id: 7, cat: 'porcoes', nome: 'Onion Rings', desc: 'Anéis de cebola empanados com molho barbecue.', preco: 24, arte: ARTE.fritas(), fundo: '#f6e6c6' },
  { id: 8, cat: 'bebidas', nome: 'Refrigerante lata', desc: '350 ml. Coca-Cola, Guaraná ou Sprite.', preco: 7, arte: ARTE.bebida('#c8102e'), fundo: '#fbdcd6' },
  { id: 9, cat: 'bebidas', nome: 'Suco natural', desc: '500 ml. Laranja, limão ou maracujá.', preco: 12, arte: ARTE.bebida('#f5a300'), fundo: '#fdecc3' },
  { id: 10, cat: 'bebidas', nome: 'Água mineral', desc: '500 ml, com ou sem gás.', preco: 5, arte: ARTE.bebida('#4aa3df'), fundo: '#dcecf7' },
  { id: 11, cat: 'shakes', nome: 'Shake de Morango', desc: '400 ml de sorvete de creme batido com morangos.', preco: 22, arte: ARTE.shake('#f4a6c0'), fundo: '#fbe0ea' },
  { id: 12, cat: 'shakes', nome: 'Shake de Ovomaltine', desc: '400 ml, com farelos crocantes por cima.', preco: 24, arte: ARTE.shake('#a0703f'), fundo: '#f0e0cc', selo: 'Novo' },
  { id: 13, cat: 'sobremesas', nome: 'Brownie com sorvete', desc: 'Brownie quente de chocolate meio amargo com bola de sorvete.', preco: 19, arte: ARTE.doce(), fundo: '#ecd9cc' },
  { id: 14, cat: 'sobremesas', nome: 'Petit gâteau', desc: 'Bolinho com recheio cremoso e sorvete de creme.', preco: 21, arte: ARTE.doce(), fundo: '#f1dcd0' }
];

/* ---------- Estado ---------- */
const banco = {
  ler() { try { return JSON.parse(localStorage.getItem('brasa_carrinho')) || {}; } catch { return {}; } },
  salvar(v) { try { localStorage.setItem('brasa_carrinho', JSON.stringify(v)); } catch { /* sem storage */ } }
};
let carrinho = banco.ler(); // { idProduto: quantidade }
let cupom = null;
let timerStatus = null;

const modoEntrega = () => document.querySelector('input[name="entrega"]:checked').value;
function calcular() {
  const itens = Object.entries(carrinho).map(([id, q]) => ({ p: PRODUTOS.find((x) => x.id === Number(id)), q })).filter((i) => i.p && i.q > 0);
  const subtotal = itens.reduce((s, i) => s + i.p.preco * i.q, 0);
  const desconto = cupom?.tipo === 'pct' ? Math.round(subtotal * cupom.valor) / 100 : 0;
  const entrega = modoEntrega() === 'retirada' || subtotal - desconto >= ENTREGA_GRATIS || cupom?.tipo === 'frete' || !subtotal ? 0 : TAXA_ENTREGA;
  return { itens, subtotal, desconto, entrega, total: subtotal - desconto + entrega, qtd: itens.reduce((s, i) => s + i.q, 0) };
}

/* ---------- Cardápio ---------- */
function controleQtd(p) {
  const q = carrinho[p.id] || 0;
  return q ? `<div class="qtd-ctrl" data-id="${p.id}"><button data-d="-1" aria-label="Remover um">−</button><output>${q}</output><button data-d="1" aria-label="Adicionar um">+</button></div>`
    : `<button class="add" data-add="${p.id}">Adicionar</button>`;
}
function renderCardapio() {
  $('#categorias').innerHTML = CATEGORIAS.map((c, i) => `<a href="#${c.id}" class="${i === 0 ? 'ativa' : ''}">${c.nome}</a>`).join('');
  $('#cardapio').innerHTML = CATEGORIAS.map((c) => `
    <section class="secao" id="${c.id}">
      <h2>${c.nome}</h2>
      <div class="produtos">${PRODUTOS.filter((p) => p.cat === c.id).map((p) => `
        <article class="produto">
          <div class="produto__arte" style="--fundo-arte:${p.fundo}">${p.selo ? `<span class="selo">${p.selo}</span>` : ''}${p.arte}</div>
          <div class="produto__info">
            <h3>${p.nome}</h3>
            <p>${p.desc}</p>
            <div class="produto__rodape"><span class="preco">${brl(p.preco)}</span><span data-ctrl="${p.id}">${controleQtd(p)}</span></div>
          </div>
        </article>`).join('')}</div>
    </section>`).join('');
}
function atualizarControles() {
  PRODUTOS.forEach((p) => { const el = document.querySelector(`[data-ctrl="${p.id}"]`); if (el) el.innerHTML = controleQtd(p); });
}

function alterar(id, delta) {
  carrinho[id] = Math.max(0, (carrinho[id] || 0) + delta);
  if (!carrinho[id]) delete carrinho[id];
  banco.salvar(carrinho);
  atualizarControles(); renderCarrinho(); atualizarCapa();
  if (delta > 0) { $('#abrir-carrinho').classList.remove('pulo'); void $('#abrir-carrinho').offsetWidth; $('#abrir-carrinho').classList.add('pulo'); }
}
document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) { alterar(Number(add.dataset.add), 1); toast(`${PRODUTOS.find((p) => p.id === Number(add.dataset.add)).nome} no carrinho`); return; }
  const b = e.target.closest('.qtd-ctrl button');
  if (b) alterar(Number(b.closest('.qtd-ctrl').dataset.id), Number(b.dataset.d));
});

function atualizarCapa() {
  const c = calcular();
  $('#qtd-carrinho').textContent = c.qtd;
  $('#total-capa').textContent = brl(c.subtotal);
}

// Destaca a categoria visível no menu
const espiao = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (!en.isIntersecting) return;
    document.querySelectorAll('.categorias a').forEach((a) => {
      const ativa = a.getAttribute('href') === `#${en.target.id}`;
      a.classList.toggle('ativa', ativa);
      if (ativa) { const nav = $('#categorias'); nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' }); }
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

/* ---------- Carrinho ---------- */
function renderCarrinho() {
  const c = calcular();
  $('#itens').innerHTML = c.itens.length ? c.itens.map((i) => `
    <li class="item"><span><b>${i.p.nome}</b><small>${brl(i.p.preco)} cada</small></span><span class="preco">${brl(i.p.preco * i.q)}</span>
      <div class="qtd-ctrl" data-id="${i.p.id}"><button data-d="-1" aria-label="Remover um">−</button><output>${i.q}</output><button data-d="1" aria-label="Adicionar um">+</button></div></li>`).join('')
    : '<li class="carrinho-vazio">Seu carrinho está vazio.<br>Escolha algo gostoso no cardápio!</li>';
  const falta = ENTREGA_GRATIS - (c.subtotal - c.desconto);
  $('#contas').innerHTML = `
    <div><dt>Subtotal</dt><dd>${brl(c.subtotal)}</dd></div>
    ${c.desconto ? `<div class="desconto"><dt>Cupom ${escapar(cupom.codigo)}</dt><dd>− ${brl(c.desconto)}</dd></div>` : ''}
    <div><dt>Entrega${modoEntrega() === 'entrega' && falta > 0 && c.subtotal && cupom?.tipo !== 'frete' ? ` <small>(faltam ${brl(falta)} para grátis)</small>` : ''}</dt><dd>${c.entrega ? brl(c.entrega) : 'Grátis'}</dd></div>
    <div class="final"><dt>Total</dt><dd class="total-final">${brl(c.total)}</dd></div>`;
  $('#ir-checkout').disabled = !c.itens.length;
}
document.querySelectorAll('input[name="entrega"]').forEach((r) => r.addEventListener('change', () => { renderCarrinho(); $('#campo-endereco').hidden = modoEntrega() === 'retirada'; }));

$('#form-cupom').addEventListener('submit', (e) => {
  e.preventDefault();
  const cod = $('#cupom').value.trim().toUpperCase();
  const msg = $('#msg-cupom');
  if (CUPONS[cod]) { cupom = { ...CUPONS[cod], codigo: cod }; msg.className = 'dica-cupom ok'; msg.textContent = `Cupom aplicado: ${cupom.nome}`; }
  else { cupom = null; msg.className = 'dica-cupom nok'; msg.textContent = 'Cupom inválido ou expirado.'; }
  renderCarrinho();
});

function etapa(nome) {
  ['carrinho', 'checkout', 'acompanhar'].forEach((n) => { $(`#etapa-${n}`).hidden = n !== nome; });
  $('#gaveta-titulo').textContent = { carrinho: 'Seu pedido', checkout: 'Finalizar', acompanhar: 'Acompanhe' }[nome];
}
$('#abrir-carrinho').addEventListener('click', () => { if ($('#etapa-acompanhar').hidden) etapa('carrinho'); renderCarrinho(); $('#gaveta').showModal(); });
$('#fechar-gaveta').addEventListener('click', () => $('#gaveta').close());
$('#gaveta').addEventListener('click', (e) => { if (e.target === $('#gaveta')) $('#gaveta').close(); });
$('#ir-checkout').addEventListener('click', () => { etapa('checkout'); $('#campo-endereco').hidden = modoEntrega() === 'retirada'; $('#c-nome').focus(); });
$('#voltar-carrinho').addEventListener('click', () => etapa('carrinho'));
document.querySelectorAll('input[name="pag"]').forEach((r) => r.addEventListener('change', () => { $('#campo-troco').hidden = r.value !== 'Dinheiro' || !r.checked; }));
$('#c-tel').addEventListener('input', (e) => {
  const d = e.target.value.replace(/\D/g, '').slice(0, 11);
  e.target.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
});

/* ---------- Pedido simulado ---------- */
$('#etapa-checkout').addEventListener('submit', (e) => {
  e.preventDefault();
  const c = calcular();
  const nome = $('#c-nome').value.trim(), tel = $('#c-tel').value.replace(/\D/g, ''), end = $('#c-end').value.trim();
  const pag = document.querySelector('input[name="pag"]:checked').value;
  if (!nome) return ($('#erro').textContent = 'Informe seu nome.');
  if (tel.length < 10) return ($('#erro').textContent = 'Informe um WhatsApp com DDD.');
  if (modoEntrega() === 'entrega' && end.length < 6) return ($('#erro').textContent = 'Informe o endereço de entrega.');
  $('#erro').textContent = '';

  const numero = String(Math.floor(1000 + Math.random() * 9000));
  const linhas = c.itens.map((i) => `${i.q}x ${i.p.nome} — ${brl(i.p.preco * i.q)}`).join('\n');
  const troco = pag === 'Dinheiro' && $('#c-troco').value ? ` (troco para R$ ${$('#c-troco').value})` : '';
  const msg = `*Pedido #${numero} — Brasa Burger*\n${linhas}\n\nSubtotal: ${brl(c.subtotal)}${c.desconto ? `\nDesconto: −${brl(c.desconto)}` : ''}\nEntrega: ${c.entrega ? brl(c.entrega) : 'grátis'}\n*Total: ${brl(c.total)}*\n\n${modoEntrega() === 'entrega' ? `Entregar em: ${end}` : 'Vou retirar no local'}\nPagamento: ${pag}${troco}\nNome: ${nome}`;
  $('#link-whats').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  $('#num-pedido').textContent = `#${numero}`;
  iniciarAcompanhamento(modoEntrega());
  carrinho = {}; cupom = null; banco.salvar(carrinho);
  $('#cupom').value = ''; $('#msg-cupom').className = 'dica-cupom'; $('#msg-cupom').innerHTML = 'Experimente o cupom <b>BEMVINDO10</b>';
  atualizarControles(); atualizarCapa();
  etapa('acompanhar');
});

function iniciarAcompanhamento(modo) {
  const passos = [
    ['Pedido recebido', 'A cozinha já viu seu pedido'],
    ['Em preparo', 'Seu burger está na brasa'],
    modo === 'entrega' ? ['Saiu para entrega', 'O entregador está a caminho'] : ['Pronto para retirada', 'Pode vir buscar no balcão'],
    [modo === 'entrega' ? 'Entregue' : 'Retirado', 'Bom apetite!']
  ];
  const previsto = new Date(Date.now() + (modo === 'entrega' ? 40 : 20) * 60000);
  $('#previsao').textContent = `${modo === 'entrega' ? 'Previsão de entrega' : 'Pronto por volta de'}: ${previsto.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  let atual = 0;
  const desenhar = () => {
    $('#linha-tempo').innerHTML = passos.map(([t, s], i) => `<li class="${i < atual ? 'feito' : i === atual ? 'agora' : ''}"><span>${t}<small>${s}</small></span></li>`).join('');
  };
  desenhar();
  clearInterval(timerStatus);
  // Simulação: avança uma etapa a cada 6 segundos
  timerStatus = setInterval(() => { atual++; desenhar(); if (atual >= passos.length) clearInterval(timerStatus); }, 6000);
}
$('#novo-pedido').addEventListener('click', () => { clearInterval(timerStatus); etapa('carrinho'); renderCarrinho(); $('#gaveta').close(); });

let timerToast;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(timerToast); timerToast = setTimeout(() => { t.hidden = true; }, 1800); }

// Horário de funcionamento: 18h às 23h30, fechado às segundas
(function statusLoja() {
  const d = new Date(), min = d.getHours() * 60 + d.getMinutes();
  const aberto = d.getDay() !== 1 && min >= 18 * 60 && min <= 23 * 60 + 30;
  $('#status-loja').textContent = aberto ? 'Aberto agora' : 'Fechado agora (pedidos agendados)';
  document.querySelector('.luz').classList.toggle('fechado', !aberto);
})();

renderCardapio();
document.querySelectorAll('.secao').forEach((s) => espiao.observe(s));
renderCarrinho(); atualizarCapa();
