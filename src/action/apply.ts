import { writeFileSync } from "fs";
import {
  Dependency,
  Package,
  findPackageJson,
  loadDependencies,
  loadPackageJson,
} from "../help/packages.ts";
import { createLogger, Logger } from "../help/logger.ts";
import { execSync } from "child_process";
import { createBackup } from "../help/backup.ts";

type ApplyOptions = {
  directory: string;
  manager: "yarn" | "npm" | string;
  outFile: string;
  scope: string;
};

const COMMAND_FLAG: Record<string, string> = {
  "npm-dev": "npm install -D",
  "npm-dep": "npm install",
  "npm-remove": "npm remove",
  "yarn-dev": "yarn add -D",
  "yarn-dep": "yarn add",
  "yarn-remove": "yarn remove",
};
const EXCLUDE_VERSIONS = [
  // PREFIX
  "/",
  "./",
  "../",
  "file:",
  "*",
];
const createCommand = (
  manager: string,
  scope: string,
  names: string | string[]
) => {
  const command =
    COMMAND_FLAG[`${manager}-${scope}`] || `echo ${manager} ${scope}`;
  const nameList = Array.isArray(names) ? names : [names];
  return `${command} ${nameList.join(" ")}`;
};

const executeCommands = (commands: string | string[], logger: Logger) => {
  commands = Array.isArray(commands) ? commands : [commands];
  commands.forEach((command) => {
    try {
      logger.info(`Ejecutando: ${command}`);
      execSync(command, { stdio: "inherit" });
    } catch (error) {
      logger.error(`ERROR: ${command}`, error);
    }
  });
};

const getPackageInfo = (directory: string): [string, Package] => {
  const pkgFile = findPackageJson(directory);
  if (!pkgFile) {
    throw new Error(`<<package.json>> no encontrado`);
  }
  const pkg = loadPackageJson(pkgFile);
  if (!pkg) {
    throw new Error(`<<package.json>> no se pudo leer: ${pkgFile}`);
  }
  return [pkgFile, pkg];
};

const allodDependency = (it: Dependency) => {
  return !EXCLUDE_VERSIONS.find((rule) => it.version.startsWith(rule));
};

export const applyAction = (opts: ApplyOptions) => {
  const { directory, manager, outFile, scope } = opts;
  const logger = createLogger({ outFile });
  try {
    logger.info(`Scan: ${directory}`);

    const [pkgFile, pkg] = getPackageInfo(directory);

    createBackup(pkgFile, pkg, logger);

    const dependencies = loadDependencies(pkg).filter(allodDependency);

    const removeNames = dependencies.map((it) => it.name).join(" ");
    const removeAllCommand = createCommand(manager, "remove", removeNames);
    logger.info(`REMOVE: ${removeNames}`);
    executeCommands(removeAllCommand, logger);

    const depNames = dependencies
      .filter((it) => it.origin === "dep")
      .map((it) => it.name);
    const addDepCommands = depNames.map((name) =>
      createCommand(manager, "dep", name)
    );
    logger.info(`ADD: ${depNames}`);
    executeCommands(addDepCommands, logger);

    const devNames = dependencies
      .filter((it) => it.origin === "dev")
      .map((it) => it.name);
    const addDevCommands = devNames.map((name) =>
      createCommand(manager, "dev", name)
    );
    logger.info(`ADD DEV: ${depNames}`);
    executeCommands(addDevCommands, logger);
  } catch (error: any) {
    logger.error(`ERROR: ${error.message}`);
  }
};
