"use server";
import { Client } from "@googlemaps/google-maps-services-js";
import { createCircuitSchema } from "@/utils/schemas";
import { authenticatedAction, consoleLogger } from "../server-only";
import { initializeNeo4j } from "@/utils/server-clients";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  bookings,
  circuit_points,
  circuits,
  cities,
  points_of_interest,
} from "@/db/migrations/schema";

const createCircuit = authenticatedAction.create(
  createCircuitSchema,
  async (props, { userId }) => {
    const {
      city,
      places,
      startingPlace,
      startTime,
      isPublic,
      guideId,
      name,
      description,
    } = props;
    let cityId = 0;
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

      consoleLogger(response.data.result);

      await neo4j.query(
        `CREATE (c:City {id: $city, name: $name, country: $country, latitude: $latitude, longitude: $longitude}) RETURN c`,
        {
          city,
          name: response.data.result.name,
          country: response.data.result.address_components?.[0]?.short_name,
          latitude: response.data.result.geometry?.location.lat,
          longitude: response.data.result.geometry?.location.lng,
        }
      );

      await db.transaction(async (tx) => {
        const [cityRecord] = await tx
          .select()
          .from(cities)
          .where(eq(cities.google_place_id, city));

        if (!cityRecord) {
          const [insertedCity] = await tx
            .insert(cities)
            .values({
              google_place_id: city,
              // image_url: response.data.result.photos[0].,
              name: response.data.result.name,
              country: response.data.result.address_components?.[0]?.short_name,
              description: response.data.result.vicinity,
              coordinates: [
                response.data.result.geometry?.location.lat,
                response.data.result.geometry?.location.lng,
              ],
            })
            .returning();
          cityId = insertedCity.id;
        } else {
          cityId = cityRecord.id;
        }
      });
    } else {
      const [cityRecord] = await db
        .select()
        .from(cities)
        .where(eq(cities.google_place_id, city));
      cityId = cityRecord.id;
    }
    const placesToInsert = [...places, startingPlace];

    // Create places if they don't exist and link them to the city
    for (const place of placesToInsert) {
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
        await db.transaction(async (tx) => {
          const [placeRecord] = await tx
            .select()
            .from(points_of_interest)
            .where(eq(points_of_interest.google_place_id, place));

          if (!placeRecord) {
            const [insertedPlace] = await tx
              .insert(points_of_interest)
              .values({
                google_place_id: place,
                name: response.data.result.name,
                description: response.data.result.vicinity,
                coordinates: [
                  response.data.result.geometry?.location.lat,
                  response.data.result.geometry?.location.lng,
                ],
                city_id: cityId,
                category: response.data.result.types?.[0],
                estimated_duration: response.data.result.opening_hours
                  ? response.data.result.opening_hours.weekday_text.length
                  : 0,
                address: response.data.result.formatted_address,
                opening_hours: response.data.result.opening_hours,
              })
              .returning();
          }
        });
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
    for (let i = 0; i < placesToInsert.length; i++) {
      for (let j = i + 1; j < placesToInsert.length; j++) {
        const origin = placesToInsert[i];
        const destination = placesToInsert[j];

        // Check if relationship already exists
        const existingRelation = await neo4j.query(
          `
          MATCH (p1:Place {id: $origin})-[r:CONNECTS_TO]-(p2:Place {id: $destination})
          RETURN r
          `,
          { origin, destination }
        );

        if (!existingRelation.length) {
          const calculateDistance = async (
            origin: string,
            destination: string
          ) => {
            // Get place details for both points to extract coordinates
            const originResponse = await client.placeDetails({
              params: {
                place_id: origin,
                key: process.env.GOOGLE_MAPS_API_KEY!,
              },
            });

            const destResponse = await client.placeDetails({
              params: {
                place_id: destination,
                key: process.env.GOOGLE_MAPS_API_KEY!,
              },
            });

            const originLat = originResponse.data.result.geometry?.location.lat;
            const originLng = originResponse.data.result.geometry?.location.lng;
            const destLat = destResponse.data.result.geometry?.location.lat;
            const destLng = destResponse.data.result.geometry?.location.lng;

            // Calculate distance using Haversine formula
            const R = 6371e3; // Earth's radius in meters
            const φ1 = ((originLat || 0) * Math.PI) / 180;
            const φ2 = ((destLat || 0) * Math.PI) / 180;
            const Δφ = (((destLat || 0) - (originLat || 0)) * Math.PI) / 180;
            const Δλ = (((destLng || 0) - (originLng || 0)) * Math.PI) / 180;

            const a =
              Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c; // distance in meters

            // Estimate duration based on walking speed (5 km/h = ~1.4 m/s)
            const walkingSpeedMps = 1.4; // meters per second
            const duration = distance / walkingSpeedMps;

            return {
              distance: { value: Math.round(distance) },
              duration: { value: Math.round(duration) },
            };
          };

          // Use real distance calculation
          const element = await calculateDistance(origin, destination);
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

    const paths = await getShortestPath([startingPlace, ...places]);

    let circuitId = 0;
    let estimatedDuration = paths.reduce((acc, path) => acc + path.duration, 0);
    let distance = parseFloat(
      paths.reduce((acc, path) => acc + path.distance, 0).toString()
    ).toFixed(2);
    await db.transaction(async (tx) => {
      const [circuitRecord] = await tx
        .insert(circuits)
        .values({
          name,
          description,
          city_id: cityId,
          creator_id: userId,
          is_public: isPublic,
          distance,
          estimated_duration: estimatedDuration,
        })
        .returning();
      console.log("circuitRecord", circuitRecord);

      await tx.insert(bookings).values({
        booking_date: new Date(startTime).toISOString(),
        total_price: "100",
        circuit_id: circuitRecord.id,
        tourist_id: userId,
        guide_id: guideId,
        status: "pending",
      });
      console.log("booking");
      circuitId = circuitRecord.id;
    });

    for (let i = 0; i < paths.length; i++) {
      const current = paths[i];
      const [poi] = await db
        .select()
        .from(points_of_interest)
        .where(eq(points_of_interest.google_place_id, current.currentId));

      await db.insert(circuit_points).values({
        circuit_id: circuitId,
        poi_id: poi.id,
        sequence_order: i + 1,
      });
      if (i === paths.length - 1) {
        const current = paths[i];
        const [poi] = await db
          .select()
          .from(points_of_interest)
          .where(eq(points_of_interest.google_place_id, current.nextId));

        await db.insert(circuit_points).values({
          circuit_id: circuitId,
          poi_id: poi.id,
          sequence_order: i + 2,
        });
      }
    }

    return circuitId;
  }
);

type PathSegment = {
  currentStop: string;
  currentId: string;
  nextStop: string;
  nextId: string;
  distance: number;
  duration: number;
  currentLat?: number;
  currentLng?: number;
  nextLat?: number;
  nextLng?: number;
};

const getShortestPath = async (placesIds: string[]) => {
  const neo4j = await initializeNeo4j();

  const result = await neo4j.query(
    `
  WITH $placesIds as ids
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
  r.duration as duration,
  current.latitude as currentLat,
  current.longitude as currentLng,
  next.latitude as nextLat,
  next.longitude as nextLng
 `,
    { placesIds }
  );
  return result as PathSegment[];
};
export { createCircuit };
