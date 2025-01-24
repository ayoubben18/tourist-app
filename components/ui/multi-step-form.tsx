"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon } from "lucide-react";
import * as React from "react";
import { create } from "zustand";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileInput from "../(public)/(onboarding)/file-input";

interface FormStore {
  currentStep: number;
  selections: Record<number | string, Record<string, string>>;
  setStep: (step: number) => void;
  setSelection: (
    step: number,
    fieldId: string,
    value: string,
    totalSteps: number
  ) => void;
  reset: () => void;
  hasForm: boolean;
}

const useFormStore = create<FormStore>((set) => ({
  currentStep: 0,
  selections: {},
  setStep: (step) => set({ currentStep: step }),
  setSelection: (step, fieldId, value, totalSteps) =>
    set((state) => {
      const stepSelections = state.selections[step] || {};
      return {
        selections: {
          ...state.selections,
          [step]: {
            ...stepSelections,
            [fieldId]: value,
          },
        },
      };
    }),
  reset: () => set({ currentStep: 0, selections: {} }),
  hasForm: false,
}));

export type FormStep = {
  level: number;
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
};

export type FormField = {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "tel" | "file"; // Add "file" type
  placeholder?: string;
  required?: boolean;
  accept?: string; // Optional: Specify accepted file types (e.g., "image/*", ".pdf")
};

export interface MultiStepFormProps {
  title?: React.ReactNode;
  formSteps: FormStep[];
  onComplete: (
    selections: Record<number | string, Record<string, string>>
  ) => boolean;
  children?: React.ReactNode;
  finalStep?: React.ReactNode;
  className?: string;
}

const MultiStepForm = React.forwardRef<HTMLDivElement, MultiStepFormProps>(
  (
    { title, formSteps, onComplete, children, finalStep, className, ...props },
    ref
  ) => {
    const [localFiles, setLocalFiles] = React.useState<
      Record<string, File | null>
    >({});
    const { currentStep, setStep, selections } = useFormStore();
    const [canFinish, setCanFinish] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
      {}
    );
    const [localValues, setLocalValues] = React.useState<
      Record<string, string>
    >({});

    React.useEffect(() => {
      useFormStore.setState({ hasForm: Boolean(children) });
    }, [children]);

    const handleBack = () => {
      if (showSuccess) {
        setShowSuccess(false);
        return;
      }
      if (currentStep > 0) {
        setStep(currentStep - 1);
        // Reset local values when going back
        setLocalValues({});
      }
    };

    const handleInputChange = (fieldId: string, value: string | File | null) => {
      const currentStepFields = formSteps[currentStep].fields;
      const field = currentStepFields.find((f) => f.id === fieldId);
    
      if (field?.type === "file") {
        // Handle file input
        setLocalFiles((prev) => ({
          ...prev,
          [fieldId]: value as File | null, // Allow null values
        }));
      } else {
        // Handle text/number/email/tel input
        setLocalValues((prev) => ({
          ...prev,
          [fieldId]: value as string,
        }));
    
        // Validate field
        if (field?.required && !(value as string).trim()) {
          setFormErrors((prev) => ({
            ...prev,
            [fieldId]: `${field.label} is required`,
          }));
        } else {
          setFormErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
          });
        }
      }
    
      // Update selections in the store
      const setSelection = useFormStore.getState().setSelection;
      setSelection(
        currentStep,
        fieldId,
        field?.type === "file" ? (value ? (value as File).name : "") : (value as string),
        formSteps.length
      );
    
      // Check if all required fields are filled (only for the last step)
      if (isLastStep) {
        const allRequiredFieldsFilled = currentStepFields.every((field) => {
          if (field.required) {
            if (field.type === "file") {
              return localFiles[field.id] !== null;
            } else {
              return localValues[field.id] && localValues[field.id].trim();
            }
          }
          return true;
        });
    
        setCanFinish(allRequiredFieldsFilled);
      }
    };

    const handleNextStep = () => {
      const currentStepFields = formSteps[currentStep].fields;
      const newErrors: Record<string, string> = {};

      // Validate all fields in the current step
      currentStepFields.forEach((field) => {
        const value = localValues[field.id] || "";
        if (field.required && (!value || !value.trim())) {
          newErrors[field.id] = `${field.label} is required`;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        return;
      }

      // Save current step values
      const setSelection = useFormStore.getState().setSelection;
      currentStepFields.forEach((field) => {
        setSelection(
          currentStep,
          field.id,
          localValues[field.id] || "",
          formSteps.length
        );
      });

      // Move to the next step
      setLocalValues({});
      const nextStep = currentStep + 1;
      setStep(nextStep);
    };

    const handleComplete = () => {
      if (finalStep) {
        const isValid = onComplete(selections);
        if (isValid) {
          setShowSuccess(true);
        }
      } else {
        onComplete(selections);
      }
    };

    const isLastStep = currentStep === formSteps.length - 1;
    const isSuccessStep = currentStep === formSteps.length;
    const hasLastStepSelection = selections[formSteps.length - 1] !== undefined;

    React.useEffect(() => {
      //   console.log("Current Step:", currentStep);
      //   console.log("Local Values:", localValues);
      //   console.log("Selections:", selections);
      //   console.log("Can Finish:", canFinish);

      const stepSelections = selections[currentStep] || {};
      setLocalValues(stepSelections);

      if (isLastStep) {
        const currentStepFields = formSteps[currentStep].fields;
        const allRequiredFieldsFilled = currentStepFields.every((field) => {
          if (field.required) {
            return stepSelections[field.id] && stepSelections[field.id].trim();
          }
          return true;
        });

        console.log("All Required Fields Filled:", allRequiredFieldsFilled);
        setCanFinish(allRequiredFieldsFilled);
      }
    }, [currentStep, isLastStep, selections, formSteps]);

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center", className)}
        {...props}
      >
        <div className="w-full max-w-5xl p-2 min-h-screen h-screen">
          <Card className="w-full mx-auto p-6 shadow-lg md:p-6 h-full">
            <div className="mb-8 p-4 md:p-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-20">
                  {currentStep > 0 && !showSuccess ? (
                    <Button
                      variant="link"
                      onClick={handleBack}
                      className="mr-4 p-0"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                      Back
                    </Button>
                  ) : (
                    <div className="invisible">
                      <Button variant="link" className="mr-4 p-0">
                        <ChevronLeftIcon className="h-5 w-5" />
                        Back
                      </Button>
                    </div>
                  )}
                </div>
                {title && <div className="flex items-center">{title}</div>}
                <div className="text-sm font-medium text-muted-foreground w-20 text-right">
                  {isSuccessStep
                    ? `${formSteps.length}/${formSteps.length}`
                    : `${currentStep + 1}/${formSteps.length}`}
                </div>
              </div>
              <Progress
                value={
                  isSuccessStep
                    ? 100
                    : ((currentStep + 1) / formSteps.length) * 100
                }
                className="h-2"
              />
              <div className="mt-4 text-center">
                {!isSuccessStep && !showSuccess && formSteps[currentStep] && (
                  <h1 className="text-2xl font-semibold mb-2">
                    {formSteps[currentStep].title}
                  </h1>
                )}
                {!showSuccess && formSteps[currentStep]?.description && (
                  <p className="text-sm text-muted-foreground mx-auto max-w-md">
                    {formSteps[currentStep].description}
                  </p>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                {showSuccess ? (
                  finalStep
                ) : isSuccessStep && children ? (
                  children
                ) : (
                  <div className="space-y-4 max-w-md mx-auto">
                    {formSteps[currentStep]?.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        {field.type === "file" ? (
                          <FileInput
                            id={field.id}
                            label={field.label}
                            value={localFiles[field.id] || null}
                            onChange={(file) =>
                              handleInputChange(field.id, file!)
                            }
                            accept={field.accept}
                            required={field.required}
                          />
                        ) : (
                          <>
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input
                              id={field.id}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={localValues[field.id] || ""}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                              className={
                                formErrors[field.id] ? "border-red-500" : ""
                              }
                            />
                            {formErrors[field.id] && (
                              <p className="text-red-500 text-sm">
                                {formErrors[field.id]}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {!isSuccessStep && (
              <div className="flex justify-end mt-8">
                {isLastStep ? (
                  <Button
                    onClick={handleComplete}
                    disabled={!canFinish}
                    className={showSuccess ? `hidden` : ""}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button onClick={handleNextStep}>Next Step</Button>
                )}
              </div>
            )}

            {isSuccessStep && !showSuccess && children && (
              <div className="flex justify-end mt-8">
                <Button onClick={handleComplete}>
                  {finalStep ? "Submit" : "Complete"}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }
);
MultiStepForm.displayName = "MultiStepForm";

export default MultiStepForm;
