import { initializeNeo4j } from "@/utils/server-clients";
import { authenticatedAction } from "../server-only";

const getAllCities = authenticatedAction.create(
    async () => {
    try {
        const neo4j = await initializeNeo4j();
        const result = await neo4j.query(
          `MATCH (c:City)
           RETURN c { .id, .name, .publicTransport, .country } 
           ORDER BY c.name`
        );
    
        const cities = result.map(item => item.c);
        console.log(cities);
        return cities;
      } catch (error) {
        console.error(error);
        return Response.json(
          { error: "Failed to fetch cities" },
          { status: 500 }
        );
      }
})

export {getAllCities}