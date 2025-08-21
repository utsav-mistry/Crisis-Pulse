import React, { useState } from 'react';

const VolunteerTaskCard = ({ task, onClaim, isClaimed, onSubmit }) => {
    const [proof, setProof] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(task._id, proof);
    };

    // Format location safely (handles string or {city, state} object)
    const locationText = typeof task?.disaster?.location === 'string'
        ? task.disaster.location
        : task?.disaster?.location
            ? [task.disaster.location.city, task.disaster.location.state].filter(Boolean).join(', ')
            : 'Unknown';

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-bold">{task.disaster.title}</h3>
            <p><strong>Type:</strong> {task.disaster.type}</p>
            <p><strong>Location:</strong> {locationText}</p>
            <p><strong>Severity:</strong> {task.disaster.severity}</p>
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm ${task.status === 'open' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{task.status}</span></p>
            {task.deadline && <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleString()}</p>}

            {!isClaimed && task.status === 'open' && (
                <button 
                    onClick={() => onClaim(task._id)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Claim Task
                </button>
            )}

            {isClaimed && task.status === 'claimed' && (
                <form onSubmit={handleSubmit} className="mt-4">
                    <textarea 
                        value={proof}
                        onChange={(e) => setProof(e.target.value)}
                        placeholder="Enter proof of your work..."
                        className="w-full p-2 border rounded"
                        required
                    />
                    <button type="submit" className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Submit Proof
                    </button>
                </form>
            )}
        </div>
    );
};

export default VolunteerTaskCard;
