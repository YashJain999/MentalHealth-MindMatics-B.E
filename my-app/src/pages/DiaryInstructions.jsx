import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, AlertTriangle, Star, ArrowLeft, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DiaryInstructions = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for GitHub-like effect

    // Toggle dark/light mode
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
        hover: { scale: 1.03, boxShadow: "0 8px 16px rgba(88, 101, 242, 0.4)", transition: { duration: 0.3 } },
    };

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)", transition: { duration: 0.3 } },
        tap: { scale: 0.95, transition: { duration: 0.2 } },
    };

    return (
        <div
            className={`min-h-screen relative ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-blue-50 to-green-50 text-gray-800'} transition-colors duration-500`}
            style={{
                background: isDarkMode ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : undefined,
            }}
        >
            {/* Background Glow Effect */}
            <div
                className="absolute inset-0 opacity-50"
                style={{
                    background: 'radial-gradient(circle, rgba(88, 101, 242, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
                    zIndex: 0,
                }}
            />

            {/* Header with Theme Toggle */}
            <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-6 shadow-lg z-10 relative">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center"
                    >
                        <span className="text-3xl mr-2" style={{ textShadow: isDarkMode ? '0 0 10px rgba(94, 234, 212, 0.5)' : 'none' }}>📔</span>
                        <h1 className="text-2xl font-bold" style={{ textShadow: isDarkMode ? '0 0 5px rgba(94, 234, 212, 0.3)' : 'none' }}>Mental Health Diary</h1>
                    </motion.div>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-blue-700 transition-colors">
                        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <motion.div
                className="max-w-4xl mx-auto p-6 pt-12 z-10 relative"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Intro Section */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h2
                        className={`text-3xl font-semibold ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}
                        style={{ textShadow: isDarkMode ? '0 0 8px rgba(94, 234, 212, 0.4)' : 'none' }}
                    >
                        A Peaceful Space for Reflection
                    </h2>
                    <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Track your emotions, gain insights, and grow.
                    </p>
                </motion.div>

                {/* How the Diary Works */}
                <motion.section
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                    variants={containerVariants}
                >
                    <motion.div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-start space-x-4 border border-gray-700/20 relative`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-transparent rounded-lg z-0" />
                        <BookOpen className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} size={24} style={{ textShadow: isDarkMode ? '0 0 6px rgba(94, 234, 212, 0.5)' : 'none' }} />
                        <div>
                            <h3 className="text-xl font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(94, 234, 212, 0.3)' : 'none' }}>Write Daily</h3>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Write a Diary per day to reflect on your thoughts and feelings.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-start space-x-4 border border-gray-700/20 relative`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-lg z-0" />
                        <Calendar className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} style={{ textShadow: isDarkMode ? '0 0 6px rgba(96, 165, 250, 0.5)' : 'none' }} />
                        <div>
                            <h3 className="text-xl font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(96, 165, 250, 0.3)' : 'none' }}>Track DAS Scores</h3>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Log your <span className="text-red-500">Depression</span>, <span className="text-yellow-500">Anxiety</span>, and <span className="text-purple-500">Stress</span> levels daily by <span className="text-green-700">Saving</span> your Diary.
                            </p>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Navigating the Diary */}
                <motion.section
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    variants={containerVariants}
                >
                    <motion.div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-start space-x-4 border border-gray-700/20 relative`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent rounded-lg z-0" />
                        <div>
                            <h3 className="text-xl font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(167, 139, 250, 0.3)' : 'none' }}>Organize in Folders</h3>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Create folders like "Work Life" or "Personal Growth" to manage entries.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-start space-x-4 border border-gray-700/20 relative`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent rounded-lg z-0" />
                        <div>
                            <h3 className="text-xl font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(74, 222, 128, 0.3)' : 'none' }}>Daily Entries</h3>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                All the Entries are autocreated for you once you create a folder.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-start space-x-4 border border-gray-700/20 relative`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent rounded-lg z-0" />
                        <div>
                            <h3 className="text-xl font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(251, 191, 36, 0.3)' : 'none' }}>Generate Reports</h3>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                View a Cumulative DAS Report to understand your mental health trends after the end of you Diary tenure.
                            </p>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Guidelines */}
                <motion.section
                    className="mb-12"
                    variants={containerVariants}
                >
                    <div className="flex items-center mb-4">
                        <AlertTriangle className={`${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} size={24} style={{ textShadow: isDarkMode ? '0 0 6px rgba(251, 191, 36, 0.5)' : 'none' }} />
                        <h2 className="text-2xl font-semibold ml-3" style={{ textShadow: isDarkMode ? '0 0 4px rgba(251, 191, 36, 0.3)' : 'none' }}>Key Guidelines</h2>
                    </div>
                    <motion.div
                        className={`${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'} p-6 rounded-lg border-l-4 border-amber-400 flex flex-col space-y-3 border border-gray-700/20 relative`}
                        variants={cardVariants}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent rounded-lg z-0" />
                        <p><span className="font-semibold">No Future Edits:</span> You can only write for today or the past.</p>
                        <p><span className="font-semibold">Complete DAS Scores:</span> Required to generate reports.</p>
                        <p><span className="font-semibold">Locked After Report:</span> No edits once a report is generated.</p>
                    </motion.div>
                </motion.section>

                {/* Why It Matters */}
                <motion.section
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                    variants={containerVariants}
                >
                    <motion.div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-start space-x-4 border border-gray-700/20 relative`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent rounded-lg z-0" />
                        <Star className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} size={24} style={{ textShadow: isDarkMode ? '0 0 6px rgba(167, 139, 250, 0.5)' : 'none' }} />
                        <div>
                            <h3 className="text-xl font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(167, 139, 250, 0.3)' : 'none' }}>Understand Patterns</h3>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Identify emotional trends and triggers over time.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex items-start space-x-4 border border-gray-700/20 relative`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-transparent rounded-lg z-0" />
                        <Star className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} size={24} style={{ textShadow: isDarkMode ? '0 0 6px rgba(94, 234, 212, 0.5)' : 'none' }} />
                        <div>
                            <h3 className="text-xl font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(94, 234, 212, 0.3)' : 'none' }}>Celebrate Growth</h3>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Recognize progress and seek help when needed.
                            </p>
                        </div>
                    </motion.div>
                </motion.section>

                {/* CTA Buttons */}
                <motion.div className="flex justify-center space-x-4 mb-12">
                    <motion.button
                        onClick={() => navigate('/home')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full shadow-lg flex items-center"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Home
                        <ArrowLeft className="ml-2" size={20} />
                    </motion.button>
                    <motion.button
                        onClick={() => navigate('/diary/folders')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full shadow-lg flex items-center"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Go to My Diary Folders
                        <ArrowRight className="ml-2" size={20} />
                    </motion.button>
                </motion.div>

                {/* Help Section */}
                <motion.div
                    className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center border border-gray-700/20 relative`}
                    variants={cardVariants}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-lg z-0" />
                    <h3 className="text-lg font-semibold mb-2" style={{ textShadow: isDarkMode ? '0 0 4px rgba(96, 165, 250, 0.3)' : 'none' }}>Need Help?</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Visit our <a href="#" className="text-blue-500 hover:underline">Help Center</a> or contact support.
                    </p>
                </motion.div>
            </motion.div>

            {/* Footer */}
            <footer className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white text-center py-4 mt-12 z-10 relative`}>
                <p>Mind Matrics © 2025 | Your Mental Health Journey Partner</p>
            </footer>
        </div>
    );
};

export default DiaryInstructions;