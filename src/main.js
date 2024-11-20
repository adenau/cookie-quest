import GameState from './gameState';
import CookieGame from './game/cookieGame';
import UIDisplay from './uiDisplay';

document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const game = new CookieGame(gameState);
    const ui = new UIDisplay(gameState);
    
    game.start();
});