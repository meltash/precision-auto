// Counter animation function
const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 50; // Divide animation into 50 steps
    const duration = 1500; // Total animation time in milliseconds
    const stepTime = duration / 50; // Time between each step

    const updateCounter = () => {
        current += increment;
        if (current > target) current = target;
        element.textContent = Math.round(current);
        
        if (current < target) {
            setTimeout(updateCounter, stepTime);
        }
    };

    updateCounter();
};

// Start counter animations as soon as possible
window.onload = () => {
    const counters = document.querySelectorAll('.count');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        animateCounter(counter, target);
    });
};

// Loading Screen
window.addEventListener('load', () => {
    const loader = document.querySelector('.loading-screen');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
});

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.querySelector('.scroll-progress').style.width = scrolled + '%';
});

// Service Search Functionality
document.getElementById('service-search')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.service-card').forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
        card.style.display = isVisible ? 'block' : 'none';
    });
});

// Enhanced Form Validation and Feedback
const showFormMessage = (message, type = 'success') => {
    const messageDiv = document.getElementById('form-message');
    messageDiv.querySelector('p').textContent = message;
    messageDiv.querySelector('div').className = `${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg`;
    messageDiv.classList.remove('translate-y-full');
    setTimeout(() => messageDiv.classList.add('translate-y-full'), 3000);
};

// Other functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize other animations
    const elements = document.querySelectorAll('.animate-on-scroll');
    createObserver(elements, 'visible');
    createObserver(document.querySelectorAll('.pricing-card'), 'visible');

    // Smooth scroll for Book Now link
    document.querySelector('a[href="#booking"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#booking').scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Chat functionality with OpenRouter integration
async function sendMessage(message) {
    try {
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.href // Optional but recommended
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // For debugging
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Chat Error:', error);
        throw error;
    }
}

// Update chat UI function with error handling
function appendMessage(message, isUser = false) {
    try {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'} mb-4 ${isUser ? 'text-right' : 'text-left'}`;
        messageDiv.innerHTML = `
            <div class="${isUser ? 'bg-red-500' : 'bg-gray-600'} text-white rounded-lg px-4 py-2 inline-block">
                ${message}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('UI Error:', error);
    }
}

// Single chat initialization
document.addEventListener('DOMContentLoaded', () => {
    const chatIcon = document.getElementById('chat-icon');
    const chatPanel = document.getElementById('chat-panel');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.querySelector('.chat-messages');

    // Toggle chat panel
    chatIcon?.addEventListener('click', (e) => {
        e.stopPropagation();
        chatPanel.classList.remove('hidden');
        setTimeout(() => chatPanel.classList.add('active'), 10);
        chatInput?.focus();
    });

    closeChat?.addEventListener('click', () => {
        chatPanel.classList.remove('active');
        setTimeout(() => chatPanel.classList.add('hidden'), 300);
    });

    // Prevent chat panel from closing when clicking inside
    chatPanel?.addEventListener('click', (e) => e.stopPropagation());

    // Handle chat form submission
    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        appendMessage(message, true);
        chatInput.value = '';
        chatInput.disabled = true;

        try {
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.textContent = 'AI is typing...';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Get AI response
            const response = await sendMessage(message);
            typingDiv.remove();
            appendMessage(response, false);
        } catch (error) {
            console.error('Chat Error:', error);
            appendMessage('Sorry, I encountered an error. Please try again.', false);
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    });

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
        if (chatPanel && !chatPanel.contains(e.target) && e.target !== chatIcon) {
            chatPanel.classList.remove('active');
            setTimeout(() => chatPanel.classList.add('hidden'), 300);
        }
    });
});

// Back to Top Button
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('opacity-100');
    } else {
        backToTop.classList.remove('opacity-100');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Cost Calculator
const servicePrices = {
    'oil-change': { base: 49.99, parts: 20.00 },
    'brake-service': { base: 149.99, parts: 80.00 },
    'tire-service': { base: 89.99, parts: 40.00 }
};

const updateCost = () => {
    const serviceSelect = document.querySelector('select[name="service-type"]');
    const makeSelect = document.querySelector('select[name="vehicle-make"]');
    
    const serviceType = serviceSelect?.value || '';
    const vehicleType = makeSelect?.value || '';
    
    const basePrice = servicePrices[serviceType]?.base || 0;
    const partsPrice = servicePrices[serviceType]?.parts || 0;
    
    let totalBase = basePrice;
    let totalParts = partsPrice;

    // Apply luxury vehicle markup
    if (vehicleType === 'luxury') {
        totalBase *= 1.2;  // 20% markup for luxury vehicles
        totalParts *= 1.3; // 30% markup for luxury parts
    }

    const total = totalBase + totalParts;

    // Update display
    document.getElementById('base-cost').textContent = `$${totalBase.toFixed(2)}`;
    document.getElementById('parts-cost').textContent = `$${totalParts.toFixed(2)}`;
    document.getElementById('total-cost').textContent = `$${total.toFixed(2)}`;
};

// Initialize cost calculator
document.addEventListener('DOMContentLoaded', () => {
    // Add name attributes to selects for easier reference
    const serviceSelect = document.querySelector('#booking-form select:first-of-type');
    const makeSelect = document.querySelector('#booking-form select:nth-of-type(2)');
    
    if (serviceSelect && makeSelect) {
        serviceSelect.setAttribute('name', 'service-type');
        makeSelect.setAttribute('name', 'vehicle-make');
        
        // Add event listeners for real-time updates
        serviceSelect.addEventListener('change', updateCost);
        makeSelect.addEventListener('change', updateCost);
        
        // Initial calculation
        updateCost();
    }
});

// Vehicle Selection
document.querySelector('select[name="make"]')?.addEventListener('change', (e) => {
    const models = {
        'toyota': ['Camry', 'Corolla', 'RAV4'],
        'honda': ['Civic', 'Accord', 'CR-V'],
        'ford': ['F-150', 'Mustang', 'Explorer']
    };
    
    const modelSelect = document.querySelector('select[name="model"]');
    modelSelect.innerHTML = '<option value="">Model</option>' + 
        models[e.target.value].map(model => 
            `<option value="${model.toLowerCase()}">${model}</option>`
        ).join('');
});

// Service Progress Tracking
const updateServiceProgress = (status) => {
    const progressSteps = {
        'check-in': { icon: 'fa-clipboard-check', time: '9:00 AM' },
        'inspection': { icon: 'fa-search', time: '9:30 AM' },
        'service': { icon: 'fa-wrench', time: '10:00 AM' },
        'quality-check': { icon: 'fa-check-double', time: '11:30 AM' },
        'ready': { icon: 'fa-flag-checkered', time: '12:00 PM' }
    };

    // Update progress UI
    Object.entries(progressSteps).forEach(([step, info]) => {
        // Add progress update logic here
    });
};

// Vehicle Model Selection
const vehicleModels = {
    'standard': {
        'toyota': ['Camry', 'Corolla', 'RAV4'],
        'honda': ['Civic', 'Accord', 'CR-V'],
        'ford': ['F-150', 'Focus', 'Escape']
    },
    'luxury': {
        'bmw': ['3 Series', '5 Series', 'X5'],
        'mercedes': ['C-Class', 'E-Class', 'GLC'],
        'audi': ['A4', 'A6', 'Q5']
    }
};

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    // Vehicle Make/Model handling
    const makeSelect = document.querySelector('select[name="vehicle-make"]');
    const modelSelect = document.querySelector('select[name="vehicle-model"]');
    
    if (makeSelect && modelSelect) {
        makeSelect.addEventListener('change', (e) => {
            const category = e.target.value; // 'standard' or 'luxury'
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            
            if (category) {
                Object.values(vehicleModels[category]).flat().forEach(model => {
                    modelSelect.innerHTML += `<option value="${model.toLowerCase()}">${model}</option>`;
                });
            }
            updateCost(); // Update cost when make changes
        });

        modelSelect.addEventListener('change', updateCost); // Update cost when model changes
    }

    // Booking Form Success
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const button = bookingForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
            
            setTimeout(() => {
                showFormMessage('Appointment booked successfully! We\'ll contact you shortly.');
                button.disabled = false;
                button.innerHTML = 'Book Appointment';
                bookingForm.reset();
                updateCost(); // Reset cost display
            }, 1500);
        });
    }

    // Contact Form Success
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const button = contactForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            setTimeout(() => {
                showFormMessage('Message sent successfully! We\'ll get back to you soon.');
                button.disabled = false;
                button.innerHTML = 'Submit';
                contactForm.reset();
            }, 1500);
        });
    }
});

// Vehicle Model Selection
const carModels = {
    'standard': [
        'Toyota Camry',
        'Toyota Corolla',
        'Honda Civic',
        'Honda Accord',
        'Ford F-150',
        'Ford Focus'
    ],
    'luxury': [
        'BMW 3 Series',
        'BMW 5 Series',
        'Mercedes C-Class',
        'Mercedes E-Class',
        'Audi A4',
        'Audi A6'
    ]
};

// Update form handling in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize vehicle selectors
    const makeSelect = document.querySelector('select[name="vehicle-make"]');
    const modelSelect = document.querySelector('select[name="vehicle-model"]');

    // Handle make selection change
    if (makeSelect && modelSelect) {
        makeSelect.addEventListener('change', () => {
            const selectedMake = makeSelect.value;
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            
            if (selectedMake && carModels[selectedMake]) {
                carModels[selectedMake].forEach(model => {
                    modelSelect.innerHTML += `
                        <option value="${model.toLowerCase()}">${model}</option>
                    `;
                });
                modelSelect.disabled = false;
            } else {
                modelSelect.disabled = true;
            }
            updateCost();
        });

        // Initial state
        modelSelect.disabled = true;
    }

    // Handle booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(bookingForm);
            const service = formData.get('service-type');
            const make = formData.get('vehicle-make');
            const model = formData.get('vehicle-model');
            
            if (!service || !make || !model) {
                showFormMessage('Please fill in all required fields', 'error');
                return;
            }

            showFormMessage('Booking submitted successfully!', 'success');
            bookingForm.reset();
            updateCost();
            modelSelect.disabled = true;
        });
    }
});

// Update the showFormMessage function to be more visible
showFormMessage = (message, type = 'success') => {
    const messageDiv = document.getElementById('form-message');
    messageDiv.querySelector('p').textContent = message;
    messageDiv.querySelector('div').className = 
        `${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
         text-white px-6 py-3 rounded-lg`;
    messageDiv.classList.remove('translate-y-full');
    
    // Make the message more visible
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(100%)';
    }, 3000);
};
