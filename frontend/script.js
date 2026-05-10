// ============================
// FRESH MANGO BD — script.js
// ============================

const API_BASE = "https://fresh-mangobd-repo.onrender.com/api";

// ===== NAVBAR =====
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("active"));
});

// ===== SELECT MANGO FROM PRODUCT CARD =====
function selectMango(mangoName) {
  const key = mangoName.split(" ")[0];
  const checkbox = document.querySelector(
    `input[name="mango"][value="${mangoName}"]`,
  );
  if (checkbox) {
    checkbox.checked = true;
    const qtyInput = document.getElementById(`qty_${key}`);
    if (qtyInput) {
      qtyInput.disabled = false;
      qtyInput.value = 1;
    }
    calculateTotal();
  }
  document.getElementById("order").scrollIntoView({ behavior: "smooth" });
}

// ===== MANGO CHECKBOX TOGGLE =====
const prices = {
  "Himsagar Mango": 180,
  "Langra Mango": 160,
  "Amrapali Mango": 150,
  "Fazli Mango": 120,
};

function toggleQty(checkbox) {
  const key = checkbox.value.split(" ")[0];
  const qtyInput = document.getElementById(`qty_${key}`);
  if (checkbox.checked) {
    qtyInput.disabled = false;
    qtyInput.value = 1;
    qtyInput.focus();
  } else {
    qtyInput.disabled = true;
    qtyInput.value = "";
  }
  calculateTotal();
}

function calculateTotal() {
  const checkboxes = document.querySelectorAll('input[name="mango"]:checked');
  let total = 0;
  let hasQty = false;

  checkboxes.forEach((cb) => {
    const key = cb.value.split(" ")[0];
    const qty = parseFloat(document.getElementById(`qty_${key}`)?.value) || 0;
    total += qty * prices[cb.value];
    if (qty > 0) hasQty = true;
  });

  const totalDiv = document.getElementById("orderTotal");
  const totalAmount = document.getElementById("totalAmount");

  if (checkboxes.length > 0 && hasQty) {
    totalDiv.style.display = "block";
    totalAmount.textContent = "৳" + total.toLocaleString();
  } else {
    totalDiv.style.display = "none";
  }
}

document.addEventListener("input", function (e) {
  if (e.target.classList.contains("mango-qty")) {
    calculateTotal();
  }
});

// ===== FORM VALIDATION =====
function validatePhone(phone) {
  return /^01[3-9]\d{8}$/.test(phone);
}

function validateField(id, errorId, message, extraCheck) {
  const field = document.getElementById(id);
  const error = document.getElementById(errorId);
  const value = field ? field.value.trim() : "";
  if (!value || (extraCheck && !extraCheck(value))) {
    if (error) error.textContent = message;
    if (field) field.classList.add("error-field");
    return false;
  }
  if (error) error.textContent = "";
  if (field) field.classList.remove("error-field");
  return true;
}

// ===== ORDER FORM SUBMIT =====
document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const validName = validateField(
    "customerName",
    "nameError",
    "আপনার নাম লিখুন",
  );
  const validPhone = validateField(
    "phone",
    "phoneError",
    "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)",
    validatePhone,
  );
  const validAddress = validateField(
    "address",
    "addressError",
    "আপনার ঠিকানা লিখুন",
  );
  const validArea = validateField(
    "deliveryArea",
    "areaError",
    "ডেলিভারি এলাকা সিলেক্ট করুন",
  );

  // Mango validation
  const selectedMangoes = [];
  let totalQty = 0;
  document.querySelectorAll('input[name="mango"]:checked').forEach((cb) => {
    const key = cb.value.split(" ")[0];
    const qty = parseFloat(document.getElementById(`qty_${key}`)?.value) || 0;
    if (qty > 0) {
      selectedMangoes.push(`${cb.value}: ${qty}KG`);
      totalQty += qty;
    }
  });

  const mangoError = document.getElementById("mangoError");
  if (selectedMangoes.length === 0) {
    mangoError.textContent = "কমপক্ষে একটি মাঙ্গো সিলেক্ট করুন এবং পরিমাণ দিন";
    return;
  } else {
    mangoError.textContent = "";
  }

  if (!validName || !validPhone || !validAddress || !validArea) return;

  const paymentMethod =
    document.querySelector('input[name="payment"]:checked')?.value ||
    "Cash on Delivery";

  const orderData = {
    customer_name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    mango_type: selectedMangoes.join(", "),
    quantity: totalQty,
    delivery_area: document.getElementById("deliveryArea").value,
    payment_method: paymentMethod,
    note: document.getElementById("note").value.trim(),
  };

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> অর্ডার হচ্ছে...';

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error("Server error");
    document.getElementById("successModal").classList.add("active");
    document.getElementById("orderForm").reset();
    document.querySelectorAll(".mango-qty").forEach((q) => {
      q.disabled = true;
      q.value = "";
    });
    document.getElementById("orderTotal").style.display = "none";
    calculateTotal();
  } catch (err) {
    document.getElementById("successModal").classList.add("active");
    document.getElementById("orderForm").reset();
    document.querySelectorAll(".mango-qty").forEach((q) => {
      q.disabled = true;
      q.value = "";
    });
    document.getElementById("orderTotal").style.display = "none";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Place Order';
  }
});

// ===== CLOSE MODAL =====
function closeModal() {
  document.getElementById("successModal").classList.remove("active");
}
document.getElementById("successModal").addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(".product-card, .why-card, .contact-card")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

// ===== NAV HIGHLIGHT =====
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 100)
      current = section.getAttribute("id");
  });
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.style.color = "";
    if (a.getAttribute("href") === `#${current}`)
      a.style.color = "var(--green)";
  });
});
