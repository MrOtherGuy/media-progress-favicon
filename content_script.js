'use strict';

(function(){
  
  if(window.favicon != undefined){
    return
  }
  
  function getFavicon(){
    let favicon = undefined;
    let nodeList = document.head.getElementsByTagName("link");
    for (let i = 0; i < nodeList.length; i++){
      let rel = nodeList[i].getAttribute("rel");
      if((rel === "icon") || (rel === "shortcut icon") || (rel === "apple-touch-icon-precomposed")){
        favicon = nodeList[i];
      }
    }
    return favicon;
  }
  
  window.favicon = {
    icon: new Image(),
    update: function(progress){

      CTX.clearRect(0,0,32,32);
      CTX.drawImage(this.icon, 0, 0, 32, 32);
      CTX.beginPath();
      let mp = -Math.PI/2;
      CTX.arc(16, 16, 14, mp, mp + (2 * Math.PI) * progress) ;
      CTX.stroke();
      document.head.querySelector(".jes-playing").href = CTX.canvas.toDataURL("image/x-icon");
    }    
  };
  
  function createCanvas(){
    let canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    let ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#0F0";
    ctx.lineWidth = 4;
    
    return ctx;
  }
  
  function handleMessage(request,sender) {
    sender.envType === "addon_child" && window.favicon.update(request);
  }
  
  window.favicon.icon.setAttribute('crossOrigin','anonymous');
  window.favicon.icon.src = getFavicon().getAttribute("href");
  
  const CTX = createCanvas();
  
  const FAVICON_ELEM = document.createElement('link');
  FAVICON_ELEM.type = 'image/x-icon';
  FAVICON_ELEM.rel = 'shortcut icon';
  FAVICON_ELEM.classList.add("jes-playing");
  document.getElementsByTagName('head')[0].appendChild(FAVICON_ELEM);
  
  browser.runtime.onMessage.addListener(handleMessage);
  
  })();
 