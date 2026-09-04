// ======================================================
// TRACKING.JS
// تتبع الطلب عبر رقم الطلب
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("trackOrderForm");
    const result = document.getElementById("trackResult");
    const message = document.getElementById("trackMessage");

    if (!form) return;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const orderNumber =
            document.getElementById("orderId").value.trim().toUpperCase();

        if (!orderNumber) {
            showMessage("يرجى إدخال رقم الطلب.", false);
            return;
        }

        if (result) {
            result.innerHTML = `
                <div class="admin-empty">جاري البحث عن الطلب...</div>
            `;
        }

        const { data, error } = await supabaseClient
            .from("orders")
            .select("*")
            .eq("order_number", orderNumber)
            .maybeSingle();

        if (error) {
            console.error("❌ Tracking Error:", error);
            showMessage("حدث خطأ أثناء البحث عن الطلب.", false);
            if (result) result.innerHTML = "";
            return;
        }

        if (!data) {
            showMessage("لم يتم العثور على طلب بهذا الرقم.", false);
            if (result) result.innerHTML = "";
            return;
        }

        showMessage("تم العثور على الطلب.", true);
        renderOrder(data);
    });

    function showMessage(text, success) {
        if (!message) return;
        message.textContent = text;
        message.style.color = success ? "#16a34a" : "#dc2626";
    }

    function renderOrder(order) {

        if (!result) return;

        const status = order.status || "قيد المراجعة";

        result.innerHTML = `
            <div class="tracked-order-card">

                <div class="tracked-order-header">

                    <div>
                        <span>رقم الطلب</span>
                        <strong>${escapeHTML(order.order_number || "-")}</strong>
                    </div>

                    <span class="order-status ${getStatusClass(status)}">
                        ${escapeHTML(status)}
                    </span>

                </div>

                <div class="tracked-order-info">

                    <div>
                        <span>الخدمة</span>
                        <strong>${escapeHTML(getServiceName(order.service))}</strong>
                    </div>

                    <div>
                        <span>تاريخ الطلب</span>
                        <strong>${formatDate(order.created_at)}</strong>
                    </div>

                    <div>
                        <span>اسم العميل</span>
                        <strong>${escapeHTML(order.customer_name || "-")}</strong>
                    </div>

                </div>

                <div class="tracked-message">
                    <span>تفاصيل الطلب</span>
                    <p>${escapeHTML(order.message || "")}</p>
                </div>

                <div class="tracking-timeline">

                    <div class="tracking-step active">
                        <div class="tracking-dot">✓</div>
                        <strong>تم استلام الطلب</strong>
                        <span>تم إرسال طلبك بنجاح.</span>
                    </div>

                    <div class="tracking-step ${status === "قيد التنفيذ" || status === "مكتمل" ? "active" : ""}">
                        <div class="tracking-dot">✓</div>
                        <strong>قيد التنفيذ</strong>
                        <span>تتم معالجة طلبك حاليًا.</span>
                    </div>

                    <div class="tracking-step ${status === "مكتمل" ? "active" : ""}">
                        <div class="tracking-dot">✓</div>
                        <strong>مكتمل</strong>
                        <span>تم الانتهاء من طلبك.</span>
                    </div>

                </div>
            </div>
        `;
    }
});

function getServiceName(service) {

    const services = {
        administrative: "الخدمات الإدارية",
        electronic: "الخدمات الإلكترونية",
        forms: "تعبئة الاستمارات والطلبات",
        printing: "الطباعة والنسخ والمسح الضوئي",
        translation: "الترجمة وإعداد الوثائق",
        design: "التصميم الجرافيكي",
        "web-design": "تصميم وتطوير المواقع",
        "digital-support": "الدعم والمساعدة الرقمية"
    };

    return services[service] || "خدمة أخرى";
}

function getStatusClass(status) {

    if (status === "مكتمل") return "status-completed";
    if (status === "قيد التنفيذ") return "status-progress";
    if (status === "ملغي") return "status-cancelled";

    return "status-pending";
}

function formatDate(date) {

    if (!date) return "-";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleString("ar-MA");
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
