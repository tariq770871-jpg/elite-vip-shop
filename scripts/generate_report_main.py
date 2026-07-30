# -*- coding: utf-8 -*-
"""
Elite VIP Shop — Main entry point
Generates the full PDF report by combining cover + TOC + all sections.
"""

import sys
import os
from pathlib import Path

# Add scripts dir to path so we can import our modules
sys.path.insert(0, '/home/z/my-project/scripts')

from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph, Spacer, PageBreak, Table, TableStyle
)
from reportlab.lib import colors
from reportlab.platypus.tableofcontents import TableOfContents

from generate_project_report import (
    ReportDocTemplate, build_cover, STYLES, ACCENT_GOLD, TEXT_PRIMARY,
    TEXT_MUTED, CONTENT_W, ar, ar_para, PAGE_W, PAGE_H, MARGIN_L, MARGIN_R,
    MARGIN_T, MARGIN_B, heading, body_para,
)
from report_sections_part1 import (
    section_executive_summary,
    section_project_overview,
    section_tech_stack,
    section_project_structure,
    section_auth_permissions,
    section_api_routes,
)
from report_sections_part2 import (
    section_database,
    section_integrations,
    section_audit_report,
    section_future_improvements,
    section_env_vars,
)


OUTPUT_PATH = "/home/z/my-project/download/elite-vip-shop-project-details.pdf"


def build_toc():
    """Table of contents — RTL with custom styles."""
    toc = TableOfContents()
    toc.levelStyles = [
        STYLES["toc_h1"],
        STYLES["toc_h2"],
        STYLES["toc_h2"],  # h3 uses h2 style (slightly indented)
    ]
    return toc


def main():
    # Ensure output directory exists
    Path(OUTPUT_PATH).parent.mkdir(parents=True, exist_ok=True)

    # Build document
    doc = ReportDocTemplate(
        OUTPUT_PATH,
        pagesize=(PAGE_W, PAGE_H),
        title="Elite VIP Shop — تقرير تفاصيل وتحليل المشروع",
        author="Elite VIP Shop Team",
        subject="تقرير تفاصيل المشروع — قابل للتحليل بأداة ذكاء اصطناعي",
        creator="Elite VIP Shop Report Generator",
    )

    story = []

    # ─── 1. COVER (uses Cover template) ─────────────────────────
    build_cover(story)

    # Switch to Body template for everything else
    from reportlab.platypus import NextPageTemplate
    story.append(NextPageTemplate('Body'))
    story.append(PageBreak())

    # ─── 2. TABLE OF CONTENTS ──────────────────────────────────
    heading("فهرس المحتويات", level=1, story=story, toc_level=0)
    story.append(Spacer(1, 6*mm))

    # Add a thin gold divider under TOC title
    from generate_project_report import GoldDivider
    story.append(GoldDivider(thickness=1.5))
    story.append(Spacer(1, 8*mm))

    story.append(build_toc())
    story.append(PageBreak())

    # ─── 3. CONTENT SECTIONS ───────────────────────────────────
    section_executive_summary(story)
    section_project_overview(story)
    section_tech_stack(story)
    section_project_structure(story)
    section_auth_permissions(story)
    section_api_routes(story)
    section_database(story)
    section_integrations(story)
    section_audit_report(story)
    section_future_improvements(story)
    section_env_vars(story)

    # ─── BUILD ─────────────────────────────────────────────────
    print(f"Generating PDF: {OUTPUT_PATH}")
    doc.multiBuild(story)

    # Stats
    file_size = os.path.getsize(OUTPUT_PATH)
    size_kb = file_size / 1024
    print(f"✅ PDF generated successfully")
    print(f"   Path: {OUTPUT_PATH}")
    print(f"   Size: {size_kb:.1f} KB")

    # Try to get page count
    try:
        from pypdf import PdfReader
        reader = PdfReader(OUTPUT_PATH)
        print(f"   Pages: {len(reader.pages)}")
    except Exception:
        pass


if __name__ == "__main__":
    main()
