/* =========================================
   NINEX STUDIO
   REAL TIMELINE + TRIM ENGINE
   PART 1 / 2
========================================= */

"use strict";

const Ninex = {

    video: null,

    file: null,

    objectURL: null,

    duration: 0,

    currentTime: 0,

    trimStart: 0,

    trimEnd: 0,

    isPlaying: false,

    history: [],

    historyIndex: -1,


    /* =====================================
       INITIALIZE
    ===================================== */

    init() {

        this.video =
            document.getElementById("videoPlayer");

        if (!this.video) {

            console.error(
                "Ninex: video element not found"
            );

            return;
        }


        this.createEditorControls();

        this.bindVideoEvents();

        this.bindMediaImport();

        this.bindKeyboard();

        console.log(
            "Ninex Studio Editor Ready"
        );
    },


    /* =====================================
       VIDEO EVENTS
    ===================================== */

    bindVideoEvents() {

        this.video.addEventListener(
            "loadedmetadata",
            () => {

                this.duration =
                    this.video.duration || 0;

                this.trimStart = 0;

                this.trimEnd =
                    this.duration;

                this.updateUI();

                this.updateClip();

            }
        );


        this.video.addEventListener(
            "timeupdate",
            () => {

                this.currentTime =
                    this.video.currentTime;

                this.updateTime();

                this.updatePlayhead();

                this.checkTrimEnd();

            }
        );


        this.video.addEventListener(
            "play",
            () => {

                this.isPlaying = true;

                this.updatePlayButton();

            }
        );


        this.video.addEventListener(
            "pause",
            () => {

                this.isPlaying = false;

                this.updatePlayButton();

            }
        );


        this.video.addEventListener(
            "ended",
            () => {

                this.isPlaying = false;

                this.updatePlayButton();

            }
        );

    },


    /* =====================================
       MEDIA IMPORT
    ===================================== */

    bindMediaImport() {

        const input =
            document.getElementById(
                "mediaInput"
            );

        if (!input) return;


        input.addEventListener(
            "change",
            (event) => {

                const file =
                    event.target.files[0];

                if (!file) return;

                this.loadMedia(file);

            }
        );

    },


    loadMedia(file) {

        if (
            !file.type.startsWith("video/")
        ) {

            alert(
                "Please select a video file."
            );

            return;
        }


        this.file = file;


        if (this.objectURL) {

            URL.revokeObjectURL(
                this.objectURL
            );

        }


        this.objectURL =
            URL.createObjectURL(file);


        this.video.src =
            this.objectURL;


        this.video.style.display =
            "block";


        const empty =
            document.getElementById(
                "emptyState"
            );

        if (empty) {

            empty.style.display =
                "none";

        }


        this.video.load();

        this.saveHistory();

    },


    /* =====================================
       TIME DISPLAY
    ===================================== */

    updateTime() {

        const display =
            document.getElementById(
                "timeDisplay"
            );

        if (!display) return;


        display.textContent =
            this.formatTime(
                this.currentTime
            )
            +
            " / "
            +
            this.formatTime(
                this.duration
            );

    },


    formatTime(seconds) {

        if (
            !Number.isFinite(seconds)
            ||
            seconds < 0
        ) {

            return "00:00";

        }


        const minutes =
            Math.floor(seconds / 60);

        const secondsPart =
            Math.floor(seconds % 60);


        return (
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(secondsPart)
                .padStart(2, "0")
        );

    },


    /* =====================================
       PLAY / PAUSE
    ===================================== */

    togglePlay() {

        if (!this.video.src) {

            alert(
                "Import a video first."
            );

            return;
        }


        if (this.video.paused) {

            if (
                this.video.currentTime >=
                this.trimEnd
            ) {

                this.video.currentTime =
                    this.trimStart;

            }


            this.video.play();

        } else {

            this.video.pause();

        }

    },


    updatePlayButton() {

        const button =
            document.getElementById(
                "playButton"
            );

        if (!button) return;


        button.textContent =
            this.isPlaying
            ? "❚❚"
            : "▶";

    },


    /* =====================================
       SEEK
    ===================================== */

    seek(time) {

        if (!this.video.src) return;


        const safeTime =
            Math.max(
                this.trimStart,
                Math.min(
                    this.trimEnd,
                    time
                )
            );


        this.video.currentTime =
            safeTime;

    },


    /* =====================================
       SKIP
    ===================================== */

    skip(seconds) {

        if (!this.video.src) return;


        this.seek(
            this.video.currentTime +
            seconds
        );

    },


    /* =====================================
       TRIM START
    ===================================== */

    setTrimStart() {

        if (!this.video.src) return;


        const time =
            this.video.currentTime;


        if (time >= this.trimEnd) {

            return;

        }


        this.trimStart =
            Math.max(
                0,
                time
            );


        this.saveHistory();

        this.updateClip();

        this.updateTrimLabels();

    },


    /* =====================================
       TRIM END
    ===================================== */

    setTrimEnd() {

        if (!this.video.src) return;


        const time =
            this.video.currentTime;


        if (time <= this.trimStart) {

            return;

        }


        this.trimEnd =
            Math.min(
                this.duration,
                time
            );


        this.saveHistory();

        this.updateClip();

        this.updateTrimLabels();

    },


    /* =====================================
       CHECK TRIM END
    ===================================== */

    checkTrimEnd() {

        if (
            this.isPlaying
            &&
            this.video.currentTime >=
            this.trimEnd
        ) {

            this.video.pause();

            this.video.currentTime =
                this.trimEnd;

        }

    },


    /* =====================================
       UPDATE CLIP
    ===================================== */

    updateClip() {

        const clip =
            document.getElementById(
                "videoClip"
            );

        if (!clip) return;


        if (!this.duration) return;


        const startPercent =
            (
                this.trimStart /
                this.duration
            ) * 100;


        const endPercent =
            (
                this.trimEnd /
                this.duration
            ) * 100;


        const width =
            endPercent -
            startPercent;


        clip.style.left =
            startPercent + "%";


        clip.style.width =
            width + "%";


        clip.textContent =
            this.file
            ? this.file.name
            : "Video";

    },


    /* =====================================
       PLAYHEAD
    ===================================== */

    updatePlayhead() {

        let playhead =
            document.getElementById(
                "ninexPlayhead"
            );


        if (!playhead) return;


        if (!this.duration) return;


        const percent =
            (
                this.currentTime /
                this.duration
            ) * 100;


        playhead.style.left =
            percent + "%";

    },


    /* =====================================
       TRIM LABELS
    ===================================== */

    updateTrimLabels() {

        const start =
            document.getElementById(
                "trimStartValue"
            );

        const end =
            document.getElementById(
                "trimEndValue"
            );


        if (start) {

            start.textContent =
                this.formatTime(
                    this.trimStart
                );

        }


        if (end) {

            end.textContent =
                this.formatTime(
                    this.trimEnd
                );

        }

    },


    /* =====================================
       CREATE CONTROLS
    ===================================== */

    createEditorControls() {

        const controls =
            document.querySelector(
                ".controls"
            );

        if (!controls) return;


        if (
            document.getElementById(
                "trimStartButton"
            )
        ) {

            return;

        }


        const trimStart =
            document.createElement(
                "button"
            );


        trimStart.id =
            "trimStartButton";

        trimStart.className =
            "control";

        trimStart.textContent =
            "⟪";


        const trimEnd =
            document.createElement(
                "button"
            );


        trimEnd.id =
            "trimEndButton";

        trimEnd.className =
            "control";

        trimEnd.textContent =
            "⟫";


        controls.appendChild(
            trimStart
        );


        controls.appendChild(
            trimEnd
        );


        trimStart.addEventListener(
            "click",
            () => {

                this.setTrimStart();

            }
        );


        trimEnd.addEventListener(
            "click",
            () => {

                this.setTrimEnd();

            }
        );


        this.createTrimInfo();

        this.createPlayhead();

    },


    /* =====================================
       TRIM INFO
    ===================================== */

    createTrimInfo() {

        const timeline =
            document.querySelector(
                ".timeline"
            );

        if (!timeline) return;


        if (
            document.getElementById(
                "trimInfo"
            )
        ) {

            return;

        }


        const info =
            document.createElement(
                "div"
            );


        info.id =
            "trimInfo";


        info.style.cssText = `
            height:32px;
            display:flex;
            align-items:center;
            justify-content:center;
            gap:22px;
            font-size:10px;
            color:#a1a1aa;
            border-top:1px solid #202023;
            background:#0d0d11;
        `;


        info.innerHTML = `
            <span>
                START:
                <b id="trimStartValue">
                    00:00
                </b>
            </span>

            <span>
                END:
                <b id="trimEndValue">
                    00:00
                </b>
            </span>
        `;


        timeline.appendChild(
            info
        );


        this.updateTrimLabels();

    },


    /* =====================================
       PLAYHEAD
    ===================================== */

    createPlayhead() {

        const track =
            document.querySelector(
                ".track"
            );

        if (!track) return;


        if (
            document.getElementById(
                "ninexPlayhead"
            )
        ) {

            return;

        }


        track.style.overflow =
            "visible";


        const playhead =
            document.createElement(
                "div"
            );


        playhead.id =
            "ninexPlayhead";


        playhead.style.cssText = `
            position:absolute;
            top:-8px;
            bottom:-8px;
            width:2px;
            background:#ffffff;
            left:0%;
            z-index:20;
            pointer-events:none;
        `;


        track.appendChild(
            playhead
        );

    },


    /* =====================================
       KEYBOARD
    ===================================== */

    bindKeyboard() {

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.target.tagName ===
                    "INPUT"
                ) {

                    return;

                }


                if (
                    event.code ===
                    "Space"
                ) {

                    event.preventDefault();

                    this.togglePlay();

                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    this.skip(-1);

                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    this.skip(1);

                }

            }
        );

    },


    /* =====================================
       HISTORY
    ===================================== */

    saveHistory() {

        const state = {

            trimStart:
                this.trimStart,

            trimEnd:
                this.trimEnd

        };


        this.history =
            this.history.slice(
                0,
                this.historyIndex + 1
            );


        this.history.push(
            state
        );


        this.historyIndex =
            this.history.length - 1;

    }

};


/* =========================================
   START
========================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => Ninex.init()
    );

} else {

    Ninex.init();

    }/* =========================================
   NINEX STUDIO
   REAL TIMELINE + SPLIT + DRAG SEEK
   PART 2 / 2
========================================= */


/* =========================================
   TIMELINE SEEK
========================================= */

Ninex.enableTimelineSeek = function () {

    const tracks =
        document.querySelectorAll(".track");

    tracks.forEach(track => {

        track.addEventListener(
            "click",
            (event) => {

                if (!Ninex.duration) return;

                const rect =
                    track.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const percent =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            x / rect.width
                        )
                    );

                const time =
                    percent *
                    Ninex.duration;

                Ninex.seek(time);

            }
        );

    });

};


/* =========================================
   SPLIT SYSTEM
========================================= */

Ninex.segments = [];


Ninex.split = function () {

    if (!Ninex.video.src) {

        alert("Import a video first.");

        return;

    }


    const time =
        Ninex.video.currentTime;


    if (
        time <= Ninex.trimStart ||
        time >= Ninex.trimEnd
    ) {

        alert(
            "Place the playhead inside the trimmed clip."
        );

        return;

    }


    const left = {

        start:
            Ninex.trimStart,

        end:
            time

    };


    const right = {

        start:
            time,

        end:
            Ninex.trimEnd

    };


    Ninex.segments = [
        left,
        right
    ];


    Ninex.renderSegments();


    Ninex.saveHistory();

};


/* =========================================
   RENDER SPLIT SEGMENTS
========================================= */

Ninex.renderSegments = function () {

    const clip =
        document.getElementById(
            "videoClip"
        );


    if (!clip) return;


    if (!Ninex.segments.length) {

        Ninex.updateClip();

        return;

    }


    clip.innerHTML = "";


    Ninex.segments.forEach(
        (segment, index) => {

            const segmentElement =
                document.createElement(
                    "div"
                );


            segmentElement.className =
                "ninex-segment";


            const start =
                (
                    segment.start /
                    Ninex.duration
                ) * 100;


            const width =
                (
                    (
                        segment.end -
                        segment.start
                    ) /
                    Ninex.duration
                ) * 100;


            segmentElement.style.cssText = `
                position:absolute;
                left:${start}%;
                width:${width}%;
                height:100%;
                top:0;
                background:rgba(255,255,255,.08);
                border:1px solid rgba(255,255,255,.35);
                box-sizing:border-box;
                overflow:hidden;
            `;


            segmentElement.innerHTML = `
                <span style="
                    position:absolute;
                    left:7px;
                    top:50%;
                    transform:translateY(-50%);
                    font-size:10px;
                    color:#fff;
                    white-space:nowrap;
                ">
                    Clip ${index + 1}
                </span>
            `;


            clip.appendChild(
                segmentElement
            );

        }
    );

};


/* =========================================
   RESET TRIM
========================================= */

Ninex.resetTrim = function () {

    if (!Ninex.duration) return;


    Ninex.trimStart = 0;

    Ninex.trimEnd =
        Ninex.duration;


    Ninex.segments = [];


    Ninex.video.currentTime =
        0;


    Ninex.updateClip();

    Ninex.updateTrimLabels();

};


/* =========================================
   CREATE SPLIT BUTTON
========================================= */

Ninex.createSplitButton = function () {

    const controls =
        document.querySelector(
            ".controls"
        );


    if (!controls) return;


    if (
        document.getElementById(
            "ninexSplitButton"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "ninexSplitButton";


    button.className =
        "control";


    button.textContent =
        "✂";


    button.title =
        "Split clip";


    controls.appendChild(
        button
    );


    button.addEventListener(
        "click",
        () => {

            Ninex.split();

        }
    );

};


/* =========================================
   RESET BUTTON
========================================= */

Ninex.createResetButton = function () {

    const controls =
        document.querySelector(
            ".controls"
        );


    if (!controls) return;


    if (
        document.getElementById(
            "ninexResetButton"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "ninexResetButton";


    button.className =
        "control";


    button.textContent =
        "↺";


    button.title =
        "Reset trim";


    controls.appendChild(
        button
    );


    button.addEventListener(
        "click",
        () => {

            Ninex.resetTrim();

        }
    );

};


/* =========================================
   DRAG TRIM HANDLES
========================================= */

Ninex.createTrimHandles = function () {

    const clip =
        document.getElementById(
            "videoClip"
        );


    if (!clip) return;


    if (
        document.getElementById(
            "ninexLeftHandle"
        )
    ) {

        return;

    }


    clip.style.position =
        "absolute";


    const left =
        document.createElement(
            "div"
        );


    left.id =
        "ninexLeftHandle";


    const right =
        document.createElement(
            "div"
        );


    right.id =
        "ninexRightHandle";


    left.style.cssText = `
        position:absolute;
        left:-4px;
        top:-3px;
        bottom:-3px;
        width:8px;
        background:#fff;
        border-radius:5px;
        cursor:ew-resize;
        z-index:30;
    `;


    right.style.cssText = `
        position:absolute;
        right:-4px;
        top:-3px;
        bottom:-3px;
        width:8px;
        background:#fff;
        border-radius:5px;
        cursor:ew-resize;
        z-index:30;
    `;


    clip.appendChild(left);

    clip.appendChild(right);


    Ninex.enableHandleDrag(
        left,
        "start"
    );


    Ninex.enableHandleDrag(
        right,
        "end"
    );

};


/* =========================================
   HANDLE DRAG
========================================= */

Ninex.enableHandleDrag =
function (handle, type) {

    let dragging = false;


    handle.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            dragging = true;

            handle.setPointerCapture(
                event.pointerId
            );

        }
    );


    handle.addEventListener(
        "pointermove",
        (event) => {

            if (!dragging) return;

            const clip =
                document.getElementById(
                    "videoClip"
                );


            const track =
                clip.parentElement;


            const rect =
                track.getBoundingClientRect();


            let percent =
                (
                    event.clientX -
                    rect.left
                ) / rect.width;


            percent =
                Math.max(
                    0,
                    Math.min(
                        1,
                        percent
                    )
                );


            const time =
                percent *
                Ninex.duration;


            if (type === "start") {

                if (
                    time <
                    Ninex.trimEnd - 0.05
                ) {

                    Ninex.trimStart =
                        time;

                    Ninex.video.currentTime =
                        time;

                }

            }


            if (type === "end") {

                if (
                    time >
                    Ninex.trimStart + 0.05
                ) {

                    Ninex.trimEnd =
                        time;

                    Ninex.video.currentTime =
                        time;

                }

            }


            Ninex.updateClip();

            Ninex.updateTrimLabels();

        }
    );


    handle.addEventListener(
        "pointerup",
        () => {

            if (dragging) {

                dragging = false;

                Ninex.saveHistory();

            }

        }
    );

};


/* =========================================
   UNDO
========================================= */

Ninex.undo = function () {

    if (
        Ninex.historyIndex <= 0
    ) {

        return;

    }


    Ninex.historyIndex--;


    const state =
        Ninex.history[
            Ninex.historyIndex
        ];


    if (!state) return;


    Ninex.trimStart =
        state.trimStart;


    Ninex.trimEnd =
        state.trimEnd;


    Ninex.video.currentTime =
        Ninex.trimStart;


    Ninex.updateClip();

    Ninex.updateTrimLabels();

};


/* =========================================
   REDO
========================================= */

Ninex.redo = function () {

    if (
        Ninex.historyIndex >=
        Ninex.history.length - 1
    ) {

        return;

    }


    Ninex.historyIndex++;


    const state =
        Ninex.history[
            Ninex.historyIndex
        ];


    if (!state) return;


    Ninex.trimStart =
        state.trimStart;


    Ninex.trimEnd =
        state.trimEnd;


    Ninex.video.currentTime =
        Ninex.trimStart;


    Ninex.updateClip();

    Ninex.updateTrimLabels();

};


/* =========================================
   CONNECT EXISTING UNDO / REDO
========================================= */

Ninex.connectUndoRedo =
function () {

    const buttons =
        document.querySelectorAll(
            "button"
        );


    buttons.forEach(button => {

        const text =
            button.textContent
                .trim()
                .toLowerCase();


        if (
            text.includes("undo")
        ) {

            button.addEventListener(
                "click",
                () => Ninex.undo()
            );

        }


        if (
            text.includes("redo")
        ) {

            button.addEventListener(
                "click",
                () => Ninex.redo()
            );

        }

    });

};


/* =========================================
   ENHANCED INIT
========================================= */

const oldInit =
    Ninex.init;


Ninex.init = function () {

    oldInit.call(this);


    this.createSplitButton();

    this.createResetButton();

    this.createTrimHandles();

    this.enableTimelineSeek();

    this.connectUndoRedo();


    setTimeout(
        () => {

            this.createTrimHandles();

        },
        500
    );

};


/* =========================================
   RESTART INIT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (Ninex.video) {

            Ninex.createSplitButton();

            Ninex.createResetButton();

            Ninex.createTrimHandles();

            Ninex.enableTimelineSeek();

            Ninex.connectUndoRedo();

        }

    }
);
