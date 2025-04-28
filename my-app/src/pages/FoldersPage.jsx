import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaPlus, FaBook, FaLeaf, FaFeather } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsJournalBookmark } from "react-icons/bs";
import { RiMentalHealthLine } from "react-icons/ri";
import { Sun, Moon } from "lucide-react";
import confetti from "canvas-confetti";
import api, { fetchUserDetails } from "../api"; // Adjust path as needed

const FoldersPage = () => {
    const [folderId, setFolderId] = useState(null);
    const [folders, setFolders] = useState([]);
    const [openFolder, setOpenFolder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [email, setEmail] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState(null);
    const navigate = useNavigate();

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.2,
                duration: 0.6,
            },
        },
    };

    const folderVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
        hover: {
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(88, 101, 242, 0.4)",
            transition: { duration: 0.2 },
        },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const buttonVariants = {
        hover: {
            scale: 1.05,
            boxShadow: "0 5px 15px rgba(59, 130, 246, 0.6)",
            transition: { duration: 0.3 },
        },
        tap: { scale: 0.95 },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await fetchUserDetails();
                setEmail(userData.email);

                const response = await api.get("/api/diary/folders/");
                setFolders(response.data);
            } catch (error) {
                console.error("Error fetching folders or user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleFolder = (folderId) => {
        setOpenFolder(openFolder === folderId ? null : folderId);
    };

    const openDiary = (folderId) => {
        navigate(`/diary/folders/diaryentries/${folderId}`);
    };

    const createNewFolder = async () => {
        const folderName = prompt("Enter a name for your new folder:");
        if (!folderName) return;

        try {
            const response = await api.post("/api/diary/folders/create/", {
                name: folderName,
                email: email,
            });

            const newFolder = response.data;
            triggerConfetti();
            setFolders((prev) => [...prev, newFolder]);

            setTimeout(() => {
                alert(`🎉 Folder "${newFolder.name}" created successfully!`);
                navigate(`/diary/folders/diaryentries/${newFolder.id}`);
            }, 1000);
        } catch (error) {
            console.error("Error creating folder:", error);
            alert("Failed to create folder. Please try again.");
        }
    };

    const triggerConfetti = () => {
        setShowConfetti(true);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4ade80', '#22d3ee', '#60a5fa'],
        });
        setTimeout(() => setShowConfetti(false), 2000);
    };

    const handleFolderSelect = (id) => {
        setFolderId(id);
    };

    const getMoodColor = (score) => {
        if (score < 5) return "text-green-500";
        if (score < 10) return "text-yellow-500";
        return "text-red-500";
    };

    const openDeleteModal = (folderId) => {
        setFolderToDelete(folderId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setFolderToDelete(null);
    };

    const deleteFolder = async () => {
        if (!folderToDelete) return;

        try {
            await api.delete(`/api/diary/folders/${folderToDelete}/`);
            setFolders((prev) => prev.filter((folder) => folder.id !== folderToDelete));
            closeDeleteModal();
        } catch (error) {
            console.error("Error deleting folder:", error);
            closeDeleteModal();
        }
    };

    const handleGenerateReport = async (folderId) => {
        try {
            const response = await api.get(`/api/diary/folders/${folderId}/das-scores/`);
            const dasScores = response.data;
            navigate(`/diary/report/${folderId}`, {
                state: { scores: dasScores, email: email },
            });
        } catch (error) {
            console.error("Failed to fetch DAS scores:", error);
        }
    };

    return (
        <div
            className={`min-h-screen relative flex flex-col items-center py-10 px-5 overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-teal-50 via-blue-50 to-purple-50 text-gray-800'} transition-colors duration-500`}
            style={{ background: isDarkMode ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : undefined }}
        >
            <div className="absolute inset-0 opacity-50" style={{ background: 'radial-gradient(circle, rgba(88, 101, 242, 0.3) 0%, rgba(0, 0, 0, 0) 70%)', zIndex: 0 }} />

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div className="absolute top-20 left-10 w-32 h-32 bg-teal-200 rounded-full blur-3xl opacity-20" animate={{ x: [0, 20, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute bottom-40 right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20" animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-200 rounded-full blur-3xl opacity-20" animate={{ x: [0, 25, 0], y: [0, -15, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
            </div>

            <div className="absolute top-4 right-6 flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-full shadow-lg text-white z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m0 0l4-4m0 4l4 4" />
                </svg>
                <span className="text-sm">Logged in as: <span className="text-indigo-300 font-semibold">{email}</span></span>
            </div>

            <motion.header className="text-center mb-10 z-10" variants={headerVariants}>
                <div className="relative">
                    <motion.div
                        className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-2xl text-yellow-400"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ textShadow: isDarkMode ? '0 0 8px rgba(250, 204, 21, 0.5)' : 'none' }}
                    >
                        ✨
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                            <FaLeaf className={isDarkMode ? 'text-teal-400' : 'text-teal-600'} style={{ textShadow: isDarkMode ? '0 0 6px rgba(94, 234, 212, 0.5)' : 'none' }} />
                        </motion.div>
                        <span className={isDarkMode ? 'bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent'} style={{ textShadow: isDarkMode ? '0 0 8px rgba(94, 234, 212, 0.4)' : 'none' }}>
                            My Diary Collection
                        </span>
                    </h1>
                </div>
                <div className="flex justify-center items-center gap-4">
                    <RouterLink to="/diary/instructions">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="py-2 px-4 text-white bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-xl shadow-md transition-all duration-300"
                        >
                            Instructions
                        </motion.button>
                    </RouterLink>
                    <motion.button onClick={toggleTheme} className="p-2 rounded-full hover:bg-blue-700 transition-colors">
                        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </motion.button>
                </div>
                <motion.p className={isDarkMode ? 'text-gray-300 italic' : 'text-gray-600 italic'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
                    A peaceful place for your thoughts and feelings
                </motion.p>
            </motion.header>

            <motion.button
                onClick={createNewFolder}
                className="w-full max-w-3xl mb-8 flex items-center justify-center gap-3 py-5 px-6 text-white bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-xl shadow-md transition-all duration-300 z-10 relative"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <motion.div animate={{ rotate: [0, 180] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                    <FaPlus className="text-xl" />
                </motion.div>
                <span className="font-medium text-lg">Create New Diary Collection</span>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <HiSparkles className="text-yellow-200 text-xl" style={{ textShadow: isDarkMode ? '0 0 6px rgba(250, 204, 21, 0.5)' : 'none' }} />
                </motion.div>
            </motion.button>

            {isLoading ? (
                <div className="flex justify-center py-12 z-10">
                    <motion.div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}></motion.div>
                </div>
            ) : (
                <motion.div className="w-full max-w-3xl space-y-5 z-10" variants={containerVariants}>
                    {folders.length > 0 ? (
                        folders.map((folder, index) => (
                            <motion.div
                                key={folder.id}
                                className={`rounded-xl shadow-sm border border-blue-50 overflow-hidden relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                                variants={folderVariants}
                                whileHover="hover"
                                custom={index}
                                layout
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-transparent rounded-lg z-0" />

                                <div
                                    className={`flex justify-between items-center p-5 cursor-pointer ${
                                        openFolder === folder.id
                                            ? isDarkMode
                                                ? 'bg-gradient-to-r from-teal-900 via-blue-900 to-teal-800'
                                                : 'bg-gradient-to-r from-teal-50 via-blue-50 to-teal-100'
                                            : isDarkMode
                                            ? 'bg-gray-800'
                                            : 'bg-gradient-to-r from-blue-50 to-teal-50 hover:from-blue-100 hover:to-teal-100'
                                    } transition-colors duration-500 relative z-10`}
                                    onClick={() => toggleFolder(folder.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <motion.div
                                            className={isDarkMode ? 'text-teal-400 bg-gray-700 p-3 rounded-lg shadow-inner' : 'text-teal-600 bg-teal-100 p-3 rounded-lg shadow-inner'}
                                            whileHover={{ rotate: 10 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ textShadow: isDarkMode ? '0 0 6px rgba(94, 234, 212, 0.5)' : 'none' }}
                                        >
                                            <BsJournalBookmark className="text-xl" />
                                        </motion.div>
                                        <div>
                                            <h2 className={isDarkMode ? 'text-xl font-medium text-gray-100' : 'text-xl font-medium text-gray-800'} style={{ textShadow: isDarkMode ? '0 0 4px rgba(94, 234, 212, 0.3)' : 'none' }}>
                                                {folder.name}
                                            </h2>
                                            {folder.cumulative_depression_score !== null && (
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center">
                                                        <RiMentalHealthLine className="text-blue-500 mr-1" style={{ textShadow: isDarkMode ? '0 0 6px rgba(96, 165, 250, 0.5)' : 'none' }} />
                                                        <span className={getMoodColor(folder.cumulative_depression_score)}>D: {folder.cumulative_depression_score}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <RiMentalHealthLine className="text-yellow-500 mr-1" style={{ textShadow: isDarkMode ? '0 0 6px rgba(250, 204, 21, 0.5)' : 'none' }} />
                                                        <span className={getMoodColor(folder.cumulative_anxiety_score)}>A: {folder.cumulative_anxiety_score}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <RiMentalHealthLine className="text-purple-500 mr-1" style={{ textShadow: isDarkMode ? '0 0 6px rgba(167, 139, 250, 0.5)' : 'none' }} />
                                                        <span className={getMoodColor(folder.cumulative_stress_score)}>S: {folder.cumulative_stress_score}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 z-20">
                                        <motion.button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(folder.id);
                                            }}
                                            className={isDarkMode ? 'text-red-500 bg-gray-700 p-2 rounded-full hover:bg-red-900/50 transition' : 'text-red-500 bg-white/70 p-2 rounded-full hover:bg-red-100 transition'}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Delete Folder"
                                        >
                                            <span className="text-sm">🗑️</span>
                                        </motion.button>
                                        <motion.button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFolder(folder.id);
                                            }}
                                            className={isDarkMode ? 'text-gray-400 bg-gray-700 p-2 rounded-full' : 'text-gray-500 bg-white/50 p-2 rounded-full'}
                                            whileHover={{ rotate: openFolder === folder.id ? -180 : 180, scale: 1.1 }}
                                            animate={{ rotate: openFolder === folder.id ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <FaChevronDown className={openFolder === folder.id ? (isDarkMode ? 'text-teal-400' : 'text-teal-600') : ''} />
                                        </motion.button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {openFolder === folder.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className={isDarkMode ? 'p-5 bg-gradient-to-b from-gray-800 to-blue-900' : 'p-5 bg-gradient-to-b from-white to-blue-50'}>
                                                <motion.div className={isDarkMode ? 'bg-gray-700 rounded-lg p-6 shadow-inner border border-blue-900' : 'bg-white rounded-lg p-6 shadow-inner border border-blue-100'} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                                    <p className={`flex items-center justify-center gap-2 mb-5 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        <FaFeather className={isDarkMode ? 'text-teal-400' : 'text-teal-500'} style={{ textShadow: isDarkMode ? '0 0 6px rgba(94, 234, 212, 0.5)' : 'none' }} />
                                                        <span>Open this collection to view and write in your Diary</span>
                                                    </p>
                                                    {folder.cumulative_depression_score !== null && (
                                                        <button onClick={() => handleGenerateReport(folder.id)} className={isDarkMode ? 'text-sm text-blue-400 hover:underline ml-2' : 'text-sm text-blue-600 hover:underline ml-2'}>
                                                            📄 View Report
                                                        </button>
                                                    )}
                                                    <motion.button
                                                        className="w-full py-4 px-6 text-white bg-gradient-to-r from-blue-500 via-teal-500 to-blue-500 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden relative"
                                                        onClick={() => openDiary(folder.id)}
                                                        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0, 128, 128, 0.3)" }}
                                                        whileTap={{ scale: 0.97 }}
                                                    >
                                                        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" initial={{ backgroundPosition: "0% 0%" }} animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }} />
                                                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="relative">
                                                            <FaBook className="text-xl" style={{ textShadow: isDarkMode ? '0 0 6px rgba(96, 165, 250, 0.5)' : 'none' }} />
                                                        </motion.div>
                                                        <span className="font-medium text-lg relative">Open Diary</span>
                                                        <motion.div className="absolute right-4 opacity-0 group-hover:opacity-100" initial={{ x: -10 }} whileHover={{ x: 0 }} transition={{ duration: 0.3 }}>
                                                            <HiSparkles className="text-yellow-200" style={{ textShadow: isDarkMode ? '0 0 6px rgba(250, 204, 21, 0.5)' : 'none' }} />
                                                        </motion.div>
                                                    </motion.button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div className={`text-center py-16 rounded-xl border border-blue-100 z-10 relative ${isDarkMode ? 'bg-gray-800' : 'bg-white/80'}`} variants={folderVariants} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-transparent rounded-lg z-0" />
                            <motion.div className={isDarkMode ? 'text-teal-400 text-6xl mb-5 flex justify-center' : 'text-teal-600 text-6xl mb-5 flex justify-center'} animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity }} style={{ textShadow: isDarkMode ? '0 0 6px rgba(94, 234, 212, 0.5)' : 'none' }}>
                                <FaLeaf className="opacity-60" />
                            </motion.div>
                            <motion.p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-500 text-lg'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                                Your Diary collection is empty.
                            </motion.p>
                            <motion.p className={isDarkMode ? 'text-gray-400 mt-2' : 'text-gray-500 mt-2'} initial={{ opacity: 0 }} animate={{ opacity: 1}} transition={{ delay: 0.6 }}>
                                Create your first folder to begin your Diarying journey.
                            </motion.p>
                        </motion.div>
                    )}
                </motion.div>
            )}

            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute inset-0 bg-black opacity-50" onClick={closeDeleteModal}></div>
                        <motion.div
                            className={`rounded-lg p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} relative z-50`}
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this folder?</h3>
                            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This action cannot be undone.</p>
                            <div className="flex justify-end space-x-4">
                                <motion.button
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={deleteFolder}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.footer className={isDarkMode ? 'mt-8 text-center text-gray-400 text-sm z-10' : 'mt-8 text-center text-gray-500 text-sm z-10'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}>
                <p className="flex items-center justify-center gap-2">
                    <span>Your safe space for personal reflection</span>
                    <motion.span animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ textShadow: isDarkMode ? '0 0 6px rgba(96, 165, 250, 0.5)' : 'none' }}>
                        💙
                    </motion.span>
                </p>
            </motion.footer>
        </div>
    );
};

export default FoldersPage;