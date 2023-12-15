import fs from "fs";
import path from "path";

export const findPackageJson = (currentDir: string): string | null => {
  const packageJsonPath = path.join(currentDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    return packageJsonPath;
  }
  const parentDir = path.dirname(currentDir);
  if (parentDir === currentDir) {
    return null;
  }
  return findPackageJson(parentDir);
};

export const loadPackageJson = (filePath: string): Package | null => {
  try {
    const packageJsonContent: string = fs.readFileSync(filePath, "utf8");
    const packageJson: Package = JSON.parse(packageJsonContent);
    return packageJson;
  } catch (error: any) {
    console.error(`Error loading package.json: ${error.message}`);
    return null;
  }
};

export type Dependency = {
  name: string;
  version: string;
  origin: string;
  newVersion?: string;
};

export type Package = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

export const loadDependencies = (pkg: any): Dependency[] => {
  const create = (origin: string, dependencies: any = {}): Dependency[] => {
    return Object.entries<string>(dependencies).map<Dependency>((it) => {
      const [name, version] = it;
      return { name, version, origin };
    });
  };
  const dep1 = create("dep", pkg.dependencies);
  const dep2 = create("dep", pkg.devDependencies);
  const dep3 = create("dep", pkg.peerDependencies);
  return [...dep1, ...dep2, ...dep3];
};
