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
import { useTimeAgo } from "@/hooks/useTimeAgo";
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
  const timeAgo = useTimeAgo(request.createdAt);

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
    <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" data-testid={`help-request-${request.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="w-14 h-14 ring-2 ring-white/50 shadow-lg">
              <AvatarImage src={request.user?.profileImageUrl} alt="User avatar" />
              <AvatarFallback className="gradient-purple-orange text-white font-semibold">
                {userInitials(request.user)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header with user info and timestamp */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-foreground text-lg" data-testid="text-username">
                  {getUserDisplayName(request.user)}
                </span>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <span data-testid="text-timestamp" className="animate-pulse">
                    {timeAgo}
                  </span>
                </div>
              </div>
              {isAuthor && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  <span>Your Echo</span>
                </div>
              )}
            </div>
            
            {/* Category and tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`${getCategoryColor(request.category?.name)} shadow-sm`} data-testid="badge-category">
                {request.category?.name}
              </Badge>
              {request.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline" className="bg-white/50 border-white/30 text-muted-foreground" data-testid={`badge-tag-${tag}`}>
                  #{tag}
                </Badge>
              ))}
            </div>
            
            {/* Title and description */}
            <div className="mb-4">
              <h4 className="font-bold text-foreground text-lg mb-2 leading-tight" data-testid="text-title">
                {request.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {request.description}
              </p>
            </div>
            
            {/* Stats and actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/30">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <span className="text-green-500">🌱</span>
                    <span data-testid="text-response-count">{request.responseCount}</span>
                    <span>helping</span>
                  </span>
                </div>
                {isAuthor && (
                  <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50/50 transition-colors"
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
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="text-muted-foreground hover:text-foreground hover:bg-white/50 transition-all"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {showComments ? (
                    <>
                      Hide Comments
                      <ChevronUp className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Show Comments
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                {!isAuthor && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="btn-success button-pop button-ripple text-white shadow-lg"
                        data-testid="button-offer-help"
                      >
                        🌱 Offer Help
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
                          className="btn-outline button-pop"
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitResponse}
                          disabled={submitResponseMutation.isPending}
                          className="btn-success button-pop button-ripple"
                          data-testid="button-submit-response"
                        >
                          {submitResponseMutation.isPending ? "Sending..." : "Send Help 🌱"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                )}
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
