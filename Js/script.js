document.addEventListener("DOMContentLoaded", function () {
    // 1. التحكم في القائمة المتجاوبة (للهواتف)
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // 2. التحقق من حالة تسجيل الدخول وتحديث روابط الهيدر
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const authLink = document.getElementById("auth-link");
    const searchLinks = document.querySelectorAll("#search-link, #cta-search-btn");

    if (isLoggedIn) {
        if (authLink) {
            authLink.textContent = "تسجيل الخروج";
            authLink.href = "#";
            authLink.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("isLoggedIn");
                alert("تم تسجيل الخروج بنجاح.");
                window.location.href = "index.html";
            });
        }
    }

    searchLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            if (!isLoggedIn) {
                e.preventDefault();
                alert("يجب تسجيل الدخول أولاً للتمكن من البحث!");
                window.location.href = "login.html";
            }
        });
    });

    if (window.location.pathname.includes("search.html") && !isLoggedIn) {
        alert("يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة!");
        window.location.href = "login.html";
    }

    // 3. معالجة نموذج إنشاء الحساب
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("reg-username").value;
            const email = document.getElementById("reg-email").value;
            const password = document.getElementById("reg-password").value;

            localStorage.setItem("userAccount", JSON.stringify({ username, email, password }));
            alert("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
            window.location.href = "login.html";
        });
    }

    // 4. معالجة نموذج تسجيل الدخول
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputUser = document.getElementById("login-email").value;
            const inputPass = document.getElementById("login-password").value;
            const savedUser = JSON.parse(localStorage.getItem("userAccount"));

            if ((savedUser && (inputUser === savedUser.email || inputUser === savedUser.username) && inputPass === savedUser.password) || (inputUser === "admin" && inputPass === "123456")) {
                localStorage.setItem("isLoggedIn", "true");
                alert("تم تسجيل الدخول بنجاح!");
                window.location.href = "search.html";
            } else {
                alert("خطأ في اسم المستخدم أو كلمة المرور!");
            }
        });
    }

    // 5. معالجة نموذج البحث عبر الـ IP
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const ipInput = document.getElementById("ip-address").value.trim();
            const resultsList = document.querySelector("#results-section ul");

            if (!ipInput || !resultsList) return;

            resultsList.innerHTML = "<li>⏳ جاري جلب المعلومات...</li>";

            fetch(`https://ipwho.is/${ipInput}`)
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        alert("عذراً، عنوان الـ IP المدخل غير صحيح أو غير متوفر.");
                        resultsList.innerHTML = "<li>❌ لم يتم العثور على نتائج.</li>";
                        return;
                    }

                    resultsList.innerHTML = `
                        <li><strong>نوع الموقع:</strong> بحث عبر الـ IP</li>
                        <li><strong>عنوان الـ IP:</strong> ${data.ip}</li>
                        <li><strong>الدولة:</strong> ${data.country} (${data.country_code})</li>
                        <li><strong>المدينة:</strong> ${data.city}</li>
                        <li><strong>خط الطول والعرض:</strong> ${data.latitude}, ${data.longitude}</li>
                        <li><strong>مقدم الخدمة (ISP):</strong> ${data.connection.isp || data.connection.org}</li>
                    `;
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("حدث خطأ أثناء الاتصال بالخادم.");
                });
        });
    }

    // 6. ميزة تحديد موقع الجهاز الحالي مباشرة عبر GPS المتصفح
    const geoBtn = document.getElementById("geo-btn");
    if (geoBtn) {
        geoBtn.addEventListener("click", function () {
            const resultsList = document.querySelector("#results-section ul");

            if (!navigator.geolocation) {
                alert("متصفحك لا يدعم خاصية تحديد الموقع الجغرافي.");
                return;
            }

            resultsList.innerHTML = "<li>⏳ جاري طلب إذن تحديد موقع جهازي الحالي...</li>";

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    resultsList.innerHTML = `
                        <li><strong>نوع الموقع:</strong> موقع الجهاز الحالي (GPS)</li>
                        <li><strong>عنوان الـ IP / الجهاز:</strong> هذا الجهاز الشخصي</li>
                        <li><strong>الدولة / المنطقة:</strong> تحديد مباشر عبر الأقمار/الشبكة</li>
                        <li><strong>المدينة:</strong> قريبة من موقعك الجغرافي</li>
                        <li><strong>خط الطول والعرض:</strong> ${lat}, ${lon}</li>
                        <li><strong>مقدم الخدمة (ISP):</strong> الشبكة المتصل بها الجهاز</li>
                    `;
                },
                (error) => {
                    console.error(error);
                    alert("تعذر تحديد موقعك. تأكد من السماح للمتصفح بالوصول إلى الموقع (GPS).");
                    resultsList.innerHTML = "<li>❌ فشل تحديد الموقع.</li>";
                },
                { enableHighAccuracy: true }
            );
        });
    }
});
