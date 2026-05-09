export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  category: string
  images: string[]
  availability: boolean
  seller: string
}

export interface FreeItem {
  id: string
  title: string
  description: string
  icon: string
  link?: string
}

export const categories = [
  'الكل',
  'إلكترونيات',
  'برامج وتطبيقات',
  'خدمات رقمية',
  'ملابس وإكسسوارات',
  'أدوات ومعدات',
  'كتب ودورات',
  'أخرى',
]

export const products: Product[] = [
  {
    id: '1',
    name: 'سماعة بلوتوث فاخرة Elite Pro',
    description: 'سماعة لاسلكية بتقنية بلوتوث 5.3، صوت نقي مع إلغاء الضوضاء النشط، بطارية تدوم حتى 30 ساعة، تصميم أنيق ومريح.',
    price: 2500,
    salePrice: 1899,
    category: 'إلكترونيات',
    images: ['/products/product-1.webp'],
    availability: true,
    seller: 'متجر النخبة',
  },
  {
    id: '2',
    name: 'ساعة ذكية VIP Series X',
    description: 'ساعة ذكية بشاشة AMOLED، مراقبة صحية متقدمة، مقاومة للماء، تتبع GPS مدمج، بطارية تدوم 7 أيام.',
    price: 3500,
    category: 'إلكترونيات',
    images: ['/products/product-2.webp'],
    availability: true,
    seller: 'متجر النخبة',
  },
  {
    id: '3',
    name: 'كورس التداول الاحترافي',
    description: 'دورة شاملة في تداول العملات والعملات الرقمية، تشمل أكثر من 50 درس فيديو، استراتيجيات متقدمة، ودعم مباشر.',
    price: 500,
    salePrice: 299,
    category: 'كتب ودورات',
    images: ['/products/product-3.webp'],
    availability: true,
    seller: 'أكاديمية النخبة',
  },
  {
    id: '4',
    name: 'بور شارجر سريع 65W',
    description: 'شاحن بور ديليفري سريع 65 واط، يدعم جميع الأجهزة، مع حماية متقدمة من الحرارة والتفريغ الزائد.',
    price: 450,
    salePrice: 350,
    category: 'إلكترونيات',
    images: ['/products/product-4.webp'],
    availability: true,
    seller: 'متجر النخبة',
  },
  {
    id: '5',
    name: 'اشتراك VPN Premium - سنة كاملة',
    description: 'اشتراك VPN سنة كامل، اتصال سريع ومستقر، أكثر من 50 دولة، لا سجلات، دعم جميع الأجهزة.',
    price: 1200,
    salePrice: 799,
    category: 'برامج وتطبيقات',
    images: ['/products/product-5.webp'],
    availability: true,
    seller: 'خدمات رقمية برو',
  },
  {
    id: '6',
    name: 'حقيبة جلد طبيعي فاخرة',
    description: 'حقيبة من الجلد الطبيعي بتصميم كلاسيكي، مناسبة للعمل والسفر، مقاومة للماء، مع حماية للاب توب حتى 15 بوصة.',
    price: 1800,
    category: 'ملابس وإكسسوارات',
    images: ['/products/product-6.webp'],
    availability: true,
    seller: 'أناقة VIP',
  },
  {
    id: '7',
    name: 'ماوس لاسلكي ميكانيكي للجيمرز',
    description: 'ماوس ألعاب لاسلكي بمستشعر دقة 16000 DPI، أزرار قابلة للبرمجة، وزن قابل للتعديل، إضاءة RGB.',
    price: 650,
    salePrice: 499,
    category: 'إلكترونيات',
    images: ['/products/product-7.webp'],
    availability: true,
    seller: 'متجر النخبة',
  },
  {
    id: '8',
    name: 'حزمة أدوات التصميم الاحترافية',
    description: 'مجموعة كاملة من أدوات التصميم تشمل فرش مخصصة، قوالب، خطوط، وأيقونات للاستخدام التجاري.',
    price: 350,
    category: 'برامج وتطبيقات',
    images: ['/products/product-8.webp'],
    availability: true,
    seller: 'ديزاين برو',
  },
  {
    id: '9',
    name: 'نظارات حماية للشاشات',
    description: 'نظارات بفلتر الأزرق لحماية العينين من إشعاع الشاشات، إطار خفيف ومريح للارتداء الطويل.',
    price: 280,
    category: 'إلكترونيات',
    images: ['/products/product-9.webp'],
    availability: true,
    seller: 'متجر النخبة',
  },
  {
    id: '10',
    name: 'كتاب أسرار الربح من الإنترنت',
    description: 'دليل شامل يغطي أكثر من 20 طريقة مجربة للربح من الإنترنت، مع أمثلة حقيقية وخطط عمل مفصلة.',
    price: 150,
    salePrice: 89,
    category: 'كتب ودورات',
    images: ['/products/product-10.webp'],
    availability: true,
    seller: 'مكتبة النخبة',
  },
  {
    id: '11',
    name: 'طقم أدوات متعددة الاستخدام',
    description: 'طقم 42 قطعة أدوات يدوية متعددة الاستخدامات، مصنوعة من الفولاذ المقاوم للصدأ، بحقيبة حمل متينة.',
    price: 890,
    salePrice: 650,
    category: 'أدوات ومعدات',
    images: ['/products/product-11.webp'],
    availability: true,
    seller: 'متجر النخبة',
  },
  {
    id: '12',
    name: 'باور بانك 20000mAh',
    description: 'بطارية خارجية سعة 20000 مللي أمبير، شحن سريع 22.5W، يمكن شحن جهازين في نفس الوقت، شاشة LED.',
    price: 550,
    salePrice: 399,
    category: 'إلكترونيات',
    images: ['/products/product-12.webp'],
    availability: true,
    seller: 'متجر النخبة',
  },
]

export const appsData: FreeItem[] = [
  {
    id: 'app-1',
    title: 'تطبيق إدارة المهام الذكية',
    description: 'تطبيق متقدم لإدارة المهام اليومية مع ذكاء اصطناعي لترتيب الأولويات وتذكيرات ذكية.',
    icon: '',
    link: '#',
  },
  {
    id: 'app-2',
    title: 'محرر الصور الاحترافي',
    description: 'محرر صور قوي بفلتر احترافية وأدوات تعديل متقدمة، يعمل بدون إنترنت.',
    icon: '',
    link: '#',
  },
  {
    id: 'app-3',
    title: 'تطبيق تعلم اللغات',
    description: 'تطبيق تفاعلي لتعلم اللغات بطريقة ممتعة مع دروس يومية وممارسة المحادثة.',
    icon: '',
    link: '#',
  },
  {
    id: 'app-4',
    title: 'ماسح PDF متقدم',
    description: 'تطبيق لمسح المستندات وتحويلها إلى PDF عالي الجودة مع التعرف على النصوص OCR.',
    icon: '',
    link: '#',
  },
  {
    id: 'app-5',
    title: 'تطبيق اللياقة البدنية',
    description: 'برنامج تمارين شخصي مع متتبع للتمارين والسعرات والماء، يشمل فيديوهات تعليمية.',
    icon: '',
    link: '#',
  },
  {
    id: 'app-6',
    title: 'تطبيق الميزانية الشخصية',
    description: 'تطبيق لتنظيم المصاريف والميزانية مع رسوم بيانية وتقارير مفصلة.',
    icon: '',
    link: '#',
  },
]

export const aiToolsData: FreeItem[] = [
  {
    id: 'ai-1',
    title: 'ChatGPT - مساعد ذكي',
    description: 'أقوى مساعد ذكاء اصطناعي للدردشة والكتابة، يساعد في المحتوى والأكواد والأفكار.',
    icon: '',
    link: 'https://chat.openai.com',
  },
  {
    id: 'ai-2',
    title: 'Midjourney - توليد الصور',
    description: 'أداة لإنشاء صور فنية مذهلة باستخدام الذكاء الاصطناعي من وصف نصي.',
    icon: '',
    link: 'https://midjourney.com',
  },
  {
    id: 'ai-3',
    title: 'Canva AI - التصميم الذكي',
    description: 'منصة تصميم مجانية مع أدوات ذكاء اصطناعي لإنشاء تصاميم احترافية بسهولة.',
    icon: '',
    link: 'https://canva.com',
  },
  {
    id: 'ai-4',
    title: 'Gamma AI - عروض تقديمية',
    description: 'إنشاء عروض تقديمية ومواقع ويب احترافية بالذكاء الاصطناعي في ثوانٍ.',
    icon: '',
    link: 'https://gamma.app',
  },
  {
    id: 'ai-5',
    title: 'Notion AI - إدارة المعرفة',
    description: 'أداة متكاملة لإدارة الملاحظات والمشاريع مع مساعد ذكاء اصطناعي مدمج.',
    icon: '',
    link: 'https://notion.so',
  },
  {
    id: 'ai-6',
    title: 'ElevenLabs - توليد الأصوات',
    description: 'تحويل النص إلى كلام بشري طبيعي بأصوات متعددة اللغات.',
    icon: '',
    link: 'https://elevenlabs.io',
  },
]

export const academyData: FreeItem[] = [
  {
    id: 'academy-1',
    title: 'أساسيات التداول في الأسواق المالية',
    description: 'تعلم أساسيات التحليل الفني والأساسي، فهم الشموع اليابانية، وتحديد نقاط الدخول والخروج.',
    icon: '',
  },
  {
    id: 'academy-2',
    title: 'تداول العملات الرقمية للمبتدئين',
    description: 'دليل شامل لفهم العملات الرقمية، البلوكتشين، وبدء التداول بأمان.',
    icon: '',
  },
  {
    id: 'academy-3',
    title: 'إدارة المخاطر والرأس المال',
    description: 'تعلم كيفية حماية رأس المال، تحديد حجم الصفقة، واستراتيجيات إدارة المخاطر.',
    icon: '',
  },
  {
    id: 'academy-4',
    title: 'التحليل النفسي للمتداول',
    description: 'فهم سيكولوجية التداول، التحكم في المشاعر، وبناء الانضباط التجاري.',
    icon: '',
  },
]

export const earningData: FreeItem[] = [
  {
    id: 'earning-1',
    title: 'التسويق بالعمولة (Affiliate Marketing)',
    description: 'ربح العمولات من الترويج لمنتجات وخدمات الآخرين عبر الإنترنت.',
    icon: '',
  },
  {
    id: 'earning-2',
    title: 'صناعة المحتوى و اليوتيوب',
    description: 'إنشاء محتوى فيديو جذاب على يوتيوب والربح من الإعلانات والرعايات.',
    icon: '',
  },
  {
    id: 'earning-3',
    title: 'البيع أونلاين (التجارة الإلكترونية)',
    description: 'افتتاح متجر إلكتروني وبيع المنتجات محلياً وعالمياً عبر المنصات.',
    icon: '',
  },
  {
    id: 'earning-4',
    title: 'العمل الحر (Freelancing)',
    description: 'تقديم خدماتك المهنية عبر منصات العمل الحر مثل التصميم والبرمجة والكتابة.',
    icon: ''
  },
  {
    id: 'earning-5',
    title: 'أفكار مشاريع ناجحة',
    description: 'مجموعة أفكار مشاريع صغيرة ومتوسطة يمكن تنفيذها بأقل رأس مال.',
    icon: '',
  },
  {
    id: 'earning-6',
    title: 'استراتيجيات الربح المتقدم',
    description: 'خطط واستراتيجيات متقدمة لتضاعف دخلك من الإنترنت بشكل مستدام.',
    icon: '',
  },
]

// ── Services Data ──────────────────────────────────────────

export interface ServiceItem {
  id: string
  title: string
  description: string
  icon: string
  price: string
}

export const servicesData: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'تصميم مواقع احترافية',
    description: 'نصمم لك موقع ويب احترافي وجذاب يعكس هوية علامتك التجارية بأحدث التقنيات وأفضل الممارسات.',
    icon: '',
    price: 'يحدد حسب المشروع',
  },
  {
    id: 'srv-2',
    title: 'تطوير مواقع وتطبيقات',
    description: 'تطوير مواقع ويب وتطبيقات جوال متكاملة باستخدام أحدث الأطر والتقنيات البرمجية.',
    icon: '',
    price: 'يحدد حسب المشروع',
  },
  {
    id: 'srv-3',
    title: 'تسويق رقمي شامل',
    description: 'حملات تسويق رقمي متكاملة تشمل SEO، إعلانات مدفوعة، وإدارة منصات التواصل الاجتماعي.',
    icon: '',
    price: 'يحدد حسب الخطة',
  },
  {
    id: 'srv-4',
    title: 'تصميم هويات بصرية',
    description: 'تصميم شعارات وهوية بصرية متكاملة لتمييز علامتك التجارية عن المنافسين.',
    icon: '',
    price: 'يبدأ من 50,000 ر.ي',
  },
  {
    id: 'srv-5',
    title: 'إدارة المحتوى',
    description: 'كتابة وإدارة محوى جذاب ومتخصص لمنصات التواصل الاجتماعي والمواقع الإلكترونية.',
    icon: '',
    price: 'يبدأ من 30,000 ر.ي/شهر',
  },
  {
    id: 'srv-6',
    title: 'استشارات تقنية',
    description: 'استشارات في اختيار التقنيات المناسبة لمشروعك وتطوير البنية التحتية الرقمية.',
    icon: '',
    price: 'يحدد حسب الاستشارة',
  },
]

// ── Trading Data ──────────────────────────────────────────

export interface TradingItem {
  id: string
  title: string
  description: string
  category: 'تعليم' | 'أدوات' | 'مؤشرات' | 'شروحات'
  icon: string
}

export const tradingData: TradingItem[] = [
  {
    id: 'trading-1',
    title: 'تعليم التداول للمبتدئين',
    description: 'دليل شامل من الصفر لفهم أساسيات التداول في الأسواق المالية، قراءة الرسوم البيانية، وتنفيذ الصفقات الأولى.',
    category: 'تعليم',
    icon: '',
  },
  {
    id: 'trading-2',
    title: 'التحليل الفني المتقدم',
    description: 'تعلم أنماط الشموع، مستويات الدعم والمقاومة، والمؤشرات الفنية لاتخاذ قرارات تداول مدروسة.',
    category: 'تعليم',
    icon: '',
  },
  {
    id: 'trading-3',
    title: 'أدوات تحليل السوق',
    description: 'مجموعة من أفضل أدوات التحليل الفني والأساسي لمراقبة الأسواق واتخاذ قرارات ذكية.',
    category: 'أدوات',
    icon: '',
  },
  {
    id: 'trading-4',
    title: 'مؤشرات تداول مجانية',
    description: 'مؤشرات تداول مخصصة تساعدك في تحديد فرص الشراء والبيع بدقة أعلى.',
    category: 'مؤشرات',
    icon: '',
  },
  {
    id: 'trading-5',
    title: 'شروحات بسيطة للمبتدئين',
    description: 'شروحات مبسطة بالفيديو والصور لفهم مفاهيم التداول الأساسية خطوة بخطوة.',
    category: 'شروحات',
    icon: '',
  },
  {
    id: 'trading-6',
    title: 'إدارة المخاطر في التداول',
    description: 'تعلم كيفية حماية رأس مالك، تحديد حجم الصفقة المناسب، واستراتيجيات إدارة المخاطر الاحترافية.',
    category: 'تعليم',
    icon: '',
  },
]

// ── FAQ Data ──────────────────────────────────────────

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: 'عام' | 'طلب' | 'دفع' | 'شحن'
}

export const faqData: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'كيف أطلب منتج؟',
    answer: 'يمكنك الطلب بسهولة عبر الضغط على زر "اطلب عبر واتساب" في صفحة المنتج المطلوب. سيتم توجيهك مباشرة إلى واتساب لإتمام الطلب مع فريقنا.',
    category: 'طلب',
  },
  {
    id: 'faq-2',
    question: 'هل يوجد دفع إلكتروني داخل الموقع؟',
    answer: 'لا، الموقع لا يوفر خدمة الدفع الإلكتروني المباشر. جميع الطلبات تتم عبر واتساب للحصول على خدمة شخصية ومباشرة.',
    category: 'دفع',
  },
  {
    id: 'faq-3',
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'يمكنك الدفع عبر التحويل البنكي، PayPal، أو الدفع النقدي عند الاستلام (حسب المنطقة). يتم الاتفاق على طريقة الدفع عبر واتساب.',
    category: 'دفع',
  },
  {
    id: 'faq-4',
    question: 'كم تستغرق مدة الشحن؟',
    answer: 'تختلف مدة الشحن حسب المنطقة والمنتج. عادةً تستغرق 3-7 أيام عمل للمناطق الرئيسية. سيتم إبلاغك بالتفاصيل عبر واتساب.',
    category: 'شحن',
  },
  {
    id: 'faq-5',
    question: 'هل يمكنني استرجاع المنتج؟',
    answer: 'نعم، يمكنك طلب الاسترجاع خلال 14 يوم من الاستلام بشرط أن يكون المنتج في حالته الأصلية. تواصل معنا عبر واتساب لبدء عملية الاسترجاع.',
    category: 'عام',
  },
  {
    id: 'faq-6',
    question: 'كيف أتواصل مع الدعم الفني؟',
    answer: 'يمكنك التواصل معنا عبر واتساب أو صفحة اتصل بنا في الموقع. فريق الدعم متاح يومياً للإجابة على استفساراتكم.',
    category: 'عام',
  },
  {
    id: 'faq-7',
    question: 'هل المنتجات أصلية؟',
    answer: 'نعم، جميع منتجاتنا أصلية 100% ومضمونة. نتعامل مع موردين معتمدين ونضمن جودة كل منتج نوفره.',
    category: 'عام',
  },
  {
    id: 'faq-8',
    question: 'هل يمكنني طلب منتج غير موجود في الموقع؟',
    answer: 'نعم! تواصل معنا عبر واتساب وأخبرنا بالمنتج الذي تبحث عنه، وسنبذل جهدنا لتوفيره لك بأفضل سعر.',
    category: 'طلب',
  },
]

// ── WhatsApp Config ──────────────────────────────────────────

export const WHATSAPP_NUMBER = '967782138587'
export const WHATSAPP_LINK = 'https://wa.me/967782138587'

export function getWhatsAppOrderLink(productName: string): string {
  const message = `مرحباً، أريد طلب المنتج التالي:\n*${productName}*\nمن موقع Elite VIP Shop`
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

export function getWhatsAppServiceLink(serviceName: string): string {
  const message = `مرحباً، أريد الاستفسار عن الخدمة التالية:\n*${serviceName}*\nمن موقع Elite VIP Shop`
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}
