import config from './config/gameConfig.json';
import './styles/ui.css';

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
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'uiContainer';
        document.body.appendChild(this.container);

        // Game title
        this.title = document.createElement('div');
        this.title.id = 'gameTitle';
        this.title.textContent = config.strings.title;
        this.container.appendChild(this.title);

        // Stats container
        this.ui = document.createElement('div');
        this.ui.id = 'ui';
        this.container.appendChild(this.ui);

        // Level container
        this.levelContainer = document.createElement('div');
        this.levelContainer.id = 'levelContainer';
        this.container.appendChild(this.levelContainer);

        // Instructions
        this.instructions = document.createElement('div');
        this.instructions.id = 'instructions';
        this.instructions.textContent = config.strings.instructions;
        this.container.appendChild(this.instructions);

        // Button container
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.id = 'buttonContainer';
        this.container.appendChild(this.buttonContainer);

        // Game buttons
        this.createButton('buyButton', config.strings.buyFactory);
        this.createButton('saveButton', config.strings.saveGame);
        this.createButton('loadButton', config.strings.loadGame);
        this.createButton('resetButton', config.strings.resetGame);

        this.updateUI();
    }

    createButton(id, text) {
        const button = document.createElement('button');
        button.id = id;
        button.className = 'game-button';
        button.innerHTML = text;
        this.buttonContainer.appendChild(button);
        return button;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<div class="message">${message}</div>`;
        document.body.appendChild(notification);

        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    updateUI() {
        const state = this.gameState.getState();
        
        // Update stats
        this.ui.innerHTML = `
            <div class="stat-row">🍪 ${state.cookies.toLocaleString()} ${config.strings.stats.cookies}</div>
            <div class="stat-row">${config.strings.stats.perClick}: ${state.cookiesPerClick}</div>
            <div class="stat-row">🏭 ${config.strings.stats.factories}: ${state.autoClickers}</div>
            <div class="stat-row">${config.strings.stats.nextFactory}: ${state.autoClickerCost.toLocaleString()}</div>
        `;

        // Update level info
        this.levelContainer.innerHTML = `
            <div>${config.strings.stats.level} ${state.level}</div>
            <div class="progress-text">
                ${state.cookies.toLocaleString()} / ${state.nextLevelRequirement.toLocaleString()} cookies
            </div>
            <div id="progressBar">
                <div id="progressBarFill" style="width: ${(state.progress * 100).toFixed(1)}%"></div>
            </div>
        `;
    }

    showLevelUpNotification(level) {
        const notification = document.createElement('div');
        notification.className = 'notification success level-up';
        notification.innerHTML = `
            <div class="message">
                <div class="notification-title">${config.strings.levelUp.title}</div>
                <div>${config.strings.levelUp.reached} ${level}!</div>
                <div>${config.strings.levelUp.newCookiesPerClick} ${config.levels[level - 1].reward.cookiesPerClick}</div>
            </div>
        `;
        document.body.appendChild(notification);

        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    showConfirmDialog(message) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'notification confirm';
            dialog.innerHTML = `
                <div class="message">
                    <div class="notification-title">${message}</div>
                    <div class="confirm-buttons">
                        <button class="confirm-button confirm-yes">Yes</button>
                        <button class="confirm-button confirm-no">No</button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);

            const handleClick = (result) => {
                dialog.classList.add('hide');
                setTimeout(() => dialog.remove(), 300);
                resolve(result);
            };

            dialog.querySelector('.confirm-yes').addEventListener('click', () => handleClick(true));
            dialog.querySelector('.confirm-no').addEventListener('click', () => handleClick(false));

            requestAnimationFrame(() => dialog.classList.add('show'));
        });
    }

    setupEventListeners() {
        const buttons = {
            buyButton: () => this.gameState.purchaseAutoClicker(),
            saveButton: () => {
                if (this.gameState.saveGame()) {
                    this.showNotification(config.strings.notifications.saveSuccess, 'success');
                } else {
                    this.showNotification(config.strings.notifications.saveError, 'error');
                }
            },
            loadButton: () => {
                if (this.gameState.loadGame()) {
                    this.showNotification(config.strings.notifications.loadSuccess, 'success');
                } else {
                    this.showNotification(config.strings.notifications.loadError, 'error');
                }
            },
            resetButton: async () => {
                const confirmed = await this.showConfirmDialog(config.strings.confirmReset);
                if (confirmed) {
                    this.gameState.reset();
                    this.showNotification(config.strings.notifications.resetSuccess, 'success');
                }
            }
        };

        Object.entries(buttons).forEach(([id, handler]) => {
            document.getElementById(id).addEventListener('click', handler);
        });
    }
}

export default UIDisplay;