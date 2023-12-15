import { program, Option } from "commander";
import { applyAction } from "./action/apply";
//import { version, name, description } from "../package.json";

//program.name(name).version(version).description(description);

//Apply
program
  .command("apply")
  .description("Apply the upgrade dependencies")
  .option("-m, --manager <manager>", "Manager Tool", "yarn")
  .option("-o, --outFile <outFile>", "Output File", "")
  .option("-s, --scope <scope>", "Scope Update [dep, dev, peer, all]", "dep")
  .option("-d, --directory <directory>", "Directory", process.cwd())
  .action(applyAction);

//Execute
program.parse(process.argv);
