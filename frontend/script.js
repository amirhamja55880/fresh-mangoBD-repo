// ============================
// FRESH MANGO BD — script.js
// ============================

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://fresh-mangobd-repo.onrender.com/api";

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

  // Show success after 5 seconds
  setTimeout(() => {
    document.getElementById("successModal").classList.add("active");
    document.getElementById("orderForm").reset();
    document.querySelectorAll(".mango-qty").forEach((q) => {
      q.disabled = true;
      q.value = "";
    });
    document.getElementById("orderTotal").style.display = "none";
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Place Order';
  }, 5000);

  // Send to server in background
  fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  }).catch(() => {});
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

// ===== BANGLADESH DIVISION, DISTRICT, UPAZILA DATA =====
const bdData = {
  ঢাকা: {
    ঢাকা: ["সাভার", "ধামরাই", "কেরানীগঞ্জ", "নবাবগঞ্জ", "দোহার", "ঢাকা সদর"],
    গাজীপুর: ["গাজীপুর সদর", "কালীগঞ্জ", "কাপাসিয়া", "শ্রীপুর", "কালিয়াকৈর"],
    মানিকগঞ্জ: [
      "মানিকগঞ্জ সদর",
      "সিঙ্গাইর",
      "শিবালয়",
      "হরিরামপুর",
      "ঘিওর",
      "দৌলতপুর",
      "সাটুরিয়া",
    ],
    মুন্সিগঞ্জ: [
      "মুন্সিগঞ্জ সদর",
      "শ্রীনগর",
      "সিরাজদিখান",
      "লৌহজং",
      "গজারিয়া",
      "টঙ্গিবাড়ী",
    ],
    নারায়ণগঞ্জ: [
      "নারায়ণগঞ্জ সদর",
      "আড়াইহাজার",
      "বন্দর",
      "রূপগঞ্জ",
      "সোনারগাঁও",
    ],
    নরসিংদী: ["নরসিংদী সদর", "বেলাব", "মনোহরদী", "পলাশ", "রায়পুরা", "শিবপুর"],
    ফরিদপুর: [
      "ফরিদপুর সদর",
      "আলফাডাঙ্গা",
      "বোয়ালমারী",
      "চরভদ্রাসন",
      "মধুখালী",
      "নগরকান্দা",
      "সালথা",
    ],
    গোপালগঞ্জ: [
      "গোপালগঞ্জ সদর",
      "কাশিয়ানী",
      "কোটালীপাড়া",
      "মুকসুদপুর",
      "টুঙ্গিপাড়া",
    ],
    কিশোরগঞ্জ: [
      "কিশোরগঞ্জ সদর",
      "অষ্টগ্রাম",
      "বাজিতপুর",
      "ভৈরব",
      "হোসেনপুর",
      "ইটনা",
      "করিমগঞ্জ",
      "কটিয়াদি",
      "মিঠামইন",
      "নিকলী",
      "পাকুন্দিয়া",
      "তাড়াইল",
    ],
    মাদারীপুর: ["মাদারীপুর সদর", "কালকিনি", "রাজৈর", "শিবচর"],
    রাজবাড়ী: [
      "রাজবাড়ী সদর",
      "বালিয়াকান্দি",
      "গোয়ালন্দ",
      "কালুখালী",
      "পাংশা",
    ],
    শরীয়তপুর: [
      "শরীয়তপুর সদর",
      "ডামুড্যা",
      "গোসাইরহাট",
      "জাজিরা",
      "নড়িয়া",
      "ভেদরগঞ্জ",
    ],
    টাঙ্গাইল: [
      "টাঙ্গাইল সদর",
      "বাসাইল",
      "ভুয়াপুর",
      "দেলদুয়ার",
      "ধনবাড়ী",
      "ঘাটাইল",
      "গোপালপুর",
      "কালিহাতী",
      "মধুপুর",
      "মির্জাপুর",
      "নাগরপুর",
      "সখিপুর",
    ],
  },
  চট্টগ্রাম: {
    চট্টগ্রাম: [
      "চট্টগ্রাম সদর",
      "আনোয়ারা",
      "বাঁশখালী",
      "বোয়ালখালী",
      "চন্দনাইশ",
      "ফটিকছড়ি",
      "হাটহাজারী",
      "কর্ণফুলী",
      "লোহাগাড়া",
      "মিরসরাই",
      "পটিয়া",
      "রাঙ্গুনিয়া",
      "রাউজান",
      "সন্দ্বীপ",
      "সাতকানিয়া",
      "সীতাকুণ্ড",
    ],
    কক্সবাজার: [
      "কক্সবাজার সদর",
      "চকোরিয়া",
      "কুতুবদিয়া",
      "মহেশখালী",
      "পেকুয়া",
      "রামু",
      "টেকনাফ",
      "উখিয়া",
    ],
    কুমিল্লা: [
      "কুমিল্লা সদর",
      "বরুড়া",
      "ব্রাহ্মণপাড়া",
      "বুড়িচং",
      "চান্দিনা",
      "চৌদ্দগ্রাম",
      "দাউদকান্দি",
      "দেবিদ্বার",
      "হোমনা",
      "লাকসাম",
      "মেঘনা",
      "মনোহরগঞ্জ",
      "মুরাদনগর",
      "নাঙ্গলকোট",
      "তিতাস",
    ],
    ব্রাহ্মণবাড়িয়া: [
      "ব্রাহ্মণবাড়িয়া সদর",
      "আখাউড়া",
      "বাঞ্ছারামপুর",
      "কসবা",
      "নাসিরনগর",
      "নবীনগর",
      "সরাইল",
    ],
    চাঁদপুর: [
      "চাঁদপুর সদর",
      "ফরিদগঞ্জ",
      "হাজীগঞ্জ",
      "কচুয়া",
      "মতলব উত্তর",
      "মতলব দক্ষিণ",
      "শাহরাস্তি",
    ],
    ফেনী: [
      "ফেনী সদর",
      "ছাগলনাইয়া",
      "দাগনভূঞা",
      "ফুলগাজী",
      "পরশুরাম",
      "সোনাগাজী",
    ],
    লক্ষ্মীপুর: ["লক্ষ্মীপুর সদর", "কমলনগর", "রামগঞ্জ", "রামগতি", "রায়পুর"],
    নোয়াখালী: [
      "নোয়াখালী সদর",
      "বেগমগঞ্জ",
      "চাটখিল",
      "কোম্পানীগঞ্জ",
      "হাতিয়া",
      "কবিরহাট",
      "সেনবাগ",
      "সোনাইমুড়ী",
      "সুবর্ণচর",
    ],
    খাগড়াছড়ি: [
      "খাগড়াছড়ি সদর",
      "দীঘিনালা",
      "গুইমারা",
      "লক্ষ্মীছড়ি",
      "মাটিরাঙ্গা",
      "মানিকছড়ি",
      "পানছড়ি",
      "রামগড়",
    ],
    রাঙ্গামাটি: [
      "রাঙ্গামাটি সদর",
      "বাঘাইছড়ি",
      "বরকল",
      "বিলাইছড়ি",
      "কাপ্তাই",
      "জুরাছড়ি",
      "কাউখালী",
      "লংগদু",
      "নানিয়ারচর",
      "রাজস্থলী",
    ],
    বান্দরবান: [
      "বান্দরবান সদর",
      "আলীকদম",
      "লামা",
      "নাইক্ষ্যংছড়ি",
      "রোয়াংছড়ি",
      "রুমা",
      "থানচি",
    ],
  },
  রাজশাহী: {
    রাজশাহী: [
      "রাজশাহী সদর",
      "বাঘা",
      "বাগমারা",
      "চারঘাট",
      "দুর্গাপুর",
      "গোদাগাড়ী",
      "মোহনপুর",
      "পবা",
      "পুঠিয়া",
      "তানোর",
    ],
    চাঁপাইনবাবগঞ্জ: [
      "চাঁপাইনবাবগঞ্জ সদর",
      "ভোলাহাট",
      "গোমস্তাপুর",
      "নাচোল",
      "শিবগঞ্জ",
    ],
    নওগাঁ: [
      "নওগাঁ সদর",
      "আত্রাই",
      "বদলগাছি",
      "ধামইরহাট",
      "মান্দা",
      "মহাদেবপুর",
      "নিয়ামতপুর",
      "পত্নীতলা",
      "পোরশা",
      "রাণীনগর",
      "সাপাহার",
    ],
    নাটোর: [
      "নাটোর সদর",
      "বাগাতিপাড়া",
      "বড়াইগ্রাম",
      "গুরুদাসপুর",
      "লালপুর",
      "সিংড়া",
    ],
    পাবনা: [
      "পাবনা সদর",
      "আটঘরিয়া",
      "বেড়া",
      "ভাঙ্গুড়া",
      "চাটমোহর",
      "ঈশ্বরদী",
      "ফরিদপুর",
      "সাঁথিয়া",
      "সুজানগর",
    ],
    সিরাজগঞ্জ: [
      "সিরাজগঞ্জ সদর",
      "বেলকুচি",
      "চৌহালি",
      "কামারখন্দ",
      "কাজীপুর",
      "রায়গঞ্জ",
      "শাহজাদপুর",
      "তাড়াশ",
      "উল্লাপাড়া",
    ],
    বগুড়া: [
      "বগুড়া সদর",
      "আদমদীঘি",
      "ধুনট",
      "দুপচাঁচিয়া",
      "গাবতলী",
      "কাহালু",
      "নন্দীগ্রাম",
      "শাজাহানপুর",
      "শেরপুর",
      "শিবগঞ্জ",
      "সোনাতলা",
    ],
    জয়পুরহাট: ["জয়পুরহাট সদর", "আক্কেলপুর", "কালাই", "ক্ষেতলাল", "পাঁচবিবি"],
  },
  খুলনা: {
    খুলনা: [
      "খুলনা সদর",
      "বটিয়াঘাটা",
      "দাকোপ",
      "ডুমুরিয়া",
      "দিঘলিয়া",
      "কয়রা",
      "পাইকগাছা",
      "ফুলতলা",
      "রূপসা",
      "তেরখাদা",
    ],
    বাগেরহাট: [
      "বাগেরহাট সদর",
      "চিতলমারী",
      "ফকিরহাট",
      "কচুয়া",
      "মংলা",
      "মোরেলগঞ্জ",
      "মোল্লাহাট",
      "রামপাল",
      "শরণখোলা",
    ],
    সাতক্ষীরা: [
      "সাতক্ষীরা সদর",
      "আশাশুনি",
      "দেবহাটা",
      "কালিগঞ্জ",
      "কলারোয়া",
      "শ্যামনগর",
      "তালা",
    ],
    যশোর: [
      "যশোর সদর",
      "অভয়নগর",
      "বাঘারপাড়া",
      "চৌগাছা",
      "ঝিকরগাছা",
      "কেশবপুর",
      "মণিরামপুর",
      "শার্শা",
    ],
    ঝিনাইদহ: [
      "ঝিনাইদহ সদর",
      "হরিণাকুণ্ডু",
      "কালীগঞ্জ",
      "কোটচাঁদপুর",
      "মহেশপুর",
      "শৈলকুপা",
    ],
    মাগুরা: ["মাগুরা সদর", "মহম্মদপুর", "শালিখা", "শ্রীপুর"],
    নড়াইল: ["নড়াইল সদর", "কালিয়া", "লোহাগড়া"],
    কুষ্টিয়া: [
      "কুষ্টিয়া সদর",
      "ভেড়ামারা",
      "দৌলতপুর",
      "খোকসা",
      "কুমারখালী",
      "মিরপুর",
    ],
    মেহেরপুর: ["মেহেরপুর সদর", "গাংনী", "মুজিবনগর"],
    চুয়াডাঙ্গা: ["চুয়াডাঙ্গা সদর", "আলমডাঙ্গা", "দামুড়হুদা", "জীবননগর"],
  },
  বরিশাল: {
    বরিশাল: [
      "বরিশাল সদর",
      "আগৈলঝাড়া",
      "বাকেরগঞ্জ",
      "বানারীপাড়া",
      "বাবুগঞ্জ",
      "গৌরনদী",
      "হিজলা",
      "মেহেন্দিগঞ্জ",
      "মুলাদী",
      "উজিরপুর",
    ],
    ঝালকাঠি: ["ঝালকাঠি সদর", "কাঁঠালিয়া", "নলছিটি", "রাজাপুর"],
    পিরোজপুর: [
      "পিরোজপুর সদর",
      "ভান্ডারিয়া",
      "কাউখালী",
      "মঠবাড়িয়া",
      "নাজিরপুর",
      "নেছারাবাদ",
      "জিয়ানগর",
    ],
    ভোলা: [
      "ভোলা সদর",
      "বোরহানউদ্দিন",
      "চরফ্যাশন",
      "দৌলতখান",
      "লালমোহন",
      "মনপুরা",
      "তজুমদ্দিন",
    ],
    পটুয়াখালী: [
      "পটুয়াখালী সদর",
      "বাউফল",
      "দশমিনা",
      "গলাচিপা",
      "কলাপাড়া",
      "মির্জাগঞ্জ",
      "রাঙ্গাবালী",
    ],
    বরগুনা: ["বরগুনা সদর", "আমতলী", "বামনা", "বেতাগী", "পাথরঘাটা", "তালতলী"],
  },
  সিলেট: {
    সিলেট: [
      "সিলেট সদর",
      "বালাগঞ্জ",
      "বিয়ানীবাজার",
      "বিশ্বনাথ",
      "কোম্পানীগঞ্জ",
      "দক্ষিণ সুরমা",
      "ফেঞ্চুগঞ্জ",
      "গোলাপগঞ্জ",
      "গোয়াইনঘাট",
      "জকিগঞ্জ",
      "কানাইঘাট",
      "ওসমানী নগর",
      "জৈন্তাপুর",
    ],
    মৌলভীবাজার: [
      "মৌলভীবাজার সদর",
      "বড়লেখা",
      "জুড়ী",
      "কমলগঞ্জ",
      "কুলাউড়া",
      "রাজনগর",
      "শ্রীমঙ্গল",
    ],
    হবিগঞ্জ: [
      "হবিগঞ্জ সদর",
      "আজমিরীগঞ্জ",
      "বাহুবল",
      "বানিয়াচং",
      "চুনারুঘাট",
      "লাখাই",
      "মাধবপুর",
      "নবীগঞ্জ",
    ],
    সুনামগঞ্জ: [
      "সুনামগঞ্জ সদর",
      "বিশ্বম্ভরপুর",
      "ছাতক",
      "দক্ষিণ সুনামগঞ্জ",
      "দিরাই",
      "দোয়ারাবাজার",
      "জগন্নাথপুর",
      "জামালগঞ্জ",
      "শাল্লা",
      "তাহিরপুর",
    ],
  },
  রংপুর: {
    রংপুর: [
      "রংপুর সদর",
      "বদরগঞ্জ",
      "গঙ্গাচড়া",
      "কাউনিয়া",
      "মিঠাপুকুর",
      "পীরগঞ্জ",
      "পীরগাছা",
      "তারাগঞ্জ",
    ],
    দিনাজপুর: [
      "দিনাজপুর সদর",
      "বিরামপুর",
      "বিরল",
      "বোচাগঞ্জ",
      "চিরিরবন্দর",
      "ফুলবাড়ী",
      "ঘোড়াঘাট",
      "হাকিমপুর",
      "খানসামা",
      "নবাবগঞ্জ",
      "পার্বতীপুর",
    ],
    গাইবান্ধা: [
      "গাইবান্ধা সদর",
      "ফুলছড়ি",
      "গোবিন্দগঞ্জ",
      "পলাশবাড়ী",
      "সাদুল্লাপুর",
      "সাঘাটা",
      "সুন্দরগঞ্জ",
    ],
    কুড়িগ্রাম: [
      "কুড়িগ্রাম সদর",
      "ভূরুঙ্গামারী",
      "চর রাজিবপুর",
      "চিলমারী",
      "ফুলবাড়ী",
      "নাগেশ্বরী",
      "রাজারহাট",
      "রৌমারী",
      "উলিপুর",
    ],
    লালমনিরহাট: [
      "লালমনিরহাট সদর",
      "আদিতমারী",
      "হাতীবান্ধা",
      "কালীগঞ্জ",
      "পাটগ্রাম",
    ],
    নীলফামারী: [
      "নীলফামারী সদর",
      "ডিমলা",
      "ডোমার",
      "জলঢাকা",
      "কিশোরগঞ্জ",
      "সৈয়দপুর",
    ],
    পঞ্চগড়: ["পঞ্চগড় সদর", "আটোয়ারী", "বোদা", "দেবীগঞ্জ", "তেতুলিয়া"],
    ঠাকুরগাঁও: [
      "ঠাকুরগাঁও সদর",
      "বালিয়াডাঙ্গী",
      "হরিপুর",
      "পীরগঞ্জ",
      "রাণীশংকৈল",
    ],
  },
  ময়মনসিংহ: {
    ময়মনসিংহ: [
      "ময়মনসিংহ সদর",
      "ভালুকা",
      "ধোবাউড়া",
      "ফুলবাড়িয়া",
      "গফরগাঁও",
      "গৌরীপুর",
      "হালুয়াঘাট",
      "ঈশ্বরগঞ্জ",
      "মুক্তাগাছা",
      "নান্দাইল",
      "ফুলপুর",
      "তারাকান্দা",
      "ত্রিশাল",
    ],
    জামালপুর: [
      "জামালপুর সদর",
      "বকশীগঞ্জ",
      "দেওয়ানগঞ্জ",
      "ইসলামপুর",
      "মাদারগঞ্জ",
      "মেলান্দহ",
      "সরিষাবাড়ী",
    ],
    নেত্রকোণা: [
      "নেত্রকোণা সদর",
      "আটপাড়া",
      "বারহাট্টা",
      "দুর্গাপুর",
      "খালিয়াজুরী",
      "কলমাকান্দা",
      "কেন্দুয়া",
      "মদন",
      "মোহনগঞ্জ",
      "পূর্বধলা",
    ],
    শেরপুর: ["শেরপুর সদর", "ঝিনাইগাতী", "নকলা", "নালিতাবাড়ী", "শ্রীবরদী"],
  },
};

function initDivisions() {
  const divSelect = document.getElementById("divisionSelect");
  if (!divSelect) return;
  divSelect.innerHTML = '<option value="">বিভাগ বাছুন</option>';
  Object.keys(bdData).forEach((div) => {
    divSelect.innerHTML += `<option value="${div}">${div}</option>`;
  });
}

function loadDistricts() {
  const div = document.getElementById("divisionSelect").value;
  const distSelect = document.getElementById("districtSelect");
  const upaSelect = document.getElementById("deliveryArea");

  distSelect.innerHTML = '<option value="">জেলা বাছুন</option>';
  upaSelect.innerHTML = '<option value="">আগে জেলা বাছুন</option>';
  upaSelect.disabled = true;

  if (!div) {
    distSelect.disabled = true;
    return;
  }

  distSelect.disabled = false;
  Object.keys(bdData[div]).forEach((dist) => {
    distSelect.innerHTML += `<option value="${dist}">${dist}</option>`;
  });
}

function loadUpazilas() {
  const div = document.getElementById("divisionSelect").value;
  const dist = document.getElementById("districtSelect").value;
  const upaSelect = document.getElementById("deliveryArea");

  upaSelect.innerHTML = '<option value="">উপজেলা বাছুন</option>';

  if (!dist) {
    upaSelect.disabled = true;
    return;
  }

  upaSelect.disabled = false;
  bdData[div][dist].forEach((upa) => {
    upaSelect.innerHTML += `<option value="${dist} - ${upa}">${upa}</option>`;
  });
}

// Initialize divisions on page load
document.addEventListener("DOMContentLoaded", initDivisions);
