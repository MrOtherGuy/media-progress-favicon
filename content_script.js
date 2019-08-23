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
      let canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(this.icon, 0, 0, 32, 32);
      ctx.strokeStyle = "#0F0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      let mp = -Math.PI/2;
      ctx.arc(16, 16, 14, mp, mp + (2 * Math.PI) * progress) ;
      ctx.stroke();
      document.head.querySelector(".jes-playing").href = canvas.toDataURL("image/x-icon");
    }
  };
  
  window.favicon.icon.setAttribute('crossOrigin','anonymous');
  window.favicon.icon.src = getFavicon().getAttribute("href");
  
  let FAVICON_ELEM = document.createElement('link');
  FAVICON_ELEM.type = 'image/x-icon';
  FAVICON_ELEM.rel = 'shortcut icon';
  FAVICON_ELEM.classList.add("jes-playing");
  document.getElementsByTagName('head')[0].appendChild(FAVICON_ELEM);
  
  
  
  })();
 