'use strict';

(function(){
  if(window.faviconFrame){
    return
  }
  window.faviconFrame = true;
  
  //const VIDEOS = document.getElementsByTagName("video");
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

  function edit(){
    let video = getVideo();
    if(!video || document.fullscreen){
      return
    }
    if(isTopFrame){
      window.favicon.update(getProgress(video));
    }else{
      browser.runtime.sendMessage(
        {progress: getProgress(video)},
      );
    }
  }

  if(!getVideo()){
    return
  }
  
  let intervalFn = setInterval(edit,2000);
  
  VIDEOS[0].addEventListener("play",function(){ intervalFn = setInterval(edit,2000) });
  VIDEOS[0].addEventListener("pause",function(){ clearInterval(intervalFn) });
  VIDEOS[0].addEventListener("ended",function(){ clearInterval(intervalFn) });
  
})();
