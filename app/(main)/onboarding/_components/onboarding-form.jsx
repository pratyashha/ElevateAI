"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateUser } from "@/actions/user";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";


const OnboardingForm = ({ industries }) => {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  const watchedIndustry = watch("industry");

  useEffect(() => {
    if (watchedIndustry && industries) {
      const selected = industries.find((ind) => ind.id === watchedIndustry);
      if (selected) {
        setSelectedIndustry(selected);
      }
    }
  }, [watchedIndustry, industries]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Format the industry data
      const formattedData = {
        ...data,
        industry: data.subIndustry ? `${data.industry}-${data.subIndustry.toLowerCase().replace(/ /g, "-")}` : data.industry,
      };
      
      console.log("Submitting data:", formattedData);
      
      // Call the updateUser function
      const result = await updateUser(formattedData);
      
      if (result) {
        toast.success("Profile updated successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-background min-h-screen">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className="gradient-text">Select Your Industry</CardTitle>
          <CardDescription>
            Choose your industry to get personalized career insights and
            recommendations.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* INDUSTRY */}
            <div className="space-y-2">
              <label htmlFor="industry" className="block mb-1 font-medium">
                Industry
              </label>

              <Select
                onValueChange={(value) => {
                  const selected = industries.find((ind) => ind.id === value);
                  setSelectedIndustry(selected);
                  setValue("industry", value);
                  setValue("subIndustry", ""); // reset sub-industry when main industry changes
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>

                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem value={ind.id} key={ind.id}>
                      {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.industry && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {/* SUB-INDUSTRY */}
            <div>
            {selectedIndustry &&
              selectedIndustry.subIndustries &&
              selectedIndustry.subIndustries.length > 0 && (
                <div className="space-y-2">
                  <label
                    htmlFor="subindustry"
                    className="block mb-1 font-medium"
                  >
                    Sub-Industry
                  </label>

                  <Select
                    onValueChange={(value) => {
                      setValue("subIndustry", value);
                    }}
                  >
                    <SelectTrigger id="subindustry">
                      <SelectValue placeholder="Select a sub-industry" />
                    </SelectTrigger>

                    <SelectContent>
                      {selectedIndustry.subIndustries.map((sub) => (
                        <SelectItem value={sub} key={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.subIndustry && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subIndustry.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* YEARS OF EXPERIENCE */}
            <div className="space-y-2 border p-2 rounded">
              <Label htmlFor="experience">
                Years of Experience
              </Label>

              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter your years of experience"
                {...register("experience")}
              />

              {errors.experience && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* SKILLS */}
            <div className="space-y-2 border p-2 rounded">
              <Label htmlFor="skills">
                Skills
              </Label>

              <Input  
                id="skills"
                placeholder="e.g. React, JavaScript, Python, Project Management"
                {...register("skills")}
              />
              <p className="text-sm text-muted-foreground">
                Enter your skills separated by commas
              </p>

              {errors.skills && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.skills.message}
                </p>
              )}
            </div>

            {/* PROFESSIONAL BIO */}
            <div className="space-y-2 border p-2 rounded">
              <Label htmlFor="bio ">
                Professional Bio
              </Label>

              <Textarea  
                id="bio"
                placeholder="Tell us about yourself and your professional journey."
                {...register("bio")}
              />
             

              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

             {/* SUBMIT BUTTON */}
             <Button
               type="submit"
               className="w-full"
               disabled={isLoading}
             >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
             </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
