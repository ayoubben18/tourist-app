import "neo4j-driver";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { serverEnv } from "./server-env";

let neo4jGraph: Neo4jGraph;

const initializeNeo4j = async () => {
  neo4jGraph = await Neo4jGraph.initialize({
    url: process.env.NEO4J_HOST!,
    username: process.env.NEO4J_USERNAME!,
    password: process.env.NEO4J_PASSWORD!,
  });
  return neo4jGraph;
};

export { initializeNeo4j };
