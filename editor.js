const NinexEditor = {
    file: null,
    url: null,
    duration: 0,
    trimStart: 0,
    trimEnd: 0,
    textLayers: [],
    audioTracks: [],

    init() {
        this.video = document.getElementById("videoPlayer");
        this.timeline = document.querySelector(".timeline");

        if (!this.video) return;

        this.video.addEventListener("loadedmetadata", () => {
            this.duration = this.video.duration;
            this.trimEnd = this.duration;
            this.updateTime();
        });

        this.video.addEventListener("timeupdate", () => {
            this.updateTime();
        });

        console.log("Ninex Studio editor engine loaded");
    },

    updateTime() {
        const display = document.getElementById("timeDisplay");

        if (!display) return;

        display.textContent =
            this.format(this.video.currentTime) +
            " / " +
            this.format(this.duration);
    },

    format(seconds) {
        if (!Number.isFinite(seconds)) return "00:00";

        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);

        return String(m).padStart(2, "0") +
            ":" +
            String(s).padStart(2, "0");
    },

    setTrimStart(time) {
        this.trimStart =
            Math.max(0, Math.min(time, this.trimEnd));

        this.video.currentTime = this.trimStart;
    },

    setTrimEnd(time) {
        this.trimEnd =
            Math.min(
                this.duration,
                Math.max(time, this.trimStart)
            );

        this.video.currentTime = this.trimEnd;
    },

    addText(text) {
        const layer = {
            id: Date.now(),
            text: text,
            start: this.video.currentTime,
            end: this.video.currentTime + 3
        };

        this.textLayers.push(layer);

        console.log("Text layer added:", layer);

        return layer;
    },

    removeText(id) {
        this.textLayers =
            this.textLayers.filter(
                layer => layer.id !== id
            );
    },

    addAudio(file) {
        if (!file || !file.type.startsWith("audio/")) {
            return;
        }

        const url = URL.createObjectURL(file);

        const track = {
            id: Date.now(),
            name: file.name,
            url: url,
            start: this.video.currentTime
        };

        this.audioTracks.push(track);

        console.log("Audio added:", track);

        return track;
    },

    seek(seconds) {
        if (!this.video.src) return;

        this.video.currentTime =
            Math.max(
                0,
                Math.min(
                    this.duration,
                    seconds
                )
            );
    }
};


/* Start engine */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        NinexEditor.init();
    }
);
