import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Users, Lock, Globe2, MessageSquare, UserPlus, Edit2, Save, X, Eye, Smile, Map, Palette } from 'lucide-react';
import { toast } from 'sonner';
import PostEditor from './PostEditor';
import PostCard, { Post } from './PostCard';

interface GroupPageProps {
  onNavigateToProfile: (name: string) => void;
  posts: Post[];
  onPostCreated: (content: string) => void;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onCommentToggle: (postId: string) => void;
  onAddComment: (postId: string) => void;
  expandedComments: Record<string, boolean>;
  commentInputs: Record<string, string>;
  setCommentInputs: (val: (prev: Record<string, string>) => Record<string, string>) => void;
}

const NICHES = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Surgery',
  'Psychiatry',
  'Oncology',
  'Dermatology',
  'Medical Students',
  'Nursing',
  'Healthcare Tech',
  'Research'
];

export default function GroupPage({
  onNavigateToProfile,
  posts,
  onPostCreated,
  onLike,
  onShare,
  onCommentToggle,
  onAddComment,
  expandedComments,
  commentInputs,
  setCommentInputs
}: GroupPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [groupData, setGroupData] = useState({
    name: 'New Medical Group',
    niche: 'General Medicine',
    privacy: 'Public',
    cover: 'https://picsum.photos/seed/medical-group/1200/400',
    avatar: 'https://picsum.photos/seed/group-avatar/200/200',
    members: 1,
    description: 'A community for medical professionals to connect, share knowledge, and discuss cases.'
  });

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupData(prev => ({ ...prev, cover: reader.result as string }));
        toast.success('Cover photo updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupData(prev => ({ ...prev, avatar: reader.result as string }));
        toast.success('Group photo updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInvite = () => {
    toast.success('Invite link copied to clipboard!');
  };

  const handleMessage = () => {
    toast.success('Group chat opened');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Cover Photo */}
      <div className="relative h-64 sm:h-80 rounded-b-2xl overflow-hidden bg-slate-200 group">
        <img 
          src={groupData.cover} 
          alt="Group Cover" 
          className="w-full h-full object-cover"
        />
        {isEditing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="cursor-pointer bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-sm transition-colors">
              <Camera className="h-8 w-8 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          </div>
        )}
      </div>

      {/* Group Header Info */}
      <div className="relative px-4 sm:px-8 pb-8 bg-white rounded-b-2xl shadow-sm -mt-4 pt-4">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-20 sm:-mt-24 mb-6 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
              <img 
                src={groupData.avatar} 
                alt="Group Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <label className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                <Camera className="h-5 w-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>

          {/* Title & Actions */}
          <div className="flex-1 w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={groupData.name}
                  onChange={e => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-3xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 w-full max-w-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-slate-900">{groupData.name}</h1>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-slate-600 font-medium">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    {groupData.privacy === 'Public' ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    <select
                      value={groupData.privacy}
                      onChange={e => setGroupData(prev => ({ ...prev, privacy: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Public">Public Group</option>
                      <option value="Private">Private Group</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {groupData.privacy === 'Public' ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    <span>{groupData.privacy} Group</span>
                  </div>
                )}
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{groupData.members} Member{groupData.members !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isEditing ? (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleInvite}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                    title="Edit Group"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Group Details (Edit Mode) */}
        {isEditing && (
          <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800 mb-4">Group Settings</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Niche / Category</label>
                <select
                  value={groupData.niche}
                  onChange={e => setGroupData(prev => ({ ...prev, niche: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {NICHES.map(niche => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={groupData.description}
                  onChange={e => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-none"
                  placeholder="Describe what this group is about..."
                />
              </div>
            </div>
          </div>
        )}
        
        {!isEditing && (
          <div className="mt-4">
            <p className="text-slate-700">{groupData.description}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
              {groupData.niche}
            </div>
          </div>
        )}
      </div>

      {/* Group Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            {!showEditor ? (
              <>
                <div className="flex gap-3 mb-4">
                  <img src={groupData.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  <button 
                    onClick={() => setShowEditor(true)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full px-4 text-left text-slate-500 text-sm outline-none"
                  >
                    Write something to {groupData.name}...
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-1">
                  <button onClick={() => setShowEditor(true)} className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                    <ImageIcon className="h-5 w-5 text-green-500" /> Photo/Video
                  </button>
                  <button onClick={() => setShowEditor(true)} className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                    <UserPlus className="h-5 w-5 text-blue-500" /> Tag people
                  </button>
                  <button onClick={() => setShowEditor(true)} className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                    <Smile className="h-5 w-5 text-yellow-500" /> Feeling/Activity
                  </button>
                  <button onClick={() => setShowEditor(true)} className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                    <Map className="h-5 w-5 text-red-500" /> Check in
                  </button>
                  <button onClick={() => setShowEditor(true)} className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                    <Palette className="h-5 w-5 text-purple-500" /> Background color
                  </button>
                  <button onClick={() => setShowEditor(true)} className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                    <Camera className="h-5 w-5 text-slate-700" /> Camera
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Create Post in {groupData.name}</h3>
                  <button onClick={() => setShowEditor(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-full">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <PostEditor onPostCreated={(content) => {
                  onPostCreated(content);
                  setShowEditor(false);
                }} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {posts.map(post => (
              <PostCard 
                key={post.id}
                post={post}
                onLike={onLike}
                onShare={onShare}
                onCommentToggle={onCommentToggle}
                onAddComment={onAddComment}
                isExpanded={!!expandedComments[post.id]}
                commentInput={commentInputs[post.id] || ''}
                setCommentInput={(val) => setCommentInputs(prev => ({ ...prev, [post.id]: val }))}
                onNavigateToProfile={onNavigateToProfile}
              />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No posts yet</h3>
                <p className="text-slate-500 mt-1">Be the first to post in this group!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Members</h3>
              <button className="text-blue-600 hover:underline text-sm font-medium">See All</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['Sarah Jenkins', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Taylor', 'James Wilson'].map((name, i) => (
                <div 
                  key={i} 
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => onNavigateToProfile?.(name)}
                >
                  <img src={`https://picsum.photos/seed/${name.split(' ')[0]}/150/150`} alt={name} className="w-14 h-14 rounded-full object-cover group-hover:opacity-90 transition-opacity border border-slate-100 shadow-sm" />
                  <span className="text-xs font-semibold text-slate-800 text-center truncate w-full">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
