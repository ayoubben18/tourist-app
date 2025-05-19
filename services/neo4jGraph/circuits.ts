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
  guide_profiles,
  points_of_interest,
} from "@/db/migrations/schema";
import { insertNeo4jCity } from "./cities";
import { getNeo4jPlace, insertNeo4jPlace } from "./places";
import { insertLocatedIn } from "./located-in";
import { getConnectsTo, insertConnectsTo } from "./connects-to";
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

      await insertNeo4jCity({
        city: city,
        name: response.data.result.name,
        country: response.data.result.address_components?.[0]?.short_name,
        latitude: response.data.result.geometry?.location.lat,
        longitude: response.data.result.geometry?.location.lng,
      });

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
      let placeNode = await getNeo4jPlace(place);

      if (!placeNode.length) {
        const response = await client.placeDetails({
          params: {
            place_id: place,
            key: process.env.GOOGLE_MAPS_API_KEY!,
          },
        });

        await insertNeo4jPlace({
          placeId: place,
          name: response.data.result.name,
          cityId: city,
          latitude: response.data.result.geometry?.location.lat,
          longitude: response.data.result.geometry?.location.lng,
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
        await insertLocatedIn({
          placeId: place,
          cityId: city,
        });
      }
    }

    // Create relationships between places with distances
    for (let i = 0; i < placesToInsert.length; i++) {
      for (let j = i + 1; j < placesToInsert.length; j++) {
        const origin = placesToInsert[i];
        const destination = placesToInsert[j];

        // Check if relationship already exists
        const existingRelation = await getConnectsTo({
          origin,
          destination,
        });

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
          await insertConnectsTo({
            origin,
            destination,
            distance,
            duration,
          });
        }
      }
    }

    const paths = await getShortestPath([startingPlace, ...places]);

    let circuitId = 0;
    let estimatedDuration = paths.reduce((acc, path) => acc + path.duration, 0);
    let distance = Number.parseFloat(
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

      let price: string | null = null;
      if (guideId) {
        const [guide] = await tx
          .select()
          .from(guide_profiles)
          .where(eq(guide_profiles.id, guideId));
        if (guide && guide.price_per_hour) {
          price = (
            Number(guide.price_per_hour) * (estimatedDuration / 60)
          ).toFixed(2);
        }
      }

      await tx.insert(bookings).values({
        booking_date: new Date(startTime).toISOString(),
        total_price: price,
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
// Input: $placesIds (list of string IDs)

// Stage 0: Handle cases with less than 2 places directly.
WITH $placesIds AS p_ids
WHERE size(p_ids) >= 2 // Proceed only if there are at least two places to form a circuit segment.

// Stage 1: Get node objects and define start and intermediates
MATCH (n:Place) WHERE n.id IN p_ids
WITH p_ids, collect(n) AS all_nodes_obj_unordered
// Create an ordered list of node objects based on p_ids to correctly identify startNode
WITH p_ids, [id IN p_ids | [node_obj IN all_nodes_obj_unordered WHERE node_obj.id = id][0]] AS all_nodes_obj_ordered
WITH all_nodes_obj_ordered[0] AS startNodeObj, all_nodes_obj_ordered[1..] AS intermediateNodeObjsList

// Stage 2: Find the optimal sequence of intermediate nodes + form the full tour
// This subquery finds the sequence of node *objects* for the optimal tour
CALL {
    WITH startNodeObj, intermediateNodeObjsList
    // If no intermediate nodes, tour is start -> start. Sequence: [startNodeObj, startNodeObj]
    WHEN size(intermediateNodeObjsList) = 0 THEN
        RETURN [startNodeObj, startNodeObj] AS optimal_tour_node_objects, 0.0 AS min_total_duration
    ELSE
        // Generate permutations of intermediate node *objects*
        CALL apoc.coll.permutations(intermediateNodeObjsList) YIELD value AS permuted_intermediate_node_objects
        // Construct the full tour sequence of node objects for this permutation
        WITH startNodeObj, [startNodeObj] + permuted_intermediate_node_objects + [startNodeObj] AS current_tour_node_objects
        
        // Calculate total duration for this current_tour_node_objects using Dijkstra for each segment
        CALL {
            WITH current_tour_node_objects
            UNWIND range(0, size(current_tour_node_objects) - 2) AS i
            WITH current_tour_node_objects[i] AS u_node, current_tour_node_objects[i+1] AS v_node
            // Use Dijkstra to find the shortest path based on 'duration' for the segment u_node -> v_node
            CALL apoc.algo.dijkstra(u_node, v_node, 'CONNECTS_TO', 'duration') YIELD weight AS segment_duration
            // Ensure path exists for this segment
            WHERE segment_duration IS NOT NULL AND segment_duration >= 0
            RETURN sum(segment_duration) AS tour_total_duration_for_permutation
        }
        // Filter out permutations that might lead to non-existent paths (if tour_total_duration_for_permutation is null)
        WHERE tour_total_duration_for_permutation IS NOT NULL
        RETURN current_tour_node_objects, tour_total_duration_for_permutation
        ORDER BY tour_total_duration_for_permutation ASC
        LIMIT 1
        // Returns: optimal_tour_node_objects (list of node objects), min_total_duration (total duration)
}
// optimal_tour_node_objects is the list of actual node objects in the optimal tour order

// Stage 3: Deconstruct the optimal tour into detailed path segments
// Unwind each leg of the optimal tour (e.g., A->B, B->C, C->A)
UNWIND range(0, size(optimal_tour_node_objects) - 2) AS i_tour_leg
WITH optimal_tour_node_objects[i_tour_leg] AS major_leg_start_node,
     optimal_tour_node_objects[i_tour_leg+1] AS major_leg_end_node

// For each major leg (e.g., A to B), find its detailed shortest path using Dijkstra (again, could be multi-hop A-X-Y-B)
CALL apoc.algo.dijkstra(major_leg_start_node, major_leg_end_node, 'CONNECTS_TO', 'duration') YIELD path AS detailed_segment_path
// Filter out if no path exists for a leg (should not happen if Stage 2 worked correctly)
WHERE detailed_segment_path IS NOT NULL

// Extract the sequence of nodes in this detailed_segment_path
WITH nodes(detailed_segment_path) AS route_nodes_for_detailed_segment
WHERE size(route_nodes_for_detailed_segment) >= 2 // Ensure the path has at least one hop

// Unwind the hops within the detailed_segment_path (e.g., A->X, X->Y, Y->B)
UNWIND range(0, size(route_nodes_for_detailed_segment) - 2) AS i_sub_hop
WITH route_nodes_for_detailed_segment[i_sub_hop] AS current_hop_node,
     route_nodes_for_detailed_segment[i_sub_hop+1] AS next_hop_node
     
// Get the direct :CONNECTS_TO relationship for this specific hop
MATCH (current_hop_node)-[r_direct:CONNECTS_TO]->(next_hop_node)

RETURN
  current_hop_node.name AS currentStop,
  current_hop_node.id AS currentId,
  next_hop_node.name AS nextStop,
  next_hop_node.id AS nextId,
  r_direct.distance AS distance,
  r_direct.duration AS duration,
  current_hop_node.latitude AS currentLat,
  current_hop_node.longitude AS currentLng,
  next_hop_node.latitude AS nextLat,
  next_hop_node.longitude AS nextLng
 `,
    { placesIds } // Pass the original placesIds array as a parameter
  );
  return (result as unknown) as PathSegment[]; // Added 'unknown' to bypass strict type checking if needed, then cast
};
export { createCircuit };
