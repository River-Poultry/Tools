// Portfolio Manager JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio Manager loaded successfully!');
    
    // Add click event listeners to navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
    
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Function to update dashboard stats (placeholder for future API calls)
    function updateDashboardStats() {
        // This would typically fetch data from your Django backend
        console.log('Updating dashboard stats...');
    }
    
    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Function to format percentage
    function formatPercentage(value) {
        return `${value.toFixed(2)}%`;
    }
    
    // Example of how to update stats dynamically
    function updateStatValue(statName, value, isCurrency = false, isPercentage = false) {
        const statElement = document.querySelector(`[data-stat="${statName}"]`);
        if (statElement) {
            if (isCurrency) {
                statElement.textContent = formatCurrency(value);
            } else if (isPercentage) {
                statElement.textContent = formatPercentage(value);
            } else {
                statElement.textContent = value;
            }
        }
    }
    
    // Initialize dashboard
    updateDashboardStats();
}); 