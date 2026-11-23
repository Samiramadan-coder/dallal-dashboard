// Content of the "How does this page work?" drawer, per page.
// Taken from the Dallal Hoolee admin prototype, in English and Arabic
import type { PageHeaderKey } from "@/components/reusable/page-header";

export type LocalizedText = { en: string; ar: string };

export type PageGuide = {
  purpose: LocalizedText;
  // Role slugs, labelled with layout.header.roles
  whoUses: string[];
  steps: LocalizedText[];
  rules: LocalizedText[];
  terms: { term: LocalizedText; meaning: LocalizedText }[];
  related: { label: LocalizedText; href: string }[];
};

export const pageGuides: Partial<Record<PageHeaderKey, PageGuide>> = {
  overview: {
    purpose: {
      en: "A quick picture of platform health and what needs action right now.",
      ar: "صورة سريعة لصحة المنصة وما يحتاج تدخل الآن.",
    },
    whoUses: [
      "super_admin",
      "admin",
      "moderator",
      "verification_officer",
      "finance",
      "support_agent",
    ],
    steps: [
      {
        en: "Start your day with the “Needs attention” card and click any number to go to its list.",
        ar: "ابدأ يومك بكارت «يحتاج متابعة» واضغط أي رقم للذهاب للقائمة.",
      },
      {
        en: "Choose the country and the period.",
        ar: "اختر الدولة والفتر��.",
      },
      {
        en: "Each indicator compares with the previous period. Click it to open its page.",
        ar: "كل مؤشر يقارن بالفترة السابقة واضغطه لفتح صفحته.",
      },
    ],
    rules: [],
    terms: [
      {
        term: {
          en: "Needs attention",
          ar: "يحتاج متابعة",
        },
        meaning: {
          en: "Open items that need a person right now: reviews, reports and expiring licences. Click a number to open its list.",
          ar: "بنود مفتوحة تحتاج تدخلًا الآن: مراجعات وبلاغات ورخص قاربت على الانتهاء. اضغط أي رقم لفتح قائمته.",
        },
      },
      {
        term: {
          en: "Post-trial subscription",
          ar: "الاشتراك بعد التجربة",
        },
        meaning: {
          en: "The share of ended free trials that became a paid subscription.",
          ar: "نسبة التجارب المجانية المنتهية التي تحوّلت إلى اشتراك مدفوع.",
        },
      },
      {
        term: {
          en: "Monthly recurring revenue (MRR)",
          ar: "الإيراد الشهري المتكرر",
        },
        meaning: {
          en: "What active paid subscriptions bring in each month, shown per currency.",
          ar: "ما تدرّه الاشتراكات المدفوعة النشطة كل شهر، معروضًا لكل عملة.",
        },
      },
      {
        term: {
          en: "Median time to first offer",
          ar: "وسيط الوقت حتى أول عرض سعر",
        },
        meaning: {
          en: "The typical wait from a sell request being submitted to the first price offer from a store.",
          ar: "مدة الانتظار المعتادة من إرسال طلب البيع حتى وصول أول عرض سعر من متجر.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Listings",
          ar: "الإعلانات",
        },
        href: "/listings",
      },
      {
        label: {
          en: "Sell Requests",
          ar: "طلبات البيع",
        },
        href: "/sell-requests",
      },
      {
        label: {
          en: "Verifications",
          ar: "التوثيق",
        },
        href: "/verifications",
      },
    ],
  },
  listings: {
    purpose: {
      en: "Review traders' listings before they appear, and manage all listings.",
      ar: "مراجعة إعلانات التجار قبل ظهورها وإدارة كل الإعلانات.",
    },
    whoUses: ["moderator", "admin", "super_admin"],
    steps: [
      {
        en: "Open the “Review queue” (oldest first).",
        ar: "افتح «قائمة المراجعة» (الأقدم أولًا).",
      },
      {
        en: "Read the automatic alerts.",
        ar: "اقرأ التنبيهات ا��تلقائية.",
      },
      {
        en: "Open the listing and check the photos, purity, weight and price.",
        ar: "افتح الإعلان وراجع الصور والعيار والوزن والسعر.",
      },
      {
        en: "Accept, request changes (with a reason) or reject (with a reason).",
        ar: "قبول أو طلب تعديل (مع سبب) أو رفض (مع سبب).",
      },
      {
        en: "Tabs: Reported, Reserved, Ended, All.",
        ar: "تبويبات: مبلّغ عنه، محجوز، منتهي، الكل.",
      },
    ],
    rules: [
      {
        en: "Gold, bullion, diamonds and luxury watches are for traders only.",
        ar: "الذهب والسبائك والألماس والساعات الفاخرة للتجار فقط.",
      },
      {
        en: "Listings edited after acceptance go back to review.",
        ar: "الإعلانات التي عُدّلت بعد القبول تعود للمراجعة.",
      },
      {
        en: "The first 5 listings of any new store are reviewed manually.",
        ar: "أول 5 إعلانات لأي متجر جديد تُراجع يدويًا.",
      },
    ],
    terms: [
      {
        term: {
          en: "Review queue",
          ar: "قائمة المراجعة",
        },
        meaning: {
          en: "Listings waiting for a decision, oldest first.",
          ar: "إعلانات تنتظر قرارًا، الأقدم أولًا.",
        },
      },
      {
        term: {
          en: "Automatic alerts",
          ar: "التنبيهات التلقائية",
        },
        meaning: {
          en: "Warnings the system adds by itself: banned words, an unrealistic price or a new store.",
          ar: "تنبيهات يضيفها النظام تلقائيًا: كلمات محظورة، سعر غير منطقي، متجر جديد.",
        },
      },
      {
        term: {
          en: "Edited after approval",
          ar: "تم التعديل بعد القبول",
        },
        meaning: {
          en: "A listing that was changed after it was accepted. It goes back to the review queue.",
          ar: "إعلان تغيّر بعد قبوله، ويعود إلى قائمة المراجعة.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Stores",
          ar: "المتاجر",
        },
        href: "/stores",
      },
      {
        label: {
          en: "Reports",
          ar: "البلاغات",
        },
        href: "/reports",
      },
    ],
  },
  sellRequests: {
    purpose: {
      en: "Follow individuals' requests to sell their gold to traders.",
      ar: "متابعة طلبات الأفراد لبيع ذهبهم للتجار.",
    },
    whoUses: ["moderator", "admin", "super_admin"],
    steps: [
      {
        en: "Review the new request and check the photos and description.",
        ar: "راجع الطلب الجديد وتأكد من الصور والوصف.",
      },
      {
        en: "After acceptance it is sent to traders.",
        ar: "بعد القبول يُرسل للتجار.",
      },
      {
        en: "Follow the offers, the booking and the final price.",
        ar: "تابع العروض والحجز والسعر النهائي.",
      },
      {
        en: "Stores are ranked by how well they stick to their offers.",
        ar: "ترتيب المتاجر حسب الالتزام بالعرض.",
      },
    ],
    rules: [
      {
        en: "If the final price is lower than the offer, a reason is required (market price changed, weight lower on inspection, condition worse than the photos).",
        ar: "لو السعر النهائي أقل من العرض يجب ذكر السبب (تغير سعر السوق، الوزن أقل عند الفحص، الحالة أسوأ من الصور).",
      },
      {
        en: "A “Possible hidden trader” alert appears when one person sends many requests.",
        ar: "تنبيه «تاجر محتمل متخفٍ» عند طلبات كثيرة من نفس الشخص.",
      },
    ],
    terms: [
      {
        term: {
          en: "Possible hidden trader",
          ar: "تاجر محتمل متخفٍ",
        },
        meaning: {
          en: "A person sending many requests or items who may be a trader posing as an individual.",
          ar: "شخص يرسل طلبات أو قطعًا كثيرة وقد يكون تاجرًا يتصرف كفرد.",
        },
      },
      {
        term: {
          en: "Offer commitment",
          ar: "الالتزام بالعرض",
        },
        meaning: {
          en: "How closely a store sticks to the price it offered once it has inspected the item.",
          ar: "مدى التزام المتجر بالسعر الذي عرضه بعد فحص القطعة.",
        },
      },
      {
        term: {
          en: "Final price",
          ar: "السعر النهائي",
        },
        meaning: {
          en: "The price agreed after the in-store inspection. If it is lower than the offer, a reason is required.",
          ar: "السعر المتفق عليه بعد الفحص في المتجر. إن كان أقل من العرض يلزم ذكر السبب.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Stores",
          ar: "المتاجر",
        },
        href: "/stores",
      },
      {
        label: {
          en: "Users",
          ar: "المستخدمون",
        },
        href: "/users",
      },
    ],
  },
  market: {
    purpose: {
      en: "Individuals' listings in the personal market (6 sections, including prayer beads).",
      ar: "إعلانات الأفراد في السوق الشخصي (6 أقسام منها المسابح).",
    },
    whoUses: ["moderator", "admin", "super_admin"],
    steps: [],
    rules: [
      {
        en: "A maximum price per country.",
        ar: "حد أقصى للسعر لكل دولة.",
      },
      {
        en: "Luxury brands are not allowed for individuals.",
        ar: "الماركات الفاخرة ممنوعة على الأفراد.",
      },
      {
        en: "Prayer beads show “Unverified material” unless there is a certificate.",
        ar: "المسابح تظهر «خامة غير موثقة» إلا بشهادة.",
      },
    ],
    terms: [
      {
        term: {
          en: "Price cap",
          ar: "الحد الأقصى للسعر",
        },
        meaning: {
          en: "The highest price an individual may ask in a category. It is set per country.",
          ar: "أعلى سعر يُسمح للفرد بطلبه في القسم، ويُحدد لكل دولة.",
        },
      },
      {
        term: {
          en: "Unverified material",
          ar: "خامة غير موثقة",
        },
        meaning: {
          en: "Prayer beads whose material has no certificate to back it up.",
          ar: "مسبحة لا توجد شهادة تثبت خامتها.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Listings",
          ar: "الإعلانات",
        },
        href: "/listings",
      },
      {
        label: {
          en: "Reports",
          ar: "البلاغات",
        },
        href: "/reports",
      },
    ],
  },
  stores: {
    purpose: {
      en: "Manage stores, their plans and their branches.",
      ar: "إدارة المتاجر وباقاتها وفروعها.",
    },
    whoUses: ["verification_officer", "admin", "super_admin"],
    steps: [
      {
        en: "Suspend or resume a store.",
        ar: "إيقاف/استئناف المتجر.",
      },
      {
        en: "Grant featured credit.",
        ar: "منح رصيد مميز.",
      },
      {
        en: "Extend the trial.",
        ar: "تمديد التجربة.",
      },
      {
        en: "Approve a new branch.",
        ar: "الموافقة على فرع جديد.",
      },
    ],
    rules: [],
    terms: [
      {
        term: {
          en: "Free trial",
          ar: "التجربة المجانية",
        },
        meaning: {
          en: "The 14 days a newly accepted store gets at no cost before it subscribes.",
          ar: "أول 14 يومًا للمتجر المقبول حديثًا دون رسوم قبل أن يشترك.",
        },
      },
      {
        term: {
          en: "Grace period",
          ar: "فترة السماح",
        },
        meaning: {
          en: "The 7 days after a missed renewal before the store is suspended.",
          ar: "سبعة أيام بعد تأخر التجديد قبل إيقاف المتجر.",
        },
      },
      {
        term: {
          en: "Featured credit",
          ar: "رصيد مميز",
        },
        meaning: {
          en: "Credit a store spends to feature its listings above the others.",
          ar: "رصيد يصرفه المتجر لإبراز إعلاناته فوق غيرها.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Verifications",
          ar: "التوثيق",
        },
        href: "/verifications",
      },
      {
        label: {
          en: "Subscriptions",
          ar: "الاشتراكات",
        },
        href: "/subscriptions",
      },
    ],
  },
  users: {
    purpose: {
      en: "Manage accounts.",
      ar: "إدارة الحسابات.",
    },
    whoUses: ["support_agent", "verification_officer", "admin", "super_admin"],
    steps: [
      {
        en: "Send a warning.",
        ar: "إنذار.",
      },
      {
        en: "Suspend temporarily.",
        ar: "إيقاف مؤقت.",
      },
      {
        en: "Ban permanently.",
        ar: "حظر نهائي.",
      },
      {
        en: "Lift the penalty.",
        ar: "رفع العقوبة.",
      },
      {
        en: "Send a password-change link.",
        ar: "رابط تغيير كلمة السر.",
      },
      {
        en: "Force a sign-out.",
        ar: "تسجيل خروج إجباري.",
      },
      {
        en: "Convert the account to a store.",
        ar: "تحويل لمتجر.",
      },
      {
        en: "Add internal notes.",
        ar: "ملاحظات داخلية.",
      },
    ],
    rules: [
      {
        en: "Every action needs a reason and is logged.",
        ar: "كل إجراء يحتاج سببًا ويُسجل.",
      },
    ],
    terms: [
      {
        term: {
          en: "Warning",
          ar: "إنذار",
        },
        meaning: {
          en: "A recorded notice to the user. Repeated warnings move the penalty up.",
          ar: "تنبيه رسمي مسجّل للمستخدم، وتكراره يرفع العقوبة.",
        },
      },
      {
        term: {
          en: "Temporary suspension",
          ar: "إيقاف مؤقت",
        },
        meaning: {
          en: "The account is blocked for a set period and then comes back.",
          ar: "يُمنع الحساب لفترة محددة ثم يعود.",
        },
      },
      {
        term: {
          en: "Permanent ban",
          ar: "حظر نهائي",
        },
        meaning: {
          en: "The account is closed for good unless the penalty is lifted.",
          ar: "يُغلق الحساب نهائيًا ما لم تُرفع العقوبة.",
        },
      },
      {
        term: {
          en: "Forced sign-out",
          ar: "تسجيل خروج إجباري",
        },
        meaning: {
          en: "Ends the user's sessions on every device.",
          ar: "ينهي جلسات المستخدم على كل الأجهزة.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Reports",
          ar: "البلاغات",
        },
        href: "/reports",
      },
      {
        label: {
          en: "Verifications",
          ar: "التوثيق",
        },
        href: "/verifications",
      },
    ],
  },
  verifications: {
    purpose: {
      en: "Verify individuals' identity, store applications and licences.",
      ar: "التحقق من هوية الأفراد وطلبات المتاجر والرخص.",
    },
    whoUses: ["verification_officer", "admin", "super_admin"],
    steps: [
      {
        en: "The Identity tab only shows what was not auto-approved, with the check results (genuine document, liveness, face match, duplicate identity).",
        ar: "تبويب الهوية يعرض فقط ما لم يُقبل تلقائيًا مع نتائج الفحص (المستند أصلي، الحيوية، مطابقة الوجه، هوية مكررة).",
      },
      {
        en: "Store applications come with a checklist and a video call when needed.",
        ar: "طلبات المتاجر بقائمة تحقق ومكالمة فيديو عند الحاجة.",
      },
      {
        en: "Licences expiring within 30 days: send a reminder or suspend the store.",
        ar: "الرخص التي تنتهي خلال 30 يومًا: إرسال تذكير أو إيقاف المتجر.",
      },
    ],
    rules: [
      {
        en: "Verification is free and mandatory.",
        ar: "التوثيق مجاني وإلزامي.",
      },
      {
        en: "The ID number is hidden and shown with a “Show” button. Every reveal is logged.",
        ar: "رقم الهوية مخفي ويظهر بزر «إظهار» ويُسجل.",
      },
      {
        en: "Anyone under 18 is rejected.",
        ar: "أقل من 18 سنة يُرفض.",
      },
    ],
    terms: [
      {
        term: {
          en: "Auto-approved",
          ar: "قبول تلقائي",
        },
        meaning: {
          en: "An identity that passed every automatic check and was accepted without a person.",
          ar: "هوية اجتازت كل الفحوص التلقائية وقُبلت دون تدخل بشري.",
        },
      },
      {
        term: {
          en: "Genuine document",
          ar: "المستند أصلي",
        },
        meaning: {
          en: "The ID document is real, not a copy or an edited image.",
          ar: "وثيقة الهوية حقيقية وليست نسخة أو صورة معدّلة.",
        },
      },
      {
        term: {
          en: "Liveness",
          ar: "الحيوية",
        },
        meaning: {
          en: "The person in front of the camera is live, not a photo or a video.",
          ar: "الشخص أمام الكاميرا حيّ وليس صورة أو فيديو.",
        },
      },
      {
        term: {
          en: "Face match",
          ar: "مطابقة الوجه",
        },
        meaning: {
          en: "The selfie matches the photo on the ID document.",
          ar: "صورة السيلفي تطابق الصورة على وثيقة الهوية.",
        },
      },
      {
        term: {
          en: "Duplicate identity",
          ar: "هوية مكررة",
        },
        meaning: {
          en: "The same ID number is already used by another account.",
          ar: "رقم الهوية نفسه مستخدم في حساب آخر.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Stores",
          ar: "المتاجر",
        },
        href: "/stores",
      },
      {
        label: {
          en: "Users",
          ar: "المستخدمون",
        },
        href: "/users",
      },
    ],
  },
  reports: {
    purpose: {
      en: "Handle user reports on listings, users, messages and stores.",
      ar: "التعامل مع بلاغات المستخدمين على الإعلانات والمستخدمين والرسائل والمتاجر.",
    },
    whoUses: ["moderator", "admin", "super_admin"],
    steps: [
      {
        en: "Reports on the same target are grouped into one case.",
        ar: "البلاغات على نفس الهدف تتجمع في قضية واحدة.",
      },
      {
        en: "High priority comes first: fake or stolen item, fraud, or 3 or more reports.",
        ar: "الأولوية العالية أولًا: مزيف/مسروق، احتيال، أو 3 بلاغات فأكثر.",
      },
      {
        en: "Open the case to see the target, the reports, the chat context and the deal stages.",
        ar: "افتح القضية لترى الهدف والبلاغات وسياق المحادثة ومراحل الصفقة.",
      },
      {
        en: "Dismiss (with a reason) or confirm.",
        ar: "رفض (مع سبب) أو تأكيد.",
      },
      {
        en: "Actions: delete the listing, warn, suspend, ban.",
        ar: "الإجراءات: حذف الإعلان، إنذار، إيقاف، حظر.",
      },
    ],
    rules: [
      {
        en: "3 confirmed reports = a warning.",
        ar: "3 بلاغات مؤكدة = إنذار.",
      },
      {
        en: "5 confirmed reports = a 30-day suspension.",
        ar: "5 بلاغات مؤكدة = إيقاف 30 يومًا.",
      },
      {
        en: "A fake or stolen grade = a permanent ban is suggested.",
        ar: "العيار المزيف أو المسروق = يُقترح حظر نهائي.",
      },
      {
        en: "A reporter whose reports are often dismissed is marked “Low-quality reporter”.",
        ar: "المُبلِّغ الذي تُرفض بلاغاته كثيرًا يُعلَّم «مُبلِّغ منخفض الجودة».",
      },
      {
        en: "Reply within 24 hours.",
        ar: "مهلة الرد 24 ساعة.",
      },
    ],
    terms: [
      {
        term: {
          en: "Report case",
          ar: "قضية بلاغ",
        },
        meaning: {
          en: "All reports about the same listing, user, message or store, grouped into one case. The case counts once, however many people reported it.",
          ar: "كل البلاغات على نفس الإعلان أو المستخدم أو الرسالة أو المتجر تُجمع في قضية واحدة. تُحسب القضية مرة واحدة مهما كان عدد المُبلِّغين.",
        },
      },
      {
        term: {
          en: "24-hour deadline",
          ar: "مهلة 24 ساعة",
        },
        meaning: {
          en: "The time allowed for the first decision or reply: 24 hours from when the report or ticket arrives.",
          ar: "الوقت المسموح للقرار أو الرد الأول: 24 ساعة من وصول البلاغ أو التذكرة.",
        },
      },
      {
        term: {
          en: "Warning",
          ar: "إنذار",
        },
        meaning: {
          en: "A recorded notice to the user. Repeated warnings move the penalty up.",
          ar: "تنبيه رسمي مسجّل للمستخدم، وتكراره يرفع العقوبة.",
        },
      },
      {
        term: {
          en: "Temporary suspension",
          ar: "إيقاف مؤقت",
        },
        meaning: {
          en: "The account is blocked for a set period and then comes back.",
          ar: "يُمنع الحساب لفترة محددة ثم يعود.",
        },
      },
      {
        term: {
          en: "Permanent ban",
          ar: "حظر نهائي",
        },
        meaning: {
          en: "The account is closed for good unless the penalty is lifted.",
          ar: "يُغلق الحساب نهائيًا ما لم تُرفع العقوبة.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Users",
          ar: "المستخدمون",
        },
        href: "/users",
      },
      {
        label: {
          en: "Listings",
          ar: "الإعلانات",
        },
        href: "/listings",
      },
      {
        label: {
          en: "Support",
          ar: "الدعم",
        },
        href: "/support",
      },
    ],
  },
  support: {
    purpose: {
      en: "Reply to user tickets.",
      ar: "الرد على تذاكر المستخدمين.",
    },
    whoUses: ["support_agent", "admin", "super_admin"],
    steps: [
      {
        en: "Gold and Diamond VIP tickets come first.",
        ar: "تذاكر الذهب والماس VIP أولًا.",
      },
      {
        en: "Use the ready replies and edit them.",
        ar: "استخدم الردود الجاهزة وعدّل عليها.",
      },
      {
        en: "Internal notes are never shown to the user.",
        ar: "الملاحظات الداخلية لا يراها المستخدم.",
      },
      {
        en: "Merge duplicate tickets.",
        ar: "دمج التذاكر المكررة.",
      },
      {
        en: "Turn a ticket into a report when there is a violation.",
        ar: "تحويل التذكرة لبلاغ عند وجود مخالفة.",
      },
    ],
    rules: [
      {
        en: "Reply within 24 hours.",
        ar: "مهلة الرد 24 ساعة.",
      },
    ],
    terms: [
      {
        term: {
          en: "24-hour deadline",
          ar: "مهلة 24 ساعة",
        },
        meaning: {
          en: "The time allowed for the first decision or reply: 24 hours from when the report or ticket arrives.",
          ar: "الوقت المسموح للقرار أو الرد الأول: 24 ساعة من وصول البلاغ أو التذكرة.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Reports",
          ar: "البلاغات",
        },
        href: "/reports",
      },
      {
        label: {
          en: "Users",
          ar: "المستخدمون",
        },
        href: "/users",
      },
    ],
  },
  subscriptions: {
    purpose: {
      en: "Follow store plans.",
      ar: "متابعة باقات المتاجر.",
    },
    whoUses: ["finance", "admin", "super_admin"],
    steps: [
      {
        en: "States: free trial, active, grace period, suspended (plan lowered), cancelled, expired, refunded.",
        ar: "الحالات: فترة تجريبية، نشط، فترة سماح، موقوف (تخفيض الباقة)، ملغي، منتهي، مسترجع.",
      },
    ],
    rules: [
      {
        en: "One 14-day trial per store.",
        ar: "تجربة 14 يومًا مرة واحدة لكل متجر.",
      },
      {
        en: "A refund is possible within 7 days, for the first paid subscription only.",
        ar: "الاسترجاع خلال 7 أيام لأول اشتراك مدفوع فقط.",
      },
      {
        en: "A failed renewal gives a 7-day grace period, then suspension.",
        ar: "فشل التجديد = فترة سماح 7 أيام ثم إيقاف.",
      },
      {
        en: "When a plan is lowered, extra listings stop showing but are not deleted. They come back on upgrade.",
        ar: "عند التخفيض تتوقف الإعلانات الزائدة ولا تُحذف، وترجع عند الترقية.",
      },
    ],
    terms: [
      {
        term: {
          en: "Free trial",
          ar: "التجربة المجانية",
        },
        meaning: {
          en: "The 14 days a newly accepted store gets at no cost before it subscribes.",
          ar: "أول 14 يومًا للمتجر المقبول حديثًا دون رسوم قبل أن يشترك.",
        },
      },
      {
        term: {
          en: "Grace period",
          ar: "فترة السماح",
        },
        meaning: {
          en: "The 7 days after a missed renewal before the store is suspended.",
          ar: "سبعة أيام بعد تأخر التجديد قبل إيقاف المتجر.",
        },
      },
      {
        term: {
          en: "Refund (first subscription only)",
          ar: "الاسترجاع (أول اشتراك فقط)",
        },
        meaning: {
          en: "A store can be refunded within 7 days, and only for its first paid subscription.",
          ar: "يمكن استرجاع المبلغ للمتجر خلال 7 أيام ولأول اشتراك مدفوع فقط.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Stores",
          ar: "المتاجر",
        },
        href: "/stores",
      },
      {
        label: {
          en: "Revenue",
          ar: "الإيرادات",
        },
        href: "/revenue",
      },
      {
        label: {
          en: "Settings",
          ar: "الإعدادات",
        },
        href: "/settings",
      },
    ],
  },
  boosts: {
    purpose: {
      en: "The log of boosts (bump, featured for 7 days, pinned in a section) and plan credit.",
      ar: "سجل الترويج (رفع، مميز 7 أيام، مثبت في القسم) ورصيد الباقات.",
    },
    whoUses: ["finance", "admin", "super_admin"],
    steps: [
      {
        en: "End a boost early.",
        ar: "إنهاء الترويج مبكرًا.",
      },
      {
        en: "Refund a boost.",
        ar: "استرجاع مبلغ الترويج.",
      },
      {
        en: "Grant a free boost.",
        ar: "منح ترويج مجاني.",
      },
      {
        en: "Every one of these needs a reason.",
        ar: "كل إجراء منها يتطلب سببًا.",
      },
    ],
    rules: [
      {
        en: "Free boosts are not counted as revenue and do not use plan credits.",
        ar: "الترويج المجاني لا يُحسب إيرادًا ولا يستهلك رصيد الباقة.",
      },
    ],
    terms: [
      {
        term: {
          en: "Plan credit",
          ar: "رصيد الباقة",
        },
        meaning: {
          en: "Boost credits that come with a store's plan and renew every month. They pay for bumping, featuring and pinning at no extra charge.",
          ar: "رصيد ترويج يأتي مع باقة المتجر ويتجدد كل شهر. يُستخدم للتحديث والتمييز والتثبيت دون رسوم إضافية.",
        },
      },
      {
        term: {
          en: "Featured credit",
          ar: "رصيد مميز",
        },
        meaning: {
          en: "Credit a store spends to feature its listings above the others.",
          ar: "رصيد يصرفه المتجر لإبراز إعلاناته فوق غيرها.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Subscriptions",
          ar: "الاشتراكات",
        },
        href: "/subscriptions",
      },
      {
        label: {
          en: "Revenue",
          ar: "الإيرادات",
        },
        href: "/revenue",
      },
    ],
  },
  revenue: {
    purpose: {
      en: "Income for each country and currency.",
      ar: "الدخل لكل دولة وعملة.",
    },
    whoUses: ["finance", "admin", "super_admin"],
    steps: [
      {
        en: "Check the failed payments queue: retry the payment or contact the store.",
        ar: "راجع طابور المدفوعات الفاشلة: أعد المحاولة أو تواصل مع المتجر.",
      },
      {
        en: "Open an invoice to see its tax for the country.",
        ar: "افتح الفاتورة لترى الضريبة حسب الدولة.",
      },
    ],
    rules: [
      {
        en: "Different currencies are never added together.",
        ar: "لا تُجمع العملات المختلفة.",
      },
      {
        en: "The dollar conversion is an estimate.",
        ar: "التحويل للدولار تقديري.",
      },
      {
        en: "Verification cost is a cost, not revenue.",
        ar: "تكلفة التوثيق تكلفة وليست إيرادًا.",
      },
      {
        en: "Net = revenue − refunds − provider costs.",
        ar: "الصافي = الإيراد − الاسترجاع − تكاليف المزوّد.",
      },
      {
        en: "The platform never receives the price of the items. The sale happens at the store.",
        ar: "المنصة لا تستلم ثمن القطع، والبيع يتم في المتجر.",
      },
    ],
    terms: [
      {
        term: {
          en: "Net",
          ar: "الصافي",
        },
        meaning: {
          en: "Revenue minus refunds minus provider costs.",
          ar: "الإيراد ناقص الاسترجاع ناقص تكاليف المزوّد.",
        },
      },
      {
        term: {
          en: "Monthly recurring revenue (MRR)",
          ar: "الإيراد الشهري المتكرر",
        },
        meaning: {
          en: "What active paid subscriptions bring in each month, shown per currency.",
          ar: "ما تدرّه الاشتراكات المدفوعة النشطة كل شهر، معروضًا لكل عملة.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Subscriptions",
          ar: "الاشتراكات",
        },
        href: "/subscriptions",
      },
      {
        label: {
          en: "Boosts",
          ar: "الترويج",
        },
        href: "/boosts",
      },
    ],
  },
  metalPrices: {
    purpose: {
      en: "The live gold, silver and platinum prices the site shows.",
      ar: "الأسعار اللحظية للذهب والفضة والبلاتين التي يعرضها الموقع.",
    },
    whoUses: ["admin", "super_admin"],
    steps: [
      {
        en: "Watch the last sync. It is marked “Stale” after 15 minutes.",
        ar: "تابع آخر مزامنة، وتُعلَّم «قديم» بعد 15 دقيقة.",
      },
      {
        en: "Set the margin for each country and grade.",
        ar: "اضبط الهامش لكل دولة وعيار.",
      },
      {
        en: "Review the held prices.",
        ar: "راجع الأسعار المعلّقة.",
      },
      {
        en: "A manual price needs a reason and an end time.",
        ar: "السعر اليدوي يحتاج سببًا ومدة انتهاء.",
      },
      {
        en: "Check the market hours.",
        ar: "راجع مواعيد السوق.",
      },
    ],
    rules: [
      {
        en: "Any change bigger than 3% is held for review.",
        ar: "أي تغيير أكبر من 3% يُعلَّق للمراجعة.",
      },
      {
        en: "When the market is closed, the site shows the last price and its time.",
        ar: "عند إغلاق السوق يعرض الموقع آخر سعر ووقته.",
      },
    ],
    terms: [
      {
        term: {
          en: "Margin",
          ar: "الهامش",
        },
        meaning: {
          en: "What the site adds on top of the base metal price for each grade, as a percent or a fixed amount per gram. It is set per country.",
          ar: "ما يضيفه الموقع فوق سعر المعدن الأساسي لكل عيار، كنسبة مئوية أو مبلغ ثابت للجرام، ويُحدد لكل دولة.",
        },
      },
      {
        term: {
          en: "3% protection",
          ar: "حماية 3%",
        },
        meaning: {
          en: "Any price move bigger than 3% is held for review instead of going live, so a wrong feed cannot reach the site.",
          ar: "أي تغيّر في السعر يزيد على 3% يُعلَّق للمراجعة بدل أن يظهر مباشرة، فلا تصل بيانات خاطئة إلى الموقع.",
        },
      },
      {
        term: {
          en: "Stale",
          ar: "قديم",
        },
        meaning: {
          en: "The last price sync is more than 15 minutes old.",
          ar: "مرّ أكثر من 15 دقيقة على آخر مزامنة للأسعار.",
        },
      },
      {
        term: {
          en: "Manual price",
          ar: "سعر يدوي",
        },
        meaning: {
          en: "A price set by hand that replaces the live feed until the time you choose. A reason is required.",
          ar: "سعر يُحدَّد يدويًا ويحل محل السعر اللحظي حتى الوقت الذي تختاره. يلزم ذكر السبب.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Settings",
          ar: "الإعدادات",
        },
        href: "/settings",
      },
      {
        label: {
          en: "Audit Log",
          ar: "سجل العمليات",
        },
        href: "/audit-log",
      },
    ],
  },
  notifications: {
    purpose: {
      en: "Send bulk notifications and manage the automatic ones.",
      ar: "إرسال إشعارات جماعية وإدارة الإشعارات التلقائية.",
    },
    whoUses: ["admin", "super_admin"],
    steps: [
      {
        en: "Write the title and text in Arabic and English.",
        ar: "اكتب العنوان والنص بالعربي والإنجليزي.",
      },
      {
        en: "Choose the channel, country and segment, then check the expected count.",
        ar: "اختر القناة والدولة والشريحة وراجع العدد المتوقع.",
      },
      {
        en: "Send now or schedule.",
        ar: "أرسل الآن أو جدول.",
      },
    ],
    rules: [
      {
        en: "No instant notifications from 11 pm to 8 am in the country’s time.",
        ar: "لا إشعارات فورية من 11 مساءً حتى 8 صباحًا بتوقيت الدولة.",
      },
      {
        en: "A country marked “Coming soon” only reaches its waitlist.",
        ar: "الدول «قريبًا» يُرسل لقائمة انتظارها فقط.",
      },
    ],
    terms: [
      {
        term: {
          en: "Quiet hours",
          ar: "ساعات الهدوء",
        },
        meaning: {
          en: "No instant notifications from 11 pm to 8 am in the user's own country time. They wait until morning.",
          ar: "لا إشعارات فورية من 11 مساءً حتى 8 صباحًا بتوقيت بلد المستخدم، وتنتظر حتى الصباح.",
        },
      },
      {
        term: {
          en: "Waitlist",
          ar: "قائمة الانتظار",
        },
        meaning: {
          en: "People who signed up for a country marked “Coming soon”. Notifications for that country go only to its waitlist.",
          ar: "من سجّلوا اهتمامهم بدولة «قريبًا». إشعارات هذه الدولة تُرسل لقائمة انتظارها فقط.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Settings",
          ar: "الإعدادات",
        },
        href: "/settings",
      },
      {
        label: {
          en: "Users",
          ar: "المستخدمون",
        },
        href: "/users",
      },
    ],
  },
  cms: {
    purpose: {
      en: "The fixed pages (About, FAQ, Terms, Privacy, How it works), the lists and the sections.",
      ar: "الصفحات الثابتة (من نحن، الأسئلة الشائعة، الشروط، الخصوصية، كيف يعمل) والقوائم والأقسام.",
    },
    whoUses: ["admin", "super_admin"],
    steps: [],
    rules: [
      {
        en: "Every page needs Arabic and English before it is published.",
        ar: "كل صفحة بالعربي والإنجليزي قبل النشر.",
      },
    ],
    terms: [],
    related: [
      {
        label: {
          en: "Notifications",
          ar: "الإشعارات",
        },
        href: "/notifications",
      },
    ],
  },
  site: {
    purpose: {
      en: "Control what visitors see on the public site: home page, banners, SEO, contact details and message templates.",
      ar: "تحكم بما يراه الزوار في الموقع: الصفحة الرئيسية واللافتات والسيو وبيانات التواصل وقوالب الرسائل.",
    },
    whoUses: ["admin", "super_admin"],
    steps: [
      {
        en: "Edit a tab. Changes stay in a draft and visitors do not see them yet.",
        ar: "عدّل أي تبويب. التغييرات تبقى مسودة ولا يراها الزوار بعد.",
      },
      {
        en: "Check the preview and fix any issue shown at the top.",
        ar: "راجع المعاينة وأصلح أي ملاحظة تظهر في الأعلى.",
      },
      {
        en: "Press Publish now, or schedule it for later.",
        ar: "اضغط انشر الآن، أو حدد موعداً لاحقاً.",
      },
    ],
    rules: [
      {
        en: "Every text needs Arabic and English.",
        ar: "كل نص يحتاج العربية والإنجليزية.",
      },
      {
        en: "Publishing is recorded in the Audit Log.",
        ar: "يُسجَّل النشر في سجل العمليات.",
      },
    ],
    terms: [],
    related: [
      {
        label: {
          en: "CMS",
          ar: "إدارة المحتوى",
        },
        href: "/cms",
      },
      {
        label: {
          en: "Audit Log",
          ar: "سجل العمليات",
        },
        href: "/audit-log",
      },
    ],
  },
  roles: {
    purpose: {
      en: "Decide what each role sees and does, and in which country.",
      ar: "تحديد ما يراه وما يفعله كل دور، وفي أي دولة.",
    },
    whoUses: ["super_admin"],
    steps: [
      {
        en: "Roles: Super Admin, Admin, Moderator, Verification Officer, Finance, Support Agent.",
        ar: "الأدوار: مدير عام، مدير، مشرف، مسؤول توثيق، المالية، موظف دعم.",
      },
    ],
    rules: [],
    terms: [],
    related: [
      {
        label: {
          en: "Users",
          ar: "المستخدمون",
        },
        href: "/users",
      },
      {
        label: {
          en: "Audit Log",
          ar: "سجل العمليات",
        },
        href: "/audit-log",
      },
    ],
  },
  auditLog: {
    purpose: {
      en: "Every admin action is recorded: who, when, what, before and after, and the reason.",
      ar: "كل إجراء في الأدمن مسجّل: من، متى، ماذا، قبل/بعد، والسبب.",
    },
    whoUses: ["admin", "super_admin"],
    steps: [],
    rules: [
      {
        en: "The log cannot be edited or deleted.",
        ar: "لا يمكن تعديل السجل أو حذفه.",
      },
    ],
    terms: [],
    related: [
      {
        label: {
          en: "Roles",
          ar: "الأدوار",
        },
        href: "/roles",
      },
      {
        label: {
          en: "Users",
          ar: "المستخدمون",
        },
        href: "/users",
      },
    ],
  },
  settings: {
    purpose: {
      en: "The platform rules.",
      ar: "قواعد المنصة.",
    },
    whoUses: ["super_admin"],
    steps: [
      {
        en: "Countries: live, coming soon or hidden, currency, tax, time zone and waitlist. Launch a country with a checklist.",
        ar: "الدول: مباشر / قريبًا / مخفي، العملة، الضريبة، التوقيت، قائمة الانتظار. تشغيل دولة بقائمة تحقق.",
      },
      {
        en: "Plans and prices for each country.",
        ar: "الباقات والأسعار لكل دولة.",
      },
      {
        en: "Durations and limits.",
        ar: "المدد والحدود.",
      },
      {
        en: "Review rules.",
        ar: "قواعد المراجعة.",
      },
      {
        en: "Penalties.",
        ar: "العقوبات.",
      },
      {
        en: "Security and compliance.",
        ar: "الأمان والامتثال.",
      },
      {
        en: "Quiet hours.",
        ar: "ساعات الهدوء.",
      },
    ],
    rules: [
      {
        en: "A price change applies to new subscriptions only.",
        ar: "تغيير السعر يُطبَّق على الاشتراكات الجديدة فقط.",
      },
    ],
    terms: [
      {
        term: {
          en: "Quiet hours",
          ar: "ساعات الهدوء",
        },
        meaning: {
          en: "No instant notifications from 11 pm to 8 am in the user's own country time. They wait until morning.",
          ar: "لا إشعارات فورية من 11 مساءً حتى 8 صباحًا بتوقيت بلد المستخدم، وتنتظر حتى الصباح.",
        },
      },
      {
        term: {
          en: "Waitlist",
          ar: "قائمة الانتظار",
        },
        meaning: {
          en: "People who signed up for a country marked “Coming soon”. Notifications for that country go only to its waitlist.",
          ar: "من سجّلوا اهتمامهم بدولة «قريبًا». إشعارات هذه الدولة تُرسل لقائمة انتظارها فقط.",
        },
      },
      {
        term: {
          en: "Grace period",
          ar: "فترة السماح",
        },
        meaning: {
          en: "The 7 days after a missed renewal before the store is suspended.",
          ar: "سبعة أيام بعد تأخر التجديد قبل إيقاف المتجر.",
        },
      },
    ],
    related: [
      {
        label: {
          en: "Subscriptions",
          ar: "الاشتراكات",
        },
        href: "/subscriptions",
      },
      {
        label: {
          en: "Notifications",
          ar: "الإشعارات",
        },
        href: "/notifications",
      },
    ],
  },
  analytics: {
    purpose: {
      en: "User behaviour, search, sections and devices, to help product decisions.",
      ar: "سلوك المستخدمين والبحث والأقسام والأجهزة لاتخاذ قرارات المنتج.",
    },
    whoUses: ["admin", "super_admin", "finance"],
    steps: [],
    rules: [],
    terms: [],
    related: [
      {
        label: {
          en: "Overview",
          ar: "نظرة عامة",
        },
        href: "/",
      },
    ],
  },
};
