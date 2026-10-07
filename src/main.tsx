import React from "react";
import { createRoot } from "react-dom/client";
import { CheckCircle2, Leaf, Package, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import "./styles.css";

const features = [
  [Leaf, "Tradição mineira", "Uma vitrine para produtos, histórias e sabores ligados às raízes de Minas Gerais."],
  [Package, "Produtos selecionados", "Estrutura preparada para catálogo, ofertas e páginas de produto."],
  [Truck, "Entrega e checkout", "O projeto original possui base para fluxo de compra, que fica para segunda etapa."],
] as const;

function App(){return <main><section className="hero"><nav><strong>Raizes Mineiras</strong><a href="#catalogo">Catalogo</a></nav><div className="heroGrid"><div><p className="eyebrow"><ShieldCheck size={16}/> Nardel Nascimento</p><h1>Tradição, sabor e identidade mineira em uma vitrine digital.</h1><p className="lead">Primeira versão GitHub da página Raízes Mineiras, preparada para apresentar a marca e evoluir depois para loja completa.</p><a className="button" href="#catalogo"><ShoppingBag size={20}/> Ver vitrine</a></div><aside><div className="seal">RM</div><p>Versão inicial sem dependência da Lovable. E-commerce, checkout e admin entram em etapa posterior.</p></aside></div></section><section className="section cards" id="catalogo">{features.map(([Icon,title,text])=><article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</section><section className="section note"><h2>Base pronta para crescer</h2><ul><li><CheckCircle2/> GitHub Pages preparado</li><li><CheckCircle2/> Código React/Vite próprio</li><li><CheckCircle2/> Sem secrets versionados</li><li><CheckCircle2/> Funcionalidades de loja preservadas como próxima etapa</li></ul></section><footer>Raízes Mineiras | Nardel Nascimento</footer></main>}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
