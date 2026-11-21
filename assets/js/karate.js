/* karate.js — نادي الكاراتيه: أنيميشن وتفاعل
   - يولّد بطاقات الحركات بأنيميشن SVG
   - يولّد نظام الأحزمة
   - يولّد معرض اللاعبين
   - يدير Lightbox للصور
   - يدير Reveal عند التمرير والتنقل النشط
*/

(function () {
  'use strict';

  /* ============ بيانات الحركات (مع أنيميشن SVG) ============ */
  // كل حركة لها: اسم عربي، اسم ياباني، وصف، تاج، ودالة SVG ترسم الحركة بالأنيميشن
  const MOVES = [
    {
      id: 'oi-zuki',
      name: 'أوي-زوكي',
      jp: '追い突き',
      tag: 'لكمة التقدم',
      desc: 'لكمة مستقيمة مع التقدم بخطوة للأمام. من أقوى اللكمات الأساسية في الشوتوكان، تُستخدم للوصول السريع للخصم.',
      beltColor: '#ef4444',
      gif: 'step-09',
      svg: OiZukiSVG
    },
    {
      id: 'gyaku-zuki',
      name: 'جياكو-زوكي',
      jp: '逆突き',
      tag: 'اللكمة العكسية',
      desc: 'لكمة باليد الخلفية المعاكسة لقدم المتقدمة. أقوى لكمات الكاراتيه لأنها تعتمد على دوران الخصر كامل.',
      beltColor: '#f97316',
      gif: 'step-08',
      svg: GyakuZukiSVG
    },
    {
      id: 'mae-geri',
      name: 'ماي-جيري',
      jp: '前蹴り',
      tag: 'الركلة الأمامية',
      desc: 'ركلة مستقيمة للأمام بكعب القدم. من أهم ركلات الكاراتيه وتُستخدم للدفع وضرب وسط الخصم.',
      beltColor: '#eab308',
      gif: 'step-10',
      svg: MaeGeriSVG
    },
    {
      id: 'mawashi-geri',
      name: 'ماواشي-جيري',
      jp: '回し蹴り',
      tag: 'الركلة الدائرية',
      desc: 'ركلة دائرية من الجانب بإصبع القدم الكبير تصيب رأس أو جذع الخصم. من أشهر ركلات الكوميتيه.',
      beltColor: '#22c55e',
      gif: 'step-11',
      svg: MawashiGeriSVG
    },
    {
      id: 'age-uke',
      name: 'آجي-أوكي',
      jp: '上げ受け',
      tag: 'الصد العلوي',
      desc: 'صد من الأسفل للأعلى لإبعاد هجوم علوي نحو الوجه. حركة دفاعية أساسية في كل الكاتا.',
      beltColor: '#06b6d4',
      gif: 'step-07',
      svg: AgeUkeSVG
    },
    {
      id: 'gedan-barai',
      name: 'جيدان-باراي',
      jp: '下段払い',
      tag: 'الصد السفلي',
      desc: 'حركة كنس باليد لأسفل لإبعاد ركلة منخفضة. أول حركة في الكاتا الأساسية (هيان شودان).',
      beltColor: '#a855f7',
      gif: 'step-05',
      svg: GedanBaraiSVG
    },
    {
      id: 'shuto-uchi',
      name: 'شوتو-أوتشي',
      jp: '手刀打ち',
      tag: 'ضربة السيف',
      desc: 'ضربة بالجانب الخارجي للكف (كأنه سيف) على الرقبة أو الصدغ. تتطلب توازناً ودوران خصر قوي.',
      beltColor: '#ec4899',
      gif: 'step-02',
      svg: ShutoUchiSVG
    },
    {
      id: 'kata',
      name: 'الكاتا',
      jp: '形',
      tag: 'الشكل التقليدي',
      desc: 'سلسلة من الحركات المتسلسلة الرمزية تحاكي قتالاً مع عدة خصوم. الكاتا روح الكاراتيه وأساس إتقانها.',
      beltColor: '#fbbf24',
      gif: 'step-12',
      svg: KataSVG
    }
  ];

  /* ============ بيانات الأحزمة ============
     كل لون يمثّل مرحلة (مجموعة كيو) أو درجة دان.
  */
  const BELTS = [
    { name: 'الحزام الأبيض', jp: '白帯', level: 'كيو 10-8', color: '#ffffff', light: '#ffffff', dark: '#d1d5db', glow: 'rgba(255,255,255,0.4)', desc: 'بداية الرحلة. تعلّم الوقفات الأساسية (داتشيو) واللكمات الأولى والكاتا (هيان شودان).' },
    { name: 'الحزام الأصفر', jp: '黄帯', level: 'كيو 7', color: '#fbbf24', light: '#fde68a', dark: '#d97706', glow: 'rgba(251,191,36,0.5)', desc: 'إتقان الكيهون الأول وبدء الكاتا (هيان شودان ونيدان) وركلات أرضية.' },
    { name: 'الحزام البرتقالي', jp: '橙帯', level: 'كيو 6', color: '#f97316', light: '#fed7aa', dark: '#c2410c', glow: 'rgba(249,115,22,0.5)', desc: 'تطبيق اللكمات العكسية (جياكو-زوكي) والركلات الجانبية وبداية الكوميتيه.' },
    { name: 'الحزام الأخضر', jp: '緑帯', level: 'كيو 5-4', color: '#22c55e', light: '#86efac', dark: '#15803d', glow: 'rgba(34,197,94,0.5)', desc: 'الكاتا الثالثة (هيان ساندان) والكوميتيه الموجه وركلات ماواشي-جيري.' },
    { name: 'الحزام الأزرق', jp: '青帯', level: 'كيو 3-2', color: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8', glow: 'rgba(59,130,246,0.5)', desc: 'الركلات الدائرية والصدات العلوية (آجي-أوكي) والكاتا المتقدمة (هيان يوندان).' },
    { name: 'الحزام البني', jp: '茶帯', level: 'كيو 1', color: '#92400e', light: '#d69156', dark: '#451a03', glow: 'rgba(146,64,14,0.6)', desc: 'مرحلة الانتقال للحزام الأسود. الكاتا المتقدمة (تكيوكو) والقتال الحر المتكامل.' },
    { name: 'الحزام الأسود', jp: '黒帯', level: 'دان 1-10', color: '#1a1a1a', light: '#4a4a4a', dark: '#000000', glow: 'rgba(0,0,0,0.8)', desc: 'بداية المعلمية. تُعد درجات الدان عشراً، ويُمنح دان 1 بعد اختبار صارم في الكاتا والكوميتيه.' }
  ];

  /* ============ لقطات التدريبات (صور حقيقية) ============ */
  const GALLERY = [
    { img: 'shot-agility',   title: 'تدريب الرشاقة بين الأقماع',    tag: 'لياقة بدنية',     color: '#22c55e' },
    { img: 'shot-weave',     title: 'تمرين التنقل والمهارة الحركية', tag: 'مهارة حركية',     color: '#06b6d4' },
    { img: 'shot-cones',     title: 'حصة تدريبية على مسار الأقماع',  tag: 'تركيز وتوازن',   color: '#a855f7' },
    { img: 'shot-kids-run',  title: 'تدريب الناشئات على السرعة',     tag: 'ناشئات',         color: '#f43f5e' },
    { img: 'shot-team-hall', title: 'صورة جماعية للفريق داخل القاعة', tag: 'فريق الأكاديمية', color: '#f59e0b' },
    { img: 'shot-bleachers', title: 'تجمع الفريق على المدرجات',       tag: 'روح الفريق',     color: '#38bdf8' }
  ];

  /* ============ SVG ANIMATION FUNCTIONS ============
     كل دالة ترجع SVG (200x200) يرسم مقاتلاً ينفذ حركة بأنيميشن CSS.
     نرسم اللاعب كشكل مبسط: رأس، جذع، ذراعان، ساقان.
  */

  // دالة مساعدة لرسم اللاعب الأساسي (وضعية الاستعداد)
  function baseFighter(beltColor) {
    return `
      <circle class="fighter-head" cx="100" cy="36" r="14" />
      <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z" />
      <line class="fighter-line" x1="100" y1="60" x2="100" y2="135" />
      <rect class="fighter-belt" style="--belt-color:${beltColor}" x="70" y="105" width="60" height="14" rx="2" />
    `;
  }

  // 1. أوي-زوكي: لكم أمامي مع خطوة
  function OiZukiSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-oi" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(244,63,94,0.18)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="60" ry="8" fill="url(#ground-oi)"/>
      <g class="oi-zuki-anim">
        <!-- خطوة القدم الأمامية -->
        <ellipse class="leg-step" cx="120" cy="172" rx="22" ry="6" fill="#1a1a1a" opacity="0.6"/>
        <!-- الرأس -->
        <circle class="fighter-head" cx="100" cy="36" r="14"/>
        <!-- الجذع -->
        <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z"/>
        <!-- خط الوسط -->
        <line class="fighter-line" x1="100" y1="60" x2="100" y2="135"/>
        <!-- الحزام -->
        <rect class="fighter-belt" style="--belt-color:#ef4444" x="70" y="105" width="60" height="14" rx="2"/>
        <!-- الساقان -->
        <line class="fighter-line" x1="85" y1="130" x2="78" y2="170"/>
        <line class="fighter-line" x1="115" y1="130" x2="125" y2="170"/>
        <!-- اليد الخلفية (مضمومة) -->
        <circle class="fighter-body" cx="78" cy="95" r="7"/>
        <line class="fighter-line-thin" x1="85" y1="80" x2="78" y2="95"/>
        <!-- اليد الأمامية (اللكمة) -->
        <g class="punch-arm">
          <line class="fighter-line" x1="115" y1="80" x2="155" y2="95"/>
          <circle class="fighter-body" cx="158" cy="95" r="8" fill="#f1f5f9"/>
          <!-- وميض اللكمة -->
          <g class="impact">
            <path d="M168 88 L185 88 M168 95 L185 95 M168 102 L185 102" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          </g>
        </g>
      </g>
      <style>
        .oi-zuki-anim { transform-origin: 100px 130px; }
        .oi-zuki-anim .punch-arm { transform-origin: 115px 80px; animation: oi-punch 1.8s ease-in-out infinite; }
        .oi-zuki-anim .leg-step { transform-origin: 120px 172px; animation: oi-step 1.8s ease-in-out infinite; }
        .oi-zuki-anim .impact { opacity: 0; animation: oi-impact 1.8s ease-in-out infinite; }
        @keyframes oi-punch { 0%,60% { transform: translateX(-30px); } 75% { transform: translateX(0); } 100% { transform: translateX(-30px); } }
        @keyframes oi-step { 0%,60% { transform: translateX(-25px); opacity:0.4; } 75% { transform: translateX(0); opacity:0.9; } 100% { transform: translateX(-25px); opacity:0.4; } }
        @keyframes oi-impact { 0%,60% { opacity:0; } 75%,85% { opacity:1; transform: scale(1.4) translateX(8px); } 100% { opacity:0; } }
      </style>
    </svg>`;
  }

  // 2. جياكو-زوكي: لكمة عكسية مع دوران خصر
  function GyakuZukiSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-gyaku" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(249,115,22,0.18)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="55" ry="7" fill="url(#ground-gyaku)"/>
      <g class="gyaku-anim">
        <circle class="fighter-head" cx="100" cy="36" r="14"/>
        <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z"/>
        <line class="fighter-line" x1="100" y1="60" x2="100" y2="135"/>
        <rect class="fighter-belt" style="--belt-color:#f97316" x="70" y="105" width="60" height="14" rx="2"/>
        <line class="fighter-line" x1="85" y1="130" x2="82" y2="170"/>
        <line class="fighter-line" x1="115" y1="130" x2="118" y2="170"/>
        <circle class="fighter-body" cx="120" cy="95" r="7"/>
        <line class="fighter-line-thin" x1="115" y1="80" x2="120" y2="95"/>
        <g class="rev-punch">
          <line class="fighter-line" x1="85" y1="80" x2="42" y2="95"/>
          <circle class="fighter-body" cx="40" cy="95" r="8" fill="#f1f5f9"/>
          <g class="impact">
            <path d="M22 88 L5 88 M22 95 L5 95 M22 102 L5 102" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          </g>
        </g>
      </g>
      <style>
        .gyaku-anim { transform-origin: 100px 95px; }
        .gyaku-anim .rev-punch { transform-origin: 85px 80px; animation: gyaku-punch 1.8s ease-in-out infinite; }
        .gyaku-anim { animation: gyaku-rotate 1.8s ease-in-out infinite; }
        .gyaku-anim .impact { opacity: 0; animation: gyaku-impact 1.8s ease-in-out infinite; }
        @keyframes gyaku-rotate { 0%,40% { transform: rotate(0deg); } 60% { transform: rotate(-6deg); } 100% { transform: rotate(0); } }
        @keyframes gyaku-punch { 0%,40% { transform: translateX(25px); } 60%,75% { transform: translateX(0); } 100% { transform: translateX(25px); } }
        @keyframes gyaku-impact { 0%,40% { opacity:0; } 65%,75% { opacity:1; transform: scale(1.4) translateX(-8px);} 100% { opacity:0; } }
      </style>
    </svg>`;
  }

  // 3. ماي-جيري: ركلة أمامية
  function MaeGeriSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-mae" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(234,179,8,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="50" ry="7" fill="url(#ground-mae)"/>
      <g class="mae-anim">
        <circle class="fighter-head" cx="100" cy="36" r="14"/>
        <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z"/>
        <line class="fighter-line" x1="100" y1="60" x2="100" y2="135"/>
        <rect class="fighter-belt" style="--belt-color:#eab308" x="70" y="105" width="60" height="14" rx="2"/>
        <!-- يد للتوازن -->
        <line class="fighter-line-thin" x1="80" y1="75" x2="55" y2="90"/>
        <circle class="fighter-body" cx="52" cy="92" r="6"/>
        <line class="fighter-line-thin" x1="120" y1="75" x2="148" y2="90"/>
        <circle class="fighter-body" cx="150" cy="92" r="6"/>
        <!-- الساق الخلفية (ثابتة) -->
        <line class="fighter-line" x1="100" y1="130" x2="92" y2="170"/>
        <!-- الساق المرفوعة - الركلة -->
        <g class="kick-leg">
          <line class="fighter-line" x1="108" y1="130" x2="160" y2="100"/>
          <circle class="fighter-body" cx="165" cy="98" r="9" fill="#f1f5f9"/>
          <g class="impact">
            <path d="M178 95 L192 95 M178 102 L192 102" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          </g>
        </g>
      </g>
      <style>
        .mae-anim { transform-origin: 100px 130px; }
        .mae-anim .kick-leg { transform-origin: 108px 130px; animation: mae-kick 1.6s ease-in-out infinite; }
        .mae-anim .impact { opacity:0; animation: mae-impact 1.6s ease-in-out infinite; }
        @keyframes mae-kick { 0%,40% { transform: rotate(50deg); } 65%,80% { transform: rotate(0deg); } 100% { transform: rotate(50deg); } }
        @keyframes mae-impact { 0%,40% { opacity:0; } 70%,82% { opacity:1; transform: translateX(8px);} 100% { opacity:0; } }
      </style>
    </svg>`;
  }

  // 4. ماواشي-جيري: ركلة دائرية
  function MawashiGeriSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-mawa" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(34,197,94,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="50" ry="7" fill="url(#ground-mawa)"/>
      <!-- مسار الركلة الدائرية -->
      <path class="kick-arc" d="M70 165 A 50 50 0 0 1 165 110" fill="none" stroke="rgba(34,197,94,0.35)" stroke-width="2" stroke-dasharray="3 4"/>
      <g class="mawa-anim">
        <circle class="fighter-head" cx="100" cy="36" r="14"/>
        <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z"/>
        <line class="fighter-line" x1="100" y1="60" x2="100" y2="135"/>
        <rect class="fighter-belt" style="--belt-color:#22c55e" x="70" y="105" width="60" height="14" rx="2"/>
        <line class="fighter-line-thin" x1="80" y1="75" x2="55" y2="85"/>
        <circle class="fighter-body" cx="52" cy="87" r="6"/>
        <line class="fighter-line-thin" x1="120" y1="75" x2="148" y2="80"/>
        <circle class="fighter-body" cx="150" cy="82" r="6"/>
        <line class="fighter-line" x1="100" y1="130" x2="95" y2="170"/>
        <g class="round-kick">
          <line class="fighter-line" x1="105" y1="130" x2="158" y2="80"/>
          <circle class="fighter-body" cx="162" cy="78" r="9" fill="#f1f5f9"/>
        </g>
      </g>
      <style>
        .mawa-anim .round-kick { transform-origin: 105px 130px; animation: mawa-kick 2s ease-in-out infinite; }
        @keyframes mawa-kick { 0% { transform: rotate(0deg); } 50% { transform: rotate(-70deg); } 100% { transform: rotate(0deg); } }
      </style>
    </svg>`;
  }

  // 5. آجي-أوكي: صد علوي
  function AgeUkeSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-age" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(6,182,212,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="50" ry="7" fill="url(#ground-age)"/>
      <!-- هجوم وارد من الأعلى -->
      <g class="incoming-attack">
        <line class="fighter-line-thin" x1="30" y1="0" x2="100" y2="30" stroke="#ef4444"/>
        <circle cx="28" cy="-2" r="5" fill="#ef4444"/>
      </g>
      <g class="age-anim">
        <circle class="fighter-head" cx="100" cy="36" r="14"/>
        <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z"/>
        <line class="fighter-line" x1="100" y1="60" x2="100" y2="135"/>
        <rect class="fighter-belt" style="--belt-color:#06b6d4" x="70" y="105" width="60" height="14" rx="2"/>
        <line class="fighter-line" x1="85" y1="130" x2="82" y2="170"/>
        <line class="fighter-line" x1="115" y1="130" x2="118" y2="170"/>
        <line class="fighter-line-thin" x1="120" y1="75" x2="130" y2="92"/>
        <circle class="fighter-body" cx="132" cy="94" r="6"/>
        <g class="block-arm">
          <line class="fighter-line" x1="80" y1="80" x2="80" y2="20"/>
          <rect x="74" y="14" width="14" height="14" rx="3" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
        </g>
      </g>
      <style>
        .age-anim .block-arm { transform-origin: 80px 80px; animation: age-block 1.6s ease-in-out infinite; }
        .incoming-attack { transform-origin: 100px 30px; animation: incoming 1.6s ease-in-out infinite; }
        @keyframes age-block { 0%,40% { transform: translateY(0); } 60%,80% { transform: translateY(-25px); } 100% { transform: translateY(0); } }
        @keyframes incoming { 0% { transform: translateX(60px); opacity:0; } 40% { opacity:1; } 60% { transform: translateX(0); } 80% { transform: translateX(15px); opacity:0; } 100% { transform: translateX(60px); opacity:0; } }
      </style>
    </svg>`;
  }

  // 6. جيدان-باراي: صد سفلي
  function GedanBaraiSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-gedan" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(168,85,247,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="50" ry="7" fill="url(#ground-gedan)"/>
      <g class="gedan-anim">
        <circle class="fighter-head" cx="100" cy="36" r="14"/>
        <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z"/>
        <line class="fighter-line" x1="100" y1="60" x2="100" y2="135"/>
        <rect class="fighter-belt" style="--belt-color:#a855f7" x="70" y="105" width="60" height="14" rx="2"/>
        <line class="fighter-line" x1="85" y1="130" x2="82" y2="170"/>
        <line class="fighter-line" x1="115" y1="130" x2="118" y2="170"/>
        <line class="fighter-line-thin" x1="120" y1="75" x2="135" y2="88"/>
        <circle class="fighter-body" cx="138" cy="90" r="6"/>
        <g class="sweep-arm">
          <line class="fighter-line" x1="80" y1="80" x2="80" y2="140"/>
          <rect x="73" y="140" width="14" height="14" rx="3" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
          <g class="impact">
            <path d="M55 145 L40 145 M55 152 L40 152" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          </g>
        </g>
      </g>
      <style>
        .gedan-anim .sweep-arm { transform-origin: 80px 80px; animation: gedan-sweep 1.8s ease-in-out infinite; }
        .gedan-anim .impact { opacity:0; animation: gedan-impact 1.8s ease-in-out infinite; }
        @keyframes gedan-sweep { 0%,40% { transform: rotate(40deg) translateY(20px); } 65%,80% { transform: rotate(0deg) translateY(40px); } 100% { transform: rotate(40deg) translateY(20px); } }
        @keyframes gedan-impact { 0%,40% { opacity:0; } 70%,82% { opacity:1; transform: translateX(-8px);} 100% { opacity:0; } }
      </style>
    </svg>`;
  }

  // 7. شوتو-أوتشي: ضربة سيف اليد
  function ShutoUchiSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-shuto" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(236,72,153,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="55" ry="7" fill="url(#ground-shuto)"/>
      <g class="shuto-anim">
        <circle class="fighter-head" cx="100" cy="36" r="14"/>
        <path class="fighter-gi" d="M75 60 L125 60 L130 130 L70 130 Z"/>
        <line class="fighter-line" x1="100" y1="60" x2="100" y2="135"/>
        <rect class="fighter-belt" style="--belt-color:#ec4899" x="70" y="105" width="60" height="14" rx="2"/>
        <line class="fighter-line" x1="85" y1="130" x2="82" y2="170"/>
        <line class="fighter-line" x1="115" y1="130" x2="118" y2="170"/>
        <line class="fighter-line-thin" x1="120" y1="75" x2="140" y2="80"/>
        <circle class="fighter-body" cx="143" cy="82" r="6"/>
        <g class="sword-arm">
          <line class="fighter-line" x1="80" y1="80" x2="30" y2="65"/>
          <!-- يد مفتوحة (سيف) -->
          <rect x="18" y="58" width="22" height="8" rx="2" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
          <path d="M18 60 L8 58 M18 66 L8 68" stroke="#f1f5f9" stroke-width="2" stroke-linecap="round"/>
          <g class="impact">
            <path d="M-2 60 L-15 60 M-2 68 L-15 68" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          </g>
        </g>
      </g>
      <style>
        .shuto-anim { transform-origin: 100px 95px; }
        .shuto-anim { animation: shuto-rotate 1.8s ease-in-out infinite; }
        .shuto-anim .sword-arm { transform-origin: 80px 80px; animation: shuto-swing 1.8s ease-in-out infinite; }
        .shuto-anim .impact { opacity:0; animation: shuto-impact 1.8s ease-in-out infinite; }
        @keyframes shuto-rotate { 0%,40% { transform: rotate(0); } 60% { transform: rotate(8deg); } 100% { transform: rotate(0); } }
        @keyframes shuto-swing { 0%,40% { transform: rotate(35deg) translateX(20px); } 60%,80% { transform: rotate(0deg) translateX(0); } 100% { transform: rotate(35deg) translateX(20px); } }
        @keyframes shuto-impact { 0%,40% { opacity:0; } 65%,75% { opacity:1; transform: translateX(-8px);} 100% { opacity:0; } }
      </style>
    </svg>`;
  }

  // 8. الكاتا: حركات متسلسلة
  function KataSVG() {
    return `
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="ground-kata" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(251,191,36,0.22)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="175" rx="55" ry="7" fill="url(#ground-kata)"/>
      <!-- مسار الكاتا على شكل نجمة -->
      <path d="M100 90 L140 110 L125 150 L75 150 L60 110 Z" fill="none" stroke="rgba(251,191,36,0.4)" stroke-width="2" stroke-dasharray="3 4"/>
      <!-- مقاتل يتحرك عبر نقاط -->
      <g class="kata-fighter">
        <circle class="fighter-head" cx="0" cy="-22" r="10"/>
        <path class="fighter-gi" d="M-15 0 L15 0 L18 45 L-18 45 Z"/>
        <rect class="fighter-belt" style="--belt-color:#fbbf24" x="-15" y="32" width="30" height="7" rx="2"/>
        <line class="fighter-line" x1="0" y1="0" x2="0" y2="48"/>
        <line class="fighter-line" x1="-8" y1="45" x2="-10" y2="60"/>
        <line class="fighter-line" x1="8" y1="45" x2="10" y2="60"/>
        <line class="fighter-line-thin" x1="-10" y1="10" x2="-25" y2="20"/>
        <line class="fighter-line-thin" x1="10" y1="10" x2="25" y2="20"/>
      </g>
      <!-- نقاط المسار -->
      <circle cx="100" cy="90" r="4" fill="#fbbf24"/>
      <circle cx="140" cy="110" r="4" fill="#fbbf24"/>
      <circle cx="125" cy="150" r="4" fill="#fbbf24"/>
      <circle cx="75" cy="150" r="4" fill="#fbbf24"/>
      <circle cx="60" cy="110" r="4" fill="#fbbf24"/>
      <style>
        .kata-fighter { animation: kata-walk 5s linear infinite; }
        @keyframes kata-walk {
          0% { transform: translate(100px, 90px) scale(0.7); opacity:0.6; }
          20% { transform: translate(140px, 110px) scale(0.85); opacity:0.9; }
          40% { transform: translate(125px, 150px) scale(1); opacity:1; }
          60% { transform: translate(75px, 150px) scale(1); opacity:1; }
          80% { transform: translate(60px, 110px) scale(0.85); opacity:0.9; }
          100% { transform: translate(100px, 90px) scale(0.7); opacity:0.6; }
        }
      </style>
    </svg>`;
  }

  /* ============ GENERATE MOVE CARDS ============ */
  function renderMoves() {
    const grid = document.getElementById('movesGrid');
    if (!grid) return;
    grid.innerHTML = MOVES.map(move => `
      <article class="move-card reveal" data-move="${move.id}">
        <div class="move-card-head">
          <h4>${move.name}</h4>
          <span class="jp-name">${move.jp}</span>
        </div>
        <div class="move-stage">
          <img src="assets/images/wikihow-gifs/${move.gif}.gif" alt="${move.name} - ${move.tag}" class="move-gif">
          <button class="replay-btn" data-replay="${move.id}" aria-label="إعادة">↻ إعادة</button>
        </div>
        <p>${move.desc}</p>
        <span class="move-tag">${move.tag}</span>
      </article>
    `).join('');

    // أزرار إعادة التشغيل: إعادة تحميل الـ GIF بإعادة ضبط src
    grid.querySelectorAll('.replay-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('.move-card');
        const img = card.querySelector('.move-gif');
        if (img) {
          const src = img.src;
          img.src = '';
          // force reload by appending a cache-buster
          const sep = src.indexOf('?') >= 0 ? '&' : '?';
          img.src = src.split('?')[0] + sep + 'r=' + Date.now();
        }
      });
    });
  }

  /* ============ GENERATE BELTS ============ */
  function renderBelts() {
    const track = document.getElementById('beltsTrack');
    if (!track) return;
    track.innerHTML = BELTS.map((b, i) => `
      <div class="belt-row reveal" style="--belt-color:${b.color}; --belt-color-light:${b.light}; --belt-color-dark:${b.dark}; --belt-color-glow:${b.glow}; transition-delay:${i * 0.05}s">
        <div class="belt-visual"></div>
        <div class="belt-info">
          <h4>${b.name} <span class="jp">• ${b.jp}</span></h4>
          <p>${b.desc}</p>
        </div>
        <div class="belt-level">${b.level}</div>
      </div>
    `).join('');
  }

  /* ============ توليد معرض لقطات التدريبات ============ */
  function renderGallery() {
    const gallery = document.getElementById('playersGallery');
    if (!gallery) return;
    gallery.innerHTML = GALLERY.map((p, i) => `
      <div class="gallery-card reveal tilt-3d" data-img="assets/images/${p.img}.jpg" data-caption="${p.title}" style="--belt-color:${p.color}; transition-delay:${i * 0.06}s">
        <img src="assets/images/${p.img}.jpg" alt="${p.title}" class="gallery-img" loading="lazy">
        <div class="gallery-overlay">
          <div class="gallery-name">${p.title}</div>
          <div class="gallery-belt"><span class="gallery-belt-dot"></span>${p.tag}</div>
        </div>
      </div>
    `).join('');
    // ربط النقر على البطاقة بفتح الـ Lightbox
    gallery.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        openLightbox(card.dataset.img, card.dataset.caption);
      });
    });
  }

  /* ============ LIGHTBOX ============ */
  function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    if (!lb || !img) return;
    img.src = src;
    if (cap && caption) cap.textContent = caption;
    lb.classList.add('active');
  }
  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('active');
  }

  /* ============ REVEAL ON SCROLL ============ */
  function setupReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
    // أمان: لو بقى أي عنصر مخفي بعد 4 ثوانٍ (مراقب فاشل أو تمرير قصير)، أظهره
    setTimeout(() => {
      items.forEach(el => el.classList.add('visible'));
    }, 4000);
  }

  /* ============ ACTIVE NAV ============ */
  function setupActiveNav() {
    const navItems = document.querySelectorAll('.bottom-nav-item[data-target]');
    const drawerItems = document.querySelectorAll('.more-nav-item[data-target]');
    const moreBtn = document.getElementById('moreNavBtn');
    const sections = ['section-home','section-moves','section-learn','section-rules','section-belts','section-coaches','section-certs','section-players','section-schedule','section-contact'].map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    // الأقسام الموجودة داخل درج "المزيد" — عند الوصول لها يُفعّل زر المزيد
    const drawerSectionIds = new Set(['section-moves','section-learn','section-rules','section-belts','section-certs','section-players']);

    function update() {
      const scrollY = window.scrollY + 120;
      let active = sections[0].id;
      sections.forEach(s => {
        if (s.offsetTop <= scrollY) active = s.id;
      });
      navItems.forEach(item => {
        const target = item.dataset.target.replace('#','');
        item.classList.toggle('active', target === active);
      });
      // زر "المزيد" يبقى نشطاً إذا كان القسم الحالي داخل الدرج
      if (moreBtn) moreBtn.classList.toggle('active', drawerSectionIds.has(active));
      // فعّل عنصر الدرج المطابق للقسم الحالي
      drawerItems.forEach(item => {
        const target = item.dataset.target.replace('#','');
        item.classList.toggle('active', target === active);
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============ MORE-NAV DRAWER (المزيد) ============
     زر "المزيد" يفتح درجاً سفلياً يضم بقية الأقسام.
  */
  function setupMoreNav() {
    const btn = document.getElementById('moreNavBtn');
    const drawer = document.getElementById('moreNavDrawer');
    const backdrop = document.getElementById('moreNavBackdrop');
    const closeBtn = document.getElementById('moreNavClose');
    if (!btn || !drawer || !backdrop) return;
    const items = drawer.querySelectorAll('.more-nav-item[data-target]');

    function open() {
      drawer.hidden = false;
      backdrop.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.hidden = true;
      backdrop.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function toggle() { btn.getAttribute('aria-expanded') === 'true' ? close() : open(); }

    btn.addEventListener('click', toggle);
    backdrop.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    // الضغط على أي قسم داخل الدرج يغلقه ثم ينتقل إليه
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        close();
        // اسمح بالتمرير عبر href الافتراضي للرابط (لا نمنعه)
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close();
    });
  }

  /* ============ 3D ANIMATED SECTION ICONS ============
     نحوّل كل span.icon3d[data-icon] إلى شارة ثلاثية الأبعاد تدور ببطء
     تحوي أيقونة SVG مرسومة برمجياً.
  */
  const ICONS3D = {
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
    moves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h4l2-3 2 6 2-3h4"/></svg>',
    learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13"/><path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M12 4v15"/></svg>',
    rules: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h9a3 3 0 0 1 3 3v13"/><path d="M18 20H9a3 3 0 0 1-3-3V4"/><path d="M9 8h6M9 12h6"/></svg>',
    belts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="6" rx="1"/><path d="M9 9v6M15 9v6"/><circle cx="12" cy="12" r="1.2"/></svg>',
    coach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M6 9v6c0 2 3 4 6 4s6-2 6-4V9"/><path d="M20 7v5"/></svg>',
    certs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M9 13.5L7 21l5-3 5 3-2-7.5"/></svg>',
    players: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c0-2.5 2-4.5 4-4.5s2.5 1 2.5 2"/></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l1 5v2a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/></svg>',
    schedule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/></svg>'
  };

  function renderIcons3D() {
    document.querySelectorAll('.icon3d[data-icon]').forEach(el => {
      const key = el.dataset.icon;
      const svg = ICONS3D[key] || ICONS3D.info;
      el.innerHTML = `
        <div class="icon3d-stage" aria-hidden="true">
          <div class="icon3d-coin">
            <div class="icon3d-face icon3d-front">${svg}</div>
            <div class="icon3d-face icon3d-back"><span class="icon3d-kanji">空</span></div>
          </div>
          <div class="icon3d-shadow"></div>
        </div>`;
    });
  }

  /* ============ 3D TILT ON HOVER ============
     أي عنصر بفئة tilt-3d يميل في الفراغ تبعاً لموضع المؤشر.
  */
  function setupTilt3D() {
    const isTouch = matchMedia('(hover: none)').matches;
    if (isTouch) return; // لا تيلت على اللمس
    const targets = document.querySelectorAll('.tilt-3d');
    targets.forEach(el => {
      let raf = 0;
      const MAX = 9; // درجات الميل القصوى
      function onMove(e) {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (0.5 - px) * MAX * 2; // rotateY
        const rx = (py - 0.5) * MAX * 2; // rotateX
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(6px)`;
          el.style.setProperty('--tx', `${((px - 0.5) * 100).toFixed(0)}%`);
          el.style.setProperty('--ty', `${((py - 0.5) * 100).toFixed(0)}%`);
        });
      }
      function onLeave() {
        cancelAnimationFrame(raf);
        el.style.transform = '';
      }
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  /* ============ ANIMATED COUNTERS (coach stats) ============ */
  function setupCounters() {
    const stats = document.querySelectorAll('.coach-stat strong');
    if (!stats.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        const raw = el.textContent.trim();
        // يدعم نصوصاً مثل "+18" و"دان 1" و"5"
        const m = raw.match(/(-?\+?\d+)/);
        if (!m) return;
        const target = parseInt(m[1], 10);
        const prefix = raw.startsWith('+') ? '+' : '';
        const suffix = raw.replace(/(-?\+?\d+)/, '').trim(); // مثل "دان" قبل الرقم
        const isDan = /دان/.test(raw);
        const start = performance.now();
        const DUR = 1400;
        function tick(now) {
          const p = Math.min((now - start) / DUR, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(target * eased);
          if (isDan) {
            el.textContent = `${suffix} ${val}`.trim();
          } else {
            el.textContent = `${prefix}${val}${suffix ? ' ' + suffix : ''}`;
          }
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw; // أعِد النص الأصلي لضمان الدقة
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    stats.forEach(s => io.observe(s));
  }

  /* ============ HERO PARALLAX ============ */
  function setupParallax() {
    const hero = document.querySelector('.hero-karate');
    const emblem = document.querySelector('.hero-emblem');
    if (!hero) return;
    if (matchMedia('(hover: none)').matches) return;
    let raf = 0;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        hero.style.setProperty('--px', px.toFixed(3));
        hero.style.setProperty('--py', py.toFixed(3));
        if (emblem) {
          emblem.style.transform = `translate3d(${px * 28}px, ${py * 22}px, 0)`;
        }
      });
    });
    hero.addEventListener('mouseleave', () => {
      hero.style.setProperty('--px', '0');
      hero.style.setProperty('--py', '0');
      if (emblem) emblem.style.transform = '';
    });
  }

  /* ============ PWA INSTALL PROMPT + OFFLINE TOAST ============ */
  function setupPWA() {
    const banner = document.getElementById('pwaInstall');
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaDismissBtn');
    let deferredPrompt = null;

    // اعرض البانر فقط لو المتصفح أطلق beforeinstallprompt ( Chrome/Edge )
    // مع تأخير 6 ثوانٍ حتى يرى المستخدم الـHero أولاً ولا يغطي البانر المحتوى
    let showTimer = null;
    function showBanner() {
      if (!banner || sessionStorage.getItem('pwa-dismissed')) return;
      banner.hidden = false;
      requestAnimationFrame(() => banner.classList.add('show'));
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (showTimer) clearTimeout(showTimer);
      showTimer = setTimeout(showBanner, 6000);
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch (e) {}
        deferredPrompt = null;
        if (banner) { banner.classList.remove('show'); banner.hidden = true; }
      });
    }
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (banner) { banner.classList.remove('show'); banner.hidden = true; }
        sessionStorage.setItem('pwa-dismissed', '1');
      });
    }

    // لو التطبيق مثبّت بالفعل (installed / standalone) لا تُظهر البانر
    if (matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      if (banner) banner.hidden = true;
    }

    // مؤشر "تعمل دون اتصال"
    const toast = document.getElementById('offlineToast');
    function updateOnline() {
      if (!toast) return;
      if (!navigator.onLine) {
        toast.hidden = false;
        requestAnimationFrame(() => toast.classList.add('show'));
      } else {
        toast.classList.remove('show');
        setTimeout(() => { toast.hidden = true; }, 300);
      }
    }
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();
  }

  /* ============ BACK TO TOP ============ */
  function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    function update() {
      if (window.scrollY > 600) btn.classList.add('show');
      else btn.classList.remove('show');
    }
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }

  /* ============ INIT ============ */
  function init() {
    renderIcons3D();
    renderMoves();
    renderBelts();
    renderGallery();
    setupReveal();
    setupActiveNav();
    setupMoreNav();
    setupTilt3D();
    setupCounters();
    setupParallax();
    setupPWA();
    setupBackToTop();

    // إغلاق الـ Lightbox
    const lbClose = document.querySelector('.lightbox-close');
    const lbOverlay = document.getElementById('lightbox');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbOverlay) lbOverlay.addEventListener('click', e => {
      if (e.target === lbOverlay) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });

    // سنة في الفوتر
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
