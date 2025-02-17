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
import React from "react";
import SelectVisibility from "./steps/circuit-visibility";
import CityAndPlaces from "./steps/city-and-places";
import SelectGuide from "./steps/select-guide";
import Starting from "./steps/starting";
import { createCircuit } from "@/services/neo4jGraph/circuits";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type StepType = {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
};

const CreateCircuitStepper = () => {
  const { form, step, handleBack, handleNext } = useCircuitForm();

  const steps: StepType[] = [
    {
      id: 1,
      title: "Select City and Places you want to visit",
      description: "Set the name and basic details of your circuit",
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
  });

  const onSubmit = () => {
    console.log(form.getValues());
    toast.promise(createCircuitMutation(form.getValues()), {
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
          <Card className="border rounded-lg p-4">
            <CardHeader>
              <CardTitle>{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>{currentStep.component}</CardContent>
          </Card>
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
              type={step === steps.length ? "submit" : "button"}
              onClick={handleNext}
              disabled={
                step === 1 ? !form.getValues("city") : !form.formState.isValid
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
