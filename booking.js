// ======================================================
// BOOKING.JS
// إرسال طلب الخدمة إلى Supabase
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("bookingForm");
    if (!form) return;

    const formMessage = document.getElementById("formMessage");
    const submitBtn = form.querySelector(".submit-btn");

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const service = document.getElementById("service").value;
        const message = document.getElementById("message").value.trim();

        if (!name || !phone || !service || !message) {
            if (formMessage) {
                formMessage.textContent =
                    "يرجى ملء جميع الحقول المطلوبة.";
                formMessage.style.color = "#dc2626";
            }
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "جاري إرسال الطلب...";
        }

        if (formMessage) formMessage.textContent = "";

        try {

            const orderNumber = "ENJ-" + Date.now();

            const { error } = await supabaseClient
                .from("orders")
                .insert({
                    order_number: orderNumber,
                    customer_name: name,
                    phone: phone,
                    email: email || null,
                    service,
                    message,
                    status: "قيد المراجعة"
                });

            if (error) {
                console.error("❌ Supabase INSERT Error:", error);
                throw error;
            }

            // حفظ رقم الطلب في هذا المتصفح فقط.
            // لا نستخدمه كحماية؛ هو مجرد وسيلة لعرض طلبات هذا الجهاز.
            const savedNumbers =
                JSON.parse(localStorage.getItem("myOrderNumbers") || "[]");

            if (!savedNumbers.includes(orderNumber)) {
                savedNumbers.push(orderNumber);
                localStorage.setItem(
                    "myOrderNumbers",
                    JSON.stringify(savedNumbers)
                );
            }

            console.log("✅ Order created:", orderNumber);

            if (formMessage) {
                formMessage.textContent =
                    `تم إرسال طلبك بنجاح. رقم الطلب: ${orderNumber}`;
                formMessage.style.color = "#16a34a";
            }

            form.reset();

        } catch (error) {

            console.error("❌ Booking Error:", error);

            if (formMessage) {
                formMessage.textContent =
                    "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.";
                formMessage.style.color = "#dc2626";
            }

        } finally {

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "إرسال طلب الخدمة";
            }
        }
    });
});
