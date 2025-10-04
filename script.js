document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const views = {
        homepage: document.getElementById('homepage-view'),
        storyteller: document.getElementById('storyteller-view'),
        family: document.getElementById('family-view'),
        singleStory: document.getElementById('single-story-view'),
    };

    const buttons = {
        gotoStoryteller: document.getElementById('goto-storyteller'),
        gotoFamily: document.getElementById('goto-family'),
        backToHome: document.querySelectorAll('.back-to-home'),
        backToLibrary: document.getElementById('back-to-library'),
        record: document.getElementById('record-btn'),
        submitStory: document.getElementById('submit-story-btn'),
    };

    const storytellerElements = {
        prompt: document.getElementById('story-prompt'),
        status: document.getElementById('recording-status'),
        micIcon: document.getElementById('mic-icon'),
        transcriptOutput: document.getElementById('transcript-output'),
        textInput: document.getElementById('text-input'),
        submitBtnText: document.getElementById('submit-btn-text'),
        submitBtnSpinner: document.getElementById('submit-btn-spinner'),
    };

    const libraryElements = {
        library: document.getElementById('story-library'),
        storyContent: document.getElementById('story-content'),
    };

    const modalElements = {
        modal: document.getElementById('custom-modal'),
        text: document.getElementById('modal-text'),
        closeBtn: document.getElementById('modal-close-btn'),
    };
    
    // --- STATE MANAGEMENT ---
    let isRecording = false;
    let stories = [];
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    // --- VIEW SWITCHING LOGIC ---
    const showView = (viewName) => {
        Object.values(views).forEach(view => view.classList.add('hidden'));
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
        }
    };
    
    // --- CUSTOM MODAL ---
    const showModal = (message) => {
        modalElements.text.textContent = message;
        modalElements.modal.classList.remove('hidden');
    };

    // --- SPEECH RECOGNITION LOGIC ---
    const setupSpeechRecognition = () => {
        if (!SpeechRecognition) {
            storytellerElements.status.textContent = "Speech recognition not supported in this browser.";
            buttons.record.disabled = true;
            return;
        }
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isRecording = true;
            storytellerElements.status.textContent = "Listening...";
            buttons.record.classList.add('bg-red-600', 'recording-pulse');
            buttons.record.classList.remove('bg-blue-600');
        };

        recognition.onend = () => {
            isRecording = false;
            storytellerElements.status.textContent = "Click the button and start speaking";
            buttons.record.classList.remove('bg-red-600', 'recording-pulse');
            buttons.record.classList.add('bg-blue-600');
        };
        
        recognition.onerror = (event) => {
             console.error("Speech recognition error:", event.error);
             storytellerElements.status.textContent = `Error: ${event.error}`;
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            storytellerElements.transcriptOutput.textContent = finalTranscript + interimTranscript;
            storytellerElements.textInput.value = finalTranscript + interimTranscript;
        };
    };
    
    // --- STORY & LIBRARY LOGIC ---
    const loadStories = () => {
        const storedStories = localStorage.getItem('legacyAI_stories');
        if (storedStories) {
            stories = JSON.parse(storedStories);
        }
        
        if (stories.length === 0) {
            stories = [
                {
                    title: "The Old Oak Tree",
                    story: "I remember when my father planted that old oak tree in the front yard. I was just a boy, maybe five or six years old. He told me, 'Son, this tree will watch over our family for generations.' And you know what? He was right. It's seen weddings, birthdays, and even a few tearful goodbyes. It's more than just a tree; it's a part of our history."
                },
                {
                    title: "Lessons from the Kitchen",
                    story: "My mother's kitchen was the heart of our home. The smell of freshly baked bread was my alarm clock. She never used a recipe book, not a single one. 'You cook with your heart, not with your eyes,' she'd say. She taught me that the best ingredients are patience and love. I've tried to carry that lesson with me in everything I do, not just in cooking."
                },
                {
                    title: "First Paycheck",
                    story: "I'll never forget my first real paycheck. I worked all summer at the local hardware store, sweeping floors and stocking shelves. It was only about $40, but it felt like a million. I walked straight to the bicycle shop and bought a shiny red Schwinn I'd been dreaming of for months. Riding that bike home, I felt like the richest kid in the world. It wasn't about the money; it was about the freedom I had earned."
                }
            ];
        }

        renderLibrary();
    };

    const saveStories = () => {
        localStorage.setItem('legacyAI_stories', JSON.stringify(stories));
    };

    const renderLibrary = () => {
        libraryElements.library.innerHTML = '';
        if (stories.length === 0) {
            libraryElements.library.innerHTML = `<p class="text-center text-gray-500">No stories have been saved yet.</p>`;
            return;
        }
        stories.forEach((story, index) => {
            const storyCard = document.createElement('div');
            storyCard.className = 'bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow';
            storyCard.innerHTML = `
                <h3 class="text-2xl font-bold text-gray-800 mb-2">${story.title}</h3>
                <p class="text-gray-600 truncate">${story.story}</p>
            `;
            storyCard.addEventListener('click', () => showSingleStory(index));
            libraryElements.library.appendChild(storyCard);
        });
    };

    const showSingleStory = (index) => {
        const story = stories[index];
        libraryElements.storyContent.innerHTML = `
            <h2 class="text-4xl font-bold text-gray-800 mb-6">${story.title}</h2>
            <p class="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">${story.story}</p>
        `;
        showView('singleStory');
    };

    // --- MOCK AI INTEGRATION ---
    // This function will be replaced with the real API call logic.
    const generateStory = async (storyText) => {
    buttons.submitStory.disabled = true;
    storytellerElements.submitBtnText.classList.add('hidden');
    storytellerElements.submitBtnSpinner.classList.remove('hidden');

    try {
        // This is the endpoint for your Netlify function
        const response = await fetch('/.netlify/functions/generate-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyText }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate story from the server.');
        }

        const newStory = await response.json();

        stories.unshift(newStory);
        saveStories();
        renderLibrary();
        showModal('Your beautiful story has been saved!');

        storytellerElements.transcriptOutput.textContent = 'Your recorded words will appear here...';
        storytellerElements.textInput.value = '';

        showView('family');

    } catch (error) {
        console.error("Error calling generate-story function:", error);
        showModal(`API Error: ${error.message}`);
    } finally {
        buttons.submitStory.disabled = false;
        storytellerElements.submitBtnText.classList.remove('hidden');
        storytellerElements.submitBtnSpinner.classList.add('hidden');
    }
};

    
    // --- EVENT LISTENERS ---
    buttons.gotoStoryteller.addEventListener('click', () => showView('storyteller'));
    buttons.gotoFamily.addEventListener('click', () => showView('family'));
    buttons.backToHome.forEach(btn => btn.addEventListener('click', () => showView('homepage')));
    buttons.backToLibrary.addEventListener('click', () => showView('family'));
    buttons.record.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    buttons.submitStory.addEventListener('click', () => {
        const text = storytellerElements.textInput.value.trim();
        if (text) {
            generateStory(text);
        } else {
            showModal("Please record or type a story before submitting.");
        }
    });
    modalElements.closeBtn.addEventListener('click', () => modalElements.modal.classList.add('hidden'));


    // --- INITIALIZATION ---
    const initialize = () => {
        setupSpeechRecognition();
        loadStories();
        showView('homepage');
    };

    initialize();
});
