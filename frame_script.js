'use strict';

(function(){
  if(window.faviconFrame){
    return
  }
  window.faviconFrame = true;
  
  const VIDEOS = document.getElementsByTagName("video");
  const isTopFrame = window.top === window;
  //let TABID = null;

  function getProgress(a){
    if(!a.duration){
      return
    }
    return a.currentTime/a.duration
  }

  function edit(){
    if(!VIDEOS[0] || document.fullscreen){
      return
    }
    if(isTopFrame){
    //window.top.testJee();
      window.favicon.update(getProgress(VIDEOS[0]));
    }else{
      browser.runtime.sendMessage(
        {progress: getProgress(VIDEOS[0])},
      );
    }
  }

  if(!VIDEOS.length){
    return
  }
  
  //browser.tabs.getCurrent().then(function(tab){ TABID = tab.id });
  
  let intervalFn = setInterval(edit,2000);
    
    
  VIDEOS[0].addEventListener("play",function(){ intervalFn = setInterval(edit,2000) });
  VIDEOS[0].addEventListener("pause",function(){ clearInterval(intervalFn) });
  VIDEOS[0].addEventListener("ended",function(){ clearInterval(intervalFn) });
  /*
  function notifyBackgroundPage(e) {
  var sending = browser.runtime.sendMessage({
    greeting: "Greeting from the content script"
  });
  sending.then(handleResponse, handleError);  
}*/
  
  
  
})();
//browser.tabs.getCurrent().then(function(tab){ console.log(tab) });
