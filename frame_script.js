'use strict';

(function(){
  if(window.faviconFrame){
    return
  }
  window.faviconFrame = true;
  
  const isTopFrame = window.top === window;

  function getProgress(a){
    if(!a.duration){
      return 0
    }
    return a.currentTime/a.duration
  }

  function getVideo(){
    let videos = document.getElementsByTagName("video");
    let selectedVideo = null;
    for(let video of videos){
      if(video.mozHasAudio && !video.muted){
        selectedVideo = video;
        break;
      }
    }
    return selectedVideo
  }

  function edit(arg){
    let video = getVideo();
    if(!arg && (!video || document.fullscreen)){
      window.faviconFrame = false;
      return
    }
    
    let progress = arg ? arg.progress : getProgress(video);
    
    if(isTopFrame){
      window.favicon.update(progress);
    }else{
      browser.runtime.sendMessage(
        {progress: progress},
      );
    }
  }
  
  function clearInter(runEdit){
    window.faviconFrame = false;
    if(runEdit){
      edit({progress:0});
    }
    clearInterval(intervalFn);
  }
  
  function init(){
    let video = getVideo();
    if(!video || video.observed){
      return 1
    }else{
      video.addEventListener("play",function(){ window.faviconFrame = true; intervalFn = setInterval(edit,2000) });
      video.addEventListener("pause",clearInter);
      video.addEventListener("ended",clearInter);
      video.addEventListener("abort",clearInter);
      Object.defineProperty(video,"observed",{value:true});
    }
    return 0
  }
  
  let intervalFn = null;

  if(!init()){
    intervalFn = setInterval(edit,2000);
  }

})();
