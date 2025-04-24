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

    // Store recent URLs in localStorage
    function saveRecentUrl(url) {
        let recentUrls = JSON.parse(localStorage.getItem('recentUrls') || '[]');
        recentUrls = [url, ...recentUrls.filter(u => u !== url)].slice(0, 10);
        localStorage.setItem('recentUrls', JSON.stringify(recentUrls));
        loadRecentUrls();
    }

    function loadRecentUrls() {
        const recentUrls = JSON.parse(localStorage.getItem('recentUrls') || '[]');
        const recentUrlsDiv = document.querySelector('.url-list');
        
        if (recentUrlsDiv) {
            if (recentUrls.length === 0) {
                recentUrlsDiv.innerHTML = '<p class="no-urls">No recent URLs</p>';
            } else {
                recentUrlsDiv.innerHTML = recentUrls.map(url => `
                    <div class="url-item">
                        <div class="url-info">
                            <i class="fas fa-link"></i>
                            <span>${url}</span>
                        </div>
                        <div class="url-actions">
                            <button onclick="copyUrl('${url}')" class="copy-btn" title="Copy URL">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button onclick="regenerateQR('${url}')" class="regenerate-btn" title="Regenerate QR">
                                <i class="fas fa-sync"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    if (qrForm) {
        qrForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = urlInput.value.trim();
            
            if (!url) {
                alert('Please enter a URL');
                return;
            }

            try {
                // Clear previous QR code
                qrCodeDiv.innerHTML = '';
                
                // Create a new QRCode instance
                new QRCode(qrCodeDiv, {
                    text: url,
                    width: 256,
                    height: 256,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                
                // Add download button after a short delay to ensure QR code is rendered
                setTimeout(() => {
                    const img = qrCodeDiv.querySelector('img');
                    if (img) {
                        const downloadBtn = document.createElement('button');
                        downloadBtn.className = 'download-btn';
                        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
                        downloadBtn.onclick = () => {
                            const link = document.createElement('a');
                            link.download = 'qrcode.png';
                            link.href = img.src;
                            link.click();
                        };
                        
                        const actionsDiv = document.createElement('div');
                        actionsDiv.className = 'qr-actions';
                        actionsDiv.appendChild(downloadBtn);
                        qrCodeDiv.appendChild(actionsDiv);
                        
                        // Save to recent URLs
                        saveRecentUrl(url);
                        urlInput.value = '';
                    } else {
                        alert('Failed to generate QR code. Please try again.');
                    }
                }, 100);
            } catch (error) {
                console.error('Error generating QR code:', error);
                alert('Failed to generate QR code. Please try again.');
            }
        });
    }

    // Clear recent URLs
    const clearButton = document.getElementById('clear-recent');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all recent URLs?')) {
                localStorage.removeItem('recentUrls');
                const urlList = document.querySelector('.url-list');
                if (urlList) {
                    urlList.innerHTML = '<p class="no-urls">No recent URLs</p>';
                }
            }
        });
    }

    // Initial load of recent URLs
    loadRecentUrls();
});

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

// Regenerate QR code for a URL
function regenerateQR(url) {
    const urlInput = document.getElementById('url-input');
    const qrForm = document.getElementById('qr-form');
    
    urlInput.value = url;
    qrForm.dispatchEvent(new Event('submit'));
}