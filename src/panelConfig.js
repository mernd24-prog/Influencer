export const PANEL_MODES = Object.freeze({
  INFLUENCER: "influencer",
});

export const INFLUENCER_TYPES = Object.freeze({
  PARENT: "parent",
  CHILD: "child",
});

export const PANEL_MODE = PANEL_MODES.INFLUENCER;

const COMMON_MODULES = new Set([
  "dashboard",
  "codes",
  "orders",
  "earnings",
  "wallet",
  "bonuses",
  "analytics",
  "profile",
]);

const PARENT_ONLY_MODULES = new Set(["network"]);

export const getAllowedPanelModules = (session = {}) => {
  const backendModules = Array.isArray(session.allowedModules)
    ? session.allowedModules
    : [];
  const isParent = session.influencerType === INFLUENCER_TYPES.PARENT;

  return backendModules.filter((module) => {
    const key = String(module?.key || "").trim();
    if (!key || !module?.label || !String(module?.route || "").startsWith("/app/")) {
      return false;
    }
    if (COMMON_MODULES.has(key)) return true;
    return isParent && PARENT_ONLY_MODULES.has(key);
  });
};

export const getDefaultPanelRoute = (modules = []) =>
  modules.find((module) => module.key === "dashboard")?.route ||
  modules[0]?.route ||
  "/login";
