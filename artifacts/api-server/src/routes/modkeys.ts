import { Router } from "express";
import { kvGet, kvSet, kvDelete } from "@workspace/kv";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

const CONFIG_PREFIX = "modkeys:config:";

function userConfigsKey(githubId: number): string {
  return `modkeys:user:${githubId}:configs`;
}

interface ModkeysConfig {
  id: string;
  userId: number;
  name: string;
  state: Record<string, unknown>;
  layout: string;
  createdAt: string;
  updatedAt: string;
}

function extractLayout(state: Record<string, unknown>): string {
  return (state.layout as string) ?? "75";
}

router.get("/modkeys/configs", requireAuth, async (req, res) => {
  try {
    const listKey = userConfigsKey(req.user!.githubId);
    const configIds = (await kvGet<string[]>(listKey)) ?? [];

    const configs = (
      await Promise.all(
        configIds.map(async (id) => {
          const data = await kvGet<ModkeysConfig>(`${CONFIG_PREFIX}${id}`);
          if (!data) return null;
          return {
            id: data.id,
            name: data.name,
            layout: data.layout,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        }),
      )
    ).filter(Boolean);

    return res.json({ configs });
  } catch (err) {
    logger.error({ err }, "Failed to list configs");
    return res.status(500).json({ error: "Failed to list configs" });
  }
});

router.post("/modkeys/configs", requireAuth, async (req, res) => {
  try {
    const { name, state } = req.body;
    if (!state) return res.status(400).json({ error: "Missing state" });

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const config: ModkeysConfig = {
      id,
      userId: req.user!.githubId,
      name: name ?? `Build ${now.slice(0, 10)}`,
      state,
      layout: extractLayout(state),
      createdAt: now,
      updatedAt: now,
    };

    await kvSet(`${CONFIG_PREFIX}${id}`, config);

    const listKey = userConfigsKey(req.user!.githubId);
    const configIds = (await kvGet<string[]>(listKey)) ?? [];
    configIds.unshift(id);
    await kvSet(listKey, configIds);

    return res.status(201).json({ config });
  } catch (err) {
    logger.error({ err }, "Failed to save config");
    return res.status(500).json({ error: "Failed to save config" });
  }
});

router.get("/modkeys/configs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const config = await kvGet<ModkeysConfig>(`${CONFIG_PREFIX}${id}`);
    if (!config) return res.status(404).json({ error: "Config not found" });
    if (config.userId !== req.user!.githubId) return res.status(403).json({ error: "Forbidden" });
    return res.json({ config });
  } catch (err) {
    logger.error({ err }, "Failed to get config");
    return res.status(500).json({ error: "Failed to get config" });
  }
});

router.put("/modkeys/configs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state } = req.body;

    const config = await kvGet<ModkeysConfig>(`${CONFIG_PREFIX}${id}`);
    if (!config) return res.status(404).json({ error: "Config not found" });
    if (config.userId !== req.user!.githubId) return res.status(403).json({ error: "Forbidden" });

    const updated: ModkeysConfig = {
      ...config,
      name: name ?? config.name,
      state: state ?? config.state,
      layout: state ? extractLayout(state) : config.layout,
      updatedAt: new Date().toISOString(),
    };

    await kvSet(`${CONFIG_PREFIX}${id}`, updated);
    return res.json({ config: updated });
  } catch (err) {
    logger.error({ err }, "Failed to update config");
    return res.status(500).json({ error: "Failed to update config" });
  }
});

router.delete("/modkeys/configs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const config = await kvGet<{ userId: number }>(`${CONFIG_PREFIX}${id}`);
    if (!config) return res.status(404).json({ error: "Config not found" });
    if (config.userId !== req.user!.githubId) return res.status(403).json({ error: "Forbidden" });

    await kvDelete(`${CONFIG_PREFIX}${id}`);

    const listKey = userConfigsKey(req.user!.githubId);
    const configIds = (await kvGet<string[]>(listKey)) ?? [];
    await kvSet(
      listKey,
      configIds.filter((cId) => cId !== id),
    );

    return res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete config");
    return res.status(500).json({ error: "Failed to delete config" });
  }
});

export default router;
