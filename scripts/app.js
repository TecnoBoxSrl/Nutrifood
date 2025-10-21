async function loadJSON(path){
  const response = await fetch(path);
  if(!response.ok) throw new Error(`Impossibile caricare ${path}`);
  return response.json();
}

function el(tag, attrs={}, children=[]){
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key,value])=>{
    if(key === 'class') element.className = value;
    else if(key === 'html') element.innerHTML = value;
    else if(key.startsWith('on') && typeof value === 'function') element.addEventListener(key.slice(2), value);
    else element.setAttribute(key, value);
  });
  children.forEach(child => {
    if(child === null || child === undefined) return;
    element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return element;
}


function escapeXml(value){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function adjustColor(hex = '#ffb979', amount = 0){
  let color = hex.replace('#','');
  if(color.length === 3){
    color = color.split('').map(ch => ch + ch).join('');
  }
  const num = parseInt(color,16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function createImagePlaceholder(title, variant, accent){
  const base = accent || '#ffb979';
  const secondary = variant === 'packaging' ? adjustColor(base, -35) : adjustColor(base, 25);
  const safeTitle = escapeXml(title);
  const safeLabel = escapeXml(variant === 'packaging' ? 'Confezione' : 'Idea servizio');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" role="img" aria-label="Illustrazione ${safeLabel} ${safeTitle}">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${base}"/>
        <stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <rect width="420" height="320" rx="28" fill="url(#grad)"/>
    <text x="32" y="86" font-size="64" font-family="'Poppins', 'Segoe UI', sans-serif" fill="rgba(0,0,0,0.18)" font-weight="700">Nutrì</text>
    <text x="32" y="164" font-size="32" font-family="'Poppins', 'Segoe UI', sans-serif" fill="#0f0f0f" font-weight="600">${safeTitle}</text>
    <text x="32" y="212" font-size="20" font-family="'Poppins', 'Segoe UI', sans-serif" fill="#111" opacity="0.8">${safeLabel}</text>
    <text x="32" y="256" font-size="16" font-family="'Poppins', 'Segoe UI', sans-serif" fill="#111" opacity="0.7">Linea artigianale Nutrì Food Lab</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}


function printSection(node, title='Dettaglio Nutrì'){
  const win = window.open('', '_blank','width=800,height=900');
  if(!win) return;
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link=>`<link rel="stylesheet" href="${link.getAttribute('href')}">`).join('\n');
  win.document.write(`<!doctype html><html><head><title>${title}</title>${styles}</head><body class="print-preview">${node.outerHTML}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

function currentPageUrl(){
  const url = new URL(window.location.href);
  url.hash = '';
  return url.href;
}

function pageUrlWithHash(hash){
  const url = new URL(window.location.href);
  url.hash = hash || '';
  return url.href;
}

function productDetailUrl(slug, hash){
  const url = new URL('prodotto.html', window.location.href);
  url.searchParams.set('slug', slug);
  if(hash) url.hash = hash;
  return url.href;
}

function createShareBar({title, text, url, node}){
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} - ${text}`);
  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n' + url)}`;
  const whatsappHref = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const instagramHref = `https://www.instagram.com/?url=${encodedUrl}`;

  const actions = el('div',{class:'share-bar'},[
    el('button',{type:'button',class:'btn btn-ghost',onClick:()=>printSection(node,title)},['🖨️ Stampa']),
    el('a',{href:mailHref,target:'_blank',rel:'noopener',class:'share-link'},['✉️ Email']),
    el('a',{href:whatsappHref,target:'_blank',rel:'noopener',class:'share-link'},['💬 WhatsApp']),
    el('a',{href:facebookHref,target:'_blank',rel:'noopener',class:'share-link'},['📘 Facebook']),
    el('a',{href:instagramHref,target:'_blank',rel:'noopener',class:'share-link'},['📸 Instagram'])
  ]);
  return actions;
}

let cachedProducts = null;

async function loadProductsData(){
  if(!cachedProducts){
    cachedProducts = await loadJSON('data/products.json');
  }
  return cachedProducts;
}

async function renderProductsGrid(){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  const data = await loadProductsData();
  data.categories.forEach(category => {
    const productsList = el('div',{class:'product-list'}, category.items.map(item => {
      return el('a', {
        class: 'product-link',
        href: `prodotto.html?slug=${encodeURIComponent(item.slug)}`
      }, [
        el('strong',{},[item.name]),
        el('span',{},[item.summary])
      ]);
    }));
    grid.appendChild(el('div',{class:'card product-card'},[
      el('h2',{},[category.name]),
      el('p',{},[category.description]),
      productsList
    ]));
  });
}

async function renderProductDetail(){
  const container = document.getElementById('productDetail');
  if(!container) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if(!slug){
    container.innerHTML = '<p class="muted">Seleziona un prodotto dalla pagina prodotti.</p>';
    return;
  }
  const data = await loadProductsData();
  let product = null;
  let categoryName = '';
  data.categories.some(category => {
    const found = category.items.find(item => item.slug === slug);
    if(found){
      product = found;
      categoryName = category.name;
      return true;
    }
    return false;
  });
  if(!product){
    container.innerHTML = `<div class="card"><h1>Prodotto non trovato</h1><p>Il prodotto richiesto non è presente. Torna ai <a href="prodotti.html">prodotti Nutrì</a>.</p></div>`;
    return;
  }
  const accent = product.accentColor || '#ffb979';
  const packagingImage = createImagePlaceholder(product.name, 'packaging', accent);
  const preparedImage = createImagePlaceholder(product.name, 'prepared', accent);
  const navProduct = document.querySelector('.nav a[href="prodotti.html"]');
  if(navProduct) navProduct.setAttribute('aria-current','page');
  const header = el('header',{class:'page-header product-header'},[
    el('p',{class:'breadcrumb'},[el('a',{href:'prodotti.html'},['Prodotti']), ' / ', categoryName]),
    el('h1',{},[product.name]),
    el('p',{},[product.summary])
  ]);

  const gallery = el('div',{class:'product-gallery'},[
    el('figure',{class:'card'},[
      el('img',{src:packagingImage,alt:`Confezione ${product.name}`},[]),
      el('figcaption',{},['Confezione'])
    ]),
    el('figure',{class:'card'},[
      el('img',{src:preparedImage,alt:`${product.name} pronto da gustare`},[]),
      el('figcaption',{},['Servizio suggerito'])
    ])
  ]);

  const ingredients = el('div',{class:'card'},[
    el('h2',{},['Ingredienti base']),
    el('ul',{},product.ingredients.map(item=> el('li',{},[item])))
  ]);

  const pairings = el('div',{class:'card'},[
    el('h2',{},['Abbinamenti consigliati']),
    el('ul',{},[
      el('li',{},[`Proteina: ${product.pairings.protein}`]),
      el('li',{},[`Verdura: ${product.pairings.vegetable}`]),
      el('li',{},[`Carboidrato: ${product.pairings.carb}`])
    ])
  ]);

  const detailWrapper = el('section',{class:'product-detail'},[
    header,
    createShareBar({
      title: product.name,
      text: product.summary,
      url: currentPageUrl(),
      node: container
    }),
    gallery,
    el('div',{class:'product-info-grid'},[ingredients, pairings])
  ]);

  const recipesSection = el('section',{class:'product-recipes'},[
    el('h2',{},['Ricette con ', product.name]),
    el('div',{class:'grid'}, product.recipes.map(recipe => {
      const card = el('article',{class:'card recipe-card','id':recipe.id},[
        el('h3',{},[recipe.title]),
        el('p',{},[recipe.intro]),
        el('p',{},[el('strong',{},['Ingredienti: ']), recipe.ingredients.join(', ')]),
        el('ol',{},recipe.steps.map(step => el('li',{},[step])))
      ]);
      card.appendChild(createShareBar({
        title: recipe.title,
        text: recipe.intro,
        url: productDetailUrl(product.slug, recipe.id),
        node: card
      }));
      return card;
    }))
  ]);

  container.innerHTML = '';
  container.appendChild(detailWrapper);
  container.appendChild(recipesSection);
}

async function renderRecipes(){
  const list = document.getElementById('recipesList');
  if(!list) return;
  const data = await loadProductsData();
  const recipes = [];
  data.categories.forEach(category => {
    category.items.forEach(product => {
      product.recipes.forEach(recipe => {
        recipes.push({
          ...recipe,
          accentColor: product.accentColor,
          summary: product.summary
        });
      });
    });
  });
  recipes.forEach(recipe => {
    const card = el('article',{class:'card recipe-card',id:recipe.id},[
      el('h3',{},[recipe.title]),
      el('p',{},[recipe.intro]),
      el('p',{},[el('strong',{},['Prodotto: ']), el('a',{href:productDetailUrl(recipe.productSlug, recipe.id)},[recipe.product])]),
      el('p',{},[el('strong',{},['Ingredienti: ']), recipe.ingredients.join(', ')]),
      el('ol',{},recipe.steps.map(step => el('li',{},[step])))
    ]);
    card.appendChild(createShareBar({
      title: recipe.title,
      text: recipe.intro,
      url: pageUrlWithHash(recipe.id),
      node: card
    }));
    list.appendChild(card);
  });
}

function setupContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');
    const subject = `Richiesta informazioni da ${name}`;
    const body = `Nome: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:info@nutri-food.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProductsGrid();
  renderProductDetail();
  renderRecipes();
  setupContactForm();
});
