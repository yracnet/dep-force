# UP Force

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed.

```bash
npm install -g up-force
```

## Motivation

In many projects, keeping dependencies up-to-date is essential for security, performance, and leveraging the latest features. This tool aims to simplify the process of upgrading all dependencies in a project, disregarding any advisories or warnings. It streamlines the upgrade workflow, allowing users to focus on ensuring compatibility and taking advantage of the latest improvements without being interrupted by advisory messages.

By using this tool, you can efficiently upgrade your project's dependencies with minimal friction, helping you maintain a healthy and current software ecosystem.

## Usage

### Apply

To apply the upgrade for dependencies, use the following command:

```bash
up-force apply -m <manager> -o <outFile> -d <directory>
```

Options:

- `-m, --manager <manager>`: Specify the package manager tool (e.g., 'yarn'). Default is 'yarn'.
- `-o, --outFile <outFile>`: Specify the output file for logging (optional).
- `-d, --directory <directory>`: Specify the target directory. Default is the current working directory.

### Execute

Run the following command to execute the program:

```bash
up-force apply
```

This will parse the command-line arguments and execute the corresponding actions.

## Examples

Provide examples of how to use your tool for common use cases.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
