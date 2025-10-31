// Demo information box for Epistery integration demo

document.addEventListener('DOMContentLoaded', async () => {
    // Create demo info box
    const demoBox = document.createElement('div');
    demoBox.id = 'epistery-demo-box';
    demoBox.className = 'demo-box';

    demoBox.innerHTML = `
        <div class="demo-box-header">
            <span class="demo-box-title">🔒 Epistery Demo</span>
            <button class="demo-box-toggle" id="demoToggle" aria-label="Toggle demo box">+</button>
        </div>
        <div class="demo-box-content" id="demoContent" style="display: none;">
            <p><strong>This is a demo site</strong> showing Epistery data wallet integration.</p>
            <p>Epistery enables privacy-preserving ad targeting without tracking users across the web.</p>
            <div class="demo-box-features">
                <h4>Features Demo:</h4>
                <ul>
                    <li>✓ Client-side data storage</li>
                    <li>✓ Privacy-preserving ads</li>
                    <li>🔜 Ad placement (coming soon)</li>
                    <li>🔜 Interest tracking (coming soon)</li>
                </ul>
            </div>
            <div class="demo-box-links">
                <a href="/.well-known/epistery/status" target="_blank" class="demo-link">
                    View Epistery Status →
                </a>
            </div>
            <div class="demo-box-status" id="episteryStatus">
                <small>Connecting to Epistery...</small>
            </div>
        </div>
    `;

    demoBox.classList.add('minimized');
    document.body.appendChild(demoBox);

    // Toggle functionality
    const toggleBtn = document.getElementById('demoToggle');
    const content = document.getElementById('demoContent');
    let isMinimized = true;

    toggleBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        if (isMinimized) {
            content.style.display = 'none';
            toggleBtn.textContent = '+';
            demoBox.classList.add('minimized');
        } else {
            content.style.display = 'block';
            toggleBtn.textContent = '−';
            demoBox.classList.remove('minimized');
        }
    });

    // Initialize Epistery client
    try {
        const client = new EpisteryClient();
        await client.connect();

        const statusEl = document.getElementById('episteryStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <small style="color: #28a745;">
                    ✓ Connected as: <code>${client.address.substring(0, 12)}...</code>
                </small>
            `;
        }

        console.log('Epistery connected:', client.address);
    } catch (error) {
        console.error('Failed to connect to Epistery:', error);
        const statusEl = document.getElementById('episteryStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <small style="color: #dc3545;">
                    ✗ Connection failed
                </small>
            `;
        }
    }
});