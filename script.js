const form = document.querySelector(".contact-form");
const formSteps = Array.from(document.querySelectorAll(".form-step"));
const stepDots = Array.from(document.querySelectorAll(".step-dot"));
const nextButtons = Array.from(document.querySelectorAll(".next-step"));
const prevButtons = Array.from(document.querySelectorAll(".prev-step"));
const choiceGroups = Array.from(document.querySelectorAll("[data-choice-group]"));
const submitButton = document.querySelector(".form-submit");
const FORM_ENDPOINT = "https://formspree.io/f/mgojzaej";
const NOTIFICATION_EMAIL = "kaigo-no-madoguchi@crds.jp";
let currentStep = 1;

function getStepErrorElement(step) {
  return document.querySelector(`.form-step[data-step="${step}"] .form-error`);
}

function maybeAdvanceStep() {
  if (currentStep >= formSteps.length) {
    return;
  }

  if (!validateStep(currentStep)) {
    window.setTimeout(() => showStep(currentStep + 1), 220);
  }
}

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

  document.querySelectorAll(".form-error, .form-success").forEach((message) => {
    message.textContent = "";
  });
}

function validateStepOne() {
  if (!form.resident_age.value) {
    return "入居希望者の年齢を選択してください。";
  }

  return "";
}

function validateStepTwo() {
  if (!form.care_level.value) {
    return "介護度を選択してください。";
  }

  return "";
}

function validateStepThree() {
  if (!form.budget.value) {
    return "費用を選択してください。";
  }

  return "";
}

function validateStepFour() {
  if (!form.area.value) {
    return "希望エリアを選択してください。";
  }

  if (!form.timing.value) {
    return "入居希望時期を選択してください。";
  }

  return "";
}

function validateStepFive() {
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

  return "";
}

function validateStepSix() {
  if (!form.inquiry_type.value) {
    return "お問い合わせ種別を選択してください。";
  }

  return "";
}

const validators = {
  1: validateStepOne,
  2: validateStepTwo,
  3: validateStepThree,
  4: validateStepFour,
  5: validateStepFive,
  6: validateStepSix,
};

function validateStep(step) {
  return validators[step] ? validators[step]() : "";
}

function validateAllSteps() {
  for (let step = 1; step <= formSteps.length; step += 1) {
    const error = validateStep(step);

    if (error) {
      return { step, error };
    }
  }

  return { step: 0, error: "" };
}

function getFormPayload() {
  return {
    _subject: "かいごの窓口に新しいお問い合わせがありました",
    _replyto: form.email.value.trim(),
    notification_email: NOTIFICATION_EMAIL,
    resident_age: form.resident_age.value.trim(),
    care_level: form.care_level.value,
    budget: form.budget.value,
    area: form.area.value,
    timing: form.timing.value,
    name: form.name.value.trim(),
    tel: form.tel.value.trim(),
    email: form.email.value.trim(),
    inquiry_type: form.inquiry_type.value,
    terms_agreement: "利用規約に同意して送信",
    source_lp: "consult-lp",
  };
}

function setSubmitButtonLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("is-loading", isLoading);
  submitButton.innerHTML = isLoading
    ? '<span class="submit-main">送信中...</span>'
    : '<span class="submit-agreement">利用規約に同意して</span><span class="submit-main">送信する</span>';
}

function saveThanksPayload(payload) {
  sessionStorage.setItem("kaigoThanksPayload", JSON.stringify({
    resident_age: payload.resident_age,
    care_level: payload.care_level,
    budget: payload.budget,
    area: payload.area,
    timing: payload.timing,
    name: payload.name,
    tel: payload.tel,
    email: payload.email,
    inquiry_type: payload.inquiry_type,
  }));
}

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const error = validateStep(currentStep);
    const errorElement = getStepErrorElement(currentStep);

    if (error) {
      errorElement.textContent = error;
      return;
    }

    showStep(Math.min(currentStep + 1, formSteps.length));
  });
});

prevButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showStep(Math.max(currentStep - 1, 1));
  });
});

choiceGroups.forEach((group) => {
  const fieldName = group.dataset.choiceGroup;
  const input = form.elements[fieldName];

  group.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.value;
      group.querySelectorAll("button").forEach((choice) => {
        choice.classList.toggle("selected", choice === button);
      });
      getStepErrorElement(currentStep).textContent = "";
      maybeAdvanceStep();
    });
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const validation = validateAllSteps();

  if (validation.error) {
    showStep(validation.step);
    getStepErrorElement(validation.step).textContent = validation.error;
    return;
  }

  const errorElement = getStepErrorElement(currentStep);
  errorElement.textContent = "";
  setSubmitButtonLoading(true);

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
    errorElement.textContent = "送信できませんでした。時間をおいてもう一度お試しください。";
  } finally {
    setSubmitButtonLoading(false);
  }
});
