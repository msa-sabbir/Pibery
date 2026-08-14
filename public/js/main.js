// Interactive JavaScript functionality for Pibery Website Builder

document.addEventListener('DOMContentLoaded', () => {
    console.log("Pibery Website Builder Initialized Successfully!");

    // Test Button Interactive Alert/Action
    const alertBtn = document.getElementById('alertBtn');
    if (alertBtn) {
        alertBtn.addEventListener('click', () => {
            alert('🎉 Pibery Workspace is working perfectly! Start customizing your elements.');
        });
    }

    // Tool list item interactive selection feedback
    const toolItems = document.querySelectorAll('.tool-list li');
    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            const toolName = item.textContent.trim();
            console.log(`Selected tool: ${toolName}`);
            
            // Visual feedback
            toolItems.forEach(i => i.style.background = '#1e293b');
            item.style.background = '#0ea5e9';
            item.style.color = '#ffffff';
            
            setTimeout(() => {
                item.style.background = '#1e293b';
                item.style.color = '#94a3b8';
            }, 500);
        });
    });
});
