import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, ArrowRight, CheckCircle, Building2, DollarSign, Calendar, Languages } from 'lucide-react';

const SERVICES = [
  'Elderly care',
  'Household help',
  'Companionship',
  'Disability support',
  'Post-hospital care',
  'Overnight supervision',
];

const LANGUAGES = ['German', 'English', 'Turkish', 'Arabic', 'Polish', 'Russian'];

const CITIES = ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Düsseldorf', 'Bonn', 'Potsdam'];

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    agency_name: '',
    description: '',
    location: '',
    service_areas: [] as string[],
    languages: [] as string[],
    services_offered: [] as string[],
    years_experience: '',
  });

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.agency_name || !formData.description || !formData.location) {
        setError('Please fill in all fields');
        return;
      }
    }
    if (step === 2) {
      if (formData.services_offered.length === 0) {
        setError('Please select at least one service');
        return;
      }
    }
    if (step === 3) {
      if (formData.service_areas.length === 0) {
        setError('Please select at least one service area');
        return;
      }
    }
    if (step === 4) {
      if (formData.languages.length === 0) {
        setError('Please select at least one language');
        return;
      }
    }

    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.includes(service)
        ? prev.services_offered.filter(s => s !== service)
        : [...prev.services_offered, service],
    }));
  };

  const toggleArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.includes(area)
        ? prev.service_areas.filter(a => a !== area)
        : [...prev.service_areas, area],
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      setError('');

      // Create default price ranges
      const price_ranges: Record<string, { min: number; max: number }> = {};
      formData.services_offered.forEach(service => {
        price_ranges[service] = { min: 15, max: 35 };
      });

      // Create default availability (Monday-Friday, 9AM-5PM)
      const availability = {
        monday: ['9:00-17:00'],
        tuesday: ['9:00-17:00'],
        wednesday: ['9:00-17:00'],
        thursday: ['9:00-17:00'],
        friday: ['9:00-17:00'],
        saturday: [],
        sunday: [],
      };

      const { error: insertError } = await supabase.from('providers').insert({
        user_id: user.id,
        agency_name: formData.agency_name,
        description: formData.description,
        location: formData.location,
        service_areas: formData.service_areas,
        languages: formData.languages,
        services_offered: formData.services_offered,
        price_ranges: price_ranges,
        availability: availability,
        verification_status: 'pending',
        years_experience: parseInt(formData.years_experience) || 0,
        completed_bookings: 0,
        response_time: 'Within 24 hours',
      });

      if (insertError) throw insertError;

      // Success! Navigate to dashboard
      navigate('/provider/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error creating provider profile:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Provider Setup</h1>
            <div className="text-sm text-gray-600">
              Step {step} of 5
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Agency Information</h2>
                  <p className="text-gray-600">Tell us about your care agency</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                    placeholder="e.g., Berlin Care Services"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your agency and what makes you special..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Main Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none"
                  >
                    <option value="">Select a city...</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Years of Experience (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                    placeholder="e.g., 5"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Services Offered</h2>
                  <p className="text-gray-600">What services do you provide?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES.map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.services_offered.includes(service)
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{service}</span>
                      {formData.services_offered.includes(service) && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Service Areas */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Service Areas</h2>
                  <p className="text-gray-600">Where do you provide services?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CITIES.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.service_areas.includes(area)
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{area}</span>
                      {formData.service_areas.includes(area) && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Languages */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Languages className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Languages</h2>
                  <p className="text-gray-600">What languages do you speak?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LANGUAGES.map((language) => (
                  <button
                    key={language}
                    onClick={() => toggleLanguage(language)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.languages.includes(language)
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{language}</span>
                      {formData.languages.includes(language) && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                  <p className="text-gray-600">Make sure everything looks good</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Agency Name</p>
                  <p className="font-semibold text-gray-900">{formData.agency_name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{formData.location}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.services_offered.map(service => (
                      <span key={service} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Service Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.service_areas.map(area => (
                      <span key={area} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Languages</p>
                  <p className="font-semibold text-gray-900">{formData.languages.join(', ')}</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your profile will be set to "pending verification". 
                    Default pricing (€15-35/hr) and availability (Mon-Fri, 9AM-5PM) have been set. 
                    You can update these later in your profile settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-all"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}