<?php use Core\Session;?>

<!-- CSS for enhanced sidebar design -->
<style>
    /* Sidebar styling */
    .offcanvas.userSidebar {
        border-right: none;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        max-width: 300px;
    }
    
    .offcanvas-header {
        background-color: #f8f9fa;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        padding: 1rem 1.5rem;
    }
    
    .sidebar-brand {
        font-weight: 700;
        font-size: 1.4rem;
        letter-spacing: -0.5px;
        padding-left: 0.5rem;
    }
    
    .offcanvas-body {
        padding: 1.5rem 0;
        display: flex;
        flex-direction: column;
        height: calc(100% - 74px);
    }
    
    /* User profile card styling */
    .sidebar-profile-card {
        background-color: #f8f9fa;
        border: none;
        border-radius: 12px;
        overflow: hidden;
        margin: 0 1.5rem 1.5rem;
        transition: all 0.3s ease;
    }
    
    .sidebar-profile-card .card-body {
        padding: 1.25rem;
    }
    
    .sidebar-profile-img {
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        transition: transform 0.3s ease;
    }
    
    /* Navigation links styling */
    .sidebar-nav {
        margin-bottom: 1.5rem;
        overflow: hidden;
    }
    
    .sidebar-nav .list-group-item {
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-color: rgba(0,0,0,0.05);
        padding: 0.8rem 1.5rem;
        margin: 0;
        transition: all 0.2s ease;
    }
    
    .sidebar-nav .list-group-item:first-child {
        border-top: none;
    }
    
    .sidebar-nav .list-group-item:last-child {
        border-bottom: none;
    }
    
    .sidebar-nav .list-group-item:hover {
        background-color: rgba(13, 110, 253, 0.05);
    }
    
    .sidebar-nav .list-group-item.active {
        background-color: rgba(13, 110, 253, 0.1);
        color: var(--bs-primary);
        border-left: 3px solid var(--bs-primary);
        padding-left: calc(1.5rem - 3px);
        font-weight: 600;
    }
    
    .sidebar-nav .list-group-item i {
        width: 24px;
        text-align: center;
        font-size: 0.9rem;
        opacity: 0.8;
    }
    
    .sidebar-nav .list-group-item.active i {
        opacity: 1;
        color: var(--bs-primary);
    }
    
    /* Logout button styling */
    .sidebar-logout-container {
        margin-top: auto;
        padding: 0 2.5rem;
    }
    
    .sidebar-logout {
        border-radius: 8px;
        transition: all 0.2s ease;
        padding: 0.6rem 1rem;
    }
    
    .sidebar-logout:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(220, 53, 69, 0.15);
    }
    
    /* Online indicator */
    .online-indicator {
        display: inline-flex;
        align-items: center;
    }
    
    .online-indicator::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #10b981;
        margin-right: 6px;
    }
    
    /* Navbar - active link styling */
    #navbarNav .nav-link.active {
        position: relative;
        color: var(--bs-primary);
    }
    
    #navbarNav .nav-link.active::after {
        content: '';
        position: absolute;
        left: 0.5rem;
        right: 0.5rem;
        bottom: 0;
        height: 3px;
        background-color: var(--bs-primary);
        border-radius: 3px 3px 0 0;
    }
</style>

<!-- Mobile Sidebar Overlay -->
<div class="offcanvas offcanvas-start userSidebar" tabindex="-1" id="userSidebar" aria-labelledby="userSidebarLabel">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center ps-3">
            <img src="/assets/images/logo/Air-TechLogo.png" alt="Logo" class="rounded-circle me-2" width="40" height="40">
            <h5 class="offcanvas-title sidebar-brand m-0" id="userSidebarLabel">AIR<span class="text-danger">PROTECH</span></h5>
        </div>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        <!-- User Profile Card -->
        <div class="card sidebar-profile-card">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <img src="<?= Session::get('profile_url') ? Session::get('profile_url') : '/assets/images/user-profile/default-profile.png' ?>" alt="Profile" class="rounded-circle sidebar-profile-img me-3" width="50" height="50" style="object-fit: cover;">
                    <div>
                        <h6 class="mb-1 fw-semibold"><?=$_SESSION['full_name'] ?? 'User'?></h6>
                        <span class="text-muted small d-block mb-1"><?=$_SESSION['email'] ?? ''?></span>
                        <div class="small online-indicator text-success">Online</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Navigation Links -->
        <div class="list-group list-group-flush sidebar-nav mb-4 ps-3">
            <a href="/user/services" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-tools me-3"></i> Services
            </a>
            <a href="/user/products" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-shopping-cart me-3"></i> Products
            </a>
            <a href="/user/my-bookings" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-calendar-check me-3"></i> My Bookings & Service Requests
            </a>
            <a href="/user/profile" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-user me-3"></i> My Profile
            </a>
        </div>
        
        <!-- Logout Link -->
        <div class="sidebar-logout-container">
            <a href="/logout" class="btn btn-outline-danger w-100 sidebar-logout">
                <i class="fas fa-sign-out-alt me-2"></i> Logout
            </a>
        </div>
    </div>
</div>

<!-- Main Navigation -->
<nav class="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="/">
            <img src="/assets/images/logo/Air-TechLogo.png" alt="Logo" class="rounded-circle me-2" width="40" height="40">
            <span class="brand-text">AIR<span class="text-danger">PROTECH</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#userSidebar" aria-controls="userSidebar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item"><a class="nav-link" href="/user/services">Services</a></li>
                <li class="nav-item"><a class="nav-link" href="/user/products">Products</a></li>
                <li class="nav-item"><a class="nav-link" href="/user/my-bookings">My Bookings & Service Requests</a></li>
                <!-- User Profile -->
                <li class="nav-item dropdown ms-3">
                    <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="<?= Session::get('profile_url') ? Session::get('profile_url') : '/assets/images/user-profile/default-profile.png' ?>" alt="Profile" class="rounded-circle me-2" width="36" height="36" style="object-fit: cover;">
                        <div class="d-flex flex-column lh-sm">
                            <span class="fw-semibold small text-dark"><?=$_SESSION['full_name'] ?? 'User'?></span>
                            <small class="text-success online-indicator">Online</small>
                        </div>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="/user/profile">Profile</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="/logout">Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>

<!-- Add script to highlight active page -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Get current page URL
        const currentPage = window.location.pathname;
        
        // Highlight desktop nav links
        const desktopLinks = document.querySelectorAll('#navbarNav .nav-link');
        desktopLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active', 'fw-bold');
            }
        });
        
        // Highlight sidebar links
        const sidebarLinks = document.querySelectorAll('#userSidebar .list-group-item');
        sidebarLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active', 'fw-bold');
            }
        });
    });
</script> 
