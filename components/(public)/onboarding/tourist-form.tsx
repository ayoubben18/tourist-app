"use client";

import * as React from "react";
import { z } from "zod";
import { toast } from "sonner";
import MultiStepForm, { FormStep } from "@/components/ui/multi-step-form";
import { touristOnboardingSchema } from "@/utils/schemas";
import { useMutation } from "@tanstack/react-query";
import { touristOnboarding } from "@/services/database/auth";

export default function TouristForm() {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: touristOnboarding,
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
      id: "password",
      level: 3,
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
    selections: Record<number, Record<string, string | File>>
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

      // Validate using Zod
      const validatedData = touristOnboardingSchema.parse(formData);
      console.log("Validated Data:", validatedData);

      toast.promise(mutateAsync(validatedData), {
        loading: "Creating account...",
        success: () => {
          // router.push(...);
          setSuccess(true);
          return "Account created successfully! Please check your email for verification.";
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
      isPending={isPending}
      isSuccess={success}
    />
  );
}
