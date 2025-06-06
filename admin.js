console.log('Initializing admin.js...');

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

console.log('Found elements:', {
    navItems: navItems.length,
    sections: sections.length,
    modal: modal ? 'found' : 'not found',
    modalContent: modalContent ? 'found' : 'not found'
});

// Navigation
    navItems.forEach(item => {
    console.log('Adding click listener to nav item:', item.getAttribute('data-target'));
    item.addEventListener('click', (e) => {
        console.log('Nav item clicked:', item.getAttribute('data-target'));
        e.preventDefault();
        const target = item.getAttribute('data-target');
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
            if (section.id === target) {
                console.log('Showing section:', target);
                section.style.display = 'block';
                section.classList.add('active');
            } else {
                section.style.display = 'none';
                section.classList.remove('active');
                }
            });
        
        // Load section data
        loadSectionData(target);
        });
    });

    // Modal handling
function showModal(content) {
    modalContent.innerHTML = `
        <div class="modal-header">
            <button class="close-modal" onclick="hideModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        ${content}
    `;
    modal.style.display = 'flex';
}

function hideModal() {
    modal.style.display = 'none';
    modalContent.innerHTML = '';
}

// Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
        hideModal();
    }
});

// Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// File upload preview
function handleFileUpload(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Section data loading
async function loadSectionData(sectionId) {
    try {
        switch (sectionId) {
            case 'home':
                const settings = await getSettings();
                document.getElementById('heroTitle').value = settings.heroTitle || '';
                document.getElementById('heroSubtitle').value = settings.heroSubtitle || '';
                document.getElementById('missionTitle').value = settings.missionTitle || '';
                document.getElementById('missionText').value = settings.missionText || '';
                break;
                
            case 'media':
                const songs = await getSongs();
                const songsList = document.getElementById('songsList');
                songsList.innerHTML = songs.map(song => `
                    <div class="list-item">
                        <span>${song.title || 'Untitled'}</span>
                        <div class="actions">
                            <button onclick="editSong('${song.id}')">Edit</button>
                            <button onclick="deleteSong('${song.id}')">Delete</button>
                        </div>
                    </div>
                `).join('');
                break;
                
            case 'gallery':
                const images = await getGalleryImages();
                const galleryGrid = document.getElementById('galleryGrid');
                galleryGrid.innerHTML = images.map(image => `
                    <div class="list-item">
                        <img src="${image.url || '../images/placeholder.jpg'}" 
                             alt="${image.title || 'Untitled'}" 
                             style="width: 50px; height: 50px; object-fit: cover;"
                             onerror="this.src='../images/placeholder.jpg'">
                        <span>${image.title || 'Untitled'}</span>
                        <div class="actions">
                            <button onclick="editImage('${image.id}')">Edit</button>
                            <button onclick="deleteImage('${image.id}')">Delete</button>
                        </div>
                    </div>
                `).join('');
                break;
                
            case 'merch':
                const products = await getProducts();
                const productsList = document.getElementById('productsList');
                productsList.innerHTML = products.map(product => `
                    <div class="list-item">
                        <img src="${product.image || '../images/placeholder.jpg'}" 
                             alt="${product.name || 'Untitled'}" 
                             style="width: 50px; height: 50px; object-fit: cover;"
                             onerror="this.src='../images/placeholder.jpg'">
                        <span>${product.name || 'Untitled'}</span>
                        <span>$${product.price || '0.00'}</span>
                        <div class="actions">
                            <button onclick="editProduct('${product.id}')">Edit</button>
                            <button onclick="deleteProduct('${product.id}')">Delete</button>
                        </div>
                    </div>
                `).join('');
                break;
                
            case 'events':
                const events = await getEvents();
                const eventsList = document.getElementById('eventsList');
                eventsList.innerHTML = events.map(event => `
                    <div class="list-item">
                        <span>${event.title || 'Untitled Event'}</span>
                        <span>${event.date ? new Date(event.date).toLocaleDateString() : 'No date set'}</span>
                        <div class="actions">
                            <button onclick="editEvent('${event.id}')">Edit</button>
                            <button onclick="deleteEvent('${event.id}')">Delete</button>
                        </div>
                    </div>
                `).join('');
                break;
        }
    } catch (error) {
        console.error('Error loading section data:', error);
        showNotification('Failed to load data', 'error');
    }
}

// Add buttons handlers
document.getElementById('addSongBtn').addEventListener('click', () => {
    showModal(`
        <h2>Add New Song</h2>
        <form id="add-song-form">
                    <div class="form-group">
                <label for="song-title">Title</label>
                <input type="text" id="song-title" required>
                    </div>
                    <div class="form-group">
                <label for="song-file">Audio File</label>
                <input type="file" id="song-file" accept="audio/*" required>
                    </div>
                    <div class="form-group">
                <label for="song-cover">Cover Image</label>
                <input type="file" id="song-cover" accept="image/*" required>
                    </div>
            <button type="submit">Add Song</button>
                </form>
            `);

    document.getElementById('add-song-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', document.getElementById('song-title').value);
            formData.append('audio', document.getElementById('song-file').files[0]);
            formData.append('cover', document.getElementById('song-cover').files[0]);
            
            await addSong(formData);
            showNotification('Song added successfully');
            hideModal();
            loadSectionData('media');
        } catch (error) {
            console.error('Error adding song:', error);
            showNotification('Failed to add song', 'error');
        }
    });
});

document.getElementById('addImageBtn').addEventListener('click', () => {
    showModal(`
        <h2>Add New Image</h2>
        <form id="add-image-form">
                    <div class="form-group">
                <label for="image-title">Title</label>
                <input type="text" id="image-title" required>
                    </div>
                    <div class="form-group">
                <label for="image-file">Image File</label>
                <input type="file" id="image-file" accept="image/*" required>
                    </div>
            <button type="submit">Add Image</button>
                </form>
            `);

    document.getElementById('add-image-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', document.getElementById('image-title').value);
            formData.append('image', document.getElementById('image-file').files[0]);
            
            await addGalleryImage(formData);
            showNotification('Image added successfully');
            hideModal();
            loadSectionData('gallery');
        } catch (error) {
            console.error('Error adding image:', error);
            showNotification('Failed to add image', 'error');
        }
    });
});

document.getElementById('addProductBtn').addEventListener('click', () => {
    showModal(`
        <h2>Add New Product</h2>
        <form id="add-product-form">
                    <div class="form-group">
                <label for="product-name">Name</label>
                <input type="text" id="product-name" required>
                    </div>
                    <div class="form-group">
                <label for="product-price">Price</label>
                <input type="number" id="product-price" step="0.01" required>
                    </div>
                    <div class="form-group">
                <label for="product-description">Description</label>
                <textarea id="product-description" required></textarea>
                    </div>
                    <div class="form-group">
                <label for="product-image">Image</label>
                <input type="file" id="product-image" accept="image/*" required>
                    </div>
            <button type="submit">Add Product</button>
                </form>
            `);

    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', document.getElementById('product-name').value);
            formData.append('price', document.getElementById('product-price').value);
            formData.append('description', document.getElementById('product-description').value);
            formData.append('image', document.getElementById('product-image').files[0]);
            
            await addProduct(formData);
            showNotification('Product added successfully');
            hideModal();
            loadSectionData('merch');
        } catch (error) {
            console.error('Error adding product:', error);
            showNotification('Failed to add product', 'error');
        }
    });
});

document.getElementById('addEventBtn').addEventListener('click', () => {
    showModal(`
        <h2>Add New Event</h2>
        <form id="add-event-form">
                    <div class="form-group">
                <label for="event-title">Title</label>
                <input type="text" id="event-title" required>
                    </div>
                    <div class="form-group">
                <label for="event-date">Date</label>
                <input type="datetime-local" id="event-date" required>
                    </div>
                    <div class="form-group">
                <label for="event-location">Location</label>
                <input type="text" id="event-location" required>
                    </div>
                    <div class="form-group">
                <label for="event-description">Description</label>
                <textarea id="event-description" required></textarea>
                    </div>
            <button type="submit">Add Event</button>
                </form>
            `);

    document.getElementById('add-event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
            const eventData = {
                title: document.getElementById('event-title').value,
                date: document.getElementById('event-date').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-description').value
            };
            
            await addEvent(eventData);
            showNotification('Event added successfully');
            hideModal();
            loadSectionData('events');
        } catch (error) {
            console.error('Error adding event:', error);
            showNotification('Failed to add event', 'error');
        }
    });
});

// Save buttons handlers
document.getElementById('saveHomeBtn').addEventListener('click', async () => {
    try {
        const settings = {
            heroTitle: document.getElementById('heroTitle').value,
            heroSubtitle: document.getElementById('heroSubtitle').value,
            missionTitle: document.getElementById('missionTitle').value,
            missionText: document.getElementById('missionText').value
        };
        
        await updateSettings(settings);
        showNotification('Home page settings saved successfully');
    } catch (error) {
        console.error('Error saving home settings:', error);
        showNotification('Failed to save settings', 'error');
    }
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Hide all sections except the first one
    sections.forEach((section, index) => {
        console.log('Initializing section:', section.id);
        if (index === 0) {
            section.style.display = 'block';
            section.classList.add('active');
        } else {
            section.style.display = 'none';
            section.classList.remove('active');
        }
    });
    
    // Set first nav item as active
    navItems[0].classList.add('active');
    
    // Load initial section data
    loadSectionData(sections[0].id);
});
