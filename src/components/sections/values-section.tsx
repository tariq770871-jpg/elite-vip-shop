"use client";

import {
  Trust,
  Award,
  Headphones,
  Lightbulb,
  ShieldCheck,
  Handshake,
  Heart,
  Users,
  Eye,
  Clock,
  Scale,
  Sparkles,
  Globe,
  Target,
  CheckCircle2,
} from "lucide-react";

export function ValuesSection() {
  return (
    <div>
      {/* Header */}
      <section className="section-gradient-products py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
              <Heart className="size-8 text-amber-500" />
            </div>
            <div className="section-title-3d mb-4">
              <span className="title-icon">
                <Heart className="size-6" />
              </span>
              قيم المتجر
            </div>
            <p className="max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
              المبادئ الأساسية التي نلتزم بها في كل تعامل وكل خدمة نقدمها. هذه القيم ليست مجرد كلمات مكتوبة — إنها القوانين التي تحكم عملنا وتحدد علاقتنا مع كل عميل.
            </p>
            <span className="mx-auto mt-3 block h-1 w-20 rounded-full bg-gold-gradient" />
          </div>

          {/* Core Values Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {[
              {
                icon: <Eye className="size-7" />,
                color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
                iconColor: "text-blue-500",
                title: "الثقة والشفافية",
                desc: "نتعامل بشفافية كاملة في كل تفاصيل منتجاتنا وأسعارنا وخدماتنا. لا إخفاء ولا تضليل — ما تراه هو ما تحصل عليه بالضبط. ننشر شروطنا بوضوح ونوضح حدود خدماتنا بصراحة تامة.",
              },
              {
                icon: <Award className="size-7" />,
                color: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
                iconColor: "text-amber-500",
                title: "الجودة الفائقة",
                desc: "نختار منتجاتنا بعناية فائقة ونراجع كل خدمة قبل تقديمها. هدفنا أن يحصل كل عميل على تجربة تفوق توقعاته. لا نعرض أي منتج إلا بعد اختباره والتأكد من جودته.",
              },
              {
                icon: <Headphones className="size-7" />,
                color: "from-green-500/20 to-green-600/5 border-green-500/20",
                iconColor: "text-green-500",
                title: "دعم متواصل",
                desc: "فريق الدعم متاح عبر واتساب وتيليجرام للإجابة على استفساراتك ومساعدتك في أي وقت. لا نترك رسالة بدون رد ونحرص على حل مشاكلك بأسرع وقت ممكن.",
              },
              {
                icon: <Lightbulb className="size-7" />,
                color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
                iconColor: "text-purple-500",
                title: "الابتكار المستمر",
                desc: "نسعى دائماً لتقديم أحدث المنتجات والأدوات والتقنيات. نحدّث محتوانا باستمرار لنكون دائماً في الطليعة ونقدم حلولاً ذكية لمتطلبات عملائنا المتجددة.",
              },
              {
                icon: <ShieldCheck className="size-7" />,
                color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
                iconColor: "text-emerald-500",
                title: "الأمان والحماية",
                desc: "بياناتك الشخصية محمية بأعلى معايير الأمان الرقمية. نستخدم تشفير SSL لكل المعاملات ولا نشارك بياناتك مع أي طرف ثالث. خصوصيتك حق مقدس لا نفرط فيه.",
              },
              {
                icon: <Handshake className="size-7" />,
                color: "from-rose-500/20 to-rose-600/5 border-rose-500/20",
                iconColor: "text-rose-500",
                title: "المسؤولية الكاملة",
                desc: "نتحمل مسؤولية أخطائنا بلا مبررات. إذا حدثت مشكلة في المنتج أو الخدمة نتواصل معك فوراً ونعوضك عن أي إزعاج. رضاكم هو مقياس نجاحنا الحقيقي.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-3d p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex size-14 mb-5 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} border`}>
                  <span className={item.iconColor}>{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-3 text-gold-gradient">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Extended Values */}
          <div className="mb-12">
            <h2 className="text-center text-xl font-bold mb-8">قيمنا في التعامل مع العملاء</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Users className="size-5" />,
                  title: "العميل أولاً",
                  desc: "كل قرار نتخذه نبدأه بسؤال: هل هذا يخدم العميل؟ قررتنا مصنوعة لصالحك.",
                },
                {
                  icon: <Clock className="size-5" />,
                  title: "احترام الوقت",
                  desc: "نلتزم بالمواعيد في التوصيل والردود والتحديثات. وقتك ثمين ونقدره كما نقدر وقتنا.",
                },
                {
                  icon: <Scale className="size-5" />,
                  title: "الصدق المطلق",
                  desc: "لا نكذب ولا نُبالغ ولا نخفي. الصدق هو أساس كل علاقة بيننا وبين عملائنا.",
                },
                {
                  icon: <Sparkles className="size-5" />,
                  title: "التجربة المميزة",
                  desc: "نسعى لجعل كل تفاعل مع متجرنا تجربة إيجابية من أول زيارة حتى ما بعد الشراء.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Our Pledge */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-card to-amber-950/10 p-8 md:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex size-14 items-center justify-center rounded-full bg-gold-gradient mb-4">
                <Target className="size-7 text-black" />
              </div>
              <h2 className="text-2xl font-black mb-2 text-gold-gradient">تعهدنا لك</h2>
              <span className="inline-block text-xs font-bold tracking-widest text-amber-500/80 uppercase bg-amber-500/10 px-3 py-1 rounded-full">
                Our Pledge
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {[
                "نخبرك بالحقيقة حتى لو كانت صعبة",
                "نرد على استفساراتك في أسرع وقت",
                "نضمن جودة كل منتج نعرضه",
                "نحترم خصوصيتك وبياناتك",
                "نصلح أخطاءنا بلا تأخير أو أعذار",
                "نستمع لنقدك ونعتبره هدية",
                "لا نفرق بين عميل وآخر",
                "نسعى لتحسين خدماتنا كل يوم",
                "نكون شفافين في الأسعار والشروط",
              ].map((pledge, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-amber-500" />
                  <span>{pledge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
