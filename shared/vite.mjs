/**
 * Design-independent site content, wired into every design's Vite build.
 *
 * Quotes, books and the resume are data, not design: the quotes pipeline and
 * resume edits write them once, here, and whichever design is selected serves
 * the current copy. `@shared/<file>.md?raw` imports shared/content, and
 * shared/public (resume download, robots.txt, sitemap.xml) is served in dev
 * and copied into the build output beside the design's own public files.
 */
import { cpSync, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const content = path.join(here, "content");
const publicDir = path.join(here, "public");

export function sharedSite() {
  let outDir = "";
  return {
    name: "nuroctane-shared-site",
    config() {
      return { resolve: { alias: { "@shared": content } } };
    },
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
        const file = path.join(publicDir, pathname);
        if (!file.startsWith(publicDir + path.sep)) return next();
        if (!existsSync(file) || !statSync(file).isFile()) return next();
        res.end(readFileSync(file));
      });
    },
    writeBundle() {
      cpSync(publicDir, outDir, { recursive: true });
    },
  };
}
