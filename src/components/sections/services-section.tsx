"use client";

import { Palette } from "lucide-react";
import { servicesData, WHATSAPP_LINK, getWhatsAppServiceLink } from "@/lib/mock-data";
import { WebDesignIcon, CodeIcon, MegaphoneIcon, BrandIcon, ContentIcon, ConsultIcon } from "@/components/icons";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

const serviceIcons = [WebDesignIcon, CodeIcon, MegaphoneIcon, BrandIcon, ContentIcon, ConsultIcon];

export function ServicesSection() {
  return (
    <section className="section-gradient-services py-8 md:py-16 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="section-title-3d mb-6">
            <span className="title-icon">
              <Palette className="size-6" />
            </span>
            الخدمات
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            خدمات احترافية متنوعة لتطوير مشروعك الرقمي — تصميم، تطوير، تسويق، وأكثر
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service, index) => {
            const ServiceIcon = serviceIcons[index] || WebDesignIcon;
            return (
              <div key={service.id} className="card-3d flex flex-col p-6">
                <div className="icon-box mb-5 text-orange-500">
                  <ServiceIcon className="size-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{service.title}</h3>
                <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                <div className="mb-4 rounded-xl bg-muted/50 px-4 py-2">
                  <span className="text-xs text-muted-foreground">السعر: </span>
                  <span className="text-sm font-bold text-gold-gradient">{service.price}</span>
                </div>
                <a
                  href={getWhatsAppServiceLink(service.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d-whatsapp w-full flex items-center justify-center gap-2 text-sm no-underline"
                >
                  <WhatsAppIcon size={20} className="size-5" />
                  تواصل عبر واتساب
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
