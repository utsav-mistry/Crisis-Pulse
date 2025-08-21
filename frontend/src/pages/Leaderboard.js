import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Trophy, 
    Medal, 
    Star, 
    TrendingUp, 
    Heart,
    Shield,
    Users,
    Activity,
    Award,
    Target,
    MapPin
} from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [timeFilter, setTimeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    // Fetch real leaderboard data
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/points/leaderboard', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Ensure data is an array
                    const leaderboardArray = Array.isArray(data) ? data : (data.leaderboard || []);
                    
                    if (leaderboardArray.length > 0) {
                        const formattedData = leaderboardArray.map(item => {
                            // Format location safely (handles string or {city, state} object)
                            const formatLocation = (loc) => {
                                if (!loc) return 'Unknown';
                                if (typeof loc === 'string') return loc;
                                return [loc.city, loc.state].filter(Boolean).join(', ') || 'Unknown';
                            };
                            
                            return {
                                ...item,
                                id: item._id || item.userId || item.id,
                                name: item.name || item.user?.name || 'Unknown User',
                                role: item.role || item.user?.role || 'user',
                                location: formatLocation(item.location || item.user?.location),
                                level: getLevel(item.points || 0),
                                badges: item.achievements || [],
                                points: item.points || 0,
                                contributions: item.contributions || 0,
                                helpLogs: item.helpLogs || 0
                            };
                        });
                        setLeaderboardData(formattedData);

                        // Find user rank
                        if (user) {
                            const userIndex = leaderboardArray.findIndex(u => u.userId === user._id || u._id === user._id);
                            setUserRank(userIndex >= 0 ? userIndex + 1 : null);
                        }
                    } else {
                        // No data available
                        setLeaderboardData([]);
                    }
                } else {
                    console.error('Failed to fetch leaderboard:', response.status);
                    setLeaderboardData([]);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setLeaderboardData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user]);

    const getLevel = (points) => {
        if (points >= 2000) return 'Expert';
        if (points >= 1000) return 'Advanced';
        if (points >= 500) return 'Intermediate';
        return 'Beginner';
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Award className="w-6 h-6 text-orange-500" />;
            default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-neutral-600">#{rank}</span>;
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'Expert': return 'text-purple-700 bg-purple-100 border-purple-200';
            case 'Advanced': return 'text-blue-700 bg-blue-100 border-blue-200';
            case 'Intermediate': return 'text-green-700 bg-green-100 border-green-200';
            case 'Beginner': return 'text-gray-700 bg-gray-100 border-gray-200';
            default: return 'text-neutral-700 bg-neutral-100 border-neutral-200';
        }
    };

    const achievements = [
        {
            name: 'First Responder',
            description: 'Responded to 10+ emergency situations',
            icon: Shield,
            color: 'text-red-600',
            earned: true
        },
        {
            name: 'Community Hero',
            description: 'Made 25+ contributions',
            icon: Heart,
            color: 'text-pink-600',
            earned: user?.points > 500
        },
        {
            name: 'Team Leader',
            description: 'Led 5+ volunteer operations',
            icon: Users,
            color: 'text-blue-600',
            earned: false
        },
        {
            name: 'Expert Helper',
            description: 'Reached 1000+ points',
            icon: Star,
            color: 'text-yellow-600',
            earned: user?.points > 1000
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                        Leaderboard
                    </h1>
                    <p className="text-neutral-600">
                        Top contributors and volunteers making a difference
                    </p>
                </div>
                <div className="flex space-x-2">
                    <select 
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="week">This Week</option>
                    </select>
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    >
                        <option value="all">All Categories</option>
                        <option value="contributions">Contributions</option>
                        <option value="helpLogs">Help Logs</option>
                    </select>
                </div>
            </div>

            {/* Your Rank Card */}
            <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                                {getRankIcon(userRank)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">Your Current Rank</h3>
                                <p className="text-sm text-neutral-600">
                                    #{userRank} out of {leaderboardData.length} volunteers
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary-600">
                                {user?.points || 0}
                            </div>
                            <p className="text-sm text-neutral-600">Total Points</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">Top Contributors</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {leaderboardData.slice(0, 3).map((volunteer, index) => (
                            <div key={volunteer.id} className={`text-center p-6 rounded-lg border-2 ${
                                index === 0 ? 'border-yellow-200 bg-yellow-50' :
                                index === 1 ? 'border-gray-200 bg-gray-50' :
                                'border-orange-200 bg-orange-50'
                            }`}>
                                <div className="flex justify-center mb-4">
                                    {getRankIcon(index + 1)}
                                </div>
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-lg font-bold text-primary-600">
                                        {volunteer.name.charAt(0)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-neutral-900 mb-1">{volunteer.name}</h4>
                                <div className="flex items-center justify-center text-sm text-neutral-600 mb-2">
                                    <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                    <span className="truncate">{volunteer.location}</span>
                                </div>
                                <div className="text-xl font-bold text-primary-600 mb-2">
                                    {volunteer.points.toLocaleString()}
                                </div>
                                <span className={`badge ${getLevelColor(volunteer.level)}`}>
                                    {volunteer.level}
                                </span>
                                <div className="mt-3 flex justify-center space-x-4 text-xs text-neutral-500">
                                    <span>{volunteer.contributions} contributions</span>
                                    <span>{volunteer.helpLogs} help logs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Leaderboard */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">Full Rankings</h3>
                </div>
                <div className="card-body">
                    <div className="space-y-3">
                        {leaderboardData.map((volunteer, index) => (
                            <div key={volunteer.id} className={`p-4 rounded-lg border transition-colors ${
                                (volunteer.id === user?._id || volunteer.userId === user?._id)
                                    ? 'border-primary-200 bg-primary-50' 
                                    : 'border-neutral-200 hover:bg-neutral-50'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-10 h-10">
                                            {getRankIcon(index + 1)}
                                        </div>
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="font-bold text-primary-600">
                                                {volunteer.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-neutral-900">
                                                {volunteer.name}
                                                {(volunteer.id === user?._id || volunteer.userId === user?._id) && (
                                                    <span className="ml-2 text-sm text-primary-600">(You)</span>
                                                )}
                                            </h4>
                                            <div className="flex items-center text-sm text-neutral-600">
                                                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                <span className="truncate">{volunteer.location}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {volunteer.badges.slice(0, 2).map((badge, badgeIndex) => (
                                                    <span key={badgeIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-neutral-900">
                                            {volunteer.points.toLocaleString()}
                                        </div>
                                        <span className={`badge ${getLevelColor(volunteer.level)}`}>
                                            {volunteer.level}
                                        </span>
                                        <div className="mt-1 flex space-x-3 text-xs text-neutral-500">
                                            <span>{volunteer.contributions} contributions</span>
                                            <span>{volunteer.helpLogs} help logs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-yellow-600" />
                        Achievements
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement, index) => {
                            const Icon = achievement.icon;
                            return (
                                <div key={index} className={`p-4 rounded-lg border ${
                                    achievement.earned 
                                        ? 'border-green-200 bg-green-50' 
                                        : 'border-neutral-200 bg-neutral-50'
                                }`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            achievement.earned ? 'bg-green-100' : 'bg-neutral-100'
                                        }`}>
                                            <Icon className={`w-5 h-5 ${
                                                achievement.earned ? achievement.color : 'text-neutral-400'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-medium ${
                                                achievement.earned ? 'text-green-900' : 'text-neutral-600'
                                            }`}>
                                                {achievement.name}
                                                {achievement.earned && (
                                                    <span className="ml-2 text-green-600">✓</span>
                                                )}
                                            </h4>
                                            <p className={`text-sm ${
                                                achievement.earned ? 'text-green-700' : 'text-neutral-500'
                                            }`}>
                                                {achievement.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Points Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="card-body text-center">
                        <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">15</div>
                        <p className="text-sm text-neutral-600">Contributions Made</p>
                        <p className="text-xs text-neutral-500 mt-1">+10 points each</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">4</div>
                        <p className="text-sm text-neutral-600">Help Logs</p>
                        <p className="text-xs text-neutral-500 mt-1">+25 points each</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body text-center">
                        <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-900">92%</div>
                        <p className="text-sm text-neutral-600">Success Rate</p>
                        <p className="text-xs text-neutral-500 mt-1">Bonus multiplier</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
