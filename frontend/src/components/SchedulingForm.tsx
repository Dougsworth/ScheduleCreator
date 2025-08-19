
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Download,
  TrendingUp,
  Target,
  Monitor,
  Calculator,
  Globe,
  Search,
  Users,
  User,
  Sun,
  Moon,
  MapPin,
  Tag,
  GraduationCap
} from 'lucide-react';

interface FormData {
  industry: string;
  focus: string;
  timePreference: string;
  sessionType: string;
  availability: string[];
}

interface Session {
  id: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  room?: string;
  instructor?: string;
  score?: number;
  tags?: string[];
}

const industries = [
  { 
    id: 'marketing', 
    name: 'Marketing', 
    icon: TrendingUp,
    subcategories: [
      { name: 'Digital Marketing', icon: Globe },
      { name: 'Content Strategy', icon: Users },
      { name: 'SEO/SEM', icon: Search },
      { name: 'Social Media', icon: Users }
    ]
  },
  { 
    id: 'sales', 
    name: 'Sales', 
    icon: Target,
    subcategories: [
      { name: 'B2B Sales', icon: Target },
      { name: 'Customer Success', icon: Users },
      { name: 'Lead Generation', icon: Search },
      { name: 'Sales Operations', icon: Calculator }
    ]
  },
  { 
    id: 'tech', 
    name: 'Technology', 
    icon: Monitor,
    subcategories: [
      { name: 'Software Development', icon: Monitor },
      { name: 'Product Management', icon: Target },
      { name: 'Data Science', icon: Calculator },
      { name: 'DevOps', icon: Monitor }
    ]
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    icon: Calculator,
    subcategories: [
      { name: 'Financial Planning', icon: Calculator },
      { name: 'Investment', icon: TrendingUp },
      { name: 'Accounting', icon: Calculator },
      { name: 'Risk Management', icon: Target }
    ]
  }
];

const timePreferences = [
  { id: 'morning', name: 'Morning (9AM - 12PM)', icon: Sun },
  { id: 'afternoon', name: 'Afternoon (12PM - 5PM)', icon: Sun },
  { id: 'evening', name: 'Evening (5PM - 8PM)', icon: Moon }
];

const timeSlots = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
];

const API_BASE_URL = 'http://localhost:3001/api';

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return {
    date: date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  };
};

const SchedulingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    industry: '',
    focus: '',
    timePreference: '',
    sessionType: '',
    availability: []
  });
  const [showResults, setShowResults] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState<Session[]>([]);
  const [timetableAccepted, setTimetableAccepted] = useState<boolean | null>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const generateTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-timetable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: formData.industry,
          focus: [formData.focus],
          timePreference: formData.timePreference,
          availability: formData.availability,
          preferences: {
            industry: formData.industry,
            focusAreas: [formData.focus],
            timeSlots: formData.availability
          }
        }),
      });

      if (!response.ok) {
        // Fallback to recommendations endpoint if timetable endpoint doesn't exist
        return fetchRecommendations();
      }

      const data = await response.json();
      setGeneratedTimetable(data.timetable || data.items || []);
    } catch (error) {
      console.error('Error generating timetable:', error);
      // Fallback to existing recommendations
      fetchRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: formData.industry,
          focus: [formData.focus],
          timePref: formData.timePreference ? {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          } : undefined,
          topK: formData.availability.length || 5,
          useLLM: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      // Map the sessions to fit selected time slots
      const mappedTimetable = mapSessionsToTimeSlots(data.items || [], formData.availability);
      setGeneratedTimetable(mappedTimetable);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setGeneratedTimetable([]);
    }
  };

  const mapSessionsToTimeSlots = (sessions: Session[], timeSlots: string[]): Session[] => {
    return timeSlots.map((slot, index) => {
      const session = sessions[index % sessions.length] || sessions[0];
      if (!session) return null;
      
      // Create a new session mapped to the selected time slot
      return {
        ...session,
        id: index + 1000, // Unique ID for timetable
        start: convertTimeSlotToDateTime(slot),
        end: convertTimeSlotToDateTime(slot, true), // Add 1 hour
        title: session.title || `Session ${index + 1}`,
        description: session.description || `Scheduled for your preferred time: ${slot}`
      };
    }).filter(Boolean) as Session[];
  };

  const convertTimeSlotToDateTime = (timeSlot: string, isEndTime = false): string => {
    const today = new Date();
    const [startTime] = timeSlot.split(' - ');
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    if (isEndTime) hours += 1; // Add 1 hour for end time
    
    today.setHours(hours, minutes || 0, 0, 0);
    return today.toISOString();
  };

  const downloadCalendar = () => {
    // Future implementation for downloading accepted timetable
    alert('Calendar download feature will be implemented soon!');
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      generateTimetable();
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAvailabilityToggle = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter(t => t !== time)
        : [...prev.availability, time]
    }));
  };

  // Removed toggleSessionSelection as we no longer need session selection

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.industry !== '';
      case 2: return formData.focus !== '';
      case 3: return formData.timePreference !== '';
      case 4: return formData.availability.length > 0;
      default: return false;
    }
  };

  if (showResults) {
    if (loading) {
      return (
        <div className="min-h-screen bg-white p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-12 fade-in-up">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <h1 className="text-4xl font-light mb-4 text-black">Generating Your Timetable</h1>
              <p className="text-gray-500 text-lg">Creating a personalized schedule for your selected times...</p>
            </div>
            
            {/* Skeleton loading cards */}
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={`minimal-card p-8 rounded-lg fade-in-up stagger-${i + 1}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="skeleton-title w-48"></div>
                        <div className="skeleton w-16 h-5"></div>
                      </div>
                      <div className="skeleton-text w-32 mb-4"></div>
                      <div className="flex items-center gap-6 mb-6">
                        <div className="skeleton w-24 h-4"></div>
                        <div className="skeleton w-20 h-4"></div>
                        <div className="skeleton w-28 h-4"></div>
                      </div>
                      <div className="skeleton-text w-full mb-2"></div>
                      <div className="skeleton-text w-3/4 mb-4"></div>
                      <div className="flex gap-3">
                        <div className="skeleton w-16 h-6 rounded-full"></div>
                        <div className="skeleton w-20 h-6 rounded-full"></div>
                        <div className="skeleton w-18 h-6 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light mb-4 text-black">
              {timetableAccepted === true ? 'Your Schedule is Confirmed!' : 
               timetableAccepted === false ? 'Generate New Schedule?' : 
               'Your Personalized Timetable'}
            </h1>
            <p className="text-gray-500 text-lg">
              {timetableAccepted === true ? 'Your timetable has been saved and is ready to use' : 
               timetableAccepted === false ? 'Let\'s create a new schedule that better fits your needs' : 
               'Based on your selected time slots and preferences'}
            </p>
          </div>
          
          {generatedTimetable.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No sessions found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="minimal-button-outline px-6 py-2 rounded"
                onClick={() => {setShowResults(false); setCurrentStep(1);}}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Different Preferences
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {generatedTimetable.map((session, index) => {
                  const { date, time } = formatDateTime(session.start);
                  const timeSlot = formData.availability[index] || `${time}`;
                  
                  return (
                    <div 
                      key={session.id} 
                      className={`minimal-card p-8 rounded-lg transition-all hover-scale fade-in-up stagger-${Math.floor(index / 2) + 1} ${
                        timetableAccepted === null ? 'hover:border-gray-300' : 
                        timetableAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-2xl font-light">{session.title}</h3>
                            {session.score && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                {Math.round(session.score * 100)}% MATCH
                              </span>
                            )}
                          </div>
                          {session.instructor && (
                            <p className="text-gray-500 mb-4">with {session.instructor}</p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {date}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {timeSlot}
                            </div>
                            {session.room && (
                              <div className="flex items-center gap-2">
                                📍 {session.room}
                              </div>
                            )}
                          </div>
                          {session.description && (
                            <p className="text-gray-600 mb-4 text-sm">{session.description}</p>
                          )}
                          {session.tags && session.tags.length > 0 && (
                            <div className="flex gap-3">
                              {session.tags.map((tag) => (
                                <span key={tag} className="text-xs px-3 py-1 border border-gray-200 rounded-full text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {timetableAccepted === true && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 success-check" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center mt-12">
                <Button 
                  variant="outline" 
                  className="minimal-button-outline px-6 py-2 rounded"
                  onClick={() => {setShowResults(false); setCurrentStep(1); setTimetableAccepted(null);}}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {timetableAccepted === false ? 'Try Again' : 'Start Over'}
                </Button>
                
                {timetableAccepted === null && (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="minimal-button-outline px-6 py-2 rounded button-press"
                      onClick={() => setTimetableAccepted(false)}
                    >
                      ✕ Refuse Schedule
                    </Button>
                    
                    <Button
                      className="minimal-button px-8 py-2 rounded button-press bg-green-600 hover:bg-green-700 border-green-600"
                      onClick={() => setTimetableAccepted(true)}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Accept Schedule
                      </div>
                    </Button>
                  </div>
                )}
                
                {timetableAccepted === true && (
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      className="minimal-button-outline px-6 py-2 rounded"
                      onClick={() => {
                        // Here you could implement calendar download
                        alert('Calendar download feature coming soon!');
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Calendar
                    </Button>
                    
                    <Button
                      className="minimal-button px-8 py-2 rounded button-press bg-green-600 hover:bg-green-700 border-green-600"
                      disabled
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 success-check" />
                        Schedule Accepted!
                      </div>
                    </Button>
                  </div>
                )}
                
                {timetableAccepted === false && (
                  <div className="text-center">
                    <Button
                      className="minimal-button px-8 py-2 rounded button-press"
                      onClick={() => {
                        setTimetableAccepted(null);
                        generateTimetable();
                      }}
                    >
                      Generate New Schedule
                    </Button>
                  </div>
                )}
              </div>
              
              {timetableAccepted === null && (
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Review your personalized timetable and choose to accept or refuse
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-4 text-black">
            Find Your Session
          </h1>
          <p className="text-gray-500 text-lg">
            Answer a few questions to get matched
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-center mb-6">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`step-indicator ${
                    i + 1 < currentStep ? 'completed' : 
                    i + 1 === currentStep ? 'active' : 'inactive'
                  }`}>
                    {i + 1 < currentStep ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`h-px w-16 mx-3 ${
                      i + 1 < currentStep ? 'bg-black' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-100 h-1 rounded-full">
              <div 
                className="h-1 bg-black rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Step 1: Industry Selection */}
          {currentStep === 1 && (
            <div className="fade-in-up">
              <h3 className="text-2xl font-light mb-8 text-center">What industry are you in?</h3>
              <div className="grid grid-cols-2 gap-4">
                {industries.map((industry, index) => {
                  const IconComponent = industry.icon;
                  return (
                    <div
                      key={industry.id}
                      className={`minimal-card p-6 cursor-pointer rounded-lg hover-scale fade-in-up stagger-${index + 1} ${
                        formData.industry === industry.id 
                          ? 'border-black bg-gray-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setFormData({...formData, industry: industry.id, focus: ''})}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <IconComponent className="w-8 h-8 text-gray-600" />
                        <h4 className="font-medium text-center">{industry.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Focus Area */}
          {currentStep === 2 && (
            <div className="fade-in-up">
              <h3 className="text-2xl font-light mb-8 text-center">What's your focus area?</h3>
              <div className="space-y-3">
                {industries.find(i => i.id === formData.industry)?.subcategories.map((sub, index) => {
                  const IconComponent = sub.icon;
                  return (
                    <div
                      key={sub.name}
                      className={`minimal-card p-4 cursor-pointer rounded-lg hover-scale fade-in-up stagger-${index + 1} ${
                        formData.focus === sub.name
                          ? 'border-black bg-gray-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setFormData({...formData, focus: sub.name})}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium">{sub.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Time Preference */}
          {currentStep === 3 && (
            <div className="fade-in-up">
              <h3 className="text-2xl font-light mb-8 text-center">When do you prefer to learn?</h3>
              <div className="space-y-3">
                {timePreferences.map((timePref, index) => {
                  const IconComponent = timePref.icon;
                  return (
                    <div
                      key={timePref.id}
                      className={`minimal-card p-4 cursor-pointer rounded-lg hover-scale fade-in-up stagger-${index + 1} ${
                        formData.timePreference === timePref.name
                          ? 'border-black bg-gray-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setFormData({...formData, timePreference: timePref.name})}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium">{timePref.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <div className="fade-in-up">
              <h3 className="text-2xl font-light mb-8 text-center">Select your available times</h3>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className={`minimal-card p-4 cursor-pointer rounded-lg hover-scale fade-in-up stagger-${Math.floor(index / 2) + 1} ${
                      formData.availability.includes(time)
                        ? 'border-black bg-gray-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleAvailabilityToggle(time)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="text-sm font-medium text-center">{time}</div>
                      {formData.availability.includes(time) && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 success-check" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {formData.availability.length > 0 && (
                <div className="mt-6 text-center fade-in-up">
                  <p className="text-sm text-gray-500">
                    {formData.availability.length} time slot{formData.availability.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 fade-in-up">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="minimal-button-outline flex items-center gap-2 px-6 py-2 rounded button-press"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`minimal-button flex items-center gap-2 px-6 py-2 rounded button-press group ${
                !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {currentStep === totalSteps ? 'Generate Timetable' : 'Next'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingForm;
