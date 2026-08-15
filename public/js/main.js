document.addEventListener('DOMContentLoaded', () => {
    // ১. থিম টগল বাটন কাজ করার জন্য
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i> Theme' : '<i class="fa-solid fa-moon"></i> Theme';
        });
    }

    // ২. কম্পোনেন্টে ক্লিক করলে ক্যানভাসে যোগ হওয়ার জন্য
    const tools = document.querySelectorAll('.draggable-tools li');
    const dropCanvas = document.getElementById('dropCanvas');

    if (tools && dropCanvas) {
        tools.forEach(tool => {
            tool.addEventListener('click', () => {
                const elementType = tool.getAttribute('data-element');
                
                // ওয়েলকাম মেসেজ সরিয়ে ফেলা
                const placeholder = dropCanvas.querySelector('.welcome-placeholder');
                if (placeholder) {
                    placeholder.remove();
                }

                // নতুন কম্পোনেন্ট ব্লক তৈরি করা
                const newElement = document.createElement('div');
                newElement.className = 'canvas-element-item';
                newElement.style.cssText = 'background: #1e293b; border: 1px dashed #38bdf8; padding: 15px; margin-bottom: 12px; border-radius: 8px; text-align: left; color: #f1f5f9;';
                
                newElement.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <strong style="color: #38bdf8; font-size: 0.85rem;"><i class="fa-solid fa-cube"></i> ${elementType.toUpperCase()} Block Added</strong>
                        <button class="remove-block" style="background: #ef4444; border: none; color: white; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 0.75rem;">Delete</button>
                    </div>
                    <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">This live component is successfully injected into your store layout.</p>
                `;

                // ডিলিট বাটন ফাংশনালিটি
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
    }

    // ৩. প্রজেক্ট এক্সপোর্ট বাটন
    const exportBtn = document.getElementById('exportCodeBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('Success! Your store package and admin control panel have been compiled successfully.');
        });
    }
});
