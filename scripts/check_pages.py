#!/usr/bin/env python3
"""Quick VLM check of selected PDF pages."""
import subprocess, json, sys

pages_to_check = ['04', '07', '08', '19', '26', '28']
prompt = ("Briefly describe this PDF page in 2-3 sentences: "
          "(1) main heading at top, (2) main content visible, "
          "(3) estimated percentage of the page that is blank/empty (0-100).")

for p in pages_to_check:
    print(f"\n=== Page {p} ===", flush=True)
    r = subprocess.run(
        ['z-ai', 'vision', '-p', prompt, '-i', f'/tmp/pdf-check/page-{p}.jpg'],
        capture_output=True, text=True, timeout=90
    )
    out = r.stdout + "\n" + r.stderr
    # Find first JSON object - look for the one with "choices"
    import re
    m = re.search(r'\{[^{}]*"choices"[^{}]*\{"finish_reason".*?"content"\s*:\s*"(.*?)"[^{}]*\}[^{}]*\}', out, re.DOTALL)
    if m:
        content = m.group(1).encode().decode('unicode_escape')
        print(content)
        continue
    print("NO MATCH. First 500 chars:")
    print(out[:500])
