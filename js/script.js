document.addEventListener('DOMContentLoaded', () => {
    // Determine the current amendment number from a data attribute on the body
    // Example: <body data-amendment="1">
    const amendmentNumber = parseInt(document.body.dataset.amendment, 10);
    
    // Sync with global variables
    totalXP = parseInt(localStorage.getItem('totalUserXP')) || 0;
    actionScores = JSON.parse(localStorage.getItem('userActionScores')) || {};
    amendmentStatus = JSON.parse(localStorage.getItem('amendmentStatus')) || {};
    
    
    // Update amendment status indicators on home page
    updateAmendmentStatusIndicators();
    
    // Integrate with awards system
    integrateAwardSystem();
    

    // Ensure amendmentData is loaded and the specific amendment exists
    if (typeof amendmentData === 'undefined' || !amendmentData[amendmentNumber]) {
        console.error(`Data for Amendment ${amendmentNumber} not found or amendment_data.js not loaded.`);
        // Display an error message on the page
        setTextContent('amendment-title', 'Error: Amendment Data Not Found');
        // Optionally hide or disable other sections
        const container = document.querySelector('.container');
        if (container) container.innerHTML = '<h2>Error loading amendment data. Please check the console.</h2>';
        return; // Stop execution if data is missing
    }

    const data = amendmentData[amendmentNumber];

    // --- Helper Functions ---
    function setTextContent(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Element with ID '${id}' not found.`);
        }
    }


    function setButtonAttributes(id, text, link) {
        const button = document.getElementById(id);
        if (button) {
            button.textContent = text;
            if (link && link !== '#') {
                button.onclick = () => window.location.href = link;
            } else {
                button.disabled = true; // Disable if no link provided
                button.style.opacity = 0.5;
            }
        } else {
             console.warn(`Button with ID '${id}' not found.`);
        }
    }


    // --- Populate Header ---
    document.title = `Bill of Rights Explorer - ${data.numberOrdinal} Amendment`;
    // XP and Level are handled by separate logic below

    // --- Populate Main Content ---
    setTextContent('amendment-title', data.title);
    
    // Clear the amendment card to dynamically build sections
    const amendmentCard = document.querySelector('.amendment-card');
    amendmentCard.innerHTML = '';
    
    // Create subtitle if it exists
    if (data.subtitle) {
        const subtitleElement = document.createElement('h3');
        subtitleElement.id = 'amendment-subtitle';
        subtitleElement.textContent = data.subtitle;
        amendmentCard.appendChild(subtitleElement);
    }
    
    // Create story section if it exists
    if (data.story) {
        const storyContainer = document.createElement('div');
        storyContainer.className = 'amendment-story';
        storyContainer.id = 'amendment-story';
        
        const storyIcon = document.createElement('i');
        storyIcon.className = 'fas fa-book-open story-icon';
        storyIcon.setAttribute('aria-hidden', 'true');
        storyContainer.appendChild(storyIcon);

        // Conditionally add image to the story section if imageFileName exists
        if (data.imageFileName) {
            const storyImage = document.createElement('img');
            storyImage.src = `images/${data.imageFileName}`; // Use the filename from data
            storyImage.alt = `${data.title} illustration`; // Use amendment title for alt text
            storyImage.className = 'amendment-story-image';
            storyContainer.appendChild(storyImage);
        }
        
        const storyText = document.createElement('p');
        storyText.textContent = data.story;
        storyContainer.appendChild(storyText);
        
        amendmentCard.appendChild(storyContainer);
    }
    
    // Create description if it exists
    if (data.description && data.description.length > 0) {
        const descriptionContainer = document.createElement('div');
        descriptionContainer.id = 'amendment-description';
        data.description.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            descriptionContainer.appendChild(p);
        });
        amendmentCard.appendChild(descriptionContainer);
    }
    
    // Create full text if it exists
    if (data.fullText) {
        const titleElement = document.createElement('h3');
        titleElement.textContent = 'Full Text:';
        amendmentCard.appendChild(titleElement);
        
        const fullTextElement = document.createElement('div');
        fullTextElement.className = 'full-text';
        fullTextElement.id = 'full-text-content';
        fullTextElement.textContent = data.fullText;
        amendmentCard.appendChild(fullTextElement);
    }
    
    // Create plain summary if it exists
    if (data.plainSummary) {
        const summaryContainer = document.createElement('div');
        summaryContainer.id = 'plain-summary';
        
        // Check if plainSummary is a string (new format with <details>) or object (old format)
        if (typeof data.plainSummary === 'string') {
            summaryContainer.innerHTML = data.plainSummary; // Directly insert the HTML string
        } else if (typeof data.plainSummary === 'object' && data.plainSummary !== null && data.plainSummary.intro && Array.isArray(data.plainSummary.points)) {
            // Handle the old object format
            summaryContainer.innerHTML = `<p>${data.plainSummary.intro}</p>`;
            const ol = document.createElement('ol');
            data.plainSummary.points.forEach(point => {
                const li = document.createElement('li');
                li.textContent = point;
                ol.appendChild(li);
            });
            summaryContainer.appendChild(ol);
        } else {
            console.warn('Plain summary data is in an unexpected format:', data.plainSummary);
            summaryContainer.innerHTML = '<p>Error loading summary.</p>';
        }
        
        amendmentCard.appendChild(summaryContainer);
    }
    
    // Create infographic if it exists
    if (data.infographicIcons && data.infographicIcons.length > 0) {
        const infographicContainer = document.createElement('div');
        infographicContainer.className = 'infographic';
        infographicContainer.id = 'infographic-icons';
        
        data.infographicIcons.forEach(iconData => {
            const div = document.createElement('div');
            div.className = 'icon';
            div.innerHTML = `<i class="${iconData.class}" aria-hidden="true"></i><span>${iconData.label}</span>`;
            infographicContainer.appendChild(div);
        });
        
        amendmentCard.appendChild(infographicContainer);
    }
    
    // Create key points if they exist - non-collapsible version
    if (data.keyPoints && data.keyPoints.length > 0) {
        const titleElement = document.createElement('h3');
        titleElement.textContent = 'Notes:';
        amendmentCard.appendChild(titleElement);
        
        const keyPointsContainer = document.createElement('div');
        keyPointsContainer.id = 'key-points';
        
    data.keyPoints.forEach(kp => {
        const noteBox = document.createElement('div');
        noteBox.className = 'note-box warning';
        
        const noteTitle = document.createElement('div');
        noteTitle.className = 'note-title warning';
        noteTitle.textContent = kp.title;
        
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content warning';
        noteContent.innerHTML = kp.text;
            
            noteBox.appendChild(noteTitle);
            noteBox.appendChild(noteContent);
            keyPointsContainer.appendChild(noteBox);
        });
        
        amendmentCard.appendChild(keyPointsContainer);
    }
    
    // Create fun fact if it exists
    if (data.funFact) {
        const funFactContainer = document.createElement('div');
        funFactContainer.className = 'fun-fact';
        
        const funFactContent = document.createElement('span');
        funFactContent.id = 'fun-fact-content';
        funFactContent.innerHTML = data.funFact;
        
        funFactContainer.appendChild(funFactContent);
        amendmentCard.appendChild(funFactContainer);
    }
    
    // Create historical context if it exists
    if (data.historicalContext) {
        const titleElement = document.createElement('h3');
        titleElement.textContent = 'Historical Context:';
        amendmentCard.appendChild(titleElement);
        
        const historicalContextElement = document.createElement('p');
        historicalContextElement.id = 'historical-context-content';
        historicalContextElement.textContent = data.historicalContext;
        amendmentCard.appendChild(historicalContextElement);
    }
    
    // Create significance section if it exists
    if (data.significance) {
        const titleElement = document.createElement('h3');
        titleElement.textContent = 'Significance and Impact:';
        amendmentCard.appendChild(titleElement);
        
        const significanceContainer = document.createElement('div');
        significanceContainer.id = 'significance-impact';
        
        significanceContainer.innerHTML = `<p>${data.significance.intro}</p>`;
        const ul = document.createElement('ul');
        data.significance.cases.forEach(caseText => {
            const li = document.createElement('li');
            li.innerHTML = caseText; // Use innerHTML because of <strong> tags
            ul.appendChild(li);
        });
        significanceContainer.appendChild(ul);
        
        const pConclusion = document.createElement('p');
        pConclusion.textContent = data.significance.conclusion;
        significanceContainer.appendChild(pConclusion);
        
        amendmentCard.appendChild(significanceContainer);
    }

    // --- Populate Quiz ---
    const quizSection = document.getElementById('quiz-section');
    if (quizSection && data.quiz) {
        quizSection.style.display = 'block'; // Ensure it's visible
        setTextContent('quiz-title', data.quiz.title);
        const quizQuestionsContainer = document.getElementById('quiz-questions');
        if (quizQuestionsContainer) {
            quizQuestionsContainer.innerHTML = ''; // Clear existing

            // Load saved quiz answers if they exist
            const savedAnswers = loadQuizAnswers(amendmentNumber);

            data.quiz.questions.forEach(qData => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'quiz-question';
                questionDiv.innerHTML = `<p>${qData.text}</p>`; // Use innerHTML for <strong>
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'quiz-options';
                qData.options.forEach(opt => {
                    const label = document.createElement('label');
                    // Check if this option was previously selected
                    const isChecked = savedAnswers && savedAnswers[qData.q] === opt.value;

                    // Ensure unique IDs for inputs if needed, though name grouping handles selection
                    label.innerHTML = `<input type="radio" name="${qData.q}" value="${opt.value}"${isChecked ? ' checked' : ''}> ${opt.text}`;
                    // Style to display each option on a new line and make the bubble properly enclose the text
                    label.style.display = 'inline-block'; // Changed from block to inline-block
                    label.style.marginBottom = '8px'; // Add spacing between options
                    label.style.width = 'auto'; // Allow width to fit content
                    label.style.minWidth = '25%'; // Set minimum width for very short answers
                    optionsDiv.appendChild(label);
                    // Add a line break after each label to ensure each appears on a new line
                    optionsDiv.appendChild(document.createElement('br'));
                });
                questionDiv.appendChild(optionsDiv);
                quizQuestionsContainer.appendChild(questionDiv);
            });
        }
    } else if (quizSection) {
        quizSection.style.display = 'none'; // Hide if no quiz data
    }

    // --- Populate Scenario ---
    if (data.scenario) {
        const scenarioSection = document.getElementById('scenario-section');
        if (scenarioSection) {
            scenarioSection.style.display = 'block'; // Show the scenario section
            setTextContent('scenario-title', data.scenario.title || 'Scenario Challenge');
            setTextContent('scenario-question', data.scenario.question);
            
            const optionsContainer = document.getElementById('scenario-options');
            if (optionsContainer) {
                optionsContainer.innerHTML = ''; // Clear any existing options
                
                data.scenario.options.forEach((option, index) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'scenario-option';
                    
                    const radioBtn = document.createElement('input');
                    radioBtn.type = 'radio';
                    radioBtn.id = `scenario-option-${index}`;
                    radioBtn.name = 'scenario';
                    radioBtn.value = option.id;
                    
                    const label = document.createElement('label');
                    label.htmlFor = `scenario-option-${index}`;
                    label.textContent = option.text;
                    
                    optionDiv.appendChild(radioBtn);
                    optionDiv.appendChild(label);
                    optionsContainer.appendChild(optionDiv);
                });
                
                // Add a submit button specifically for the scenario
                const submitBtn = document.createElement('button');
                submitBtn.className = 'btn';
                submitBtn.textContent = 'Submit Answer';
                submitBtn.onclick = function() {
                    const selected = document.querySelector('input[name="scenario"]:checked');
                    if (selected) {
                        checkScenario(selected.value);
                    } else {
                        alert('Please select an answer to continue.');
                    }
                };
                optionsContainer.appendChild(submitBtn);
            }
        }
    }
    
    // --- Populate Reflection ---
    const reflectionSection = document.getElementById('reflection-section');
    if (reflectionSection && data.reflection) {
        reflectionSection.style.display = 'block'; // Ensure it's visible
        setTextContent('reflection-title', data.reflection.title);
        setTextContent('reflection-prompt', data.reflection.prompt);
    } else if (reflectionSection) {
        reflectionSection.style.display = 'none'; // Hide if no reflection data
    }

    // --- Populate Navigation ---
    if (data.navigation) {
        setButtonAttributes('prev-button', data.navigation.prev.text, data.navigation.prev.link);
        setButtonAttributes('next-button', data.navigation.next.text, data.navigation.next.link);
    } else {
        // Hide navigation if no data
        const navContainer = document.querySelector('.navigate');
        if (navContainer) navContainer.style.display = 'none';
    }

    // Add event listener for the Home button
    const homeButton = document.getElementById('home-button');
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

});

// --- Global Interaction Logic (moved from original HTML) ---

// Global variables for compatibility with functions outside DOMContentLoaded
let actionScores = JSON.parse(localStorage.getItem('userActionScores')) || {};
let totalXP = parseInt(localStorage.getItem('totalUserXP')) || 0;
let amendmentStatus = JSON.parse(localStorage.getItem('amendmentStatus')) || {};

const AMENDMENT_XP = 50;
const COMPLETED_PERCENTAGE = 0.80;
const MASTERED_PERCENTAGE = 1.00;




// Function to integrate with the award system
function integrateAwardSystem() {
    if (window.awardsSystem) {
        // Trigger amendment visited event
        const amendmentNumber = parseInt(document.body.dataset.amendment, 10);
        if (!isNaN(amendmentNumber)) {
            window.awardsSystem.triggerAwardEvent('amendmentVisited', amendmentNumber);
        }
    }
}

function checkQuiz() {
    const amendmentNumber = parseInt(document.body.dataset.amendment, 10);
    if (!amendmentData || !amendmentData[amendmentNumber] || !amendmentData[amendmentNumber].quiz) return;

    const data = amendmentData[amendmentNumber];
    const correctAnswers = data.quiz.questions.reduce((acc, q) => {
        acc[q.q] = q.answer;
        return acc;
    }, {});

    // Save current answers to localStorage
    let userAnswers = {};
    for (const qData of data.quiz.questions) {
        const qName = qData.q;
        const sel = document.querySelector(`input[name=${qName}]:checked`)?.value;
        if (sel) {
            userAnswers[qName] = sel;
        }
    }

    // Store answers in localStorage
    saveQuizAnswers(amendmentNumber, userAnswers);

    let score = 0;
    let feedback = "<h4>Quiz Results:</h4>";
    const totalQuestions = data.quiz.questions.length;
    const maxScore = totalQuestions * 10; // Assuming 10 XP per question

    for (const qData of data.quiz.questions) {
        const qName = qData.q;
        const sel = userAnswers[qName];
        if (sel === correctAnswers[qName]) {
            score += 10;
            feedback += `<p>✅ Question ${qName.slice(1)}: Correct! +10 XP</p>`;
        } else {
            feedback += `<p>❌ Question ${qName.slice(1)}: Incorrect.</p>`;
        }
    }

    const actionId = `quiz-completion-${amendmentNumber}`;
    const previousScore = actionScores[actionId] || 0;

    if (score > previousScore) {
        const additionalXP = score - previousScore;
        if (additionalXP > 0) updateXPDisplay(additionalXP);
        actionScores[actionId] = score;
        // Save updated actionScores to localStorage
        localStorage.setItem('userActionScores', JSON.stringify(actionScores));
        if (score < maxScore) showRetryMessage(actionId, score, maxScore);
    } else if (!actionScores[actionId]) { // First attempt
        actionScores[actionId] = score;
        // Save updated actionScores to localStorage
        localStorage.setItem('userActionScores', JSON.stringify(actionScores));
        updateXPDisplay(score);
        if (score < maxScore) showRetryMessage(actionId, score, maxScore);
    } else if (score > 0 && score === previousScore) {
        feedback += `<p><strong>You've maintained your previous score of ${score}/${maxScore} XP.</strong></p>`;
    } else if (score < previousScore) {
        feedback += `<p><strong>Your previous best score of ${previousScore}/${maxScore} XP has been kept.</strong></p>`;
    }

    const resultsElement = document.getElementById('quiz-results');
    if (resultsElement) {
        resultsElement.innerHTML = feedback + `<p><strong>Your score: ${score}/${maxScore} XP</strong></p>`;
        resultsElement.style.display = 'block';
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Trigger award event for quiz completion ONLY when the score improves or it's the first attempt
    if (window.awardsSystem && (score > previousScore || !actionScores[actionId])) {
        // If this is an improvement, only count the net new correct answers
        const correctCount = !actionScores[actionId] ? score / 10 : (score - previousScore) / 10;
        
        window.awardsSystem.triggerAwardEvent('quizCompleted', amendmentNumber, {
            correctCount: correctCount, 
            totalQuestions: totalQuestions,
            isPerfect: score === maxScore,
            isImprovement: true
        });
    }
}

function checkScenario(selectedAnswer) {
    const amendmentNumber = parseInt(document.body.dataset.amendment, 10);
     if (!amendmentData || !amendmentData[amendmentNumber] || !amendmentData[amendmentNumber].scenario) return;

    const data = amendmentData[amendmentNumber].scenario;
    const feedbackElement = document.getElementById('scenario-feedback');
    if (!feedbackElement) return;

    let score = 0;
    let feedbackText = '';
    const maxScore = 30; // Assuming 30 XP for scenario
    const isCorrect = selectedAnswer === data.correctAnswer;

    if (isCorrect) {
        feedbackText = data.feedbackCorrect;
        score = maxScore;
    } else {
        feedbackText = data.feedbackIncorrect;
        score = 0;
    }

    const actionId = `scenario-completion-${amendmentNumber}`;
    const previousScore = actionScores[actionId] || 0;

    if (score > previousScore) {
        const additionalXP = score - previousScore;
        if (additionalXP > 0) updateXPDisplay(additionalXP);
        actionScores[actionId] = score;
        // Save updated actionScores to localStorage
        localStorage.setItem('userActionScores', JSON.stringify(actionScores));
        // Only show retry if they got it wrong (score is 0)
        if (score < maxScore) showRetryMessage(actionId, score, maxScore);
    } else if (!actionScores[actionId]) { // First attempt
        actionScores[actionId] = score;
        // Save updated actionScores to localStorage
        localStorage.setItem('userActionScores', JSON.stringify(actionScores));
        if (score > 0) updateXPDisplay(score);
        if (score < maxScore) showRetryMessage(actionId, score, maxScore);
    }
    // No message needed if score is same or lower, feedback text handles it

    feedbackElement.innerHTML = feedbackText;
    feedbackElement.style.display = 'block';
    feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Trigger award event for scenario completion ONLY when score improves or it's the first attempt
    if (window.awardsSystem && isCorrect && (score > previousScore || !actionScores[actionId])) {
        window.awardsSystem.triggerAwardEvent('scenarioCompleted', amendmentNumber, {
            isCorrect: true
        });
    }
}


function addXP(amount, actionId = null) {
    const amendmentNumber = parseInt(document.body.dataset.amendment, 10);
    const fullActionId = actionId ? `${actionId}-${amendmentNumber}` : null;

    if (!fullActionId) {
        // For untracked actions, just add XP directly
        updateXPDisplay(amount);
        return;
    }

    // Get the maximum possible XP for this action
    const maxXPMap = {
        'quiz-completion': 30,
        'scenario-completion': 30,
        'module-completion': 20
    };
    const maxXP = maxXPMap[actionId] || 0;

    // If this is a tracked action, check if we're improving our score
    const previousScore = actionScores[fullActionId] || 0;

    // Only update if we're getting a better score
    if (amount > previousScore) {
        const additionalXP = amount - previousScore;
        actionScores[fullActionId] = amount;
        // Save updated actionScores to localStorage
        localStorage.setItem('userActionScores', JSON.stringify(actionScores));
        updateXPDisplay(additionalXP);
        if (amount < maxXP) showRetryMessage(fullActionId, amount, maxXP);
        
        // Check if this completion affects overall amendment status
        checkAmendmentStatus(amendmentNumber);
    } else if (!actionScores[fullActionId]) { // First attempt
        actionScores[fullActionId] = amount;
        // Save updated actionScores to localStorage
        localStorage.setItem('userActionScores', JSON.stringify(actionScores));
        updateXPDisplay(amount);
        if (amount < maxXP) showRetryMessage(fullActionId, amount, maxXP);
        
        // Check if this completion affects overall amendment status
        checkAmendmentStatus(amendmentNumber);
    } else {
        // They've already done better or matched, show a message
        alert(`You've already earned ${previousScore}/${maxXP} XP for this activity. Your best score is kept.`);
    }
}

// Function to check if amendment is now completed or mastered
function checkAmendmentStatus(amendmentNumber) {
    // Calculate total XP earned for this amendment
    let earnedXP = 0;
    Object.keys(actionScores).forEach(key => {
        if (key.endsWith(`-${amendmentNumber}`)) {
            earnedXP += actionScores[key];
        }
    });
    
    const earnedPercentage = Math.min(earnedXP / AMENDMENT_XP, 1);
    let currentStatus = amendmentStatus[amendmentNumber] || 'incomplete';
    let newStatus = 'incomplete';
    let xpToAdd = 0;
    
    // Determine new status based on percentage
    if (earnedPercentage >= MASTERED_PERCENTAGE) {
        newStatus = 'mastered';
        if (currentStatus === 'completed') {
            xpToAdd = Math.floor(AMENDMENT_XP * (MASTERED_PERCENTAGE - COMPLETED_PERCENTAGE));
        } else if (currentStatus === 'incomplete') {
            xpToAdd = AMENDMENT_XP;
        }
    } else if (earnedPercentage >= COMPLETED_PERCENTAGE) {
        newStatus = 'completed';
        if (currentStatus === 'incomplete') {
            xpToAdd = Math.floor(AMENDMENT_XP * COMPLETED_PERCENTAGE);
        }
    }
    
    // Update status if changed
    if (newStatus !== currentStatus && newStatus !== 'incomplete') {
        amendmentStatus[amendmentNumber] = newStatus;
        localStorage.setItem('amendmentStatus', JSON.stringify(amendmentStatus));
        
        // Award XP and show message
        if (xpToAdd > 0) {
            if (newStatus === 'completed') {
                alert(`Amendment ${amendmentNumber} completed! You earned ${xpToAdd} XP.`);
                
                // Trigger award event for amendment completion
                if (window.awardsSystem) {
                    window.awardsSystem.triggerAwardEvent('amendmentCompleted', amendmentNumber);
                }
            } else if (newStatus === 'mastered') {
                if (currentStatus === 'completed') {
                    alert(`Amendment ${amendmentNumber} mastered! You earned an additional ${xpToAdd} XP.`);
                } else {
                    alert(`Amendment ${amendmentNumber} mastered! You earned ${xpToAdd} XP.`);
                }
                
                // Trigger award event for amendment mastery
                if (window.awardsSystem) {
                    window.awardsSystem.triggerAwardEvent('amendmentMastered', amendmentNumber);
                }
            }
            updateXPDisplay(xpToAdd);
        }
    }
}

function updateXPDisplay(additionalXP) {
    if (isNaN(additionalXP)) return; // Allow updating even if additionalXP is 0 for initial load

    totalXP += additionalXP;
    // Save updated XP to localStorage
    localStorage.setItem('totalUserXP', totalXP);

    // Update XP badge
    let badge = document.querySelector('.xp-badge');
    if (badge) badge.textContent = `XP: ${totalXP}`;

    // Update header XP display
    let levelDisplay = document.getElementById('level-display');
    // Basic leveling example: Level up every 200 XP
    const level = Math.floor(totalXP / 200) + 1;
    if (levelDisplay) levelDisplay.textContent = `Level ${level} • ${totalXP} XP`;

    // Update progress bar (progress towards next level)
    let progressPercent = Math.min((totalXP % 200) / 200 * 100, 100);
    const progressBar = document.querySelector('.progress');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;

}


function showRetryMessage(actionId, earned, max) {
    // Remove any existing retry message first
    const existingMessage = document.querySelector('.retry-message');
    if (existingMessage) existingMessage.remove();

    // Create a retry message that fades out after a few seconds
    const message = document.createElement('div');
    message.className = 'retry-message';
    message.innerHTML = `You earned ${earned}/${max} XP. You can retry to earn full credit!`;
    document.body.appendChild(message);

    // Fade out after 5 seconds
    setTimeout(() => {
        message.style.transition = 'opacity 1s ease-out';
        message.style.opacity = '0';
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 1000); // Remove from DOM after fade out
    }, 5000);
}



// --- Initialize XP Display on Load ---
// Call updateXPDisplay with 0 additional XP to render the loaded totalXP value
updateXPDisplay(0);

// Initialize amendment status indicators

// Function to update amendment card status indicators on the home page
function updateAmendmentStatusIndicators() {
    // Only run on the home page
    if (!document.querySelector('.amendments-list')) return;
    
    // Loop through all amendment cards
    const cards = document.querySelectorAll('.amendment-card-home');
    cards.forEach(card => {
        // Get amendment number from the card's parent link
        const amendmentLink = card.closest('a');
        if (!amendmentLink) return;
        
        const hrefMatch = amendmentLink.href.match(/amendment=(\d+)/);
        if (!hrefMatch) return;
        
        const amendmentNumber = hrefMatch[1];
        const status = amendmentStatus[amendmentNumber];
        
        // Remove any existing status indicators
        const existingStatus = card.querySelector('.amendment-status');
        if (existingStatus) existingStatus.remove();
        
        // Add status indicator if completed or mastered
        if (status === 'completed' || status === 'mastered') {
            const statusDiv = document.createElement('div');
            statusDiv.className = `amendment-status ${status}`;
            
            // Different icon and text based on status
            if (status === 'completed') {
                statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> <span>Completed</span>';
            } else if (status === 'mastered') {
                statusDiv.innerHTML = '<i class="fas fa-star"></i> <span>Mastered</span>';
            }
            
            card.appendChild(statusDiv);
        }
    });
}

// Save quiz answers to localStorage
function saveQuizAnswers(amendmentNumber, answers) {
    try {
        // Load existing saved answers
        const savedQuizAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || {};
        // Update with new answers for this amendment
        savedQuizAnswers[amendmentNumber] = answers;
        // Save back to localStorage
        localStorage.setItem('quizAnswers', JSON.stringify(savedQuizAnswers));
    } catch (error) {
        console.error('Error saving quiz answers to localStorage:', error);
    }
}

// Load quiz answers from localStorage
function loadQuizAnswers(amendmentNumber) {
    try {
        const savedQuizAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || {};
        return savedQuizAnswers[amendmentNumber] || null;
    } catch (error) {
        console.error('Error loading quiz answers from localStorage:', error);
        return null;
    }
}
