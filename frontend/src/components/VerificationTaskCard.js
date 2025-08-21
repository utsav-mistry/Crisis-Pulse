import React, { useState } from 'react';

const VerificationTaskCard = ({ task, onVerify }) => {
    const [feedback, setFeedback] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);

    const handleVerification = (approved) => {
        if (!approved && !feedback) {
            alert('Feedback is required for rejecting a submission.');
            return;
        }
        onVerify(task._id, approved, feedback);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-bold">{task.disaster.title}</h3>
            <p><strong>Volunteer:</strong> {task.volunteer.name} ({task.volunteer.email})</p>
            <p><strong>Proof of Work:</strong></p>
            <p className="bg-gray-100 p-2 rounded mt-1">{task.proof}</p>
            
            {showFeedback && (
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the volunteer..."
                    className="w-full p-2 border rounded mt-4"
                />
            )}

            <div className="mt-4 space-x-2">
                <button 
                    onClick={() => handleVerification(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Approve
                </button>
                <button 
                    onClick={() => {
                        if (showFeedback) {
                            handleVerification(false);
                        } else {
                            setShowFeedback(true);
                        }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    {showFeedback ? 'Confirm Rejection' : 'Reject'}
                </button>
                {showFeedback && (
                    <button 
                        onClick={() => setShowFeedback(false)}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerificationTaskCard;
