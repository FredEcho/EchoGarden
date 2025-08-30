import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

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

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/help-requests", {
        title,
        description,
        categoryId,
        tags,
      });
    },
    onSuccess: () => {
      toast({
        title: "Help Request Posted!",
        description: "Your request has been shared with the community.",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategoryId("");
      setTags([]);
      setCurrentTag("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      
      onSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to post your request. Please try again.",
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
        title: "Missing Title",
        description: "Please provide a title for your request.",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please describe what help you need.",
        variant: "destructive",
      });
      return;
    }
    
    if (!categoryId) {
      toast({
        title: "Missing Category",
        description: "Please select a category for your request.",
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
          <span>📢</span>
          <span>Ask for Help</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">What do you need help with?</label>
          <Input
            placeholder="e.g., Understanding calculus derivatives"
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
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            placeholder="Describe your situation and what kind of help you're looking for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
            data-testid="textarea-description"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tags (optional)</label>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Add relevant tags"
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
            {submitMutation.isPending ? "Posting..." : "Post Request 🌱"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
