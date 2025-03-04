import { consoleLogger } from "@/services/server-only";
import fetch from "node-fetch";
import { inspect } from "util";

describe("getDistance", () => {
  it("should return the distance between two points", async () => {
    const distance = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.OPEN_ROUTE_API_KEY}&start=-4.9702967,34.0541595&end=-4.9896482,34.0105264`,
      {
        method: "GET",
      }
    );
    const data = await distance.json();
    console.log(
      inspect(data, { depth: Infinity, colors: true, numericSeparator: true })
    );
  });
});
