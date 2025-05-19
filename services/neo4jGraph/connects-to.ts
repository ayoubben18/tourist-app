import { initializeNeo4j } from "@/utils/server-clients";
import "server-only"

type InsertConnectsToProps = {
    origin: string;
    destination: string;
    distance: number;
    duration: number;
}

type GetConnectsToProps = {
    origin: string;
    destination: string;
}


const insertConnectsTo = async (props: InsertConnectsToProps) => {
    const neo4j = await initializeNeo4j();
    await neo4j.query(
        `
        MATCH (p1:Place {id: $origin})
        MATCH (p2:Place {id: $destination})
        MERGE (p1)-[:CONNECTS_TO {
          distance: $distance,
          duration: $duration
        }]->(p2)
        MERGE (p2)-[:CONNECTS_TO {
          distance: $distance,
          duration: $duration
        }]->(p1)
        `,
        props
    )
}

const getConnectsTo = async (props: GetConnectsToProps) => {
    const neo4j = await initializeNeo4j();
    const result = await neo4j.query(
        `
        MATCH (p1:Place {id: $origin})-[r:CONNECTS_TO]-(p2:Place {id: $destination})
        RETURN r
        `,
        props
    )

    return result
}

export { insertConnectsTo, getConnectsTo }