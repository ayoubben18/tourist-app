import { createCircuitSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const useCircuitForm = () => {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));

  useEffect(() => {
    setStep(1);
  }, []);

  const form = useForm<z.infer<typeof createCircuitSchema>>({
    resolver: zodResolver(createCircuitSchema),
    defaultValues: {
      name: "",
      description: "",
      city: undefined,
      guideId: undefined,
      isPublic: true,
      places: [],
      startingPlace: undefined,
      startTime: undefined,
    },
  });

  const handleNext = () => {
    if (step === 4) return;
    setStep((step) => step + 1);
  };

  const handleBack = () => {
    if (step === 1) return;
    setStep((step) => step - 1);
  };

  return { form, step, setStep, handleBack, handleNext };
};
