import json
from pathlib import Path
import unittest

from quote_editorial import apply_editorial, body_key, BLOCK, split_block, RULES


class EditorialTests(unittest.TestCase):
    def test_punctuation_preserves_identity(self):
        for entry in json.loads(RULES.read_text(encoding='utf-8'))['corrections']:
            self.assertEqual(body_key(entry['body']), entry['key'])

    def test_idempotent_and_applied(self):
        bank = Path(__file__).resolve().parents[1] / 'artifacts/blackboard/src/content/quotes.md'
        text = bank.read_text(encoding='utf-8')
        self.assertEqual(apply_editorial(text), text)

    def test_reimport_fragment_is_removed_only_with_full_copy(self):
        rules = json.loads(RULES.read_text(encoding='utf-8'))
        duplicate = rules['duplicates'][0]
        bodies = {entry['key']: entry['body'] for entry in rules['corrections']}
        fragment = '> ' + bodies[duplicate['fragment']] + '\n> — @lichthauch'
        complete = '> ' + bodies[duplicate['complete']] + '\n> — @lichthauch'
        self.assertIn(bodies[duplicate['fragment']], apply_editorial(fragment))
        result = apply_editorial(complete + '\n\n' + fragment)
        self.assertEqual(len(BLOCK.findall(result)), 1)
        self.assertEqual(split_block(BLOCK.findall(result)[0])[0], bodies[duplicate['complete']])

    def test_reimport_with_different_punctuation_is_dropped(self):
        edited = '> one trait of high-achieving people is urgency.\n> — @someone'
        reimport = '> one trait of high achieving people is urgency\n> — @someone'
        result = apply_editorial(f'## S\n\n{edited}\n\n{reimport}\n')
        self.assertEqual(result.rstrip('\n'), f'## S\n\n{edited}')

    def test_unreviewed_text_is_untouched(self):
        text = '## New\n\n> dont auto edit a new capture\n'
        self.assertEqual(apply_editorial(text), text)


if __name__ == '__main__':
    unittest.main()
