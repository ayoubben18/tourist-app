"use server";
import { Client } from "@googlemaps/google-maps-services-js";
import { createCircuitSchema } from "@/utils/schemas";
import { authenticatedAction } from "../server-only";
import { initializeNeo4j } from "@/utils/server-clients";

const createCircuit = authenticatedAction.create(
  createCircuitSchema,
  async (props, { userId }) => {
    const { city, places, startingPlace, startTime } = props;
    const neo4j = await initializeNeo4j();
    const client = new Client();

    // Check if city exists, if not create it
    let cityNode = await neo4j.query(`MATCH (c:City {id: $city}) RETURN c`, {
      city,
    });

    if (!cityNode.length) {
      const response = await client.placeDetails({
        params: {
          place_id: city,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });

      await neo4j.query(
        `CREATE (c:City {id: $city, name: $name, country: $country, coordinates: $coordinates}) RETURN c`,
        {
          city,
          name: response.data.result.name,
          country: response.data.result.address_components?.[0]?.short_name,
          coordinates: JSON.stringify(response.data.result.geometry?.location),
        }
      );
    }

    // Create places if they don't exist and link them to the city
    for (const place of places) {
      let placeNode = await neo4j.query(
        `MATCH (p:Place {id: $place}) RETURN p`,
        { place }
      );

      if (!placeNode.length) {
        const response = await client.placeDetails({
          params: {
            place_id: place,
            key: process.env.GOOGLE_MAPS_API_KEY!,
          },
        });

        await neo4j.query(
          `
          CREATE (p:Place {id: $place, name: $name, coordinates: $coordinates})
          WITH p
          MATCH (c:City {id: $city})
          CREATE (p)-[:LOCATED_IN]->(c)
          RETURN p
          `,
          {
            place,
            name: response.data.result.name,
            city,
            coordinates: JSON.stringify(
              response.data.result.geometry?.location
            ),
          }
        );
      } else {
        // If place exists, ensure it's connected to the city
        await neo4j.query(
          `
          MATCH (p:Place {id: $place})
          MATCH (c:City {id: $city})
          MERGE (p)-[:LOCATED_IN]->(c)
          `,
          { place, city }
        );
      }
    }

    // Create relationships between places with distances
    for (let i = 0; i < places.length; i++) {
      for (let j = i + 1; j < places.length; j++) {
        const origin = places[i];
        const destination = places[j];

        // Check if relationship already exists
        const existingRelation = await neo4j.query(
          `
          MATCH (p1:Place {id: $origin})-[r:CONNECTS_TO]-(p2:Place {id: $destination})
          RETURN r
          `,
          { origin, destination }
        );

        if (!existingRelation.length) {
          //   try {
          //     const testResponse = await client.distancematrix({
          //       params: {
          //         origins: [`place_id:${origin}`],
          //         destinations: [`place_id:${destination}`],
          //         key: process.env.GOOGLE_MAPS_API_KEY!,
          //       },
          //     });
          //     console.log("Distance Matrix API response:", testResponse.status);
          //   } catch (error: any) {
          //     console.error("Google Maps API Error:", {
          //       status: error.response?.status,
          //       message: error.response?.data?.error_message || error.message,
          //     });
          //     throw error;
          //   }

          // Mock distance matrix function for development/testing
          const getMockDistanceMatrix = (
            origin: string,
            destination: string
          ) => {
            // Return mock values: ~2km distance and ~5min duration
            return {
              distance: { value: 2000 }, // meters
              duration: { value: 300 }, // seconds
            };
          };

          // Use mock values instead
          const element = getMockDistanceMatrix(origin, destination);
          const distance = element.distance.value;
          const duration = element.duration.value;

          // Create bidirectional relationships with distance and duration
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
            {
              origin,
              destination,
              distance,
              duration,
            }
          );
        }
      }
    }
  }
);

export { createCircuit };
