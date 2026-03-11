document.addEventListener('DOMContentLoaded', () => {
    // --- PRELOADER & ENTRANCE ---
    const preloader = document.querySelector('.preloader');

    const finishLoading = () => {
        if (preloader && !preloader.classList.contains('fade-out')) {
            preloader.classList.add('fade-out');
            document.body.classList.add('loaded');
        }
    };

    window.addEventListener('load', () => {
        // Small delay for smooth visual transition
        setTimeout(finishLoading, 800);
    });

    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        if (cursor) cursor.style.display = 'none';
        if (follower) follower.style.display = 'none';
    } else if (cursor && follower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 100);
        });
    }

    // Scroll Header
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (header) {
            window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
        }
    });

    // Hero Image Slider
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000); // Change slide every 5 seconds
    }

    // New Mobile Menu Logic
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    const navOverlay = document.createElement('div');
    navOverlay.className = 'cart-overlay';
    document.body.appendChild(navOverlay);

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeMobileMenu = () => {
            mobileMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
            // Also close any open submenus
            document.querySelectorAll('.has-submenu').forEach(sub => sub.classList.remove('active'));
        };

        if (closeMenu) closeMenu.addEventListener('click', closeMobileMenu);
        navOverlay.addEventListener('click', closeMobileMenu);

        // Close menu on link click only for final destination links
        mobileMenu.querySelectorAll('ul li a:not(.has-submenu > .submenu-header > a)').forEach(link => {
            if (!link.closest('.submenu-header')) {
                link.addEventListener('click', closeMobileMenu);
            }
        });

        // Mobile Submenu Accordion Logic
        const subheaders = mobileMenu.querySelectorAll('.submenu-header');
        subheaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const parent = header.parentElement;
                const isOpen = parent.classList.contains('active');

                // Close other submenus for cleaner UI
                mobileMenu.querySelectorAll('.has-submenu').forEach(item => {
                    item.classList.remove('active');
                });

                if (!isOpen) {
                    parent.classList.add('active');
                }
            });
        });
    }

    // --- DYNAMIC NAVIGATION ACTIVE STATE ---
    const updateNavActive = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        const gender = urlParams.get('gender');
        const cat = urlParams.get('cat');
        const hash = window.location.hash;

        // Reset all active states
        document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('active'));

        if (hash === '#reviews') {
            const reviewsLink = document.querySelector('nav ul li a[href*="#reviews"]');
            if (reviewsLink) reviewsLink.classList.add('active');
        } else if (path.includes('collection.html')) {
            if (gender === 'men') {
                const link = document.querySelector('nav ul li a[href*="gender=men"]');
                if (link) link.classList.add('active');
            } else if (gender === 'women') {
                const link = document.querySelector('nav ul li a[href*="gender=women"]');
                if (link) link.classList.add('active');
            } else if (cat === 'accessories') {
                const link = document.querySelector('nav ul li a[href*="cat=accessories"]');
                if (link) link.classList.add('active');
            }
        } else if (path.includes('index.html') || path === '/' || path === '' || path.endsWith('/')) {
            const homeLink = document.querySelector('nav ul li a[href="index.html"]');
            if (homeLink) homeLink.classList.add('active');
        }
    };

    updateNavActive();
    window.addEventListener('hashchange', updateNavActive);

    // --- CART SYSTEM ---
    let cart = JSON.parse(localStorage.getItem('zenvora_cart')) || [];
    let deliveryCharge = parseFloat(localStorage.getItem('zenvora_delivery')) || 0;
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartToggle = document.getElementById('cartToggle');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalAmount = document.getElementById('cartTotal');
    const cartBadgeMobile = document.getElementById('cartCountMobile');
    const cartBadgeSidebar = document.getElementById('cartCount');

    const updateCartUI = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div style="text-align: center; color: #666; margin-top: 50px;">Your bag is empty</div>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * (item.quantity || 1);
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.style = "display: flex; gap: 20px; align-items: center; margin-bottom: 25px;";
                itemEl.innerHTML = `
                    <div style="width: 70px; height: 90px; border-radius: 8px; overflow: hidden; background: #1a1a1a; flex-shrink: 0;">
                        <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h4>
                        <p style="font-size: 0.9rem; font-weight: 400; color: var(--text-muted); margin-bottom: 8px;">LKR ${item.price.toLocaleString()}</p>
                        <span style="font-size: 0.7rem; color: #ff3e3e; cursor: pointer; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;" onclick="removeFromCart(${index})">Remove</span>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            // Add Delivery Charge Row if cart not empty
            if (deliveryCharge > 0) {
                total += deliveryCharge;
                const deliveryEl = document.createElement('div');
                deliveryEl.className = 'cart-item';
                deliveryEl.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-top: 15px; border-top: 1px dashed var(--border-light);";
                deliveryEl.innerHTML = `
                    <div style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Delivery Fee</div>
                    <div style="font-weight: 600; font-size: 0.9rem;">LKR ${deliveryCharge.toLocaleString()}.00</div>
                `;
                cartItemsContainer.appendChild(deliveryEl);
            }
        }

        if (cartTotalAmount) cartTotalAmount.textContent = `LKR ${total.toLocaleString()}.00`;
        if (cartBadgeMobile) cartBadgeMobile.textContent = cart.length;
        if (cartBadgeSidebar) cartBadgeSidebar.textContent = `(${cart.length})`;
        localStorage.setItem('zenvora_cart', JSON.stringify(cart));
    };

    window.addToCart = (name, price, image) => {
        cart.push({ name, price, image, quantity: 1 });
        updateCartUI();
        openCart();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    const openCart = () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    };

    const closeCartFn = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartFn);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartFn);

    // --- CHECKOUT LOGIC ---
    let waNumber = '94701234567'; // Default

    window.addEventListener('firebaseStoreLoaded', () => {
        if (window.firebaseDB) {
            // Visitor Counter
            const vRef = window.firebaseRef(window.firebaseDB, '69store/visitors');
            window.firebaseOnValue(vRef, (snap) => {
                const count = snap.val() || 0;
                if (!sessionStorage.getItem('zenvora_v')) {
                    window.firebaseSet(vRef, count + 1);
                    sessionStorage.setItem('zenvora_v', '1');
                }
            }, { onlyOnce: true });

            // Brand Settings (WA & Delivery)
            const sRef = window.firebaseRef(window.firebaseDB, '69store/settings');
            window.firebaseOnValue(sRef, (snap) => {
                const data = snap.val();
                if (data) {
                    if (data.waNumber) waNumber = data.waNumber;
                    if (data.deliveryCharge !== undefined) {
                        deliveryCharge = parseFloat(data.deliveryCharge);
                        localStorage.setItem('zenvora_delivery', deliveryCharge);
                        updateCartUI();
                    }
                }
            });
        }
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    const checkoutForm = document.getElementById('checkoutForm');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return alert('Your cart is empty!');
            checkoutModal.style.display = 'flex';
        });
    }

    if (closeCheckout) closeCheckout.addEventListener('click', () => checkoutModal.style.display = 'none');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('custName').value;
            const address = document.getElementById('custAddress').value;
            const phone = document.getElementById('custPhone').value;

            const orderData = {
                customer: { name, address, phone },
                items: cart,
                total: cart.reduce((acc, item) => acc + item.price, 0),
                timestamp: new Date().toISOString(),
                status: 'New'
            };

            if (window.firebaseDB) {
                const ordersRef = window.firebaseRef(window.firebaseDB, '69store/orders');
                window.firebasePush(ordersRef, orderData).then(() => {
                    const message = encodeURIComponent(
                        `*NEW ORDER - ZENVORA*\n\n` +
                        `*Customer:* ${name}\n` +
                        `*Phone:* ${phone}\n` +
                        `*Address:* ${address}\n\n` +
                        `*Items:*\n${cart.map(i => `- ${i.name} (LKR ${i.price})`).join('\n')}\n` +
                        (deliveryCharge > 0 ? `*Delivery Fee:* LKR ${deliveryCharge.toLocaleString()}\n` : '') + `\n` +
                        `*Total:* LKR ${(orderData.total + (deliveryCharge || 0)).toLocaleString()}.00`
                    );
                    window.open(`https://wa.me/${waNumber}?text=${message}`);

                    cart = [];
                    updateCartUI();
                    checkoutModal.style.display = 'none';
                    closeCartFn();
                    alert('Order placed successfully! Redirecting to WhatsApp...');
                });
            }
        });
    }

    // Initial UI Update
    updateCartUI();

    // --- BACKGROUND MOTIVATIONAL MUSIC ---
    const audioSrc = 'assets/motivation.mp3';

    // Create audio element
    const audioEl = document.createElement('audio');
    audioEl.id = 'bgMusic';
    audioEl.src = audioSrc;
    audioEl.loop = true;
    document.body.appendChild(audioEl);

    // Create premium floating sound toggle button
    const soundBtn = document.createElement('div');
    soundBtn.className = 'sound-toggle-btn';
    soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark" style="font-size: 1.1rem;"></i>';

    // Floating style properties
    Object.assign(soundBtn.style, {
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        width: '50px',
        height: '50px',
        background: 'rgba(15, 15, 15, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: '9998',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease'
    });

    // Hover effects via JS for safety
    soundBtn.onmouseover = () => { soundBtn.style.background = 'rgba(35, 35, 35, 0.9)'; soundBtn.style.transform = 'scale(1.05)'; };
    soundBtn.onmouseout = () => { soundBtn.style.background = 'rgba(15, 15, 15, 0.7)'; soundBtn.style.transform = 'scale(1)'; };

    document.body.appendChild(soundBtn);

    // Sync button icon with audio state
    const updateSoundIcon = () => {
        soundBtn.innerHTML = audioEl.paused
            ? '<i class="fa-solid fa-volume-xmark" style="font-size: 1.1rem; color: #666;"></i>'
            : '<i class="fa-solid fa-volume-high" style="font-size: 1.1rem; color: var(--primary-color, white);"></i>';
    };

    // State management via local storage for permanent cross-tab muted state
    // Default to 'playing' unless explicitly 'paused' by the user.
    const isMusicAllowed = localStorage.getItem('zenvora_music') !== 'paused';

    if (isMusicAllowed) {
        // Aggressively attempt to play
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                localStorage.setItem('zenvora_music', 'playing');
                updateSoundIcon();
            }).catch(() => {
                // Browser blocked autoplay (needs interaction). Icon shows muted state.
                updateSoundIcon();
            });
        }
    } else {
        updateSoundIcon();
    }

    // Toggle logic via user click
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audioEl.paused) {
            audioEl.play().then(() => {
                localStorage.setItem('zenvora_music', 'playing');
                updateSoundIcon();
            });
        } else {
            audioEl.pause();
            localStorage.setItem('zenvora_music', 'paused');
            updateSoundIcon();
        }
    });

    // Start audio on first interaction anywhere if it hasn't been explicitly paused and was blocked
    const startAudioOnInteract = () => {
        if (localStorage.getItem('zenvora_music') !== 'paused') {
            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    localStorage.setItem('zenvora_music', 'playing');
                    updateSoundIcon();
                    // Successfully played, remove listeners
                    window.removeEventListener('click', startAudioOnInteract, true);
                    window.removeEventListener('keydown', startAudioOnInteract, true);
                    window.removeEventListener('touchstart', startAudioOnInteract, true);
                }).catch((e) => {
                    // Still blocked, keep trying on next valid interaction
                });
            }
        }
    };

    if (isMusicAllowed) {
        // Attach varied listeners to window with 'capture: true' to catch the absolute earliest interaction
        // Note: Chrome only considers 'click', 'touchstart', and 'keydown' as valid user gestures for audio unblocking. 'scroll' will fail and might cause permanent blocking if spammed.
        window.addEventListener('click', startAudioOnInteract, true);
        window.addEventListener('keydown', startAudioOnInteract, true);
        window.addEventListener('touchstart', startAudioOnInteract, true);
    }
});
