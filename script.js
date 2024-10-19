// Select all the trainer contents
const trainerSections = document.querySelectorAll('.parallax-item');

// Function to handle section transitions based on scroll progress
function handleTrainerScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    trainerSections.forEach((section, index) => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const distanceFromView = sectionTop - scrollY;

        // Adjust the threshold here (using 0.65 for earlier trigger)
        if (distanceFromView < windowHeight * 0.75 && distanceFromView > 0) {
            // Calculate the scroll progress (0 to 1) based on distance from viewport
            const progress = 1 - (distanceFromView / (windowHeight * 0.5)); // Adjust the height for earlier effect
            
            // Increase the translateX value for faster movement
            const translateXValue = (1 - progress) * 6; // Change to 200 for more movement

            // Use progress to control opacity and X translation for smooth transition
            section.style.opacity = progress;
            section.style.transform = `translateX(${translateXValue}%)`;        
        } else if (distanceFromView <= 0) {
            // If section is already fully visible
            section.style.opacity = 1;
            section.style.transform = 'translateX(0)';
        } else {
            // If section is not in view yet, keep it hidden
            section.style.opacity = 0;
            section.style.transform = 'translateX(100%)';
        }
    });
}

// Add scroll event listener to track scroll and adjust sections dynamically
window.addEventListener('scroll', handleTrainerScroll);

// Initial load: Apply scroll effect immediately for the first section
document.addEventListener('DOMContentLoaded', () => {
    handleTrainerScroll();  // Trigger scroll effect on load
});
