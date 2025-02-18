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

export const createReview = z.object({
  comment: z.string().min(1, 'Please enter a comment'),
  rating: z.number().min(1, 'Please select a rating between 1 and 5').max(5),
});
