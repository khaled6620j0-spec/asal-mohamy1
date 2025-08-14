// script.js - site logic (local storage + form handling)
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const store = {
  questions: JSON.parse(localStorage.getItem('asklaw-questions')||'[]'),
  lawyers: JSON.parse(localStorage.getItem('asklaw-lawyers')||'[]'),
  articles: [
    {title:'ما الذي تحتاج معرفته عن قضايا النفقة؟', excerpt:'دليل مبسّط لخطوات رفع دعوى النفقة والمستندات المطلوبة.', tag:'أحوال شخصية'},
    {title:'نصائح قبل توقيع أي عقد مدني', excerpt:'خطوات فحص العقد والتأكد من البنود الجوهرية لتفادي النزاعات.', tag:'مدني وعقود'},
    {title:'حقوق العامل عند الفصل التعسفي', excerpt:'ما يثبته القانون من تعويضات وإجراءات الشكوى.', tag:'عمل وتأمينات'},
    {title:'أساسيات تأسيس شركة ذات مسؤولية محدودة', excerpt:'وثائق التأسيس والضرائب والحوكمة المبسطة.', tag:'شركات'},
    {title:'جرائم الإنترنت والدليل الرقمي', excerpt:'متى يصبح الفعل جريمة إلكترونية وكيفية الإبلاغ.', tag:'جنائي'},
    {title:'نصائح قانونية في شراء العقارات', excerpt:'التحقق من الملكية، الرهن، والمرافق قبل الشراء.', tag:'عقارات'},
  ]
};

const save = () => {
  localStorage.setItem('asklaw-questions', JSON.stringify(store.questions));
  localStorage.setItem('asklaw-lawyers', JSON.stringify(store.lawyers));
};

// Routing
const sections = $$('#home, #ask, #questions, #lawyers, #articles, #contact, #login');

function showSection(id){
  sections.forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id) || $('#home');
  el.classList.add('active');
  // update active link
  $$('a[data-link]').forEach(a=>a.classList?.remove?.('active'));
  $$('a[data-link]').forEach(a=>{
    if(a.getAttribute('href') === `#${id}`) a.classList.add('active');
  });
  const firstInput = el.querySelector('input, textarea, select, button');
  if(firstInput) firstInput.focus({preventScroll:true});
}

function handleHash(){
  const id = location.hash.replace('#','') || 'home';
  showSection(id);
}
window.addEventListener('hashchange', handleHash);

// Renderers
function renderQuestions(){
  const list = $('#questionsList');
  const term = $('#searchBox').value.trim();
  const cat = $('#filterCat').value;
  const filtered = store.questions.filter(q=>
    (!cat || q.category===cat) && (!term || q.title.includes(term))
  ).sort((a,b)=>b.createdAt - a.createdAt);

  list.innerHTML = filtered.length ? '' : `<div class="card">لا توجد أسئلة بعد. كُن أول من يطرح سؤالًا.</div>`;
  filtered.forEach(q=>{
    const answers = q.answers || [];
    const answered = answers.length>0;
    const item = document.createElement('div');
    item.className='item';
    item.innerHTML = `
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px">
        <div>
          <h3 style="margin:0 0 6px">${q.title}</h3>
          <div class="meta">
            <span class="pill">${q.category}</span>
            <span class="pill">${q.priority}</span>
            <span class="pill">${new Date(q.createdAt).toLocaleString('ar-EG')}</span>
            ${answered?`<span class="pill" style="background:rgba(34,197,94,.18); color:#86efac">تم الرد</span>`:''}
          </div>
        </div>
        <button class="btn secondary" onclick="alert('هذه النسخة للعرض فقط — أضف نظام الردود لاحقًا في الخادم.')">عرض</button>
      </div>
      <p class="muted" style="margin:6px 0 0">${q.content}</p>
    `;
    list.appendChild(item);
  })
}

function renderLawyers(){
  const list = $('#lawyersList');
  list.innerHTML = store.lawyers.length? '' : `<div class="card">لا توجد طلبات بعد.</div>`;
  store.lawyers.slice().reverse().forEach(l=>{
    const item = document.createElement('div');
    item.className='item';
    item.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap">
        <div>
          <h3 style="margin:0">${l.name} — <span class="muted">${l.category}</span></h3>
          <div class="meta">
            <span class="pill">خبرة: ${l.experience} سنة</span>
            <span class="pill">${l.email}</span>
            <span class="pill">${new Date(l.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
        <div style="display:flex; gap:8px">
          <button class="btn" onclick="alert('للمعاينة فقط — وافِق في لوحة المشرف لاحقًا')">موافقة</button>
          <button class="btn secondary" onclick="this.closest('.item').remove()">حذف</button>
        </div>
      </div>
      <p class="muted" style="margin:6px 0 0">${l.bio || ''}</p>
    `;
    list.appendChild(item);
  })
}

function renderArticles(){
  const grid = $('#articlesGrid');
  grid.innerHTML = '';
  store.articles.forEach(a=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `
      <span class="pill">${a.tag}</span>
      <h3>${a.title}</h3>
      <p class="muted">${a.excerpt}</p>
      <button class="btn secondary" onclick="alert('أضف صفحة مقالة لاحقًا')">اقرأ المزيد</button>
    `;
    grid.appendChild(card);
  })
}

// Form handlers
$('#quickAskForm').addEventListener('submit', e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const content = fd.get('content').trim();
  const category = fd.get('category');
  if(!content){return}
  const q = { id:crypto.randomUUID(), title: content.slice(0, 40)+(content.length>40?'…':''), content, category, priority:'عادي', createdAt: Date.now(), answers:[] };
  store.questions.push(q); save();
  e.target.reset();
  location.hash = '#questions';
  renderQuestions();
});

$('#askForm').addEventListener('submit', e=>{
  // form also submits to FormSubmit because of action attribute
  const fd = new FormData(e.target);
  const q = {
    id: crypto.randomUUID(),
    name: fd.get('name')?.trim() || 'مجهول',
    email: fd.get('email')?.trim() || '',
    category: fd.get('category'),
    priority: fd.get('priority'),
    title: fd.get('title').trim(),
    content: fd.get('content').trim(),
    createdAt: Date.now(),
    answers: []
  };
  if(!q.title || !q.content){ e.preventDefault(); return alert('من فضلك أكمل البيانات المطلوبة'); }
  // push locally so user sees it immediately; allow normal form submit to proceed to FormSubmit
  store.questions.push(q); save();
  // don't preventDefault -> allows FormSubmit to send email
  setTimeout(()=>{ location.hash = '#questions'; renderQuestions(); }, 500);
});

$('#lawyerForm').addEventListener('submit', e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const l = {
    id: crypto.randomUUID(),
    name: fd.get('name').trim(),
    email: fd.get('email').trim(),
    category: fd.get('category'),
    experience: +fd.get('experience') || 0,
    bio: fd.get('bio').trim(),
    createdAt: Date.now()
  };
  if(!l.name || !l.email){return alert('الاسم والبريد مطلوبة')}
  store.lawyers.push(l); save();
  e.target.reset();
  renderLawyers();
  alert('تم استلام طلبك، سنقوم بالمراجعة والرد عبر البريد.');
});

$('#contactForm').addEventListener('submit', e=>{
  // this form submits to FormSubmit via action attribute; also show a friendly message
  setTimeout(()=>{ alert('شكرًا لتواصلك! (نموذج تجريبي)'); }, 400);
});

$('#filterCat').addEventListener('change', renderQuestions);
$('#searchBox').addEventListener('input', renderQuestions);

// Init / seed
function seed(){
  if(store.questions.length===0){
    store.questions.push(
      {id:crypto.randomUUID(), title:'إجراءات رفع دعوى نفقة؟', content:'ما هي المستندات وخطوات رفع دعوى نفقة؟', category:'أحوال شخصية', priority:'عادي', createdAt: Date.now()-3600_000*20, answers:[]},
      {id:crypto.randomUUID(), title:'فسخ عقد إيجار قديم', content:'هل يمكن للمالك فسخ عقد إيجار قديم؟', category:'عقارات', priority:'عاجل', createdAt: Date.now()-3600_000*48, answers:[{by:'أ. محمد', text:'يُنظر لشروط العقد والقانون 136 لسنة 1981…'}]},
      {id:crypto.randomUUID(), title:'تأسيس شركة ذات مسؤولية محدودة', content:'ما الحد الأدنى لرأس المال والإجراءات؟', category:'شركات', priority:'عادي', createdAt: Date.now()-3600_000*72, answers:[]}
    );
  }
  save();
}

function start(){
  document.getElementById('year').textContent = new Date().getFullYear();
  seed();
  handleHash();
  renderQuestions();
  renderLawyers();
  renderArticles();
}

start();
