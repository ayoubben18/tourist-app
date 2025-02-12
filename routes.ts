export const ROUTES = {
  public: {
    home: "/",
    about: "/about",
    contact: "/contact",
    publicCircuits: "/public-circuits",
  },
  auth: {
    signIn: "/sign-in",
    guideRegister: "/guide-register",
    touristRegister: "/tourist-register",
  },
  private: {
    circuits: {
      create: "/circuits/create",
      edit: "/circuits/edit/:id",
      view: "/circuits/:id",
    },
    profile: "/profile",
    settings: "/settings",
  },
} as const;
