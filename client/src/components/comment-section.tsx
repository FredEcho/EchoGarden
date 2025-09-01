import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MessageCircle, Heart, Send } from "lucide-react";

interface CommentSectionProps {
  helpRequestId: string;
  onCommentAdded?: () => void;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  isMarkedHelpful: boolean;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
  };
}

export function CommentSection({ helpRequestId, onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: [`/api/help-requests/${helpRequestId}/responses`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/help-requests/${helpRequestId}/responses`);
      const data = await response.json();
      return data as Comment[];
    },
  });

  // Submit new comment
  const submitCommentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/help-requests/${helpRequestId}/responses`, {
        content: newComment.trim(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Posted! 🌱",
        description: "Your comment has been added and a special seed has been planted in your garden. Check your garden to see it grow!",
      });
      setNewComment("");
      setIsSubmitting(false);
      refetch();
      onCommentAdded?.();
    },
    onError: (error) => {
      setIsSubmitting(false);
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
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark comment as helpful
  const markHelpfulMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("POST", `/api/help-responses/${commentId}/mark-helpful`, {
        helpRequestId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Marked as Helpful! ❤️",
        description: "Thank you for recognizing helpful comments.",
      });
      refetch();
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
        description: "Failed to mark comment as helpful. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please write a comment before posting.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    submitCommentMutation.mutate();
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getUserDisplayName = (user: any) => {
    // Use first letter of first name and last name
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    // Fallback to first letter of email if no name
    return user.email?.[0]?.toUpperCase() || 'A';
  };

  const getUserInitials = (user: any) => {
    return getUserDisplayName(user);
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        {/* Comment Input */}
        <div className="mb-6">
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="gradient-purple-orange text-white text-sm">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts, advice, or support..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/500 characters
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={comment.user.profileImageUrl} alt="User avatar" />
                  <AvatarFallback className="gradient-purple-orange text-white text-sm">
                    {getUserInitials(comment.user)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground text-sm">
                      {getUserDisplayName(comment.user)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </span>
                    {comment.isMarkedHelpful && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        ❤️ Helpful
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-foreground text-sm leading-relaxed mb-2">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpfulMutation.mutate(comment.id)}
                      disabled={markHelpfulMutation.isPending}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    >
                      <Heart className={`w-4 h-4 mr-1 ${comment.isMarkedHelpful ? 'fill-red-500 text-red-500' : ''}`} />
                      {comment.isMarkedHelpful ? 'Helpful' : 'Mark Helpful'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
