import config from './config/gameConfig.json';

class GameState {
    constructor() {
        this.listeners = []; // Initialize listeners array first
        this.reset();
    }

    reset() {
        this.cookies = 0;
        this.cookiesPerClick = config.gameplay.initialCookiesPerClick;
        this.autoClickers = 0;
        this.autoClickerCost = config.gameplay.factoryBasePrice;
        this.level = 1;
        this.nextLevelRequirement = config.levels[0].requiredCookies;
        this.notifyListeners('reset');
    }

    addCookies(amount) {
        this.cookies += amount;
        this.checkLevelUp();
        this.notifyListeners('update');
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

    purchaseAutoClicker() {
        if (this.cookies >= this.autoClickerCost) {
            this.cookies -= this.autoClickerCost;
            this.autoClickers++;
            this.autoClickerCost = Math.floor(this.autoClickerCost * config.gameplay.factoryPriceIncrease);
            this.notifyListeners('update');
            return true;
        }
        return false;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(event = 'update') {
        if (this.listeners) {
            this.listeners.forEach(callback => callback(this.getState(), event));
        }
    }

    getState() {
        return {
            cookies: Math.floor(this.cookies),
            cookiesPerClick: this.cookiesPerClick,
            autoClickers: this.autoClickers,
            autoClickerCost: this.autoClickerCost,
            level: this.level,
            nextLevelRequirement: this.nextLevelRequirement,
            progress: this.nextLevelRequirement ? this.cookies / this.nextLevelRequirement : 0
        };
    }
}

export default GameState;