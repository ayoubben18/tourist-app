"use client";

import * as React from "react";
import { z } from "zod";
import { toast } from "sonner";
import MultiStepForm, { FormStep } from "@/components/ui/multi-step-form";

// Validation schema
const applicationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  profilePicture: z.string().optional(),
});

export default function JobApplicationForm() {
  const formSteps: FormStep[] = [
    {
      id: "personal-info",
      level: 0,
      title: "Personal Information",
      description: "Tell us about yourself",
      fields: [
        {
          id: "firstName",
          label: "First Name",
          type: "text",
          placeholder: "John",
          required: true,
        },
        {
          id: "lastName",
          label: "Last Name",
          type: "text",
          placeholder: "Doe",
          required: true,
        },
      ],
    },
    {
      id: "contact-info",
      level: 1,
      title: "Contact Details",
      description: "How can we reach you?",
      fields: [
        {
          id: "email",
          label: "Email Address",
          type: "email",
          placeholder: "john.doe@example.com",
          required: true,
        },
        {
          id: "phone",
          label: "Phone Number",
          type: "tel",
          placeholder: "1234567890",
          required: true,
        },
      ],
    },
    {
      id: "profilePicture",
      level: 2,
      title: "Profile Picture (Optional)",
      description:
        "You can upload a profile picture to personalize your account. But it is not required.",
      fields: [
        {
          id: "profilePicture",
          label: "Upload Profile Picture",
          type: "file",
          accept: ".png,.jpeg,.jpg",
          required: false,
        },
      ],
    },
  ];

  const handleComplete = (
    selections: Record<number, Record<string, string>>
  ) => {
    console.log("Form Selections:", selections);

    try {
      // Flatten selections
      const formData = Object.values(selections).reduce(
        (acc, step) => ({
          ...acc,
          ...step,
        }),
        {}
      );

      console.log("Flattened Form Data:", formData);

      // Validate using Zod
      const validatedData = applicationSchema.parse(formData);
      console.log("Validated Data:", validatedData);

      // Simulate form submission
      toast.success("Application Submitted", {
        description: `Thank you, ${validatedData.firstName} ${validatedData.lastName}!`,
      });

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error("Submission failed");
      }
      return false;
    }
  };

  const finalStep = (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Account created successfully!</h2>
      <p> Please check your email for verification.</p>
    </div>
  );

  return (
    <MultiStepForm
      title={<h1 className="text-xl font-bold">Tourist Onboarding</h1>}
      formSteps={formSteps}
      onComplete={handleComplete}
      finalStep={finalStep}
    />
  );
}
