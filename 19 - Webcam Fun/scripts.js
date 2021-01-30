const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

async function getVideo() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({video: true});
  video.srcObject = mediaStream;
  video.play();
}

function paintToCanvas() {
  let {width, height} = video.srcObject.getTracks()[0].getSettings();

  canvas.width = width;
  canvas.height = height;

  setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);

    // take pixels out
    let pixels = ctx.getImageData(0,0,width, height);

    // filter them red
    // pixels = redEffect(pixels);

    //split pixels
    // pixels = rgbSplit(pixels);

    //green screen
    pixels = greenScreen(pixels);

    // replace pixels
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="Handsome Man"/>`;
  strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
  for (let i = 0 ; i < pixels.data.length; i +=4) {
    pixels.data[i] = pixels.data[i] + 100; //RED
    pixels.data[i+1] = pixels.data[i+1] -50; //GREEN
    pixels.data[i+2] = pixels.data[i+2] * 0.5; //BLUE
  }
  return pixels
}

function rgbSplit(pixels) {
  for (let i = 0 ; i < pixels.data.length; i +=4) {
    pixels.data[i - 150] = pixels.data[i]; //RED
    pixels.data[i + 100] = pixels.data[i+1]; //GREEN
    pixels.data[i - 250] = pixels.data[i+2]; //BLUE
  }
  return pixels
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;

}


getVideo();

video.addEventListener("canplay", paintToCanvas);
