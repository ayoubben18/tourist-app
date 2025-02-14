const useQueryCacheKeys = {
  isUserAuthenticated: () => [ "isAuthenticated"],
  publicCircuits: (searchProperties: any) => [
    "publicCircuits",
    searchProperties.searchTerm,
    searchProperties.duration,
    searchProperties.distance,
    searchProperties.rating,
  ],
  circuitWithPOI: (circuit_id: number) => [
    "circuitWithPOI",
    circuit_id
  ],
  isLiked: (circuit_id: number, user_id: string) => [
    "isLiked",
    circuit_id,
    user_id,
  ],
  isFavorite: (circuit_id: number, user_id: string) => [
    "isFavorite",
    circuit_id,
    user_id,
  ],
  commentsOfCircuit: (circuit_id: number) => [
    "commentsOfCircuit",
    circuit_id,
  ]
};

export default useQueryCacheKeys;
