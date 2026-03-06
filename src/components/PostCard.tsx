import React from 'react';
import { Heart, MessageCircle, Share2, Eye, Send } from 'lucide-react';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

export interface Post {
  id: string;
  content: string;
  author: string;
  time: string;
  avatar: string;
  location: string;
  likes: number;
  isLiked: boolean;
  views: number;
  shares: number;
  comments: Comment[];
}

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onCommentToggle: (id: string) => void;
  onAddComment: (id: string) => void;
  isExpanded: boolean;
  commentInput: string;
  setCommentInput: (val: string) => void;
}

export default function PostCard({ post, onLike, onShare, onCommentToggle, onAddComment, isExpanded, commentInput, setCommentInput }: PostCardProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h4 className="font-semibold text-slate-900">{post.author}</h4>
            <p className="text-xs text-slate-500">{post.time} • {post.location}</p>
          </div>
        </div>
      </div>
      <div 
        className="text-slate-700 prose prose-slate max-w-none prose-img:rounded-xl prose-img:max-h-[500px] prose-img:object-contain prose-video:rounded-xl prose-video:w-full mb-4"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* Post Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 py-3 border-y border-slate-100 mb-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments.length}</span>
          <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> {post.shares}</span>
        </div>
        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views} views</span>
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${post.isLiked ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
          {post.isLiked ? 'Liked' : 'Like'}
        </button>
        <button 
          onClick={() => onCommentToggle(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <button 
          onClick={() => onShare(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Existing Comments */}
          {post.comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full object-cover mt-1" />
              <div className="flex-1 bg-slate-50 rounded-2xl px-4 py-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-900">{comment.author}</span>
                  <span className="text-xs text-slate-500">{comment.time}</span>
                </div>
                <p className="text-sm text-slate-700">{comment.content}</p>
              </div>
            </div>
          ))}

          {/* Add Comment Input */}
          <div className="flex gap-3 items-center mt-4">
            <img src="https://picsum.photos/seed/jane/200/200" alt="You" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddComment(post.id);
                }}
                className="w-full pl-4 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <button 
                onClick={() => onAddComment(post.id)}
                disabled={!commentInput?.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
