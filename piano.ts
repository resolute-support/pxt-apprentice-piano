/**
 * The piano key corresponds to the touch screen TPvalue.
 */
enum PIANO {
    None = 0x0000,
    C = 0x0001,
    Db = 0x0002,
    D = 0x0004,
    Eb = 0x0008,

    E = 0x0010,
    F = 0x0020,
    Gb = 0x0040,
    G = 0x0080,

    Ab = 0x0100,
    A = 0x0200,
    Bb = 0x0400,
    B = 0x0800,

    C1 = 0x1000,
}
/**
 * RGBLED order.
 */
enum RGB_LED {
    LED_1 = 0,
    LED_2 = 1,
    LED_3 = 2,
    LED_4 = 3,
}

/**
 * Well known colors for a NeoPixel strip
 */
enum RGB_COLOR {
    //% block=red
    RED = 0xFF0000,
    //% block=orange
    ORANGE = 0xFFA500,
    //% block=yellow
    YELLOW = 0xFFFF00,
    //% block=green
    GREEN = 0x00FF00,
    //% block=blue
    BLUE = 0x0000FF,
    //% block=indigo
    INDIGO = 0x4b0082,
    //% block=violet
    VIOLET = 0x8a2be2,
    //% block=purple
    PURPLE = 0xFF00FF,
    //% block=white
    WHITE = 0xFFFFFF
}

/**
 * Operate the function of the piano board.
 */
//% weight=20 color=#3333FF icon="\uf001"
namespace Piano {
    let strip = neopixel.create(DigitalPin.P1, 4, NeoPixelMode.RGB);

    function getPianoReading() {
        pins.i2cWriteNumber(
            80,
            8,
            NumberFormat.Int8LE,
            false
        )
        const piano2Value = pins.i2cReadNumber(87, NumberFormat.UInt16BE, false)
        const piano1Value = pins.i2cReadNumber(80, NumberFormat.Int16LE, false)
        if (piano1Value != 0 || piano2Value != 0) {
            if (piano1Value != 0) {
                return piano1Value
            } else {
                return piano2Value
            }
        } else {
            return 0
        }
    }


    //% blockId=tp_press 
    //% block="Key|%index|is pressed"
    //% weight=100
    export function Press(index: PIANO): boolean {
        let TPval = getPianoReading();

        let keyup = 1;
        let press = false;
        if (keyup && TPval != PIANO.None) {
            if (TPval != PIANO.None) {
                keyup = 0;
                let temp = TPval >> 8;
                TPval = (TPval << 8) | temp;
                if (index != 0) {
                    if (TPval & index) {
                        press = true;
                    } else {
                        press = false;
                    }
                } else {
                    if (TPval == 0) {
                        press = true;
                    } else {
                        press = false;
                    }
                }
            }
        }
        return press;
    }

    /**
    * Gets the RGB TPvalue of a known color
    */
    //% blockId="SetColor" block="%Color"
    //% weight=90 blockGap=8
    export function SetColor(Color: RGB_COLOR): number {
        return Color;
    }

    /**
    * Set RGB Color
    */
    //% weight=85
    //% blockId="SetRGB" block="R %red|G %green|B %blue"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    export function SetRGB(red: number, green: number, blue: number): number {
        return ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
    }

    function SetRandomRGB(): number {
        let R = Math.round(Math.random() * 256);
        let G = Math.round(Math.random() * 256);
        let B = Math.round(Math.random() * 256);
        return SetRGB(R, G, B);
    }

    function ShowRGB(LED1: number, LED2: number, LED3: number, LED4: number): void {
        strip.setPixelColor(0, LED1);
        strip.setPixelColor(1, LED2);
        strip.setPixelColor(2, LED3);
        strip.setPixelColor(3, LED4);
        strip.show();
    }

    /**
     * Display 4 RGB color.
     * @param COLOR [0-65535] LED1 color; eg: 10000, 65535
    */
    //% blockId=ShowRGB_single
    //% block="Set |%RGB_LED|COLOR %10000"
    //% weight=80
    //% COLOR.min=0
    export function ShowRGB_single(RGB_LED: RGB_LED, COLOR:number): void {
        strip.setBrightness(100);
        strip.setPixelColor(RGB_LED, COLOR);
        strip.show();
    }

    /**
     * Trun OFF RGB LED.
     *
    */
    //% blockId=Off_single
    //% block="Turn off RGB LED |%RGB_LED"
    //% weight=80
    //% COLOR.min=0
    export function Off_single(RGB_LED: RGB_LED): void {
        strip.setBrightness(100);
        strip.setPixelColor(RGB_LED, 0);
        strip.show();
    }

    /**
     * Plays a tone through pin ``P0`` for the given duration.
     * @param frequency pitch of the tone to play in Hertz (Hz)
     * @param ms tone duration in milliseconds (ms)
     */
    //% help=music/play-tone 
    //% weight=70
    //% blockId=PlayMusic block="Play |Music %note=device_note|for %duration=device_beat" blockGap=8
    //% parts="headphone"
    //% useEnumTPval=1
    export function PlayMusic(frequency: number, ms: number): void {
        pins.analogPitch(frequency, ms);
    }

    let play = 0;
    /**
    * Play the Piano
    */
    //% blockId==PlayPiano" block="Play Piano"
    //% weight=60    
    export function PlayPiano(): void {
        //pins.analogSetPitchPin(AnalogPin.P0);
        let TPval = getPianoReading()
        let temp = TPval >> 8;
        TPval = (TPval << 8) | temp;

        if ((TPval & play) != 0) {
            TPval = TPval & play;
        } else if (TPval & PIANO.C) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(262);
        } else if (TPval & PIANO.Db) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(277);
        } else if (TPval & PIANO.D) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(294);
        } else if (TPval & PIANO.Eb) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(311);
        } else if (TPval & PIANO.E) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(330);
        } else if (TPval & PIANO.F) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(349);
        } else if (TPval & PIANO.Gb) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(370);
        } else if (TPval & PIANO.G) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(392);
        } else if (TPval & PIANO.Ab) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(415);
        } else if (TPval & PIANO.A) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(440);
        } else if (TPval & PIANO.Bb) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(466);
        } else if (TPval & PIANO.B) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(494);
        } else if (TPval & PIANO.C1) {
            ShowRGB(SetRandomRGB(), SetRandomRGB(), SetRandomRGB(), SetRandomRGB());
            music.ringTone(523);
        } else if (TPval == PIANO.None) {
            ShowRGB(0, 0, 0, 0);
            music.ringTone(0);
        }
        if (TPval != 0xffff)
            play = TPval;
    }

    /**
     * Set volume for buzzer
     * 
    */
    //% blockId=Volume
    //% block="Set Volume| %VOLUME"
    //% VOLUME.min=0 VOLUME.max=255
    //% weight=80
    export function Volume(VOLUME: number): void {
        music.setVolume(VOLUME)
    }

    /**
     * Turn Buzzer OFF
     * 
    */
    //% blockId=Quiet
    //% block="stop all sounds"
    //% weight=80
    export function Quiet(): void {
        music.stopAllSounds()
    }

}
