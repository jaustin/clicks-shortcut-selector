document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const assignmentsTextArea = document.getElementById('app-assignments');

    // Initialize an empty assignments object
    const assignments = {};
    keys.forEach(key => {
        assignments[key.id.replace('key-', '')] = ''; // Set each key's assignment to an empty string
    });

    // Function to update the textarea based on current assignments
    function updateAssignments() {
	console.log(assignments)
        assignmentsTextArea.value = Object.entries(assignments)
            .map(([key, value]) => value ? `${key}: ${value}` : `${key}:`) // Skip 'None'
            .join('\n');
    }

    function showKeySpinner(key) {
        key.classList.add('spinner'); // Add the spin class to start the animation
    }

    // Function to hide spinner on a specific key
    function hideKeySpinner(key) {
        key.classList.remove('spinner'); // Remove the spin class to stop the animation
    }
    // Call updateAssignments on page load
    updateAssignments();

    keys.forEach(key => {
        key.addEventListener('click', async () => {

		const text = ""
                assignmentsTextArea.value = text;
                updateKeysFromAssignments(text);
            const appName = prompt('Enter the app name:');
            if (appName) {
		    showKeySpinner(key)
                const appDetails = await fetchAppDetails(appName);
		    hideKeySpinner(key)
                if (appDetails) {
                    const iconUrl = appDetails.artworkUrl60; // URL of app icon
                    key.style.backgroundImage = `url(${iconUrl})`;
                    key.style.backgroundSize = 'cover';
                    key.style.backgroundClip = 'circle';
                    key.dataset.appName = appName; // Store the app name in the data attribute
	console.log(assignments)
                    assignments[key.id.replace('key-', '')] = appName; // Update assignments
	console.log(assignments)
                    updateAssignments();
                }
            }
        });
    });

    document.getElementById('download-button').addEventListener('click', downloadImage);
    document.getElementById('load-button').addEventListener('click', loadAssignments);
    document.getElementById('save-button').addEventListener('click', saveAssignments);
    document.getElementById('update-icons-button').addEventListener('click', updateIconsFromText);

    function saveAssignments() {
        const text = assignmentsTextArea.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'app_assignments.txt';
        link.click();
    }

    function loadAssignments() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const text = await file.text();
                assignmentsTextArea.value = text;
                updateKeysFromAssignments(text);
            }
        };
        fileInput.click();
    }

    function updateKeysFromAssignments(text) {
        const lines = text.split('\n');
        keys.forEach(key => {
            const keyId = key.id.replace('key-', ''); // Extract letter
            const line = lines.find(l => l.startsWith(`${keyId}:`));
            if (line) {
                const appName = line.split(':')[1]?.trim(); // Optional chaining to avoid error
                if (appName) {
		    if (key.dataset.appName != appName) {
		        console.log(appName)
                        key.dataset.appName = appName || ''; // Store app name in data attribute
                        assignments[keyId] = appName; // Update assignments
                        // Fetch the icon and set background if app name is not empty
                        showKeySpinner(key)
                        fetchAppDetails(appName).then(appDetails => {
                            if (appDetails) {
                                const iconUrl = appDetails.artworkUrl60;
                                key.style.backgroundImage = `url(${iconUrl})`;
                                key.style.backgroundSize = 'cover';
                                key.style.backgroundClip = 'circle';
                            } else {
                                key.style.backgroundImage = ''; // Reset if not found
                            }
                        hideKeySpinner(key)
                        });
		    }
                } else {
                    key.style.backgroundImage = ''; // Reset if empty
                }
            }
        });
    }

    function updateIconsFromText() {
        const text = assignmentsTextArea.value;
        updateKeysFromAssignments(text); // Reuse the existing function to update keys
    }
});

// Function to fetch app details
async function fetchAppDetails(appName) {
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&entity=software`);
        const data = await response.json();
        return data.results.length > 0 ? data.results[0] : null;
    } catch (error) {
        console.error('Error fetching app details:', error);
        alert('Failed to fetch app details. Please try again.');
        return null;
    }
}

// Function to download the modified image
function downloadImage() {
    html2canvas(document.querySelector('.keyboard-container'),{
    allowTaint: true,
    useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'keyboard_with_icons.png';
        link.click();
    });
}

