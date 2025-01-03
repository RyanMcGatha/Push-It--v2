"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserX } from "lucide-react";

interface OnboardingStatus {
  onboardingComplete: boolean;
  onboardingStep: string;
}

export default function OnboardingSection() {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/onboarding/progress");
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, []);

  const handleCompleteOnboarding = () => {
    router.push("/onboarding");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!status) return null;

  if (status.onboardingComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Onboarding Complete
          </CardTitle>
          <CardDescription>
            You have completed all onboarding steps
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserX className="h-5 w-5 text-yellow-500" />
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          You haven't completed the onboarding process yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Complete your profile setup to unlock all features. Your current
            progress is at the{" "}
            <span className="font-medium text-foreground">
              {status.onboardingStep}
            </span>{" "}
            step.
          </p>
          <Button onClick={handleCompleteOnboarding}>
            Continue Onboarding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
