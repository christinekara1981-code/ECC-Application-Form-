(function () {
  const form = document.getElementById("application-form");
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
  downloadButton.addEventListener("click", downloadPdfCopy);
})();
