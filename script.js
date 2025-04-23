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

    // Existing QR code generation code
    const qrForm = document.getElementById('qr-form');
    const urlInput = document.getElementById('url-input');
    const qrCodeDiv = document.getElementById('qr-code');
    const recentUrlsDiv = document.querySelector('.url-list');

    // Load recent URLs on page load
    if (recentUrlsDiv) {
        loadRecentUrls();
    }

    // Handle QR code generation
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
                    // Display QR code
                    qrCodeDiv.innerHTML = `
                        <img src="${data.qrCode}" alt="QR Code" class="qr-image">
                        <div class="qr-actions">
                            <button onclick="downloadQR('${data.id}')" class="download-btn">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    `;
                    
                    // Clear input
                    urlInput.value = '';
                    
                    // Reload recent URLs
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