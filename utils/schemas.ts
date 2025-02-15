import { z } from "zod";

export const touristOnboardingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must not exceed 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .nonempty("Password is required"),
  profile_picture: z.any().optional(),
});

export const GuideOnboardingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  yearsOfExperience: z.coerce.number(),
  hourlyRate: z.string().regex(/^\d+$/, "hourly rate must be a number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must not exceed 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .nonempty("Password is required"),
  profile_picture: z.any().optional(),
  authorization_document: z
    .any()
    .refine((file) => file?.size > 0, "Authorization document is required"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const createCircuitSchema = z.object({
  city: z.string(),
  places: z.array(z.string()),
  startingPlace: z.string(),
  startTime: z.date(),
  guideId: z.string().uuid().optional(),
  isPublic: z.boolean(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format")
    .optional(),
  profile_picture: z.any().optional(),
  password: z.union([z.string().min(6), z.literal("")]).optional(),
}).refine(data => {
  return Object.values(data).some(value => value !== undefined && value !== "");
}, {
  message: "At least one field must be provided for update",
});

