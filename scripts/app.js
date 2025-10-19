
async function loadJSON(path){ const r = await fetch(path); return r.json(); }
function el(tag, attrs={}, children=[]){ const e=document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') e.className=v; else if(k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k,v); });
  children.forEach(c=> e.appendChild(typeof c==='string'? document.createTextNode(c): c)); return e; }
async function renderProductsGrid(){
  const grid=document.getElementById('productsGrid'); const data=await loadJSON('data/products.json');
  data.categories.forEach(cat=>{
    const items = cat.items.map(it=> el('div',{},['• ', it]));
    grid.appendChild(el('div',{class:'card'},[ el('h3',{},[cat.name]), el('p',{},[cat.description||'']), el('div',{},items) ]));
  });
}
async function renderRecipes(){
  const list=document.getElementById('recipesList'); const data=await loadJSON('data/recipes.json');
  data.forEach(r=>{
    list.appendChild(el('div',{class:'card'},[
      el('h3',{},[r.product+' — '+r.title]),
      el('p',{},[r.intro]),
      el('p',{},[el('strong',{},['Ingredienti: ']), r.ingredients.join(', ')]),
      el('p',{},[el('strong',{},['Procedimento: ']), r.steps.join(' › ')]) ]));
  });
}