#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Elite VIP Shop — Project Details & Analysis Report (Arabic, RTL)

Generates a comprehensive PDF report about the project structure,
architecture, security audit, and quality fixes — in Arabic with
proper RTL support via Noto Naskh Arabic + arabic_reshaper + python-bidi.

Output: /home/z/my-project/download/elite-vip-shop-project-details.pdf
"""

import os
import sys
import hashlib
from pathlib import Path

# ─── ReportLab imports ───────────────────────────────────────────
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, Image, Flowable, HRFlowable, ListFlowable, ListItem
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.platypus.frames import Frame
from reportlab.pdfgen import canvas

# ─── Arabic shaping ──────────────────────────────────────────────
import arabic_reshaper
from bidi.algorithm import get_display

# ═══════════════════════════════════════════════════════════════════
#  FONT REGISTRATION
# ═══════════════════════════════════════════════════════════════════
FONT_DIR = "/home/z/my-project/.fonts"

pdfmetrics.registerFont(TTFont("Naskh",         f"{FONT_DIR}/NotoNaskhArabic-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Naskh-Bold",    f"{FONT_DIR}/NotoNaskhArabic-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SansArabic",    f"{FONT_DIR}/NotoSansArabic-Regular.ttf"))
pdfmetrics.registerFont(TTFont("SansArabic-Bold", f"{FONT_DIR}/NotoSansArabic-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Mono",          "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"))

registerFontFamily("Naskh", normal="Naskh", bold="Naskh-Bold", italic="Naskh", boldItalic="Naskh-Bold")
registerFontFamily("SansArabic", normal="SansArabic", bold="SansArabic-Bold",
                   italic="SansArabic", boldItalic="SansArabic-Bold")

# ═══════════════════════════════════════════════════════════════════
#  ARABIC TEXT HELPER
# ═══════════════════════════════════════════════════════════════════
def ar(text: str) -> str:
    """Reshape Arabic text for correct RTL rendering in ReportLab Paragraphs."""
    if not text:
        return ""
    # If text contains Arabic characters, reshape + apply BiDi
    if any('\u0600' <= ch <= '\u06FF' for ch in text):
        reshaped = arabic_reshaper.reshape(text)
        return get_display(reshaped)
    return text

def ar_para(text: str) -> str:
    """For Paragraph XML — keep tags intact, reshape only Arabic text segments."""
    if not text:
        return ""
    # Split on XML tags, reshape only non-tag segments
    import re
    parts = re.split(r'(<[^>]+>)', text)
    result = []
    for part in parts:
        if part.startswith('<') and part.endswith('>'):
            result.append(part)
        else:
            if any('\u0600' <= ch <= '\u06FF' for ch in part):
                reshaped = arabic_reshaper.reshape(part)
                result.append(get_display(reshaped))
            else:
                result.append(part)
    return ''.join(result)

# ═══════════════════════════════════════════════════════════════════
#  COLOR PALETTE — Dark theme with gold accents
# ═══════════════════════════════════════════════════════════════════
# Dark cover + light body (best of both: striking cover, readable body)
PAGE_BG_DARK   = colors.HexColor('#0F172A')  # Slate-900 — cover
SECTION_BG_DARK = colors.HexColor('#1E293B')  # Slate-800 — code blocks
PAGE_BG_LIGHT  = colors.HexColor('#FFFFFF')   # body pages
CARD_BG        = colors.HexColor('#F8FAFC')   # Slate-50 — callouts
TABLE_STRIPE   = colors.HexColor('#F1F5F9')   # Slate-100

HEADER_FILL    = colors.HexColor('#1E293B')  # table headers (dark slate)
ACCENT_GOLD    = colors.HexColor('#D4A843')  # brand gold
ACCENT_GOLD_LT = colors.HexColor('#F0D078')  # lighter gold
BORDER         = colors.HexColor('#CBD5E1')  # Slate-300
BORDER_DARK    = colors.HexColor('#475569')  # Slate-600

TEXT_PRIMARY   = colors.HexColor('#0F172A')  # Slate-900
TEXT_MUTED     = colors.HexColor('#64748B')  # Slate-500
TEXT_LIGHT     = colors.HexColor('#F8FAFC')  # on dark bg

# Semantic
SUCCESS        = colors.HexColor('#16A34A')
WARNING        = colors.HexColor('#D97706')
DANGER         = colors.HexColor('#DC2626')
INFO           = colors.HexColor('#0284C7')

# ═══════════════════════════════════════════════════════════════════
#  PAGE LAYOUT — A4 with margins
# ═══════════════════════════════════════════════════════════════════
PAGE_W, PAGE_H = A4
MARGIN_L = 20*mm
MARGIN_R = 20*mm
MARGIN_T = 22*mm
MARGIN_B = 22*mm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# ═══════════════════════════════════════════════════════════════════
#  STYLES — all RTL (TA_RIGHT for Arabic)
# ═══════════════════════════════════════════════════════════════════
STYLES = {
    # Cover styles
    "cover_title": ParagraphStyle(
        name="CoverTitle", fontName="SansArabic-Bold", fontSize=32, leading=42,
        alignment=TA_CENTER, textColor=TEXT_LIGHT, wordWrap='RTL',
        spaceAfter=8,
    ),
    "cover_subtitle": ParagraphStyle(
        name="CoverSubtitle", fontName="SansArabic", fontSize=16, leading=24,
        alignment=TA_CENTER, textColor=ACCENT_GOLD, wordWrap='RTL',
        spaceAfter=24,
    ),
    "cover_meta": ParagraphStyle(
        name="CoverMeta", fontName="Naskh", fontSize=11, leading=18,
        alignment=TA_CENTER, textColor=TEXT_LIGHT, wordWrap='RTL',
    ),
    "cover_meta_muted": ParagraphStyle(
        name="CoverMetaMuted", fontName="Naskh", fontSize=10, leading=16,
        alignment=TA_CENTER, textColor=colors.HexColor('#94A3B8'), wordWrap='RTL',
    ),

    # Body styles
    "h1": ParagraphStyle(
        name="H1", fontName="SansArabic-Bold", fontSize=20, leading=28,
        alignment=TA_RIGHT, textColor=TEXT_PRIMARY, wordWrap='RTL',
        spaceBefore=18, spaceAfter=12, keepWithNext=True,
    ),
    "h2": ParagraphStyle(
        name="H2", fontName="SansArabic-Bold", fontSize=15, leading=22,
        alignment=TA_RIGHT, textColor=ACCENT_GOLD, wordWrap='RTL',
        spaceBefore=14, spaceAfter=8, keepWithNext=True,
    ),
    "h3": ParagraphStyle(
        name="H3", fontName="SansArabic-Bold", fontSize=12, leading=18,
        alignment=TA_RIGHT, textColor=TEXT_PRIMARY, wordWrap='RTL',
        spaceBefore=10, spaceAfter=6, keepWithNext=True,
    ),
    "body": ParagraphStyle(
        name="Body", fontName="Naskh", fontSize=10.5, leading=18,
        alignment=TA_RIGHT, textColor=TEXT_PRIMARY, wordWrap='RTL',
        spaceBefore=0, spaceAfter=8, firstLineIndent=0,
    ),
    "body_justified": ParagraphStyle(
        name="BodyJ", fontName="Naskh", fontSize=10.5, leading=18,
        alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, wordWrap='RTL',
        spaceAfter=8,
    ),
    "muted": ParagraphStyle(
        name="Muted", fontName="Naskh", fontSize=9.5, leading=15,
        alignment=TA_RIGHT, textColor=TEXT_MUTED, wordWrap='RTL',
        spaceAfter=6,
    ),
    "code": ParagraphStyle(
        name="Code", fontName="Mono", fontSize=8.5, leading=12,
        alignment=TA_LEFT, textColor=colors.HexColor('#E2E8F0'),
        backColor=SECTION_BG_DARK, borderPadding=8,
        leftIndent=0, rightIndent=0, spaceBefore=6, spaceAfter=10,
    ),
    "code_inline": ParagraphStyle(
        name="CodeInline", fontName="Mono", fontSize=9.5, leading=14,
        textColor=colors.HexColor('#0F172A'),
    ),
    "callout_title": ParagraphStyle(
        name="CalloutTitle", fontName="SansArabic-Bold", fontSize=11, leading=16,
        alignment=TA_RIGHT, textColor=ACCENT_GOLD, wordWrap='RTL',
        spaceAfter=4,
    ),
    "callout_body": ParagraphStyle(
        name="CalloutBody", fontName="Naskh", fontSize=10, leading=16,
        alignment=TA_RIGHT, textColor=TEXT_PRIMARY, wordWrap='RTL',
        spaceAfter=4,
    ),
    "table_header": ParagraphStyle(
        name="TH", fontName="SansArabic-Bold", fontSize=9.5, leading=14,
        alignment=TA_CENTER, textColor=TEXT_LIGHT, wordWrap='RTL',
    ),
    "table_cell": ParagraphStyle(
        name="TC", fontName="Naskh", fontSize=9.5, leading=14,
        alignment=TA_RIGHT, textColor=TEXT_PRIMARY, wordWrap='RTL',
    ),
    "table_cell_center": ParagraphStyle(
        name="TCC", fontName="Naskh", fontSize=9.5, leading=14,
        alignment=TA_CENTER, textColor=TEXT_PRIMARY, wordWrap='RTL',
    ),
    "table_cell_mono": ParagraphStyle(
        name="TCM", fontName="Mono", fontSize=8.5, leading=12,
        alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    ),
    "toc_h1": ParagraphStyle(
        name="TocH1", fontName="SansArabic-Bold", fontSize=12, leading=20,
        alignment=TA_RIGHT, textColor=TEXT_PRIMARY, wordWrap='RTL',
        spaceBefore=4, spaceAfter=2,
    ),
    "toc_h2": ParagraphStyle(
        name="TocH2", fontName="Naskh", fontSize=10.5, leading=16,
        alignment=TA_RIGHT, textColor=TEXT_MUTED, wordWrap='RTL',
        leftIndent=20, rightIndent=20, spaceAfter=2,
    ),
    "bullet": ParagraphStyle(
        name="Bullet", fontName="Naskh", fontSize=10.5, leading=17,
        alignment=TA_RIGHT, textColor=TEXT_PRIMARY, wordWrap='RTL',
        rightIndent=12, spaceAfter=4,
    ),
}

# ═══════════════════════════════════════════════════════════════════
#  CUSTOM FLOWABLES
# ═══════════════════════════════════════════════════════════════════
class GoldDivider(Flowable):
    """Thin gold horizontal divider."""
    def __init__(self, width=None, color=ACCENT_GOLD, thickness=1.5):
        super().__init__()
        self.width = width or CONTENT_W
        self.color = color
        self.thickness = thickness
        self.height = thickness + 4

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 2, self.width, 2)


class StatCard(Flowable):
    """A single statistic card with number + label."""
    def __init__(self, number, label, width=85*mm, height=22*mm,
                 num_color=ACCENT_GOLD, bg=CARD_BG):
        super().__init__()
        self.number = str(number)
        self.label = label
        self.width = width
        self.height = height
        self.num_color = num_color
        self.bg = bg

    def draw(self):
        c = self.canv
        # Background
        c.setFillColor(self.bg)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.roundRect(0, 0, self.width, self.height, 4, fill=1, stroke=1)
        # Gold accent bar on the right (RTL)
        c.setFillColor(self.num_color)
        c.rect(self.width - 4, 0, 4, self.height, fill=1, stroke=0)
        # Number
        c.setFillColor(self.num_color)
        c.setFont("SansArabic-Bold", 22)
        # Number is displayed LTR (numbers stay LTR even in RTL context)
        c.drawRightString(self.width - 12, self.height/2 + 2, self.number)
        # Label
        c.setFillColor(TEXT_MUTED)
        c.setFont("Naskh", 9)
        label_ar = ar(self.label)
        c.drawRightString(self.width - 12, self.height/2 - 12, label_ar)


def stat_row(stats):
    """Row of stat cards. stats = [(number, label, color?), ...]"""
    n = len(stats)
    gap = 6*mm
    card_w = (CONTENT_W - gap * (n - 1)) / n
    cards = []
    for s in stats:
        num = s[0]
        label = s[1]
        col = s[2] if len(s) > 2 else ACCENT_GOLD
        cards.append(StatCard(num, label, width=card_w, num_color=col))
    # Build a table to lay them out horizontally
    row_data = [[c for c in cards]]
    t = Table(row_data, colWidths=[card_w]*n + [0])
    t.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    # Actually, simpler: just put them in a row table with gaps
    cols = []
    for i, c in enumerate(cards):
        cols.append(card_w)
    t = Table([cards], colWidths=cols)
    t.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t


def callout(title, body, kind="info"):
    """Colored callout box."""
    color_map = {
        "info":    (INFO,    colors.HexColor('#E0F2FE')),
        "success": (SUCCESS, colors.HexColor('#DCFCE7')),
        "warning": (WARNING, colors.HexColor('#FEF3C7')),
        "danger":  (DANGER,  colors.HexColor('#FEE2E2')),
        "gold":    (ACCENT_GOLD, colors.HexColor('#FEF7E0')),
    }
    border_c, bg_c = color_map.get(kind, color_map["info"])

    title_p = Paragraph(ar_para(f"<b>{title}</b>"), STYLES["callout_title"])
    body_p = Paragraph(ar_para(body), STYLES["callout_body"])

    inner = Table([[title_p], [body_p]], colWidths=[CONTENT_W - 16])
    inner.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))

    outer = Table([[inner]], colWidths=[CONTENT_W])
    outer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_c),
        ('LINEBEFORE', (0,0), (0,-1), 4, border_c),  # right border in RTL = LINEBEFORE in LTR
        ('LINEAFTER', (0,0), (0,-1), 4, border_c),   # actually for RTL we want right-side accent
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    # Reset: use only right-side accent (RTL — accent should be on the right)
    outer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_c),
        ('LINEABOVE', (0,0), (-1,0), 0, colors.transparent),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    # Add a thin colored strip on the right (RTL reading start)
    strip = Table([['']], colWidths=[3*mm], rowHeights=[18*mm])
    strip.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), border_c),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    combo = Table([[strip, outer]], colWidths=[3*mm, CONTENT_W - 3*mm])
    combo.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return combo


def code_block(code_str, language=""):
    """Dark code block with monospace text.
    Splits long code into multiple blocks to fit page height."""
    # Escape XML special chars
    safe = code_str.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Preserve line breaks
    safe = safe.replace('\n', '<br/>')
    # Preserve spaces (multiple spaces → &nbsp;)
    safe = safe.replace('  ', '&nbsp;&nbsp;')
    p = Paragraph(safe, STYLES["code"])

    # Try to build single table; if it's too tall, split into chunks
    t = Table([[p]], colWidths=[CONTENT_W], splitByRow=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SECTION_BG_DARK),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t


def code_block_split(code_str, max_lines=35):
    """Split long code blocks into multiple smaller blocks separated by spacers.
    Each chunk has at most max_lines lines."""
    lines = code_str.split('\n')
    chunks = []
    for i in range(0, len(lines), max_lines):
        chunk = '\n'.join(lines[i:i+max_lines])
        chunks.append(code_block(chunk))
        if i + max_lines < len(lines):
            chunks.append(Spacer(1, 2))
    return chunks  # list of flowables


def data_table(headers, rows, col_widths=None, header_align="center"):
    """RTL data table with gold/dark header."""
    n_cols = len(headers)
    if col_widths is None:
        col_widths = [CONTENT_W / n_cols] * n_cols

    # Header row — note: in RTL, we reverse column order so the first header
    # appears on the right. ReportLab tables are LTR by default.
    # Strategy: keep LTR layout, but reverse data so first item is rightmost.
    # Easier: leave as-is, since the user will read columns visually.
    header_style = STYLES["table_header"]
    cell_style = STYLES["table_cell"]
    center_style = STYLES["table_cell_center"]

    header_paras = [Paragraph(ar_para(f"<b>{h}</b>"), header_style) for h in headers]

    data = [header_paras]
    for row in rows:
        row_paras = []
        for i, cell in enumerate(row):
            # If cell looks like code (path, identifier), use mono style
            if isinstance(cell, str) and (
                cell.startswith('/') or cell.startswith('@') or
                '.' in cell and ' ' not in cell[:20] or
                cell.startswith('api/') or cell.startswith('src/')
            ):
                row_paras.append(Paragraph(cell, STYLES["table_cell_mono"]))
            else:
                # Use center for short cells (≤ 12 chars), right-align for longer
                if len(str(cell)) <= 12 and header_align == "center":
                    row_paras.append(Paragraph(ar_para(str(cell)), center_style))
                else:
                    row_paras.append(Paragraph(ar_para(str(cell)), cell_style))
        data.append(row_paras)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ('BACKGROUND', (0,0), (-1,0), HEADER_FILL),
        ('TEXTCOLOR', (0,0), (-1,0), TEXT_LIGHT),
        ('FONTNAME', (0,0), (-1,0), 'SansArabic-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9.5),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LINEBELOW', (0,0), (-1,0), 1.5, ACCENT_GOLD),
        ('GRID', (0,1), (-1,-1), 0.3, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, TABLE_STRIPE]),
    ]
    t.setStyle(TableStyle(style))
    return t


def heading(text, level=1, story=None, toc_level=None):
    """Add a heading with optional TOC bookmark."""
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    style_name = f"h{level}"
    p = Paragraph(ar_para(f'<a name="{key}"/>{text}'), STYLES[style_name])
    p.bookmark_name = key
    p.bookmark_level = (toc_level if toc_level is not None else level - 1)
    p.bookmark_text = text
    p.bookmark_key = key
    if story is not None:
        story.append(p)
    return p


def body_para(text, story=None, style="body"):
    """Add a body paragraph."""
    p = Paragraph(ar_para(text), STYLES[style])
    if story is not None:
        story.append(p)
    return p


def bullet_list(items, story=None):
    """RTL bullet list."""
    items_ar = []
    for item in items:
        if isinstance(item, tuple):
            # (bold_part, rest)
            text = f"<b>{item[0]}</b> — {item[1]}"
        else:
            text = item
        items_ar.append(ListItem(
            Paragraph(ar_para(text), STYLES["bullet"]),
            leftIndent=0, rightIndent=18, value='●'
        ))
    lf = ListFlowable(
        items_ar, bulletType='bullet', start='●',
        bulletColor=ACCENT_GOLD, bulletFontSize=8,
        rightIndent=18, leftIndent=0,
        spaceBefore=4, spaceAfter=8,
    )
    if story is not None:
        story.append(lf)
    return lf


# ═══════════════════════════════════════════════════════════════════
#  PAGE TEMPLATES
# ═══════════════════════════════════════════════════════════════════
class ReportDocTemplate(BaseDocTemplate):
    """DocTemplate with cover (no header/footer) + body (with header/footer)."""

    def __init__(self, filename, **kw):
        super().__init__(filename, **kw)
        # Cover frame — full bleed
        cover_frame = Frame(0, 0, PAGE_W, PAGE_H,
                            leftPadding=0, rightPadding=0,
                            topPadding=0, bottomPadding=0,
                            id='cover')
        # Body frame — with margins
        body_frame = Frame(MARGIN_L, MARGIN_B, CONTENT_W, PAGE_H - MARGIN_T - MARGIN_B,
                           leftPadding=0, rightPadding=0,
                           topPadding=0, bottomPadding=0,
                           id='body')

        self.addPageTemplates([
            PageTemplate(id='Cover', frames=[cover_frame],
                         onPage=self._draw_cover_bg),
            PageTemplate(id='Body', frames=[body_frame],
                         onPage=self._draw_body_chrome),
        ])

    def _draw_cover_bg(self, canv, doc):
        """Dark background for cover page."""
        canv.saveState()
        # Solid dark bg
        canv.setFillColor(PAGE_BG_DARK)
        canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # Decorative gold accent — top strip
        canv.setFillColor(ACCENT_GOLD)
        canv.rect(0, PAGE_H - 8, PAGE_W, 8, fill=1, stroke=0)
        # Bottom strip
        canv.rect(0, 0, PAGE_W, 8, fill=1, stroke=0)
        # Subtle diagonal gold lines on the left side
        canv.setStrokeColor(ACCENT_GOLD)
        canv.setLineWidth(0.5)
        for i in range(5):
            y = 60*mm + i * 18*mm
            canv.line(15*mm, y, 50*mm + i*5*mm, y + 35*mm)
        # Brand mark — small gold square top right
        canv.setFillColor(ACCENT_GOLD)
        canv.rect(PAGE_W - 28*mm, PAGE_H - 28*mm, 14*mm, 14*mm, fill=1, stroke=0)
        canv.setFillColor(PAGE_BG_DARK)
        canv.setFont("SansArabic-Bold", 11)
        canv.drawCentredString(PAGE_W - 21*mm, PAGE_H - 23*mm, "EV")
        canv.restoreState()

    def _draw_body_chrome(self, canv, doc):
        """Header + footer for body pages."""
        canv.saveState()
        # Top thin gold line
        canv.setStrokeColor(ACCENT_GOLD)
        canv.setLineWidth(1.2)
        canv.line(MARGIN_L, PAGE_H - 14*mm, PAGE_W - MARGIN_R, PAGE_H - 14*mm)

        # Header — brand on right (RTL start), section/page on left
        canv.setFillColor(TEXT_MUTED)
        canv.setFont("SansArabic", 8.5)
        brand = ar("Elite VIP Shop — تقرير تفاصيل المشروع")
        canv.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 12*mm, brand)
        canv.setFont("Naskh", 8.5)
        canv.drawString(MARGIN_L, PAGE_H - 12*mm, f"v0.2.0")

        # Footer
        canv.setStrokeColor(BORDER)
        canv.setLineWidth(0.5)
        canv.line(MARGIN_L, MARGIN_B - 8, PAGE_W - MARGIN_R, MARGIN_B - 8)
        canv.setFillColor(TEXT_MUTED)
        canv.setFont("Naskh", 8.5)
        date_str = ar("30 يوليو 2026")
        canv.drawRightString(PAGE_W - MARGIN_R, MARGIN_B - 16, date_str)
        # Page number (centered, with gold accent dot)
        page_num = canv.getPageNumber()
        canv.setFillColor(ACCENT_GOLD)
        canv.circle(PAGE_W/2, MARGIN_B - 13, 1.5, fill=1, stroke=0)
        canv.setFillColor(TEXT_PRIMARY)
        canv.setFont("SansArabic-Bold", 9)
        canv.drawCentredString(PAGE_W/2, MARGIN_B - 18, f"— {page_num} —")
        canv.restoreState()

    def afterFlowable(self, flowable):
        """Capture headings for TOC."""
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))


# ═══════════════════════════════════════════════════════════════════
#  Cover page
# ═══════════════════════════════════════════════════════════════════
def build_cover(story):
    """Cover page content — placed inside the dark cover frame."""
    # Top spacer to push content down
    story.append(Spacer(1, 70*mm))

    # Brand mark text
    brand = Paragraph(ar_para("ELITE VIP SHOP"), STYLES["cover_meta"])
    story.append(brand)
    story.append(Spacer(1, 4*mm))

    # Gold divider (centered)
    div = Table([['']], colWidths=[40*mm], rowHeights=[2*mm])
    div.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_GOLD),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    # Center the divider
    centered_div = Table([[div]], colWidths=[PAGE_W])
    centered_div.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(centered_div)
    story.append(Spacer(1, 8*mm))

    # Title
    story.append(Paragraph(ar_para("تقرير تفاصيل وتحليل المشروع"),
                           STYLES["cover_title"]))
    story.append(Spacer(1, 6*mm))

    # Subtitle
    story.append(Paragraph(ar_para("منصة تجارة إلكترونية يمنية متكاملة"),
                           STYLES["cover_subtitle"]))
    story.append(Spacer(1, 30*mm))

    # Meta info card
    meta_data = [
        [Paragraph(ar_para("الإصدار"), STYLES["cover_meta_muted"]),
         Paragraph("v0.2.0", STYLES["cover_meta"])],
        [Paragraph(ar_para("تاريخ التقرير"), STYLES["cover_meta_muted"]),
         Paragraph(ar_para("30 يوليو 2026"), STYLES["cover_meta"])],
        [Paragraph(ar_para("الجمهور"), STYLES["cover_meta_muted"]),
         Paragraph(ar_para("المطورون وأدوات التحليل"), STYLES["cover_meta"])],
        [Paragraph(ar_para("نوع التقرير"), STYLES["cover_meta_muted"]),
         Paragraph(ar_para("تقرير شامل قابل للتحليل"), STYLES["cover_meta"])],
    ]
    # Center the meta block
    meta_table = Table(meta_data, colWidths=[40*mm, 60*mm])
    meta_table.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, colors.HexColor('#334155')),
    ]))
    meta_centered = Table([[meta_table]], colWidths=[PAGE_W])
    meta_centered.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(meta_centered)

    story.append(Spacer(1, 30*mm))

    # Footer note
    note = Paragraph(ar_para("هذا التقرير معدّ لإرساله إلى أداة ذكاء اصطناعي للتحليل"),
                     STYLES["cover_meta_muted"])
    story.append(note)
