import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

export function MatureSeedsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMatureSeeds = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/garden/mature-all", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to mature seeds");
      }

      const result = await response.json();
      
      toast({
        title: "🌱 Seeds Matured! 🌸",
        description: "All your seeds have grown to their beautiful final form!",
      });

      // Refresh the garden data
      queryClient.invalidateQueries({ queryKey: ["/api/garden"] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mature seeds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMatureSeeds}
      disabled={isLoading}
      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {isLoading ? "Maturing Seeds..." : "🌱 Mature All Seeds 🌸"}
    </Button>
  );
}


