
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
  Briefcase,
  TrendingUp,
  Users,
  DollarSign,
  Code,
  Target,
  Search,
  BarChart3,
  Laptop,
  Database,
  Settings,
  Calculator,
  PieChart,
  Shield,
  Sun,
  Sunset,
  Moon,
  Star,
  Award,
  BookOpen
} from 'lucide-react';

interface FormData {
  industry: string;
  focus: string;
  timePreference: string;
  sessionType: string;
  availability: string[];
}

const industries = [
  { 
    id: 'marketing', 
    name: 'Marketing', 
    icon: TrendingUp,
    subcategories: ['Digital Marketing', 'Content Strategy', 'SEO/SEM', 'Social Media'] 
  },
  { 
    id: 'sales', 
    name: 'Sales', 
    icon: Target,
    subcategories: ['B2B Sales', 'Customer Success', 'Lead Generation', 'Sales Operations'] 
  },
  { 
    id: 'tech', 
    name: 'Technology', 
    icon: Code,
    subcategories: ['Software Development', 'Product Management', 'Data Science', 'DevOps'] 
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    icon: DollarSign,
    subcategories: ['Financial Planning', 'Investment', 'Accounting', 'Risk Management'] 
  }
];

const focusIcons: { [key: string]: React.ComponentType<any> } = {
  'Digital Marketing': Search,
  'Content Strategy': BookOpen,
  'SEO/SEM': BarChart3,
  'Social Media': Users,
  'B2B Sales': Briefcase,
  'Customer Success': Award,
  'Lead Generation': Target,
  'Sales Operations': Settings,
  'Software Development': Code,
  'Product Management': Laptop,
  'Data Science': Database,
  'DevOps': Settings,
  'Financial Planning': Calculator,
  'Investment': PieChart,
  'Accounting': Calculator,
  'Risk Management': Shield
};

const timeSlots = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
];

const timePreferenceIcons = {
  'Morning (9AM - 12PM)': Sun,
  'Afternoon (12PM - 5PM)': Sunset,
  'Evening (5PM - 8PM)': Moon
};

const mockSessions = [
  {
    id: 1,
    title: 'Advanced Digital Marketing Strategies',
    instructor: 'Sarah Johnson',
    time: '10:00 AM - 11:00 AM',
    date: 'Tomorrow',
    matchScore: 95,
    tags: ['SEO', 'Content Marketing', 'Analytics']
  },
  {
    id: 2,
    title: 'Performance Marketing Masterclass',
    instructor: 'Mike Chen',
    time: '2:00 PM - 3:00 PM',
    date: 'Today',
    matchScore: 92,
    tags: ['PPC', 'Conversion Optimization', 'ROI']
  },
  {
    id: 3,
    title: 'Social Media Strategy Workshop',
    instructor: 'Emma Davis',
    time: '3:00 PM - 4:00 PM',
    date: 'Tomorrow',
    matchScore: 88,
    tags: ['Social Media', 'Brand Building', 'Engagement']
  }
];

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

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
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
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-8 h-8 text-black" />
              <h1 className="text-4xl font-light text-black">
                Your Sessions
              </h1>
              <Star className="w-8 h-8 text-black" />
            </div>
            <p className="text-gray-500 text-lg">
              Curated based on your preferences
            </p>
          </div>
          
          <div className="space-y-6">
            {mockSessions.map((session, index) => (
              <div key={session.id} className="minimal-card p-8 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <BookOpen className="w-6 h-6 text-gray-400" />
                      <h3 className="text-2xl font-light">{session.title}</h3>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {session.matchScore}% MATCH
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-500">with {session.instructor}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {session.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {session.time}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {session.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 border border-gray-200 rounded-full text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button className="minimal-button px-8 py-2 rounded">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="minimal-button-outline px-6 py-2 rounded"
              onClick={() => {setShowResults(false); setCurrentStep(1);}}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-8 h-8 text-black" />
            <h1 className="text-4xl font-light text-black">
              Find Your Session
            </h1>
          </div>
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
            <div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <Briefcase className="w-6 h-6 text-gray-400" />
                <h3 className="text-2xl font-light text-center">What industry are you in?</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {industries.map((industry) => {
                  const IconComponent = industry.icon;
                  return (
                    <div
                      key={industry.id}
                      className={`minimal-card p-6 cursor-pointer rounded-lg ${
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
            <div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <Target className="w-6 h-6 text-gray-400" />
                <h3 className="text-2xl font-light text-center">What's your focus area?</h3>
              </div>
              <div className="space-y-3">
                {industries.find(i => i.id === formData.industry)?.subcategories.map((sub) => {
                  const IconComponent = focusIcons[sub] || BookOpen;
                  return (
                    <div
                      key={sub}
                      className={`minimal-card p-4 cursor-pointer rounded-lg ${
                        formData.focus === sub
                          ? 'border-black bg-gray-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setFormData({...formData, focus: sub})}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-gray-400" />
                        <h4 className="font-medium">{sub}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Time Preference */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <Clock className="w-6 h-6 text-gray-400" />
                <h3 className="text-2xl font-light text-center">When do you prefer to learn?</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(timePreferenceIcons).map(([time, IconComponent]) => (
                  <div
                    key={time}
                    className={`minimal-card p-4 cursor-pointer rounded-lg ${
                      formData.timePreference === time
                        ? 'border-black bg-gray-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({...formData, timePreference: time})}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium">{time}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <Calendar className="w-6 h-6 text-gray-400" />
                <h3 className="text-2xl font-light text-center">Select your available times</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className={`minimal-card p-4 cursor-pointer rounded-lg ${
                      formData.availability.includes(time)
                        ? 'border-black bg-gray-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleAvailabilityToggle(time)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="text-sm font-medium text-center">{time}</div>
                    </div>
                  </div>
                ))}
              </div>
              {formData.availability.length > 0 && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {formData.availability.length} time slot{formData.availability.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="minimal-button-outline flex items-center gap-2 px-6 py-2 rounded"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="minimal-button flex items-center gap-2 px-6 py-2 rounded"
            >
              {currentStep === totalSteps ? 'Generate Schedule' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingForm;
