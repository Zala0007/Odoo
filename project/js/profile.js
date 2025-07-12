// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
    
    initializeProfilePage();
});

function initializeProfilePage() {
    loadCurrentProfile();
    setupSkillsInput();
    setupPhotoUpload();
    setupFormSubmission();
}

function loadCurrentProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Populate form fields
    document.getElementById('userName').value = currentUser.name;
    document.getElementById('userLocation').value = currentUser.location || '';
    document.getElementById('profilePhotoPreview').src = currentUser.profilePhoto;
    document.getElementById('isPublic').checked = currentUser.isPublic;
    
    // Load skills offered
    const skillsOfferedTags = document.getElementById('skillsOfferedTags');
    skillsOfferedTags.innerHTML = '';
    currentUser.skillsOffered.forEach(skill => {
        addSkillTag(skillsOfferedTags, skill, 'skillsOffered');
    });
    
    // Load skills wanted
    const skillsWantedTags = document.getElementById('skillsWantedTags');
    skillsWantedTags.innerHTML = '';
    currentUser.skillsWanted.forEach(skill => {
        addSkillTag(skillsWantedTags, skill, 'skillsWanted');
    });
    
    // Load availability
    const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]');
    availabilityCheckboxes.forEach(checkbox => {
        checkbox.checked = currentUser.availability.includes(checkbox.value);
    });
}

function setupSkillsInput() {
    const skillsOfferedInput = document.getElementById('skillsOfferedInput');
    const skillsWantedInput = document.getElementById('skillsWantedInput');
    
    skillsOfferedInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkillFromInput(this, 'skillsOfferedTags', 'skillsOffered');
        }
    });
    
    skillsWantedInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkillFromInput(this, 'skillsWantedTags', 'skillsWanted');
        }
    });
}

function addSkillFromInput(input, tagsContainerId, skillType) {
    const skill = input.value.trim();
    if (!skill) return;
    
    const tagsContainer = document.getElementById(tagsContainerId);
    const existingSkills = Array.from(tagsContainer.children).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
    
    if (existingSkills.includes(skill)) {
        alert('This skill is already added');
        input.value = '';
        return;
    }
    
    addSkillTag(tagsContainer, skill, skillType);
    input.value = '';
}

function addSkillTag(container, skill, skillType) {
    const tag = document.createElement('span');
    tag.className = `skill-tag ${skillType === 'skillsOffered' ? 'offered' : 'wanted'}`;
    tag.innerHTML = `
        ${skill}
        <button type="button" onclick="removeSkillTag(this)" style="margin-left: 8px; background: none; border: none; color: inherit; cursor: pointer;">×</button>
    `;
    container.appendChild(tag);
}

function removeSkillTag(button) {
    button.parentElement.remove();
}

function setupPhotoUpload() {
    const photoPreview = document.querySelector('.photo-preview');
    const photoInput = document.getElementById('profilePhoto');
    
    photoPreview.addEventListener('click', function() {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profilePhotoPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function setupFormSubmission() {
    const profileForm = document.getElementById('profileForm');
    const discardBtn = document.getElementById('discardBtn');
    
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    discardBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to discard all changes?')) {
            loadCurrentProfile();
        }
    });
}

function saveProfile() {
    const currentUser = getCurrentUser();
    
    // Get form data
    const formData = {
        name: document.getElementById('userName').value.trim(),
        location: document.getElementById('userLocation').value.trim(),
        profilePhoto: document.getElementById('profilePhotoPreview').src,
        isPublic: document.getElementById('isPublic').checked
    };
    
    // Get skills offered
    const skillsOfferedTags = document.getElementById('skillsOfferedTags');
    formData.skillsOffered = Array.from(skillsOfferedTags.children).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
    
    // Get skills wanted
    const skillsWantedTags = document.getElementById('skillsWantedTags');
    formData.skillsWanted = Array.from(skillsWantedTags.children).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
    
    // Get availability
    const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]:checked');
    formData.availability = Array.from(availabilityCheckboxes).map(cb => cb.value);
    
    // Validation
    if (!formData.name) {
        alert('Name is required');
        return;
    }
    
    if (formData.skillsOffered.length === 0) {
        alert('Please add at least one skill you can offer');
        return;
    }
    
    if (formData.skillsWanted.length === 0) {
        alert('Please add at least one skill you want to learn');
        return;
    }
    
    // Update user
    const updatedUser = { ...currentUser, ...formData };
    updateUser(updatedUser);
    
    // Show success message
    alert('Profile updated successfully!');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Make functions globally accessible
window.removeSkillTag = removeSkillTag;