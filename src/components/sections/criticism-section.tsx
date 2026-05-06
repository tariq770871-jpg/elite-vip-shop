"use client";

import { SpeechBubbleIcon } from "@/components/icons";

export function CriticismSection() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-bl from-black via-black/95 to-black/90 py-8 md:py-12">
        <div className="hero-shimmer absolute inset-0" />
        <div className="absolute top-0 right-0 h-40 w-40">
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-gold/80 to-transparent" />
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-gold/80 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 h-40 w-40">
          <div className="absolute bottom-0 left-0 h-full w-1 bg-gradient-to-t from-gold/80 to-transparent" />
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gold/80 to-transparent" />
        </div>
        <div className="absolute top-1/3 left-1/3 h-48 w-48 rounded-full bg-gold/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="section-title-3d mb-6">
              <span className="title-icon">
                <SpeechBubbleIcon className="size-6" />
              </span>
              بروتوكول النقد الصريح
            </div>
            <p className="max-w-2xl text-base md:text-lg" style={{ color: "rgba(240, 208, 120, 0.8)" }}>
              نحن نرحب بكل ملاحظة صريحة ونعتبرها فرصة حقيقية للتحسين. هذا بروتوكولنا في التعامل مع النقد
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { num: "01", title: "النقد واجب لا ترف", desc: "نرى أن الملاحظات والانتقادات واجب علينا قبولها بامتنان. كل تعليق سلب أو إيجابي يساعدنا على فهم تجربتك بشكل أعمق وبناء خدمة أفضل تليق بتطلعاتكم." },
              { num: "02", title: "لا تجميل ولا مداواة", desc: "لن نتجاهل مشكلة أو نلفّق حلاً مؤقتاً. إذا وجدت عيباً في منتج أو خدمة أو تجربة، سنواجهه بشجاعة ونصلحه من الجذور بدلاً من ترقيعه." },
              { num: "03", title: "الشفافية في كل شيء", desc: "نلتزم بتوضيح حدود خدماتنا بصراحة. لا نوهمك بمنتج لا نملكه ولا بقدرة لا نتمتع بها. الصراحة هي الأساس الذي بنيت عليه علاقتنا بكل عميل." },
              { num: "04", title: "تحسين مستمر لا متوقف", desc: "كل نقد نتلقاه يتحول إلى خطة عمل حقيقية. نتابع الملاحظات ونطبّق التحسينات ونراجع النتائج. هدفنا أن نكون أفضل نسخة من أنفسنا في كل تحديث." },
              { num: "05", title: "حقك في التعبير", desc: "نؤمن بحقك الكامل في التعبير عن رأيك بكل حرية دون قيد أو شرط. سواء عبر واتساب أو تيليجرام أو أي قناة تواصل — صوتك مسموع ومحترم دائماً." },
              { num: "06", title: "المسؤولية الكاملة", desc: "نتحمل مسؤولية أي خطأ أو تقصير بلا مبررات. لا نلوم الظروف أو الأطراف الأخرى. إذا أخطأنا، نعترف ونصلح ونضمن عدم تكرار الخطأ." },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-card/80 via-card to-amber-500/5 p-6 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(212,168,67,0.1)] hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-black text-gold-gradient leading-none">{item.num}</span>
                  <div>
                    <h3 className="text-base font-bold mb-2" style={{ color: "#f0d078" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/967782138587"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-whatsapp flex items-center justify-center gap-3 px-8 py-4 text-base"
            >
              شاركنا ملاحظاتك
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
