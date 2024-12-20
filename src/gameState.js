import config from './config/gameConfig.json';

class GameState {
    constructor() {
        this.listeners = [];
        this.reset();
    }

    reset() {
        this.cookies = 0;
        this.cookiesPerClick = config.gameplay.initialCookiesPerClick;
        this.autoClickers = 0;
        this.autoClickerCost = config.gameplay.factoryBasePrice;
        this.factoryBaseProduction = config.gameplay.factoryBaseProduction || 1;
        this.level = 1;
        this.nextLevelRequirement = config.levels[0].requiredCookies;
        this.notifyListeners('reset');
    }

    calculateFactoryProduction() {
        // Each factory is more powerful than the last
        // This creates an exponential growth in production
        let totalProduction = 0;
        for (let i = 0; i < this.autoClickers; i++) {
            totalProduction += Math.floor(this.factoryBaseProduction * Math.pow(1.15, i));
        }
        return totalProduction;
    }

    saveGame() {
        try {
            const saveData = {
                cookies: this.cookies,
                cookiesPerClick: this.cookiesPerClick,
                autoClickers: this.autoClickers,
                autoClickerCost: this.autoClickerCost,
                factoryBaseProduction: this.factoryBaseProduction,
                level: this.level,
                nextLevelRequirement: this.nextLevelRequirement,
                version: '1.0' // Add version for future compatibility
            };
            
            localStorage.setItem('cookieQuestSave', JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    loadGame() {
        try {
            const savedData = localStorage.getItem('cookieQuestSave');
            if (!savedData) {
                return false;
            }

            const data = JSON.parse(savedData);
            
            // Validate loaded data
            if (!this.isValidSaveData(data)) {
                return false;
            }

            // Apply the loaded data
            this.cookies = Number(data.cookies);
            this.cookiesPerClick = Number(data.cookiesPerClick);
            this.autoClickers = Number(data.autoClickers);
            this.autoClickerCost = Number(data.autoClickerCost);
            this.factoryBaseProduction = Number(data.factoryBaseProduction);
            this.level = Number(data.level);
            this.nextLevelRequirement = Number(data.nextLevelRequirement);

            this.notifyListeners('load');
            return true;
        } catch (error) {
            console.error('Load failed:', error);
            return false;
        }
    }

    isValidSaveData(data) {
        const requiredKeys = [
            'cookies',
            'cookiesPerClick',
            'autoClickers',
            'autoClickerCost',
            'factoryBaseProduction',
            'level',
            'nextLevelRequirement'
        ];

        // Check if all required keys exist and have valid values
        return requiredKeys.every(key => {
            const value = data[key];
            return value !== undefined && 
                   value !== null && 
                   !isNaN(Number(value)) &&
                   Number(value) >= 0;
        });
    }

    addCookies(amount) {
        this.cookies += amount;
        this.checkLevelUp();
        this.notifyListeners('update');
    }

    purchaseAutoClicker() {
        if (this.cookies >= this.autoClickerCost) {
            this.cookies -= this.autoClickerCost;
            this.autoClickers++;
            // Increase cost exponentially
            this.autoClickerCost = Math.floor(
                config.gameplay.factoryBasePrice * 
                Math.pow(config.gameplay.factoryPriceIncrease, this.autoClickers)
            );
            this.notifyListeners('update');
            return true;
        }
        return false;
    }

    checkLevelUp() {
        const currentLevelConfig = config.levels[this.level - 1];
        if (this.cookies >= currentLevelConfig.requiredCookies) {
            while (this.level < config.levels.length && 
                   this.cookies >= config.levels[this.level - 1].requiredCookies) {
                this.levelUp();
            }
        }
    }

    levelUp() {
        if (this.level < config.levels.length) {
            const newLevel = config.levels[this.level];
            this.level++;
            
            if (newLevel.reward.cookiesPerClick) {
                this.cookiesPerClick = newLevel.reward.cookiesPerClick;
            }
            
            this.nextLevelRequirement = this.level < config.levels.length ? 
                config.levels[this.level - 1].requiredCookies : Infinity;

            this.notifyListeners('levelUp');
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(event = 'update') {
        this.listeners.forEach(callback => callback(this.getState(), event));
    }

    getState() {
        return {
            cookies: Math.floor(this.cookies),
            cookiesPerClick: this.cookiesPerClick,
            autoClickers: this.autoClickers,
            autoClickerCost: this.autoClickerCost,
            factoryProduction: this.calculateFactoryProduction(),
            level: this.level,
            nextLevelRequirement: this.nextLevelRequirement,
            progress: this.nextLevelRequirement ? this.cookies / this.nextLevelRequirement : 0
        };
    }
}

export default GameState;