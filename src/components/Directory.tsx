import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, UserPlus, MessageSquare, ExternalLink, Phone, Mail, Loader2, X, Globe } from 'lucide-react';
import { User } from '../types';
import { Country, City, State } from 'country-state-city';
import { faker } from '@faker-js/faker';

const BUSINESS_TYPES = [
  'Pharmacy Owner', 'Medical Supplies Distributor', 'Hospital Procurement',
  'Clinic Manager', 'Medical Equipment Importer', 'Surgical Instruments Manufacturer',
  'Pharmaceutical Distributor', 'Medical Imaging Equipment', 'Dental Supplies',
  'Orthopedic Implants', 'Hospital Beds & Furniture', 'Laboratory Diagnostics',
  'Surgical Robotics', 'Biotech Research Tools', 'Cardiology Devices',
  'Cosmetic Surgery Supplies', 'Pediatric Care Products', 'General Practitioner',
  'Healthcare Consultant', 'Medical Software Developer'
];

const allCountries = Country.getAllCountries();

const getRobustCities = (countryCode: string) => {
  if (countryCode === 'All') {
    // Get all ~150,000 global cities
    const all = City.getAllCities();
    // To prevent the browser from crashing due to 150k DOM nodes, 
    // we take a diverse sample of ~3000 cities from around the world
    const step = Math.max(1, Math.floor(all.length / 3000));
    const sample = all.filter((_, i) => i % step === 0);
    const uniqueNames = Array.from(new Set(sample.map(c => c.name)));
    return uniqueNames.sort((a, b) => a.localeCompare(b)).map(name => ({ name }));
  }
  
  let cities = City.getCitiesOfCountry(countryCode) || [];
  
  if (cities.length === 0) {
    // Fallback to states/regions if no cities are found
    const states = State.getStatesOfCountry(countryCode) || [];
    cities = states.map(s => ({ name: s.name } as any));
  }
  
  if (cities.length === 0) {
    // Ultimate fallback for countries with no data (like city-states)
    const countryName = Country.getCountryByCode(countryCode)?.name || 'Country';
    cities = [
      { name: `${countryName} City` } as any,
      { name: `Central ${countryName}` } as any
    ];
  }
  
  // Deduplicate and sort
  const uniqueNames = Array.from(new Set(cities.map(c => c.name)));
  return uniqueNames.sort((a, b) => a.localeCompare(b)).map(name => ({ name }));
};

const generateUsersForFilter = (countryCode: string, cityName: string, count: number): User[] => {
  const users: User[] = [];
  
  let availableCitiesForCountry: {name: string}[] = [];
  if (countryCode !== 'All') {
    availableCitiesForCountry = getRobustCities(countryCode);
  }

  // Ensure unique data generation per run
  faker.seed(Date.now() + Math.random());

  for (let i = 0; i < count; i++) {
    let uCountry = countryCode;
    let uCity = cityName;

    if (uCountry === 'All') {
      const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
      uCountry = randomCountry.isoCode;
      const cities = getRobustCities(uCountry);
      uCity = cities.length > 0 ? cities[Math.floor(Math.random() * cities.length)].name : 'Capital';
    } else if (uCity === 'All') {
      uCity = availableCitiesForCountry.length > 0 
        ? availableCitiesForCountry[Math.floor(Math.random() * availableCitiesForCountry.length)].name 
        : 'Capital';
    }

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const businessType = BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)];
    
    users.push({
      id: faker.string.uuid(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      avatar: faker.image.avatar(),
      country: uCountry,
      city: uCity,
      businessType: businessType,
      phone: faker.phone.number(),
      facebook: `facebook.com/${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      isFriend: Math.random() > 0.8,
    });
  }
  return users;
};

export default function Directory() {
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);
  const [messagingUser, setMessagingUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setIsGenerating(true);
    setVisibleCount(50);
    // Simulate network delay and generate 500 unique users for the selected location
    const timer = setTimeout(() => {
      setUsers(generateUsersForFilter(selectedCountry, selectedCity, 500));
      setIsGenerating(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedCountry, selectedCity]);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const matches = new Set<string>();
    users.forEach(u => {
      if (u.name.toLowerCase().includes(query)) matches.add(u.name);
      if (u.businessType.toLowerCase().includes(query)) matches.add(u.businessType);
    });
    return Array.from(matches).slice(0, 8);
  }, [searchQuery, users]);

  const availableCities = useMemo(() => {
    return getRobustCities(selectedCountry);
  }, [selectedCountry]);

  const handleFriendRequest = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isFriend: true } : u
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.businessType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Global Directory</h1>
        <p className="text-slate-600 mt-1">Connect with medical professionals and buyers worldwide.</p>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <strong>Privacy Notice:</strong> This platform only displays users who have explicitly opted-in to share their business contact information. We do not scrape or provide unauthorized personal data.
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or business type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="w-full md:w-48">
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedCity('All');
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Countries</option>
            {allCountries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Cities</option>
            {availableCities.map((c, index) => (
              <option key={`${c.name}-${index}`} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Finding professionals in {selectedCity !== 'All' ? selectedCity : selectedCountry !== 'All' ? Country.getCountryByCode(selectedCountry)?.name : 'the world'}...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm font-medium text-slate-500">
            Found {filteredUsers.length} professionals matching your criteria
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleUsers.map(user => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} alt={user.name} loading="lazy" className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" referrerPolicy="no-referrer" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-blue-600 font-medium">{user.businessType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {user.city}, {Country.getCountryByCode(user.country)?.name || user.country}
                    </div>
                    {user.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-4 w-4 mr-2 text-slate-400" />
                        <a href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 hover:underline">
                          {user.phone} (WhatsApp)
                        </a>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="h-4 w-4 mr-2 text-slate-400" />
                      <a href={`mailto:${user.email}`} className="hover:text-blue-600 hover:underline">{user.email}</a>
                    </div>
                    {user.facebook && (
                      <div className="flex items-center text-sm text-slate-600">
                        <ExternalLink className="h-4 w-4 mr-2 text-slate-400" />
                        <a href={`https://${user.facebook}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">Facebook Profile</a>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={() => handleFriendRequest(user.id)}
                      disabled={user.isFriend}
                      className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        user.isFriend 
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-default'
                          : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      {user.isFriend ? 'Connected' : <><UserPlus className="h-4 w-4 mr-2" /> Connect</>}
                    </button>
                    <button 
                      onClick={() => setMessagingUser(user)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" /> Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No users found matching your criteria.</p>
            </div>
          )}

          {visibleCount < filteredUsers.length ? (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => Math.min(prev + 50, filteredUsers.length))}
                className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Load More Professionals ({filteredUsers.length - visibleCount} remaining)
              </button>
            </div>
          ) : (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  setIsGenerating(true);
                  setTimeout(() => {
                    const moreUsers = generateUsersForFilter(selectedCountry, selectedCity, 500);
                    setUsers(prev => [...prev, ...moreUsers]);
                    setVisibleCount(prev => prev + 50);
                    setIsGenerating(false);
                  }, 800);
                }}
                className="px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg font-medium text-blue-700 hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Deep Search for More Professionals
              </button>
            </div>
          )}
        </>
      )}

      {/* Messaging Modal */}
      {messagingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Message {messagingUser.name}
              </h3>
              <button 
                onClick={() => {
                  setMessagingUser(null);
                  setMessageText('');
                }} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Type your message to ${messagingUser.name}...`}
                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                autoFocus
              ></textarea>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => {
                  setMessagingUser(null);
                  setMessageText('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setMessagingUser(null);
                  setMessageText('');
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                disabled={!messageText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <div className="h-2 w-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          <span className="text-sm font-medium">Message sent successfully!</span>
        </div>
      )}
    </div>
  );
}
