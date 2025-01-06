let timeRemaining = 0;
let elapsedTime = 0; // Track elapsed time
let timer; // Reference to the interval

const timerDisplay = document.getElementById('timerDisplay');
const timeAllotted = document.getElementById('timeAllotted');
const task = document.getElementById('task');
const startButton = document.querySelector('.startButton');
const resetButton = document.querySelector('.resetButton');
const timerEndAudio = new Audio('/assets/timer-finish.mp3');
const dingAudio = new Audio('/assets/ding.mp3');

// Function to format time as mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update Timer Display
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
}

// Lock Input and Button
function lockControls() {
    timeAllotted.disabled = true; // Disable input
    task.disabled = true; // Disable task editing
    startButton.disabled = true; // Disable "Go" button
}

// Unlock Input and Button
function unlockControls() {
    timeAllotted.disabled = false; // Enable input
    task.disabled = false; // Enable task editing
    startButton.disabled = false; // Enable "Go" button
}

// Start Timer
function startTimer() {
    // Stop any ongoing timer
    if (timer) {
        clearInterval(timer);
    }

    // Convert minutes to seconds
    const maxTime = parseInt(timeAllotted.value, 10) * 60;
    if (isNaN(maxTime) || maxTime <= 0) {
        alert('Please enter a valid positive number.');
        return;
    }

    // Lock input and button
    lockControls();

    // Initialize timeRemaining and elapsedTime
    timeRemaining = maxTime;
    elapsedTime = 0;
    updateDisplay();

    // Start the countdown
    timer = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            elapsedTime++; // Increment elapsed time
            updateDisplay();
        } else {
            clearInterval(timer);
            timerEndAudio.play();
            alert('Time is up!');
            unlockControls(); // Unlock after timer finishes
        }
    }, 1000); // Update every second
}

// Reset Timer
function resetTimer() {
    clearInterval(timer);
    dingAudio.play();
    unlockControls(); // Unlock controls when timer is reset

    // Calculate and log time finished
    const timeFinishedIn = elapsedTime;
    getTaskInfo(timeFinishedIn);

    // Reset timer values
    timeRemaining = 0;
    elapsedTime = 0;
    updateDisplay();

    // Send data to server and save task in MongoDB
    saveTaskToDatabase(timeFinishedIn);
}

// Function to send task data to the server
async function saveTaskToDatabase(timeFinishedIn) {
    const taskData = {
        taskName: task.value,
        allottedTime: parseInt(timeAllotted.value, 10), // Allotted time in minutes
        timeFinishedIn: formatTime(timeFinishedIn), // Time finished in mm:ss format
        userId: userId // Add the userId to assign the task to the specific user
    };

    try {
        const response = await fetch('/tasks/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData), // Send task data as JSON
        });

        if (response.ok) {
            console.log('Task saved successfully');
        } else {
            console.log('Failed to save task');
        }
    } catch (err) {
        console.error('Error saving task:', err);
    }
}

function getTaskInfo(timeFinishedIn) {
    const formattedTime = formatTime(timeFinishedIn); // Format elapsed time
    console.log('Task:', task.value);
    console.log('Time Allotted (minutes):', timeAllotted.value);
    console.log('Time Finished In (mm:ss):', formattedTime);
}


