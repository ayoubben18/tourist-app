"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";

import { useCircuitForm } from "@/hooks/circuits/use-circuit-form";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import SelectVisibility from "./steps/circuit-visibility";
import CityAndPlaces from "./steps/city-and-places";
import SelectGuide from "./steps/select-guide";
import Starting from "./steps/starting";
import { createCircuit } from "@/services/neo4jGraph/circuits";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";
import { LoadScript } from "@react-google-maps/api";
import type { createCircuitSchema } from "@/utils/schemas";
import type { z } from "zod";
type StepType = {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
};

const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

const CreateCircuitStepper = () => {
  const router = useRouter();
  const { form, step, handleBack, handleNext } = useCircuitForm();

  const steps: StepType[] = [
    {
      id: 1,
      title: "Select City and Places you want to visit",
      description: "Select the city and places you want to visit",
      component: <CityAndPlaces form={form} />,
    },
    {
      id: 2,
      title: "Select start time and place",
      description: "Choose when and where to start your circuit",
      component: <Starting form={form} />,
    },
    {
      id: 3,
      title: "Select Guide",
      description: "Select the guide for your circuit",
      component: <SelectGuide form={form} />,
    },
    {
      id: 4,
      title: "Attention",
      description: "Review and confirm your circuit setup",
      component: <SelectVisibility form={form} />,
    },
  ];

  const currentStep = steps[step - 1];

  const { mutateAsync: createCircuitMutation } = useMutation({
    mutationFn: createCircuit,
    onSuccess: (data) => {
      router.push(ROUTES.public.publicCircuits + "/" + data);
    },
  });

  const onSubmit = async (values: z.infer<typeof createCircuitSchema>) => {
    toast.promise(createCircuitMutation(values), {
      loading: "Creating circuit...",
      success: "Circuit created successfully",
      error: "Failed to create circuit",
    });
  };

  if (step > steps.length) return <div>Step does not exist</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col space-y-4">
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
            libraries={GOOGLE_MAPS_LIBRARIES}
          >
            <Card className="border rounded-lg p-4">
              <CardHeader>
                <CardTitle>{currentStep.title}</CardTitle>
                <CardDescription>{currentStep.description}</CardDescription>
              </CardHeader>
              <CardContent>{currentStep.component}</CardContent>
            </Card>
          </LoadScript>
          <div className=" flex items-center justify-between">
            <Button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className=" gap-2"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={
                step === steps.length ? form.handleSubmit(onSubmit) : handleNext
              }
              className="gap-2"
            >
              {step === steps.length ? "Create" : "Next"}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CreateCircuitStepper;
