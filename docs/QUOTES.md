# Quotes: content and sync playbook

Blackboard is the live frontend. Digital Sea remains an unchanged historical snapshot.
The presentation design does not change the quote ingestion contract.

## Source of truth

Raindrop `#quotes` is the first intake source; new Obsidian `#quotes` notes are secondary.
Both feed the canonical vault bank:

`∞∞∞/Metaphysics/Quotes.md` → `artifacts/blackboard/src/content/quotes.md`.

Windows task `NuroctanePollSync` runs `wscript.exe //B //Nologo scripts/poll-sync.vbs`
every 15 minutes. The VBS launcher selects the repository-owned `quotes-pipeline.py`.
The pipeline validates categories, runs the external Hermes ingester through the
versioned classifier adapter, normalizes the bank and publishes through
`run_hermes_quote_sync.py`. The wrapper explicitly targets Blackboard even if a Hermes
upgrade restores its older Digital Sea destination. The shell/PowerShell fallback also
targets Blackboard. The worker's cloud cron has no role in quote ingestion.

## Editorial corrections

1. Edit the canonical bank, not just the frontend copy; otherwise the next sync can
   overwrite the correction.
2. Record reviewed repairs in `scripts/quote-editorial.json`. The keys ignore punctuation
   so a reimported capture matches the same repair. Do not add speculative attributions.
3. `quote_editorial.py` applies those records during category normalization and the
   Hermes sync adapter. It does not auto-edit new, unreviewed quotes.
4. A known cutoff fragment is removed only when its complete counterpart is present.
   Standalone excerpts are not indiscriminately deleted.
5. Refresh the index, mirror the canonical bank to Blackboard and run the checks below.

The September 15, 2026 pass preserves words and capitalization. It repairs punctuation,
adds two verified Maryam Hasnaa credits and removes the duplicate truncated
`@lichthauch` spiritual-industry passage while retaining the full passage.
Existing attributions remain intact. No edits are applied to the Digital Sea snapshot.

### Attribution evidence

| Quote opening | Credit | Evidence |
| --- | --- | --- |
| The reason you have a hard time trusting your intuition | `@Maryamhasnaa` | [Sojourners, July 12, 2019](https://sojo.net/daily-wisdom/verse-and-voice-07122019), corroborated by [The Minds Journal](https://themindsjournal.com/the-reason-you-have-a-hard-time-trusting-your-intuition) |
| One energy that used to trip me up | `@Maryamhasnaa` | [Her archived June 5, 2022 thread](https://threadreaderapp.com/user/Maryamhasnaa) |

Her [official website](https://www.maryamhasnaa.com/) links her Twitter profile.
Some other candidate passages could not be verified; those are left unattributed.
Evidence URLs are also stored beside the two editorial records. The public page links
plain `@handle` credits to their X profiles without inventing specific post URLs.

## Parser parity

Blackboard's `src/lib/parseQuotes.ts` carries the original Digital Sea parser behavior:

- Skip the vault index and whole Obsidian callout runs.
- Treat contiguous `>` lines as one entry; blank `>` lines preserve paragraph breaks.
- Split adjacent quotes at author lines even when a blank separator is missing.
- Keep ordinary list bullets as quote text.
- Recognize supported author separators and trailing empty quote lines.
- Normalize Windows line endings.
- Preserve highlights and wiki-link display labels in the renderer.

The Markdown stays in append order for sync. The UI defaults to newest first within
each category and offers oldest first. Sorting never changes the canonical bank.
The index counts are tested against the same parser the page actually uses.

## Verification

```sh
pnpm check:quotes
python scripts/test_quote_editorial.py
python scripts/test_quote_categories.py
python scripts/normalize-quotes-categories.py --check
```

The classifier check uses the installed local semantic model. The parser and live bank
checks are included in `pnpm build` and do not depend on the vault or that model.

Shell fallback dry run, from Git Bash:

```sh
SYNC_DRY_RUN=1 bash scripts/sync-quotes.sh
```

Dry run normalizes a temporary source and does not commit, push or edit the vault.
A normal run requires publishable `main`, preserves unrelated work and commits only
the quote file. Logs are in `.nur/quotes-pipeline.log` and `.nur/poll-sync.log`.

Do not run a publishing sync while performing unrelated repository changes. Apply and
verify local corrections, then use the required ship process. Confirm the actual live
quote content after Workers Builds completes, not merely a green notification job.
