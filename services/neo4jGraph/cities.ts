import "server-only";

import { initializeNeo4j } from "@/utils/server-clients";
import { authenticatedAction } from "../server-only";

const getAllCities =
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
  };

type InsertCityProps = {
  city: string;
  name?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

const insertNeo4jCity = async (props: InsertCityProps) => {
  const neo4j = await initializeNeo4j();
  await neo4j.query(
    'CREATE (c:City {id: $city, name: $name, country: $country, latitude: $latitude, longitude: $longitude}) RETURN c',
    {
      city: props.city,
      name: props.name,
      country: props.country,
      latitude: props.latitude,
      longitude: props.longitude,
    }
  );
}

export { getAllCities, insertNeo4jCity } 