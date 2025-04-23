document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.querySelector('i').classList.toggle('fa-bars');
        menuToggle.querySelector('i').classList.toggle('fa-times');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.add('fa-bars');
            menuToggle.querySelector('i').classList.remove('fa-times');
        }
    });

    // Feedback form handling
    const feedbackForm = document.getElementById('feedback-form');
    const popup = document.getElementById('popup');
    const popupClose = document.querySelector('.popup-close');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all fields');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address');
                return;
            }

            try {
                console.log('Form submitted:', formData);
                popup.classList.add('active');
                feedbackForm.reset();
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    popup.classList.remove('active');
                    document.body.style.overflow = '';
                }, 3000);
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Failed to submit feedback. Please try again.');
            }
        });
    }

    if (popupClose) {
        popupClose.addEventListener('click', () => {
            popup.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Handle mobile keyboard
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    // QR code generation
    const qrForm = document.getElementById('qr-form');
    const urlInput = document.getElementById('url-input');
    const qrCodeDiv = document.getElementById('qr-code');
    const recentUrlsDiv = document.querySelector('.url-list');

    if (recentUrlsDiv) {
        loadRecentUrls();
    }

    if (qrForm) {
        qrForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = urlInput.value.trim();
            
            if (!url) return;

            try {
                const response = await fetch('http://localhost:3000/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });

                const data = await response.json();
                
                if (data.success) {
                    qrCodeDiv.innerHTML = `
                        <img src="${data.qrCode}" alt="QR Code" class="qr-image">
                        <div class="qr-actions">
                            <button onclick="downloadQR('${data.id}')" class="download-btn">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    `;
                    
                    urlInput.value = '';
                    loadRecentUrls();
                } else {
                    alert('Failed to generate QR code');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to generate QR code');
            }
        });
    }

    // Clear recent URLs
    const clearButton = document.getElementById('clear-recent');
    if (clearButton) {
        clearButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all recent URLs?')) {
                try {
                    const response = await fetch('http://localhost:3000/api/recent', {
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        const urlList = document.querySelector('.url-list');
                        if (urlList) {
                            urlList.innerHTML = '<p class="no-urls">No recent URLs</p>';
                        }
                        alert('All recent URLs have been cleared');
                    } else {
                        alert('Failed to clear recent URLs');
                    }
                } catch (error) {
                    console.error('Error clearing recent URLs:', error);
                    alert('Failed to clear recent URLs');
                }
            }
        });
    }
});

// Load recent URLs
async function loadRecentUrls() {
    try {
        const response = await fetch('http://localhost:3000/api/recent');
        const data = await response.json();
        
        if (data.success) {
            const recentUrlsDiv = document.querySelector('.url-list');
            if (recentUrlsDiv) {
                if (data.qrs.length === 0) {
                    recentUrlsDiv.innerHTML = '<p class="no-urls">No recent URLs</p>';
                } else {
                    recentUrlsDiv.innerHTML = data.qrs.map(qr => `
                        <div class="url-item">
                            <div class="url-info">
                                <i class="fas fa-link"></i>
                                <span>${qr.url}</span>
                            </div>
                            <div class="url-actions">
                                <button onclick="copyUrl('${qr.url}')" class="copy-btn" title="Copy URL">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <button onclick="downloadQR('${qr._id}')" class="download-btn" title="Download QR">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error loading recent URLs:', error);
    }
}

// Download QR code
async function downloadQR(id) {
    try {
        window.location.href = `http://localhost:3000/api/download/${id}`;
    } catch (error) {
        console.error('Error downloading QR code:', error);
        alert('Failed to download QR code');
    }
}

// Copy URL to clipboard
function copyUrl(url) {
    navigator.clipboard.writeText(url)
        .then(() => {
            alert('URL copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy URL:', err);
            alert('Failed to copy URL');
        });
}