// script.js

// Initialize data storage
let selectedImages = [];

let users = JSON.parse(localStorage.getItem('bashachai_users')) || [];
let properties = JSON.parse(localStorage.getItem('bashachai_properties')) || [];
let currentUser = JSON.parse(localStorage.getItem('bashachai_currentUser')) || null;
let currentHostelType = 'boys';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    if (properties.length === 0) {
        initializeSampleProperties();
    }
    updateUI();
    displayProperties();
    displayHostels();
});

// Initialize sample properties
function initializeSampleProperties() {
    const sampleProperties = [
        {
            id: Date.now() + 1,
            title: "Modern 2BHK Apartment in Dhanmondi",
            type: "Apartment",
            area: "Dhanmondi",
            rent: 25000,
            address: "Road 15, Dhanmondi, Dhaka",
            description: "Spacious 2 bedroom apartment with modern amenities",
            images: [], // Add this line
            nearby: {
                hospital: "Square Hospital - 1.2km",
                school: "Scholastica School - 0.8km",
                university: "Dhaka University - 2.5km",
                restaurant: "Star Kabab - 0.3km"
            },
            reviews: [],
            ownerId: "sample",
            ownerName: "Sample Owner"
        },
        // Add images: [] to all other sample properties too
    ];
    
    properties = sampleProperties;
    localStorage.setItem('bashachai_properties', JSON.stringify(properties));
}

// Image handling functions
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('imageUploadSection').classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('imageUploadSection').classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('imageUploadSection').classList.remove('drag-over');

    const files = event.dataTransfer.files;
    processImageFiles(files);
}

function handleImageSelect(event) {
    const files = event.target.files;
    processImageFiles(files);
}

function processImageFiles(files) {
    if (selectedImages.length + files.length > 5) {
        alert('You can upload maximum 5 images!');
        return;
    }

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                selectedImages.push(e.target.result);
                displayImagePreviews();
            };
            reader.readAsDataURL(file);
        }
    });
}

function displayImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = selectedImages.map((img, index) => `
        <div class="image-preview">
            <img src="${img}" alt="Preview ${index + 1}">
            <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
        </div>
    `).join('');
}

function removeImage(index) {
    selectedImages.splice(index, 1);
    displayImagePreviews();
}

// Update UI based on login status
function updateUI() {
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    const userProfile = document.getElementById('userProfile');
    const ownerDashboard = document.getElementById('ownerDashboard');

    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;

        if (currentUser.role === 'owner') {
            ownerDashboard.style.display = 'block';
        }
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        userProfile.style.display = 'none';
        ownerDashboard.style.display = 'none';
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    if (modalId === 'addPropertyModal') {
        selectedImages = [];
        displayImagePreviews();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Register function
function register(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        alert('User already exists with this email!');
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        role
    };

    users.push(newUser);
    localStorage.setItem('bashachai_users', JSON.stringify(users));

    alert('Registration successful! Please login.');
    closeModal('registerModal');
    event.target.reset();
}

// Login function
function login(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('bashachai_currentUser', JSON.stringify(currentUser));
        updateUI();
        displayProperties();
        displayHostels();
        closeModal('loginModal');
        event.target.reset();
        alert('Login successful!');
    } else {
        alert('Invalid email or password!');
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('bashachai_currentUser');
    updateUI();
    displayProperties();
    displayHostels();
    alert('Logged out successfully!');
}

// Add property function
function addProperty(event) {
    event.preventDefault();
    
    if (!currentUser || currentUser.role !== 'owner') {
        alert('Only property owners can add properties!');
        return;
    }
    
    const newProperty = {
        id: Date.now(),
        title: document.getElementById('propTitle').value,
        type: document.getElementById('propType').value,
        area: document.getElementById('propArea').value,
        rent: parseInt(document.getElementById('propRent').value),
        address: document.getElementById('propAddress').value,
        description: document.getElementById('propDesc').value,
        images: [...selectedImages], // Add this line
        nearby: {
            hospital: document.getElementById('propNearbyHospital').value || "Not specified",
            school: document.getElementById('propNearbySchool').value || "Not specified",
            university: document.getElementById('propNearbyUniversity').value || "Not specified",
            restaurant: document.getElementById('propNearbyRestaurant').value || "Not specified"
        },
        reviews: [],
        ownerId: currentUser.id,
        ownerName: currentUser.name
    };
    
    properties.push(newProperty);
    localStorage.setItem('bashachai_properties', JSON.stringify(properties));
    
    displayProperties();
    displayHostels();
    closeModal('addPropertyModal');
    event.target.reset();
    selectedImages = []; // Add this line
    displayImagePreviews(); // Add this line
    alert('Property added successfully!');
}


// Delete property function
function deleteProperty(propertyId) {
    if (!currentUser) {
        alert('Please login to delete properties!');
        return;
    }

    const property = properties.find(p => p.id === propertyId);

    if (!property) {
        alert('Property not found!');
        return;
    }

    if (property.ownerId !== currentUser.id) {
        alert('You can only delete your own properties!');
        return;
    }

    if (confirm('Are you sure you want to delete this property?')) {
        properties = properties.filter(p => p.id !== propertyId);
        localStorage.setItem('bashachai_properties', JSON.stringify(properties));
        displayProperties();
        displayHostels();
        alert('Property deleted successfully!');
    }
}

// Display properties
function displayProperties() {
    const grid = document.getElementById('propertiesGrid');
    const regularProperties = properties.filter(p =>
        p.type !== 'Boys Hostel' && p.type !== 'Girls Hostel'
    );

    if (regularProperties.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No properties available</p>';
        return;
    }

    grid.innerHTML = regularProperties.map(property => createPropertyCard(property)).join('');
}

// Display hostels
function displayHostels() {
    const grid = document.getElementById('hostelsGrid');
    const hostelType = currentHostelType === 'boys' ? 'Boys Hostel' : 'Girls Hostel';
    const hostels = properties.filter(p => p.type === hostelType);

    if (hostels.length === 0) {
        grid.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No ${hostelType.toLowerCase()}s available</p>`;
        return;
    }

    grid.innerHTML = hostels.map(property => createPropertyCard(property)).join('');
}

// Show hostel type
function showHostelType(type) {
    currentHostelType = type;
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    displayHostels();
}

// Create property card
function createPropertyCard(property) {
    const avgRating = calculateAverageRating(property.reviews);
    const isOwner = currentUser && property.ownerId === currentUser.id;
    const hasImages = property.images && property.images.length > 0; // Add this line
    
    return `
        <div class="property-card">
            <div class="property-image">
                ${hasImages ? 
                    `<img src="${property.images[0]}" alt="${property.title}">` : 
                    '🏠'
                }
            </div>
            <div class="property-content">
                <h4 class="property-title">${property.title}</h4>
                <span class="property-type">${property.type}</span>
                <p class="property-location">📍 ${property.area}</p>
                <p class="property-rent">৳${property.rent.toLocaleString()}/month</p>
                
                <div class="property-nearby">
                    <h4>Nearby Facilities:</h4>
                    <div class="nearby-item">🏥 ${property.nearby.hospital}</div>
                    <div class="nearby-item">🏫 ${property.nearby.school}</div>
                    <div class="nearby-item">🎓 ${property.nearby.university}</div>
                    <div class="nearby-item">🍽️ ${property.nearby.restaurant}</div>
                </div>
                
                ${property.reviews.length > 0 ? `
                    <div class="property-rating">
                        <span class="stars">${'⭐'.repeat(Math.round(avgRating))}</span>
                        <span>(${property.reviews.length} reviews)</span>
                    </div>
                ` : ''}
                
                <div class="property-actions">
                    <button class="btn-view" onclick="viewPropertyDetail(${property.id})">View Details</button>
                    ${isOwner ? `
                        <button class="btn-delete" onclick="deleteProperty(${property.id})">Delete</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}


// Calculate average rating
function calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
}

// View property detail
function viewPropertyDetail(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const avgRating = calculateAverageRating(property.reviews);
    const hasImages = property.images && property.images.length > 0; // Add this line
    const content = document.getElementById('propertyDetailContent');
    
    content.innerHTML = `
        <div class="property-detail-header">
            <h2>${property.title}</h2>
            <span class="property-type">${property.type}</span>
        </div>
        
        ${hasImages ? `
            <div class="property-detail-images">
                ${property.images.map(img => `
                    <div class="detail-image">
                        <img src="${img}" alt="${property.title}">
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <div class="property-detail-info">
            <div class="info-item">
                <strong>Rent:</strong> ৳${property.rent.toLocaleString()}/month
            </div>
            <div class="info-item">
                <strong>Location:</strong> ${property.area}
            </div>
            <div class="info-item">
                <strong>Owner:</strong> ${property.ownerName}
            </div>
        </div>
        
        <div class="info-item">
            <strong>Address:</strong> ${property.address}
        </div>
        
        <div class="info-item">
            <strong>Description:</strong><br>${property.description}
        </div>
        
        <div class="nearby-facilities">
            <h4>Nearby Facilities:</h4>
            <div class="facility-grid">
                <div>🏥 ${property.nearby.hospital}</div>
                <div>🏫 ${property.nearby.school}</div>
                <div>🎓 ${property.nearby.university}</div>
                <div>🍽️ ${property.nearby.restaurant}</div>
            </div>
        </div>
        
        <div class="reviews-section">
            <h4>Reviews ${property.reviews.length > 0 ? `(${avgRating.toFixed(1)} ⭐)` : ''}</h4>
            
            ${property.reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <strong>${review.userName}</strong>
                        <span>${'⭐'.repeat(review.rating)}</span>
                    </div>
                    <p>${review.comment}</p>
                </div>
            `).join('') || '<p>No reviews yet</p>'}
            
            ${currentUser && currentUser.role === 'tenant' ? `
                <div class="review-form">
                    <h4>Add Your Review:</h4>
                    <select id="reviewRating">
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                    <textarea id="reviewComment" placeholder="Write your review..." rows="3"></textarea>
                    <button class="btn-primary" onclick="submitReview(${property.id})">Submit Review</button>
                </div>
            ` : ''}
        </div>
        
        ${currentUser && currentUser.role === 'tenant' ? `
            <button class="btn-primary" onclick="initiatePayment(${property.id})">Book Now</button>
        ` : ''}
    `;
    
    openModal('propertyDetailModal');
}


// Submit review
function submitReview(propertyId) {
    if (!currentUser || currentUser.role !== 'tenant') {
        alert('Only tenants can leave reviews!');
        return;
    }

    const rating = parseInt(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value.trim();

    if (!comment) {
        alert('Please write a review!');
        return;
    }

    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    property.reviews.push({
        userName: currentUser.name,
        userId: currentUser.id,
        rating,
        comment,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem('bashachai_properties', JSON.stringify(properties));
    alert('Review submitted successfully!');
    viewPropertyDetail(propertyId);
    displayProperties();
    displayHostels();
}

// Initiate payment
function initiatePayment(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    let finalRent = property.rent;
    let discount = 0;
    let isStudentDiscount = false;

    // Apply 20% student discount for hostels
    if ((property.type === 'Boys Hostel' || property.type === 'Girls Hostel') &&
        currentUser && currentUser.role === 'tenant') {
        discount = property.rent * 0.2;
        finalRent = property.rent - discount;
        isStudentDiscount = true;
    }

    const content = document.getElementById('paymentContent');
    content.innerHTML = `
        <div class="payment-details">
            <h4>${property.title}</h4>
            <p><strong>Original Rent:</strong> ৳${property.rent.toLocaleString()}</p>
            ${isStudentDiscount ? `
                <span class="discount-badge">Student Discount: -৳${discount.toLocaleString()} (20%)</span>
                <p><strong>Final Amount:</strong> ৳${finalRent.toLocaleString()}</p>
            ` : ''}
            
            <div class="payment-options">
                <button class="payment-btn" onclick="selectPaymentMethod('bKash', this)">
                    <div>💳 bKash</div>
                </button>
                <button class="payment-btn" onclick="selectPaymentMethod('Nagad', this)">
                    <div>💳 Nagad</div>
                </button>
                <button class="payment-btn" onclick="selectPaymentMethod('Rocket', this)">
                    <div>💳 Rocket</div>
                </button>
            </div>
            
            <div class="payment-form" id="paymentFormContainer" style="display: none;">
                <p>Selected: <strong id="selectedMethod"></strong></p>
                <input type="text" id="paymentNumber" placeholder="Your Mobile Number" required>
                <input type="text" id="transactionId" placeholder="Transaction ID" required>
                <button class="btn-primary" onclick="confirmPayment(${property.id}, ${finalRent})">Confirm Payment</button>
            </div>
        </div>
    `;

    closeModal('propertyDetailModal');
    openModal('paymentModal');
}

let selectedPaymentMethod = '';

// Select payment method
function selectPaymentMethod(method, button) {
    selectedPaymentMethod = method;

    // Remove selected class from all buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Add selected class to clicked button
    button.classList.add('selected');

    // Show payment form
    document.getElementById('paymentFormContainer').style.display = 'block';
    document.getElementById('selectedMethod').textContent = method;
}

// Confirm payment
function confirmPayment(propertyId, amount) {
    const paymentNumber = document.getElementById('paymentNumber').value.trim();
    const transactionId = document.getElementById('transactionId').value.trim();

    if (!selectedPaymentMethod) {
        alert('Please select a payment method!');
        return;
    }

    if (!paymentNumber || !transactionId) {
        alert('Please fill in all payment details!');
        return;
    }

    // Mock payment confirmation
    alert(`Payment Successful!\n\nMethod: ${selectedPaymentMethod}\nAmount: ৳${amount.toLocaleString()}\nTransaction ID: ${transactionId}\n\nYour booking is confirmed!`);

    closeModal('paymentModal');
    selectedPaymentMethod = '';
}

// Filter properties
function filterProperties() {
    const area = document.getElementById('areaFilter').value;
    const budget = document.getElementById('budgetFilter').value;
    const type = document.getElementById('typeFilter').value;

    let filtered = properties.filter(p => {
        // Exclude hostels from main properties
        if (p.type === 'Boys Hostel' || p.type === 'Girls Hostel') return false;

        let match = true;

        if (area && p.area !== area) match = false;

        if (budget) {
            const [min, max] = budget.split('-').map(Number);
            if (p.rent < min || p.rent > max) match = false;
        }

        if (type && p.type !== type) match = false;

        return match;
    });

    const grid = document.getElementById('propertiesGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No properties found matching your criteria</p>';
    } else {
        grid.innerHTML = filtered.map(property => createPropertyCard(property)).join('');
    }
}
