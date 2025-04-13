document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
    document.querySelectorAll('.mood-btn').forEach(button => {
        button.addEventListener('click', () => {
          const selectedMood = button.id;
          console.log('Mood saved:', selectedMood);
          window.location.href = `https://mood-match-production-b16d.up.railway.app/currentMood?mood=${encodeURIComponent(selectedMood)}&userId=${userId}`;
        });
      });       
});