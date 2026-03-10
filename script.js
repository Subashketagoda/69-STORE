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

    // Mobile Menu Toggle (Integrated in Incarnage style if needed, but for now standard)
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars-staggered');
            menuToggle.querySelector('i').classList.toggle('fa-xmark');
        });
    }

    // --- CART SYSTEM ---
    let cart = JSON.parse(localStorage.getItem('69store_cart')) || [];
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
                    <img src="${item.image}" style="width: 80px; height: 100px; object-fit: cover; background: #f2f2f2;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.9rem; font-weight: 600; text-transform: uppercase;">${item.name}</h4>
                        <p style="font-size: 0.9rem; font-weight: 800; margin: 5px 0;">LKR ${item.price.toLocaleString()}</p>
                        <span style="font-size: 0.75rem; color: #ff3e3e; cursor: pointer; text-transform: uppercase; font-weight: 600;" onclick="removeFromCart(${index})">Remove</span>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        if (cartTotalAmount) cartTotalAmount.textContent = `LKR ${total.toLocaleString()}.00`;
        if (cartBadgeMobile) cartBadgeMobile.textContent = cart.length;
        if (cartBadgeSidebar) cartBadgeSidebar.textContent = `(${cart.length})`;
        localStorage.setItem('69store_cart', JSON.stringify(cart));
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
                        `*NEW ORDER - 69 STORE*\n\n` +
                        `*Customer:* ${name}\n` +
                        `*Phone:* ${phone}\n` +
                        `*Address:* ${address}\n\n` +
                        `*Items:*\n${cart.map(i => `- ${i.name} (LKR ${i.price})`).join('\n')}\n\n` +
                        `*Total:* LKR ${orderData.total.toLocaleString()}.00`
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
});
