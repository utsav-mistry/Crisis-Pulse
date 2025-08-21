import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VerificationTaskCard from '../../components/VerificationTaskCard';

const AdminVolunteerVerification = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasksForVerification();
    }, []);

    const fetchTasksForVerification = async () => {
        try {
            const res = await axios.get('/api/volunteer-tasks/admin', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks for verification', error);
        }
    };

    const handleVerifyTask = async (taskId, approved, adminFeedback) => {
        try {
            await axios.post(`/api/volunteer-tasks/admin/${taskId}/verify`, { approved, adminFeedback }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchTasksForVerification(); // Refresh the list after verification
        } catch (error) {
            console.error('Error verifying task', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Volunteer Submission Verification</h1>
            <div className="space-y-4">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <VerificationTaskCard 
                            key={task._id} 
                            task={task} 
                            onVerify={handleVerifyTask} 
                        />
                    ))
                ) : (
                    <p>No tasks are currently awaiting verification.</p>
                )}
            </div>
        </div>
    );
};

export default AdminVolunteerVerification;
