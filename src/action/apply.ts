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
import ora from "ora";

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

const executeCommand = (commands: string | string[]) => {
  commands = Array.isArray(commands) ? commands : [commands];
  commands.forEach((command) => {
    const spinner = ora(command).start();
    try {
      execSync(command);
      spinner.succeed();
    } catch (error: any) {
      spinner.fail(error.message);
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
    executeCommand(removeAllCommand);

    const depNames = dependencies
      .filter((it) => it.origin === "dep")
      .map((it) => it.name);
    logger.info(`ADD: ${depNames}`);
    const addDepCommands = depNames.map((name) =>
      createCommand(manager, "dep", name)
    );
    executeCommand(addDepCommands);

    const devNames = dependencies
      .filter((it) => it.origin === "dev")
      .map((it) => it.name);
    logger.info(`ADD DEV: ${depNames}`);
    const addDevCommands = devNames.map((name) =>
      createCommand(manager, "dev", name)
    );
    executeCommand(addDevCommands);
  } catch (error: any) {
    logger.error(`ERROR: ${error.message}`);
  }
};
