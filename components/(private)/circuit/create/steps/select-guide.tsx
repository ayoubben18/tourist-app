import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGuides } from "@/hooks/use-guides";
import { FormProp } from "../lib";
import { SelectableCard } from "../selectable-card";

type Props = {
  form: FormProp;
};

const SelectGuide = ({ form }: Props) => {
  const {
    data: guides,
    isLoading,
    setSearchTerm,
    searchTerm,
  } = useGuides({
    city: form.getValues("city"),
    startTime: form.getValues("startTime"),
    duration: 20,
  });
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="guideId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guide</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Search guides by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
            </FormControl>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <Card className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">
                      Loading guides...
                    </div>
                  </div>
                </Card>
              ) : guides?.length === 0 ? (
                <Card className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">No guides found</div>
                  </div>
                </Card>
              ) : (
                guides?.map((guide) => (
                  <SelectableCard
                    key={guide.id}
                    selected={field.value === guide.id}
                    onClick={() => field.onChange(guide.id)}
                    title={guide.full_name ?? ""}
                    header={
                      <>
                        <img
                          src={guide.avatar_url ?? ""}
                          alt={guide.full_name ?? ""}
                          className="rounded-full h-12 w-12 object-cover"
                        />
                        <div>
                          <CardTitle className="text-base">
                            {guide.full_name}
                          </CardTitle>
                          <CardDescription>
                            {guide.years_of_experience} years of experience
                          </CardDescription>
                        </div>
                      </>
                    }
                  >
                    <div className="text-sm text-muted-foreground">
                      <p>Experience: {guide.years_of_experience} years</p>
                    </div>
                  </SelectableCard>
                ))
              )}
            </div>
            <FormDescription>Select a guide for your circuit</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SelectGuide;
