document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
    document.querySelectorAll('.mood-btn').forEach(button => {
        button.addEventListener('click', () => {
          const selectedMood = button.id;
          console.log('Mood saved:', selectedMood);
          window.location.href = `/currentMood?mood=${encodeURIComponent(selectedMood)}&userId=${userId}`;
        });
      });       
});