const useQueryCacheKeys = {
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
  ]
};

export default useQueryCacheKeys;
