import React from "react";
import { FormProp } from "../lib";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SelectableCard } from "../selectable-card";

type Props = {
  form: FormProp;
};

const SelectVisibility = ({ form }: Props) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Circuit Name</FormLabel>
            <FormControl>
              <input
                {...field}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter circuit name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <textarea
                {...field}
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                placeholder="Describe your circuit"
              />
            </FormControl>
            <FormDescription>
              Tell others what this circuit is about
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isPublic"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Circuit Visibility</FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-4">
                <SelectableCard
                  selected={field.value === true}
                  onClick={() => field.onChange(true)}
                  title="Public"
                  description="Anyone can view and join this circuit"
                />
                <SelectableCard
                  selected={field.value === false}
                  onClick={() => field.onChange(false)}
                  title="Private"
                  description="Only people you invite can view and join"
                />
              </div>
            </FormControl>
            <FormDescription>
              Choose who can see and join your circuit
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Add other review content here */}
    </div>
  );
};

export default SelectVisibility;
