'use strict';

(function(){
  
  function print(obj){
    const DEBUG = false;
    DEBUG && console.log(String(obj))
  }
  
  print(`Running:${window.isFrameObserved}`);
  // early return if the content of the frame has already been initialized
  if(window.isFrameObserved){
    return
  }
  // Mark this frame as observed. Does NOT mean that this is a frame that is producing audio
  // Pausing the media or removing it will cause the frame being un-observed
  // Onplay event makes it being observed again
  // This mechanism is necessary because a media element may get removed while the media is paused or playing
  // And another media may start playback after the media has been removed
 
 // DON'T ACTUALLY SET THIS NOW since doing so might set a frame observed that does not play audio now but might in the future
 // window.isFrameObserved = true;
  
  // SCENARIOS that can happen
  // *************************
  // source of <media> changes
  // new <media> is added before old is removed
  // new <media> is added after old is removed
  // new <media> is added while the old on is paused
  // frame that has <media> is removed (which doesn't trigger events)
  // the tab may never become inaudible between <media> changes so can't rely on this function being always run
  // ...more...
  
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
  
  function getDuration(media){
    let mDuration = media.duration;
    // Different behavior if media length is over 10 hours
    if(mDuration > 36000){
      if(media.overrideDuration){
        mDuration = media.overrideDuration;
      }else{
        let maybe = getTwitchDuration(media);
        print(maybe);
        if( maybe > 0 ){
          mDuration = maybe;
          // Cache the "real" duration as attribute
          media.overrideDuration = maybe;
          // Remove the cached value when duration changes, example when the source changes
          media.addEventListener("durationchange",(e)=>(print("durationchange"),e.target.overrideDuration=null),{once:true});
        }
      }
    }
    print(mDuration);
    return mDuration
  }
  
  function getProgress(media){
    if(!(media.duration > 0) || media.duration === Infinity){
      return 0
    }
    return media.currentTime / getDuration(media)
  }
  // Find a media element that is playing audio
  function getMedia(){
    let media = document.getElementsByTagName("video");
    let selectedMedia = null;
    for(let video of media){
      if(video.mozHasAudio && !video.muted){
        selectedMedia = video;
        break;
      }
    }
    if(!selectedMedia){
      media = document.getElementsByTagName("audio");
      for(let audio of media){
        if(!audio.muted){
          selectedMedia = audio;
          break;
        }
      }
    }
    return selectedMedia
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
      let media = getMedia();
      if(!media){
        print(`video:${String(media)};${media.observed}`);
        
        clearInter();
        progress = 0;
      }else if(!media.observed){
        print(`media:${String(media)};${media.observed}`);
        init(media);
        progress = 0;
      }else{
        progress = getProgress(media);
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
  
  function init(_media){
    print("init");
    let media = _media || getMedia();
    if(!media || media.observed){
      return 1 // Return if no video or this video is already being observed
    }else{
      print("adding video events");
      media.addEventListener("play",function(){
        window.isFrameObserved = true;
        !_media && intervalFn(); /* Run once immediately */
        if(INTERVAL){
          clearInterval(INTERVAL);
        }
        INTERVAL = setInterval(intervalFn, getIntervalLength(getDuration(media)));
      });
      media.addEventListener("pause",clearInter);
      media.addEventListener("ended",clearInter);
      media.addEventListener("abort",clearInter);
      //video.addEventListener("fullscreenchange",(e)=>(print("fullscreenchange"),!video.fullscreen && video.observed && intervalFn()));
      Object.defineProperty(media,"observed",{value:true}); // Mark the video because it may get paused or muted
    }
    return 0
  }
  
  /* There's no reason to update the icon each second on long videos so do some mapping */
  function getIntervalLength(duration){
    if (duration < 1){ return 10000 }
    else if( duration < 60 ){ return 1000 }
    else if( duration < 240 ){ return 2000 }
    else{ return 5000 }
  }
  
  let INTERVAL = null;
 // document.addEventListener("load"){  }
  /* Set up interval function only if some video was found to produce audio */
  if(!init()){
    print("init video");
    document.addEventListener("fullscreenchange",(e)=>(print("fullscreenchange"),!document.fullscreen && e.target != document.documentElement && intervalFn()))
    INTERVAL = setInterval(intervalFn, getIntervalLength(getDuration(getMedia())));
    window.isFrameObserved = true;
  }

})();
