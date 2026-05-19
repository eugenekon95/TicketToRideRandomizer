import Wheel from './Wheel.js';
import MAPS_CONFIG from '../config/maps-config.js';
import DIFFICULTY_CONFIG from "../config/difficulty-config.js";
import PLAYERS_CONFIG from "../config/players-config.js";
import { DEFAULT_MAX_PLAYERS, TARGET_PLAYERS_COUNT, WHEEL_CANVAS_SIZE, DIFFICULTY_WHEEL_CANVAS_SIZE } from './constants.js';

class GameSettingsRandomizer {
    constructor() {
        this.maps = MAPS_CONFIG;
        this.difficulty = DIFFICULTY_CONFIG;
        this.playersConfig = PLAYERS_CONFIG;

        this.canvas = document.getElementById("wheelCanvas");
        this.spinButton = document.getElementById("spinBtn");
        this.playersInput = document.getElementById("playersInput");
        this.wheelsContainer = document.getElementById("difficultyWheelsContainer");
        this.historyList = document.getElementById("historyList");

        this.tickSound = document.getElementById("tickSound");
        this.winSound = document.getElementById("winSound");
        this.resultElement = document.getElementById("result");

        this.difficultyWheels = [];

        this.mapWheel = new Wheel({
            canvas: this.canvas,
            options: this.maps,
            spinButton: this.spinButton,
            tickSound: this.tickSound,
            winSound: this.winSound,
            resultElement: this.resultElement,
            onResult: (option) => {
                this.selectedMap = option;
                this.updateResult();
                this.renderDifficultyWheels();
            }
        });

        this.playersInput.addEventListener('change', () => this.renderDifficultyWheels());

        this.selectedMap = null;
        this.selectedDifficulties = [];
        this.neededWheels = 0;
        this.lastAddedResult = null;
    }

    renderDifficultyWheels() {
        if (!this.selectedMap) return;

        const livePlayers = parseInt(this.playersInput.value) || 0;
        const mapConfig = this.playersConfig.find(m => m.map === this.selectedMap.name);
        const maxPlayers = mapConfig ? mapConfig.maxPlayers : DEFAULT_MAX_PLAYERS;

        let numWheels = 0;

        if (livePlayers === 3 && maxPlayers === 3) {
            numWheels = 0;
        } else if (livePlayers < 2 && maxPlayers === 3) {
            numWheels = 2;

        } else {
            // Need total 4 players
            numWheels = Math.max(0, TARGET_PLAYERS_COUNT - livePlayers);
        }

        this.wheelsContainer.innerHTML = '';
        this.difficultyWheels = [];
        this.selectedDifficulties = [];
        this.neededWheels = numWheels;

        for (let i = 0; i < numWheels; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'wheel-wrapper';
            
            const canvas = document.createElement('canvas');
            canvas.width = DIFFICULTY_WHEEL_CANVAS_SIZE;
            canvas.height = DIFFICULTY_WHEEL_CANVAS_SIZE;
            canvas.id = `difficultyWheelCanvas_${i}`;
            
            const button = document.createElement('button');
            button.innerText = `SPIN DIFF ${i + 1}`;
            button.id = `spinDifficultyBtn_${i}`;
            
            wrapper.appendChild(canvas);
            wrapper.appendChild(button);
            this.wheelsContainer.appendChild(wrapper);

            const wheel = new Wheel({
                canvas: canvas,
                options: this.difficulty,
                spinButton: button,
                tickSound: this.tickSound,
                winSound: this.winSound,
                resultElement: this.resultElement,
                onResult: (option) => {
                    this.selectedDifficulties[i] = option;
                    this.updateResult();
                }
            });
            this.difficultyWheels.push(wheel);
            wheel.start();
        }
    }

    updateResult() {
        let text = "";
        if (this.selectedMap) text += `Map: ${this.selectedMap.name}. `;
        if (this.selectedDifficulties.length > 0) {
            text += `Difficulties: ${this.selectedDifficulties.map(d => d ? d.name : '...').join(', ')}.`;
        }
        this.resultElement.textContent = text;
        
        const allSelected = (this.neededWheels === 0) || 
                            (this.selectedDifficulties.length === this.neededWheels && this.selectedDifficulties.every(d => d));
        
        if (this.selectedMap && allSelected) {
            if (this.lastAddedResult !== text) {
                this.addHistory(text);
                this.lastAddedResult = text;
            }
        }
    }

    addHistory(text) {
        this.historyList.innerHTML = '';
        const li = document.createElement('li');
        li.textContent = `${new Date().toLocaleTimeString()}: ${text}`;
        this.historyList.prepend(li);
    }

    start() {
        this.mapWheel.start();
        this.difficultyWheels.forEach(wheel => wheel.start());
    }
}

export default GameSettingsRandomizer;