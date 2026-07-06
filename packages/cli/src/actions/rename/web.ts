import path from "node:path";
import { log } from "@clack/prompts";
import fs from "fs-extra";
import type { ScaffoldOptions } from "../../prompts.js";

export async function updateSiteConfig(
  projectDir: string,
  opts: ScaffoldOptions
) {
  const sitePath = path.join(
    projectDir,
    "packages",
    "core",
    "src",
    "config",
    "site.ts"
  );
  if (!(await fs.pathExists(sitePath))) {
    return;
  }

  let content = await fs.readFile(sitePath, "utf-8");

  // Explicitly replace template identity within this single file
  content = content.replaceAll("Hyperion", opts.projectNamePascal);
  content = content.replaceAll(
    "BhagirathsinhRana378/hyperion",
    `${opts.githubUser}/${opts.projectName}`
  );
  content = content.replaceAll("BhagirathsinhRana378", opts.githubUser);
  content = content.replaceAll("hyperion", opts.projectName);

  await fs.writeFile(sitePath, content, "utf-8");
}

export async function updateRootPackageJson(
  projectDir: string,
  opts: ScaffoldOptions
) {
  const rootPkgPath = path.join(projectDir, "package.json");
  if (!(await fs.pathExists(rootPkgPath))) {
    return;
  }

  try {
    const pkg = await fs.readJson(rootPkgPath);
    pkg.name = opts.projectName;
    await fs.writeJson(rootPkgPath, pkg, { spaces: 2 });
  } catch (err: unknown) {
    log.warn(
      `Failed to update root package.json name: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export async function updateReleasePleaseConfig(
  projectDir: string,
  opts: ScaffoldOptions
) {
  const configPath = path.join(projectDir, "release-please-config.json");
  if (!(await fs.pathExists(configPath))) {
    return;
  }

  try {
    const config = await fs.readJson(configPath);
    if (config.packages?.["."]) {
      config.packages["."]["package-name"] = opts.projectName;
      config.packages["."].component = opts.projectName;
    }
    await fs.writeJson(configPath, config, { spaces: 2 });
  } catch (err: unknown) {
    log.warn(
      `Failed to update release-please-config.json name: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
