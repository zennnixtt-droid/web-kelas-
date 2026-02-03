// ===== AUTH FUNCTIONS =====
function initAuth() {
    // Load user data
    const userData = JSON.parse(localStorage.getItem('kelasGotuUser') || '{}');
    
    // Update UI with user info
    updateUserUI(userData);
    
    // Check session expiry every minute
    setInterval(checkSession, 60000);
}

function updateUserUI(userData) {
    const userNameElement = document.getElementById('userName');
    const dropdownNameElement = document.getElementById('dropdownName');
    const dropdownRoleElement = document.getElementById('dropdownRole');
    
    if (userData.name && userNameElement) {
        // Display name with role badge
        let roleBadge = '';
        switch(userData.role) {
            case 'admin': roleBadge = '<span class="role-badge role-admin">Admin</span>'; break;
            case 'ketua': roleBadge = '<span class="role-badge role-ketua">Ketua</span>'; break;
            case 'guru': roleBadge = '<span class="role-badge role-guru">Guru</span>'; break;
            default: roleBadge = '<span class="role-badge role-anggota">Anggota</span>';
        }
        
        userNameElement.innerHTML = `${userData.name} ${roleBadge}`;
        dropdownNameElement.textContent = userData.name;
        dropdownRoleElement.textContent = getRoleName(userData.role);
    }
}

function getRoleName(role) {
    const roles = {
        'admin': 'Administrator Sistem',
        'ketua': 'Ketua Kelas',
        'guru': 'Wali Kelas',
        'anggota': 'Anggota Kelas',
        'member': 'Anggota Kelas'
    };
    return roles[role] || 'Pengguna';
}

function checkSession() {
    const loginTime = localStorage.getItem('kelasGotuLoginTime');
    if (!loginTime) return;
    
    const hoursDiff = (new Date() - new Date(loginTime)) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        showSessionExpiredModal();
    } else if (hoursDiff > 23) {
        // Warn user 1 hour before expiry
        showToast('Sesi akan berakhir dalam 1 jam. Silakan save pekerjaan Anda.', 'warning');
    }
}

function showSessionExpiredModal() {
    const modalHTML = `
        <div class="modal-overlay" id="sessionModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Sesi Telah Berakhir</h3>
                    <button class="modal-close" onclick="closeSessionModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Sesi login Anda telah berakhir karena tidak aktif selama 24 jam.</p>
                    <p>Silakan login kembali untuk melanjutkan.</p>
                </div>
                <div class="modal-footer" style="padding:20px;background:#f8f9fa;">
                    <button class="btn-primary" onclick="logout()">Login Kembali</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('sessionModal');
    if (existingModal) existingModal.remove();
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('sessionModal').style.display = 'flex';
}

function closeSessionModal() {
    const modal = document.getElementById('sessionModal');
    if (modal) modal.remove();
}

function showProfile() {
    const userData = JSON.parse(localStorage.getItem('kelasGotuUser') || '{}');
    
    const modalHTML = `
        <div class="modal-overlay" id="profileModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> Profil Pengguna</h3>
                    <button class="modal-close" onclick="closeModal('profileModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div class="member-avatar" style="width: 100px; height: 100px; margin: 0 auto 15px;">
                            <i class="fas fa-user" style="font-size: 2.5rem;"></i>
                        </div>
                        <h3>${userData.name || 'Pengguna'}</h3>
                        <p>${getRoleName(userData.role)}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" class="form-control" value="${userData.username || ''}" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label>Tipe Login</label>
                        <input type="text" class="form-control" value="${userData.loginType === 'multi' ? 'Multi User' : 'Single Password'}" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label>Login Terakhir</label>
                        <input type="text" class="form-control" value="${new Date(localStorage.getItem('kelasGotuLoginTime')).toLocaleString('id-ID')}" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label>Durasi Sesi</label>
                        <input type="text" class="form-control" id="sessionDuration" readonly>
                    </div>
                </div>
                <div class="modal-footer" style="padding:20px;background:#f8f9fa;">
                    <div class="btn-group">
                        <button class="btn-secondary" onclick="closeModal('profileModal')">Tutup</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('profileModal');
    if (existingModal) existingModal.remove();
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Calculate session duration
    const loginTime = new Date(localStorage.getItem('kelasGotuLoginTime'));
    const now = new Date();
    const diffMs = now - loginTime;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('sessionDuration').value = `${diffHrs} jam ${diffMins} menit`;
    
    document.getElementById('profileModal').style.display = 'flex';
}

function changePassword() {
    const modalHTML = `
        <div class="modal-overlay" id="passwordModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Ganti Password</h3>
                    <button class="modal-close" onclick="closeModal('passwordModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="changePasswordForm">
                        <div class="form-group">
                            <label>Password Lama</label>
                            <input type="password" class="form-control" id="oldPassword" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Password Baru</label>
                            <input type="password" class="form-control" id="newPassword" required minlength="6">
                            <small style="color:#666;">Minimal 6 karakter</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Konfirmasi Password Baru</label>
                            <input type="password" class="form-control" id="confirmPassword" required>
                        </div>
                        
                        <div class="checkbox-group" style="margin:20px 0;">
                            <input type="checkbox" id="showNewPassword">
                            <label for="showNewPassword">Tampilkan Password</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="padding:20px;background:#f8f9fa;">
                    <div class="btn-group">
                        <button class="btn-secondary" onclick="closeModal('passwordModal')">Batal</button>
                        <button class="btn-primary" onclick="saveNewPassword()">Simpan Password</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('passwordModal');
    if (existingModal) existingModal.remove();
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show/hide password
    document.getElementById('showNewPassword').addEventListener('change', function() {
        const oldPass = document.getElementById('oldPassword');
        const newPass = document.getElementById('newPassword');
        const confirmPass = document.getElementById('confirmPassword');
        
        const type = this.checked ? 'text' : 'password';
        oldPass.type = type;
        newPass.type = type;
        confirmPass.type = type;
    });
    
    document.getElementById('passwordModal').style.display = 'flex';
}

function saveNewPassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validasi
    if (!oldPassword || !newPassword || !confirmPassword) {
        showToast('Semua field harus diisi!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password baru minimal 6 karakter!', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Password baru dan konfirmasi tidak cocok!', 'error');
        return;
    }
    
    // Simpan ke localStorage (simulasi)
    showToast('Password berhasil diubah!', 'success');
    closeModal('passwordModal');
}

function logout() {
    // Clear session data
    localStorage.removeItem('kelasGotuLoggedIn');
    localStorage.removeItem('kelasGotuUser');
    localStorage.removeItem('kelasGotuLoginTime');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
}

// Update initializeSystem function
function initializeSystem() {
    // Add auth initialization
    initAuth();
    
    // ... existing code ...
}