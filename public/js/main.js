document.addEventListener('DOMContentLoaded', () => {
    console.log("Pibery Pro Studio Active!");

    // 1. Dark/Light Theme Toggle Feature
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i> Theme' : '<i class="fa-solid fa-moon"></i> Theme';
        });
    }

    // 2. Interactive Component Injector Feature
    const toolItems = document.querySelectorAll('.draggable-tools li');
    const dropCanvas = document.getElementById('dropCanvas');

    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            const elementType = item.getAttribute('data-element');
            
            // Remove welcome placeholder if exists
            const placeholder = dropCanvas.querySelector('.welcome-placeholder');
            if (placeholder) {
                placeholder.remove();
            }

            let componentHtml = '';

            if (elementType === 'hero') {
                componentHtml = `
                    <div class="dynamic-component">
                        <h2 style="color: #38bdf8; margin-bottom: 10px;">🚀 Dynamic Hero Section</h2>
                        <p>Launch your projects with speed using Pibery Builder engine components.</p>
                    </div>`;
            } else if (elementType === 'features') {
                componentHtml = `
                    <div class="dynamic-component">
                        <h3 style="color: #38bdf8; margin-bottom: 10px;">⚡ Features Grid Module</h3>
                        <p>High performance layout elements customized for modern web standards.</p>
                    </div>`;
            } else if (elementType === 'pricing') {
                componentHtml = `
                    <div class="dynamic-component">
                        <h3 style="color: #38bdf8; margin-bottom: 10px;">🏷️ Pricing Plans Package</h3>
                        <p>Flexible pricing components ready for monetization.</p>
                    </div>`;
            } else if (elementType === 'contact') {
                componentHtml = `
                    <div class="dynamic-component">
                        <h3 style="color: #38bdf8; margin-bottom: 10px;">✉️ Contact Form Block</h3>
                        <p>Secure inquiry submission form integrated with database router.</p>
                    </div>`;
            }

            dropCanvas.insertAdjacentHTML('beforeend', componentHtml);
        });
    });

    // 3. Project Export Feature
    const exportBtn = document.getElementById('exportCodeBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('🎉 Success! Your custom website workspace has been packaged and exported successfully.');
        });
    }
});
