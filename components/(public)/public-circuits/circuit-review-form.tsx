import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/utils/schemas";
import { addComment } from "@/services/database/circuit-comments";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import StarRating from "@/components/shared/StarRating";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

type CircuitReviewFormValues = z.infer<typeof createReview>;

const AddCircuitReviewForm = ({ circuit_id }: { circuit_id: number }) => {
  const queryClient = useQueryClient();
  const form = useForm<CircuitReviewFormValues>({
    resolver: zodResolver(createReview),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const { mutateAsync: commentMutation } = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      form.reset();
      toast.success("Comment added successfully!");
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.commentsOfCircuit(circuit_id),
      });
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.circuitWithPOI(circuit_id),
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to add comment. Please try again.");
    },
  });
  const onSubmit = () => {
    console.log(form.getValues());
    toast.promise(
      commentMutation({
        circuit_id,
        rating: form.getValues().rating,
        comment: form.getValues().comment,
      }),
      {
        loading: "Submitting review",
        success: "Review submitted successfully",
        error: "Failed to submit review",
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>

        {/* Star Rating Input */}
        <div className="mb-4">
          <StarRating
            rating={form.watch("rating") || 0}
            onRatingChange={(rating) =>
              form.setValue("rating", rating, { shouldValidate: true })
            }
            disabled={form.formState.isSubmitting}
          />
          {form.formState.errors.rating && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.rating.message}
            </p>
          )}
        </div>

        {/* Comment Input */}
        <Textarea
          className=""
          placeholder="Share your experience with this guide..."
          {...form.register("comment")}
          disabled={form.formState.isSubmitting}
        />
        {form.formState.errors.comment && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.comment.message}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCircuitReviewForm;
