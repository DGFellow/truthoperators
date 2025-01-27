// Global array to store titles
let articleTitles = []; // Array to store article titles for use in the Matrix Rain

// Load articles dynamically
async function loadArticles() {
    const container = document.getElementById('articleContainer');
    container.innerHTML = ''; // Clear any existing content in the container

    try {
        const response = await fetch('/articles/articles.json'); // Fetch a JSON file containing all articles
        const articles = await response.json(); // Parse the JSON response

        articles.forEach((article) => {
            // Store article titles in the global array
            articleTitles.push(article.title);

            // Create and append article elements to the container
            const articleElement = document.createElement('article');
            articleElement.innerHTML = `
                <h2>${article.title}</h2>
                <p><small>Published on ${article.date}</small></p>
                <p>${article.content}</p>
            `;
            container.appendChild(articleElement);
        });
    } catch (error) {
        console.error('Error loading articles:', error); // Log an error if the fetch fails
    }
}

// Generate a random character from a predefined set of symbols
function randomText() {
    const fallbackSymbols = "!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    return fallbackSymbols[Math.floor(Math.random() * fallbackSymbols.length)]; // Return a random character
}

// Function to generate random drops (non-title characters)
function generateRandomDrop() {
    const cloud = document.querySelector(".cloud"); // Select the cloud container
    if (!cloud) return; // Exit if the cloud container is not found

    const drop = document.createElement("div"); // Create a new drop element
    drop.innerText = randomText(); // Set the drop's text to a random character
    drop.classList.add("drop"); // Add the CSS class for styling

    // Set a random animation duration (fast-moving drops)
    drop.style.animationDuration = `${Math.random() * 1 + 2}s`;

    // Randomize the drop's horizontal position
    const left = Math.random() * cloud.clientWidth;
    drop.style.left = `${left}px`;

    cloud.appendChild(drop); // Append the drop to the cloud container

    // Remove the drop after its animation ends
    setTimeout(() => {
        if (cloud.contains(drop)) {
            cloud.removeChild(drop);
        }
    }, parseFloat(drop.style.animationDuration) * 1000);
}

// Function to generate title drops (prominent article titles)
function generateTitleDrop() {
    const cloud = document.querySelector(".cloud"); // Select the cloud container
    if (!cloud || articleTitles.length === 0) return; // Exit if no titles are available

    const drop = document.createElement("div"); // Create a new drop element
    const randomTitle = articleTitles[Math.floor(Math.random() * articleTitles.length)]; // Pick a random title
    drop.innerText = randomTitle; // Set the drop's text to the selected title
    drop.classList.add("title-drop"); // Add the CSS class for title styling

    // Set a slower animation duration for titles
    drop.style.animationDuration = `${Math.random() * 4 + 4}s`;

    // Randomize the drop's horizontal position
    const left = Math.random() * cloud.clientWidth;
    drop.style.left = `${left}px`;

    cloud.appendChild(drop); // Append the drop to the cloud container

    // Remove the drop after its animation ends
    setTimeout(() => {
        if (cloud.contains(drop)) {
            cloud.removeChild(drop);
        }
    }, parseFloat(drop.style.animationDuration) * 1000);
}

// Matrix Rain Animation: Combines random and title drops
function rain() {
    generateRandomDrop(); // Always generate random drops

    // Occasionally generate title drops with a 20% probability
    if (Math.random() < 0.1) {
        generateTitleDrop();
    }
}

// Call loadArticles and start rain on page load
window.onload = async function () {
    const darkMode = localStorage.getItem('darkMode') === 'true'; // Check dark mode preference
    document.body.classList.toggle('dark-mode', darkMode); // Apply dark mode if enabled
    document.getElementById('darkModeToggle').checked = darkMode; // Sync toggle button state

    await loadArticles(); // Load articles dynamically before starting rain

    // Start Matrix Rain animation with regular intervals
    setInterval(rain, 25); // Adjust frequency of drops (100ms)
};

// Toggle dark mode
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode'); // Toggle dark mode class
    localStorage.setItem('darkMode', isDarkMode); // Save preference to localStorage
}

document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode); // Add toggle event listener

// Check if the container exists in your DOM
const threeContainer = document.getElementById('threeContainer');

if (threeContainer) {
    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Transparent background
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
    threeContainer.appendChild(renderer.domElement);

    // Add Lighting
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Create Head
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const headGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0, 0);
    scene.add(head);

    // Create Binoculars
    const binocularMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);

    const leftLens = new THREE.Mesh(cylinderGeometry, binocularMaterial);
    leftLens.rotation.z = Math.PI / 2; // Rotate horizontally
    leftLens.position.set(-0.4, 0.2, 0.8); // Slightly to the left
    head.add(leftLens); // Attach to head

    const rightLens = new THREE.Mesh(cylinderGeometry, binocularMaterial);
    rightLens.rotation.z = Math.PI / 2; // Rotate horizontally
    rightLens.position.set(0.4, 0.2, 0.8); // Slightly to the right
    head.add(rightLens); // Attach to head

    // Connecting Bar for Binoculars
    const barGeometry = new THREE.BoxGeometry(1, 0.1, 0.1);
    const bar = new THREE.Mesh(barGeometry, binocularMaterial);
    bar.position.set(0, 0.2, 0.8); // Centered between lenses
    head.add(bar); // Attach to head

    // Cursor Tracking
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        const rect = threeContainer.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Smoothly rotate the head and binoculars toward the cursor
        head.rotation.y = mouseX * Math.PI * 0.25; // Rotate horizontally
        head.rotation.x = mouseY * Math.PI * 0.25; // Rotate vertically

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
    });

    // Position the Camera
    camera.position.z = 5; // Backward for full view
    camera.position.y = 1; // Slightly above the head
}

