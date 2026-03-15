// --- Custom Notification System ---
window.showNotification = (message, type = 'info', title = 'Zenvora') => {
    let container = document.querySelector('.zen-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'zen-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `zen-toast ${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <div class="zen-toast-content">
            <span class="zen-toast-title">${title}</span>
            <span class="zen-toast-message">${message}</span>
        </div>
        <div class="zen-toast-close"><i class="fa-solid fa-xmark"></i></div>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto close
    const closeToast = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    };

    const timer = setTimeout(closeToast, 5000);

    toast.querySelector('.zen-toast-close').onclick = () => {
        clearTimeout(timer);
        closeToast();
    };
};

// Override standard alert
window.alert = (msg) => window.showNotification(msg, 'info');

// --- Global Size Guide System ---
window.openSizeGuide = () => {
    let modal = document.getElementById('sizeGuideModal');
    if (!modal) {
        // Inject modal if not present
        const modalHTML = `
            <div id="sizeGuideModal" class="cart-overlay" style="display: flex; align-items: center; justify-content: center; z-index: 100001;">
                <div class="size-guide-modal active" id="sizeGuideContent">
                    <div class="size-guide-close" onclick="closeSizeGuide()"><i class="fa-solid fa-xmark"></i></div>
                    <div class="size-guide-header">
                        <h2>SIZE <span class="accent-text">GUIDE</span></h2>
                        <p>Standard Unisex Measurements / Inches</p>
                    </div>
                    <table class="size-table">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Chest</th>
                                <th>Length</th>
                                <th>Shoulder</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>S</td><td>38"</td><td>27"</td><td>16.5"</td></tr>
                            <tr><td>M</td><td>40"</td><td>28"</td><td>17.5"</td></tr>
                            <tr><td>L</td><td>42"</td><td>29"</td><td>18.5"</td></tr>
                            <tr><td>XL</td><td>44"</td><td>30"</td><td>19.5"</td></tr>
                            <tr><td>XXL</td><td>46"</td><td>31"</td><td>20.5"</td></tr>
                        </tbody>
                    </table>
                    <div class="size-note">
                        * Note: Measurements are approximate and may vary by 0.5" - 1" due to manual craftsmanship and fabric stretch. For an oversized look, we recommend sizing up.
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('sizeGuideModal');
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const content = document.getElementById('sizeGuideContent');
        if (content) content.classList.add('active');
    }, 10);
};

window.closeSizeGuide = () => {
    const modal = document.getElementById('sizeGuideModal');
    const content = document.getElementById('sizeGuideContent');
    if (content) content.classList.remove('active');
    setTimeout(() => {
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 400);
};

document.addEventListener('DOMContentLoaded', () => {
    // --- PRELOADER & ENTRANCE ---
    const preloader = document.querySelector('.preloader');
    if (!preloader) {
        document.body.classList.add('loaded');
    }

    // Global fail-safe: forced finish after 8 seconds (safety)
    let failSafe;

    const finishLoading = () => {
        if (preloader && !preloader.classList.contains('fade-out')) {
            console.log('Zenvora: Dismissing preloader...');
            preloader.classList.add('fade-out');
            document.body.classList.add('loaded');
            // Ensure interactions are unblocked immediately
            preloader.style.pointerEvents = 'none';
            if (failSafe) clearTimeout(failSafe);
        }
    };

    failSafe = setTimeout(finishLoading, 8000);

    // If this is NOT the cinematic preloader, dismiss it quickly!
    // We don't wait for 'window.load' (which waits for all images/audio) 
    // because that can take 1 minute on slow connections.
    if (preloader && preloader.id !== 'cinematicPreloader') {
        // Dismiss after 300ms of DOM ready for sub-pages
        setTimeout(finishLoading, 300);
    }

    // Safety: always try to dismiss on full window load too
    window.addEventListener('load', () => {
        if (preloader && preloader.id !== 'cinematicPreloader') {
            finishLoading();
        }
    });

    // Custom Cursor logic continues...

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
    let cart = [];
    try {
        const storedCart = localStorage.getItem('zenvora_cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            if (!Array.isArray(cart)) cart = [];
        }
    } catch(e) {
        console.error("Cart loading failed:", e);
        cart = [];
    }
    
    let deliveryCharge = parseFloat(localStorage.getItem('zenvora_delivery')) || 0;
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartToggle = document.getElementById('cartToggle');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalAmount = document.getElementById('cartTotal');
    const cartBadgeMobile = document.getElementById('cartCountMobile');
    const cartBadgeSidebar = document.getElementById('cartCount');

    // Define globals FIRST before any potential early returns or conditional logic

    const updateCartUI = () => {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; color: #666; margin-top: 50px;">
                    <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.2;"></i>
                    <p>Your bag is empty</p>
                </div>`;
            // Reset shipping bar
            const shipInfo = document.querySelector('.cart-shipping-info');
            if (shipInfo) shipInfo.style.display = 'none';
        } else {
            // Shipping Info removed as requested (no free delivery)
            const shipInfo = document.querySelector('.cart-shipping-info');
            if (shipInfo) shipInfo.style.display = 'none';

            cart.forEach((item, index) => {
                const qty = item.quantity || 1;
                subtotal += item.price * qty;
                itemCount += qty;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.style = "display: flex; gap: 15px; align-items: flex-start; margin-bottom: 25px; position: relative;";
                itemEl.innerHTML = `
                    <div style="width: 80px; height: 100px; border-radius: 4px; overflow: hidden; background: #111; flex-shrink: 0;">
                        <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/300x400?text=69+Store'">
                    </div>
                    <div style="flex: 1; min-width: 0; padding-right: 25px;">
                        <h4 style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.5px;">${item.name}</h4>
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">${item.size || 'M'}</p>
                        <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 12px;">LKR ${item.price.toLocaleString()}</p>
                        
                        <div class="cart-item-qty">
                            <div class="qty-btn" onclick="changeQuantity(${index}, -1)"><i class="fa-solid fa-minus"></i></div>
                            <div class="qty-val">${qty}</div>
                            <div class="qty-btn" onclick="changeQuantity(${index}, 1)"><i class="fa-solid fa-plus"></i></div>
                        </div>
                    </div>
                    <span style="position: absolute; top: 0; right: 0; font-size: 0.9rem; color: #fff; cursor: pointer; opacity: 0.6;" onclick="removeFromCart(${index})">
                        <i class="fa-solid fa-xmark"></i>
                    </span>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        let total = subtotal;
        if (deliveryCharge > 0 && cart.length > 0) {
            total += deliveryCharge;
            const deliveryEl = document.createElement('div');
            deliveryEl.className = 'cart-item';
            deliveryEl.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-top: 15px; border-top: 1px dashed var(--border-light);";
            deliveryEl.innerHTML = `
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Estimated Delivery</div>
                <div style="font-weight: 600; font-size: 0.85rem;">LKR ${deliveryCharge.toLocaleString()}.00</div>
            `;
            cartItemsContainer.appendChild(deliveryEl);
        }

        if (cartTotalAmount) cartTotalAmount.textContent = `LKR ${total.toLocaleString()}.00`;
        if (cartBadgeMobile) cartBadgeMobile.textContent = itemCount;
        if (cartBadgeSidebar) cartBadgeSidebar.textContent = `(${itemCount})`;
        localStorage.setItem('zenvora_cart', JSON.stringify(cart));
        
        // Update Order Summary in Modal if open
        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            orderSummary.innerHTML = `
                <div class="checkout-row"><span>Subtotal</span><span>LKR ${subtotal.toLocaleString()}.00</span></div>
                <div class="checkout-row"><span>Shipping</span><span>${deliveryCharge > 0 ? 'LKR ' + deliveryCharge.toLocaleString() + '.00' : 'FREE'}</span></div>
                <div class="checkout-row total"><span>Total</span><span>LKR ${total.toLocaleString()}.00</span></div>
            `;
        }
    };

    window.changeQuantity = (index, delta) => {
        cart[index].quantity = Math.max(1, (cart[index].quantity || 1) + delta);
        updateCartUI();
    };

    window.toggleCartNote = () => {
        const input = document.getElementById('cartNoteInput');
        if (input) input.classList.toggle('active');
    };

    window.addToCart = (id, name, price, image, size = 'M') => {
        // If first argument is an element (this), and second is ID
        if (typeof id === 'object' && name) {
            const productId = name;
            const product = (window.allProductsData && window.allProductsData[productId]) || 
                          (window.cachedProducts && window.cachedProducts[productId]);
            
            if (product) {
                id = productId;
                name = product.name;
                price = product.price;
                image = product.image;
            } else {
                console.error("Product data not found for ID:", productId);
                return;
            }
        }

        const existing = cart.find(i => i.id === id && i.size === size);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({ id, name, price, image, size, quantity: 1 });
        }
        
        updateCartUI();
        openCart();
        
        if (window.showNotification) {
            window.showNotification(`${name} added to bag`, 'success');
        }
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    const openCart = () => {
        if (cartSidebar) cartSidebar.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');
    };

    const closeCartFn = () => {
        if (cartSidebar) cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
    };
    window.closeCartFn = closeCartFn;

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartFn);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartFn);

    // --- CHECKOUT LOGIC ---
    let waNumber = '94671210164'; // Default

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
        }
    });

    const syncSettings = () => {
        if (window.firebaseDB) {
            const settingsRef = window.firebaseRef(window.firebaseDB, '69store/settings');
            window.firebaseOnValue(settingsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    if (data.waNumber) localStorage.setItem('zenvora_wa', data.waNumber);
                    if (data.deliveryCharge) {
                        const deliveryCharge = parseFloat(data.deliveryCharge);
                        localStorage.setItem('zenvora_delivery', deliveryCharge);
                        if (typeof updateCartUI === 'function') updateCartUI();
                    }
                }
            });
        }
    };

    window.addEventListener('firebaseStoreLoaded', syncSettings);
    if (window.firebaseStoreLoaded) syncSettings();

    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    const checkoutForm = document.getElementById('checkoutForm');

    if (checkoutModal) {
        // Auto-fill checkout form with logged-in user data
        function fillCheckoutFromUser() {
            const userData = localStorage.getItem('zenvora_user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    const nameField = document.getElementById('custName');
                    const phoneField = document.getElementById('custPhone');
                    const addressField = document.getElementById('custAddress');
                    if (nameField && user.firstName) nameField.value = (user.title ? user.title + ' ' : '') + user.firstName + ' ' + (user.lastName || '');
                    if (phoneField && user.phone) phoneField.value = user.phone;
                    if (addressField && user.address) addressField.value = user.address;
                } catch(e) {}
            }
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const cart = JSON.parse(localStorage.getItem('zenvora_cart')) || [];
                if (cart.length === 0) {
                    alert('Your cart is empty');
                    return;
                }
                
                // If user is not logged in, show login first
                const user = localStorage.getItem('zenvora_user');
                if (!user) {
                    localStorage.setItem('zenvora_redirect_after_login', window.location.href);
                    window.location.href = `login.html?return=${encodeURIComponent(window.location.pathname)}`;
                    return;
                }

                fillCheckoutFromUser();
                checkoutModal.classList.add('active');
            });
        }

        if (closeCheckout) {
            closeCheckout.addEventListener('click', () => {
                checkoutModal.classList.remove('active');
            });
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                finalizeOrder();
            });
        }

        // Auto-open checkout if returning from login
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('checkout') === 'true' || localStorage.getItem('zenvora_reopen_checkout')) {
            localStorage.removeItem('zenvora_reopen_checkout');
            const cart = JSON.parse(localStorage.getItem('zenvora_cart')) || [];
            if (cart.length > 0) {
                fillCheckoutFromUser();
                checkoutModal.classList.add('active');
            }
        }

        async function finalizeOrder() {
            const cart = JSON.parse(localStorage.getItem('zenvora_cart')) || [];
            const name = document.getElementById('custName').value;
            const phone = document.getElementById('custPhone').value;
            const address = document.getElementById('custAddress').value;
            const delivery = parseFloat(localStorage.getItem('zenvora_delivery')) || 350;
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal + delivery;

            const orderId = 'Z' + Date.now().toString().slice(-6);
            const orderData = {
                orderId,
                timestamp: new Date().toISOString(),
                customer: { name, phone, address },
                items: cart,
                subtotal,
                delivery,
                total,
                status: 'New'
            };

            try {
                // If firebase is ready, sync to DB
                if (window.firebaseDB) {
                    const ordersRef = window.firebaseRef(window.firebaseDB, '69store/orders');
                    await window.firebasePush(ordersRef, orderData);
                }

                // WhatsApp Integration
                const waNumber = localStorage.getItem('zenvora_wa') || '94671210164';
                let itemStr = cart.map(i => `- ${i.name} (${i.size}) x${i.quantity}`).join('%0A');
                const message = `*NEW ORDER: ${orderId}*%0A%0A*Customer:* ${name}%0A*Phone:* ${phone}%0A*Address:* ${address}%0A%0A*Items:*%0A${itemStr}%0A%0A*Subtotal:* LKR ${subtotal}%0A*Delivery:* LKR ${delivery}%0A*Total:* LKR ${total}%0A%0A_Thank you for shopping with ZENVORA!_`;
                
                localStorage.removeItem('zenvora_cart');
                updateCartUI();
                checkoutModal.classList.remove('active');
                
                // Show Success Overlay if available
                const successOverlay = document.getElementById('successOverlay');
                if (successOverlay) {
                    const sTitle = document.getElementById('sTitle');
                    const sMsg = document.getElementById('sMsg');
                    const sBtn = successOverlay.querySelector('.s-btn');
                    
                    if (sTitle) sTitle.textContent = 'ORDER RECORDED!';
                    if (sMsg) sMsg.innerHTML = `Your order <b>${orderId}</b> has been saved.<br><br>Please click the button below to finalize it on WhatsApp.`;
                    
                    if (sBtn) {
                        sBtn.textContent = 'COMPLETE ON WHATSAPP';
                        sBtn.onclick = () => {
                            window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
                            successOverlay.classList.remove('show');
                            window.location.href = 'index.html';
                        };
                    }
                    successOverlay.classList.add('show');
                } else {
                    // Fallback to notification and direct open
                    showNotification('Order recorded! Opening WhatsApp...', 'success', 'Zen Checkout');
                    setTimeout(() => {
                        window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
                        window.location.href = 'index.html';
                    }, 1500);
                }

            } catch (err) {
                console.error(err);
                alert('Checkout failed. Please try again.');
            }
        }
    };

    // Initial UI Update
    updateCartUI();

    // --- BACKGROUND MOTIVATIONAL MUSIC ---
    const audioSrc = 'assets/motivation.mp3';

    // Create audio element
    const audioEl = document.createElement('audio');
    audioEl.id = 'bgMusic';
    audioEl.src = audioSrc;
    audioEl.loop = true;
    audioEl.preload = 'auto'; // Force load as much as possible
    document.body.appendChild(audioEl);

    // Provide global access for preloader button to trigger it
    window.forcePlayMusic = () => {
        if (localStorage.getItem('zenvora_music') !== 'paused') {
            audioEl.play().catch(e => console.warn("Music blocked or failed:", e));
        }
    };

    // Fallback: if loop is ignored by browser, manually restart when ended
    audioEl.addEventListener('ended', () => {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
    });

    // Restore saved playback position from previous page (cross-page continuity)
    const savedTime = parseFloat(localStorage.getItem('zenvora_music_time') || '0');
    if (savedTime > 0 && isFinite(savedTime)) {
        audioEl.currentTime = savedTime;
    }

    // Save playback position every second so next page can resume from same spot
    setInterval(() => {
        if (!audioEl.paused && isFinite(audioEl.currentTime)) {
            localStorage.setItem('zenvora_music_time', audioEl.currentTime);
        }
    }, 1000);

    // --- AUTO STOP MUSIC WHEN LEAVING PAGE ---
    // Save position and pause audio when navigating away
    const stopMusicOnLeave = () => {
        if (isFinite(audioEl.currentTime) && audioEl.currentTime > 0) {
            localStorage.setItem('zenvora_music_time', audioEl.currentTime);
        }
        audioEl.pause();
    };
    window.addEventListener('pagehide', stopMusicOnLeave);
    window.addEventListener('beforeunload', stopMusicOnLeave);

    // Create premium floating sound toggle button
    const soundBtn = document.createElement('div');
    soundBtn.className = 'sound-toggle-btn';
    soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark" style="font-size: 1.1rem;"></i>';

    // Create Tooltip Popup
    const soundTip = document.createElement('div');
    soundTip.className = 'sound-tooltip';
    soundTip.innerHTML = `
        <div style="font-weight: 800; font-size: 0.7rem; color: var(--primary-color); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Audio Guide</div>
        <div style="font-size: 0.75rem; line-height: 1.4; color: #fff;">Enable music for the full cinematic experience, or mute here.</div>
        <div style="position: absolute; bottom: -6px; left: 20px; width: 12px; height: 12px; background: #111; transform: rotate(45deg); border-right: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);"></div>
    `;

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

    Object.assign(soundTip.style, {
        position: 'fixed',
        bottom: '95px',
        left: '30px',
        width: '200px',
        background: '#111',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'none'
    });

    // Hover effects via JS for safety
    soundBtn.onmouseover = () => { 
        soundBtn.style.background = 'rgba(35, 35, 35, 0.9)'; 
        soundBtn.style.transform = 'scale(1.05)'; 
    };
    soundBtn.onmouseout = () => { 
        soundBtn.style.background = 'rgba(15, 15, 15, 0.7)'; 
        soundBtn.style.transform = 'scale(1)'; 
    };

    document.body.appendChild(soundBtn);
    document.body.appendChild(soundTip);

    // Show tooltip if music is allowed but blocked
    const showTip = () => {
        soundTip.style.opacity = '1';
        soundTip.style.transform = 'translateY(0)';
        // Auto-hide after 10 seconds to keep UI clean
        setTimeout(hideTip, 10000);
    };
    const hideTip = () => {
        soundTip.style.opacity = '0';
        soundTip.style.transform = 'translateY(10px)';
    };

    // Hover to see tip again
    soundBtn.addEventListener('mouseenter', showTip);
    soundBtn.addEventListener('mouseleave', hideTip);

    // Sync button icon with audio state
    const updateSoundIcon = () => {
        const isPaused = audioEl.paused;
        soundBtn.innerHTML = isPaused
            ? '<i class="fa-solid fa-volume-xmark" style="font-size: 1.1rem; color: #666;"></i>'
            : '<i class="fa-solid fa-volume-high" style="font-size: 1.1rem; color: var(--primary-color, white);"></i>';
        
        if (!isPaused) hideTip();
    };

    // State management via local storage for permanent cross-tab muted state
    const isMusicAllowed = localStorage.getItem('zenvora_music') !== 'paused';

    if (isMusicAllowed) {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                localStorage.setItem('zenvora_music', 'playing');
                updateSoundIcon();
            }).catch(() => {
                // Autoplay blocked - show guidance
                updateSoundIcon();
                setTimeout(showTip, 2000);
            });
        }
    } else {
        updateSoundIcon();
    }

    // Toggle logic via user click
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideTip();
        if (audioEl.paused) {
            audioEl.play().then(() => {
                localStorage.setItem('zenvora_music', 'playing');
                updateSoundIcon();
            });
        } else {
            audioEl.pause();
            localStorage.setItem('zenvora_music', 'paused');
            localStorage.removeItem('zenvora_music_time');
            updateSoundIcon();
        }
    });

    // Start audio on first interaction anywhere if it hasn't been explicitly paused and was blocked
    const startAudioOnInteract = () => {
        if (localStorage.getItem('zenvora_music') !== 'paused' && audioEl.paused) {
            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    localStorage.setItem('zenvora_music', 'playing');
                    updateSoundIcon();
                    hideTip();
                    window.removeEventListener('click', startAudioOnInteract, true);
                    window.removeEventListener('keydown', startAudioOnInteract, true);
                    window.removeEventListener('touchstart', startAudioOnInteract, true);
                }).catch(() => {});
            }
        }
    };

    if (isMusicAllowed) {
        window.addEventListener('click', startAudioOnInteract, true);
        window.addEventListener('keydown', startAudioOnInteract, true);
        window.addEventListener('touchstart', startAudioOnInteract, true);
    }
});
