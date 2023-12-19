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
  dependencies: string[],
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

const executeCommand = (commands: string | string[], logger: Logger) => {
  commands = Array.isArray(commands) ? commands : [commands];
  commands.forEach((command) => {
    logger.info(`EXECUTE: ${command}`);
    const spinner = ora(`> ${command}\n`).start();
    try {
      execSync(command);
      spinner.succeed();
      logger.info(`SUCCESS: ${command}\n`);
    } catch (error: any) {
      spinner.fail(`ERROR : ${error.message}`);
      logger.error(`ERROR : ${command}, cause: ${error.message}\n`);
    }
  });
};

const getPackageInfo = (directory: string): [string, Package] => {
  const pkgFile = findPackageJson(directory);
  if (!pkgFile) {
    throw new Error(`<package.json> not found`);
  }
  const pkg = loadPackageJson(pkgFile);
  if (!pkg) {
    throw new Error(`Unable to read <package.json>: ${pkgFile}`);
  }
  return [pkgFile, pkg];
};

const allodDependency = (it: Dependency) => {
  return !EXCLUDE_VERSIONS.find((rule) => it.version.startsWith(rule));
};

export const applyAction = (opts: ApplyOptions) => {
  const { directory, manager, outFile, dependencies = [] } = opts;
  const logger = createLogger({ outFile });
  try {
    logger.info(`ROOT   : ${directory}`);

    const [pkgFile, pkg] = getPackageInfo(directory);

    logger.info(`FILE   : ${pkgFile}`);

    createBackup(pkgFile, pkg, logger);

    const pkgDependencies = loadDependencies(pkg)
                            .filter(allodDependency)
                            .filter(it => dependencies.length === 0 || dependencies.some(d => d === it.name));

    const removeNames = pkgDependencies.map((it) => it.name)
    .join(" ");
    const removeAllCommand = createCommand(manager, "remove", removeNames);

    logger.info(`REMOVE : ${removeNames}\n`);
    executeCommand(removeAllCommand, logger);

    const depNames = pkgDependencies
      .filter((it) => it.origin === "dep")
      .map((it) => it.name);

    logger.info(`ADD    : ${depNames.join(" ")}\n`);
    const addDepCommands = depNames.map((name) =>
      createCommand(manager, "dep", name)
    );
    executeCommand(addDepCommands, logger);

    const devNames = pkgDependencies
      .filter((it) => it.origin === "dev")
      .map((it) => it.name);

    logger.info(`ADD DEV: ${depNames.join(" ")}\n`);
    const addDevCommands = devNames.map((name) =>
      createCommand(manager, "dev", name)
    );
    executeCommand(addDevCommands, logger);
  } catch (error: any) {
    logger.error(`ERROR  : ${error.message}`);
  }
};
