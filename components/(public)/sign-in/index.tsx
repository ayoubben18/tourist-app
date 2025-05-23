"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInSchema } from "@/utils/schemas";
import { z } from "zod";
import { signIn } from "@/services/database";
import FormError from "@/components/shared/form-error";
import { parseAsString, useQueryState } from "nuqs";

export default function LoginForm() {
  const router = useRouter();
  const [returnPath, setReturnPath] = useQueryState("returnTo", parseAsString.withDefault("/"));
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAuthenticated"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    try {
      await mutateAsync(values);
      toast.success("Logged in successfully");
      router.push(returnPath.replaceAll("%","/"))
    } catch (error) {
      toast.error("Failed to log in");
      router.push("/")
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email here" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Submit
        </Button>
      </form>
      <FormError message={error?.message} />
    </Form>
  );
}
