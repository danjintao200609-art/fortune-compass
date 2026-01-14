export type Gender = 'male' | 'female';
export type GameType = 'mahjong' | 'poker' | 'guandan';
export type FortuneMode = 'fengshui' | 'horoscope';

export interface UserConfig {
    birthday: string;
    predictionDate: string;
    gender: Gender;
    gameType: GameType;
    timeSlot: string;
}

export interface FortuneResult {
    direction: 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';
    summary: string;
    luckyColor: string;
    bestTime: string;
    energyLabel: string;
    energyValue: string;
    luckyNumbers: number[];
    mode: FortuneMode;
}

export enum Page {
    HOME = 'home',
    RESULT = 'result',
    VIP = 'vip',
    SETTINGS = 'settings'
}
