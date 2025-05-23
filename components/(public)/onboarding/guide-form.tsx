"use client";

import * as React from "react";
import { z } from "zod";
import { toast } from "sonner";
import MultiStepForm, { FormStep } from "@/components/ui/multi-step-form";
import { Button } from "@/components/ui/button";
import { GuideOnboardingSchema } from "@/utils/schemas";
import { useMutation } from "@tanstack/react-query";
import { guideOnboarding } from "@/services/database/auth";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import CountrySelect from "./country-select";
import MultiCitySelect from "./multi-city-select";

export default function GuideApplicationForm() {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: guideOnboarding,
  });

  const [success, setSuccess] = React.useState(false);

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
          id: "profile_picture",
          label: "Upload Profile Picture",
          type: "file",
          accept: ".png,.jpeg,.jpg",
          required: false,
        },
      ],
    },
    {
      id: "guide-details",
      level: 3,
      title: "Professional Information",
      description:
        "Provide details about your work experience and hourly rate.",
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
      id: "guide-location",
      level: 4,
      title: "...",
      description: "Provide details about ....",
      fields: [
        {
          id: "country",
          label: "Country",
          type: "custom",
          component:  CountrySelect,
          required: true,
        },
        {
          id: "cities",
          label: "Cities",
          type: "custom",
          component:  MultiCitySelect,
          required: true,
        },
      ],
    },
    {
      id: "authorisation",
      level: 5,
      title: "Authorisation document",
      description:
        "Please upload your authorization document as proof of legitimacy.",
      fields: [
        {
          id: "authorization_document",
          label: "Authorisation document",
          type: "file",
          accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg",
          required: true,
        },
      ],
    },
    {
      id: "password",
      level: 6,
      title: "Secure Your Account with a Strong Password",
      description:
        "Create a secure password that meets the required criteria to protect your account from unauthorized access.",
      fields: [
        {
          id: "password",
          label: "Password",
          type: "password",
          required: true,
        },
      ],
    },
  ];

  const handleComplete = (
    selections: Record<number, Record<string, string | string[] | File>>
  ) => {
    console.log("Form Selections:", selections);

    const formData = new FormData();

    Object.values(selections).forEach((stepData) => {
      Object.entries(stepData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      });
    });

    try {
      const validatedData = GuideOnboardingSchema.parse(
        Object.fromEntries(formData.entries())
      );
      console.log("Validated Data:", validatedData);

      toast.promise(mutateAsync(validatedData), {
        loading: "Creating account...",
        success: () => {
          // router.push(...);
          setSuccess(true);
          return "Please check your email for verification.";
        },
        error: (error) => {
          return "Failed to create account";
        },
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
      <h2 className="text-2xl font-bold">
        Your submission has been received successfully!
      </h2>
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
      isPending={isPending}
      isSuccess={success}
    />
  );
}

const GoogleMapsCountrySelect: React.FC<{
  onChange: (value: string) => void;
  value: string;
  error?: string;
}> = ({ onChange, value, error }) => {
  // Implement your custom component logic here
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={error ? "border-red-500" : ""}
    >
      <option value="">Select a country</option>
      <option value="US">United States</option>
      <option value="CA">Canada</option>
      {/* Add more countries as needed */}
    </select>
  );
};
