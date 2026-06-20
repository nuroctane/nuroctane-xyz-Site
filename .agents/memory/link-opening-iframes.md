---
name: Opening links reliably inside iframe contexts
description: window.open() is blocked in Replit preview iframes; use native anchor elements instead
---

The Replit canvas preview embeds the app in an iframe. `window.open(url, '_blank')` from inside an iframe is blocked by browsers as a popup unless the iframe has `allow="popups"` — which Replit's preview does not set.

**The correct fix:** Use a real `<a>` element with `href` and `target="_blank"` instead of `window.open()`. Native anchor navigation is honored even inside iframes.

```tsx
const Tag = hasLink ? 'a' : 'div';
const linkProps = hasLink ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};
return <Tag {...linkProps} onClick={handleClickForAnimation}>...</Tag>;
```

**Do NOT use:** `window.open()` inside a `setTimeout` (doubly blocked — user gesture is lost), `window.open()` at all for anything that needs to work in iframe/preview contexts.
