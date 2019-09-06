'use strict';

(function(){
  
  if(window.favicon != undefined){
    return // Don't do anything if this script has already been run
  }
  
  function getFavicon(){
    let favicon = undefined;
    let nodeList = document.head.getElementsByTagName("link");
    for (let i = 0; i < nodeList.length; i++){
      let rel = nodeList[i].getAttribute("rel");
      if((rel === "icon") || (rel === "shortcut icon") || (rel === "apple-touch-icon-precomposed")){
        favicon = nodeList[i];
        break;
      }
    }
    return favicon;
  }
  
  function createLinkElement(){
    let FAVICON_ELEM = document.createElement('link');
    FAVICON_ELEM.type = 'image/x-icon';
    FAVICON_ELEM.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(FAVICON_ELEM);
    return FAVICON_ELEM
  }
  // Store the data in window.favicon property, not visible to page scripts
  window.favicon = {
    icon: new Image(),
    element: createLinkElement(),
    update: function(progress){
      // CTX is a constant reference to canvas2dcontext where the modified favicon is drawn to
      CTX.clearRect(0,0,32,32);
      CTX.drawImage(this.icon, 0, 0, 32, 32);
      if(progress){
        CTX.beginPath();
        let mp = -Math.PI/2;
        CTX.arc(16, 16, 14, mp, mp + (2 * Math.PI) * progress) ;
        CTX.stroke();
      }
      this.element.href = CTX.canvas.toDataURL("image/x-icon");
    }    
  };
  
  function createCanvas(x,y){
    
    let canvas = document.createElement("canvas");
    canvas.width = x;
    canvas.height = y;
    let ctx = canvas.getContext("2d");
    return ctx;
  }
  // Create a 2x2 canvas to draw downsampled favicon image to
  // Then get the color values from the bottom-right pixel
  function getColorForImage(image){
    let canvas = createCanvas(2,2);
    canvas.drawImage(image,0,0,2,2);
    let imdata = canvas.getImageData(1,1,1,1).data;
    let pixels = imdata.map((a)=>(a^0xff));
    let diff = [];
    for(let i = 0; i < 3; i++){
      diff[i] = Math.abs(imdata[i] - pixels[i]);
    }
    // if difference of every r,g,b value and the inverted ones is less than 40 then draw the progress as red 
    return diff.every((a)=>(a < 40)) ? "rgb(255,0,0)" : `rgb(${pixels[0]},${pixels[1]},${pixels[2]})`;
  }
  
  function createFaviconCanvas(){
    let canvas = createCanvas(32,32);
    let icon = window.favicon.icon;
    icon.decode().then(function(){ canvas.strokeStyle = getColorForImage(icon) });
    canvas.lineWidth = 4;
    return canvas
  }
  
  // Listen to messages from background script
  // This is used to pass in the progress from sub-frames
  function handleMessage(request,sender) {
    sender.envType === "addon_child" && window.favicon.update(request);
  }
  
  window.favicon.icon.setAttribute('crossOrigin','anonymous');
  window.favicon.icon.src = getFavicon().getAttribute("href");
  
  const CTX = createFaviconCanvas(32,32);
  
  browser.runtime.onMessage.addListener(handleMessage);
  
  })();
 