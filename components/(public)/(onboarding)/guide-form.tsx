"use client";

import * as React from "react";
import { z } from "zod";
import { toast } from "sonner";
import MultiStepForm, { FormStep } from "@/components/ui/multi-step-form";
import { Button } from "@/components/ui/button";

// Validation schema
const applicationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  yearsOfExperience: z.string().regex(/^\d+$/, "Experience must be a number"),
  hourlyRate: z.string().regex(/^\d+$/, "hourly rate must be a number"),
  authorisation: z.string().optional(),
});

export default function GuideApplicationForm() {
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
      id: "guide-details",
      level: 2,
      title: "Professional Information",
      description: "Provide details about your work experience and hourly rate.",
      fields: [
        {
          id: "yearsOfExperience",
          label: "Years of Experience",
          type: "number",
          placeholder: "3",
          required: true,
        },
        {
          id: "hourlyRate",
          label: "Hourly Rate (DHS/hour)",
          type: "number",
          placeholder: "250",
          required: true,
        },
      ],
    },
    {
      id: "authorisation",
      level: 4,
      title: "Authorisation document",
      description: "Please upload your authorization document as proof of legitimacy.",
      fields: [
        {
          id: "authorisation",
          label: "Authorisation document",
          type: "file",
          accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg",
          required: true,
        }
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
      <h2 className="text-2xl font-bold">Your submission has been received successfully!</h2>
      <p>Our team will review your information and get back to you soon.</p>
      <Button>Go back to home page</Button>
    </div>
  );

  return (
    <MultiStepForm
      title={<h1 className="text-xl font-bold">Guide Onboarding</h1>}
      formSteps={formSteps}
      onComplete={handleComplete}
      finalStep={finalStep}
    />
  );
}
