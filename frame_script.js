'use strict';

(function(){
  
  function print(obj){
    const DEBUG = true;
    DEBUG && console.log(String(obj))
  }
  
  print(`Running:${window.isFrameObserved}`);
  // early return if the content of the frame has already been initialized
  if(window.isFrameObserved){
    return
  }
  // Mark this frame as observed. Does NOT mean that this is a frame that is producing audio
  // Pausing the video or removing it will cause the frame being un-observed
  // Onplay event makes it being observed again
  // This mechanism is necessary because a video element may get removed while the video is paused or playing
  // And another video may start playback after the video has been removed
 // window.isFrameObserved = true;
  
  const isTopFrame = window.top === window;
  
  // Twitch video streams are near-infinite in length so do some hackery to figure out the current video length...
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
    // Different behavior if video length is over 10 hours
    if(mDuration > 36000){
      if(video.overrideDuration){
        mDuration = video.overrideDuration;
      }else{
        let maybe = getTwitchDuration(video);
        print(maybe);
        if( maybe > 0 ){
          mDuration = maybe;
          // Cache the "real" duration as attribute
          video.overrideDuration = maybe;
          // Remove the cached value when duration changes, example when the source changes
          video.addEventListener("durationchange",(e)=>(print("durationchange"),e.target.overrideDuration=null),{once:true});
        }
      }
    }
    print(mDuration);
    return mDuration
  }
  
  function getProgress(video){
    if(!(video.duration > 0) || video.duration === Infinity){
      return 0
    }
    return video.currentTime / getDuration(video)
  }
  // Find a video element that is playing audio
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

  // This is run once on each interval step
  // arg is an object with progress key that is used to force progress evaluation to some number
  function intervalFn(arg){
    if(document.fullscreen){
      return
    }
    
    let progress;
    
    if(arg){
      progress = arg.progress;
    }else{
      let video = getVideo();
      if(!video){
        print(`video:${String(video)};${video.observed}`);
        
        clearInter();
        progress = 0;
      }else if(!video.observed){
        print(`video:${String(video)};${video.observed}`);
        init(video);
        progress = 0;
      }else{
        progress = getProgress(video);
      }
    }

    // window.favicon.update is is set up by content_script.js for top level frame, use that if available
    // In sub-frames, send a message to extension background-script which then notifies the top level frame
    if(isTopFrame){
      window.favicon.update(progress);
    }else{
      browser.runtime.sendMessage(
        {progress: progress},
      );
    }
  }
  
  function clearInter(e){
    // Mark frame as not being observed so the initialization script will be run once again when the tab starts playing audio again.
    let shouldReinit = !window.isFrameObserved;
    
    window.isFrameObserved = false; 
    clearInterval(INTERVAL);
    if(e.target && !shouldReinit){
      print(e.type);
      intervalFn({progress:0})
    }
    
    if(shouldReinit){
      setTimeout(init,1000);
      print("reinitialized");
    }
  }
  
  function init(vid){
    print("init");
    let video = vid || getVideo();
    if(!video || video.observed){
      return 1 // Return if no video or this video is already being observed
    }else{
      print("adding video events");
      video.addEventListener("play",function(){
        window.isFrameObserved = true;
        !vid && intervalFn(); /* Run once immediately */
        if(INTERVAL){
          clearInterval(INTERVAL);
        }
        INTERVAL = setInterval(intervalFn, getIntervalLength(getDuration(video)));
      });
      video.addEventListener("pause",clearInter);
      video.addEventListener("ended",clearInter);
      video.addEventListener("abort",clearInter);
      //video.addEventListener("fullscreenchange",(e)=>(print("fullscreenchange"),!video.fullscreen && video.observed && intervalFn()));
      Object.defineProperty(video,"observed",{value:true}); // Mark the video because it may get paused or muted
    }
    return 0
  }
  
  /* There's no reason to update the icon each second on long videos so do some mapping */
  function getIntervalLength(duration){
    if( duration < 60 ){ return 1000 }
    else if( duration < 240 ){ return 2000 }
    else{ return 5000 }
  }
  
  let INTERVAL = null;
 // document.addEventListener("load"){  }
  /* Set up interval function only if some video was found to produce audio */
  if(!init()){
    print("init video");
    document.addEventListener("fullscreenchange",(e)=>(print("fullscreenchange"),!document.fullscreen && e.target != document.documentElement && intervalFn()))
    INTERVAL = setInterval(intervalFn, getIntervalLength(getDuration(getVideo())));
    window.isFrameObserved = true;
  }

})();
