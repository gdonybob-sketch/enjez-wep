// ======================================================
// MAIN.JS
// الوظائف العامة للموقع
// ======================================================

// اختيار الخدمة تلقائيًا من الرابط
document.addEventListener("DOMContentLoaded", () => {

    const serviceSelect = document.getElementById("service");

    if (serviceSelect) {

        const params = new URLSearchParams(window.location.search);
        const selectedService = params.get("service");

        if (selectedService) {
            serviceSelect.value = selectedService;
        }
    }

    // نموذج التواصل
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {

        contactForm.addEventListener("submit", event => {

            event.preventDefault();

            const name = document.getElementById("contactName").value.trim();
            const phone = document.getElementById("contactPhone").value.trim();
            const email = document.getElementById("contactEmail").value.trim();
            const subject = document.getElementById("contactSubject").value.trim();
            const message = document.getElementById("contactMessage").value.trim();
            const formMessage = document.getElementById("contactFormMessage");

            if (!name || !phone || !subject || !message) {

                if (formMessage) {
                    formMessage.textContent =
                        "يرجى تعبئة الحقول المطلوبة.";
                    formMessage.style.color = "#dc2626";
                }

                return;
            }

            const contactMessage = {
                id: "MSG-" + Date.now(),
                name,
                phone,
                email,
                subject,
                message,
                date: new Date().toLocaleString("ar-MA")
            };

            const messages =
                JSON.parse(localStorage.getItem("contactMessages") || "[]");

            messages.push(contactMessage);

            localStorage.setItem(
                "contactMessages",
                JSON.stringify(messages)
            );

            if (formMessage) {
                formMessage.textContent =
                    "تم إرسال رسالتك بنجاح. سنتواصل معك قريبًا.";
                formMessage.style.color = "#16a34a";
            }

            contactForm.reset();
        });
    }
});
