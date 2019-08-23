(function(){
  if(window.faviconFrame != undefined){
    return
  }
  window.faviconFrame = true;
  const VIDEOS = document.getElementsByTagName("video");

  function getProgress(a){
    if(!a.duration){
      return
    }
    return a.currentTime/a.duration
  }

  function edit(){
    top.favicon.update(getProgress(VIDEOS[0]));
  }

  if(!VIDEOS){
    return
  }
  
  let intervalFn = setInterval(edit,2000);
    
    
  VIDEOS[0].addEventListener("play",function(){ intervalFn = setInterval(edit,2000) });
  VIDEOS[0].addEventListener("pause",function(){ clearInterval(intervalFn) });
  VIDEOS[0].addEventListener("ended",function(){ clearInterval(intervalFn) });
})();
