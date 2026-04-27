/* ============================================================
   Paws & Hearts - Contact Form Validation
   ------------------------------------------------------------
   Implements the validation rules required by the assignment:
     - Auto-capitalize first letter of First Name, Last Name, City
     - Zip code validation (US format: 12345 or 12345-6789)
     - Email validation
   Also validates Subject, Message, and Phone (if provided) so
   the form is "detailed" as the rubric specifies.
   Author: Jean Mitilien
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Helper: capitalize first letter of every word ----------
       Used for First Name, Last Name, and City.
       Examples:
         "jane"          -> "Jane"
         "MARY"          -> "Mary"
         "mary jo"       -> "Mary Jo"
         "  new  york  " -> "New  York"  (leading/trailing space trimmed)
    */
    function capitalizeWords(text) {
        if (!text) {
            return '';
        }
        return text
            .trim()
            .toLowerCase()
            .split(' ')
            .map(function (word) {
                if (word.length === 0) {
                    return '';
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

    /* ---------- Helper: show or clear an error for a single field ---------- */
    function setFieldError(input, errorEl, message) {
        if (message) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            errorEl.textContent = message;
        } else {
            input.classList.remove('invalid');
            input.classList.add('valid');
            errorEl.textContent = '';
        }
    }

    /* ---------- Individual field validators ----------
       Each returns an error string (empty string = valid). */

    function validateName(value, label) {
        if (!value || value.trim().length === 0) {
            return label + ' is required.';
        }
        if (value.trim().length < 2) {
            return label + ' must be at least 2 characters.';
        }
        // Letters, spaces, hyphens, apostrophes only (handles names like O'Brien, Mary-Jane)
        if (!/^[A-Za-z\s'\-]+$/.test(value.trim())) {
            return label + ' can only contain letters, spaces, hyphens, and apostrophes.';
        }
        return '';
    }

    function validateEmail(value) {
        if (!value || value.trim().length === 0) {
            return 'Email is required.';
        }
        // Standard email pattern: localpart@domain.tld
        // - localpart: letters, digits, dot, underscore, percent, plus, hyphen
        // - domain:   letters, digits, dot, hyphen
        // - tld:      at least 2 letters
        var emailPattern = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
        if (!emailPattern.test(value.trim())) {
            return 'Please enter a valid email address (e.g. name@example.com).';
        }
        return '';
    }

    function validatePhone(value) {
        // Phone is optional; empty is valid
        if (!value || value.trim().length === 0) {
            return '';
        }
        // Accepts 123-456-7890 or 1234567890
        var phonePattern = /^\d{3}-?\d{3}-?\d{4}$/;
        if (!phonePattern.test(value.trim())) {
            return 'Phone must be in the format 123-456-7890.';
        }
        return '';
    }

    function validateCity(value) {
        if (!value || value.trim().length === 0) {
            return 'City is required.';
        }
        if (value.trim().length < 2) {
            return 'City must be at least 2 characters.';
        }
        if (!/^[A-Za-z\s'\-\.]+$/.test(value.trim())) {
            return 'City can only contain letters, spaces, hyphens, periods, and apostrophes.';
        }
        return '';
    }

    function validateZip(value) {
        if (!value || value.trim().length === 0) {
            return 'Zip code is required.';
        }
        // US zip: 5 digits, optionally followed by hyphen and 4 more digits
        var zipPattern = /^\d{5}(-\d{4})?$/;
        if (!zipPattern.test(value.trim())) {
            return 'Zip code must be 5 digits (e.g. 12345) or 9 digits (e.g. 12345-6789).';
        }
        return '';
    }

    function validateSubject(value) {
        if (!value || value.trim().length === 0) {
            return 'Subject is required.';
        }
        if (value.trim().length < 3) {
            return 'Subject must be at least 3 characters.';
        }
        return '';
    }

    function validateMessage(value) {
        if (!value || value.trim().length === 0) {
            return 'Message is required.';
        }
        if (value.trim().length < 10) {
            return 'Message must be at least 10 characters.';
        }
        return '';
    }

    /* ---------- Wire everything up after DOM is ready ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        var form = document.getElementById('contactForm');
        if (!form) {
            return; // not on the contact page
        }

        // Grab references to all inputs and their error spans
        var fields = {
            firstName: { input: document.getElementById('firstName'), error: document.getElementById('firstNameError'), validator: function (v) { return validateName(v, 'First name'); } },
            lastName:  { input: document.getElementById('lastName'),  error: document.getElementById('lastNameError'),  validator: function (v) { return validateName(v, 'Last name'); } },
            email:     { input: document.getElementById('email'),     error: document.getElementById('emailError'),     validator: validateEmail },
            phone:     { input: document.getElementById('phone'),     error: document.getElementById('phoneError'),     validator: validatePhone },
            city:      { input: document.getElementById('city'),      error: document.getElementById('cityError'),      validator: validateCity },
            zip:       { input: document.getElementById('zip'),       error: document.getElementById('zipError'),       validator: validateZip },
            subject:   { input: document.getElementById('subject'),   error: document.getElementById('subjectError'),   validator: validateSubject },
            message:   { input: document.getElementById('message'),   error: document.getElementById('messageError'),   validator: validateMessage }
        };

        var feedback = document.getElementById('formFeedback');

        /* ---------- Auto-capitalize on blur ----------
           Triggered when user leaves the field. Capitalizes the first
           letter of each word for first name, last name, and city. */
        function attachAutoCapitalize(fieldName) {
            var input = fields[fieldName].input;
            input.addEventListener('blur', function () {
                if (input.value.trim().length > 0) {
                    input.value = capitalizeWords(input.value);
                }
                // Run validation right after capitalizing
                runFieldValidation(fieldName);
            });
        }

        attachAutoCapitalize('firstName');
        attachAutoCapitalize('lastName');
        attachAutoCapitalize('city');

        /* ---------- Per-field live validation on blur ---------- */
        function runFieldValidation(fieldName) {
            var f = fields[fieldName];
            var errorMsg = f.validator(f.input.value);
            setFieldError(f.input, f.error, errorMsg);
            return errorMsg === '';
        }

        // Validate every field on blur (in addition to the capitalize-then-validate above)
        Object.keys(fields).forEach(function (name) {
            // Skip the three already wired up via attachAutoCapitalize
            if (name === 'firstName' || name === 'lastName' || name === 'city') {
                return;
            }
            fields[name].input.addEventListener('blur', function () {
                runFieldValidation(name);
            });
        });

        /* ---------- Submit handler ---------- */
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Capitalize the three name/city fields one more time in case
            // the user typed and clicked submit without leaving the field
            ['firstName', 'lastName', 'city'].forEach(function (name) {
                var input = fields[name].input;
                if (input.value.trim().length > 0) {
                    input.value = capitalizeWords(input.value);
                }
            });

            // Validate every field
            var allValid = true;
            Object.keys(fields).forEach(function (name) {
                var fieldValid = runFieldValidation(name);
                if (!fieldValid) {
                    allValid = false;
                }
            });

            // Show overall feedback
            if (allValid) {
                feedback.className = 'form-feedback success';
                feedback.textContent = 'Thank you! Your message has been sent successfully.';
                form.reset();
                // Clear all valid/invalid styling after reset
                Object.keys(fields).forEach(function (name) {
                    fields[name].input.classList.remove('valid', 'invalid');
                    fields[name].error.textContent = '';
                });
                // Scroll the success message into view
                feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                feedback.className = 'form-feedback error';
                feedback.textContent = 'Please correct the highlighted errors and try again.';
                // Focus the first invalid field
                var firstInvalid = Object.keys(fields).find(function (name) {
                    return fields[name].input.classList.contains('invalid');
                });
                if (firstInvalid) {
                    fields[firstInvalid].input.focus();
                }
            }
        });

        // Clear the overall feedback message when user starts editing again
        Object.keys(fields).forEach(function (name) {
            fields[name].input.addEventListener('input', function () {
                if (feedback.className.indexOf('error') !== -1) {
                    feedback.className = 'form-feedback';
                    feedback.textContent = '';
                }
            });
        });
    });
})();