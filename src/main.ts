#!/usr/bin/env node

import { program } from "commander";
import { applyAction } from "./action/apply";
import { version, name, description } from "../package.json";

program.name(name).version(version).description(description);

//Apply
program
  .command("apply")
  .description("Apply the upgrade for dependencies.")
  .option(
    "-m, --manager <manager>",
    "Specify the package manager tool (e.g., 'yarn').",
    "yarn"
  )
  .option(
    "-d, --dependencies <dependencies...>",
    "Specify the dependencies names to upgrade.",
  )
  .option(
    "-o, --outFile <outFile>",
    "Specify the output file for logging (optional).",
    ""
  )
  .option(
    "-d, --directory <directory>",
    "Specify the target directory (default: current working directory).",
    process.cwd()
  )
  // .option("-s, --scope <scope>", "Scope Update [dep, dev, peer, all]", "dep")
  .action(applyAction);

//Execute
program.parse(process.argv);
