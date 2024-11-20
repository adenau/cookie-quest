import config from './config/gameConfig.json';
 
class UIDisplay {
    constructor(gameState) {
        this.gameState = gameState;
        this.createUI();
        this.setupEventListeners();
        this.gameState.addListener((state, event) => {
            this.updateUI();
            if (event === 'levelUp') {
                this.showLevelUpNotification(state.level);
            }
        });
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'uiContainer';
        document.body.appendChild(this.container);

        // Create title
        this.title = document.createElement('div');
        this.title.id = 'gameTitle';
        this.title.textContent = 'Cookie Quest';
        this.container.appendChild(this.title);

        // Create stats container
        this.ui = document.createElement('div');
        this.ui.id = 'ui';
        this.container.appendChild(this.ui);

        // Create level container
        this.levelContainer = document.createElement('div');
        this.levelContainer.id = 'levelContainer';
        this.container.appendChild(this.levelContainer);

        // Create button container
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.id = 'buttonContainer';
        this.container.appendChild(this.buttonContainer);

        // Create buy button
        this.buyButton = document.createElement('button');
        this.buyButton.id = 'buyButton';
        this.buyButton.innerHTML = '🏭 Buy Cookie Factory';
        this.buttonContainer.appendChild(this.buyButton);

        // Add instructions
        this.instructions = document.createElement('div');
        this.instructions.id = 'instructions';
        this.instructions.textContent = config.strings.instructions;
        this.container.appendChild(this.instructions);

        // Add reset button
        this.resetButton = document.createElement('button');
        this.resetButton.id = 'resetButton';
        this.resetButton.innerHTML = config.strings.resetGame;
        this.buttonContainer.appendChild(this.resetButton);

        this.addStyles();
        this.updateUI();
    }

    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            #uiContainer {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
                user-select: none;
            }

            #gameTitle {
                position: absolute;
                top: 20px;
                left: 20px;
                color: #FFD700;
                font-family: 'Arial', sans-serif;
                font-size: 32px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            }

            #ui {
                position: absolute;
                top: 20px;
                right: 20px;
                color: white;
                font-family: 'Arial', sans-serif;
                font-size: 18px;
                text-align: right;
                background: rgba(0, 0, 0, 0.5);
                padding: 15px;
                border-radius: 10px;
                min-width: 200px;
            }

            #levelContainer {
                position: absolute;
                top: 160px;
                right: 20px;
                color: white;
                font-family: 'Arial', sans-serif;
                font-size: 18px;
                text-align: right;
                background: rgba(0, 0, 0, 0.5);
                padding: 15px;
                border-radius: 10px;
                min-width: 200px;
            }

            #buttonContainer {
                position: absolute;
                top: 280px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: auto;
            }

            #buyButton {
                padding: 10px 20px;
                font-size: 16px;
                color: white;
                background: linear-gradient(to bottom, #4CAF50, #45a049);
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: transform 0.1s, background 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            #buyButton:hover {
                transform: scale(1.05);
                background: linear-gradient(to bottom, #45a049, #409344);
            }

            #buyButton:active {
                transform: scale(0.95);
            }

            #progressBar {
                width: 100%;
                height: 10px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 5px;
                margin-top: 10px;
                overflow: hidden;
            }

            #progressBarFill {
                height: 100%;
                background: #FFD700;
                width: 0%;
                transition: width 0.3s ease;
            }

            .level-up-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: #FFD700;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                animation: fadeInOut 2s ease forwards;
                z-index: 1000;
                pointer-events: none;
            }

            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                20% { transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; }
                100% { opacity: 0; }
            }
            #instructions {
                position: absolute;
                left: 50%;
                top: 60%;
                transform: translateX(-50%);
                color: white;
                font-family: 'Arial', sans-serif;
                font-size: 18px;
                text-align: center;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                white-space: pre-line;
                pointer-events: none;
            }

            #resetButton {
                padding: 10px 20px;
                font-size: 16px;
                color: white;
                background: linear-gradient(to bottom, ${config.ui.colors.danger}, #c82333);
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: transform 0.1s, background 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                margin-top: 10px;
            }

            #resetButton:hover {
                transform: scale(1.05);
                background: linear-gradient(to bottom, #c82333, #bd2130);
            }

            #resetButton:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(styles);
    }

    showLevelUpNotification(level) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <h2>🎉 Level Up! 🎉</h2>
            <p>You reached level ${level}!</p>
            <p>New cookies per click: ${config.levels[level - 1].reward.cookiesPerClick}</p>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    updateUI() {
        const state = this.gameState.getState();
        this.ui.innerHTML = `
            <div style="margin-bottom: 8px;">🍪 ${state.cookies.toLocaleString()} ${config.strings.stats.cookies}</div>
            <div style="margin-bottom: 8px;">${config.strings.stats.perClick}: ${state.cookiesPerClick}</div>
            <div style="margin-bottom: 8px;">🏭 ${config.strings.stats.factories}: ${state.autoClickers}</div>
            <div>${config.strings.stats.nextFactory}: ${state.autoClickerCost.toLocaleString()}</div>
        `;

        this.levelContainer.innerHTML = `
            <div>Level ${state.level}</div>
            <div style="font-size: 14px; opacity: 0.8;">
                ${state.cookies.toLocaleString()} / ${state.nextLevelRequirement.toLocaleString()} cookies
            </div>
            <div id="progressBar">
                <div id="progressBarFill" style="width: ${(state.progress * 100).toFixed(1)}%"></div>
            </div>
        `;
    }

    setupEventListeners() {
        this.buyButton.addEventListener('click', () => {
            this.gameState.purchaseAutoClicker();
        });

        this.resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
                this.gameState.reset();
            }
        });
    }

}

export default UIDisplay;