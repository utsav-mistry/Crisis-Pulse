import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWater, 
  FaMountain, 
  FaWind, 
  FaSun, 
  FaFire, 
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaChevronRight
} from 'react-icons/fa';

const DisasterCard = ({ disaster }) => {
  const navigate = useNavigate();
  
  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'low': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getDisasterIcon = (type) => {
    const iconClass = 'text-xl';
    switch(type?.toLowerCase()) {
      case 'flood': return <FaWater className={`${iconClass} text-blue-500`} />;
      case 'earthquake': return <FaMountain className={`${iconClass} text-amber-600`} />;
      case 'cyclone': return <FaWind className={`${iconClass} text-cyan-500`} />;
      case 'drought': return <FaSun className={`${iconClass} text-yellow-500`} />;
      case 'fire': return <FaFire className={`${iconClass} text-red-500`} />;
      default: return <FaExclamationTriangle className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div 
      className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={() => navigate(`/disasters/${disaster._id}`)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-50">
                  {getDisasterIcon(disaster.type)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)} in {disaster.location}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <FaClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{formatDate(disaster.date)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <FaMapMarkerAlt className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1.5" />
                <span className="text-sm text-gray-700">
                  {disaster.affectedAreas?.join(', ') || 'Multiple locations affected'}
                </span>
              </div>
              
              <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-3">
                {disaster.description}
              </p>
            </div>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(disaster.severity)} border`}>
              {disaster.severity || 'Unknown'} Severity
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {disaster.affectedAreas?.slice(0, 4).map((area, idx) => (
              <div 
                key={idx}
                className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-600 shadow-sm"
                title={area}
              >
                {area.substring(0, 2).toUpperCase()}
              </div>
            ))}
            {disaster.affectedAreas?.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500 shadow-sm">
                +{disaster.affectedAreas.length - 4}
              </div>
            )}
          </div>
          
          <button 
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/disasters/${disaster._id}`);
            }}
          >
            View details
            <FaChevronRight className="ml-1 h-3 w-3" />
          </button>
        </div>
      </div>
      
      {disaster.isActive && (
        <div className="bg-red-50 border-t border-red-100 px-5 py-2.5 text-sm font-medium text-red-700 flex items-center">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
          <span>Active Disaster - Immediate Attention Required</span>
        </div>
      )}
    </div>
  );
};

export default DisasterCard;
