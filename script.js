// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = this.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'translateX(-50%) rotate(45deg)';
                spans[0].style.top = '50%';
                spans[0].style.marginTop = '-1.5px';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'translateX(-50%) rotate(-45deg)';
                spans[2].style.bottom = '50%';
                spans[2].style.marginBottom = '-1.5px';
            } else {
                spans[0].style.transform = 'translateX(-50%)';
                spans[0].style.top = '10px';
                spans[0].style.marginTop = '0';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'translateX(-50%)';
                spans[2].style.bottom = '10px';
                spans[2].style.marginBottom = '0';
            }
        });
        
        // Close mobile menu when clicking a link
        const navLinkItems = document.querySelectorAll('.nav-links a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'translateX(-50%)';
                spans[0].style.top = '10px';
                spans[0].style.marginTop = '0';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'translateX(-50%)';
                spans[2].style.bottom = '10px';
                spans[2].style.marginBottom = '0';
            });
        });
    }
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form Validation and Submission
    const vendorForm = document.getElementById('vendor-form');
    const formMessage = document.getElementById('form-message');
    
    if (vendorForm) {
        vendorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {};
            const dates = [];
            
            for (let [key, value] of formData.entries()) {
                if (key === 'dates') {
                    dates.push(value);
                } else {
                    data[key] = value;
                }
            }
            
            // Add dates as a comma-separated string
            if (dates.length > 0) {
                data['interested_dates'] = dates.join(', ');
            }
            
            // Validate form
            if (!validateForm(data)) {
                showMessage('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Submit form using Web3Forms
            submitForm(data);
        });
    }
    
    // Simple rate limiting
    let lastSubmitTime = 0;
    const submitCooldown = 5000; // 5 seconds between submissions
    
    // Obfuscated webhook parts
    const h1 = 'https://hook.';
    const h2 = 'us1.make.com/';
    const h3 = 'dwm4fb8yn9d15s6zpi5sioysm2zfarfh';
    
    async function submitForm(formData) {
        const form = document.getElementById('vendor-form');
        const submitButton = form.querySelector('.submit-button');
        
        // Check honeypot field
        const honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value !== '') {
            // Bot detected - silently fail
            console.log('Form validation failed');
            return;
        }
        
        // Additional check for completely empty submissions
        const allValues = Object.values(formData).filter(v => v && v.toString().trim());
        if (allValues.length < 5) {
            showMessage('Please fill out all required fields', 'error');
            return;
        }
        
        // Rate limiting check
        const currentTime = Date.now();
        if (currentTime - lastSubmitTime < submitCooldown) {
            showMessage('Please wait a few seconds before submitting again.', 'error');
            return;
        }
        lastSubmitTime = currentTime;
        
        // Simple token validation (timestamp-based)
        const token = btoa(Math.floor(Date.now() / 60000).toString()); // Changes every minute
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        try {
            // Construct webhook URL
            const webhookUrl = h1 + h2 + h3;
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    form_type: 'vendor_application',
                    validation_token: token,
                    first_name: formData['first-name'],
                    last_name: formData['last-name'],
                    email: formData.email,
                    phone: formData.phone,
                    business_name: formData['business-name'] || '',
                    products: formData.products,
                    interested_dates: formData.interested_dates,
                    previous_experience: formData.experience || '',
                    booth_type: formData['booth-type'],
                    terms_accepted: formData.terms
                })
            });
            
            if (response.ok) {
                showMessage('Thank you for your application! We\'ll be in touch soon.', 'success');
                vendorForm.reset();
            } else {
                showMessage('There was an error submitting your application. Please try again.', 'error');
            }
        } catch (error) {
            showMessage('There was an error submitting your application. Please try again.', 'error');
            console.error('Form submission error:', error);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Application';
        }
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function validateForm(data) {
        // Check required fields with minimum length requirements
        const requiredFields = {
            'first-name': { min: 2, message: 'First name must be at least 2 characters' },
            'last-name': { min: 2, message: 'Last name must be at least 2 characters' },
            'email': { min: 5, message: 'Please enter a valid email address' },
            'phone': { min: 10, message: 'Phone number must be at least 10 digits' },
            'products': { min: 10, message: 'Please describe your products (at least 10 characters)' }
        };
        
        for (let field in requiredFields) {
            const value = data[field];
            const requirement = requiredFields[field];
            
            // Check if field exists and is not just whitespace
            if (!value || value.trim().length < requirement.min) {
                showMessage(requirement.message, 'error');
                return false;
            }
        }
        
        // Check if at least one date is selected
        if (!data['interested_dates']) {
            showMessage('Please select at least one market date you\'re interested in.', 'error');
            return false;
        }
        
        // Validate email format and not just spaces
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) {
            showMessage('Please enter a valid email address', 'error');
            return false;
        }
        
        // Validate phone (must have at least 10 digits)
        const phoneDigits = data.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            showMessage('Please enter a valid phone number with at least 10 digits', 'error');
            return false;
        }
        
        // Check if booth type is selected
        if (!data['booth-type']) {
            showMessage('Please select a booth space preference', 'error');
            return false;
        }
        
        // Check if terms are accepted
        if (!data.terms) {
            showMessage('Please accept the terms and conditions', 'error');
            return false;
        }
        
        return true;
    }
    
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
    
    // Add form field animations
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});