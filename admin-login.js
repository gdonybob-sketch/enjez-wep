// ======================================================
// ADMIN LOGIN
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    const message = document.getElementById("adminLoginMessage");

    form.addEventListener("submit", event => {

        event.preventDefault();

        const username =
            document.getElementById("adminUsername").value.trim();

        const password =
            document.getElementById("adminPassword").value.trim();

        // مؤقتًا للتجربة فقط.
        // في النسخة الإنتاجية سنستبدله بـ Supabase Auth.
        const correctUsername = "admin";
        const correctPassword = "1234";

        if (
            username === correctUsername &&
            password === correctPassword
        ) {

            sessionStorage.setItem("adminLoggedIn", "true");

            if (message) {
                message.textContent = "تم تسجيل الدخول بنجاح...";
                message.style.color = "#16a34a";
            }

            setTimeout(() => {
                window.location.href = "admin-dashboard.html";
            }, 400);

        } else {

            if (message) {
                message.textContent =
                    "اسم المستخدم أو كلمة المرور غير صحيحة.";
                message.style.color = "#dc2626";
            }
        }
    });
});
