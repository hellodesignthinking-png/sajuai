import { useRef, useCallback, useState } from 'react';

/**
 * Procedurally generated audio atmosphere for the report page.
 * All sounds are synthesized via Web Audio API — no external files needed.
 */
const useAudioAtmosphere = () => {
    const ctxRef = useRef<AudioContext | null>(null);
    const ambientRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
    const [isAmbientOn, setIsAmbientOn] = useState(false);

    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            ctxRef.current = new AudioContext();
        }
        return ctxRef.current;
    }, []);

    /**
     * Deep space ambient hum — layered low oscillators + Elemental Resonance
     */
    const toggleAmbient = useCallback((element?: string) => {
        const ctx = getCtx();

        if (ambientRef.current) {
            // Fade out and stop
            const { osc, gain } = ambientRef.current;
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
            setTimeout(() => {
                try { osc.stop(); } catch { /* already stopped */ }
            }, 1600);
            ambientRef.current = null;
            setIsAmbientOn(false);
            return;
        }

        // Base Layer: Deep 60Hz hum
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = 60;
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        filter.Q.value = 4;

        gain.gain.value = 0.0001;
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        // Layer 2: Elemental Resonance (V52)
        const oscE = ctx.createOscillator();
        const gainE = ctx.createGain();
        oscE.type = 'sine';

        switch (element) {
            case '목': // Forest Whispers (Nature)
                oscE.frequency.value = 180;
                gainE.gain.value = 0.005;
                break;
            case '화': // Burning Energy (Solar)
                oscE.type = 'triangle';
                oscE.frequency.value = 120;
                gainE.gain.value = 0.008;
                break;
            case '토': // Earth Resonace (Warmth)
                oscE.frequency.value = 90;
                gainE.gain.value = 0.015;
                break;
            case '금': // Metal Shimmer (Crystalline)
                oscE.frequency.value = 440;
                gainE.gain.value = 0.003;
                break;
            case '수': // Deep Sea (Flow)
                oscE.frequency.value = 45;
                gainE.gain.value = 0.02;
                break;
            default:
                oscE.frequency.value = 90;
                gainE.gain.value = 0.01;
        }

        gainE.connect(ctx.destination);
        oscE.start();

        ambientRef.current = { osc, gain };
        setIsAmbientOn(true);
    }, [getCtx]);

    /**
     * Card flip SFX — short filtered noise burst
     */
    const playFlip = useCallback(() => {
        const ctx = getCtx();
        const bufferSize = ctx.sampleRate * 0.15; // 150ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            // Shaped noise burst: attack, then rapid decay
            const t = i / bufferSize;
            const envelope = t < 0.1 ? t / 0.1 : Math.exp(-8 * (t - 0.1));
            data[i] = (Math.random() * 2 - 1) * envelope * 0.4;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.8;
        const gain = ctx.createGain();
        gain.gain.value = 0.25;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }, [getCtx]);

    /**
     * Typing SFX — soft click from filtered impulse
     */
    const playTyping = useCallback(() => {
        const ctx = getCtx();
        const bufferSize = ctx.sampleRate * 0.04; // 40ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const envelope = Math.exp(-20 * t);
            data[i] = (Math.random() * 2 - 1) * envelope * 0.15;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const gain = ctx.createGain();
        gain.gain.value = 0.12;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }, [getCtx]);

    return { toggleAmbient, playFlip, playTyping, isAmbientOn };
};

export default useAudioAtmosphere;
