import React, { useState, useEffect } from 'react';
import { Globe, Users, UserCircle, LogOut, Menu, X, Home } from 'lucide-react';
import Directory from './Directory';
import Profile from './Profile';
import PostEditor from './PostEditor';
import PostCard, { Post, Comment } from './PostCard';

interface DashboardProps {
  onLogout: () => void;
}

type Tab = 'feed' | 'directory' | 'profile';

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem('medconnect_posts');
    if (savedPosts) {
      try {
        const parsed = JSON.parse(savedPosts);
        return parsed.map((p: any) => ({
          ...p,
          likes: p.likes || Math.floor(Math.random() * 50) + 5,
          isLiked: p.isLiked || false,
          views: p.views || Math.floor(Math.random() * 500) + 100,
          shares: p.shares || Math.floor(Math.random() * 20),
          comments: p.comments || []
        }));
      } catch (e) {
        console.error('Failed to parse posts from localStorage', e);
      }
    }
    return [
      {
        id: '1',
        author: 'Dr. Sarah Jenkins',
        time: '2 hours ago',
        location: 'New York, USA',
        avatar: 'https://picsum.photos/seed/sarah/150/150',
        content: '<p>Just received a new shipment of diagnostic ultrasound machines. Looking to connect with clinics in South America for distribution. Send me a message if interested!</p>',
        likes: 24,
        isLiked: false,
        views: 342,
        shares: 5,
        comments: [
          {
            id: 'c1',
            author: 'Dr. Michael Chen',
            avatar: 'https://picsum.photos/seed/michael/150/150',
            content: 'I am interested! Sending you a DM now.',
            time: '1 hour ago'
          }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('medconnect_posts', JSON.stringify(posts));
  }, [posts]);

  const handlePostCreated = (content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: 'Jane Doe', // Current user's name
      time: 'Just now',
      location: 'Chicago, US', // Current user's location
      avatar: 'https://picsum.photos/seed/jane/200/200', // Current user's avatar
      content: content,
      likes: 0,
      isLiked: false,
      views: 0,
      shares: 0,
      comments: []
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleShare = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    setToastMessage('Post link copied to clipboard!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Jane Doe',
      avatar: 'https://picsum.photos/seed/jane/200/200',
      content: text.trim(),
      time: 'Just now'
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const navigation = [
    { id: 'feed', name: 'Global Feed', icon: Home },
    { id: 'directory', name: 'Network Directory', icon: Users },
    { id: 'profile', name: 'My Profile', icon: UserCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 hidden sm:block">MedConnect</span>
              </div>
              
              {/* Desktop Nav */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? 'border-blue-500 text-slate-900'
                          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      activeTab === item.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="w-full flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === 'feed' && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Create a Post</h1>
            <PostEditor onPostCreated={handlePostCreated} />
            
            <div className="mt-12 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              
              {posts.map(post => (
                <PostCard 
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onShare={handleShare}
                  onCommentToggle={toggleComments}
                  onAddComment={handleAddComment}
                  isExpanded={!!expandedComments[post.id]}
                  commentInput={commentInputs[post.id] || ''}
                  setCommentInput={(val) => setCommentInputs(prev => ({ ...prev, [post.id]: val }))}
                />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'directory' && <Directory />}
        {activeTab === 'profile' && (
          <Profile 
            posts={posts.filter(p => p.author === 'Jane Doe')}
            onPostCreated={handlePostCreated}
            onLike={handleLike}
            onShare={handleShare}
            onCommentToggle={toggleComments}
            onAddComment={handleAddComment}
            expandedComments={expandedComments}
            commentInputs={commentInputs}
            setCommentInputs={setCommentInputs}
          />
        )}
      </main>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <div className="h-2 w-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
