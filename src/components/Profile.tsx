import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Camera, Save, MapPin, Briefcase, Globe, Mail, Phone, Facebook, GraduationCap, Heart, Clock, Image as ImageIcon, UserPlus, Smile, Map, Palette, Video, Eye, Plus, Edit2, MessageSquare, Hand, Send, X } from 'lucide-react';
import { Country, City, State } from 'country-state-city';
import JoditEditor from 'jodit-react';
import PostCard, { Post } from './PostCard';
import PostEditor from './PostEditor';

interface ProfileProps {
  viewingProfile?: string | null;
  onNavigateToProfile?: (name: string) => void;
  onNavigateToMessages?: (name: string) => void;
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

const allCountries = Country.getAllCountries();

const getRobustCities = (countryCode: string) => {
  if (!countryCode || countryCode === 'All') return [];
  
  let cities = City.getCitiesOfCountry(countryCode) || [];
  
  if (cities.length === 0) {
    const states = State.getStatesOfCountry(countryCode) || [];
    cities = states.map(s => ({ name: s.name } as any));
  }
  
  if (cities.length === 0) {
    const countryName = Country.getCountryByCode(countryCode)?.name || 'Country';
    cities = [
      { name: `${countryName} City` } as any,
      { name: `Central ${countryName}` } as any
    ];
  }
  
  const uniqueNames = Array.from(new Set(cities.map(c => c.name)));
  return uniqueNames.sort((a, b) => a.localeCompare(b)).map(name => ({ name }));
};

export default function Profile({ viewingProfile, onNavigateToProfile, onNavigateToMessages, posts, onPostCreated, onLike, onShare, onCommentToggle, onAddComment, expandedComments, commentInputs, setCommentInputs }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [profileTab, setProfileTab] = useState<'all' | 'photo' | 'reels'>('all');
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const [myProfile, setMyProfile] = useState(() => {
    const savedProfile = localStorage.getItem('medconnect_profile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        console.error('Failed to parse profile from localStorage', e);
      }
    }
    return {
      name: 'Jane Doe',
      bio: 'Medical equipment supplier specializing in diagnostic tools. Looking to connect with clinics and hospitals across Europe and Asia.',
      country: 'US',
      city: 'Chicago',
      businessType: 'Supplier',
      email: 'jane.doe@example.com',
      phone: '+1 555-0198',
      facebook: 'facebook.com/janedoe.med',
      age: '28',
      education: 'Harvard Medical School',
      status: 'Single',
      workplace: 'General Hospital',
      avatar: 'https://picsum.photos/seed/jane/200/200',
      cover: 'https://picsum.photos/seed/medical/1200/400'
    };
  });

  useEffect(() => {
    localStorage.setItem('medconnect_profile', JSON.stringify(myProfile));
  }, [myProfile]);

  const isOwnProfile = !viewingProfile || viewingProfile === myProfile.name;

  const profile = useMemo(() => {
    if (isOwnProfile) return myProfile;
    
    // Generate a mock profile for other users
    return {
      name: viewingProfile,
      bio: `Medical professional based in the United States. Passionate about healthcare innovation and connecting with others in the field.`,
      country: 'US',
      city: 'New York',
      businessType: 'Healthcare Professional',
      email: `${viewingProfile.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: '+1 555-0000',
      facebook: `facebook.com/${viewingProfile.toLowerCase().replace(/\s+/g, '')}`,
      age: '32',
      education: 'Medical University',
      status: 'Married',
      workplace: 'City Hospital',
      avatar: `https://picsum.photos/seed/${viewingProfile}/200/200`,
      cover: `https://picsum.photos/seed/${viewingProfile}cover/1200/400`
    };
  }, [isOwnProfile, myProfile, viewingProfile]);

  const availableCities = useMemo(() => {
    return getRobustCities(profile.country);
  }, [profile.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isOwnProfile) return;
    setMyProfile({ ...myProfile, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (!isOwnProfile) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMyProfile({ ...myProfile, [type]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFriendRequest = () => {
    if (requestStatus === 'none') {
      setRequestStatus('pending');
      toast.success(`Friend request sent to ${profile.name}`);
      setTimeout(() => {
        toast(`Notification: ${profile.name} received your friend request.`, { icon: '🔔' });
      }, 1500);
    } else if (requestStatus === 'pending') {
      setRequestStatus('none');
      toast.info(`Friend request to ${profile.name} canceled`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Cover Photo */}
      <div className="relative h-64 sm:h-80 w-full rounded-b-2xl overflow-hidden group">
        <img src={profile.cover} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        {isEditing && isOwnProfile && (
          <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <span className="font-medium">Change Cover</span>
            </div>
          </label>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 sm:-mt-24 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative group w-32 h-32 sm:w-40 sm:h-40 shrink-0">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover bg-white"
                referrerPolicy="no-referrer"
              />
              {isEditing && isOwnProfile && (
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                  />
                  <Camera className="h-6 w-6 text-white" />
                </label>
              )}
            </div>
            {!isEditing && (
              <div className="mt-2 sm:mt-0 sm:pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                <p className="text-slate-500 font-medium">1,042 friends • {posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-0 pb-4">
            {isOwnProfile ? (
              isEditing ? (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Story
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleFriendRequest}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 shadow-sm ${
                    requestStatus === 'pending' 
                      ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {requestStatus === 'pending' ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel Request
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add Friend
                    </>
                  )}
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
                  onClick={() => toast.success(`You poked ${profile.name}!`)}
                >
                  <Hand className="h-4 w-4" />
                  Poke
                </button>
                <button 
                  onClick={() => onNavigateToMessages?.(profile.name)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-6 border-t border-slate-200 pt-1 mb-6">
            <button onClick={() => setProfileTab('all')} className={`py-4 font-semibold text-sm border-b-4 transition-colors ${profileTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}>All</button>
            <button onClick={() => setProfileTab('photo')} className={`py-4 font-semibold text-sm border-b-4 transition-colors ${profileTab === 'photo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}>Photo</button>
            <button onClick={() => setProfileTab('reels')} className={`py-4 font-semibold text-sm border-b-4 transition-colors ${profileTab === 'reels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}>Reels</button>
          </div>
        )}

        {/* Profile Info */}
        <div className={isEditing ? "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8" : ""}>
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                  <input type="text" name="businessType" value={profile.businessType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input type="text" name="age" value={profile.age} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Education / Formation</label>
                  <input type="text" name="education" value={profile.education} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Status</label>
                  <input type="text" name="status" value={profile.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Workplace</label>
                  <input type="text" name="workplace" value={profile.workplace} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <select 
                    name="country" 
                    value={profile.country} 
                    onChange={(e) => {
                      setProfile({ ...profile, country: e.target.value, city: '' });
                    }} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>Select a country</option>
                    {allCountries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <select 
                    name="city" 
                    value={profile.city} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={!profile.country}
                  >
                    <option value="" disabled>Select a city</option>
                    {availableCities.map((c, index) => (
                      <option key={`${c.name}-${index}`} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">About / Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp / Phone</label>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Facebook Profile URL</label>
                    <input type="text" name="facebook" value={profile.facebook} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {profileTab === 'all' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Intro & Friends */}
                  <div className="lg:col-span-1 space-y-6">
                {/* Intro Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Intro</h3>
                  <p className="text-sm text-slate-700 text-center mb-4 pb-4 border-b border-slate-100">{profile.bio}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700">Works at <strong>{profile.workplace}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700">Studied at <strong>{profile.education}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700">Lives in <strong>{profile.city ? `${profile.city}, ` : ''}{Country.getCountryByCode(profile.country)?.name || profile.country}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700"><strong>{profile.status}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700">Age: <strong>{profile.age}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700"><strong>{profile.phone}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700"><strong>{profile.email}</strong></span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors text-sm"
                  >
                    Edit Details
                  </button>
                </div>

                {/* Friends Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Friends</h3>
                    <button className="text-blue-600 hover:underline text-sm">See All Friends</button>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">1,042 friends</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {['Hiten Patel', 'Sarah Jenkins', 'Michael Chen', 'Emma Watson', 'David Smith', 'Jessica Alba'].map((name, i) => (
                      <div 
                        key={i} 
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                        onClick={() => onNavigateToProfile?.(name)}
                      >
                        <img src={`https://picsum.photos/seed/${name.split(' ')[0]}/150/150`} alt={name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover group-hover:opacity-90 transition-opacity border border-slate-100 shadow-sm" />
                        <span className="text-xs font-semibold text-slate-800 text-center truncate w-full">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Post Editor & Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Post Creator */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  {!showEditor ? (
                    <>
                      <div className="flex gap-3 mb-4">
                        <img src={profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                        <button 
                          onClick={() => setShowEditor(true)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full px-4 text-left text-slate-500 text-sm outline-none"
                        >
                          Write something to {profile.name}...
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
                        <h3 className="font-bold text-slate-900">Create Post</h3>
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

                {/* User's Posts */}
                <div className="space-y-6">
                  {posts.length > 0 ? (
                    posts.map(post => (
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
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                      <p className="text-slate-500 font-medium">No posts available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {profileTab === 'photo' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/userphoto${i}/300/300`} alt="User photo" className="w-full aspect-square object-cover rounded-lg hover:opacity-90 cursor-pointer transition-opacity" />
                    ))}
                  </div>
                </div>
              )}

              {profileTab === 'reels' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Reels</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="relative aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden group cursor-pointer">
                        <img src={`https://picsum.photos/seed/reel${i}/300/533`} alt="Reel thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
                          <Eye className="h-3 w-3" /> {Math.floor(Math.random() * 10) + 1}K
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
