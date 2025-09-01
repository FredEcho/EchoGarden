import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/hooks/useCategories";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SproutIcon } from "@/components/ui/logo";

interface PostHelpFormProps {
  onSuccess?: () => void;
}

export function PostHelpForm({ onSuccess }: PostHelpFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { categories } = useCategories();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const requestData = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        tags: tags.length > 0 ? tags.join(',') : null,
      };
      
      console.log("Submitting echo:", requestData);
      await apiRequest("POST", "/api/help-requests", requestData);
    },
    onSuccess: () => {
      toast({
        title: "Echo Posted! 🌱",
        description: "Your echo has been shared with the community and will help others grow.",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategoryId("");
      setTags([]);
      setCurrentTag("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/help-requests" });
      
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Echo submission error:", error);
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1000);
        return;
      }
      
      // Show specific validation errors if available
      if (error.message?.includes("400:")) {
        try {
          const errorData = JSON.parse(error.message.replace(/^\d+:\s*/, ''));
          if (errorData.errors) {
            const errorMessages = errorData.errors.map((err: any) => err.message).join(', ');
            toast({
              title: "Validation Error",
              description: errorMessages,
              variant: "destructive",
            });
            return;
          }
        } catch (e) {
          // Fall through to generic error handling
        }
      }
      
      // Generic error handling
      toast({
        title: "Error Posting Echo",
        description: error.message || "Failed to post your echo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Echo Title",
        description: "Please provide a title for your echo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Missing Echo Description",
        description: "Please describe what you need help with.",
        variant: "destructive",
      });
      return;
    }
    
    if (!categoryId) {
      toast({
        title: "Missing Category",
        description: "Please select a category for your echo.",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SproutIcon color="purple" />
          <span>Share Your Echo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">What's your echo about?</label>
          <Input
            placeholder="e.g., Need help understanding calculus derivatives"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-title"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id} data-testid={`option-category-${category.id}`}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tell us more about your echo</label>
          <Textarea
            placeholder="Share your story, what you're struggling with, and how the community can help you grow..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
            data-testid="textarea-description"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tags to help others find your echo (optional)</label>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="e.g., math, study-help, beginner"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              data-testid="input-tag"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddTag}
              data-testid="button-add-tag"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
                data-testid={`tag-${tag}`}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="gradient-purple-orange text-white"
            data-testid="button-submit"
          >
            {submitMutation.isPending ? "Sharing Echo..." : "Share Echo 🌱"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
