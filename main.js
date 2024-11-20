import GameState from './gameState.js';
import CookieCanvas from './cookieCanvas.js';
import UIDisplay from './uiDisplay.js';

document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const cookieCanvas = new CookieCanvas(gameState);
    const uiDisplay = new UIDisplay(gameState);
    
    cookieCanvas.start();
});