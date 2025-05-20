import { initializeNeo4j } from "@/utils/server-clients";
import "server-only"


type InsertLocatedInProps = {
    placeId: string;
    cityId: string;
}

const insertLocatedIn = async (props: InsertLocatedInProps) => {
    const neo4j = await initializeNeo4j();
    await neo4j.query(
        `
        MATCH (p:Place {id: $place})
        MATCH (c:City {id: $city})
        MERGE (p)-[:LOCATED_IN]->(c)
        `,
        { place: props.placeId, city: props.cityId }
    )
}
export { insertLocatedIn }

