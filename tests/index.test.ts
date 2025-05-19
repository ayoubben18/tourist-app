import { initializeNeo4j } from "@/utils/server-clients";

describe("index", () => {

  jest.setTimeout(10000);
  it("should pass", async () => {

    const result = await getShortestPath(["p_1", "p_2", "p_3", "p_4", "p_5", "p_6", "p_7", "p_8", "p_9", "p_10"]);

    console.log(result);
    expect(true).toBe(true);
  });
});



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