const form = document.querySelector(".contact-form");
const errorMessage = document.querySelector(".form-error");
const successMessage = document.querySelector(".form-success");

function validateForm() {
  const name = form.name.value.trim();
  const tel = form.tel.value.trim();

  if (!name) {
    return "お名前を入力してください。";
  }

  if (!/^[0-9+\-\s()]{9,}$/.test(tel)) {
    return "電話番号を入力してください。";
  }

  if (!form.area.value) {
    return "ご希望エリアを選択してください。";
  }

  if (!form.timing.value) {
    return "入居希望時期を選択してください。";
  }

  if (!form.privacy.checked) {
    return "個人情報の取り扱いへの同意が必要です。";
  }

  return "";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const error = validateForm();

  if (error) {
    errorMessage.textContent = error;
    successMessage.textContent = "";
    return;
  }

  const userName = form.name.value.trim();
  errorMessage.textContent = "";
  const formData = new FormData(form);

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString(),
  })
    .then(() => {
      successMessage.textContent = `${userName}様、ありがとうございます。相談内容を受け付けました。担当者よりご連絡いたします。`;
      form.reset();
    })
    .catch(() => {
      errorMessage.textContent = "送信に失敗しました。お電話にてお問い合わせください。";
    });
});
