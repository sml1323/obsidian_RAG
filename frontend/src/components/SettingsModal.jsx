import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const API_BASE_URL = 'http://localhost:8000';

const SettingsModal = ({ isOpen, onClose, onSettingsChanged }) => {

    const [settings, setSettings] = useState({
        vault_path: '',
        model_type: 'local',
        api_keys: {
            openai: '',
            gemini: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch settings on open
    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings`);
            if (!res.ok) throw new Error('Failed to load settings');
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error(err);
            setError('Could not load settings. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApiKeyChange = (provider, value) => {
        setSettings(prev => ({
            ...prev,
            api_keys: {
                ...prev.api_keys,
                [provider]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const newSettings = await res.json();


            if (!res.ok) throw new Error('Failed to save settings');

            // Optionally notify user or just close
            if (onSettingsChanged) {
                onSettingsChanged(newSettings); // Pass new settings back
            }
            onClose();

        } catch (err) {
            console.error(err);
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="User Settings">
            {loading ? (
                <div className="text-center py-8 text-gray-400">Loading settings...</div>
            ) : (
                <div className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Vault Path */}
                    <div className="space-y-2">
                        <label htmlFor="vault_path" className="block text-sm font-medium text-gray-300">
                            Vault Path
                        </label>
                        <input
                            id="vault_path"
                            type="text"
                            value={settings.vault_path}
                            onChange={(e) => handleChange('vault_path', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                            placeholder="/path/to/your/vault"
                        />
                        <p className="text-xs text-gray-500">Path to your local Obsidian vault directory.</p>
                    </div>

                    {/* Model Type */}
                    <div className="space-y-2">
                        <label htmlFor="model_type" className="block text-sm font-medium text-gray-300">
                            AI Model
                        </label>
                        <select
                            id="model_type"
                            value={settings.model_type}
                            onChange={(e) => handleChange('model_type', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                        >
                            <option value="local">Local (Ollama)</option>
                            <option value="openai">OpenAI (GPT-4/3.5)</option>
                            <option value="gemini">Google Gemini</option>
                        </select>
                    </div>

                    {/* API Keys (Conditional) */}
                    {settings.model_type === 'openai' && (
                        <div className="space-y-2 animate-fadeIn">
                            <label htmlFor="openai_key" className="block text-sm font-medium text-gray-300">
                                OpenAI API Key
                            </label>
                            <input
                                id="openai_key"
                                type="password"
                                value={settings.api_keys?.openai || ''}
                                onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                                placeholder="sk-..."
                            />
                        </div>
                    )}

                    {settings.model_type === 'gemini' && (
                        <div className="space-y-2 animate-fadeIn">
                            <label htmlFor="gemini_key" className="block text-sm font-medium text-gray-300">
                                Google Gemini API Key
                            </label>
                            <input
                                id="gemini_key"
                                type="password"
                                value={settings.api_keys?.gemini || ''}
                                onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                                placeholder="AIza..."
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default SettingsModal;
