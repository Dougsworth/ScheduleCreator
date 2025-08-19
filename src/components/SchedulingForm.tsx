
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Users, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

interface FormData {
  industry: string;
  focus: string;
  timePreference: string;
  sessionType: string;
  availability: string[];
}

const industries = [
  { id: 'marketing', name: 'Marketing', subcategories: ['Digital Marketing', 'Content Strategy', 'SEO/SEM', 'Social Media'] },
  { id: 'sales', name: 'Sales', subcategories: ['B2B Sales', 'Customer Success', 'Lead Generation', 'Sales Operations'] },
  { id: 'tech', name: 'Technology', subcategories: ['Software Development', 'Product Management', 'Data Science', 'DevOps'] },
  { id: 'finance', name: 'Finance', subcategories: ['Financial Planning', 'Investment', 'Accounting', 'Risk Management'] }
];

const timeSlots = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
];

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
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="w-full max-w-4xl glass-card animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              Your Personalized Schedule
            </CardTitle>
            <p className="text-muted-foreground">
              Based on your preferences, here are the best matching sessions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {mockSessions.map((session, index) => (
              <Card key={session.id} className="border border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{session.title}</h3>
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          {session.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">with {session.instructor}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {session.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="gradient-primary">
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="text-center pt-6">
              <Button variant="outline" onClick={() => {setShowResults(false); setCurrentStep(1);}}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl glass-card animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Find Your Perfect Session</CardTitle>
          <p className="text-muted-foreground">
            Answer a few questions to get matched with the best sessions for you
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
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
                    <div className={`h-px w-full mx-2 ${
                      i + 1 < currentStep ? 'bg-success' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Industry Selection */}
          {currentStep === 1 && (
            <div className="animate-slide-in">
              <h3 className="text-lg font-semibold mb-4">What industry are you in?</h3>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((industry) => (
                  <Card 
                    key={industry.id}
                    className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                      formData.industry === industry.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({...formData, industry: industry.id, focus: ''})}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium">{industry.name}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Focus Area */}
          {currentStep === 2 && (
            <div className="animate-slide-in">
              <h3 className="text-lg font-semibold mb-4">What's your focus area?</h3>
              <div className="space-y-3">
                {industries.find(i => i.id === formData.industry)?.subcategories.map((sub) => (
                  <Card
                    key={sub}
                    className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                      formData.focus === sub
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({...formData, focus: sub})}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium">{sub}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Time Preference */}
          {currentStep === 3 && (
            <div className="animate-slide-in">
              <h3 className="text-lg font-semibold mb-4">When do you prefer to learn?</h3>
              <div className="space-y-3">
                {['Morning (9AM - 12PM)', 'Afternoon (12PM - 5PM)', 'Evening (5PM - 8PM)'].map((time) => (
                  <Card
                    key={time}
                    className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                      formData.timePreference === time
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({...formData, timePreference: time})}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">{time}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <div className="animate-slide-in">
              <h3 className="text-lg font-semibold mb-4">Select your available times</h3>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => (
                  <Card
                    key={time}
                    className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                      formData.availability.includes(time)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAvailabilityToggle(time)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-sm font-medium">{time}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {formData.availability.length > 0 && (
                <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success font-medium">
                    {formData.availability.length} time slot{formData.availability.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 gradient-primary"
            >
              {currentStep === totalSteps ? 'Find Sessions' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulingForm;
