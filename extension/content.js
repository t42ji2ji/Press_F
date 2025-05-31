// Track the currently hovered tweet
let hoveredTweet = null;

// Create and inject the overlay element
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'press-f-overlay';
    overlay.innerHTML = '<div class="press-f-text">Press F to Pay Respects</div>';
    document.body.appendChild(overlay);
    return overlay;
}

// Create and inject the vignette
function createVignette() {
    const vignette = document.createElement('div');
    vignette.className = 'vignette';
    document.body.appendChild(vignette);
    return vignette;
}

// Create and inject the particles
function createParticles() {
    const container = document.createElement('div');
    container.className = 'particles';
    
    // Create 12 larger particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        // Random starting position
        particle.style.left = `${Math.random() * 100}%`;
        // Random delay
        particle.style.animationDelay = `${Math.random() * 4}s`;
        container.appendChild(particle);
    }
    
    document.body.appendChild(container);
    return container;
}

// Create and inject the holy flash element
function createHolyFlash() {
    const flash = document.createElement('div');
    flash.className = 'holy-flash';
    document.body.appendChild(flash);
    return flash;
}

// Create and inject the salute GIF element
function createSaluteGif() {
    const gif = document.createElement('img');
    gif.className = 'salute-gif';
    gif.src = 'https://media.giphy.com/media/3o7TKqnN349PBUtGFK/giphy.gif'; // Salute GIF
    document.body.appendChild(gif);
    return gif;
}

// Show the overlay animation
function showOverlay() {
    const overlay = document.querySelector('.press-f-overlay') || createOverlay();
    const vignette = document.querySelector('.vignette') || createVignette();
    const particles = document.querySelector('.particles') || createParticles();
    
    overlay.classList.add('active');
    vignette.classList.add('active');
    particles.classList.add('active');
}

// Hide the overlay animation
function hideOverlay() {
    const overlay = document.querySelector('.press-f-overlay');
    const vignette = document.querySelector('.vignette');
    const particles = document.querySelector('.particles');
    
    if (overlay) overlay.classList.remove('active');
    if (vignette) vignette.classList.remove('active');
    if (particles) particles.classList.remove('active');
}

// Show the holy flash effect
function showHolyFlash() {
    const flash = document.querySelector('.holy-flash') || createHolyFlash();
    flash.classList.add('active');
    
    // Remove the active class after animation completes
    setTimeout(() => {
        flash.classList.remove('active');
    }, 200);
}

// Show the salute GIF animation
function showSaluteGif() {
    const gif = document.querySelector('.salute-gif') || createSaluteGif();
    gif.style.left = `${window.innerWidth / 2 - 50}px`; // Center horizontally
    gif.style.top = `${window.innerHeight / 2 - 50}px`; // Center vertically
    gif.classList.add('active');
    
    // Remove the active class after animation completes
    setTimeout(() => {
        gif.classList.remove('active');
    }, 2000); // GIF duration
}

// Function to simulate typing text
function simulateTyping(element, text) {
    // Focus the element
    element.focus();
    
    // Create a new range
    const range = document.createRange();
    const selection = window.getSelection();
    
    // Set the range to the end of the element
    range.selectNodeContents(element);
    range.collapse(false);
    
    // Set the selection
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Insert the text
    document.execCommand('insertText', false, text);
    
    // Trigger necessary events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Force Twitter's internal state update
    const event = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        key: 'a' // This will trigger Twitter's input validation
    });
    element.dispatchEvent(event);
}

// Function to handle tweet hover
function handleTweetHover(event) {
    // Find the closest article element (tweet)
    const tweet = event.target.closest('article');
    
    // Remove highlight from previous tweet if exists
    if (hoveredTweet && hoveredTweet !== tweet) {
        hoveredTweet.style.border = '';
        hoveredTweet.style.backgroundColor = '';
        hoveredTweet.style.transition = '';
        hideOverlay();
    }
    
    if (tweet) {
        hoveredTweet = tweet;
        // Add highlight effect
        tweet.style.border = '2px solid #1DA1F2';
        tweet.style.backgroundColor = 'rgba(29, 161, 242, 0.05)';
        tweet.style.transition = 'all 0.2s ease';
        
        // Add glow effect
        let glow = tweet.querySelector('.tweet-glow');
        if (!glow) {
            glow = document.createElement('div');
            glow.className = 'tweet-glow';
            tweet.appendChild(glow);
        }
        glow.classList.add('active');
        
        showOverlay(); // Show the "Press F" text and effects
        console.log('Hovering over tweet:', tweet);
    }
}

// Function to handle the F key press
function handleKeyPress(event) {
    // Check if F key was pressed
    if (event.key.toLowerCase() === 'f') {
        // If Command (Meta) key is pressed, handle reply
        if (event.metaKey && hoveredTweet) {
            console.log('Command+F pressed, attempting to reply to tweet');
            
            try {
                // Find and click the reply button - try multiple possible selectors
                const replyButton = hoveredTweet.querySelector('[data-testid="reply"]') || 
                                  hoveredTweet.querySelector('[aria-label="Reply"]') ||
                                  hoveredTweet.querySelector('div[role="button"][aria-label*="Reply"]');
                
                if (replyButton) {
                    console.log('Found reply button, clicking...');
                    replyButton.click();

                    // Wait for the reply input to appear and then insert text
                    setTimeout(() => {
                        const replyInput = document.querySelector('div[role="textbox"]') ||
                                         document.querySelector('[data-testid="tweetTextarea_0"]');
                        
                        if (replyInput) {
                            console.log('Found reply input, inserting text...');
                            simulateTyping(replyInput, '@payrespectbot');

                            // Wait a moment for the reply button to become enabled
                            setTimeout(() => {
                                // Find and click the reply button in the reply dialog
                                const sendButton = document.querySelector('[data-testid="tweetButton"]') ||
                                                 document.querySelector('[data-testid="tweetButtonInline"]');
                                
                                if (sendButton) {
                                    console.log('Found send button, clicking...');
                                    sendButton.click();
                                    console.log('Reply sent successfully');
                                } else {
                                    console.error('Could not find send button');
                                }
                            }, 1000); // Increased delay to ensure typing is complete
                        } else {
                            console.error('Could not find reply input box');
                        }
                    }, 500);
                } else {
                    console.error('Could not find reply button');
                }
            } catch (error) {
                console.error('Error in Press F extension:', error);
            }
        } else if (hoveredTweet) {
            // Just F key pressed, show gold border animation
            hoveredTweet.style.border = 'none'; // Remove blue border
            
            // Add rotating border effect
            let border = hoveredTweet.querySelector('.tweet-border');
            if (!border) {
                border = document.createElement('div');
                border.className = 'tweet-border';
                hoveredTweet.appendChild(border);
            }
            border.classList.add('active');
            
            // Remove the gold border after animation
            setTimeout(() => {
                border.classList.remove('active');
                hoveredTweet.style.border = '2px solid #1DA1F2'; // Restore blue border
            }, 1000); // Show gold border for 1 second
        }
    }
}

// Add event listeners when the page loads
document.addEventListener('mouseover', handleTweetHover);
document.addEventListener('keydown', handleKeyPress);

// Log that the extension is active
console.log('Press F extension is active on', window.location.hostname); 