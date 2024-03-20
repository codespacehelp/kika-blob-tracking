// Lorem Ipsum dummy text
const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget vestibulum lorem. Nullam at nunc eget nunc luctus congue. Nullam lacinia, neque nec vestibulum luctus, eros elit luctus eros, a accumsan nunc elit eu mi. Phasellus sed sapien et nunc consequat facilisis. Maecenas auctor, purus a finibus tempus, libero purus vulputate nulla, nec ullamcorper nunc justo in nunc. Etiam nec nunc at elit consequat dictum. Nulla auctor, justo in tincidunt tincidunt, neque elit pellentesque elit, ut ultricies libero leo ut nunc. Sed nec elit eu elit egestas lacinia. Nam auctor, elit vel facilisis tempor, nunc elit luctus elit, non molestie elit elit quis nunc. Sed non elit nec elit tincidunt egestas. Donec nec elit elit. Cras nec elit elit. Etiam nec elit elit. Pellentesque elit elit elit. Sed elit elit elit. Donec`;

// Get the video and canvas elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const poster = document.getElementById("poster");

// Load the OpenCV.js library
document.addEventListener("DOMContentLoaded", () => {
  cv["onRuntimeInitialized"] = () => {
    // Get the webcam stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        trackBlobs();
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  };
});

function trackBlobs() {
  // Create a new matrix to store the current frame
  const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

  // Continuously read frames from the video stream
  const processFrame = () => {
    // Read the current frame from the video stream
    ctx.drawImage(video, 0, 0, video.width, video.height);
    const imageData = ctx.getImageData(0, 0, video.width, video.height);
    frame.data.set(imageData.data);

    // Convert the frame to grayscale
    const grayFrame = new cv.Mat();
    cv.cvtColor(frame, grayFrame, cv.COLOR_RGBA2GRAY);

    // Apply thresholding to create a binary image
    const binaryFrame = new cv.Mat();
    cv.threshold(grayFrame, binaryFrame, 160, 255, cv.THRESH_BINARY);

    // Find contours in the binary image
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      binaryFrame,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Remove all elements from SVG
    poster.innerHTML = "";

    // Draw red borders around the detected blobs
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      if (area < 10) continue;
      const rect = cv.boundingRect(contour);
      const [x, y, w, h] = [rect.x, rect.y, rect.width, rect.height];
      cv.rectangle(
        frame,
        new cv.Point(x, y),
        new cv.Point(x + w, y + h),
        new cv.Scalar(255, 0, 0),
        2
      );

      // Add a text element in SVG with random text
      const text = document.createElement("div");
      text.style.position = "absolute";
      text.style.left = `${x}px`;
      text.style.top = `${y}px`;
      text.style.width = `${w}px`;
      text.style.height = `${h}px`;
      text.style.overflow = "hidden";
      text.setAttribute("fill", "red");
      text.innerHTML = loremIpsum;
      poster.appendChild(text);
    }

    // Show the processed frame on the canvas
    // cv.imshow(canvas, binaryFrame);
    cv.imshow(canvas, frame);

    // Clean up
    grayFrame.delete();
    binaryFrame.delete();
    contours.delete();
    hierarchy.delete();

    // Schedule the next frame processing
    requestAnimationFrame(processFrame);
  };

  // Start processing frames
  processFrame();
}
