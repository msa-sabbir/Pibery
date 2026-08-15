document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Functionality
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i> Theme' : '<i class="fa-solid fa-moon"></i> Theme';
        });
    }

    // Toolbox Component Injector into Canvas
    const tools = document.querySelectorAll('.draggable-tools li');
    const dropCanvas = document.getElementById('dropCanvas');

    tools.forEach(tool => {
        tool.addEventListener('click', () => {
            const elementType = tool.getAttribute('data-element');
            
            // Remove welcome placeholder if exists
            const placeholder = dropCanvas.querySelector('.welcome-placeholder');
            if (placeholder) {
                placeholder.remove();
            }

            // Create new component preview block
            const newElement = document.createElement('div');
            newElement.className = 'canvas-element-item';
            newElement.style.cssText = 'background: #1e293b; border: 1px dashed #38bdf8; padding: 15px; margin-bottom: 12px; border-radius: 8px; text-align: left; color: #f1f5f9; position: relative;';
            
            newElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <strong style="color: #38bdf8; text-transform: uppercase; font-size: 0.85rem;"><i class="fa-solid fa-cube"></i> ${elementType} Block Added</strong>
                    <button class="remove-block" style="background: #ef4444; border: none; color: white; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 0.75rem;">Delete</button>
                </div>
                <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">This live component is successfully injected into your storefront layout.</p>
            `;

            // Delete action
            newElement.querySelector('.remove-block').addEventListener('click', () => {
                newElement.remove();
                if (dropCanvas.children.length === 0) {
                    dropCanvas.innerHTML = `
                        <div class="welcome-placeholder">
                            <i class="fa-solid fa-cloud-arrow-down" style="font-size: 3rem; color: #38bdf8; margin-bottom: 15px;"></i>
                            <h3 style="color: #f1f5f9;">Your Canvas is Ready</h3>
                            <p style="color: #94a3b8; font-size: 0.9rem;">Select components from the left toolbox to build your live page structure.</p>
                        </div>
                    `;
                }
            });

            dropCanvas.appendChild(newElement);
        });
    });

    // Export Project Simulator
    const exportBtn = document.getElementById('exportCodeBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('Success! Your store package, admin control panel, and storefront assets have been compiled and exported successfully.');
        });
    }
});
