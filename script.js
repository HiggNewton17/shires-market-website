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
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
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
    
    async function submitForm(formData) {
        const form = document.getElementById('vendor-form');
        const submitButton = form.querySelector('.submit-button');
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        try {
            // Web3Forms API endpoint
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: 'YOUR_ACCESS_KEY_HERE', // Replace with your Web3Forms access key
                    subject: 'New Vendor Application - Shire\'s Farmers Market',
                    from_name: `${formData['first-name']} ${formData['last-name']}`,
                    ...formData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('Thank you for your application! We\'ll be in touch soon.', 'success');
                vendorForm.reset();
            } else {
                showMessage('There was an error submitting your application. Please try again.', 'error');
            }
        } catch (error) {
            showMessage('There was an error submitting your application. Please try again.', 'error');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Application';
        }
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    }
    
    function validateForm(data) {
        // Check required fields
        const requiredFields = ['first-name', 'last-name', 'email', 'phone', 'products'];
        for (let field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return false;
            }
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return false;
        }
        
        // Validate phone (basic validation)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(data.phone)) {
            return false;
        }
        
        // Check if terms are accepted
        if (!data.terms) {
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