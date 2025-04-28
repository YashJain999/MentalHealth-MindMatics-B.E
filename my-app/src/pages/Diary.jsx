// export default Diary;
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronLeft, faChevronRight, faSave, faBook, faPenFancy } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import api from "../api";

// Import audio file from src/assets/audio
import pageTurnSoundFile from '../assets/audio/page-turn.wav';

const Diary = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [entryContent, setEntryContent] = useState("");
    const [diaryName, setDiaryName] = useState("");
    const [currentDateTime, setCurrentDateTime] = useState(new Date().toLocaleString());
    const [currentPage, setCurrentPage] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedNotification, setShowSavedNotification] = useState(false);
    const textareaRef = useRef(null);
    const [isLocked, setIsLocked] = useState(false);
    const [folderHasCumulativeScore, setFolderHasCumulativeScore] = useState(false);
    const [text, setText] = useState("");

    const linesPerPage = 10;
    const charsPerLine = 100;

    // Create Audio object with imported file
    let pageTurnSound;
    try {
        pageTurnSound = new Audio(pageTurnSoundFile);
        pageTurnSound.load();
    } catch (error) {
        console.error("Failed to load page-turn sound:", error);
    }

    // Function to split content into pages based on 100 characters per line and 10 lines per page

    const getPages = (text) => {
        if (!text) return [""];
        let lines = text.split('\n').map(line => line.trimEnd());
        let pages = [];
        let currentPageLines = [];

        for (let line of lines) {
            while (line.length > charsPerLine) {
                currentPageLines.push(line.substring(0, charsPerLine));
                line = line.substring(charsPerLine);
                if (currentPageLines.length === linesPerPage) {
                    pages.push(currentPageLines.join('\n'));
                    currentPageLines = [];
                }
            }
            currentPageLines.push(line);

            if (currentPageLines.length === linesPerPage) {
                pages.push(currentPageLines.join('\n'));
                currentPageLines = [];
            }
        }

        if (currentPageLines.length > 0) {
            pages.push(currentPageLines.join('\n'));
        }

        return pages.length > 0 ? pages : [""];
    };

    const handleInputChange = (e) => {
        const newText = e.target.value;
        const cursorPosition = e.target.selectionStart; // caret position

        setText(newText);

        // Calculate the page based on cursor
        const pageNumber = Math.floor(cursorPosition / (charsPerLine * linesPerPage));
        setCurrentPage(pageNumber);
    };

    const [pages, setPages] = useState(getPages(entryContent));
    const totalPages = pages.length;

    // Function to handle textarea input and enforce limits
    const handleContentChange = (e) => {
        const newPageText = e.target.value; // user is editing only 1 page
        const updatedPages = [...pages];
        updatedPages[currentPage] = newPageText; // update only current page
    
        const mergedText = updatedPages.join('\n'); // merge all pages back into one text
        setEntryContent(mergedText); // update full text
    
        const newPages = getPages(mergedText); // regenerate pages properly
        setPages(newPages);
    
        // Cursor tracking (optional for smooth flipping)
        const cursorPosition = e.target.selectionStart;
        const pageNumber = Math.floor(cursorPosition / (charsPerLine * linesPerPage));
        if (pageNumber !== currentPage) {
            try {
                pageTurnSound.play();
            } catch (error) {
                console.error("Error playing page-turn sound:", error);
            }
            setCurrentPage(pageNumber);
        }
    };
    
    

    // Function to update current page content
    const updateCurrentPageContent = (e) => {
        const newText = e.target.value;
        const newPages = [...pages];
        newPages[currentPage] = newText;
        setEntryContent(newPages.join('\n'));
        setPages(getPages(newPages.join('\n')));

        // Trigger page turn if current page exceeds 10 lines
        const currentPageText = getPages(newPages.join('\n'))[currentPage] || "";
        const lines = currentPageText.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > linesPerPage && currentPage < getPages(newPages.join('\n')).length - 1) {
            try {
                pageTurnSound.play();
            } catch (error) {
                console.error("Error playing page-turn sound:", error);
            }
            setCurrentPage(currentPage + 1);
        }
    };

    useEffect(() => {
        setCurrentDateTime(new Date().toLocaleString());
        const timer = setInterval(() => {
            setCurrentDateTime(new Date().toLocaleString());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDiaryName = async () => {
            try {
                const response = await api.get(`/api/diary/folders/${folderId}/`);
                setDiaryName(response.data.name);
            } catch (error) {
                console.error("Error fetching diary name:", error);
            }
        };
        fetchDiaryName();
    }, [folderId]);

    useEffect(() => {
        if (!folderId) {
            console.error("Invalid folder ID, redirecting...");
            navigate("/diary/folders");
            return;
        }

        const fetchEntries = async () => {
            try {
                const response = await api.get(`/api/diary/folders/${folderId}/entries/`);
                const data = response.data;
                if (Array.isArray(data) && data.length > 0) {
                    const sortedEntries = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                    const formattedEntries = sortedEntries.map(entry => ({
                        ...entry,
                        formattedDateTime: new Date(entry.created_at).toLocaleString(),
                    }));
                    setEntries(formattedEntries);
                    const today = new Date().toISOString().split("T")[0];
                    const todayEntry = formattedEntries.find(e => e.date === today);
                    setSelectedEntry(todayEntry || formattedEntries[0]);
                    setEntryContent((todayEntry || formattedEntries[0]).content || "");
                    setPages(getPages((todayEntry || formattedEntries[0]).content || ""));
                }
            } catch (error) {
                console.error("Error fetching diary entries:", error);
            }
        };
        fetchEntries();
    }, [folderId, navigate]);

    useEffect(() => {
        setCurrentPage(0);
        setPages(getPages(entryContent));
    }, [selectedEntry, entryContent]);

    const fetchDASScores = async (entryId) => {
        try {
            await api.get(`/api/diary/entries/${entryId}/fetch-das/`);
        } catch (error) {
            console.error("Error fetching DAS scores:", error);
        }
    };

    const handleSave = async () => {
        if (!selectedEntry?.id) return;
        try {
            setIsSaving(true);
            const payload = {
                content: entryContent,
                title: selectedEntry.title || `Entry ${selectedEntry.id}`,
                folder: selectedEntry.folder || folderId,
            };
            const response = await api.put(`/api/diary/entries/${selectedEntry.id}/update/`, payload);
            if (response.status === 200) {
                const updatedEntries = entries.map(entry =>
                    entry.id === selectedEntry.id ? { ...entry, content: entryContent } : entry
                );
                setEntries(updatedEntries);
                fetchDASScores(selectedEntry.id);
                setShowSavedNotification(true);
                setTimeout(() => setShowSavedNotification(false), 2000);
            }
        } catch (error) {
            console.error("Error saving entry:", error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const fetchFolderDetails = async () => {
            try {
                const response = await api.get(`/api/diary/folders/${folderId}/`);
                setDiaryName(response.data.name);
                const hasCumulativeScore =
                    response.data.cumulative_depression_score !== null ||
                    response.data.cumulative_anxiety_score !== null ||
                    response.data.cumulative_stress_score !== null;
                if (hasCumulativeScore) {
                    setIsLocked(true);
                    setFolderHasCumulativeScore(true);
                } else {
                    setFolderHasCumulativeScore(false);
                }
            } catch (error) {
                console.error("Error fetching folder details:", error);
            }
        };
        fetchFolderDetails();
    }, [folderId]);

    useEffect(() => {
        const fetchFolderName = async () => {
            try {
                const response = await api.get(`/api/diary/folders/`);
                const allFolders = response.data;
                const folder = allFolders.find(f => f.id === parseInt(folderId));
                if (folder) setDiaryName(folder.name);
            } catch (error) {
                console.error("Error fetching folder name:", error);
            }
        };
        fetchFolderName();
    }, [folderId]);

    const calculateCumulativeDAS = async (folderId) => {
        try {
            setFolderHasCumulativeScore(false);
            const [calculateResponse, dasScoresResponse] = await Promise.all([
                api.post(`/api/diary/folders/${folderId}/calculate-cumulative/`),
                api.get(`/api/diary/folders/${folderId}/das-scores/`),
            ]);
            setTimeout(() => {
                setFolderHasCumulativeScore(true);
                navigate(`/diary/report/${folderId}`, {
                    state: { scores: dasScoresResponse.data },
                });
            }, 2000);
        } catch (error) {
            console.error("Error calculating cumulative DAS scores:", error);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            try {
                pageTurnSound.play();
            } catch (error) {
                console.error("Error playing page-turn sound:", error);
            }
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            try {
                pageTurnSound.play();
            } catch (error) {
                console.error("Error playing page-turn sound:", error);
            }
            setCurrentPage(currentPage - 1);
        }
    };

    const pageVariants = {
        initial: { opacity: 1, rotateY: 90, x: "50%", transformOrigin: "left" },
        in: { opacity: 1, rotateY: 0, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
        out: { opacity: 1, rotateY: -90, x: "-50%", transition: { duration: 0.6, ease: "easeIn" } }
    };

    const buttonHoverVariants = {
        hover: { scale: 1.05, boxShadow: "0px 4px 8px rgba(0,0,0,0.1)", transition: { duration: 0.2 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } }
    };

    const pageCountVariants = {
        animate: { opacity: [0, 1], y: [5, 0], transition: { duration: 0.3 } }
    };

    const tabVariants = {
        selected: { y: 4, backgroundColor: "rgba(254, 243, 199, 0.9)", boxShadow: "0px -2px 8px rgba(0,0,0,0.05)", transition: { duration: 0.3, ease: "easeOut" } },
        notSelected: { y: 0, backgroundColor: "rgba(255, 251, 235, 0.8)", transition: { duration: 0.3, ease: "easeOut" } }
    };

    const allEntriesFilled = entries.every(entry => entry.content.trim() !== "");

    return (
        <MotionConfig transition={{ duration: 0.4 }}>
            <div className="h-screen w-screen bg-cover bg-center relative overflow-hidden"
                style={{ backgroundImage: "url('https://cdn.pixabay.com/photo/2016/03/01/11/07/paper-1230086_1280.jpg')", backgroundSize: 'cover', fontFamily: "'Noto Serif', serif" }}>
                <div className="absolute inset-0 bg-amber-900/5 mix-blend-overlay pointer-events-none"></div>
                <motion.div className="absolute top-8 right-8 text-amber-900 font-serif"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}>
                    <span className="backdrop-blur-sm bg-white/30 px-3 py-1 rounded-md shadow-sm">{currentDateTime}</span>
                </motion.div>
                <motion.div className="absolute top-8 left-1/2 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    transition={{ delay: 0.3, duration: 0.6 }}>
                    <h1 className="text-3xl font-bold text-amber-900 font-serif flex items-center justify-center">
                        <FontAwesomeIcon icon={faBook} className="mr-3 text-amber-800" />
                        <span className="italic">{diaryName || "My Diary"}</span>
                    </h1>
                </motion.div>
                <div className="absolute top-24 left-0 right-0 flex justify-center">
                    <motion.div className="flex space-x-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}>
                        {entries.map((entry, index) => {
                            const baseDate = new Date(entries[0].formattedDateTime);
                            const cleanBaseDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
                            const incrementedDate = new Date(cleanBaseDate);
                            incrementedDate.setDate(cleanBaseDate.getDate() + index);
                            const formattedDate = `${incrementedDate.getDate()}/${incrementedDate.getMonth() + 1}/${incrementedDate.getFullYear()}`;
                            return (
                                <motion.button
                                    key={index}
                                    className="text-center py-2 px-6 rounded-t-lg font-serif"
                                    variants={tabVariants}
                                    initial="notSelected"
                                    animate={selectedEntry?.id === entry.id ? "selected" : "notSelected"}
                                    whileHover={{ backgroundColor: selectedEntry?.id === entry.id ? "rgba(254, 243, 199, 1)" : "rgba(255, 251, 235, 0.9)" }}
                                    onClick={() => { setSelectedEntry(entry); setEntryContent(entry.content || ""); setCurrentPage(0); }}>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-amber-900">Day {index + 1}</span>
                                        <span className="text-xs text-amber-700">{formattedDate}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
                <motion.div className="absolute top-44 right-10 left-10 bottom-24 rounded-lg shadow-lg bg-amber-50/60 backdrop-blur-sm"
                    style={{ maxWidth: "1000px", margin: "0 auto" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.7 }}>
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-800/20 to-transparent"></div>
                    <motion.div
                        key={currentPage}
                        variants={pageCountVariants}
                        animate="animate"
                        className="absolute bottom-4 right-4 text-xs text-amber-800/70 font-serif italic">
                        Page {currentPage + 1}
                    </motion.div>
                    <div className="absolute inset-8 pointer-events-none">
                        {Array(linesPerPage).fill().map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-full h-px bg-amber-800 opacity-30 absolute"
                                style={{ top: `${(i + 1) * 3}rem` }}
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 0.3, scaleX: 1 }}
                                transition={{ delay: 0.9 + (i * 0.03), duration: 0.5 }}
                            />
                        ))}
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            className="absolute inset-0 p-8"
                            variants={pageVariants}
                            initial="initial"
                            animate="in"
                            exit="out"
                            style={{ perspective: "1000px", transformStyle: "preserve-3d" }}>
                            <textarea
                                ref={textareaRef}
                                className={`w-full h-full resize-none font-serif text-xl outline-none ${isLocked ? "bg-gray-50 cursor-not-allowed text-gray-600" : "bg-transparent text-amber-900"}`}
                                disabled={isLocked}
                                value={pages[currentPage] || ""}  // <- bind full text here
                                onChange={handleContentChange} // <- just one event
                                placeholder="Write your thoughts here..."
                                style={{
                                    lineHeight: "3rem",
                                    padding: "0",
                                    zIndex: 10,
                                    boxSizing: "border-box",
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "break-word",
                                    wordBreak: "normal",
                                    overflow: "hidden",
                                    height: `${linesPerPage * 3}rem`
                                }}
                            />
                            {isLocked && (
                                <p className="text-red-500 text-sm italic mt-2">✨ Editing is disabled after cumulative DAS scores are calculated.</p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
                        <motion.button
                            onClick={prevPage}
                            disabled={currentPage === 0}
                            className={`p-3 rounded-full ${currentPage === 0 ? 'text-gray-400' : 'text-amber-800 bg-amber-100/50 hover:bg-amber-200/70'}`}
                            whileTap={currentPage !== 0 ? { scale: 0.9 } : {}}
                            whileHover={currentPage !== 0 ? { scale: 1.1, backgroundColor: "rgba(254, 215, 170, 0.7)" } : {}}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </motion.button>
                        <motion.div
                            className="px-3 py-1 rounded-full bg-amber-100/60 text-amber-800 font-serif"
                            whileHover={{ scale: 1.05 }}>
                            Page {currentPage + 1}
                        </motion.div>
                        <motion.button
                            onClick={nextPage}
                            disabled={currentPage >= totalPages - 1}
                            className={`p-3 rounded-full ${currentPage >= totalPages - 1 ? 'text-gray-400' : 'text-amber-800 bg-amber-100/50 hover:bg-amber-200/70'}`}
                            whileTap={currentPage < totalPages - 1 ? { scale: 0.9 } : {}}
                            whileHover={currentPage < totalPages - 1 ? { scale: 1.1, backgroundColor: "rgba(254, 215, 170, 0.7)" } : {}}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </motion.button>
                    </div>
                </motion.div>
                <motion.div
                    className="absolute bottom-16 right-6 text-4xl text-amber-700/30 rotate-45 pointer-events-none"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}>
                    <FontAwesomeIcon icon={faPenFancy} />
                </motion.div>
                <div className="absolute bottom-4 w-full px-16">
                    <div className="grid grid-cols-3 items-center">
                        <div className="flex justify-start">
                            <motion.button
                                className="px-5 py-2 bg-amber-800 text-white rounded-md flex items-center font-serif shadow-md"
                                onClick={() => navigate("/diary/folders")}
                                variants={buttonHoverVariants}
                                whileHover="hover"
                                whileTap="tap"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}>
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                Back to Folders
                            </motion.button>
                        </div>
                        <div className="flex justify-center">
                            <motion.button
                                className={`px-6 py-2 text-white rounded-md font-serif shadow-md flex items-center transition duration-300 ${isLocked ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"}`}
                                onClick={handleSave}
                                disabled={isSaving || isLocked}
                                variants={buttonHoverVariants}
                                whileHover={!isLocked ? "hover" : ""}
                                whileTap={!isLocked ? "tap" : ""}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}>
                                {isSaving ? <span>Saving...</span> : isLocked ? <>
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                                    Editing Locked
                                </> : <>
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                                    Save Entry
                                </>}
                            </motion.button>
                        </div>
                        <div className="flex justify-end">
                            {allEntriesFilled && (
                                <motion.button
                                    onClick={() => { if (!folderHasCumulativeScore) calculateCumulativeDAS(folderId); }}
                                    className={`px-6 py-2 text-white rounded-md font-serif shadow-md flex items-center ${folderHasCumulativeScore ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"}`}
                                    variants={buttonHoverVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    disabled={folderHasCumulativeScore}>
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                                    {folderHasCumulativeScore ? "Report Generated" : "Generate Report"}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {showSavedNotification && (
                        <motion.div
                            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-6 py-2 rounded-full shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}>
                            Entry saved successfully!
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200/50 to-transparent pointer-events-none"></div>
            </div>
        </MotionConfig>
    );
};

export default Diary;