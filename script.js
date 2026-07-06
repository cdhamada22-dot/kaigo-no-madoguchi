const form = document.querySelector(".contact-form");
const formSteps = Array.from(document.querySelectorAll(".form-step"));
const stepDots = Array.from(document.querySelectorAll(".step-dot"));
const stepErrorMessage = document.querySelector(".step-error");
const errorMessage = document.querySelector('.form-step[data-step="2"] .form-error');
const successMessage = document.querySelector(".form-success");
const nextButton = document.querySelector(".next-step");
const prevButton = document.querySelector(".prev-step");
const submitButton = document.querySelector(".form-submit");
const FORM_ENDPOINT = "https://formspree.io/f/mgojzaej";
const NOTIFICATION_EMAIL = "kaigo-no-madoguchi@crds.jp";
let currentStep = 1;

function showStep(step) {
  currentStep = step;

  formSteps.forEach((formStep) => {
    const isActive = Number(formStep.dataset.step) === step;
    formStep.hidden = !isActive;
    formStep.classList.toggle("active", isActive);
  });

  stepDots.forEach((dot, index) => {
    dot.classList.toggle("active", index + 1 <= step);
  });

  stepErrorMessage.textContent = "";
  errorMessage.textContent = "";
  successMessage.textContent = "";
}

function validateStepOne() {
  if (!form.resident_age.value) {
    return "入居希望者の年齢を選択してください。";
  }

  if (!form.care_level.value) {
    return "介護度を選択してください。";
  }

  if (!form.area.value) {
    return "希望エリアを選択してください。";
  }

  if (!form.timing.value) {
    return "入居希望時期を選択してください。";
  }

  return "";
}

function validateStepTwo() {
  const name = form.name.value.trim();
  const tel = form.tel.value.trim();
  const telDigits = tel.replace(/\D/g, "");
  const email = form.email.value.trim();

  if (!name) {
    return "氏名を入力してください。";
  }

  if (!/^\d{10,11}$/.test(telDigits)) {
    return "電話番号は10桁または11桁で入力してください。";
  }

  if (!email) {
    return "メールアドレスを入力してください。";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "メールアドレスの形式を確認してください。";
  }

  if (!form.inquiry_type.value) {
    return "お問い合わせ種別を選択してください。";
  }

  if (!form.privacy.checked) {
    return "個人情報の取り扱いへの同意が必要です。";
  }

  return "";
}

function validateForm() {
  return validateStepOne() || validateStepTwo();
}

function getFormPayload() {
  return {
    notification_email: NOTIFICATION_EMAIL,
    resident_age: form.resident_age.value.trim(),
    care_level: form.care_level.value,
    area: form.area.value,
    timing: form.timing.value,
    name: form.name.value.trim(),
    tel: form.tel.value.trim(),
    email: form.email.value.trim(),
    inquiry_type: form.inquiry_type.value,
    message: form.message.value.trim(),
  };
}

function saveThanksPayload(payload) {
  const thanksPayload = {
    resident_age: payload.resident_age,
    care_level: payload.care_level,
    area: payload.area,
    timing: payload.timing,
    name: payload.name,
    tel: payload.tel,
    email: payload.email,
    inquiry_type: payload.inquiry_type,
    message: payload.message || "未入力",
  };

  sessionStorage.setItem("kaigoThanksPayload", JSON.stringify(thanksPayload));
}

nextButton.addEventListener("click", () => {
  const error = validateStepOne();

  if (error) {
    stepErrorMessage.textContent = error;
    return;
  }

  showStep(2);
});

prevButton.addEventListener("click", () => {
  showStep(1);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = validateForm();

  if (error) {
    if (validateStepOne()) {
      showStep(1);
      stepErrorMessage.textContent = error;
    } else {
      showStep(2);
      errorMessage.textContent = error;
    }
    successMessage.textContent = "";
    return;
  }

  if (!FORM_ENDPOINT) {
    errorMessage.textContent = "送信先URLが未設定です。Formspreeなどで発行したフォームURLを設定してください。";
    successMessage.textContent = "";
    return;
  }

  const userName = form.name.value.trim();
  errorMessage.textContent = "";
  successMessage.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "送信中...";

  try {
    const payload = getFormPayload();
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to submit");
    }

    saveThanksPayload(payload);
    form.reset();
    window.location.href = "./thanks.html";
  } catch (submitError) {
    errorMessage.textContent = "送信できませんでした。時間をおいてもう一度お試しください。";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "無料相談を送信する";
  }
});
