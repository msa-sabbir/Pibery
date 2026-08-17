const tokenKey='pibery_token';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function api(url,options={}){const res=await fetch('/api'+url,{...options,headers:{'Content-Type':'application/json',...(localStorage.getItem(tokenKey)?{Authorization:`Bearer ${localStorage.getItem(tokenKey)}`}:{})}});let data={};try{data=await res.json()}catch{}if(!res.ok)throw Error(data.message||'Request failed');return data}
function date(v){return v?new Date(v).toLocaleString():'—'}
function money(v){return '৳'+Number(v||0).toLocaleString()}

function showApp(user){$('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');$('#ownerName').textContent=user?.name||'Owner';loadOverview()}
async function checkAuth(){try{const r=await api('/auth/me');if(r.user.role!=='owner')throw Error('এই অ্যাকাউন্ট Owner নয়');showApp(r.user)}catch{localStorage.removeItem(tokenKey);$('#loginView').classList.remove('hidden')}}

$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();$('#loginError').textContent='';try{const r=await api('/auth/login',{method:'POST',body:JSON.stringify({email:$('#loginEmail').value,password:$('#loginPassword').value})});if(r.user.role!=='owner')throw Error('শুধু Owner অ্যাকাউন্ট দিয়ে এই প্যানেলে প্রবেশ করা যাবে');localStorage.setItem(tokenKey,r.token);showApp(r.user)}catch(err){$('#loginError').textContent=err.message}});
$('#logoutBtn').onclick=async()=>{try{await api('/auth/logout')}catch{}localStorage.removeItem(tokenKey);location.reload()};

document.querySelectorAll('.sidebar nav a').forEach(a=>a.onclick=()=>{
  document.querySelectorAll('.sidebar nav a').forEach(x=>x.classList.remove('active'));
  a.classList.add('active');
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const tab = a.dataset.tab;
  $('#tab-'+tab).classList.add('active');
  $('#pageTitle').textContent=a.textContent.trim();
  if(tab==='shops') loadShops();
  if(tab==='users') loadUsers();
  if(tab==='orders') loadOrders();
  if(tab==='plans') loadPlans();
  if(tab==='payouts') loadPayouts();
  if(tab==='announcements') loadAnnouncements();
  if(tab==='settings') loadSettings();
});

async function loadOverview(){try{const r=await api('/owner/overview');const s=r.stats;const items=[['Revenue',money(s.revenue)],['Orders',s.totalOrders],['Shops',s.totalShops],['Merchants',s.merchants],['Payouts',s.pendingPayouts],['Active Plans',s.activePlans]];$('#stats').innerHTML=items.map(x=>`<div class="stat"><div class="value">${esc(x[1])}</div><div class="label">${esc(x[0])}</div></div>`).join('');$('#recentOrders').innerHTML=r.recentOrders.map(o=>`<div class="row"><div><b>#${esc(String(o._id).slice(-8))}</b><div class="muted">${esc(o.shop?.name||'—')}</div></div><strong>${money(o.total)}</strong></div>`).join('')||'<div class="muted">No orders</div>';$('#topShops').innerHTML=r.topShops.map(s=>`<div class="row"><div><b>${esc(s.name)}</b><div class="muted">${s.orders} sales</div></div><strong>${money(s.revenue)}</strong></div>`).join('')||'<div class="muted">No sales</div>'}catch(e){alert(e.message)}}

async function loadShops(){try{const r=await api('/owner/shops');$('#shopsBody').innerHTML=r.shops.map(s=>`<tr><td><b>${esc(s.name)}</b><div class="muted">${esc(s.subdomain)}</div></td><td>${esc(s.owner?.name)}</td><td>${esc(s.plan?.name||'Free')}</td><td>${s.isActive?'Active':'Suspended'}</td><td><button onclick="toggleShop('${s._id}')">Toggle</button></td></tr>`).join('')}catch(e){alert(e.message)}}
window.toggleShop=async id=>{await api('/owner/shops/'+id+'/toggle-active',{method:'PATCH'});loadShops()};

async function loadUsers(){try{const r=await api('/owner/users');$('#usersBody').innerHTML=r.users.map(u=>`<tr><td><b>${esc(u.name)}</b><div class="muted">${esc(u.email)}</div></td><td>${esc(u.role)}</td><td>${u.isActive?'Active':'Inactive'}</td><td><button onclick="toggleUser('${u._id}')">Toggle</button></td></tr>`).join('')}catch(e){alert(e.message)}}
window.toggleUser=async id=>{await api('/owner/users/'+id+'/toggle-active',{method:'PATCH'});loadUsers()};

async function loadOrders(){try{const r=await api('/owner/orders');$('#ordersBody').innerHTML=r.orders.map(o=>`<tr><td>#${esc(String(o._id).slice(-8))}</td><td>${esc(o.shop?.name)}</td><td>${money(o.total)}</td><td>${esc(o.status)}</td></tr>`).join('')}catch(e){alert(e.message)}}

async function loadPlans(){try{const r=await api('/owner/plans');$('#plansBody').innerHTML=r.plans.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${money(p.price)}</td><td>${esc(p.billingCycle)}</td><td>${p.features.productLimit}</td><td><button onclick="editPlan('${p._id}')">Edit</button></td></tr>`).join('')}catch(e){alert(e.message)}}
window.showPlanModal=()=>{const name=prompt('Plan Name:');const price=prompt('Price:');if(name&&price)api('/owner/plans',{method:'POST',body:JSON.stringify({name,price:Number(price)})}).then(loadPlans)};

async function loadPayouts(){try{const r=await api('/owner/payouts');$('#payoutsBody').innerHTML=r.payouts.map(p=>`<tr><td>${esc(p.shop?.name)}</td><td>${esc(p.merchant?.name)}</td><td>${money(p.amount)}</td><td>${esc(p.method)}</td><td>${esc(p.status)}</td><td><button onclick="completePayout('${p._id}')">Complete</button></td></tr>`).join('')}catch(e){alert(e.message)}}
window.completePayout=async id=>{if(confirm('Mark as completed?'))await api('/owner/payouts/'+id,{method:'PATCH',body:JSON.stringify({status:'completed'})});loadPayouts()};

async function loadAnnouncements(){try{const r=await api('/owner/announcements');$('#announcementsBody').innerHTML=r.announcements.map(a=>`<tr><td>${esc(a.title)}</td><td>${esc(a.type)}</td><td>${date(a.createdAt)}</td><td>${a.isActive?'Active':'Inactive'}</td><td><button onclick="deleteAnn('${a._id}')">Delete</button></td></tr>`).join('')}catch(e){alert(e.message)}}
window.showAnnouncementModal=()=>{const title=prompt('Title:');const message=prompt('Message:');if(title&&message)api('/owner/announcements',{method:'POST',body:JSON.stringify({title,message})}).then(loadAnnouncements)};
window.deleteAnn=async id=>{await api('/owner/announcements/'+id,{method:'DELETE'});loadAnnouncements()};

async function loadSettings(){try{const r=await api('/owner/settings');const s=r.settings;$('#setPlatformName').value=s.platformName||'';$('#setPlatformEmail').value=s.platformEmail||'';$('#setCommissionRate').value=s.commissionRate||0;$('#setMaintenanceMode').checked=s.maintenanceMode||false}catch(e){alert(e.message)}}
$('#settingsForm').onsubmit=async e=>{e.preventDefault();const body={platformName:$('#setPlatformName').value,platformEmail:$('#setPlatformEmail').value,commissionRate:Number($('#setCommissionRate').value),maintenanceMode:$('#setMaintenanceMode').checked};try{await api('/owner/settings',{method:'PATCH',body:JSON.stringify(body)});alert('সেটিংস সফলভাবে আপডেট হয়েছে')}catch(e){alert(e.message)}};

checkAuth();
