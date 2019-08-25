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
  
  function jee() {
    return 2+2;
  }
  
  window.favicon = {
    icon: new Image(),
    update: function(progress){
      //let canvas = document.createElement('canvas');
      //canvas.width = 32;
      //canvas.height = 32;
      //let ctx = canvas.getContext('2d');
      CTX.clearRect(0,0,32,32);
      CTX.drawImage(this.icon, 0, 0, 32, 32);
      //CTX.restore();
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
    
    //let favicon = new Image();
    //favicon.setAttribute("crossorigin","anonymous");
    //favicon.src = getFavicon().getAttribute("href");
    
    //favicon.onload = (()=>(ctx.drawImage(favicon,0,0,32,32),ctx.save()));
    
    //CTX.drawImage(getFavicon())
    
    return ctx;
  }
  
  function handleMessage(request,sender) {
  //console.log("Message from the content script: " + progress);
  //sendResponse({response: "Response from background script"});
  sender.envType === "addon_child" && window.favicon.update(request);
}
  
  window.favicon.icon.setAttribute('crossOrigin','anonymous');
  window.favicon.icon.src = getFavicon().getAttribute("href");
  
  const CTX = createCanvas();
  //CTX.strokeStyle = "#0F0";
  //CTX.lineWidth = 4;
  
  //window.wrappedJSObject.favicon = cloneInto(window.favicon,window);
  //window.wrappedJSObject.favicon= cloneInto(window.favicon,window,{cloneFunctions:true});
  //exportFunction(window.updateIcon,window,{ defineAs: "updateIcon" });
  
  //exportFunction(()=>(console.log("jee")),window,{defineAs:"testJee"});
  
  const FAVICON_ELEM = document.createElement('link');
  FAVICON_ELEM.type = 'image/x-icon';
  FAVICON_ELEM.rel = 'shortcut icon';
  FAVICON_ELEM.classList.add("jes-playing");
  document.getElementsByTagName('head')[0].appendChild(FAVICON_ELEM);
  
  browser.runtime.onMessage.addListener(handleMessage);
  
  })();
 