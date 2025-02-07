const useQueryCacheKeys = {
  publicCircuits: (searchProperties: any) => [
    "publicCircuits",
    searchProperties.searchTerm,
    searchProperties.duration,
    searchProperties.distance,
    searchProperties.rating,
  ],
};

export default useQueryCacheKeys;
