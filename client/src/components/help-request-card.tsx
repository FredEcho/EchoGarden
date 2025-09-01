import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CommentSection } from "./comment-section";
import { MessageCircle, ChevronDown, ChevronUp, Trash2, MoreVertical } from "lucide-react";

interface HelpRequestCardProps {
  request: any;
  onResponse?: () => void;
  onDelete?: () => void;
}

export function HelpRequestCard({ request, onResponse, onDelete }: HelpRequestCardProps) {
  const [responseContent, setResponseContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getUserDisplayName = (user: any) => {
    // Use first letter of first name and last name
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    // Fallback to first letter of email if no name
    return user.email?.[0]?.toUpperCase() || 'A';
  };

  const userInitials = (user: any) => {
    return getUserDisplayName(user);
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: string } = {
      'Mental Health Support': 'bg-green-100 text-green-800',
      'Study Help': 'bg-blue-100 text-blue-800',
      'Career Advice': 'bg-purple-100 text-purple-800',
      'Life Skills': 'bg-orange-100 text-orange-800',
      'Creative Feedback': 'bg-pink-100 text-pink-800',
      'Tech Support': 'bg-indigo-100 text-indigo-800',
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-800';
  };

  const submitResponseMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/help-requests/${request.id}/responses`, {
        content: responseContent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Help Offered! 🌱",
        description: "Your response has been sent and a special seed has been planted in your garden. Check your garden to see it grow!",
      });
      setResponseContent("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/help-requests" });
      queryClient.invalidateQueries({ queryKey: ["/api/garden"] });
      onResponse?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting to delete echo:", request.id);
      const response = await apiRequest("DELETE", `/api/help-requests/${request.id}`);
      console.log("Delete response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Delete successful");
      toast({
        title: "Echo Deleted",
        description: "Your echo has been removed from the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/help-requests" });
      onDelete?.();
    },
    onError: (error) => {
      console.error("Delete error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete your echo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitResponse = () => {
    if (!responseContent.trim()) {
      toast({
        title: "Empty Response",
        description: "Please write a response before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitResponseMutation.mutate();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
  };

  const isAuthor = user?.id === request.userId;

  return (
    <Card className="card-shadow hover-lift" data-testid={`help-request-${request.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.user?.profileImageUrl} alt="User avatar" />
            <AvatarFallback className="gradient-purple-orange text-white">
              {userInitials(request.user)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-foreground" data-testid="text-username">
                {getUserDisplayName(request.user)}
              </span>
              <span className="text-sm text-muted-foreground" data-testid="text-timestamp">
                {timeAgo(request.createdAt)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getCategoryColor(request.category?.name)} data-testid="badge-category">
                {request.category?.name}
              </Badge>
              {request.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline" data-testid={`badge-tag-${tag}`}>
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h4 className="font-semibold text-foreground mb-2" data-testid="text-title">
              {request.title}
            </h4>
            <p className="text-muted-foreground mb-4" data-testid="text-description">
              {request.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-sm text-muted-foreground">
                  <span className="text-green-500 mr-1">🌱</span>
                  <span data-testid="text-response-count">{request.responseCount} helping</span>
                </span>
                <span className="text-sm text-muted-foreground" data-testid="text-view-count">
                  {request.viewCount} views
                </span>
                {isAuthor && (
                  <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={handleDelete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Echo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this echo? This action cannot be undone and will also remove all comments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmDelete}
                          className="bg-red-500 hover:bg-red-600"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete Echo"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {showComments ? (
                    <>
                      Hide Comments
                      <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Show Comments
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-green-500 text-white hover:bg-green-600"
                      data-testid="button-offer-help"
                    >
                      Offer Help
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                                      <DialogHeader>
                    <DialogTitle>Offer Help to {getUserDisplayName(request.user)}</DialogTitle>
                  </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{request.title}</h4>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                      <Textarea
                        placeholder="Share your advice, experience, or offer to help..."
                        value={responseContent}
                        onChange={(e) => setResponseContent(e.target.value)}
                        className="min-h-[120px]"
                        data-testid="textarea-response"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitResponse}
                          disabled={submitResponseMutation.isPending}
                          className="bg-green-500 hover:bg-green-600"
                          data-testid="button-submit-response"
                        >
                          {submitResponseMutation.isPending ? "Sending..." : "Send Help 🌱"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Comment Section */}
            {showComments && (
              <CommentSection 
                helpRequestId={request.id}
                onCommentAdded={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
                  queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/help-requests" });
                  onResponse?.();
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
