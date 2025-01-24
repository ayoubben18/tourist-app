import { inspect } from "node:util";

export const consoleLogger = (data: any) => {
  console.log(
    inspect(data, { depth: Infinity, colors: true, numericSeparator: true })
  );
};
