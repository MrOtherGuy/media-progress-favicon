'use strict';

(function(){
  if(window.faviconFrame){
    return
  }
  window.faviconFrame = true;
  
  const isTopFrame = window.top === window;
  
  function getTwitchDuration(video){
    let el = document.querySelector(".js-player-slider");
    if(!el){
      return -1
    }
    let duration = el.getAttribute("aria-valuemax");
    if(!duration){
      return -1
    }    
    return Number(duration)
  }
  
  function getDuration(video){
    let mDuration = video.duration;
    if(mDuration > 36000){
      if(video.overrideDuration){
        mDuration = video.overrideDuration;
      }else{
        let maybe = getTwitchDuration(video);
        if( maybe > 0 ){
          mDuration = maybe;
          
          video.overrideDuration = maybe;
          video.addEventListener("durationchange",(e)=>(e.target.overrideDuration=null),{once:true});
        }
      }
    }
    return mDuration
  }
  
  function getProgress(video){
    if(!video.duration || video.duration === Infinity){
      return 0
    }
    let mDuration = getDuration(video);
    
    return video.currentTime / mDuration
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
      video.addEventListener("play",function(){ window.faviconFrame = true; edit(); intervalFn = setInterval(edit,getIntervalLength(getDuration(video))) });
      video.addEventListener("pause",clearInter);
      video.addEventListener("ended",clearInter);
      video.addEventListener("abort",clearInter);
      Object.defineProperty(video,"observed",{value:true});
    }
    return 0
  }
  
  function getIntervalLength(duration){
    if( duration < 60 ){ return 1000 }
    else if( duration < 240 ){ return 2000 }
    else{ return 5000 }
  }
  
  let intervalFn = null;

  if(!init()){
    intervalFn = setInterval(edit,getIntervalLength(getDuration(getVideo())));
  }

})();
