import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin } from 'lucide-react';

const CITIES = [
  'Berlin',
  'Hamburg',
  'Munich',
  'Cologne',
  'Frankfurt',
  'Düsseldorf',
  'Bonn',
  'Potsdam',
];

const SERVICES = [
  'Elderly care',
  'Household help',
  'Companionship',
  'Disability support',
  'Post-hospital care',
  'Overnight supervision',
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (selectedServices.length > 0)
      params.set('services', selectedServices.join(','));

    navigate(`/client/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/client/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Find Care</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Location Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <label className="block mb-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span className="font-semibold text-gray-900">Location</span>
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none"
            >
              <option value="">Select a city...</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Service Type Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            What type of care do you need?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map((service) => (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedServices.includes(service)
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{service}</span>
                  {selectedServices.includes(service) && (
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!location}
          className="w-full bg-teal-600 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Search Agencies
        </button>

        {!location && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Please select a location to search
          </p>
        )}
      </main>
    </div>
  );
}