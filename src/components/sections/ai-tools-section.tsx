"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { getAiTools } from "@/lib/supabase-data";
import type { FreeItem } from "@/lib/mock-data";
import {
  RobotIcon,
  ChatBotIcon,
  ImageGeneratorIcon,
  DesignToolIcon,
  PresentationIcon,
  NotesIcon,
  VoiceIcon,
} from "@/components/icons";

const aiIcons = [ChatBotIcon, ImageGeneratorIcon, DesignToolIcon, PresentationIcon, NotesIcon, VoiceIcon];

export function AiToolsSection() {
  const [aiToolsData, setAiToolsData] = useState<FreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAiTools().then(d => { setAiToolsData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <section className="section-gradient-ai py-6 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="section-title-3d mb-6">
              <span className="title-icon">
                <RobotIcon className="size-6" />
              </span>
              أدوات الذكاء الاصطناعي
            </div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              أقوى أدوات AI المجانية لتعزيز عملك وإبداعك
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="size-8 animate-spin text-gold-gradient" />
            <p className="text-muted-foreground">جارٍ تحميل الأدوات...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-gradient-ai py-6 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="section-title-3d mb-6">
            <span className="title-icon">
              <RobotIcon className="size-6" />
            </span>
            أدوات الذكاء الاصطناعي
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            أقوى أدوات AI المجانية لتعزيز عملك وإبداعك
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {aiToolsData.map((tool, index) => {
            const ToolIcon = aiIcons[index] || ChatBotIcon;
            return (
              <div key={tool.id} className="card-3d flex flex-col p-6">
                <div className="icon-box mb-5 text-violet-500">
                  <ToolIcon className="size-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{tool.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
                <button
                  className="btn-3d-sm w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    if (tool.link) window.open(tool.link, "_blank");
                  }}
                  disabled={!tool.link}
                  style={!tool.link ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                >
                  عرض التفاصيل
                  {tool.link && <ExternalLink className="size-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
