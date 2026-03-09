document.addEventListener('DOMContentLoaded', () => {
    // --- UI HELPERS ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 500);
            }
        }, 1500);
    });

    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    // Disable cursor on mobile/touch devices
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

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars-staggered');
            menuToggle.querySelector('i').classList.toggle('fa-xmark');
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-xmark');
                menuToggle.querySelector('i').classList.add('fa-bars-staggered');
            });
        });
    }

    // --- CART SYSTEM ---
    let cart = JSON.parse(localStorage.getItem('69store_cart')) || [];
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartTrigger = document.getElementById('cartTrigger');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const cartBadge = document.querySelector('.cart-count');

    const updateCartUI = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty-msg">Your bag is empty</div>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * (item.quantity || 1);
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.image}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>LKR ${item.price.toLocaleString()}</p>
                        <span class="remove-item" onclick="removeFromCart(${index})">Remove</span>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartTotalAmount.textContent = `LKR ${total.toLocaleString()}.00`;
        cartBadge.textContent = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        localStorage.setItem('69store_cart', JSON.stringify(cart));
    };

    window.addToCart = (name, price, image) => {
        cart.push({ name, price, image, quantity: 1 });
        updateCartUI();
        openCart();

        // Notification
        const btn = event.target;
        if (btn.classList.contains('btn')) {
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
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

    if (cartTrigger) cartTrigger.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartFn);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartFn);

    // --- CHECKOUT LOGIC ---
    let waNumber = '94701234567'; // Default

    // Fetch Settings
    window.addEventListener('firebaseStoreLoaded', () => {
        if (window.firebaseDB) {
            // Visitor Counter
            const vRef = window.firebaseRef(window.firebaseDB, '69store/visitors');
            window.firebaseOnValue(vRef, (snap) => {
                const count = snap.val() || 0;
                // Use a flag to only increment once per session
                if (!sessionStorage.getItem('69v')) {
                    window.firebaseSet(vRef, count + 1);
                    sessionStorage.setItem('69v', '1');
                }
            }, { onlyOnce: true });

            // WA Number
            const sRef = window.firebaseRef(window.firebaseDB, '69store/settings/waNumber');
            window.firebaseOnValue(sRef, (snap) => {
                if (snap.val()) waNumber = snap.val();
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
            checkoutModal.classList.add('active');
        });
    }

    if (closeCheckout) closeCheckout.addEventListener('click', () => checkoutModal.classList.remove('active'));

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

            // Save to Firebase
            if (window.firebaseDB) {
                const ordersRef = window.firebaseRef(window.firebaseDB, '69store/orders');
                window.firebasePush(ordersRef, orderData).then(() => {
                    // Send WhatsApp Message
                    const message = encodeURIComponent(
                        `*NEW ORDER - 69 STORE*\n\n` +
                        `*Customer:* ${name}\n` +
                        `*Phone:* ${phone}\n` +
                        `*Address:* ${address}\n\n` +
                        `*Items:*\n${cart.map(i => `- ${i.name} (LKR ${i.price})`).join('\n')}\n\n` +
                        `*Total:* LKR ${orderData.total.toLocaleString()}.00`
                    );
                    window.open(`https://wa.me/${waNumber}?text=${message}`);

                    // Clear Cart
                    cart = [];
                    updateCartUI();
                    checkoutModal.classList.remove('active');
                    closeCartFn();
                    alert('Order placed successfully! Redirecting to WhatsApp for confirmation.');
                });
            } else {
                alert('Database connection failed. Please try again.');
            }
        });
    }

    // --- DYNAMIC PRODUCTS ---
    const loadProducts = () => {
        console.log("Loading products from Firebase...");
        if (!window.firebaseDB) {
            console.error("Firebase DB not initialized in script.js");
            return;
        }

        const productGrid = document.getElementById('productGrid') || document.querySelector('.product-grid');
        if (!productGrid) {
            console.error("Product grid container not found");
            return;
        }

        const productsRef = window.firebaseRef(window.firebaseDB, '69store/products');
        window.firebaseOnValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Product data received:", data);

            productGrid.innerHTML = '';

            const renderProduct = (product) => {
                const card = document.createElement('div');
                card.className = 'product-card animate-up';
                card.innerHTML = `
                    <div class="product-img">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x400?text=Product'">
                        <div class="product-overlay">
                            <button class="btn btn-primary" style="width: 100%;" onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">Add to Cart</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>LKR ${product.price.toLocaleString()}.00</p>
                    </div>
                `;
                productGrid.appendChild(card);
            };

            if (data && Object.keys(data).length > 0) {
                Object.keys(data).forEach(key => renderProduct(data[key]));
            } else {
                console.log("No dynamic products found, using fallbacks.");
                const fallbacks = [
                    { name: "69 Stealth Hoodie", price: 8500, image: "assets/hoodie.png" },
                    { name: "69 Core Boxy Tee", price: 4900, image: "assets/tee.png" },
                    { name: "69 Crimson Pulse Hoodie", price: 9200, image: "assets/hoodie.png" }
                ];
                fallbacks.forEach(renderProduct);
            }
        });
    };

    // --- REVIEWS SYSTEM ---
    const reviewForm = document.getElementById('reviewForm');
    const reviewsContainer = document.getElementById('reviewsContainer');

    const loadReviews = () => {
        if (!window.firebaseDB || !reviewsContainer) return;
        const revRef = window.firebaseRef(window.firebaseDB, '69store/reviews');
        window.firebaseOnValue(revRef, (snapshot) => {
            const data = snapshot.val();
            reviewsContainer.innerHTML = '';
            if (data) {
                Object.keys(data).reverse().slice(0, 6).forEach(key => {
                    const r = data[key];
                    const card = document.createElement('div');
                    card.className = 'admin-card animate-up';
                    card.style.margin = "0";
                    card.innerHTML = `
                        <p style="font-style: italic; color: var(--text-dim); margin-bottom: 15px;">"${r.msg}"</p>
                        <h4 style="color: var(--primary-color); font-size: 0.9rem;">- ${r.name}</h4>
                    `;
                    reviewsContainer.appendChild(card);
                });
            } else {
                reviewsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">No reviews yet. Be the first!</p>';
            }
        });
    };

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('revName').value;
            const msg = document.getElementById('revMsg').value;

            if (window.firebaseDB) {
                const revRef = window.firebaseRef(window.firebaseDB, '69store/reviews');
                window.firebasePush(revRef, { name, msg, timestamp: new Date().toISOString() })
                    .then(() => {
                        reviewForm.reset();
                        alert('Thank you for your feedback!');
                    });
            }
        });
    }

    const initFirebaseData = () => {
        loadProducts();
        loadReviews();
    };

    if (window.firebaseDB) {
        initFirebaseData();
    } else {
        window.addEventListener('firebaseStoreLoaded', initFirebaseData);
    }

    // Initial UI Update
    updateCartUI();
});
