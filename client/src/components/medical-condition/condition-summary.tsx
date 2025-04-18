import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MedicalCondition } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Edit2, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MedicalConditionSummary({ userId }: { userId: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  
  const isOwnSummary = user?.id === userId;
  const isDoctor = user?.role === "doctor";
  const canEdit = isDoctor; // Only doctors can edit summaries
  
  const { data: condition, isLoading, error } = useQuery<MedicalCondition>({
    queryKey: [`/api/users/${userId}/medical-condition`],
    queryFn: getQueryFn({ on401: "throw" }),
    onSuccess: (data) => {
      setSummaryText(data.summary);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async (summary: string) => {
      const res = await apiRequest(
        "POST", 
        `/api/users/${userId}/medical-condition`, 
        { summary }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/medical-condition`] });
      setIsEditing(false);
      toast({
        title: "Summary updated",
        description: "The medical condition summary has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function handleSave() {
    if (summaryText.trim()) {
      updateMutation.mutate(summaryText);
    }
  }
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error && !condition) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Medical Condition Summary</CardTitle>
          <CardDescription>
            Health overview and important medical information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || "Failed to load medical condition summary"}
            </AlertDescription>
          </Alert>
        </CardContent>
        {canEdit && (
          <CardFooter>
            <Button 
              onClick={() => {
                setIsEditing(true);
                setSummaryText("");
              }}
            >
              Create Summary
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Medical Condition Summary</span>
          {canEdit && !isEditing && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Health overview and important medical information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="Provide a summary of the patient's medical conditions, allergies, medications, and any other important health information..."
            className="min-h-[150px]"
          />
        ) : (
          <div className="prose">
            <p className="whitespace-pre-line">{condition?.summary || "No medical condition summary available."}</p>
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              setSummaryText(condition?.summary || "");
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}