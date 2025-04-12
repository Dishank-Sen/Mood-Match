document.addEventListener('DOMContentLoaded', async () => {
    const profileDropdown = document.getElementById('profileDropdown');
    const profileIcon = document.getElementById('profile');
    

    // Toggle dropdown visibility
    profileIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click handler from firing
        profileDropdown.classList.toggle('hidden');
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', () => {
        profileDropdown.classList.add('hidden');
    });

    // Stop dropdown from hiding when clicking inside it
    profileDropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});