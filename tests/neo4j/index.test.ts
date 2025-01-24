import { initializeNeo4j } from "@/utils/server-clients";
import { consoleLogger } from "@/utils/server-lib";

describe("neo4j", () => {
  jest.setTimeout(10000);
  // should insert data into neo4j
  it("should insert data into neo4j", async () => {
    const neo4jGraph = await initializeNeo4j();
    const result = await neo4jGraph.query("CREATE (n:Person {name: 'John'})");
    expect(result).toBeDefined();
  });

  it("should query data from neo4j", async () => {
    const neo4jGraph = await initializeNeo4j();
    const result = await neo4jGraph.query("MATCH (n:Person) RETURN n");
    consoleLogger(result);
    expect(result).toBeDefined();
  });
  // should delete data from neo4j
  it("should delete data from neo4j", async () => {
    const neo4jGraph = await initializeNeo4j();
    const result = await neo4jGraph.query("MATCH (n:Person) DELETE n");
    expect(result).toBeDefined();
  });
});
