/**
 * PDF renderer: loads PDF.js on demand and draws the first page of a
 * document into a canvas.
 */

import { isTouch } from '../core/env.js';

// Resolved from this module, so the paths hold wherever the page is served
// from.
const PDFJS_URL = new URL('../../vendor/pdfjs-3.11.174/pdf.min.js', import.meta.url).href;
const PDFJS_WORKER_URL = new URL('../../vendor/pdfjs-3.11.174/pdf.worker.min.js', import.meta.url).href;
const PDFJS_INTEGRITY = 'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e';

let pdfJsPromise = null;

/**
 * Injects the library once. A failed attempt is forgotten, so that the next
 * sheet opened can try again.
 * @returns {Promise<object>} the pdfjsLib namespace
 */
export function loadPdfJs() {
    if (!pdfJsPromise) {
        pdfJsPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = PDFJS_URL;
            script.integrity = PDFJS_INTEGRITY;
            script.onload = () => {
                if (!window.pdfjsLib) {
                    reject(new Error('PDF.js did not initialise.'));
                    return;
                }
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                resolve(window.pdfjsLib);
            };
            script.onerror = () => {
                script.remove();
                reject(new Error('PDF.js could not be loaded.'));
            };
            document.head.appendChild(script);
        }).catch(error => {
            pdfJsPromise = null;
            throw error;
        });
    }
    return pdfJsPromise;
}

// Share of the page height that is drawn: the bottom strip only holds
// the sheet's page number.
const PDF_VISIBLE_HEIGHT = 0.95;
const PDF_MAX_SCALE = 3;
const PDF_ZOOM_RESERVE = 4;
const PDF_MAX_PIXELS = 9e6;
const PDF_MAX_PIXELS_TOUCH = 4e6;

// Scale = what the screen can show (fitted size x pixel ratio x zoom
// reserve), never above PDF_MAX_SCALE, then capped by a pixel budget so
// that one sheet cannot exhaust canvas memory on a phone or tablet.
function pdfRenderScale(page) {
    const base = page.getViewport({ scale: 1 });
    const fit = Math.min(window.innerWidth / base.width, window.innerHeight / base.height);
    const wanted = fit * (window.devicePixelRatio || 1) * PDF_ZOOM_RESERVE;
    const budget = isTouch() ? PDF_MAX_PIXELS_TOUCH : PDF_MAX_PIXELS;
    const budgetScale = Math.sqrt(budget / (base.width * base.height * PDF_VISIBLE_HEIGHT));
    return Math.min(PDF_MAX_SCALE, wanted, budgetScale);
}

/**
 * Draws the first page of a PDF into the canvas.
 * @param {string} url
 * @param {HTMLCanvasElement} canvas
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<boolean>} true once drawn, false when the signal aborted
 *     the work; rejects when the document cannot be loaded or rendered
 */
export async function renderPdfPage(url, canvas, { signal } = {}) {
    const isAborted = () => Boolean(signal && signal.aborted);

    const pdfLib = await loadPdfJs();
    if (isAborted()) return false;

    const loadingTask = pdfLib.getDocument(encodeURI(url));
    let renderTask = null;

    // Destroying the loading task also destroys the document it produced.
    const release = () => Promise.resolve(loadingTask.destroy()).catch(() => {});
    const onAbort = () => {
        if (renderTask) renderTask.cancel();
        release();
    };
    if (signal) signal.addEventListener('abort', onAbort);

    try {
        const pdf = await loadingTask.promise;
        if (isAborted()) return false;
        const page = await pdf.getPage(1);
        if (isAborted()) return false;

        const viewport = page.getViewport({ scale: pdfRenderScale(page) });

        canvas.width = viewport.width;
        canvas.height = viewport.height * PDF_VISIBLE_HEIGHT;

        const context = canvas.getContext('2d');

        // PDF pages are transparent where nothing is drawn.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
            canvasContext: context,
            viewport: viewport,
            background: 'white'
        });
        await renderTask.promise;
        renderTask = null;
        return !isAborted();
    } catch (error) {
        if (isAborted()) return false;
        throw error;
    } finally {
        if (signal) signal.removeEventListener('abort', onAbort);
        // The canvas keeps its pixels: the document is no longer needed.
        release();
    }
}
