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
    replacements = {entry['key']: entry for entry in rules['corrections']}
    blocks = list(BLOCK.finditer(text))
    present = {body_key(split_block(m[0])[0]) for m in blocks}
    remove = {entry['fragment'] for entry in rules['duplicates'] if entry['complete'] in present}

    def replace(match):
        body, source = split_block(match[0])
        key = body_key(body)
        if key in remove:
            return ''
        correction = replacements.get(key)
        if not correction:
            return match[0]
        body = correction['body']
        source = correction.get('source') or source
        lines = ['> ' + line if line else '>' for line in body.splitlines()]
        if source:
            lines.append('> — ' + source)
        return '\n'.join(lines)

    return BLOCK.sub(replace, text)
