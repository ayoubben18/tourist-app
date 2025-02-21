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
import FileInput from "../(public)/onboarding/file-input";

interface FormStore {
  currentStep: number;
  selections: Record<number | string, Record<string, any>>;
  setStep: (step: number) => void;
  setSelection: (
    step: number,
    fieldId: string,
    value: string | File,
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
  type: "text" | "email" | "number" | "tel" | "file" | "password" | "custom";
  placeholder?: string;
  required?: boolean;
  accept?: string;
  component?: React.ComponentType<CustomComponentProps>;
};

type CustomComponentProps = {
  value: any;
  onChange: (value: any) => void;
  [key: string]: any;
};

export interface MultiStepFormProps {
  title?: React.ReactNode;
  formSteps: FormStep[];
  onComplete: (
    selections: Record<number | string, Record<string, string | string[] | File>>
  ) => boolean;
  children?: React.ReactNode;
  finalStep?: React.ReactNode;
  className?: string;
  isPending?: boolean;
  isSuccess?: boolean;
}

const MultiStepForm = React.forwardRef<HTMLDivElement, MultiStepFormProps>(
  (
    {
      title,
      formSteps,
      onComplete,
      children,
      finalStep,
      className,
      isPending,
      isSuccess,
      ...props
    },
    ref
  ) => {
    const { currentStep, setStep, selections } = useFormStore();
    const [canFinish, setCanFinish] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
      {}
    );
    const [localValues, setLocalValues] = React.useState<
      Record<string, string | File | null>
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
        setLocalValues({});
      }
    };

    const handleInputChange = (
      fieldId: string,
      value: string | File | null
    ) => {
      const currentStepFields = formSteps[currentStep].fields;
      const field = currentStepFields.find((f) => f.id === fieldId);

      if (!field) return;

      if (field.type === "file") {
        const fileValue = value as File | null;
        if (fileValue) {
          setLocalValues((prev) => ({ ...prev, [fieldId]: fileValue }));
          useFormStore
            .getState()
            .setSelection(currentStep, fieldId, fileValue, formSteps.length);
        }
      } else {
        const stringValue = value as string;
        setLocalValues((prev) => ({ ...prev, [fieldId]: stringValue }));
        useFormStore
          .getState()
          .setSelection(currentStep, fieldId, stringValue, formSteps.length);
      }

      // Validation
      if (field.required) {
        if (field.type === "file") {
          if (!value) {
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
        } else {
          if (!(value as string)?.trim()) {
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
      }

      // Update completion state
      if (isLastStep) {
        const allRequiredFilled = currentStepFields.every((f) => {
          if (!f.required) return true;
          const val =
            f.id === fieldId ? value : selections[currentStep]?.[f.id];
          return f.type === "file"
            ? val instanceof File
            : !!val?.toString().trim();
        });
        setCanFinish(allRequiredFilled);
      }
    };

    const handleNextStep = () => {
      const currentStepFields = formSteps[currentStep].fields;
      console.log("Current fields", selections)
      const newErrors: Record<string, string> = {};

      currentStepFields.forEach((field) => {
        const value = localValues[field.id];
        if (field.required) {
          if (field.type === "file" && !(value instanceof File)) {
            newErrors[field.id] = `${field.label} is required`;
          } else if (typeof value === "string" && !value.trim()) {
            newErrors[field.id] = `${field.label} is required`;
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        return;
      }

      setLocalValues({});
      setStep(currentStep + 1);
    };

    const handleComplete = () => {
      if (finalStep) {
        const isValid = onComplete(selections);
        if (isValid && isSuccess) setShowSuccess(true);
      } else {
        onComplete(selections);
      }
    };

    const isLastStep = currentStep === formSteps.length - 1;
    const isSuccessStep = currentStep === formSteps.length;

    React.useEffect(() => {
      const stepSelections = selections[currentStep] || {};
      const newLocalValues: Record<string, string | File> = {};

      Object.entries(stepSelections).forEach(([key, value]) => {
        newLocalValues[key] = value;
      });

      setLocalValues(newLocalValues);

      if (isLastStep) {
        const allRequiredFilled = formSteps[currentStep].fields.every(
          (field) => {
            if (!field.required) return true;
            const value = stepSelections[field.id];
            return field.type === "file"
              ? value instanceof File
              : !!value?.toString().trim();
          }
        );
        setCanFinish(allRequiredFilled);
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
                {showSuccess && isSuccess ? (
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
                            value={(localValues[field.id] as File) || null}
                            onChange={(file) =>
                              handleInputChange(field.id, file)
                            }
                            accept={field.accept}
                            required={field.required}
                            error={formErrors[field.id]}
                          />
                        ) : field.type === "custom" && field.component ? (
                          <div>
                            <Label htmlFor={field.id}>{field.label}</Label>
                            {React.createElement(field.component, {
                              id: field.id,
                              onChange: (value: any) =>
                                handleInputChange(field.id, value),
                              value: localValues[field.id],
                              required: field.required,
                              error: formErrors[field.id],
                            })}
                            {formErrors[field.id] && (
                              <p className="text-red-500 text-sm">
                                {formErrors[field.id]}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input
                              id={field.id}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={(localValues[field.id] as string) || ""}
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
                {!isSuccessStep && (
                  <div className="flex justify-end mt-8">
                    {isLastStep ? (
                      <Button
                        onClick={handleComplete}
                        disabled={!canFinish || isPending} // Add disabled state
                        className={showSuccess && isSuccess ? `hidden` : ""}
                      >
                        {isPending ? ( // Show spinner when pending
                          <div className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5 text-current"
                              fill="none"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Submitting...
                          </div>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    ) : (
                      <Button onClick={handleNextStep} disabled={isPending}>
                        {isPending ? "Please wait..." : "Next Step"}
                      </Button>
                    )}
                  </div>
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
