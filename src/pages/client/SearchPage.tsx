// src/pages/client/SearchPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, X } from 'lucide-react';

const CITIES = [
  // Baden-Württemberg
  'Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heidelberg',
  // Bavaria (Bayern)
  'Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Würzburg',
  // Berlin
  'Berlin',
  // Brandenburg
  'Potsdam', 'Cottbus',
  // Bremen
  'Bremen', 'Bremerhaven',
  // Hamburg
  'Hamburg',
  // Hesse (Hessen)
  'Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt',
  // Lower Saxony (Niedersachsen)
  'Hanover', 'Braunschweig', 'Oldenburg', 'Osnabrück',
  // Mecklenburg-Vorpommern
  'Schwerin', 'Rostock',
  // North Rhine-Westphalia (Nordrhein-Westfalen)
  'Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Bonn', 'Münster', 'Bielefeld',
  // Rhineland-Palatinate (Rheinland-Pfalz)
  'Mainz', 'Koblenz', 'Trier',
  // Saarland
  'Saarbrücken',
  // Saxony (Sachsen)
  'Dresden', 'Leipzig', 'Chemnitz',
  // Saxony-Anhalt (Sachsen-Anhalt)
  'Magdeburg', 'Halle',
  // Schleswig-Holstein
  'Kiel', 'Lübeck',
  // Thuringia (Thüringen)
  'Erfurt', 'Jena', 'Weimar',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Filter cities based on search term
  const filteredCities = CITIES.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8); // Show max 8 suggestions

  const handleCitySelect = (city: string) => {
    setLocation(city);
    setSearchTerm(city);
    setShowSuggestions(false);
  };

  const handleClearLocation = () => {
    setLocation('');
    setSearchTerm('');
  };

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
    <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/client/home')}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-purple-900">Find Care</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Location Search with Autocomplete */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <label className="block mb-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-lavender-400" />
              <span className="font-semibold text-purple-900">Location</span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  // Clear selected location if user modifies the text
                  if (e.target.value !== location) {
                    setLocation('');
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Type a city name..."
                className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:outline-none transition-colors ${
                  location 
                    ? 'border-purple-800 text-purple-900 font-medium' 
                    : 'border-gray-200 focus:border-lavender-300'
                }`}
              />
              
              {/* Clear button */}
              {searchTerm && (
                <button
                  onClick={handleClearLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && searchTerm && filteredCities.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-3 text-left hover:bg-lavender-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-lavender-400" />
                        <span className="text-purple-900">{city}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSuggestions && searchTerm && filteredCities.length === 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4">
                  <p className="text-sm text-purple-500">No cities found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Service Type Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-purple-900 mb-4">
            What type of care do you need?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map((service) => (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedServices.includes(service)
                    ? 'border-lavender-300 bg-lavender-200 shadow-soft'
                    : 'border-gray-200 bg-lavender-50 hover:bg-lavender-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-900">{service}</span>
                  {selectedServices.includes(service) && (
                    <div className="w-6 h-6 bg-purple-800 rounded-full flex items-center justify-center">
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
          className="w-full bg-purple-800 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Search Agencies
        </button>

        {!location && (
          <p className="text-center text-sm text-purple-500 mt-4">
            Please select a location to search
          </p>
        )}
      </main>
    </div>
  );
}