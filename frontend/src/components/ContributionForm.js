import React, { useState } from 'react';
import { 
    Package, 
    Heart, 
    Plus, 
    Minus, 
    MapPin, 
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ContributionForm = ({ disaster, onSubmit, onCancel }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        contributorName: user?.name || '',
        contributorEmail: user?.email || '',
        contributorPhone: '',
        items: [
            { name: 'Food Packets', quantity: 0, unit: 'packets' },
            { name: 'Water Bottles', quantity: 0, unit: 'bottles' },
            { name: 'Blankets', quantity: 0, unit: 'pieces' },
            { name: 'Medicines', quantity: 0, unit: 'boxes' },
            { name: 'Clothes', quantity: 0, unit: 'sets' }
        ],
        customItems: [],
        deliveryMethod: 'drop-off',
        deliveryAddress: '',
        deliveryDate: '',
        deliveryTime: '',
        notes: '',
        isAnonymous: false
    });

    const [newCustomItem, setNewCustomItem] = useState({ name: '', quantity: 0, unit: 'pieces' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemQuantityChange = (index, quantity) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, quantity: Math.max(0, quantity) } : item
            )
        }));
    };

    const addCustomItem = () => {
        if (newCustomItem.name.trim() && newCustomItem.quantity > 0) {
            setFormData(prev => ({
                ...prev,
                customItems: [...prev.customItems, { ...newCustomItem, id: Date.now() }]
            }));
            setNewCustomItem({ name: '', quantity: 0, unit: 'pieces' });
        }
    };

    const removeCustomItem = (id) => {
        setFormData(prev => ({
            ...prev,
            customItems: prev.customItems.filter(item => item.id !== id)
        }));
    };

    const getTotalItems = () => {
        const standardItems = formData.items.reduce((sum, item) => sum + item.quantity, 0);
        const customItems = formData.customItems.reduce((sum, item) => sum + item.quantity, 0);
        return standardItems + customItems;
    };

    const getEstimatedPoints = () => {
        return getTotalItems() * 2; // 2 points per item contributed
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const totalItems = getTotalItems();
        if (totalItems === 0) {
            toast.error('Please add at least one item to contribute');
            return;
        }

        if (!formData.contributorName.trim()) {
            toast.error('Please enter your name');
            return;
        }

        if (formData.deliveryMethod === 'pickup' && !formData.deliveryAddress.trim()) {
            toast.error('Please enter pickup address');
            return;
        }

        setIsSubmitting(true);

        try {
            const contributionData = {
                disasterId: disaster._id,
                contributorName: formData.isAnonymous ? 'Anonymous' : formData.contributorName,
                contributorEmail: formData.isAnonymous ? '' : formData.contributorEmail,
                contributorPhone: formData.isAnonymous ? '' : formData.contributorPhone,
                items: [
                    ...formData.items.filter(item => item.quantity > 0),
                    ...formData.customItems
                ],
                deliveryMethod: formData.deliveryMethod,
                deliveryAddress: formData.deliveryAddress,
                deliveryDate: formData.deliveryDate,
                deliveryTime: formData.deliveryTime,
                notes: formData.notes,
                totalItems,
                estimatedPoints: getEstimatedPoints(),
                isAnonymous: formData.isAnonymous
            };

            await onSubmit(contributionData);
            toast.success(`Thank you for your contribution! You'll earn ${getEstimatedPoints()} points.`);
        } catch (error) {
            toast.error('Failed to submit contribution. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <div className="card-header">
                    <div className="flex items-center space-x-3">
                        <Heart className="w-6 h-6 text-primary-600" />
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">
                                Contribute to {disaster.type} Relief
                            </h2>
                            <p className="text-sm text-neutral-600 flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {disaster.location?.city}, {disaster.location?.state}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card-body space-y-6">
                    {/* Contributor Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-900 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Contributor Information
                        </h3>
                        
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={formData.isAnonymous}
                                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                                className="rounded border-neutral-300"
                            />
                            <label htmlFor="anonymous" className="text-sm text-neutral-600">
                                Contribute anonymously
                            </label>
                        </div>

                        {!formData.isAnonymous && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contributorName}
                                        onChange={(e) => handleInputChange('contributorName', e.target.value)}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.contributorPhone}
                                        onChange={(e) => handleInputChange('contributorPhone', e.target.value)}
                                        className="input"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.contributorEmail}
                                        onChange={(e) => handleInputChange('contributorEmail', e.target.value)}
                                        className="input"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Items to Contribute */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-900 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Items to Contribute
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-neutral-900">{item.name}</span>
                                        <span className="text-sm text-neutral-500">({item.unit})</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                                            className="p-1 rounded border border-neutral-300 hover:bg-neutral-50"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.quantity}
                                            onChange={(e) => handleItemQuantityChange(index, parseInt(e.target.value) || 0)}
                                            className="w-20 text-center input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                                            className="p-1 rounded border border-neutral-300 hover:bg-neutral-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Custom Items */}
                        <div className="border-t border-neutral-200 pt-4">
                            <h4 className="font-medium text-neutral-900 mb-3">Add Custom Items</h4>
                            <div className="flex space-x-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Item name"
                                    value={newCustomItem.name}
                                    onChange={(e) => setNewCustomItem(prev => ({ ...prev, name: e.target.value }))}
                                    className="input flex-1"
                                />
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    min="1"
                                    value={newCustomItem.quantity}
                                    onChange={(e) => setNewCustomItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                    className="input w-20"
                                />
                                <select
                                    value={newCustomItem.unit}
                                    onChange={(e) => setNewCustomItem(prev => ({ ...prev, unit: e.target.value }))}
                                    className="input w-24"
                                >
                                    <option value="pieces">pieces</option>
                                    <option value="boxes">boxes</option>
                                    <option value="packets">packets</option>
                                    <option value="bottles">bottles</option>
                                    <option value="sets">sets</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={addCustomItem}
                                    className="btn btn-outline btn-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {formData.customItems.length > 0 && (
                                <div className="space-y-2">
                                    {formData.customItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between bg-neutral-50 p-2 rounded">
                                            <span>{item.name} - {item.quantity} {item.unit}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCustomItem(item.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-900">Delivery Information</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Delivery Method
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="deliveryMethod"
                                        value="drop-off"
                                        checked={formData.deliveryMethod === 'drop-off'}
                                        onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                                        className="mr-2"
                                    />
                                    I will drop off items at the relief center
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="deliveryMethod"
                                        value="pickup"
                                        checked={formData.deliveryMethod === 'pickup'}
                                        onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                                        className="mr-2"
                                    />
                                    Please arrange pickup from my location
                                </label>
                            </div>
                        </div>

                        {formData.deliveryMethod === 'pickup' && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Pickup Address *
                                </label>
                                <textarea
                                    value={formData.deliveryAddress}
                                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                                    className="input"
                                    rows="3"
                                    placeholder="Enter your complete address for pickup"
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Preferred Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.deliveryDate}
                                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                                    className="input"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Preferred Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.deliveryTime}
                                    onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            className="input"
                            rows="3"
                            placeholder="Any special instructions or notes..."
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <h4 className="font-semibold text-primary-900 mb-2 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Contribution Summary
                        </h4>
                        <div className="space-y-1 text-sm">
                            <p className="text-primary-800">
                                <strong>Total Items:</strong> {getTotalItems()}
                            </p>
                            <p className="text-primary-800">
                                <strong>Estimated Points:</strong> {getEstimatedPoints()} points
                            </p>
                            <p className="text-primary-700">
                                Your contribution will help provide relief to disaster victims and earn you points for community impact.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-outline flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={isSubmitting || getTotalItems() === 0}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContributionForm;
