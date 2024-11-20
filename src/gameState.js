class GameState {
    constructor() {
        this.cookies = 0;
        this.cookiesPerClick = 1;
        this.autoClickers = 0;
        this.autoClickerCost = 10;
        this.listeners = [];
    }

    addCookies(amount) {
        this.cookies += amount;
        this.notifyListeners();
    }

    purchaseAutoClicker() {
        if (this.cookies >= this.autoClickerCost) {
            this.cookies -= this.autoClickerCost;
            this.autoClickers++;
            this.autoClickerCost = Math.floor(this.autoClickerCost * 1.15);
            this.notifyListeners();
            return true;
        }
        return false;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this));
    }

    getState() {
        return {
            cookies: Math.floor(this.cookies),
            cookiesPerClick: this.cookiesPerClick,
            autoClickers: this.autoClickers,
            autoClickerCost: this.autoClickerCost
        };
    }
}

export default GameState;