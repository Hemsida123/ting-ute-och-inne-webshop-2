/* TING UTE & INNE (v4) — demo-logik för designskalet.
   I Shopify ersätts varukorgen av /cart.js och sektionernas egna inställningar. */
document.documentElement.classList.add('js');
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const kr=n=>n.toLocaleString('sv-SE').replace(/ /g,' ')+' kr';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

const CDN='https://cdn.abicart.com/shop/',Q='?max-width=400&max-height=400&quality=82&resize=crop';
const PRODUCTS={
 'vagglykta':{name:'Tings vägglykta, svart',img:CDN+'images/225385450-origpic-44dc0f/12421/art21/h5450/IMG_3322.jpg'+Q,price:695},
 'vagglykta-g':{name:'Tings vägglykta, galvad',img:CDN+'images/225385488-origpic-f83587/12421/art21/h5488/IMG_3335.jpg'+Q,price:595},
 'vagglykta-s':{name:'Tings vägglykta liten, svart',img:CDN+'12421/art21/h7263/174337263-origpic-71908d.jpg'+Q,price:495},
 'vattenspel':{name:'Vattenspel i lavasten, liten',img:CDN+'images/209771593-origpic-aee41b/12421/art21/h1593/vattenspel.jpg'+Q,price:1195},
 'vattenspel-m':{name:'Vattenspel i lavasten, mellan',img:CDN+'images/220727109-origpic-13bb35/12421/art21/h7109/Vattenspel-mellan.jpg'+Q,price:1445},
 'silverklot':{name:'Silverklot',img:CDN+'12421/art21/h9180/157309180-origpic-a474b7.jpg'+Q,price:95},
 'vaggkruka':{name:'Väggkruka i lättbetong',img:CDN+'12421/art21/h0069/175430069-origpic-269f5d.jpg'+Q,price:895},
 'fagelbad':{name:'Fågelbad i komposit, ø60',img:CDN+'images/49554417-origpic-3f40ea/12421/art21/h4417/Vattenbad.gif'+Q,price:1395},
 'pumpa':{name:'Pumpa i betong, svart',img:CDN+'images/221946453-origpic-436570/12421/art21/h6453/Pumpa1-1.jpg'+Q,price:195},
 'ljusklot':{name:'Ljusklot LED',img:CDN+'images/185572733-origpic-08534f/12421/art21/h2733/Ljusglob.gif'+Q,price:545},
 'lykta-dk':{name:'Lykta i dansk design, svart',img:CDN+'images/17524204-origpic-22aab7/12421/art21/h4204/Lykta-A2.gif'+Q,price:695},
 'ljusstake':{name:'Ljusstake för ute & inne',img:CDN+'12421/art21/h7615/215797615-origpic-43d7d0.jpg'+Q,price:1995}
};
const FREE=1500; // Exempelgräns för fri frakt — stäm av med kunden

/* ---------- Varukorg ---------- */
let cart=[];
try{cart=JSON.parse(localStorage.getItem('ting-cart')||'[]')}catch(e){cart=[]}
const save=()=>{try{localStorage.setItem('ting-cart',JSON.stringify(cart))}catch(e){}};
function addToCart(id,opts={}){
 const p=PRODUCTS[id];if(!p)return;
 const key=id+'|'+(opts.variant||'');
 const line=cart.find(l=>l.key===key);
 const qty=opts.qty||1;
 if(line)line.qty+=qty;else cart.push({key,id,qty,variant:opts.variant||'',price:opts.price||p.price,name:opts.name||p.name,img:opts.img||p.img});
 save();renderCart();bump();toast(`<b>Lagd i varukorgen</b> ${opts.name||p.name}`);
}
function bump(){$$('.cart-count').forEach(c=>{c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')})}
function renderCart(){
 const count=cart.reduce((a,l)=>a+l.qty,0);
 const total=cart.reduce((a,l)=>a+l.qty*l.price,0);
 $$('.cart-count').forEach(c=>{c.textContent=count;c.hidden=count===0});
 const lines=$('#lines');if(!lines)return;
 lines.replaceChildren();
 if(!cart.length){lines.innerHTML='<p class="empty">Varukorgen är tom.<br>Hitta något fint att ta med hem.</p>'}
 cart.forEach((l,i)=>{
  const el=document.createElement('div');el.className='line';
  el.innerHTML=`<img src="${l.img}" alt=""><div><b>${l.name}</b><span>${l.variant||'&nbsp;'}</span><div class="qty"><button type="button" aria-label="Minska antal">−</button><output>${l.qty}</output><button type="button" aria-label="Öka antal">+</button></div></div><div class="lp">${kr(l.price*l.qty)}<br><button type="button" class="rm">Ta bort</button></div>`;
  const [minus,plus]=$$('.qty button',el);
  minus.onclick=()=>{l.qty--;if(l.qty<1)cart.splice(i,1);save();renderCart()};
  plus.onclick=()=>{l.qty++;save();renderCart()};
  $('.rm',el).onclick=()=>{cart.splice(i,1);save();renderCart()};
  lines.append(el);
 });
 $('#sum').textContent=kr(total);
 const left=FREE-total;
 $('#ship-text').innerHTML=total===0?`Fri frakt när du handlar för ${kr(FREE)}`:left>0?`<b>${kr(left)}</b> kvar till fri frakt`:'<b>Du har fri frakt!</b>';
 $('#ship-bar').style.width=Math.min(100,total/FREE*100)+'%';
 $('#checkout').disabled=!cart.length;
}
const drawer=$('#drawer'),scrim=$('#scrim');
function openCart(){drawer.hidden=false;scrim.hidden=false;document.body.classList.add('lock');$('#drawer .icon-btn').focus()}
function closeCart(){drawer.hidden=true;scrim.hidden=true;document.body.classList.remove('lock')}
$$('[data-open-cart]').forEach(b=>b.addEventListener('click',openCart));
$$('[data-close-cart]').forEach(b=>b.addEventListener('click',closeCart));
scrim?.addEventListener('click',()=>{closeCart();closeMnav()});

/* ---------- Notis ---------- */
let tt;
function toast(html){
 const t=$('#toast');if(!t)return;
 t.innerHTML=html+' <button type="button" class="ul" data-open-cart style="color:#fff;font-size:.82rem">Visa</button>';
 $('[data-open-cart]',t).onclick=()=>{t.classList.remove('show');openCart()};
 t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),3200);
}

/* ---------- Snabbköp & önskelista ---------- */
$$('[data-add]').forEach(b=>b.addEventListener('click',e=>{
 e.preventDefault();addToCart(b.dataset.add);
 if(b.classList.contains('quick')){const o=b.innerHTML;b.classList.add('done');b.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';setTimeout(()=>{b.classList.remove('done');b.innerHTML=o},1600)}
}));

/* ---------- Header ---------- */
const header=$('.header');let lastY=scrollY;
addEventListener('scroll',()=>{
 const y=scrollY;
 if(y>lastY+6&&y>400&&!$('.mega:not([hidden]),.search:not([hidden])'))header.classList.add('is-hidden');
 if(y<lastY-6)header.classList.remove('is-hidden');
 lastY=y;
},{passive:true});

/* Megameny & sök */
const megaBtn=$('[data-mega]'),mega=$('#mega'),searchBtn=$('[data-search]'),search=$('#search');
let megaT;
function setMega(o){if(!mega)return;megaBtn.setAttribute('aria-expanded',o);mega.hidden=!o;if(o)setSearch(false)}
function setSearch(o){if(!search)return;searchBtn.setAttribute('aria-expanded',o);search.hidden=!o;if(o){setMega(false);setTimeout(()=>$('#q').focus(),50)}}
if(megaBtn){
 megaBtn.addEventListener('click',()=>setMega(megaBtn.getAttribute('aria-expanded')!=='true'));
 megaBtn.addEventListener('mouseenter',()=>{clearTimeout(megaT);setMega(true)});
 header.addEventListener('mouseleave',()=>{megaT=setTimeout(()=>setMega(false),180)});
 header.addEventListener('mouseenter',()=>clearTimeout(megaT));
 $$('.nav a').forEach(a=>a.addEventListener('mouseenter',()=>setMega(false)));
}
searchBtn?.addEventListener('click',()=>setSearch(searchBtn.getAttribute('aria-expanded')!=='true'));

/* Färgval på produktkort */
$$('.sw').forEach(g=>$$('button',g).forEach(b=>{
 const go=()=>{$$('button',g).forEach(x=>x.setAttribute('aria-pressed',x===b));const img=$('.card-media img',g.closest('.card'));img.src=b.dataset.swap};
 b.addEventListener('click',e=>{e.preventDefault();go()});b.addEventListener('mouseenter',go);
}));

/* Mobilmeny */
const mnav=$('#mnav');
function closeMnav(){if(mnav){mnav.hidden=true;document.body.classList.remove('lock')}}
$('.burger')?.addEventListener('click',()=>{mnav.hidden=false;document.body.classList.add('lock');$('#mnav .icon-btn').focus()});
$$('[data-close-mnav]').forEach(b=>b.addEventListener('click',closeMnav));
addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeMnav();setMega(false);setSearch(false)}});

/* ---------- Nyhetsbrev ---------- */
$('#news')?.addEventListener('submit',e=>{e.preventDefault();$('#news-ok').hidden=false;e.target.reset()});

/* ---------- Avslöjanden & parallax ---------- */
if('IntersectionObserver' in window&&!reduce){
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{rootMargin:'0px 0px -8% 0px'});
 $$('.rv').forEach(el=>io.observe(el));
}else $$('.rv').forEach(el=>el.classList.add('in'));
const par=$$('[data-par]');
if(par.length&&!reduce){
 const run=()=>{const vh=innerHeight;par.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const p=(r.top+r.height/2-vh/2)/vh;el.style.transform=`translate3d(0,${-p*12}%,0) scale(1.18)`})};
 addEventListener('scroll',run,{passive:true});run();
}

/* ==========================================================
   PRODUKTSIDA
   ========================================================== */
const pdp=$('#pdp');
if(pdp){
 /* Galleri */
 const slides=$$('.stage [data-slide]'),thumbs=$$('.thumb');let cur=0;
 const stage=$('.stage');
 function show(i){
  cur=(i+slides.length)%slides.length;
  slides.forEach((s,j)=>s.classList.toggle('on',j===cur));
  thumbs.forEach((t,j)=>t.setAttribute('aria-current',j===cur));
  $('#stage-count').textContent=`${cur+1} / ${slides.length}`;
  stage.classList.remove('zoom');
 }
 thumbs.forEach((t,j)=>t.addEventListener('click',()=>show(j)));
 $('.stage-prev').onclick=e=>{e.stopPropagation();show(cur-1)};
 $('.stage-next').onclick=e=>{e.stopPropagation();show(cur+1)};
 stage.addEventListener('click',()=>{if(slides[cur].tagName==='IMG')stage.classList.toggle('zoom')});
 stage.addEventListener('mousemove',e=>{if(!stage.classList.contains('zoom'))return;const r=stage.getBoundingClientRect();slides[cur].style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`});
 let sx=null;stage.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
 stage.addEventListener('touchend',e=>{if(sx===null)return;const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)show(cur+(d<0?1:-1));sx=null});
 show(0);

 /* Varianter (priser från nuvarande webbshop) */
 const BASE={svart:695,vit:695,galvad:595};
 const ADD={glas:0,kruka:210,ljuskruka:330};
 const NAMES={glas:'Lykta med glas',kruka:'Lykta med kruka i keramik',ljuskruka:'Lykta med ljuskruka i keramik'};
 let color='svart',variant='glas',qty=1;
 const price=()=>BASE[color]+ADD[variant];
 function update(){
  $$('[data-color]').forEach(b=>b.setAttribute('aria-checked',b.dataset.color===color));
  $$('[data-variant]').forEach(b=>{b.setAttribute('aria-checked',b.dataset.variant===variant);$('.vp',b).textContent=kr(BASE[color]+ADD[b.dataset.variant])});
  $('#color-name').textContent=color[0].toUpperCase()+color.slice(1);
  $('#variant-name').textContent=NAMES[variant];
  $$('[data-price]').forEach(p=>p.textContent=kr(price()));
  $('#klarna-month').textContent=kr(Math.ceil(price()/3));
  $('#qty').textContent=qty;
 }
 $$('[data-color]').forEach(b=>b.addEventListener('click',()=>{color=b.dataset.color;const k=slides.findIndex(s=>s.dataset.key===color);if(k>-1)show(k);const si=$('#sticky-img'),im=slides[k];if(si&&im)si.src=im.src;update()}));
 $$('[data-variant]').forEach(b=>b.addEventListener('click',()=>{variant=b.dataset.variant;update()}));
 $('#qminus').onclick=()=>{qty=Math.max(1,qty-1);update()};
 $('#qplus').onclick=()=>{qty++;update()};
 const buy=()=>addToCart(color==='galvad'?'vagglykta-g':'vagglykta',{variant:`${color[0].toUpperCase()+color.slice(1)} · ${NAMES[variant]}`,price:price(),qty});
 $$('[data-buy]').forEach(b=>b.addEventListener('click',buy));
 update();

 /* Fast köprad när huvudknappen försvinner */
 const sticky=$('.sticky-buy'),main=$('#buy-main');
 if('IntersectionObserver' in window)new IntersectionObserver(([e])=>sticky.classList.toggle('show',!e.isIntersecting&&e.boundingClientRect.top<0)).observe(main);
}

/* ---------- Kategorisida: filter & sortering ---------- */
const plp=$('#plp-grid');
if(plp){
 const cards=$$('.card',plp);const count=$('#count');
 const apply=()=>{const n=cards.filter(c=>!c.classList.contains('out')).length;count.textContent=`${n} produkter`};
 $$('.filter').forEach(f=>f.addEventListener('click',()=>{
  $$('.filter').forEach(x=>x.setAttribute('aria-pressed',x===f));
  const v=f.dataset.filter;cards.forEach(c=>c.classList.toggle('out',v!=='alla'&&!c.dataset.tags.includes(v)));apply();
 }));
 $('#sort').addEventListener('change',e=>{
  const v=e.target.value;const sorted=[...cards].sort((a,b)=>v==='low'?a.dataset.price-b.dataset.price:v==='high'?b.dataset.price-a.dataset.price:a.dataset.order-b.dataset.order);
  sorted.forEach(c=>plp.append(c));
 });
 apply();
}

renderCart();
