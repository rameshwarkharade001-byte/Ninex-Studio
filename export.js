/* =========================================
   NINEX STUDIO
   EXPORT ENGINE
   PART 1 / 2
========================================= */

"use strict";

const NinexExport = {

    ffmpeg: null,

    loaded: false,

    exporting: false,

    outputURL: null,


    /* =====================================
       INITIALIZE
    ===================================== */

    init() {

        console.log(
            "Ninex Export Engine initialized"
        );

        this.createExportUI();

        this.connectExportButton();

    },


    /* =====================================
       LOAD FFMPEG
    ===================================== */

    async loadFFmpeg() {

        if (this.loaded) {

            return true;

        }


        if (
            typeof FFmpegWASM ===
            "undefined"
        ) {

            console.error(
                "FFmpeg library not loaded."
            );

            alert(
                "Export engine library is not loaded yet."
            );

            return false;

        }


        try {

            const {
                FFmpeg
            } = FFmpegWASM;


            this.ffmpeg =
                new FFmpeg();


            this.showStatus(
                "Loading export engine..."
            );


            await this.ffmpeg.load({

                coreURL:
                    "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js"

            });


            this.loaded = true;


            this.showStatus(
                "Export engine ready"
            );


            console.log(
                "FFmpeg loaded successfully"
            );


            return true;

        }

        catch (error) {

            console.error(
                "FFmpeg load error:",
                error
            );


            this.showStatus(
                "Could not load export engine"
            );


            return false;

        }

    },


    /* =====================================
       GET VIDEO FILE
    ===================================== */

    getVideoFile() {

        if (
            typeof Ninex ===
            "undefined"
        ) {

            return null;

        }


        return Ninex.file || null;

    },


    /* =====================================
       GET TRIM RANGE
    ===================================== */

    getTrimRange() {

        const start =
            typeof Ninex !==
            "undefined"
                ? Ninex.trimStart
                : 0;


        const end =
            typeof Ninex !==
            "undefined"
                ? Ninex.trimEnd
                : 0;


        return {

            start,
            end

        };

    },


    /* =====================================
       FORMAT SECONDS
    ===================================== */

    formatTime(seconds) {

        if (
            !Number.isFinite(seconds)
        ) {

            return "00:00";

        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        const sec =
            Math.floor(
                seconds % 60
            );


        return (
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(sec)
                .padStart(2, "0")
        );

    },


    /* =====================================
       CREATE EXPORT UI
    ===================================== */

    createExportUI() {

        if (
            document.getElementById(
                "ninexExportPanel"
            )
        ) {

            return;

        }


        const panel =
            document.createElement(
                "div"
            );


        panel.id =
            "ninexExportPanel";


        panel.style.cssText = `
            position:fixed;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
            width:min(92vw,420px);
            background:#111116;
            border:1px solid #29292f;
            border-radius:18px;
            padding:22px;
            z-index:99999;
            display:none;
            box-shadow:0 20px 70px rgba(0,0,0,.6);
            font-family:Arial,sans-serif;
            color:#fff;
        `;


        panel.innerHTML = `

            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                margin-bottom:18px;
            ">

                <strong style="
                    font-size:18px;
                ">
                    Export Video
                </strong>

                <button
                    id="ninexCloseExport"
                    style="
                        background:none;
                        border:0;
                        color:#aaa;
                        font-size:20px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>


            <div style="
                background:#19191f;
                padding:14px;
                border-radius:12px;
                margin-bottom:14px;
            ">

                <div style="
                    font-size:12px;
                    color:#aaa;
                    margin-bottom:6px;
                ">
                    Trim Range
                </div>

                <div
                    id="ninexExportRange"
                    style="
                        font-size:15px;
                        font-weight:bold;
                    "
                >
                    00:00 → 00:00
                </div>

            </div>


            <label style="
                display:block;
                font-size:12px;
                color:#aaa;
                margin-bottom:6px;
            ">
                Format
            </label>


            <select
                id="ninexExportFormat"
                style="
                    width:100%;
                    padding:12px;
                    background:#19191f;
                    color:white;
                    border:1px solid #303038;
                    border-radius:10px;
                    margin-bottom:14px;
                "
            >

                <option value="mp4">
                    MP4 Video
                </option>

            </select>


            <label style="
                display:block;
                font-size:12px;
                color:#aaa;
                margin-bottom:6px;
            ">
                Quality
            </label>


            <select
                id="ninexExportQuality"
                style="
                    width:100%;
                    padding:12px;
                    background:#19191f;
                    color:white;
                    border:1px solid #303038;
                    border-radius:10px;
                    margin-bottom:18px;
                "
            >

                <option value="medium">
                    Medium
                </option>

                <option value="high">
                    High
                </option>

                <option value="low">
                    Fast / Low Size
                </option>

            </select>


            <div
                id="ninexExportStatus"
                style="
                    min-height:20px;
                    font-size:12px;
                    color:#aaa;
                    margin-bottom:12px;
                "
            >
                Ready to export
            </div>


            <div
                id="ninexExportProgress"
                style="
                    width:100%;
                    height:5px;
                    background:#25252c;
                    border-radius:10px;
                    overflow:hidden;
                    margin-bottom:16px;
                "
            >

                <div
                    id="ninexExportProgressBar"
                    style="
                        width:0%;
                        height:100%;
                        background:#fff;
                        transition:width .2s;
                    "
                ></div>

            </div>


            <button
                id="ninexStartExport"
                style="
                    width:100%;
                    padding:14px;
                    border:0;
                    border-radius:12px;
                    background:#fff;
                    color:#09090b;
                    font-size:14px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Export MP4
            </button>

        `;


        document.body.appendChild(
            panel
        );


        const close =
            document.getElementById(
                "ninexCloseExport"
            );


        close.addEventListener(
            "click",
            () => {

                this.hidePanel();

            }
        );


        const start =
            document.getElementById(
                "ninexStartExport"
            );


        start.addEventListener(
            "click",
            () => {

                this.exportVideo();

            }
        );

    },


    /* =====================================
       CONNECT MAIN EXPORT BUTTON
    ===================================== */

    connectExportButton() {

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
                text === "export" ||
                text.includes("export")
            ) {

                if (
                    button.id ===
                    "ninexStartExport"
                ) {

                    return;

                }


                button.addEventListener(
                    "click",
                    () => {

                        this.showPanel();

                    }
                );

            }

        });

    },


    /* =====================================
       SHOW EXPORT PANEL
    ===================================== */

    showPanel() {

        const panel =
            document.getElementById(
                "ninexExportPanel"
            );


        if (!panel) return;


        const range =
            this.getTrimRange();


        const rangeText =
            document.getElementById(
                "ninexExportRange"
            );


        if (rangeText) {

            rangeText.textContent =
                this.formatTime(
                    range.start
                )
                +
                " → "
                +
                this.formatTime(
                    range.end
                );

        }


        panel.style.display =
            "block";


        this.showStatus(
            "Ready to export"
        );

    },


    /* =====================================
       HIDE PANEL
    ===================================== */

    hidePanel() {

        const panel =
            document.getElementById(
                "ninexExportPanel"
            );


        if (!panel) return;


        panel.style.display =
            "none";

    },


    /* =====================================
       STATUS
    ===================================== */

    showStatus(message) {

        const status =
            document.getElementById(
                "ninexExportStatus"
            );


        if (status) {

            status.textContent =
                message;

        }

    },


    /* =====================================
       PROGRESS
    ===================================== */

    setProgress(value) {

        const bar =
            document.getElementById(
                "ninexExportProgressBar"
            );


        if (!bar) return;


        const safe =
            Math.max(
                0,
                Math.min(
                    100,
                    value
                )
            );


        bar.style.width =
            safe + "%";

    },


    /* =====================================
       EXPORT VALIDATION
    ===================================== */

    validate() {

        const file =
            this.getVideoFile();


        if (!file) {

            alert(
                "Please import a video first."
            );

            return false;

        }


        const range =
            this.getTrimRange();


        if (
            range.end <=
            range.start
        ) {

            alert(
                "Invalid trim range."
            );

            return false;

        }


        return true;

    }

};


/* =========================================
   INITIALIZE EXPORT ENGINE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        NinexExport.init();

    }
);/* =========================================
   NINEX STUDIO
   EXPORT ENGINE
   PART 2 / 2
========================================= */


/* =========================================
   RUN REAL FFMPEG EXPORT
========================================= */

NinexExport.exportVideo = async function () {

    if (this.exporting) {

        return;

    }


    if (!this.validate()) {

        return;

    }


    const file =
        this.getVideoFile();


    const range =
        this.getTrimRange();


    const start =
        Math.max(
            0,
            range.start
        );


    const duration =
        Math.max(
            0.1,
            range.end - start
        );


    try {

        this.exporting = true;

        this.setProgress(0);

        this.showStatus(
            "Preparing export..."
        );


        const ready =
            await this.loadFFmpeg();


        if (!ready) {

            this.exporting = false;

            return;

        }


        const {
            fetchFile
        } = FFmpegWASM;


        /* =================================
           WRITE SOURCE FILE
        ================================= */

        this.showStatus(
            "Reading video..."
        );


        const inputName =
            "ninex_input." +
            this.getExtension(file.name);


        await this.ffmpeg.writeFile(
            inputName,
            await fetchFile(file)
        );


        this.setProgress(15);


        /* =================================
           OUTPUT FILE
        ================================= */

        const outputName =
            "ninex_export.mp4";


        /* =================================
           QUALITY SETTINGS
        ================================= */

        const qualityElement =
            document.getElementById(
                "ninexExportQuality"
            );


        const quality =
            qualityElement
                ? qualityElement.value
                : "medium";


        let crf =
            "23";


        if (quality === "high") {

            crf = "18";

        }


        if (quality === "low") {

            crf = "28";

        }


        /* =================================
           FFMPEG TRIM COMMAND
        ================================= */

        this.showStatus(
            "Rendering video..."
        );


        this.setProgress(25);


        await this.ffmpeg.exec([

            "-ss",
            String(start),

            "-i",
            inputName,

            "-t",
            String(duration),

            "-map",
            "0:v:0",

            "-map",
            "0:a?",

            "-c:v",
            "libx264",

            "-preset",
            "veryfast",

            "-crf",
            crf,

            "-c:a",
            "aac",

            "-movflags",
            "+faststart",

            outputName

        ]);


        this.setProgress(80);


        this.showStatus(
            "Finalizing MP4..."
        );


        /* =================================
           READ OUTPUT
        ================================= */

        const data =
            await this.ffmpeg.readFile(
                outputName
            );


        this.setProgress(95);


        /* =================================
           CREATE DOWNLOAD
        ================================= */

        const blob =
            new Blob(
                [data.buffer],
                {
                    type:
                        "video/mp4"
                }
            );


        if (this.outputURL) {

            URL.revokeObjectURL(
                this.outputURL
            );

        }


        this.outputURL =
            URL.createObjectURL(
                blob
            );


        const download =
            document.createElement(
                "a"
            );


        download.href =
            this.outputURL;


        download.download =
            "Ninex_Studio_Export.mp4";


        document.body.appendChild(
            download
        );


        download.click();


        download.remove();


        this.setProgress(100);


        this.showStatus(
            "Export completed successfully."
        );


    }

    catch (error) {

        console.error(
            "Ninex export error:",
            error
        );


        this.setProgress(0);


        this.showStatus(
            "Export failed. Check browser console."
        );


        alert(
            "Export failed. Your browser may not support this FFmpeg build yet."
        );

    }

    finally {

        this.exporting = false;

    }

};


/* =========================================
   FILE EXTENSION
========================================= */

NinexExport.getExtension =
function (filename) {

    if (!filename) {

        return "mp4";

    }


    const parts =
        filename.split(".");


    if (parts.length < 2) {

        return "mp4";

    }


    return parts
        .pop()
        .toLowerCase();

};


/* =========================================
   CLEAN FFMPEG FILES
========================================= */

NinexExport.cleanup =
async function () {

    if (!this.ffmpeg) {

        return;

    }


    try {

        await this.ffmpeg.deleteFile(
            "ninex_input.mp4"
        );

    }

    catch (e) {

        // File may not exist.
    }


    try {

        await this.ffmpeg.deleteFile(
            "ninex_export.mp4"
        );

    }

    catch (e) {

        // File may not exist.
    }

};


/* =========================================
   EXPORT EVENTS
========================================= */

NinexExport.addProgressListener =
function () {

    if (!this.ffmpeg) {

        return;

    }


    this.ffmpeg.on(
        "progress",
        ({
            progress
        }) => {

            if (
                !this.exporting
            ) {

                return;

            }


            const percent =
                25 +
                (
                    progress * 60
                );


            this.setProgress(
                percent
            );


            this.showStatus(
                "Rendering " +
                Math.round(
                    progress * 100
                ) +
                "%"
            );

        }
    );

};


/* =========================================
   RELOAD EXPORT ENGINE
========================================= */

NinexExport.prepare =
async function () {

    const ready =
        await this.loadFFmpeg();


    if (!ready) {

        return false;

    }


    this.addProgressListener();


    return true;

};


/* =========================================
   AUTO PREPARE WHEN USER OPENS EXPORT
========================================= */

const originalShowPanel =
    NinexExport.showPanel;


NinexExport.showPanel =
function () {

    originalShowPanel.call(
        this
    );


    this.setProgress(0);

};


/* =========================================
   FINAL ENGINE MESSAGE
========================================= */

console.log(
    "Ninex Studio REAL EXPORT ENGINE loaded."
);
