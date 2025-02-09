import { parseAsInteger, useQueryState } from "nuqs";
import React from "react";

type StepType = {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
};

const steps: StepType[] = [
  {
    id: 1,
    title: "Create Circuit",
    description: "Set the name and basic details of your circuit",
    component: <div>Basic Info Form</div>,
  },
  {
    id: 2,
    title: "Select start time and place",
    description: "Choose exercises for your circuit",
    component: <div>Exercise Selection</div>,
  },
  {
    id: 3,
    title: "Select Guide",
    description: "Configure work/rest intervals and rounds",
    component: <div>Circuit Config</div>,
  },
  {
    id: 4,
    title: "Attention",
    description: "Review and confirm your circuit setup",
    component: <div>Review Circuit</div>,
  },
];

const CreateCircuitStepper = () => {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
            {step.component}
          </div>
        ))}
      </div>
      <div className=" flex justify-between"></div>
    </div>
  );
};

export default CreateCircuitStepper;
