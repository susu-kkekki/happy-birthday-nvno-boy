let currentStep = 0;
const totalSteps = 19;
const audioDelayTime = 15000; // 15 seconds sequence drop

// Generate a random target pattern across the 8 physical keys
let noteSequence = [];
for (let i = 0; i < totalSteps; i++) {
    noteSequence.push(Math.floor(Math.random() * 8));
}

let audioCtx = null;

// Initialize context and play notes dynamically via oscillator syntax
class SynthEngine {
    static init() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    static playNote(frequency) {
        this.init();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

// Highlights the key that needs to be pressed next
function setNextTargetKey() {
    // Clear any leftover highlights first
    document.querySelectorAll('.key').forEach(k => k.classList.remove('target-highlight'));
    
    if (currentStep < totalSteps) {
        const targetIndex = noteSequence[currentStep];
        const targetKeyElement = document.querySelector(`[data-key="${targetIndex}"]`);
        if (targetKeyElement) {
            targetKeyElement.classList.add('target-highlight');
        }
    }
}

function handleKeyClick(keyIndex) {
    // Break out if sequence is already done
    if (currentStep >= totalSteps) return;

    const targetIndex = noteSequence[currentStep];
    const keyElement = document.querySelector(`[data-key="${keyIndex}"]`);
    const noteFreq = parseFloat(keyElement.getAttribute('data-note'));

    // Play pitch regardless of choice so the keyboard remains highly responsive
    SynthEngine.playNote(noteFreq);

    if (keyIndex === targetIndex) {
        currentStep++;
        
        // Interface elements
        document.getElementById('step-counter').innerText = `STEPS: ${currentStep} / ${totalSteps}`;
        
        // Short feedback hit
        confetti({ particleCount: 5, spread: 20, colors: ['#ff007f'] });

        if (currentStep === totalSteps) {
            // Sequence complete! Clear target highlights and launch track
            document.querySelectorAll('.key').forEach(k => k.classList.remove('target-highlight'));
            startAudioEngine();
        } else {
            // Move target pointer forward
            setNextTargetKey();
        }
    }
}

function startAudioEngine() {
    const audio = document.getElementById('studio-beat');
    const statusText = document.getElementById('system-status');
    
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log("Playback engine verification error:", err));
    }
    
    if (statusText) {
        statusText.innerText = "STATUS: SEQUENCE COMPLETE // DROP BEAT";
        statusText.classList.add('playing');
    }
    
    setTimeout(mixdownComplete, audioDelayTime);
}

function mixdownComplete() {
    // Cut the audio instantly
    const audio = document.getElementById('studio-beat');
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    // Hide workspace layout panels
    document.getElementById('studio-header').classList.add('hidden-element');
    document.querySelector('.control-room').classList.add('hidden-element');

    // Reveal final blessing window
    const screen = document.getElementById('blessing-screen');
    screen.style.display = "flex";
    screen.classList.remove('hidden-element');
    screen.classList.add('fade-in-view');

    // Continuous track completion celebration loops
    let end = Date.now() + (3 * 1000);
    (function bounce() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff007f', '#00f3ff'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff007f', '#00f3ff'] });
        if (Date.now() < end) requestAnimationFrame(bounce);
    }());
}

// Initialize the loop engine once the structural frames load
window.onload = () => {
    setNextTargetKey();
};