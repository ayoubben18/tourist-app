type TouristDTO = {
  email: string | undefined;
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "visitor" | "guide" | "admin" | null;
} | undefined;

export { type TouristDTO };
