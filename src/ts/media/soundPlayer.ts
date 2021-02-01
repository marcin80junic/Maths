import { Configuration } from '../config/configuration';        // @ts-ignore
import sound_cheer from '../../../public/sounds/cheering.mp3';     // @ts-ignore
import sound_wrong from '../../../public/sounds/fart.mp3';



export class SoundPlayer {

    public static readonly SOUND_CHEER = new Audio(sound_cheer);
    public static readonly SOUND_FART = new Audio(sound_wrong);

    private static instance: SoundPlayer;
    private sound: HTMLAudioElement;
    private volume: number

    constructor() {
        Configuration.getConfig().addListener(Configuration.VOLUME, this.init);
        this.sound = SoundPlayer.SOUND_CHEER;
        this.init();
    }

    public static getPlayer() {
        if (!this.instance) {
            this.instance = new SoundPlayer();
        }
        return this.instance;
    }

    private init() {
        this.volume = Configuration.getConfig().system_volume;
    }

    playSound(isCorrect: boolean) {
        if (this.sound.currentTime > 0 && !this.sound.ended) {
            this.sound.pause();
            this.sound.currentTime = 0;
        }
        this.sound = (isCorrect === true)?
            SoundPlayer.SOUND_CHEER
            : SoundPlayer.SOUND_FART;
        this.sound.volume = this.volume;
        this.sound.play();
    }

    public static playSound(sound: HTMLAudioElement, volume: number) {
        if (sound === SoundPlayer.SOUND_CHEER) {
            sound.currentTime = 0.5;
        }
        sound.volume = volume;
        sound.play();
    }

}