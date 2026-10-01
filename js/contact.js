/**
 * Contact section: entrance animation, form validation and submission, and copying the e-mail address.
 */

import { state } from './core/state.js';
import { hasScrollTrigger } from './core/env.js';
import { t } from './i18n/i18n.js';

// Fonction pour copier l'email
// Resolves to true when the text reached the clipboard. The async API only
// exists in secure contexts and recent browsers, hence the legacy command.
function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
}

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

function selectContents(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

export function initCopyEmail() {
    document.querySelectorAll('.copy-email').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.dataset.email || this.innerText.trim();
            copyText(email).then(copied => {
                // Nothing could be copied: select the address so that the
                // visitor can copy it by hand, and say so.
                if (!copied) selectContents(this);
                const feedback = this.nextElementSibling;
                if (feedback && feedback.classList.contains('copy-feedback')) {
                    const key = copied ? 'copied' : 'copy_manual';
                    feedback.setAttribute('data-i18n', key);
                    feedback.textContent = t(key);
                    feedback.style.opacity = '1';
                    feedback.style.transform = 'translateX(5px)';
                    setTimeout(() => {
                        feedback.style.opacity = '0';
                        feedback.style.transform = 'translateX(-10px)';
                    }, 2000);
                }
            }).catch(err => console.error('[portfolio] e-mail address could not be copied:', err));
        });
    });
}

export function initContactReveal() {
    if (!hasScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const homeContact = document.getElementById('home-contact');
    const homePage = document.getElementById('page-home');
    if (!homeContact || !homePage) return;

    const heading = homeContact.querySelector('.page-heading');
    const intro = homeContact.querySelector('.page-intro');
    const formGroups = homeContact.querySelectorAll('.fg');
    const submitBtn = homeContact.querySelector('.btn-wrap');
    const infoBlocks = homeContact.querySelectorAll('.ci-block');

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: homeContact,
            scroller: "#page-home",
            start: "top 85%",
            toggleActions: "play none none none"
        }
    });

    tl.fromTo(heading, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    
    tl.fromTo(intro,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
    );

    const formElements = [...formGroups, submitBtn];
    tl.fromTo(formElements,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
        "-=0.5"
    );

    tl.fromTo(infoBlocks,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
        "-=0.6"
    );
}

// Kept apart from the entrance animation: the form must be intercepted even
// when the animation library failed to load, otherwise the browser posts it
// natively and lands on the raw JSON answer.
export function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    if (!form || !feedback) return;

    // FIX: Observer les changements de taille du formulaire (textarea focus) pour Lenis/ScrollTrigger
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            if (state.scroll) state.scroll.resize();
            if (hasScrollTrigger) ScrollTrigger.refresh();
        });
        ro.observe(form);
    }

    // The message is readable through its CSS class alone; the slide-in is
    // an extra that needs the animation library.
    function animateFeedback(duration) {
        if (typeof gsap === 'undefined') return;
        gsap.fromTo(feedback, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration });
    }

    // The label shows whichever dictionary key it carries, so a language
    // switch during a request translates the pending label and the
    // restored one alike.
    function setSubmitLabel(button, key) {
        const label = button.querySelector('[data-i18n]');
        if (!label) return;
        label.setAttribute('data-i18n', key);
        label.textContent = t(key);
    }

    // Pressing Enter in a field submits the form without going through the
    // button, so the lock has to live on the submit event itself.
    let isSubmitting = false;

    // Past this delay the request is treated as lost: the visitor gets an
    // error and a usable form back instead of a button stuck on "sending".
    const SUBMIT_TIMEOUT_MS = 15000;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const nameEl  = document.getElementById('fn');
        const emailEl = document.getElementById('fe');
        const msgEl   = document.getElementById('fm');

        const name  = nameEl.value.trim();
        const email = emailEl.value.trim();
        const msg   = msgEl.value.trim();

        // Nettoyage des erreurs précédentes
        [nameEl, emailEl, msgEl].forEach(el => el.classList.remove('fi-error'));
        feedback.className = 'form-feedback';
        feedback.textContent = '';

        // Validation
        let hasError = false;
        
        if (!name) { nameEl.classList.add('fi-error'); hasError = true; }
        
        // Validation basique pour autoriser les emails étranges (ex: sans .com)
        if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) {
            emailEl.classList.add('fi-error'); 
            hasError = true;
        }
        
        if (!msg) { msgEl.classList.add('fi-error'); hasError = true; }

        if (hasError) {
            const errMsg = state.lang === 'fr'
                ? 'Merci de remplir tous les champs correctement.'
                : 'Please fill in all fields correctly.';
                
            feedback.textContent = errMsg;
            feedback.classList.add('form-feedback--error');
            animateFeedback(0.35);
            return;
        }

        // Soumission AJAX à Formspree
        const formData = new FormData(form);
        const submitBtn = document.getElementById('contact-submit');
        isSubmitting = true;
        setSubmitLabel(submitBtn, 'form_sending');
        submitBtn.style.pointerEvents = 'none';
        submitBtn.disabled = true;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        }).then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            // A 200 answer can still carry a refusal in its body. When the
            // body is not JSON, the status already checked is all there is.
            return response.json().catch(() => null);
        }).then(result => {
            // Form services send this flag as a boolean, a string or a number.
            const flag = result ? result.success : undefined;
            const refused = flag === false || flag === 0
                || ['false', '0'].includes(String(flag).toLowerCase());
            if (!refused) {
                const successMsg = state.lang === 'fr'
                    ? '✓ Message envoyé avec succès !'
                    : '✓ Message sent successfully!';
                feedback.textContent = successMsg;
                feedback.classList.add('form-feedback--success');
                animateFeedback(0.4);
                form.reset();
            } else {
                throw new Error('The form service refused the message.');
            }
        }).catch(error => {
            const errorMsg = state.lang === 'fr'
                ? 'Erreur lors de l\'envoi. Veuillez réessayer.'
                : 'Error sending message. Please try again.';
            feedback.textContent = errorMsg;
            feedback.classList.add('form-feedback--error');
            animateFeedback(0.35);
        }).finally(() => {
            clearTimeout(timeoutId);
            setSubmitLabel(submitBtn, 'form_send');
            submitBtn.style.pointerEvents = 'auto';
            submitBtn.disabled = false;
            isSubmitting = false;
            setTimeout(() => {
                feedback.textContent = '';
                feedback.classList.remove('form-feedback--success', 'form-feedback--error');
            }, 5000);
        });
    });
}
