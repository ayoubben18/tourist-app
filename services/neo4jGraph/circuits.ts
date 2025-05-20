"use server";
import { db } from "@/db";
import {
  bookings,
  circuit_points,
  circuits,
  cities,
  guide_profiles,
  points_of_interest,
} from "@/db/migrations/schema";
import { createCircuitSchema } from "@/utils/schemas";
import { initializeNeo4j } from "@/utils/server-clients";
import { Client } from "@googlemaps/google-maps-services-js";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { eq } from "drizzle-orm";
import { authenticatedAction } from "../server-only";
import { getCity, insertNeo4jCity } from "./cities";
import { getConnectsTo, insertConnectsTo } from "./connects-to";
import { insertLocatedIn } from "./located-in";
import { getNeo4jPlace, insertNeo4jPlace } from "./places";


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
    let cityNode = await getCity(city);

    if (!cityNode) {
      const response = await getPlaceInfosFromGoogleMaps(client, city);

      cityNode = await insertNeo4jCity({
        city,
        name: response.name!,
        country: response.address_components?.[0]?.short_name!,
        latitude: response.geometry?.location.lat!,
        longitude: response.geometry?.location.lng!
      });

      await db.transaction(async (tx) => {
        const [cityRecord] = await tx
          .select()
          .from(cities)
          .where(eq(cities.google_place_id, city));

        console.log("cityRecord", cityRecord);
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
      let placeNode = await getNeo4jPlace(place);

      if (!placeNode) {
        const response = await getPlaceInfosFromGoogleMaps(client, place);

        await insertNeo4jPlace({
          placeId: place,
          name: response.name!,
          latitude: response.geometry?.location.lat!,
          longitude: response.geometry?.location.lng!,
          cityId: cityNode.id
        });

        await insertLocatedIn({
          placeId: place,
          cityId: cityNode.id
        });

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
        await insertLocatedIn({
          placeId: place,
          cityId: cityNode.id
        });
      }
    }

    const circuitSteps: { steps_data: any[] } = {
      steps_data: []
    }

    // Create relationships between places with distances
    for (let i = 0; i < placesToInsert.length; i++) {
      for (let j = i + 1; j < placesToInsert.length; j++) {
        const origin = placesToInsert[i];
        const destination = placesToInsert[j];

        // Check if relationship already exists
        const existingRelation = await getConnectsTo({
          origin,
          destination
        });

        if (!existingRelation) {
          const element = await calculateDistance(origin, destination, neo4j);
          const distance = element.distance.value;
          const duration = element.duration.value;

          circuitSteps.steps_data.push(element.steps);
          // Create bidirectional relationships with distance and duration
          await insertConnectsTo({
            origin,
            destination,
            distance,
            duration
          });
        }
      }
    }



    console.log("startingPlace", startingPlace);
    console.log("places", places);
    const paths = await getShortestPath([startingPlace, ...places]);
    console.log("paths", paths);

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
          route_steps: circuitSteps,
        })
        .returning();

      let price = null;

      if (guideId) {
        const [guideRecord] = await tx
          .select()
          .from(guide_profiles)
          .where(eq(guide_profiles.id, guideId));
        price = (
          Number(guideRecord.price_per_hour!) * (estimatedDuration / 60)

        ).toFixed(2);
      }

      await tx.insert(bookings).values({
        booking_date: new Date(startTime).toISOString(),
        total_price: price,
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


const getPlaceInfosFromGoogleMaps = async (client: Client, placeId: string) => {
  const response = await client.placeDetails({
    params: { place_id: placeId, key: process.env.GOOGLE_MAPS_API_KEY! },
  });
  return response.data.result;
};

const calculateDistance = async (
  origin: string,
  destination: string,
  neo4j: Neo4jGraph
) => {
  const originNode = await getNeo4jPlace(origin);
  const destinationNode = await getNeo4jPlace(destination);
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

  // consoleLogger(data);

  const distance = data.features[0].properties.segments[0].distance as number;
  const duration = data.features[0].properties.segments[0].duration as number;

  return {
    distance: { value: distance },
    duration: { value: duration },
    steps: data
  };
};

const getShortestPath = async (placesIds: string[]) => {
  const neo4j = await initializeNeo4j();

  // If placesIds is empty or has only one element, a "circuit" might be trivial or not what's expected.
  // Adding a check here if needed, e.g., if placesIds.length < 2, return [] or handle appropriately.
  if (placesIds.length === 0) {
    return [];
  }


  const result = await neo4j.query(
    `
WITH $placesIds AS visit_sequence_ids
// Create the full circuit sequence of node IDs, returning to the start
// If only one placeId is given, circuit_node_ids will be [id, id]
WITH visit_sequence_ids + [visit_sequence_ids[0]] AS circuit_node_ids

// Iterate through the segments of the circuit (e.g., P0->P1, P1->P2, ..., Pn->P0)
UNWIND range(0, size(circuit_node_ids) - 2) AS i
WITH circuit_node_ids[i] AS current_stop_id, circuit_node_ids[i+1] AS next_stop_id, i AS segment_index

// Match the actual nodes for the current segment of the tour
MATCH (current_stop_node:Place {id: current_stop_id})
MATCH (next_stop_node:Place {id: next_stop_id})

// Find the shortest path for this specific segment of the tour
MATCH path = shortestPath((current_stop_node)-[:CONNECTS_TO*]->(next_stop_node))

// Deconstruct the found 'path' (which is a single path object for the segment)
// into its constituent nodes. nodes(path) returns a list of nodes.
WITH segment_index, [n IN nodes(path) | n] AS path_nodes_in_segment

// Unwind the nodes within this segment's path to get pairs for direct relationships
// e.g., if path_nodes_in_segment is [N1, N2, N3], this creates pairs (N1,N2) and (N2,N3)
UNWIND range(0, size(path_nodes_in_segment) - 2) AS j
WITH segment_index, j AS step_in_segment_index, path_nodes_in_segment[j] AS segment_step_start, path_nodes_in_segment[j+1] AS segment_step_end

// Match the direct relationship (and its properties) between these consecutive nodes in the segment's path
MATCH (segment_step_start)-[r:CONNECTS_TO]->(segment_step_end)

RETURN
  segment_step_start.name AS currentStop,
  segment_step_start.id AS currentId,
  segment_step_end.name AS nextStop,
  segment_step_end.id AS nextId,
  r.distance AS distance,
  r.duration AS duration,
  segment_step_start.latitude AS currentLat,
  segment_step_start.longitude AS currentLng,
  segment_step_end.latitude AS nextLat,
  segment_step_end.longitude AS nextLng
// Order the results by the tour segment, and then by the step within that segment's path
ORDER BY segment_index, step_in_segment_index
 `,
    { placesIds } // Pass the original placesIds array as a parameter
  );
  return (result as unknown) as PathSegment[]; // Added 'unknown' to bypass strict type checking if needed, then cast
};
export { createCircuit };

