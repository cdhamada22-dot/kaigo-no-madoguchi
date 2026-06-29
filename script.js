const form = document.querySelector(".step-form");
const steps = [...document.querySelectorAll(".form-step")];
const dots = [...document.querySelectorAll(".step-dot")];
const lines = [...document.querySelectorAll(".step-line")];
const backButton = document.querySelector('[data-action="back"]');
const nextButton = document.querySelector('[data-action="next"]');
const submitButton = document.querySelector(".form-submit");
const errorMessage = document.querySelector(".form-error");
const successMessage = document.querySelector(".form-success");

let currentStep = 0;

function setStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));

  steps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === currentStep);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex <= currentStep);
  });

  lines.forEach((line, lineIndex) => {
    line.classList.toggle("active", lineIndex < currentStep);
  });

  backButton.hidden = currentStep === 0;
  nextButton.style.display = currentStep === steps.length - 1 ? "none" : "inline-flex";
  submitButton.style.display = currentStep === steps.length - 1 ? "inline-flex" : "none";
  errorMessage.textContent = "";
  successMessage.textContent = "";
}

function validateStep() {
  if (currentStep === 0 && !form.area.value) {
    return "ご希望の地域を選択してください。";
  }

  if (currentStep === 1) {
    if (!form.timing.value) {
      return "ご入居時期を選択してください。";
    }

    if (!form.budget.value) {
      return "ご予算の目安を選択してください。";
    }
  }

  if (currentStep === 2) {
    const name = form.name.value.trim();
    const tel = form.tel.value.trim();

    if (!name) {
      return "お名前を入力してください。";
    }

    if (!/^[0-9+\-\s()]{9,}$/.test(tel)) {
      return "電話番号を入力してください。";
    }
  }

  return "";
}

nextButton.addEventListener("click", () => {
  const error = validateStep();

  if (error) {
    errorMessage.textContent = error;
    return;
  }

  setStep(currentStep + 1);
});

backButton.addEventListener("click", () => {
  setStep(currentStep - 1);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const error = validateStep();

  if (error) {
    errorMessage.textContent = error;
    return;
  }

  const userName = form.name.value.trim();
  successMessage.textContent = `${userName}様、ありがとうございます。相談内容を受け付けました。担当者よりご連絡いたします。`;
  form.reset();
  setTimeout(() => setStep(0), 2600);
});

setStep(0);
