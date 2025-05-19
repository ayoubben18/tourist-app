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
  ],
  guides: (searchProperties: any) => [
    "guides",
    searchProperties.searchTerm,
    searchProperties.duration,
    searchProperties.distance,
    searchProperties.rating,
  ],
  guide: (guide_id: string) => [
    "guide",
    guide_id,
  ],
  commentsOfGuide: (guide_id: string) => [
    "commentsOfGuide",
    guide_id,
  ],
  pendingBookings: () => [
    "pendingBookings"
  ],
  confirmedBookings: () => [
    "confirmedBookings"
  ],
  myCircuits: (user_id: string) => [
    "myCircuits",
    user_id
  ],
  likedCircuits: (user_id: string) => [
    "likedCircuits",
    user_id
  ],
  favoriteCircuits: (user_id: string) => [
    "favorites",
    "favorites",
    user_id
  ],
  pendingGuides: () => [
    "pendingGuides"
  ]
};

export default useQueryCacheKeys;
