const listings=[
 {title:'Solana Frontend Developer',desc:'Frontend builder wanted for a lightweight Solana product.',category:'work',price:'12 SOL',location:'Remote',age:'18m',flags:['new','sol','remote']},
 {title:'Brand Identity for Solana Projects',desc:'Logo systems, visual direction and launch assets.',category:'services',price:'SOL / USDC',location:'Remote',age:'42m',flags:['new','sol','remote']},
 {title:'Upcycled Utility Vest',desc:'One-of-one reconstructed garment from an independent maker.',category:'shop',price:'2.5 SOL',location:'Portland, OR',age:'1h',flags:['new','sol','near']},
 {title:'2013 Honda Fit',desc:'Clean compact hatchback. Seller accepts crypto settlement.',category:'autos',price:'4,900 USDC',location:'Vancouver, WA',age:'3h',flags:['sol','near']},
 {title:'Indie Game Playtesters',desc:'Early community playtest for a Solana-connected game.',category:'games',price:'PAID',location:'Remote',age:'5h',flags:['remote']},
 {title:'Digital Asset Pack',desc:'Minimal interface icons and geometric UI elements.',category:'online',price:'0.4 SOL',location:'Online',age:'7h',flags:['sol','remote']},
 {title:'Community Moderator',desc:'Part-time moderator for a growing ecosystem community.',category:'work',price:'USDC',location:'Remote',age:'9h',flags:['remote']},
 {title:'Product Photography',desc:'Small-brand product shoots and social-ready edits.',category:'services',price:'1.2 SOL',location:'Portland, OR',age:'12h',flags:['sol','near']}
];
let activeCategory='all', activeFilter=null, expanded=false;
const grid=document.querySelector('#listingGrid'), empty=document.querySelector('#emptyState'), input=document.querySelector('#searchInput');
function render(){
 const q=input.value.trim().toLowerCase();
 let results=listings.filter(x=>(activeCategory==='all'||x.category===activeCategory)&&(!activeFilter||x.flags.includes(activeFilter))&&(!q||`${x.title} ${x.desc} ${x.location} ${x.category}`.toLowerCase().includes(q)));
 if(!expanded) results=results.slice(0,6);
 grid.innerHTML=results.map(x=>`<article class="listing"><div class="listing-main"><div class="listing-top"><span class="tag">${x.category.toUpperCase()}</span><span class="age">${x.age} AGO</span></div><h3>${x.title}</h3><p>${x.desc}</p></div><div class="listing-meta"><span class="price">${x.price}</span><span class="location">${x.location}</span></div></article>`).join('');
 empty.hidden=results.length>0;
}
document.querySelectorAll('.category').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.category').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeCategory=btn.dataset.category;activeFilter=null;render();document.querySelector('#listingsSection').scrollIntoView({behavior:'smooth'});}));
document.querySelectorAll('.quick-filters button').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=activeFilter===btn.dataset.filter?null:btn.dataset.filter;render();document.querySelector('#listingsSection').scrollIntoView({behavior:'smooth'});}));
document.querySelector('#searchForm').addEventListener('submit',e=>{e.preventDefault();render();document.querySelector('#listingsSection').scrollIntoView({behavior:'smooth'});});
input.addEventListener('input',render);
document.querySelector('#viewAll').addEventListener('click',e=>{expanded=!expanded;e.currentTarget.textContent=expanded?'SHOW LESS ↑':'VIEW ALL LISTINGS →';render();});
document.querySelector('#postButton').addEventListener('click',()=>{document.querySelector('#postMessage').hidden=false;});
render();
