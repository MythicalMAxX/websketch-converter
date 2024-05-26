import { streamGemini } from './gemini-api.js';

document.addEventListener('DOMContentLoaded', () => {
  const imageUploadInput = document.getElementById('image-upload');
  const imageContainer = document.getElementById('image-container');
  const imageUploadContainer = document.getElementById('image-upload-container');
  const htmlOutput = document.getElementById('html-output');
  const copyButton = document.getElementById('copy-button');
  const loadingIndicator = document.getElementById('loading');
  const spinner = document.getElementById('spinner');
  const form = document.getElementById('image-form');
  const codeOutputSection = document.getElementById('code-output');
  const fixedPrompt = "Convert the image into HTML, CSS and JavaScript equivalent code. If the image can't be converted, return 'failed to process image'. Use internal CSS and Javascript, add proper styling, include all the features, Make the code fully functional."; // Set your fixed prompt here

  imageUploadInput.addEventListener('change', handleImageUpload);
  imageUploadContainer.addEventListener('click', () => imageUploadInput.click());
  form.addEventListener('submit', generateCode);
  copyButton.addEventListener('click', copyToClipboard);

  // Drag and Drop functionality
  imageUploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadContainer.classList.add('dragover');
  });

  imageUploadContainer.addEventListener('dragleave', () => {
    imageUploadContainer.classList.remove('dragover');
  });

  imageUploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadContainer.classList.remove('dragover');
    handleImageUpload(e);
  });

  function handleImageUpload(event) {
    let files;
    if (event.type === 'drop') {
      files = event.dataTransfer.files;
    } else {
      files = event.target.files;
    }

    imageContainer.innerHTML = ''; // Clear any existing images

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        displayError(`File ${file.name} is not a valid image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;
        imageContainer.appendChild(img);
        console.log(`Uploaded image: ${file.name}`);
      };
      reader.onerror = () => displayError(`Failed to read file: ${file.name}`);
      reader.readAsDataURL(file);
    });
  }

  async function generateCode(event) {
    event.preventDefault();
    const images = imageContainer.querySelectorAll('img');
    if (images.length === 0) {
      displayError('No images uploaded.');
      return;
    }

    htmlOutput.innerHTML = '';
    loadingIndicator.style.display = 'block';
    spinner.style.display = 'block';
    copyButton.style.display = 'none';
    codeOutputSection.style.display = 'none';

    try {
      const imageUrl = images[0].src; // Assuming one image for simplicity
      const imageBase64 = await fetch(imageUrl)
        .then(r => r.arrayBuffer())
        .then(a => base64js.fromByteArray(new Uint8Array(a)));

      const contents = [
        {
          type: "text",
          text: fixedPrompt,
        },
        {
          type: "image_url",
          image_url: `data:image/jpeg;base64,${imageBase64}`,
        },
      ];

      const stream = streamGemini({
        model: 'gemini-pro-vision',
        contents,
      });

      let buffer = [];
      for await (let chunk of stream) {
        buffer.push(chunk);
      }
      const generatedCode = buffer.join('');
      htmlOutput.innerHTML = generatedCode;
      copyButton.style.display = 'block';
      codeOutputSection.style.display = 'block';
    } catch (e) {
      displayError(`Error generating code: ${e.message}`);
    } finally {
      loadingIndicator.style.display = 'none';
      spinner.style.display = 'none';
      form.style.display = 'block';
      imageUploadContainer.style.display = 'flex';
      htmlOutput.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function copyToClipboard() {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = htmlOutput.innerHTML;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    alert('HTML code copied to clipboard');
  }

  function displayError(message) {
    alert(message);
  }
});
