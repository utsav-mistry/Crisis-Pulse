import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Shield, 
    AlertTriangle, 
    Phone, 
    MapPin, 
    Clock, 
    Heart,
    Zap,
    Droplets,
    Wind,
    Thermometer,
    Mountain,
    Waves,
    Sun
} from 'lucide-react';
import toast from 'react-hot-toast';

const SafetyCenter = () => {
    const { user } = useAuth();
    const [selectedDisaster, setSelectedDisaster] = useState('flood');
    const [aiAdvice, setAiAdvice] = useState('');
    const [loading, setLoading] = useState(false);

    const disasterTypes = [
        { id: 'flood', name: 'Flood', icon: Droplets, color: 'text-blue-600' },
        { id: 'earthquake', name: 'Earthquake', icon: Mountain, color: 'text-orange-600' },
        { id: 'cyclone', name: 'Cyclone', icon: Wind, color: 'text-purple-600' },
        { id: 'drought', name: 'Drought', icon: Sun, color: 'text-yellow-600' },
        { id: 'wildfire', name: 'Wildfire', icon: Zap, color: 'text-red-600' },
        { id: 'landslide', name: 'Landslide', icon: Mountain, color: 'text-brown-600' },
        { id: 'tsunami', name: 'Tsunami', icon: Waves, color: 'text-teal-600' },
        { id: 'heatwave', name: 'Heatwave', icon: Thermometer, color: 'text-red-500' }
    ];

    const emergencyContacts = [
        { name: 'National Emergency', number: '112', description: 'All emergencies' },
        { name: 'Fire Service', number: '101', description: 'Fire emergencies' },
        { name: 'Police', number: '100', description: 'Police assistance' },
        { name: 'Ambulance', number: '108', description: 'Medical emergencies' },
        { name: 'Disaster Management', number: '1070', description: 'Disaster response' },
        { name: 'Women Helpline', number: '1091', description: 'Women safety' }
    ];

    const safetyTips = {
        flood: {
            before: [
                'Keep emergency supplies ready (water, food, flashlight, radio)',
                'Know your evacuation routes and shelter locations',
                'Move valuable items to higher floors',
                'Stay informed about weather conditions'
            ],
            during: [
                'Move to higher ground immediately',
                'Avoid walking or driving through floodwater',
                'Stay away from electrical equipment if wet',
                'Listen to emergency broadcasts for updates'
            ],
            after: [
                'Wait for authorities to declare area safe',
                'Avoid floodwater - it may be contaminated',
                'Check for structural damage before entering buildings',
                'Document damage for insurance claims'
            ]
        },
        earthquake: {
            before: [
                'Secure heavy furniture and appliances',
                'Identify safe spots in each room (under sturdy tables)',
                'Keep emergency kit accessible',
                'Practice drop, cover, and hold on drills'
            ],
            during: [
                'Drop, cover, and hold on immediately',
                'Stay where you are - do not run outside',
                'If outdoors, move away from buildings and power lines',
                'If in a vehicle, pull over and stay inside'
            ],
            after: [
                'Check for injuries and provide first aid',
                'Inspect home for damage',
                'Be prepared for aftershocks',
                'Stay out of damaged buildings'
            ]
        },
        cyclone: {
            before: [
                'Stock up on emergency supplies for several days',
                'Secure or bring in outdoor furniture',
                'Board up windows with plywood',
                'Fill bathtubs and containers with water'
            ],
            during: [
                'Stay indoors and away from windows',
                'Go to the strongest part of your building',
                'Listen to weather updates on battery radio',
                'Do not go outside during the eye of the storm'
            ],
            after: [
                'Wait for official all-clear before going outside',
                'Watch for fallen power lines and debris',
                'Use generators outside only',
                'Report damage to authorities'
            ]
        }
    };

    const generateAIAdvice = async (disasterType) => {
        setLoading(true);
        try {
            // Simulate AI advice generation
            const adviceTemplates = {
                flood: "Based on current weather patterns and your location, here's personalized flood safety advice: Monitor local water levels, prepare evacuation routes, and keep emergency supplies ready. If flooding occurs, remember that just 6 inches of moving water can knock you down.",
                earthquake: "Earthquake preparedness for your area: Secure heavy objects, identify safe spots in each room, and practice drop-cover-hold drills. Remember, most injuries occur from falling objects, not the earthquake itself.",
                cyclone: "Cyclone safety guidance: Track storm progress, secure outdoor items, and prepare for extended power outages. The eye of the storm brings temporary calm - do not go outside during this period.",
                drought: "Drought management advice: Implement water conservation measures, monitor vulnerable community members, and prepare for potential water restrictions. Focus on essential water usage only.",
                wildfire: "Wildfire safety recommendations: Create defensible space around your property, prepare evacuation plans, and monitor air quality. Have multiple evacuation routes planned as fires can change direction quickly.",
                landslide: "Landslide prevention guidance: Watch for warning signs like tilting trees, new cracks in ground, or unusual water flow. Avoid steep slopes during heavy rainfall periods.",
                tsunami: "Tsunami safety protocol: If you feel strong earthquake shaking or see ocean receding, move to higher ground immediately. Do not wait for official warnings - natural signs are your first alert.",
                heatwave: "Heatwave protection measures: Stay hydrated, avoid outdoor activities during peak hours, and check on vulnerable community members. Use cooling centers if air conditioning is unavailable."
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setAiAdvice(adviceTemplates[disasterType] || "Stay alert and follow official emergency instructions.");
        } catch (error) {
            toast.error('Failed to generate AI advice');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateAIAdvice(selectedDisaster);
    }, [selectedDisaster]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Shield className="w-6 h-6 mr-2 text-safety-600" />
                        Safety Center
                    </h1>
                    <p className="text-neutral-600">
                        AI-powered safety advice and emergency resources
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-neutral-500">
                    <Clock className="w-4 h-4" />
                    <span>Updated in real-time</span>
                </div>
            </div>

            {/* Emergency Contacts */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-emergency-600" />
                        Emergency Contacts
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {emergencyContacts.map((contact, index) => (
                            <div key={index} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-neutral-900">{contact.name}</h4>
                                        <p className="text-sm text-neutral-600">{contact.description}</p>
                                    </div>
                                    <a 
                                        href={`tel:${contact.number}`}
                                        className="text-xl font-bold text-emergency-600 hover:text-emergency-700"
                                    >
                                        {contact.number}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Disaster Type Selection */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">
                        Select Disaster Type for Safety Advice
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {disasterTypes.map((disaster) => {
                            const Icon = disaster.icon;
                            return (
                                <button
                                    key={disaster.id}
                                    onClick={() => setSelectedDisaster(disaster.id)}
                                    className={`p-4 border rounded-lg transition-all ${
                                        selectedDisaster === disaster.id
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                                    }`}
                                >
                                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                                        selectedDisaster === disaster.id ? 'text-primary-600' : disaster.color
                                    }`} />
                                    <span className="text-sm font-medium">{disaster.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* AI-Generated Advice */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-primary-600" />
                        AI-Generated Safety Advice
                        <span className="ml-2 text-sm font-normal text-neutral-500">
                            for {disasterTypes.find(d => d.id === selectedDisaster)?.name}
                        </span>
                    </h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-neutral-600">Generating personalized advice...</span>
                        </div>
                    ) : (
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                            <p className="text-primary-800">{aiAdvice}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Safety Tips */}
            {safetyTips[selectedDisaster] && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="font-semibold text-neutral-900 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                Before
                            </h4>
                        </div>
                        <div className="card-body">
                            <ul className="space-y-2">
                                {safetyTips[selectedDisaster].before.map((tip, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span className="text-sm text-neutral-700">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h4 className="font-semibold text-neutral-900 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-warning-600" />
                                During
                            </h4>
                        </div>
                        <div className="card-body">
                            <ul className="space-y-2">
                                {safetyTips[selectedDisaster].during.map((tip, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="w-2 h-2 bg-warning-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span className="text-sm text-neutral-700">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h4 className="font-semibold text-neutral-900 flex items-center">
                                <Heart className="w-4 h-4 mr-2 text-safety-600" />
                                After
                            </h4>
                        </div>
                        <div className="card-body">
                            <ul className="space-y-2">
                                {safetyTips[selectedDisaster].after.map((tip, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="w-2 h-2 bg-safety-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span className="text-sm text-neutral-700">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Location-based Resources */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                        Local Resources
                        {user?.location?.city && (
                            <span className="ml-2 text-sm font-normal text-neutral-500">
                                in {user.location.city}
                            </span>
                        )}
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-neutral-200 rounded-lg">
                            <h4 className="font-medium text-neutral-900 mb-2">Nearest Shelter</h4>
                            <p className="text-sm text-neutral-600">Community Center - 2.3 km away</p>
                            <p className="text-xs text-neutral-500 mt-1">Capacity: 500 people</p>
                        </div>
                        <div className="p-4 border border-neutral-200 rounded-lg">
                            <h4 className="font-medium text-neutral-900 mb-2">Medical Facilities</h4>
                            <p className="text-sm text-neutral-600">City Hospital - 1.8 km away</p>
                            <p className="text-xs text-neutral-500 mt-1">24/7 Emergency Services</p>
                        </div>
                        <div className="p-4 border border-neutral-200 rounded-lg">
                            <h4 className="font-medium text-neutral-900 mb-2">Relief Centers</h4>
                            <p className="text-sm text-neutral-600">District Collector Office</p>
                            <p className="text-xs text-neutral-500 mt-1">Food & Water Distribution</p>
                        </div>
                        <div className="p-4 border border-neutral-200 rounded-lg">
                            <h4 className="font-medium text-neutral-900 mb-2">Evacuation Routes</h4>
                            <p className="text-sm text-neutral-600">Highway 101 North</p>
                            <p className="text-xs text-neutral-500 mt-1">Primary evacuation route</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyCenter;
