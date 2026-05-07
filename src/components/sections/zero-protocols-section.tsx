"use client";

import {
  ShieldX,
  EyeOff,
  Clock,
  VolumeX,
  Ban,
  AlertTriangle,
  Scale,
  Fingerprint,
  CheckCircle2,
} from "lucide-react";
import { useNavStore } from "@/store/nav-store";

export function ZeroProtocolsSection() {
  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-red-950/10 py-8 md:py-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
        <div className="absolute top-20 right-0 h-64 w-64 rounded-full bg-red-500/5 blur-[120px]" />
        <div className="absolute bottom-20 left-0 h-64 w-64 rounded-full bg-amber-500/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20">
              <ShieldX className="size-8 text-red-500" />
            </div>
            <h1 className="section-title-3d mb-4">
              <span className="title-icon text-red-500">
                <Ban className="size-6" />
              </span>
              بروتوكولات الصفر
            </h1>
            <p className="max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
              التزامات لا تقبل المساومة — خطوط حمراء لا نتجاوزها أبداً. هذه ليست شعارات تسويقية، بل قوانين حقيقية نعمل بها يومياً ونسأل عنها أمام كل عميل.
            </p>
            <span className="mx-auto mt-3 block h-1 w-20 rounded-full bg-gradient-to-l from-red-500 via-amber-500 to-red-500" />
          </div>

          {/* Main Protocols Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
            {[
              {
                icon: <EyeOff className="size-7" />,
                color: "from-red-500/20 to-red-600/5 border-red-500/20",
                iconColor: "text-red-500",
                title: "صفر تضليل",
                subtitle: "Zero Deception",
                items: [
                  "لا نُبالغ في وصف المنتجات أو نضيف مواصفات غير حقيقية",
                  "الصور المعروضة تمثل المنتج الفعلي دون فلتر أو تعديل مضلل",
                  "الأسعار المعروضة هي الأسعار النهائية بلا رسوم خفية",
                  "لا نستخدم عبارات مثل \"الأكثر مبيعاً\" أو \"الأفضل عالمياً\" دون دليل",
                  "كل مراجعة على الموقع حقيقية من عميل فعلي",
                ],
              },
              {
                icon: <AlertTriangle className="size-7" />,
                color: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
                iconColor: "text-amber-500",
                title: "صفر غش",
                subtitle: "Zero Fraud",
                items: [
                  "جميع المنتجات أصلية ومضمونة أو نوضح أنها بديلة بشفافية",
                  "لا نبيع بيانات العملاء لأي طرف ثالث تحت أي ظرف",
                  "كل معاملة مالية مشفرة وآمنة بالكامل",
                  "لا نستخدم طرق احتيالية لجذب العملاء أو الضغط عليهم",
                  "نلتزم بسياسة استرجاع واضحة ونعمل بها فوراً",
                ],
              },
              {
                icon: <Clock className="size-7" />,
                color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
                iconColor: "text-blue-500",
                title: "صفر تأخير",
                subtitle: "Zero Delay",
                items: [
                  "نرد على رسائل العملاء خلال ساعات عمل محددة ولا نتجاهل رسالة",
                  "التوصيل يتم في الوقت المحدد أو نعوضك عن التأخير",
                  "إذا حدثت مشكلة في الطلب نتواصل معك فوراً ولا ننتظر",
                  "أي استفسار تقني يتم حله في أسرع وقت ممكن",
                  "نلتزم بمواعيد التحديثات والصيانة المعلنة",
                ],
              },
              {
                icon: <VolumeX className="size-7" />,
                color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
                iconColor: "text-purple-500",
                title: "صرف تجاهل",
                subtitle: "Zero Ignoring",
                items: [
                  "كل شكوى أو ملاحظة يتم التعامل معها بجدية تامة",
                  "لا نحذف التعليقات السلبية بل نتعلم منها ونرد عليها",
                  "نستمع لرأي كل عميل حتى لو لم نتفق معه",
                  "نوفر قنوات تواصل متعددة لضمان وصول صوتك لنا",
                  "نُبلغك بالتطورات خطوة بخطوة حتى حل المشكلة بالكامل",
                ],
              },
              {
                icon: <Scale className="size-7" />,
                color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
                iconColor: "text-emerald-500",
                title: "صفر حشو",
                subtitle: "Zero Fluff",
                items: [
                  "محتوى الموقع حقيقي ومفيد بلا حشو تسويقي فارغ",
                  "لا نعد بشيء لا نستطيع تنفيذه فعلاً",
                  "الشروط والأحكام مكتوبة بلغة واضحة يفهمها الجميع",
                  "لا نستخدم تكتيكات الضغط لجعلك تشتري شيئاً لا تحتاجه",
                  "كل وصف منتج دقيق ومحدد بلا عبارات غامضة",
                ],
              },
              {
                icon: <Fingerprint className="size-7" />,
                color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
                iconColor: "text-cyan-500",
                title: "صفر انتهاك خصوصية",
                subtitle: "Zero Privacy Violation",
                items: [
                  "بياناتك الشخصية محمية بأعلى معايير الأمان الرقمية",
                  "لا نتتبع نشاطك على الموقع لأغراض تجارية بدون موافقتك",
                  "يمكنك طلب حذف حسابك وبياناتك في أي وقت",
                  "نستخدم بياناتك فقط لتقديم الخدمة وتحسينها",
                  "نلتزم بسياسة الخصوصية بصرامة ونراجعها باستمرار",
                ],
              },
            ].map((protocol, i) => (
              <div
                key={i}
                className="group rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  borderColor: i === 0 ? "rgba(239,68,68,0.2)" : i === 1 ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${protocol.color} border`}>
                    <span className={protocol.iconColor}>{protocol.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-0.5">{protocol.title}</h3>
                    <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">{protocol.subtitle}</span>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {protocol.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                      <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${protocol.iconColor} opacity-60`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Honesty Protocol */}
          <div className="mb-10">
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-card to-amber-950/20 p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <Scale className="size-8 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black mb-2 text-gold-gradient">بروتوكول الصدق المطلق</h2>
                  <span className="inline-block mb-4 text-xs font-bold tracking-widest text-amber-500/80 uppercase bg-amber-500/10 px-3 py-1 rounded-full">
                    Absolute Honesty Protocol
                  </span>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    هذا البروتوكول هو حجر الأساس في متجر النخبة. نؤمن أن الصدق ليس فضيلة فحسب، بل هو أساس كل علاقة تجارية ناجحة ومستدامة. كل تعامل مع عملائنا مبني على الشفافية التامة والصدق المطلق في كل كبيرة وصغيرة. لا نكذب، لا نُبالغ، لا نُخفي، ولا نُلوّن الحقائق. ما نقوله هو ما نعنيه بالضبط.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        title: "في المنتجات",
                        desc: "نوضح كل عيب أو قصور في المنتج بصراحة. إذا كان المنتج لا يناسب استخدامك المحدد، سنخبرك بذلك حتى لو خسرنا البيع. أفضل عميل هو العميل المُطمئن.",
                      },
                      {
                        title: "في الأسعار",
                        desc: "لا نرفع الأسعار كذباً ثم نضع خصومات وهمية. سعرنا هو السعر الحقيقي والعادل. إذا وجدت سعراً أفضل في مكان آخر، أخبرنا وسنعمل على مساواته.",
                      },
                      {
                        title: "في الخدمة",
                        desc: "إذا أخطأنا، نعترف فوراً ونصلح. لا نختلق أعذاراً أو نلوم الآخرين. المسؤولية الكاملة هي أساس عملنا مع كل عميل.",
                      },
                      {
                        title: "في التواصل",
                        desc: "نقول لا عندما يجب أن نقول لا. لا نوهمك بإمكانية لا توجد. إذا لم نستطع تلبية طلبك سنوضح لك السبب بصراحة ونبحث معك عن بدائل.",
                      },
                    ].map((item, i) => (
                      <div key={i} className="rounded-xl border border-amber-500/10 bg-card/50 p-4">
                        <h4 className="font-bold mb-1.5 text-sm" style={{ color: "#f0d078" }}>{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promise Section */}
          <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-primary/5 p-8 text-center">
            <h3 className="text-xl font-black mb-3 text-gold-gradient">وعدنا لك</h3>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
              نعدك بأن نحترم كل بروتوكول من هذه البروتوكولات في كل تعامل. إذا شعرت بأننا خنّا هذا الوعد في أي لحظة، يحق لك المطالبة بحقك كاملاً دون أي عوائق. مصداقيتنا ليست للعرض — إنها طريقة حياة في عملنا.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/967782138587"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d-whatsapp flex items-center justify-center gap-2 px-6 py-3 text-sm"
              >
                إذا لاحظت أي مخالفة — تواصل معنا
              </a>
              <button
                onClick={() => {
                  useNavStore.getState().setCurrentPage("values");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/10"
              >
                تعرف على قيمنا الكاملة
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
