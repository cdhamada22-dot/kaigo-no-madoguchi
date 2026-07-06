const savedPayload = sessionStorage.getItem("kaigoThanksPayload");
const payload = savedPayload ? JSON.parse(savedPayload) : {};

document.querySelectorAll("[data-summary]").forEach((item) => {
  const key = item.dataset.summary;
  item.textContent = payload[key] || "-";
});
