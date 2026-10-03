/**
 * Contact section: entrance animation, form validation and submission,
 * and copying the e-mail address.
 */

import { state } from './core/state.js';
import { hasScrollTrigger, prefersReducedMotion } from './core/env.js';
import { tweenFromTo, finishCssTransitions } from './core/gsap-fallback.js';
import { t } from './i18n/i18n.js';

// Past this delay the request is treated as lost: the visitor gets an
// error and a usable form back instead of a button stuck on "sending".
const SUBMIT_TIMEOUT_MS = 15000;
const FORM_FEEDBACK_DURATION_MS = 5000;
const COPY_FEEDBACK_DURATION_MS = 2000;
// Deliberately loose: unusual but valid addresses must pass.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

function legacyCopy(text) {
    const previousFocus = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch {
        copied = false;
    }
    field.remove();
    if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
    return copied;
}

// Resolves to true when the text reached the clipboard. The async API only
// exists in secure contexts and recent browsers, hence the legacy command.
function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
}

function selectContents(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function bindCopyEmail(link) {
    const feedback = link.nextElementSibling;
    const hasFeedback = Boolean(feedback) && feedback.classList.contains('copy-feedback');
    let feedbackTimer = null;

    function showCopyFeedback(copied) {
        const key = copied ? 'copied' : 'copy_manual';
        feedback.setAttribute('data-i18n', key);
        feedback.textContent = t(key);
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateX(5px)';
        clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(-10px)';
        }, COPY_FEEDBACK_DURATION_MS);
    }

    link.addEventListener('click', event => {
        event.preventDefault();
        const email = link.dataset.email || link.innerText.trim();
        copyText(email).then(copied => {
            // Nothing could be copied: select the address so that the
            // visitor can copy it by hand, and say so.
            if (!copied) selectContents(link);
            if (hasFeedback) showCopyFeedback(copied);
        }).catch(error => console.error('[portfolio] e-mail address could not be copied:', error));
    });
}

/** Makes a click on the e-mail address copy it, with a short confirmation. */
export function initCopyEmail() {
    document.querySelectorAll('.js-copy-email').forEach(bindCopyEmail);
}

/**
 * Animates the contact block in when it scrolls into view. Under reduced
 * motion the block is left as the stylesheet shows it: fully visible.
 */
export function initContactReveal() {
    if (!hasScrollTrigger || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const homeContact = document.getElementById('home-contact');
    const homePage = document.getElementById('page-home');
    if (!homeContact || !homePage) return;

    const heading = homeContact.querySelector('.page-heading');
    const intro = homeContact.querySelector('.page-intro');
    const formElements = [...homeContact.querySelectorAll('.form-field'), homeContact.querySelector('.form-submit-wrap')];
    const infoBlocks = homeContact.querySelectorAll('.contact-block');

    // The tweens below must start from the resting style of their elements.
    finishCssTransitions([heading, intro, ...formElements, ...infoBlocks]);

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: homeContact,
            scroller: '#page-home',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
    });

    timeline.fromTo(heading,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    );
    timeline.fromTo(intro,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.6',
    );
    timeline.fromTo(formElements,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
        '-=0.5',
    );
    timeline.fromTo(infoBlocks,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
        '-=0.6',
    );
}

// The form changes height (growing textarea, feedback message): the scroll
// length and the scroll triggers must follow.
function watchFormHeight(form) {
    new ResizeObserver(() => {
        if (state.scroll) state.scroll.resize();
        if (hasScrollTrigger) ScrollTrigger.refresh();
    }).observe(form);
}

// Marks the fields in error and tells whether the form can be sent.
function validateFields({ nameEl, emailEl, messageEl }) {
    const invalidFields = [
        !nameEl.value.trim() && nameEl,
        !EMAIL_PATTERN.test(emailEl.value.trim()) && emailEl,
        !messageEl.value.trim() && messageEl,
    ].filter(Boolean);
    invalidFields.forEach(field => {
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
    });
    return invalidFields.length === 0;
}

// Form services send the success flag as a boolean, a string or a number.
function isRefusal(result) {
    const flag = result ? result.success : undefined;
    return flag === false || flag === 0 || ['false', '0'].includes(String(flag).toLowerCase());
}

// Resolves when the service accepted the message, rejects otherwise.
function sendForm(form, formData, signal) {
    return fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
        signal,
    }).then(response => {
        if (!response.ok) throw new Error('Network response was not ok.');
        // A 200 answer can still carry a refusal in its body. When the
        // body is not JSON, the status already checked is all there is.
        return response.json().catch(() => null);
    }).then(result => {
        if (isRefusal(result)) throw new Error('The form service refused the message.');
    });
}

// The label shows whichever dictionary key it carries, so a language switch
// during a request translates the pending label and the restored one alike.
function setSubmitLabel(button, key) {
    const label = button.querySelector('[data-i18n]');
    if (!label) return;
    label.setAttribute('data-i18n', key);
    label.textContent = t(key);
}

// The message is readable through its CSS class alone; the slide-in is an
// extra. It carries its dictionary key, like the label above.
function createFeedback(feedback) {
    let clearTimer = null;

    function clear() {
        clearTimeout(clearTimer);
        feedback.classList.remove('form-feedback--success', 'form-feedback--error');
        feedback.removeAttribute('data-i18n');
        feedback.textContent = '';
    }

    function show(kind, key) {
        feedback.setAttribute('data-i18n', key);
        feedback.textContent = t(key);
        feedback.classList.add(`form-feedback--${kind}`);
        tweenFromTo(feedback, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: kind === 'success' ? 0.4 : 0.35 });
    }

    // A new attempt clears the message at once, which also cancels this
    // timer: left running, it would wipe the message of that attempt early.
    function clearLater() {
        clearTimeout(clearTimer);
        clearTimer = setTimeout(clear, FORM_FEEDBACK_DURATION_MS);
    }

    return { clear, show, clearLater };
}

function submitForm(form, submitBtn, feedback) {
    // Read before the button is disabled, like a native submission.
    const formData = new FormData(form);
    setSubmitLabel(submitBtn, 'form_sending');
    submitBtn.disabled = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

    return sendForm(form, formData, controller.signal).then(() => {
        feedback.show('success', 'form_sent');
        form.reset();
    }).catch(error => {
        console.error('[portfolio] message could not be sent:',
            controller.signal.aborted ? 'the request timed out.' : error);
        feedback.show('error', 'form_failed');
    }).finally(() => {
        clearTimeout(timeoutId);
        setSubmitLabel(submitBtn, 'form_send');
        submitBtn.disabled = false;
        feedback.clearLater();
    });
}

/**
 * Validates and sends the contact form. Kept apart from the entrance
 * animation: the form must be intercepted even when the animation library
 * failed to load, otherwise the browser posts it natively and lands on the
 * raw JSON answer.
 */
export function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedbackEl = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('contact-submit');
    const fields = {
        nameEl: document.getElementById('contact-name'),
        emailEl: document.getElementById('contact-email'),
        messageEl: document.getElementById('contact-message'),
    };
    if (!form || !feedbackEl || !submitBtn || !Object.values(fields).every(Boolean)) return;

    watchFormHeight(form);
    const feedback = createFeedback(feedbackEl);

    // Pressing Enter in a field submits the form without going through the
    // button, so the lock has to live on the submit event itself.
    let isSubmitting = false;

    form.addEventListener('submit', event => {
        event.preventDefault();
        if (isSubmitting) return;

        Object.values(fields).forEach(field => {
            field.classList.remove('is-invalid');
            field.removeAttribute('aria-invalid');
        });
        feedback.clear();

        if (!validateFields(fields)) {
            feedback.show('error', 'form_invalid');
            return;
        }

        isSubmitting = true;
        submitForm(form, submitBtn, feedback).finally(() => {
            isSubmitting = false;
        });
    });
}
