// ======================================================
// ADMIN.JS
// لوحة تحكم إنجاز
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 ADMIN.JS LOADED");

    // حماية لوحة الإدارة
    if (sessionStorage.getItem("adminLoggedIn") !== "true") {
        window.location.href = "admin-login.html";
        return;
    }

    const ordersContainer = document.getElementById("adminOrdersContainer");
    const refreshBtn = document.getElementById("refreshOrders");
    const logoutBtn = document.getElementById("adminLogout");

    const totalOrders = document.getElementById("totalOrders");
    const pendingOrders = document.getElementById("pendingOrders");
    const progressOrders = document.getElementById("progressOrders");
    const completedOrders = document.getElementById("completedOrders");

    if (!ordersContainer) {
        console.error("❌ لم يتم العثور على adminOrdersContainer");
        return;
    }

    // تسجيل الخروج
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("adminLoggedIn");
            window.location.href = "admin-login.html";
        });
    }

    function formatDate(date) {
        if (!date) return "-";
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "-";
        return parsed.toLocaleString("ar-MA");
    }

    function updateStatistics(orders) {
        if (totalOrders) totalOrders.textContent = orders.length;

        if (pendingOrders) {
            pendingOrders.textContent =
                orders.filter(o => o.status === "قيد المراجعة").length;
        }

        if (progressOrders) {
            progressOrders.textContent =
                orders.filter(o => o.status === "قيد التنفيذ").length;
        }

        if (completedOrders) {
            completedOrders.textContent =
                orders.filter(o => o.status === "مكتمل").length;
        }
    }

    async function loadOrders() {

        console.log("🔄 LOAD ORDERS CALLED");

        ordersContainer.innerHTML = `
            <div class="admin-empty">جاري تحميل الطلبات...</div>
        `;

        try {

            const { data, error } = await supabaseClient
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false });

            console.log("📦 Orders:", data);
            console.log("❌ Error:", error);

            if (error) {
                console.error("Supabase SELECT Error:", error);

                ordersContainer.innerHTML = `
                    <div class="admin-empty admin-error">
                        حدث خطأ أثناء تحميل الطلبات.
                        <br><br>
                        ${error.message}
                    </div>
                `;
                return;
            }

            const orders = Array.isArray(data) ? data : [];

            updateStatistics(orders);

            if (orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="admin-empty">
                        لا توجد طلبات حتى الآن.
                    </div>
                `;
                return;
            }

            ordersContainer.innerHTML = "";

            orders.forEach(order => {

                const card = document.createElement("article");
                card.className = "admin-order-card";

                card.innerHTML = `
                    <div class="admin-order-top">
                        <div>
                            <span class="order-label">رقم الطلب</span>
                            <strong>${escapeHTML(order.order_number || "-")}</strong>
                        </div>

                        <span class="order-status">
                            ${escapeHTML(order.status || "قيد المراجعة")}
                        </span>
                    </div>

                    <div class="admin-order-info">
                        <p><strong>العميل:</strong> ${escapeHTML(order.customer_name || "-")}</p>
                        <p><strong>الهاتف:</strong> ${escapeHTML(order.phone || "-")}</p>
                        <p><strong>البريد:</strong> ${escapeHTML(order.email || "-")}</p>
                        <p><strong>الخدمة:</strong> ${escapeHTML(order.service || "-")}</p>
                        <p><strong>الرسالة:</strong> ${escapeHTML(order.message || "-")}</p>
                        <p><strong>التاريخ:</strong> ${formatDate(order.created_at)}</p>
                    </div>

                    <div class="admin-order-actions">

                        <label>
                            الحالة
                            <select class="status-select" data-id="${escapeHTML(String(order.id))}">
                                <option value="قيد المراجعة" ${order.status === "قيد المراجعة" ? "selected" : ""}>
                                    قيد المراجعة
                                </option>
                                <option value="قيد التنفيذ" ${order.status === "قيد التنفيذ" ? "selected" : ""}>
                                    قيد التنفيذ
                                </option>
                                <option value="مكتمل" ${order.status === "مكتمل" ? "selected" : ""}>
                                    مكتمل
                                </option>
                                <option value="ملغي" ${order.status === "ملغي" ? "selected" : ""}>
                                    ملغي
                                </option>
                            </select>
                        </label>

                        <button
                            type="button"
                            class="delete-order-btn"
                            data-id="${escapeHTML(String(order.id))}">
                            حذف الطلب
                        </button>

                    </div>
                `;

                ordersContainer.appendChild(card);
            });

            console.log("✅ تم عرض الطلبات:", orders.length);

        } catch (error) {

            console.error("🔥 Unexpected Error:", error);

            ordersContainer.innerHTML = `
                <div class="admin-empty admin-error">
                    حدث خطأ غير متوقع.
                    <br><br>
                    ${error.message}
                </div>
            `;
        }
    }

    // تغيير حالة الطلب
    ordersContainer.addEventListener("change", async event => {

        const select = event.target.closest(".status-select");
        if (!select) return;

        const orderId = select.dataset.id;
        const newStatus = select.value;

        select.disabled = true;

        const { error } = await supabaseClient
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        select.disabled = false;

        if (error) {
            console.error("❌ Update Error:", error);
            alert("حدث خطأ أثناء تحديث حالة الطلب.");
            await loadOrders();
            return;
        }

        console.log("✅ Order status updated");
        await loadOrders();
    });

    // حذف الطلب
    ordersContainer.addEventListener("click", async event => {

        const button = event.target.closest(".delete-order-btn");
        if (!button) return;

        const orderId = button.dataset.id;

        if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
            return;
        }

        button.disabled = true;

        const { error } = await supabaseClient
            .from("orders")
            .delete()
            .eq("id", orderId);

        if (error) {
            console.error("❌ Delete Error:", error);
            alert("حدث خطأ أثناء حذف الطلب.");
            button.disabled = false;
            return;
        }

        console.log("✅ Order deleted");
        await loadOrders();
    });

    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadOrders);
    }

    loadOrders();
});

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
