import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Beef, Edit3, Leaf, Lock, Menu, Minus, Plus, Save, ShoppingCart, Trash2, Truck, Users, X } from 'lucide-react';
import './styles.css';

type Category = { id: string; name: string; slug: string; description?: string | null };
type Product = { id: string; category_id?: string | null; name: string; slug: string; description: string; price_cents: number; image_url?: string | null; stock?: number | null; featured?: boolean | null; active?: boolean | null };
type CartLine = { product: Product; quantity: number };
type StoreSettings = { whatsapp?: string; pix_key?: string; shipping_note?: string; headline?: string };
type OrderPayload = { customer_name: string; customer_phone: string; customer_city: string; customer_address: string; notes: string; items: { product_id: string; name: string; quantity: number; unit_price_cents: number }[]; total_cents: number; status: string };

const fallbackCategories: Category[] = [
  { id: 'tradicional', name: 'Receitas tradicionais', slug: 'tradicionais', description: 'Sabores de fazenda preparados com cuidado mineiro.' },
  { id: 'kits', name: 'Kits e presentes', slug: 'kits', description: 'Combinacoes para mesa, familia e presente.' },
];

const fallbackProducts: Product[] = [
  { id: 'lombo-lata', category_id: 'tradicional', name: 'Lombo suino na lata', slug: 'lombo-suino-na-lata', description: 'Carne suina artesanal conservada na propria banha, pronta para aquecer e servir.', price_cents: 7490, image_url: '', stock: 24, featured: true, active: true },
  { id: 'costelinha', category_id: 'tradicional', name: 'Costelinha mineira', slug: 'costelinha-mineira', description: 'Costelinha temperada com receita de familia, textura macia e sabor profundo.', price_cents: 8990, image_url: '', stock: 18, featured: true, active: true },
  { id: 'kit-raizes', category_id: 'kits', name: 'Kit Raizes Mineiras', slug: 'kit-raizes-mineiras', description: 'Selecao artesanal para conhecer os principais sabores da casa.', price_cents: 15990, image_url: '', stock: 12, featured: true, active: true },
];

const fallbackSettings: StoreSettings = {
  whatsapp: '5531999999999',
  pix_key: 'Configure no Supabase',
  shipping_note: 'Entrega nacional sob consulta. Frete calculado no atendimento.',
  headline: 'Carne suina artesanal mineira, conservada na lata e preparada com raiz.',
};

function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function makeSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
}

function App() {
  const supabase = useMemo(getSupabase, []);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [settings, setSettings] = useState<StoreSettings>(fallbackSettings);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState(location.hash.replace('#/', '') || 'loja');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => setView(location.hash.replace('#/', '') || 'loja');
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('*').eq('active', true).order('featured', { ascending: false }).order('name'),
      supabase.from('store_settings').select('*').limit(1).maybeSingle(),
    ]).then(([catRes, prodRes, settingsRes]) => {
      if (catRes.data?.length) setCategories(catRes.data as Category[]);
      if (prodRes.data?.length) setProducts(prodRes.data as Product[]);
      if (settingsRes.data) setSettings({ ...fallbackSettings, ...(settingsRes.data as StoreSettings) });
    });
  }, [supabase]);

  const addToCart = (product: Product) => {
    setCart((items) => {
      const current = items.find((line) => line.product.id === product.id);
      if (current) return items.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...items, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => setCart((items) => items.map((line) => line.product.id === id ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line).filter((line) => line.quantity > 0));
  const total = cart.reduce((sum, line) => sum + line.product.price_cents * line.quantity, 0);

  const navigate = (target: string) => { location.hash = `#/${target}`; setMenuOpen(false); };
  const productSlug = view.startsWith('produto/') ? view.slice('produto/'.length) : '';
  const currentProduct = products.find((item) => item.slug === productSlug);

  return (
    <>
      <header className="topbar">
        <button className="icon ghost" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
        <button className="brand" onClick={() => navigate('loja')}>
          <span className="seal"><Leaf size={18} /></span>
          <span><strong>Raizes Mineiras</strong><small>Nardel Nascimento</small></span>
        </button>
        <nav className="desktop-nav">
          <button onClick={() => navigate('loja')}>Loja</button>
          <button onClick={() => navigate('fundacao')}>Fundacao NN</button>
          <button onClick={() => navigate('admin')}>Admin</button>
        </nav>
        <button className="cart-pill" onClick={() => navigate('carrinho')}><ShoppingCart size={18} /> {cart.reduce((sum, item) => sum + item.quantity, 0)}</button>
      </header>
      {menuOpen && <div className="drawer"><button className="icon ghost close" onClick={() => setMenuOpen(false)}><X /></button><button onClick={() => navigate('loja')}>Loja</button><button onClick={() => navigate('fundacao')}>Fundacao NN</button><button onClick={() => navigate('admin')}>Admin</button></div>}
      {view === 'loja' && <Storefront products={products} categories={categories} settings={settings} addToCart={addToCart} navigate={navigate} />}
      {view === 'carrinho' && <Cart cart={cart} total={total} updateQty={updateQty} navigate={navigate} />}
      {view === 'checkout' && <Checkout supabase={supabase} cart={cart} total={total} settings={settings} onDone={() => setCart([])} />}
      {view === 'fundacao' && <Foundation />}
      {view === 'admin' && <Admin supabase={supabase} products={products} categories={categories} setProducts={setProducts} setCategories={setCategories} settings={settings} setSettings={setSettings} />}
      {currentProduct && <ProductDetail product={currentProduct} addToCart={addToCart} navigate={navigate} />}
      {['politica-privacidade', 'lgpd', 'isencao-responsabilidade'].includes(view) && <Legal view={view} />}
      <footer className="footer"><span>Raizes Mineiras</span><button onClick={() => navigate('politica-privacidade')}>Privacidade</button><button onClick={() => navigate('lgpd')}>LGPD</button><button onClick={() => navigate('isencao-responsabilidade')}>Avisos</button></footer>
    </>
  );
}

function Storefront({ products, categories, settings, addToCart, navigate }: { products: Product[]; categories: Category[]; settings: StoreSettings; addToCart: (p: Product) => void; navigate: (v: string) => void }) {
  const featured = products.filter((p) => p.featured !== false);
  return <main><section className="hero"><div><p className="eyebrow">Receita mineira artesanal</p><h1>{settings.headline}</h1><p>Produtos de raiz, atendimento humano e compra simples pelo carrinho ou WhatsApp.</p><div className="actions"><button className="primary" onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}>Ver produtos</button><a className="secondary" href={`https://wa.me/${settings.whatsapp || ''}`} target="_blank">Chamar no WhatsApp</a></div></div><div className="hero-card"><Beef size={58} /><strong>Feito em Minas</strong><span>{settings.shipping_note}</span></div></section><section className="trust"><span><Truck /> Envio sob consulta</span><span><Leaf /> Producao artesanal</span><span><Users /> Atendimento direto</span></section><section className="section"><h2>Categorias</h2><div className="category-grid">{categories.map((cat) => <article key={cat.id} className="category"><h3>{cat.name}</h3><p>{cat.description}</p></article>)}</div></section><section className="section" id="produtos"><h2>Produtos em destaque</h2><div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} />)}</div></section></main>;
}

function ProductCard({ product, addToCart, navigate }: { product: Product; addToCart: (p: Product) => void; navigate: (v: string) => void }) {
  return <article className="product"><div className="product-image">{product.image_url ? <img src={product.image_url} alt={product.name} /> : <Beef size={48} />}</div><div><h3>{product.name}</h3><p>{product.description}</p></div><div className="product-actions"><strong>{money(product.price_cents)}</strong><button className="secondary" onClick={() => navigate(`produto/${product.slug}`)}>Detalhes</button><button className="primary" onClick={() => addToCart(product)}>Comprar</button></div></article>;
}

function ProductDetail({ product, addToCart, navigate }: { product: Product; addToCart: (p: Product) => void; navigate: (v: string) => void }) {
  return <main className="detail"><button className="link" onClick={() => navigate('loja')}>Voltar</button><div className="detail-grid"><div className="product-image large">{product.image_url ? <img src={product.image_url} alt={product.name} /> : <Beef size={76} />}</div><div><p className="eyebrow">Produto artesanal</p><h1>{product.name}</h1><p>{product.description}</p><strong className="price">{money(product.price_cents)}</strong><button className="primary wide" onClick={() => addToCart(product)}>Adicionar ao carrinho</button></div></div></main>;
}

function Cart({ cart, total, updateQty, navigate }: { cart: CartLine[]; total: number; updateQty: (id: string, delta: number) => void; navigate: (v: string) => void }) {
  return <main className="section"><h1>Carrinho</h1>{cart.length === 0 ? <p>Seu carrinho esta vazio.</p> : <div className="panel">{cart.map((line) => <div className="cart-line" key={line.product.id}><span>{line.product.name}</span><div><button className="icon" onClick={() => updateQty(line.product.id, -1)}><Minus /></button><strong>{line.quantity}</strong><button className="icon" onClick={() => updateQty(line.product.id, 1)}><Plus /></button></div><strong>{money(line.product.price_cents * line.quantity)}</strong></div>)}<div className="total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary wide" onClick={() => navigate('checkout')}>Finalizar pedido</button></div>}</main>;
}

function Checkout({ supabase, cart, total, settings, onDone }: { supabase: SupabaseClient | null; cart: CartLine[]; total: number; settings: StoreSettings; onDone: () => void }) {
  const [sent, setSent] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const order: OrderPayload = { customer_name: String(data.get('name') || ''), customer_phone: String(data.get('phone') || ''), customer_city: String(data.get('city') || ''), customer_address: String(data.get('address') || ''), notes: String(data.get('notes') || ''), items: cart.map((line) => ({ product_id: line.product.id, name: line.product.name, quantity: line.quantity, unit_price_cents: line.product.price_cents })), total_cents: total, status: 'novo' };
    if (supabase) await supabase.from('orders').insert(order as never);
    const text = encodeURIComponent(`Pedido Raizes Mineiras\n${order.customer_name}\n${order.customer_phone}\n${order.items.map((i) => `${i.quantity}x ${i.name}`).join('\n')}\nTotal: ${money(total)}`);
    setSent(true); onDone();
    if (settings.whatsapp) window.open(`https://wa.me/${settings.whatsapp}?text=${text}`, '_blank');
  };
  return <main className="section"><h1>Checkout</h1>{sent ? <div className="panel success"><h2>Pedido registrado</h2><p>O atendimento segue pelo WhatsApp para combinar pagamento e entrega.</p></div> : <form className="form" onSubmit={submit}><input name="name" required placeholder="Nome" /><input name="phone" required placeholder="WhatsApp" /><input name="city" required placeholder="Cidade/UF" /><textarea name="address" required placeholder="Endereco de entrega" /><textarea name="notes" placeholder="Observacoes" /><div className="total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary wide" disabled={!cart.length}>Enviar pedido</button></form>}</main>;
}

function Foundation() { return <main className="section prose"><p className="eyebrow">Fundacao NN</p><h1>Raizes que alimentam cultura e comunidade</h1><p>A Fundacao NN conecta memoria, alimento, interior de Minas e impacto social. Este espaco preserva a frente institucional do projeto junto da loja.</p><div className="panel"><h2>Frentes</h2><p>Educacao alimentar, valorizacao de produtores locais, acoes comunitarias e memoria de receitas tradicionais.</p></div></main>; }

function Admin({ supabase, products, categories, setProducts, setCategories, settings, setSettings }: { supabase: SupabaseClient | null; products: Product[]; categories: Category[]; setProducts: (p: Product[]) => void; setCategories: (c: Category[]) => void; settings: StoreSettings; setSettings: (s: StoreSettings) => void }) {
  const [session, setSession] = useState(false);
  const [orders, setOrders] = useState<OrderPayload[]>([]);
  useEffect(() => { if (!supabase) return; supabase.auth.getSession().then(({ data }) => setSession(Boolean(data.session))); supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setOrders((data || []) as unknown as OrderPayload[])); }, [supabase]);
  const login = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!supabase) return; const form = new FormData(event.currentTarget); const { error } = await supabase.auth.signInWithPassword({ email: String(form.get('email')), password: String(form.get('password')) }); if (!error) setSession(true); else alert(error.message); };
  const saveProduct = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const product: Product = { id: crypto.randomUUID(), category_id: String(data.get('category_id') || categories[0]?.id || ''), name: String(data.get('name')), slug: makeSlug(String(data.get('name'))), description: String(data.get('description')), price_cents: Math.round(Number(data.get('price')) * 100), image_url: String(data.get('image_url') || ''), stock: Number(data.get('stock') || 0), featured: true, active: true }; if (supabase) await supabase.from('products').insert(product as never); setProducts([product, ...products]); event.currentTarget.reset(); };
  const removeProduct = async (id: string) => { if (supabase) await supabase.from('products').update({ active: false } as never).eq('id', id); setProducts(products.filter((product) => product.id !== id)); };
  if (!supabase) return <main className="section"><div className="panel"><Lock /><h1>Admin</h1><p>Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para ativar login, produtos, pedidos e configuracoes reais.</p></div></main>;
  if (!session) return <main className="section"><form className="form narrow" onSubmit={login}><h1>Admin</h1><input name="email" type="email" placeholder="Email" required /><input name="password" type="password" placeholder="Senha" required /><button className="primary wide">Entrar</button></form></main>;
  return <main className="admin"><section><h1>Painel</h1><div className="stats"><span>{products.length}<small>Produtos</small></span><span>{orders.length}<small>Pedidos</small></span><span>{categories.length}<small>Categorias</small></span></div></section><section className="grid-two"><form className="form" onSubmit={saveProduct}><h2>Novo produto</h2><input name="name" placeholder="Nome" required /><textarea name="description" placeholder="Descricao" required /><input name="price" type="number" step="0.01" placeholder="Preco" required /><input name="stock" type="number" placeholder="Estoque" /><input name="image_url" placeholder="URL da imagem" /><select name="category_id">{categories.map((cat) => <option value={cat.id} key={cat.id}>{cat.name}</option>)}</select><button className="primary"><Save /> Salvar</button></form><form className="form" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); const next = { ...settings, whatsapp: String(data.get('whatsapp')), pix_key: String(data.get('pix_key')), shipping_note: String(data.get('shipping_note')), headline: String(data.get('headline')) }; setSettings(next); supabase.from('store_settings').upsert(next as never); }}><h2>Configuracoes</h2><input name="headline" defaultValue={settings.headline} /><input name="whatsapp" defaultValue={settings.whatsapp} /><input name="pix_key" defaultValue={settings.pix_key} /><textarea name="shipping_note" defaultValue={settings.shipping_note} /><button className="primary"><Save /> Salvar</button></form></section><section><h2>Produtos</h2><div className="admin-list">{products.map((product) => <div key={product.id}><span><Edit3 size={16} /> {product.name}</span><strong>{money(product.price_cents)}</strong><button className="icon danger" onClick={() => removeProduct(product.id)}><Trash2 /></button></div>)}</div></section><section><h2>Pedidos</h2><div className="admin-list">{orders.map((order, index) => <div key={index}><span>{order.customer_name} - {order.customer_city}</span><strong>{money(order.total_cents)}</strong></div>)}</div></section></main>;
}

function Legal({ view }: { view: string }) { const title = view === 'lgpd' ? 'LGPD' : view === 'politica-privacidade' ? 'Politica de privacidade' : 'Isencao de responsabilidade'; return <main className="section prose"><h1>{title}</h1><p>Esta pagina informa de forma simples como a Raizes Mineiras trata dados, pedidos, atendimento e responsabilidade de compra. Atualize este texto com a versao juridica final antes da publicacao oficial.</p></main>; }

createRoot(document.getElementById('root')!).render(<App />);
