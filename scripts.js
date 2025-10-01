// ---- Supabase Setup ----
const supabaseUrl = "https://bobwupsivtvjuikefmsu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYnd1cHNpdnZanVpa2VmbXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjYxNjgsImV4cCI6MjA3NDgwMjE2OH0.xI03w8WIGeVicdwN09U_ai9oK3KXijGBhQcA4wH8iZo";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ---- Data ----
let confirmedServices = [];
let specialists = ['صوفيا','نوف','هدى','فاطمة'];

// ---- Toggle functions ----
function toggleForm(){document.getElementById('reservationForm').classList.toggle('hidden');}
function toggleReservations(){loadReservationsSupabase(); document.getElementById('reservationTableDiv').classList.toggle('hidden');}
function toggleConfirmedServices(){loadConfirmedServices(); document.getElementById('confirmedServicesDiv').classList.toggle('hidden');}
function toggleSpecialists(){buildSpecialistsTables(); document.getElementById('specialistsDiv').classList.toggle('hidden');}
function toggleBeautyBlenders(){buildBBTables(); document.getElementById('bbStatsDiv').classList.toggle('hidden');}

// ---- Services ----
function addService(){
    const container=document.getElementById('servicesContainer');
    const div=document.createElement('div');
    div.className='service-group';
    div.innerHTML=`<label>الخدمة : </label><input type="text" class="serviceName">
                   <label>سعر الخدمة : </label><input type="number" class="servicePrice">`;
    container.appendChild(div);
}

// ---- Save Reservation to Supabase ----
async function saveReservationSupabase(){
    const servicesDivs=document.querySelectorAll('.service-group');
    const services=[];
    servicesDivs.forEach(div=>{
        const name=div.querySelector('.serviceName').value;
        const price=div.querySelector('.servicePrice').value;
        if(name) services.push({name, price, specialist:null, confirmed:false});
    });
    const date=document.getElementById('date').value;
    const time=document.getElementById('time').value;
    const deposit=document.getElementById('deposit').value;
    const notes=document.getElementById('notes').value;
    const bb=document.getElementById('bbCheck').checked;

    const { data, error } = await supabase.from('reservations').insert([
        { services, date, time, deposit, notes, bb }
    ]);

    if(error){alert('Erreur: '+error.message); return;}
    alert('تم حفظ الحجز!');

    // Reset form
    document.getElementById('date').value="";
    document.getElementById('time').value="";
    document.getElementById('deposit').value="";
    document.getElementById('notes').value="";
    document.getElementById('bbCheck').checked=false;
    document.getElementById('servicesContainer').innerHTML=`<div class="service-group">
        <label>الخدمة : </label><input type="text" class="serviceName">
        <label>سعر الخدمة : </label><input type="number" class="servicePrice">
    </div>`;

    loadReservationsSupabase();
}

// ---- Load Reservations ----
async function loadReservationsSupabase(){
    const container=document.getElementById('reservationMonthTables');
    container.innerHTML="";
    const { data, error } = await supabase.from('reservations').select('*').order('date', { ascending: true });
    if(error){alert(error.message); return;}
    if(!data) return;

    const months={0:"يناير",1:"فبراير",2:"مارس",3:"أبريل",4:"مايو",5:"يونيو",6:"يوليو",7:"أغسطس",8:"سبتمبر",9:"أكتوبر",10:"نوفمبر",11:"ديسمبر"};
    let monthGroups={};
    data.forEach(res=>{
        const m=new Date(res.date).getMonth();
        if(!monthGroups[m]) monthGroups[m]=[];
        monthGroups[m].push(res);
    });

    Object.keys(monthGroups).sort((a,b)=>a-b).forEach(m=>{
        const table=document.createElement('table');
        table.innerHTML=`<thead><tr>
            <th>✔️</th><th>الخدمات</th><th>التاريخ</th><th>الساعة</th><th>العربون</th><th>ملاحظات</th><th>❌</th>
        </tr></thead><tbody></tbody>`;
        const tbody=table.querySelector('tbody');
        monthGroups[m].forEach(res=>{
            const tr=document.createElement('tr');
            tr.innerHTML=`<td><input type="checkbox" ${res.services.every(s=>s.confirmed) ? "checked" : ""} onchange="confirmServiceSupabase(${res.id}, this)"></td>
                            <td>${res.services.map(s=>s.name).join(", ")}</td>
                            <td>${res.date||""}</td>
                            <td>${res.time||""}</td>
                            <td>${res.deposit||""}</td>
                            <td>${res.notes||""}</td>
                            <td><button onclick="deleteReservationSupabase(${res.id})">❌</button></td>`;
            tbody.appendChild(tr);
        });
        const title=document.createElement('h3');
        title.innerText=`${months[m]} ${new Date().getFullYear()}`;
        container.appendChild(title);
        container.appendChild(table);
    });
}

// ---- Confirm Service ----
async function confirmServiceSupabase(resId, checkbox){
    const { data: resData, error } = await supabase.from('reservations').select('*').eq('id', resId).single();
    if(error){alert(error.message); return;}
    const updatedServices = resData.services.map(s=> ({...s, confirmed: checkbox.checked}) );
    await supabase.from('reservations').update({services: updatedServices}).eq('id', resId);
    loadReservationsSupabase();
    loadConfirmedServices();
    buildSpecialistsTables();
    buildBBTables();
}

// ---- Delete Reservation ----
async function deleteReservationSupabase(resId){
    if(confirm('هل أنت متأكد من حذف الحجز؟')){
        await supabase.from('reservations').delete().eq('id', resId);
        loadReservationsSupabase();
        loadConfirmedServices();
        buildSpecialistsTables();
        buildBBTables();
    }
}

// ---- Confirmed Services ----
async function loadConfirmedServices(){
    const container=document.getElementById('confirmedMonthTables');
    container.innerHTML="";
    const { data, error } = await supabase.from('reservations').select('*').order('date', { ascending: true });
    if(error){alert(error.message); return;}

    confirmedServices = [];
    data.forEach(res=>{
        res.services.forEach(s=>{
            if(s.confirmed) confirmedServices.push({...s, date: res.date, id: res.id});
        });
    });

    // Group by month
    const months={0:"يناير",1:"فبراير",2:"مارس",3:"أبريل",4:"مايو",5:"يونيو",6:"يوليو",7:"أغسطس",8:"سبتمبر",9:"أكتوبر",10:"نوفمبر",11:"ديسمبر"};
    let monthGroups={};
    confirmedServices.forEach(s=>{
        const m=new Date(s.date).getMonth();
        if(!monthGroups[m]) monthGroups[m]=[];
        monthGroups[m].push(s);
    });

    Object.keys(monthGroups).sort((a,b)=>a-b).forEach(m=>{
        const table=document.createElement('table');
        table.innerHTML=`<thead><tr>
            <th>✏️</th><th>❌</th><th>الخدمة</th><th>سعر الخدمة</th><th>الأخصائية</th><th>التاريخ</th>
        </tr></thead><tbody></tbody>`;
        const tbody=table.querySelector('tbody');
        monthGroups[m].forEach((s, idx)=>{
            const tr=document.createElement('tr');
            tr.innerHTML=`<td><button onclick="editConfirmedSupabase(${s.id}, '${s.name}')">✏️</button></td>
                            <td><button onclick="deleteConfirmedSupabase(${s.id}, '${s.name}')">❌</button></td>
                            <td>${s.name}</td>
                            <td>${s.price||""}</td>
                            <td>
                                <select onchange="updateSpecialistSupabase(${s.id}, '${s.name}', this)">
                                    ${specialists.map(sp=>`<option value="${sp}" ${s.specialist===sp ? "selected":""}>${sp}</option>`).join('')}
                                </select>
                            </td>
                            <td>${s.date||""}</td>`;
            tbody.appendChild(tr);
        });
        const title=document.createElement('h3');
        title.innerText=`${months[m]} ${new Date().getFullYear()}`;
        container.appendChild(title);
        container.appendChild(table);
    });
}

// ---- Specialist Update ----
async function updateSpecialistSupabase(resId, serviceName, select){
    const { data, error } = await supabase.from('reservations').select('*').eq('id', resId).single();
    if(error) return;
    const updatedServices = data.services.map(s=>s.name===serviceName ? {...s, specialist: select.value} : s );
    await supabase.from('reservations').update({services: updatedServices}).eq('id', resId);
    buildSpecialistsTables();
}

// ---- Specialist Tables ----
function buildSpecialistsTables(){
    const div=document.getElementById('specialistTables');
    div.innerHTML="";
    const months={0:"يناير",1:"فبراير",2:"مارس",3:"أبريل",4:"مايو",5:"يونيو",6:"يوليو",7:"أغسطس",8:"سبتمبر",9:"أكتوبر",10:"نوفمبر",11:"ديسمبر"};
    confirmedServices.forEach((s)=>{
        // nothing extra needed, just build per specialist
    });

    specialists.forEach((spec)=>{
        const table=document.createElement('table');
        table.className=`specialist-table`;
        table.innerHTML=`<thead><tr><th>${spec} <button onclick="removeSpecialistSupabase('${spec}')">❌</button></th><th>الخدمة</th><th>الثمن</th><th>التاريخ</th></tr></thead><tbody></tbody>`;
        const tbody=table.querySelector('tbody');
        let total=0;
        confirmedServices.forEach(s=>{
            if(s.specialist===spec){
                const tr=document.createElement('tr');
                tr.innerHTML=`<td>${s.name}</td><td>${s.price||0}</td><td>${s.date}</td>`;
                tbody.appendChild(tr);
                total+=Number(s.price||0);
            }
        });
        const totalRow=document.createElement('tr');
        totalRow.innerHTML=`<td>المجموع</td><td>${total}</td><td></td>`;
        tbody.appendChild(totalRow);
        div.appendChild(table);
    });
}

// ---- Add / Remove Specialist ----
function addSpecialist(){
    const name=prompt("اسم الأخصائية الجديدة");
    if(name){
        specialists.push(name);
        buildSpecialistsTables();
    }
}
function removeSpecialistSupabase(name){
    if(confirm("هل تريد حذف هذا الجدول؟")){
        specialists=specialists.filter(sp=>sp!==name);
        buildSpecialistsTables();
    }
}

// ---- BeautyBlender Stats ----
async function buildBBTables(){
    const div=document.getElementById('bbMonthTables');
    div.innerHTML="";
    const { data, error } = await supabase.from('reservations').select('*').order('date', { ascending: true });
    if(error) return;
    const months={0:"يناير",1:"فبراير",2:"مارس",3:"أبريل",4:"مايو",5:"يونيو",6:"يوليو",7:"أغسطس",8:"سبتمبر",9:"أكتوبر",10:"نوفمبر",11:"ديسمبر"};
    let monthGroups={};
    data.filter(r=>r.bb).forEach(r=>{
        const m=new Date(r.date).getMonth();
        if(!monthGroups[m]) monthGroups[m]=[];
        monthGroups[m].push(r);
    });

    Object.keys(monthGroups).sort((a,b)=>a-b).forEach(m=>{
        const table=document.createElement('table');
        table.innerHTML=`<thead><tr><th>الثمن</th><th>عدد البيوتي بليندر</th><th>المجموع</th></tr></thead><tbody></tbody>`;
        const tbody=table.querySelector('tbody');
        const count=monthGroups[m].length;
        const price=5;
        const total=count*price;
        tbody.innerHTML=`<tr><td>${price}</td><td>${count}</td><td>${total}</td></tr>`;
        const title=document.createElement('h3');
        title.innerText=`${months[m]} ${new Date().getFullYear()}`;
        div.appendChild(title);
        div.appendChild(table);
    });
}
