(function () {
  const form = document.getElementById("application-form");
  const formPanel = document.getElementById("form-panel");
  const pathwayScreen = document.getElementById("pathway-screen");
  const pathwayButtons = document.querySelectorAll(".pathway-button");
  const selectedPathwayText = document.getElementById("selected-pathway");
  const selectedPathwayInput = document.getElementById("selected-pathway-input");
  const trainingSection = document.querySelector("[data-training-section]");
  const studentOnlySection = document.querySelector("[data-student-only]");
  const workSection = document.querySelector("[data-work-section]");
  const presentWorkSection = document.querySelector("[data-present-work]");
  const previousWorkSection = document.querySelector("[data-previous-work]");
  const skillsSection = document.querySelector("[data-skills-section]");
  const volunteerSection = document.querySelector("[data-volunteer-section]");
  const languageTestSelect = document.getElementById("language-test");
  const languageTestDetailsSection = document.querySelector("[data-language-test-details]");
  const otherTestField = document.querySelector("[data-other-test-field]");
  const backToPathwaysButton = document.getElementById("back-to-pathways");
  const downloadButton = document.getElementById("download-copy");
  const dateInput = form.querySelector('input[name="Date"]');
  const signatureCanvas = document.getElementById("signature-pad");
  const signatureInput = document.getElementById("signature-data");
  const signatureFileInput = document.getElementById("signature-file");
  const clearSignatureButton = document.getElementById("clear-signature");
  const uploadSignatureInput = document.getElementById("upload-signature");
  const signatureContext = signatureCanvas.getContext("2d");
  let isSigning = false;
  let hasSignature = false;

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  function setFieldGroupDisabled(container, disabled) {
    if (!container) {
      return;
    }

    container.querySelectorAll("input, textarea, select").forEach(function (field) {
      field.disabled = disabled;
    });
  }

  function setSectionVisibility(container, shouldShow) {
    container.classList.toggle("is-hidden", !shouldShow);
    setFieldGroupDisabled(container, !shouldShow);
  }

  function selectPathway(pathway) {
    const isStudent = pathway === "International Student";
    const isTourist = pathway === "Tourist";
    const hideTraining = isStudent || isTourist;

    selectedPathwayInput.value = pathway;
    selectedPathwayText.textContent = `Pathway: ${pathway}`;
    pathwayScreen.classList.add("is-hidden");
    formPanel.classList.remove("is-hidden");
    setSectionVisibility(studentOnlySection, isStudent);
    setSectionVisibility(trainingSection, !hideTraining);
    setSectionVisibility(workSection, !isStudent);
    setSectionVisibility(presentWorkSection, !isStudent);
    setSectionVisibility(previousWorkSection, !isStudent && !isTourist);
    setSectionVisibility(skillsSection, !isTourist);
    setSectionVisibility(volunteerSection, !isTourist);
    setCanvasScale();
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showPathwayMenu() {
    formPanel.classList.add("is-hidden");
    pathwayScreen.classList.remove("is-hidden");
    pathwayScreen.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateLanguageTestFields() {
    const hasSelectedTest = Boolean(languageTestSelect.value);
    const isOther = languageTestSelect.value === "Others";

    languageTestDetailsSection.classList.toggle("is-hidden", !hasSelectedTest);
    otherTestField.classList.toggle("is-hidden", !isOther);
    setFieldGroupDisabled(languageTestDetailsSection, !hasSelectedTest);
    setFieldGroupDisabled(otherTestField, !isOther);
  }

  function setCanvasScale() {
    const rect = signatureCanvas.getBoundingClientRect();
    const image = hasSignature ? signatureCanvas.toDataURL("image/png") : null;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    signatureCanvas.width = Math.round(rect.width * ratio);
    signatureCanvas.height = Math.round(rect.height * ratio);
    signatureContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    signatureContext.lineCap = "round";
    signatureContext.lineJoin = "round";
    signatureContext.lineWidth = 2.4;
    signatureContext.strokeStyle = "#07172b";
    signatureContext.fillStyle = "#ffffff";
    signatureContext.fillRect(0, 0, rect.width, rect.height);

    if (image) {
      const savedSignature = new Image();
      savedSignature.onload = function () {
        signatureContext.drawImage(savedSignature, 0, 0, rect.width, rect.height);
        updateSignatureValue();
      };
      savedSignature.src = image;
    }
  }

  function getCanvasPoint(event) {
    const rect = signatureCanvas.getBoundingClientRect();
    const pointer = event.touches ? event.touches[0] : event;

    return {
      x: pointer.clientX - rect.left,
      y: pointer.clientY - rect.top
    };
  }

  function updateSignatureValue() {
    signatureInput.value = hasSignature ? signatureCanvas.toDataURL("image/png") : "";
  }

  function startSigning(event) {
    event.preventDefault();
    isSigning = true;
    hasSignature = true;
    const point = getCanvasPoint(event);

    signatureContext.beginPath();
    signatureContext.moveTo(point.x, point.y);
  }

  function drawSignature(event) {
    if (!isSigning) {
      return;
    }

    event.preventDefault();
    const point = getCanvasPoint(event);

    signatureContext.lineTo(point.x, point.y);
    signatureContext.stroke();
    updateSignatureValue();
  }

  function stopSigning() {
    if (!isSigning) {
      return;
    }

    isSigning = false;
    updateSignatureValue();
  }

  function clearSignature() {
    const rect = signatureCanvas.getBoundingClientRect();

    signatureContext.clearRect(0, 0, rect.width, rect.height);
    signatureContext.fillStyle = "#ffffff";
    signatureContext.fillRect(0, 0, rect.width, rect.height);
    hasSignature = false;
    updateSignatureValue();
    signatureFileInput.value = "";
    uploadSignatureInput.value = "";
  }

  function uploadSignature(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {
      const uploadedSignature = new Image();

      uploadedSignature.onload = function () {
        const rect = signatureCanvas.getBoundingClientRect();
        const imageRatio = uploadedSignature.width / uploadedSignature.height;
        const canvasRatio = rect.width / rect.height;
        let width = rect.width;
        let height = rect.height;
        let left = 0;
        let top = 0;

        clearSignature();

        if (imageRatio > canvasRatio) {
          height = rect.width / imageRatio;
          top = (rect.height - height) / 2;
        } else {
          width = rect.height * imageRatio;
          left = (rect.width - width) / 2;
        }

        signatureContext.drawImage(uploadedSignature, left, top, width, height);
        hasSignature = true;
        updateSignatureValue();
      };

      uploadedSignature.src = reader.result;
    };

    reader.readAsDataURL(file);
  }

  function downloadPdfCopy() {
    updateSignatureValue();

    if (!selectedPathwayInput.value) {
      alert("Please select an application pathway first.");
      pathwayScreen.classList.remove("is-hidden");
      formPanel.classList.add("is-hidden");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!hasSignature) {
      alert("Please draw or upload the applicant's signature before downloading the PDF copy.");
      signatureCanvas.focus();
      return;
    }

    window.print();
  }

  pathwayButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectPathway(button.dataset.pathway);
    });
  });
  backToPathwaysButton.addEventListener("click", showPathwayMenu);
  setFieldGroupDisabled(studentOnlySection, true);
  setCanvasScale();
  window.addEventListener("resize", setCanvasScale);
  signatureCanvas.addEventListener("mousedown", startSigning);
  signatureCanvas.addEventListener("mousemove", drawSignature);
  window.addEventListener("mouseup", stopSigning);
  signatureCanvas.addEventListener("touchstart", startSigning, { passive: false });
  signatureCanvas.addEventListener("touchmove", drawSignature, { passive: false });
  window.addEventListener("touchend", stopSigning);
  clearSignatureButton.addEventListener("click", clearSignature);
  uploadSignatureInput.addEventListener("change", uploadSignature);
  languageTestSelect.addEventListener("change", updateLanguageTestFields);
  downloadButton.addEventListener("click", downloadPdfCopy);
  updateLanguageTestFields();
})();
