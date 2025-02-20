import { initializeNeo4j } from "@/utils/server-clients";

describe("Shortest Path", () => {
  jest.setTimeout(10000);
  it("should find the shortest path between two nodes", async () => {
    const placeIds = [
      "ChIJecuo7NVaoA0RYCaneAFhs1w",
      "ChIJw4E8-tVaoA0RNIh0gpFwc4I",
      "ChIJ-yRwGstboA0RmV2ovoUDL48",
      "ChIJ43mc2KRaoA0Ri3WI0JZESnc",
    ];

    const neo4j = await initializeNeo4j();
    const result = await neo4j.query(
      `
    WITH $placeIds as ids
MATCH (places:Place)
WHERE places.id IN ids
WITH places, ids
ORDER BY CASE places.id WHEN ids[0] THEN 0 ELSE 1 END, places.id

WITH collect(places) as orderedPlaces
UNWIND range(0, size(orderedPlaces)-2) as i
WITH orderedPlaces[i] as current, orderedPlaces[i+1] as next
MATCH path = shortestPath((current)-[:CONNECTS_TO*]->(next))
WITH [p in nodes(path)] as route
UNWIND range(0, size(route)-2) as i
WITH route[i] as current, route[i+1] as next
MATCH (current)-[r:CONNECTS_TO]->(next)
RETURN 
    current.name as currentStop,
    current.id as currentId,
    next.name as nextStop,
    next.id as nextId,
    r.distance as distance,
    current.latitude as currentLat,
    current.longitude as currentLng,
    next.latitude as nextLat,
    next.longitude as nextLng
   `,
      { placeIds }
    );
    console.log(result);
  });
});
