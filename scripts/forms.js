/**
 * Form validation and submission functionality
 */

// Constants
const FORM_STORAGE_KEY = 'iclouds_form_draft';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const MIN_NARRATIVE_LENGTH = 50;
const MAX_NARRATIVE_LENGTH = 500;

let formAutosaveInterval = null;

/**
 * Validates the cloud sighting form
 * @param {FormData} formData - Form data to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateSightingForm(formData) {
    const errors = [];
    
    const cloudType = formData.get('cloud-type');
    const emotionalImpact = formData.get('emotional-impact');
    const narrative = formData.get('narrative');

    if (!cloudType) {
        errors.push('Please select a cloud type');
    }

    if (!emotionalImpact) {
        errors.push('Please select your emotional response');
    }

    if (narrative) {
        const wordCount = narrative.trim().split(/\s+/).length;
        
        if (wordCount < MIN_NARRATIVE_LENGTH) {
            errors.push(`Your narrative is too brief! Please provide at least ${MIN_NARRATIVE_LENGTH} words of profound reflection.`);
        }

        if (narrative.length > MAX_NARRATIVE_LENGTH) {
            errors.push(`Your narrative exceeds ${MAX_NARRATIVE_LENGTH} characters. Please condense your atmospheric poetry.`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Handles the cloud sighting form submission
 * @param {Event} event - The form submit event
 * @returns {void}
 */
function handleSightingFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        // Validate form
        const validation = validateSightingForm(formData);
        
        if (!validation.isValid) {
            validation.errors.forEach(error => showToast(error, 'warning'));
            return;
        }

        const cloudType = formData.get('cloud-type');
        const emotionalImpact = formData.get('emotional-impact');

        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const originalText = submitBtn.textContent;
        const spinner = createLoadingSpinner();
        submitBtn.textContent = '';
        submitBtn.appendChild(spinner);
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');

        // Simulate form submission
        setTimeout(() => {
            showToast(`🌤️ Sighting Successfully Recorded! Your ${cloudType} sighting has been added to our archives with a classification of "${emotionalImpact}".`, 'success');

            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.setAttribute('aria-busy', 'false');

            // Clear character counter
            const counter = safeQuerySelector('#narrative-counter');
            if (counter) {
                counter.textContent = '0/500 characters (500 remaining)';
                counter.style.color = '#666';
            }

            // Clear saved form data
            clearFormFromLocalStorage();
        }, 2000);
    } catch (error) {
        console.error('Error submitting form:', error);
        showToast('Failed to submit form. Please try again.', 'error');
        
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.setAttribute('aria-busy', 'false');
        }
    }
}

/**
 * Updates the character counter for the narrative field (debounced)
 * @param {Event} event - The input event
 * @returns {void}
 */
const updateNarrativeCounter = debounce(function(event) {
    const textarea = event.target;
    const charCount = textarea.value.length;
    
    let counter = safeQuerySelector('#narrative-counter');
    
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'narrative-counter';
        counter.className = 'form-counter';
        counter.style.fontSize = '0.8rem';
        counter.style.color = '#666';
        counter.style.marginTop = '0.5rem';
        counter.setAttribute('aria-live', 'polite');
        textarea.parentNode.appendChild(counter);
    }

    counter.textContent = `${charCount}/${MAX_NARRATIVE_LENGTH} characters (${MAX_NARRATIVE_LENGTH - charCount} remaining)`;

    // Update ARIA attributes for validation
    if (charCount > MAX_NARRATIVE_LENGTH) {
        counter.style.color = '#e74c3c';
        textarea.setAttribute('aria-invalid', 'true');
        textarea.setAttribute('aria-describedby', 'narrative-counter');
    } else if (charCount > 450) {
        counter.style.color = '#e74c3c';
        textarea.removeAttribute('aria-invalid');
    } else if (charCount > 400) {
        counter.style.color = '#f39c12';
        textarea.removeAttribute('aria-invalid');
    } else {
        counter.style.color = '#666';
        textarea.removeAttribute('aria-invalid');
    }
}, 300);

/**
 * Saves form data to localStorage
 * @returns {void}
 */
function saveFormToLocalStorage() {
    try {
        const form = safeQuerySelector('#sightingForm');
        if (!form) return;

        const formData = new FormData(form);
        const formObject = {};
        
        for (const [key, value] of formData.entries()) {
            if (value) {
                formObject[key] = value;
            }
        }

        // Only save if there's actual data
        if (Object.keys(formObject).length > 0) {
            localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formObject));
        }
    } catch (error) {
        console.error('Error saving form to localStorage:', error);
    }
}

/**
 * Loads form data from localStorage
 * @returns {void}
 */
function loadFormFromLocalStorage() {
    try {
        const savedData = localStorage.getItem(FORM_STORAGE_KEY);
        if (!savedData) return;

        const formObject = JSON.parse(savedData);
        const form = safeQuerySelector('#sightingForm');
        if (!form) return;

        // Populate form fields
        for (const [key, value] of Object.entries(formObject)) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
                
                // Trigger counter update for narrative
                if (key === 'narrative') {
                    const event = new Event('input', { bubbles: true });
                    field.dispatchEvent(event);
                }
            }
        }

        showToast('📝 Your previous form progress has been restored.', 'info');
    } catch (error) {
        console.error('Error loading form from localStorage:', error);
    }
}

/**
 * Clears saved form data from localStorage
 * @returns {void}
 */
function clearFormFromLocalStorage() {
    try {
        localStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing form from localStorage:', error);
    }
}

/**
 * Starts autosaving form data every 30 seconds
 * @returns {void}
 */
function startFormAutosave() {
    if (formAutosaveInterval) {
        clearInterval(formAutosaveInterval);
    }
    
    formAutosaveInterval = setInterval(saveFormToLocalStorage, AUTOSAVE_INTERVAL);
}

/**
 * Stops autosaving form data
 * @returns {void}
 */
function stopFormAutosave() {
    if (formAutosaveInterval) {
        clearInterval(formAutosaveInterval);
        formAutosaveInterval = null;
    }
}

/**
 * Initializes form functionality
 * @returns {void}
 */
function initializeForms() {
    const form = safeQuerySelector('#sightingForm');
    if (form) {
        form.addEventListener('submit', handleSightingFormSubmit);
        
        // Load saved form data
        loadFormFromLocalStorage();
        
        // Start autosave
        startFormAutosave();
        
        // Save form on visibility change (user leaving page)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                saveFormToLocalStorage();
            }
        });
    }

    const narrative = safeQuerySelector('#narrative');
    if (narrative) {
        narrative.addEventListener('input', updateNarrativeCounter);
    }
}
