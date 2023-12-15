import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Package } from "./packages";
import { dirname } from "path";
import { Logger } from "./logger";

export const createBackup = (pkgFile: string, pkg: Package, logger: Logger) => {
  const backup = {
    name: pkg.name,
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
    peerDependencies: pkg.peerDependencies,
  };
  const date = new Date();
  const format = date.toISOString().replace(/:|-|\./gi, "");
  const backupFile = pkgFile.replace(
    "package.json",
    `.dep-force/${format}.json`
  );
  const dir = dirname(backupFile);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const content = JSON.stringify(backup, null, 2);
  writeFileSync(backupFile, content);
  logger.info(`BACKUP : ${backupFile}`);
};
