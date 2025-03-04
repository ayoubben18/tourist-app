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
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { inspect } from "util";
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
    let cityNode = await getCityFromNeo4j(city, neo4j);

    if (!cityNode) {
      const response = await getPlaceInfosFromGoogleMaps(client, city);

      cityNode = await insertCityInNeo4j(
        neo4j,
        city,
        response.name!,
        response.address_components?.[0]?.short_name!,
        response.geometry?.location.lat!,
        response.geometry?.location.lng!
      );

      await db.transaction(async (tx) => {
        const [cityRecord] = await tx
          .select()
          .from(cities)
          .where(eq(cities.google_place_id, city));

        if (!cityRecord) {
          // let imageUrl = "";
          // if (response.photos) {
          //   for (const photo of response.photos) {
          //     if (photo.html_attributions?.[0]) {
          //       const match =
          //         photo.html_attributions[0].match(/href="([^"]*)"/);
          //       if (match?.[1]) {
          //         imageUrl = match[1];
          //         break;
          //       }
          //     }
          //   }
          // }
          const [insertedCity] = await tx
            .insert(cities)
            .values({
              google_place_id: city,
              // image_url: imageUrl,
              name: response.name,
              country: response.address_components?.[0]?.short_name,
              description: response.vicinity,
              coordinates: [
                response.geometry?.location.lat,
                response.geometry?.location.lng,
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
      let placeNode = await getPlaceFromNeo4j(place, neo4j);

      if (!placeNode) {
        const response = await getPlaceInfosFromGoogleMaps(client, place);

        await insertPlaceInNeo4j(
          neo4j,
          place,
          response.name!,
          response.geometry?.location.lat!,
          response.geometry?.location.lng!,
          cityNode.name
        );
        await insertLocatedInRelation(neo4j, place, cityNode.id);

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
                name: response.name,
                description: response.vicinity,
                coordinates: [
                  response.geometry?.location.lat,
                  response.geometry?.location.lng,
                ],
                city_id: cityId,
                category: response.types?.[0],
                estimated_duration: response.opening_hours
                  ? response.opening_hours.weekday_text.length
                  : 0,
                address: response.formatted_address,
                opening_hours: response.opening_hours,
              })
              .returning();
          }
        });
      } else {
        // If place exists, ensure it's connected to the city
        await insertLocatedInRelation(neo4j, place, cityNode.id);
      }
    }

    // Create relationships between places with distances
    for (let i = 0; i < placesToInsert.length; i++) {
      for (let j = i + 1; j < placesToInsert.length; j++) {
        const origin = placesToInsert[i];
        const destination = placesToInsert[j];

        // Check if relationship already exists
        const existingRelation = await getConnectsToRelation(
          neo4j,
          origin,
          destination
        );

        if (!existingRelation) {
          const element = await calculateDistance(origin, destination, neo4j);
          const distance = element.distance.value;
          const duration = element.duration.value;

          // Create bidirectional relationships with distance and duration
          await insertBidirectionalConnectsToRelation(
            neo4j,
            origin,
            destination,
            distance,
            duration
          );
        }
      }
    }

    const paths = await getShortestPath([startingPlace, ...places]);

    let circuitId = 0;
    let estimatedDuration = Math.floor(
      paths.reduce((acc, path) => acc + path.duration, 0)
    );
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
          distance: distance,
          estimated_duration: estimatedDuration,
        })
        .returning();

      await tx.insert(bookings).values({
        booking_date: new Date(startTime).toISOString(),
        total_price: "100",
        circuit_id: circuitRecord.id,
        tourist_id: userId,
        guide_id: guideId,
        status: "pending",
      });

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

const getCityFromNeo4j = async (cityId: string, neo4j: Neo4jGraph) => {
  const result = await neo4j.query(
    `MATCH (city:City {id: $cityId}) RETURN city`,
    {
      cityId,
    }
  );

  if (result.length === 0) {
    return null;
  }
  return result[0].city;
};

const getPlaceFromNeo4j = async (placeId: string, neo4j: Neo4jGraph) => {
  const result = await neo4j.query(
    `MATCH (place:Place {id: $placeId}) RETURN place`,
    {
      placeId,
    }
  );
  if (result.length === 0) {
    return null;
  }
  return result[0].place;
};

const insertCityInNeo4j = async (
  neo4j: Neo4jGraph,
  city: string,
  name: string,
  country: string,
  latitude: number,
  longitude: number
) => {
  const result = await neo4j.query(
    `CREATE (city:City {id: $city, name: $name, country: $country, latitude: $latitude, longitude: $longitude}) RETURN city`,
    {
      city,
      name,
      country,
      latitude,
      longitude,
    }
  );
  return result[0];
};

const insertLocatedInRelation = async (
  neo4j: Neo4jGraph,
  placeId: string,
  cityId: string
) => {
  const result = await neo4j.query(
    ` MATCH (p:Place {id: $placeId})
      MATCH (c:City {id: $cityId})
      MERGE (p)-[:LOCATED_IN]->(c)`,
    { placeId, cityId }
  );
};
const insertPlaceInNeo4j = async (
  neo4j: Neo4jGraph,
  placeId: string,
  name: string,
  latitude: number,
  longitude: number,
  cityId: string
) => {
  await neo4j.query(
    `CREATE (p:Place {id: $placeId, name: $name, latitude: $latitude, longitude: $longitude, city: $cityId}) RETURN p`,
    { placeId, name, latitude, longitude, cityId }
  );
};

const getConnectsToRelation = async (
  neo4j: Neo4jGraph,
  origin: string,
  destination: string
) => {
  const result = await neo4j.query(
    ` MATCH (p1:Place {id: $origin})-[r:CONNECTS_TO]-(p2:Place {id: $destination})
      RETURN r`,
    { origin, destination }
  );
  return result[0];
};

const getPlaceInfosFromGoogleMaps = async (client: Client, placeId: string) => {
  const response = await client.placeDetails({
    params: { place_id: placeId, key: process.env.GOOGLE_MAPS_API_KEY! },
  });
  return response.data.result;
};

const insertBidirectionalConnectsToRelation = async (
  neo4j: Neo4jGraph,
  origin: string,
  destination: string,
  distance: number,
  duration: number
) => {
  await neo4j.query(
    `
    MATCH (p1:Place {id: $origin})
    MATCH (p2:Place {id: $destination})
    MERGE (p1)-[:CONNECTS_TO {distance: $distance, duration: $duration}]->(p2)
    MERGE (p2)-[:CONNECTS_TO {distance: $distance, duration: $duration}]->(p1)
    `,
    { origin, destination, distance, duration }
  );
};

const calculateDistance = async (
  origin: string,
  destination: string,
  neo4j: Neo4jGraph
) => {
  const originNode = await getPlaceFromNeo4j(origin, neo4j);
  const destinationNode = await getPlaceFromNeo4j(destination, neo4j);
  // Get place details for both points to extract coordinates
  const originCoordicates = `${originNode.longitude},${originNode.latitude}`;
  const destinationCoordinates = `${destinationNode.longitude},${destinationNode.latitude}`;
  const response = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.OPEN_ROUTE_API_KEY}&start=${originCoordicates}&end=${destinationCoordinates}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  const distance = data.features[0].properties.segments[0].distance as number;
  const duration = data.features[0].properties.segments[0].duration as number;

  return {
    distance: { value: distance },
    duration: { value: duration },
  };
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
