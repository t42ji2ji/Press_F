// Get ethers from the globally available object
const loadEthers = async () => {
    try {
        if (typeof ethers === 'undefined') {
            throw new Error('Ethers.js not found');
        }
        console.log('Ethers.js loaded successfully');
        return ethers;
    } catch (error) {
        console.error('Failed to load ethers.js:', error);
        return null;
    }
};

// Contract ABI
const CONTRACT_ABI = [
    {
        "type": "function",
        "name": "getTokenByXUrl",
        "inputs": [
            {
                "name": "xUrl",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct TokenFactory.TokenStructure",
                "components": [
                    {
                        "name": "tokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenName",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "tokenSymbol",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "totalSupply",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "xUrl",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "xUser",
                        "type": "string",
                        "internalType": "string"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    }
];

// Contract address
const CONTRACT_ADDRESS = "0xe7D3930eabD922202B7f9C11084AB4D91444Ba2A";

// Initialize contract
let contract = null;
let provider = null;

// Function to initialize the contract
const initializeContract = async () => {
    const ethers = await loadEthers();
    if (!ethers) {
        console.error('Failed to load ethers.js');
        return;
    }

    try {
        // Use Optimism Sepolia RPC endpoint
        const optimismSepoliaUrl = 'https://sepolia.optimism.io';
        console.log('Attempting to connect to Optimism Sepolia:', optimismSepoliaUrl);
        
        provider = new ethers.providers.JsonRpcProvider(optimismSepoliaUrl);
        
        // Test the connection by getting the latest block number
        const blockNumber = await provider.getBlockNumber();
        console.log('Successfully connected to Optimism Sepolia. Latest block:', blockNumber);
        
        // Create contract instance
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        console.log('Contract initialized successfully:', contract);
        
        // Test the contract connection
        const network = await provider.getNetwork();
        console.log('Connected to network:', network);
    } catch (error) {
        console.error('Failed to initialize contract. Full error:', error);
        if (error.code === 'NETWORK_ERROR') {
            console.error('Network error details:', {
                message: error.message,
                code: error.code,
                event: error.event
            });
        }
    }
};

// Track the currently hovered tweet
let hoveredTweet = null;
let activityLog = null;
let tokenInfo = null;
let fPressCount = 0;
let lastMessageIndex = -1;
let simulationInterval = null;
let hoverTimeout = null;

// Cache for token data
const tokenDataCache = new Map();
// Track last contract call times
const lastCallTimes = new Map();
const CALL_COOLDOWN = 10000; // 10 seconds in milliseconds

// Array of message variations for F press
const fPressMessages = [
    "You put your hands together in solemn prayer.",
    "You bow your head in respect.",
    "You close your eyes and take a moment of silence.",
    "You whisper a quiet prayer.",
    "You light a virtual candle in remembrance.",
    "You stand in silent tribute.",
    "You offer your deepest condolences.",
    "You take a moment to reflect.",
    "You send your thoughts and prayers.",
    "You honor the memory with reverence.",
    "You pay your respects with dignity.",
    "You observe a moment of silence.",
    "You offer a solemn salute.",
    "You bow in silent tribute.",
    "You light incense in remembrance.",
    "You offer a prayer for peace.",
    "You stand in quiet reverence.",
    "You send your deepest sympathies.",
    "You honor with solemn dignity.",
    "You pay tribute with respect."
];

// Array of random usernames for simulation
const randomUsernames = [
    "@cryptoelephant",
    "@vibechad",
    "@degenoracle",
    "@airdropalpaca",
    "@satoshisbarista",
    "@rektferret",
    "@yieldwitch",
    "@txsniper",
    "@bagholder99",
    "@fomo_penguin",
    "@mintycoffeebean",
    "@soltrader420",
    "@gasfeeghost",
    "@gmfrogtown",
    "@evmtoad",
    "@layerzerohero",
    "@zkwizard",
    "@fungifisher",
    "@basedmosquito",
    "@tokenbae",
    "@rollupuncle",
    "@mempoolmonk",
    "@frenzone",
    "@bridgeburner",
    "@rugpullricky",
    "@notfinancialadvice",
    "@web3wombat",
    "@pumpcat69",
    "@dappdad",
    "@pepecurator"
];

// Create and inject the token info panel
function createTokenInfo() {
    if (!tokenInfo) {
        tokenInfo = document.createElement('div');
        tokenInfo.className = 'token-info';
        tokenInfo.innerHTML = `
            <div class="token-info-header">Token Info</div>
            <div class="token-info-content">
                <div class="token-info-row">
                    <span class="token-info-label">Name</span>
                    <span class="token-info-value">N/A</span>
                </div>
                <div class="token-info-row">
                    <span class="token-info-label">Ticker</span>
                    <span class="token-info-value">N/A</span>
                </div>
                <div class="token-info-row">
                    <span class="token-info-label">Contract</span>
                    <span class="token-info-value contract">N/A</span>
                </div>
                <div class="token-info-row">
                    <span class="token-info-label">Respects</span>
                    <span class="token-info-value respects">0</span>
                </div>
            </div>
        `;
        document.body.appendChild(tokenInfo);
    }
    return tokenInfo;
}

// Create and inject the overlay element
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'press-f-overlay';
    
    // Get the image URLs
    const salute1Url = chrome.runtime.getURL('images/salute1.png');
    const salute2Url = chrome.runtime.getURL('images/salute2.png');
    
    // Set the CSS variables for the image URLs
    document.documentElement.style.setProperty('--salute1-url', `url('${salute1Url}')`);
    document.documentElement.style.setProperty('--salute2-url', `url('${salute2Url}')`);
    
    overlay.innerHTML = `
        <div class="salute-sprite" style="background-image: var(--salute1-url)"></div>
        <div class="press-f-text">Press <span class="f-key">F</span> to Create Token</div>
    `;
    document.body.appendChild(overlay);
    
    const sprite = overlay.querySelector('.salute-sprite');
    return overlay;
}

// Function to handle tweet hover with debounce
function handleTweetHover(event) {
    // Clear any existing timeout
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
    }

    // Set a new timeout
    hoverTimeout = setTimeout(() => {
        // Find the closest article element (tweet)
        const tweet = event.target.closest('article');
        
        // Update vignette position
        const vignette = document.querySelector('.vignette');
        if (vignette) {
            const rect = tweet ? tweet.getBoundingClientRect() : null;
            if (rect) {
                const x = (rect.left + rect.right) / 2;
                const y = (rect.top + rect.bottom) / 2;
                vignette.style.setProperty('--mouse-x', `${x}px`);
                vignette.style.setProperty('--mouse-y', `${y}px`);
            }
        }
        
        // Remove highlight from previous tweet if exists
        if (hoveredTweet && hoveredTweet !== tweet) {
            hoveredTweet.style.border = '';
            hoveredTweet.style.backgroundColor = '';
            hoveredTweet.style.transition = '';
            hoveredTweet.style.animation = '';
            hideOverlay();
            resetActivityLog(); // Reset activity log when hovering away
            stopSimulation(); // Stop simulation when hovering away
        }
        
        if (tweet) {
            hoveredTweet = tweet;
            // Add highlight effect
            tweet.style.border = '2px solid #1DA1F2';
            tweet.style.backgroundColor = 'rgba(29, 161, 242, 0.05)';
            tweet.style.transition = 'all 0.2s ease';
            tweet.style.animation = 'pulseBorder 2s infinite';
            
            // Add glow effect
            let glow = tweet.querySelector('.tweet-glow');
            if (!glow) {
                glow = document.createElement('div');
                glow.className = 'tweet-glow';
                tweet.appendChild(glow);
            }
            glow.classList.add('active');
            
            // Update token info
            updateTokenInfo(tweet);
            
            showOverlay(); // Show the "Press F" text and effects
        }
    }, 150); // 150ms debounce
}

// Update token info with tweet data
async function updateTokenInfo(tweet) {
    const tokenInfo = createTokenInfo();
    const overlay = document.querySelector('.press-f-overlay') || createOverlay();
    
    try {
        // Get the tweet URL from the tweet element's href
        const tweetLink = tweet.querySelector('a[href*="/status/"]');
        if (!tweetLink) {
            console.error('Could not find tweet link');
            throw new Error('Invalid tweet element');
        }
        
        // Get the full URL from the href attribute
        const tweetUrl = tweetLink.href;

        // Check cooldown first
        const lastCallTime = lastCallTimes.get(tweetUrl) || 0;
        const timeSinceLastCall = Date.now() - lastCallTime;
        
        if (timeSinceLastCall < CALL_COOLDOWN) {
            // Use cached data if available during cooldown
            if (tokenDataCache.has(tweetUrl)) {
                const cachedData = tokenDataCache.get(tweetUrl);
                if (cachedData === null) {
                    throw new Error('No token (cached)');
                }
                return handleTokenData(cachedData, tokenInfo, overlay);
            }
            throw new Error('In cooldown period');
        }
        
        // Check cache
        let tokenData;
        if (tokenDataCache.has(tweetUrl)) {
            console.log('Using cached token data');
            tokenData = tokenDataCache.get(tweetUrl);
            if (tokenData === null) {
                throw new Error('No token (cached)');
            }
        } else {
            try {
                // Call the contract to get token info
                tokenData = await contract.getTokenByXUrl(tweetUrl);
                // Cache the successful result
                tokenDataCache.set(tweetUrl, tokenData);
                // Update last call time
                lastCallTimes.set(tweetUrl, Date.now());
            } catch (error) {
                // Cache the failed result
                tokenDataCache.set(tweetUrl, null);
                // Update last call time even for failed calls
                lastCallTimes.set(tweetUrl, Date.now());
                throw error;
            }
        }
        
        return handleTokenData(tokenData, tokenInfo, overlay);
    } catch (error) {
        handleNoToken(tokenInfo, overlay);
    }
}

// Helper function to handle token data
function handleTokenData(tokenData, tokenInfo, overlay) {
    
    // Update the token info panel with real data
    const nameValue = tokenInfo.querySelector('.token-info-row:nth-child(1) .token-info-value');
    const tickerValue = tokenInfo.querySelector('.token-info-row:nth-child(2) .token-info-value');
    const contractValue = tokenInfo.querySelector('.token-info-row:nth-child(3) .token-info-value');
    const respectsValue = tokenInfo.querySelector('.token-info-row:nth-child(4) .token-info-value');
    
    if (!nameValue || !tickerValue || !contractValue || !respectsValue) {
        console.error('Could not find token info elements');
        throw new Error('Token info elements not found');
    }
    
    nameValue.textContent = tokenData.tokenName;
    tickerValue.textContent = `$${tokenData.tokenSymbol}`;
    contractValue.textContent = `${tokenData.tokenAddress.slice(0, 6)}...${tokenData.tokenAddress.slice(-4)}`;
    respectsValue.textContent = fPressCount;

    // Update overlay text for token existence
    overlay.innerHTML = `
        <div class="salute-sprite" style="background-image: var(--salute1-url)"></div>
        <div class="press-f-text">Press <span class="f-key">F</span> to Pay Respects</div>
    `;
    
    // Start simulation only if we have a token
    stopSimulation(); // Ensure any existing simulation is stopped
    startSimulation();
}

// Helper function to handle no token case
function handleNoToken(tokenInfo, overlay) {
    const nameValue = tokenInfo.querySelector('.token-info-row:nth-child(1) .token-info-value');
    const tickerValue = tokenInfo.querySelector('.token-info-row:nth-child(2) .token-info-value');
    const contractValue = tokenInfo.querySelector('.token-info-row:nth-child(3) .token-info-value');
    const respectsValue = tokenInfo.querySelector('.token-info-row:nth-child(4) .token-info-value');
    
    if (nameValue) nameValue.textContent = 'No Token';
    if (tickerValue) tickerValue.textContent = 'N/A';
    if (contractValue) contractValue.textContent = 'N/A';
    if (respectsValue) respectsValue.textContent = '0';

    // Update overlay text for no token
    overlay.innerHTML = `
        <div class="press-f-text">Press <span class="f-key">F</span> to Create Token</div>
    `;
    
    // Stop simulation for no token
    stopSimulation();
}

// Create and inject the activity log
function createActivityLog() {
    if (!activityLog) {
        activityLog = document.createElement('div');
        activityLog.className = 'activity-log';
        activityLog.innerHTML = '<div class="activity-log-header">Activity Log</div>';
        document.body.appendChild(activityLog);
    }
    return activityLog;
}

// Reset activity log
function resetActivityLog() {
    if (activityLog) {
        activityLog.innerHTML = '<div class="activity-log-header">Activity Log</div>';
        fPressCount = 0;
        lastMessageIndex = -1;
    }
}

// Get a random message that's different from the last one
function getRandomMessage() {
    let index;
    do {
        index = Math.floor(Math.random() * fPressMessages.length);
    } while (index === lastMessageIndex && fPressMessages.length > 1);
    lastMessageIndex = index;
    return fPressMessages[index];
}

// Add an entry to the activity log
function addActivityLogEntry(message, isFPress = false, isRespectMessage = false) {
    const log = createActivityLog();
    
    if (isFPress) {
        // Add F press entry
        const fEntry = document.createElement('div');
        fEntry.className = 'activity-entry f-press';
        fEntry.textContent = 'F';
        log.insertBefore(fEntry, log.firstChild.nextSibling);
        
        // Add message entry
        const messageEntry = document.createElement('div');
        messageEntry.className = 'activity-entry respect-message';
        messageEntry.textContent = message;
        log.insertBefore(messageEntry, log.firstChild.nextSibling);
    } else {
        // Add regular entry
        const entry = document.createElement('div');
        entry.className = 'activity-entry';
        entry.textContent = message;
        log.insertBefore(entry, log.firstChild.nextSibling);
    }
    
    // Keep only the last 10 entries (5 pairs of F + message)
    const entries = log.querySelectorAll('.activity-entry');
    if (entries.length > 10) {
        entries[entries.length - 1].remove();
        entries[entries.length - 2].remove();
    }
}

// Create and inject the vignette
function createVignette() {
    const vignette = document.createElement('div');
    vignette.className = 'vignette';
    document.body.appendChild(vignette);
    return vignette;
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
    const activityLog = document.querySelector('.activity-log') || createActivityLog();
    const tokenInfo = document.querySelector('.token-info') || createTokenInfo();
    
    overlay.classList.add('active');
    vignette.classList.add('active');
    activityLog.classList.add('active');
    tokenInfo.classList.add('active');
}

// Hide the overlay animation
function hideOverlay() {
    const overlay = document.querySelector('.press-f-overlay');
    const vignette = document.querySelector('.vignette');
    const activityLog = document.querySelector('.activity-log');
    const tokenInfo = document.querySelector('.token-info');
    
    if (overlay) overlay.classList.remove('active');
    if (vignette) vignette.classList.remove('active');
    if (activityLog) activityLog.classList.remove('active');
    if (tokenInfo) tokenInfo.classList.remove('active');
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

// Function to simulate other users pressing F
function simulateOtherUserPress() {
    if (!hoveredTweet) return;
    
    // Get random username
    const username = randomUsernames[Math.floor(Math.random() * randomUsernames.length)];
    
    // Flash the border
    hoveredTweet.style.animation = 'flashBorder 0.3s ease-out';
    setTimeout(() => {
        hoveredTweet.style.animation = '';
    }, 300);
    
    // Update respects count
    fPressCount++;
    const respectsValue = document.querySelector('.token-info-value.respects');
    if (respectsValue) {
        respectsValue.textContent = fPressCount;
    }
    
    // Add to activity log
    addActivityLogEntry(`${username} paid their respects.`);
}

// Function to start simulation
function startSimulation() {
    // Clear any existing interval
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
    
    // Start new simulation - random interval between 0.67-1.67 seconds
    simulationInterval = setInterval(() => {
        if (Math.random() < 0.7) { // 70% chance to trigger
            simulateOtherUserPress();
        }
    }, Math.random() * 1000 + 667); // Random interval between 0.67-1.67 seconds
}

// Function to stop simulation
function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

// Function to handle the F key press
function handleKeyPress(event) {
    // Check if F key was pressed
    if (event.key.toLowerCase() === 'f' && hoveredTweet) {
        // Get the current state from the overlay text
        const overlay = document.querySelector('.press-f-overlay');
        const isTokenExists = overlay && overlay.textContent.includes('Pay Respects');

        // Flash the instruction box
        if (overlay) {
            overlay.classList.add('flash');
            setTimeout(() => {
                overlay.classList.remove('flash');
            }, 300);
        }

        if (isTokenExists) {
            // F key pressed for existing token, show gold border animation
            fPressCount++;
            addActivityLogEntry(getRandomMessage(), true);
            
            // Update respects count in token info
            const respectsValue = document.querySelector('.token-info-value.respects');
            if (respectsValue) {
                respectsValue.textContent = fPressCount;
            }
            
            // Apply the flash animation directly to the tweet
            hoveredTweet.style.animation = 'flashBorder 0.3s ease-out';
            
            // Trigger salute animation
            const saluteSprite = overlay.querySelector('.salute-sprite');
            if (saluteSprite) {
                saluteSprite.style.backgroundImage = 'var(--salute2-url)';
                setTimeout(() => {
                    saluteSprite.style.backgroundImage = 'var(--salute1-url)';
                }, 300);
            }
            
            // Remove the animation after it completes and restore the pulse
            setTimeout(() => {
                hoveredTweet.style.animation = 'pulseBorder 2s infinite';
            }, 300);
        } else {
            // F key pressed for no token, initiate token creation
            console.log('F pressed, attempting to create token');
            addActivityLogEntry('Initiating token creation...');
            
            // Get the tweet URL and clear its cache
            const tweetLink = hoveredTweet.querySelector('a[href*="/status/"]');
            if (tweetLink) {
                const tweetUrl = tweetLink.href;
                tokenDataCache.delete(tweetUrl);
            }
            
            try {
                // Find and click the reply button
                const replyButton = hoveredTweet.querySelector('[data-testid="reply"]') || 
                                  hoveredTweet.querySelector('[aria-label="Reply"]') ||
                                  hoveredTweet.querySelector('div[role="button"][aria-label*="Reply"]');
                
                if (replyButton) {
                    replyButton.click();

                    // Wait for the reply input to appear and then insert text
                    setTimeout(() => {
                        const replyInput = document.querySelector('div[role="textbox"]') ||
                                         document.querySelector('[data-testid="tweetTextarea_0"]');
                        
                        if (replyInput) {
                            simulateTyping(replyInput, '@payrespectsbot');

                            // Wait a moment for the reply button to become enabled
                            setTimeout(() => {
                                // Find and click the reply button in the reply dialog
                                const sendButton = document.querySelector('[data-testid="tweetButton"]') ||
                                                 document.querySelector('[data-testid="tweetButtonInline"]');
                                
                                if (sendButton) {
                                    sendButton.click();

                                    
                                    // After sending the reply, wait a moment and then recheck the token
                                    setTimeout(() => {
                                        updateTokenInfo(hoveredTweet);
                                    }, 2000);
                                } else {
                                    console.error('Could not find send button');
                                }
                            }, 1000);
                        }
                    }, 500);
                }
            } catch (error) {
                console.error('Error in Press F extension:', error);
            }
        }
    }
}

// Add event listeners when the page loads
document.addEventListener('mouseover', handleTweetHover);
document.addEventListener('keydown', handleKeyPress);

// Initialize contract when extension loads
initializeContract().then(() => {
    console.log('Press F extension is active on', window.location.hostname);
}).catch(error => {
    console.error('Failed to initialize contract:', error);
});

// Add the new pulse animation style and font
const style = document.createElement('style');
style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');

    @keyframes pulseBorder {
        0% {
            border-color: #1DA1F2;
            box-shadow: 0 0 0 0 rgba(29, 161, 242, 0.4);
        }
        70% {
            border-color: #1DA1F2;
            box-shadow: 0 0 0 10px rgba(29, 161, 242, 0);
        }
        100% {
            border-color: #1DA1F2;
            box-shadow: 0 0 0 0 rgba(29, 161, 242, 0);
        }
    }
    
    @keyframes flashBorder {
        0% {
            border-color: #1DA1F2;
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.8);
        }
        50% {
            border-color: #FFD700;
            box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.4);
        }
        100% {
            border-color: #1DA1F2;
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
        }
    }

    .press-f-overlay {
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.7);
        padding: 8px 40px;
        border-radius: 10px;
        min-width: 300px;
        height: 40px;
        line-height: 40px;
        border: 2px solid #1DA1F2;
        transition: all 0.2s ease;
    }

    .salute-sprite {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 120px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: background-image 0.1s ease;
    }

    .salute-sprite.salute {
        background-image: var(--salute2-url);
    }

    .press-f-overlay.flash {
        animation: flashBorder 0.3s ease-out;
    }

    .press-f-text {
        font-family: 'Silkscreen', monospace;
        font-size: 24px;
        color: #1DA1F2;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        text-align: center;
        white-space: nowrap;
        margin: 0;
        padding: 0;
    }

    .press-f-text .f-key {
        color: #FFD700;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(255, 215, 0, 0.3);
    }
`;
document.head.appendChild(style); 