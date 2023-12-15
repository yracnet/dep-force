import winston, { Logger as InternalLogger } from "winston";
import TransportStream from "winston-transport";
export type LoggerOptions = {
  outFile: string;
};
const { Console, File } = winston.transports;

export type Logger = InternalLogger;
export const createLogger = (opts: LoggerOptions): Logger => {
  const { outFile = "" } = opts;
  const transports: TransportStream[] = [
    new Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ];
  if (outFile) {
    transports.push(new File({ filename: outFile, level: "info" }));
  }

  return winston.createLogger({
    transports,
  });
};
