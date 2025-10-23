async function loadJSON(path){
  const response = await fetch(path);
  if(!response.ok) throw new Error(`Impossibile caricare ${path}`);
  return response.json();
}

const NUTRI_LOGO_URL = 'https://tecnoboxsrl.github.io/Nutrifood/assets/nutri.png';

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

function createRecipePlaceholder(title, accent, difficulty){
  const base = accent || '#ffb979';
  const secondary = adjustColor(base, 35);
  const safeTitle = escapeXml(title);
  const safeDifficulty = escapeXml(difficulty || '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" role="img" aria-label="${safeTitle} pronto da servire">
    <defs>
      <linearGradient id="recipeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${base}"/>
        <stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <rect width="360" height="240" rx="26" fill="url(#recipeGrad)"/>
    <circle cx="300" cy="54" r="46" fill="rgba(0,0,0,0.18)"/>
    <text x="28" y="78" font-size="24" font-family="'Poppins','Segoe UI',sans-serif" fill="rgba(0,0,0,0.18)" font-weight="700">Nutrì Food Lab</text>
    <text x="28" y="122" font-size="26" font-family="'Poppins','Segoe UI',sans-serif" fill="#121" font-weight="600">${safeTitle}</text>
    <text x="28" y="160" font-size="18" font-family="'Poppins','Segoe UI',sans-serif" fill="#111" opacity="0.85">${safeDifficulty}</text>
    <text x="28" y="198" font-size="14" font-family="'Poppins','Segoe UI',sans-serif" fill="#111" opacity="0.7">Preparazione artigianale pronta da stampare o condividere</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function applyNutriBranding(){
  document.querySelectorAll('img[data-logo="nutri"]').forEach(img => {
    if(img.getAttribute('src') !== NUTRI_LOGO_URL){
      img.setAttribute('src', NUTRI_LOGO_URL);
    }
  });
  document.querySelectorAll('link[rel="icon"][data-logo="nutri"]').forEach(link => {
    if(link.getAttribute('href') !== NUTRI_LOGO_URL){
      link.setAttribute('href', NUTRI_LOGO_URL);
    }
    if(!link.getAttribute('type')){
      link.setAttribute('type','image/png');
    }
  });
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
let recipeIndex = [];
const recipeFilters = { category: 'all', product: 'all', difficulty: 'all' };

async function loadProductsData(){
  if(!cachedProducts){
    cachedProducts = await loadJSON('data/products.json');
  }
  return cachedProducts;
}

function buildRecipeIndex(data){
  recipeIndex = [];
  data.categories.forEach(category => {
    category.items.forEach(product => {
      product.recipes.forEach(recipe => {
        recipeIndex.push({
          ...recipe,
          category: category.name,
          productName: product.name,
          productSummary: product.summary,
          productSlug: product.slug,
          accentColor: product.accentColor,
          image: createRecipePlaceholder(recipe.title, product.accentColor, recipe.difficulty)
        });
      });
    });
  });
}

function populateRecipeProductOptions(data, select){
  const options = [];
  if(recipeFilters.category === 'all'){
    data.categories.forEach(category => {
      category.items.forEach(product => {
        options.push({ value: product.slug, label: `${product.name} · ${category.name}` });
      });
    });
  }else{
    const category = data.categories.find(cat => cat.name === recipeFilters.category);
    if(category){
      category.items.forEach(product => {
        options.push({ value: product.slug, label: product.name });
      });
    }
  }
  select.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Tutti i prodotti';
  select.appendChild(allOption);
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
  if(!options.some(option => option.value === recipeFilters.product)){
    recipeFilters.product = 'all';
  }
  select.value = recipeFilters.product;
}

function setupRecipeFilters(data){
  const typeSelect = document.getElementById('recipeTypeFilter');
  const productSelect = document.getElementById('recipeProductFilter');
  const difficultySelect = document.getElementById('recipeDifficultyFilter');
  if(!typeSelect || !productSelect || !difficultySelect) return;

  if(!typeSelect.dataset.initialized){
    typeSelect.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Tutte le tipologie';
    typeSelect.appendChild(allOption);
    data.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      typeSelect.appendChild(option);
    });
    typeSelect.dataset.initialized = 'true';
  }

  typeSelect.value = recipeFilters.category;
  difficultySelect.value = recipeFilters.difficulty;
  populateRecipeProductOptions(data, productSelect);

  if(!typeSelect.dataset.bound){
    typeSelect.addEventListener('change', () => {
      recipeFilters.category = typeSelect.value;
      recipeFilters.product = 'all';
      populateRecipeProductOptions(data, productSelect);
      renderRecipeCards();
    });
    typeSelect.dataset.bound = 'true';
  }

  if(!productSelect.dataset.bound){
    productSelect.addEventListener('change', () => {
      recipeFilters.product = productSelect.value;
      renderRecipeCards();
    });
    productSelect.dataset.bound = 'true';
  }

  if(!difficultySelect.dataset.bound){
    difficultySelect.addEventListener('change', () => {
      recipeFilters.difficulty = difficultySelect.value;
      renderRecipeCards();
    });
    difficultySelect.dataset.bound = 'true';
  }
}

function getFilteredRecipes(){
  return recipeIndex.filter(recipe => {
    if(recipeFilters.category !== 'all' && recipe.category !== recipeFilters.category) return false;
    if(recipeFilters.product !== 'all' && recipe.productSlug !== recipeFilters.product) return false;
    if(recipeFilters.difficulty !== 'all' && recipe.difficulty !== recipeFilters.difficulty) return false;
    return true;
  });
}

function renderRecipeCards(){
  const list = document.getElementById('recipesList');
  if(!list) return;
  list.innerHTML = '';
  const recipes = getFilteredRecipes();
  if(!recipes.length){
    list.appendChild(el('p',{class:'muted'},['Nessuna ricetta corrisponde ai filtri selezionati.']));
    return;
  }
  recipes.forEach(recipe => {
    const diffSlug = (recipe.difficulty || '').toLowerCase().replace(/\s+/g,'-');
    const card = el('article',{class:'card recipe-card',id:recipe.id},[
      el('figure',{class:'recipe-figure'},[
        el('img',{src:recipe.image || createRecipePlaceholder(recipe.title, recipe.accentColor, recipe.difficulty),alt:`${recipe.title} - piatto finito`},[])
      ]),
      el('div',{class:'recipe-meta'},[
        el('span',{class:`badge difficulty difficulty-${diffSlug}`},[recipe.difficulty]),
        el('span',{class:'muted'},[recipe.category]),
        el('a',{href:productDetailUrl(recipe.productSlug, recipe.id),class:'recipe-meta-link'},[recipe.productName])
      ]),
      el('h3',{},[recipe.title]),
      el('p',{},[recipe.intro]),
      el('p',{},[el('strong',{},['Ingredienti: ']), recipe.ingredients.join(', ')]),
      el('ol',{},recipe.steps.map(step => el('li',{},[step])))
    ]);
    card.appendChild(createShareBar({
      title: recipe.title,
      text: `${recipe.productName} · ${recipe.difficulty}`,
      url: pageUrlWithHash(recipe.id),
      node: card
    }));
    list.appendChild(card);
  });
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
      const diffSlug = (recipe.difficulty || '').toLowerCase().replace(/\s+/g,'-');
      const card = el('article',{class:'card recipe-card','id':recipe.id},[
        el('figure',{class:'recipe-figure'},[
          el('img',{src:createRecipePlaceholder(recipe.title, accent, recipe.difficulty),alt:`${recipe.title} - piatto finito`},[])
        ]),
        el('div',{class:'recipe-meta'},[
          el('span',{class:`badge difficulty difficulty-${diffSlug}`},[recipe.difficulty]),
          el('span',{class:'muted'},[categoryName])
        ]),
        el('h3',{},[recipe.title]),
        el('p',{},[recipe.intro]),
        el('p',{},[el('strong',{},['Ingredienti: ']), recipe.ingredients.join(', ')]),
        el('ol',{},recipe.steps.map(step => el('li',{},[step])))
      ]);
      card.appendChild(createShareBar({
        title: recipe.title,
        text: `${product.name} · ${recipe.difficulty}`,
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
      const diffSlug = (recipe.difficulty || '').toLowerCase().replace(/\s+/g,'-');
      const card = el('article',{class:'card recipe-card','id':recipe.id},[
        el('figure',{class:'recipe-figure'},[
          el('img',{src:createRecipePlaceholder(recipe.title, accent, recipe.difficulty),alt:`${recipe.title} - piatto finito`},[])
        ]),
        el('div',{class:'recipe-meta'},[
          el('span',{class:`badge difficulty difficulty-${diffSlug}`},[recipe.difficulty]),
          el('span',{class:'muted'},[categoryName])
        ]),
        el('h3',{},[recipe.title]),
        el('p',{},[recipe.intro]),
        el('p',{},[el('strong',{},['Ingredienti: ']), recipe.ingredients.join(', ')]),
        el('ol',{},recipe.steps.map(step => el('li',{},[step])))
      ]);
      card.appendChild(createShareBar({
        title: recipe.title,
        text: `${product.name} · ${recipe.difficulty}`,
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
  buildRecipeIndex(data);
  setupRecipeFilters(data);
  renderRecipeCards();
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
  applyNutriBranding();
  renderProductsGrid();
  renderProductDetail();
  renderRecipes();
  setupContactForm();
});
