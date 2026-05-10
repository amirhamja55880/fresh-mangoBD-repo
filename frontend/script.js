// ============================
// FRESH MANGO BD — script.js
// ============================

const API_BASE = 'http://localhost:5000/api';

// ===== NAVBAR: Scroll & Mobile Toggle =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile menu when link clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('active'));
});

// ===== SELECT MANGO FROM PRODUCT CARD =====
function selectMango(mangoName) {
  const select = document.getElementById('mangoType');
  select.value = mangoName;
  document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
}

// ===== FORM VALIDATION =====
function validateField(id, errorId, message, extraCheck) {
  const field = document.getElementById(id);
  const error = document.getElementById(errorId);
  const value = field ? field.value.trim() : '';
  
  if (!value || (extraCheck && !extraCheck(value))) {
    if (error) error.textContent = message;
    if (field) field.classList.add('error-field');
    return false;
  }
  if (error) error.textContent = '';
  if (field) field.classList.remove('error-field');
  return true;
}

function validatePhone(phone) {
  return /^01[3-9]\d{8}$/.test(phone);
}

// ===== ORDER FORM SUBMIT =====
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate
  const validName    = validateField('customerName', 'nameError', 'Please enter your full name');
  const validPhone   = validateField('phone', 'phoneError', 'Enter a valid BD phone number (01XXXXXXXXX)', validatePhone);
  const validAddress = validateField('address', 'addressError', 'Please enter your delivery address');
  const validMango   = validateField('mangoType', 'mangoError', 'Please select a mango type');
  const validQty     = validateField('quantity', 'qtyError', 'Minimum order is 2 KG', v => parseInt(v) >= 2);
  const validArea    = validateField('deliveryArea', 'areaError', 'Please select a delivery area');

  if (!validName || !validPhone || !validAddress || !validMango || !validQty || !validArea) return;

  // Collect data
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'Cash on Delivery';
  const orderData = {
    customer_name: document.getElementById('customerName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    mango_type: document.getElementById('mangoType').value,
    quantity: parseFloat(document.getElementById('quantity').value),
    delivery_area: document.getElementById('deliveryArea').value,
    payment_method: paymentMethod,
    note: document.getElementById('note').value.trim()
  };

  // Submit to backend
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) throw new Error('Server error');
    
    // Show success modal
    document.getElementById('successModal').classList.add('active');
    document.getElementById('orderForm').reset();

  } catch (err) {
    // Demo mode: show success even without backend
    console.warn('Backend not connected, showing demo success.');
    document.getElementById('successModal').classList.add('active');
    document.getElementById('orderForm').reset();
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Place Order';
  }
});

// ===== CLOSE MODAL =====
function closeModal() {
  document.getElementById('successModal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('successModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ===== SCROLL REVEAL ANIMATION =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .why-card, .contact-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== SMOOTH ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) current = section.getAttribute('id');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === `#${current}`) {
      a.style.color = 'var(--green)';
    }
  });
});
