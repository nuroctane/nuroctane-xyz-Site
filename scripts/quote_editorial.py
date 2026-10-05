"""Apply reviewed quote corrections before either sync path publishes the bank.

Rules match punctuation-insensitive bodies, so re-importing an old capture cannot
undo an editorial correction. New, unreviewed quotes are left untouched.
"""
import hashlib
import json
from pathlib import Path
import re

RULES = Path(__file__).with_name('quote-editorial.json')
BLOCK = re.compile(r'(?m)^>[^\n]*(?:\n>[^\n]*)*')
ATTR = re.compile(r'^(?:—|--|–)\s*(.+)$')


def split_block(block):
    lines = [re.sub(r'^>\s?', '', line) for line in block.splitlines()]
    while lines and not lines[-1].strip():
        lines.pop()
    source = ''
    if lines and (match := ATTR.match(lines[-1].strip())):
        source = match[1]
        lines.pop()
    return '\n'.join(lines).strip(), source


def body_key(body):
    normalized = ''.join(c.lower() for c in body if c.isalnum())
    return hashlib.sha256(normalized.encode()).hexdigest()


def apply_editorial(text):
    rules = json.loads(RULES.read_text(encoding='utf-8'))
    # Match both the captured wording and the reviewed wording. Grammar edits
    # change identity; either version must receive the same credit and dedupe.
    replacements = {}
    for entry in rules['corrections']:
        replacements[entry['key']] = entry
        replacements[body_key(entry['body'])] = entry
        for part in entry.get('parts', []):
            replacements[body_key(part['body'])] = part
    blocks = list(BLOCK.finditer(text))
    present = {body_key(split_block(m[0])[0]) for m in blocks}
    present.update(entry['key'] for entry in rules['corrections']
                   if body_key(entry['body']) in present)
    remove = {entry['fragment'] for entry in rules['duplicates'] if entry['complete'] in present}
    seen = set()

    def replace(match):
        body, source = split_block(match[0])
        key = body_key(body)
        # A re-import of a quote already in the bank (same words, different
        # punctuation) is dropped; the earlier, edited copy wins.
        correction = replacements.get(key)
        if key in remove:
            return ''
        if not correction:
            if key in seen:
                return ''
            seen.add(key)
            return match[0]
        rendered = []
        for part in correction.get('parts', [correction]):
            reviewed_key = body_key(part['body'])
            if reviewed_key in seen:
                continue
            seen.add(reviewed_key)
            # An explicit empty source keeps an unresolved component anonymous;
            # a composite's credit must never bleed into its other components.
            credit = part.get('source', '' if 'parts' in correction else source)
            lines = ['> ' + line if line else '>' for line in part['body'].splitlines()]
            if credit:
                lines.append('> — ' + credit)
            rendered.append('\n'.join(lines))
        return '\n\n'.join(rendered)

    return re.sub(r'\n{3,}', '\n\n', BLOCK.sub(replace, text))
