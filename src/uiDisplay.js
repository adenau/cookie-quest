class UIDisplay {
    constructor(gameState) {
        this.gameState = gameState;
        this.createUI();
        this.setupEventListeners();
        this.gameState.addListener(() => this.updateUI());
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'uiContainer';
        document.body.appendChild(this.container);

        this.title = document.createElement('div');
        this.title.id = 'gameTitle';
        this.title.textContent = 'Cookie Quest';
        this.container.appendChild(this.title);

        this.ui = document.createElement('div');
        this.ui.id = 'ui';
        this.container.appendChild(this.ui);

        this.buttonContainer = document.createElement('div');
        this.buttonContainer.id = 'buttonContainer';
        this.container.appendChild(this.buttonContainer);

        this.buyButton = document.createElement('button');
        this.buyButton.id = 'buyButton';
        this.buyButton.innerHTML = '🏭 Buy Cookie Factory';
        this.buttonContainer.appendChild(this.buyButton);

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

            #buttonContainer {
                position: absolute;
                top: 160px;
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
        `;
        document.head.appendChild(styles);
    }

    updateUI() {
        const state = this.gameState.getState();
        this.ui.innerHTML = `
            <div style="margin-bottom: 8px;">🍪 ${state.cookies.toLocaleString()}</div>
            <div style="margin-bottom: 8px;">Per Click: ${state.cookiesPerClick}</div>
            <div style="margin-bottom: 8px;">🏭 Factories: ${state.autoClickers}</div>
            <div>Next Factory: ${state.autoClickerCost.toLocaleString()}</div>
        `;
    }

    setupEventListeners() {
        this.buyButton.addEventListener('click', () => {
            this.gameState.purchaseAutoClicker();
        });
    }
}

export default UIDisplay;