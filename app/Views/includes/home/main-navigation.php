<?php use Core\Session;?>

<!-- CSS for enhanced sidebar design -->
<style>
    /* Sidebar styling */
    .offcanvas.homeSidebar {
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
    
    /* Login button styling */
    .login-btn {
        border-radius: 8px;
        transition: all 0.2s ease;
        padding: 0.6rem 1rem;
    }
    
    .login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(13, 110, 253, 0.15);
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
<div class="offcanvas offcanvas-start homeSidebar" tabindex="-1" id="homeSidebar" aria-labelledby="homeSidebarLabel">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center">
            <img src="/assets/images/logo/Air-TechLogo.png" alt="Logo" class="rounded-circle me-2" width="40" height="40">
            <h5 class="offcanvas-title sidebar-brand m-0" id="homeSidebarLabel">AIR<span class="text-danger">PROTECH</span></h5>
        </div>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        <!-- Navigation Links -->
        <div class="list-group list-group-flush sidebar-nav mb-4">
            <a href="#hero" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-home me-3"></i> Home
            </a>
            <a href="#our-services" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-tools me-3"></i> Our Services
            </a>
            <a href="#featured-products" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-shopping-cart me-3"></i> Featured Products
            </a>
            <a href="#why-choose-us" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-check-circle me-3"></i> Why Choose Us
            </a>
            <a href="#contact" class="list-group-item list-group-item-action d-flex align-items-center">
                <i class="fas fa-envelope me-3"></i> Contact
            </a>
        </div>
        
        <!-- Login Button -->
        <div class="px-4">
            <a href="/login" class="btn btn-outline-danger w-100 login-btn">
                <i class="fas fa-sign-in-alt me-2"></i> Login
            </a>
        </div>
    </div>
</div>

<!-- Main Navigation -->
<nav class="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="#">
            <img src="/assets/images/logo/Air-TechLogo.png" alt="Logo" class="rounded-circle me-2" width="40" height="40">
            <span class="brand-text">AIR<span class="text-danger">PROTECH</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#homeSidebar" aria-controls="homeSidebar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item"><a class="nav-link" href="#hero">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#our-services">Our Services</a></li>
                <li class="nav-item"><a class="nav-link" href="#featured-products">Featured Products</a></li>
                <li class="nav-item"><a class="nav-link" href="#why-choose-us">Why Choose Us</a></li>
                <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
                <li class="nav-item"><a class="btn btn-danger ms-2" href="/login">Login</a></li>
            </ul>
        </div>
    </div>
</nav>

<!-- Add script to highlight active page -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Get current hash (section) from URL
        const currentHash = window.location.hash || "#hero";
        
        // Highlight desktop nav links
        const desktopLinks = document.querySelectorAll('#navbarNav .nav-link');
        desktopLinks.forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active', 'fw-bold');
            }
        });
        
        // Highlight sidebar links
        const sidebarLinks = document.querySelectorAll('#homeSidebar .list-group-item');
        sidebarLinks.forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active', 'fw-bold');
            }
        });
        
        // Update active link on scroll
        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('section[id]');
            let currentSection = "";
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                if(window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                    currentSection = "#" + section.getAttribute('id');
                }
            });
            
            if(currentSection) {
                // Update desktop links
                desktopLinks.forEach(link => {
                    link.classList.remove('active', 'fw-bold');
                    if(link.getAttribute('href') === currentSection) {
                        link.classList.add('active', 'fw-bold');
                    }
                });
                
                // Update sidebar links
                sidebarLinks.forEach(link => {
                    link.classList.remove('active', 'fw-bold');
                    if(link.getAttribute('href') === currentSection) {
                        link.classList.add('active', 'fw-bold');
                    }
                });
            }
        });
    });
</script> 