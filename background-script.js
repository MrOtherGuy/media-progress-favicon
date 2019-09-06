'use strict';

function handleMutedChange(tabId, changeInfo, tabInfo){
  console.log(changeInfo);
  if(changeInfo.audible){
    addScript({tabId:tabId}); // Add a script to top frame that handles modifying the favicon
    addScript({tabId:tabId,allFrames:true}); // Add a script to all frames that determines playback progress
  }
}

function addScript(details){
  let scriptFile = details.allFrames ? "frame_script.js" : "content_script.js";
  browser.tabs.executeScript(details.tabId,{ file: scriptFile, allFrames: !!details.allFrames });
}

function handleMessage(request,sender){
  if(sender.id != browser.runtime.id){
    return
  }
  switch(sender.envType){
  // Pass progress message from sub-frame to top-frame
  case "content_child":
    browser.tabs.sendMessage(sender.tab.id,request.progress);
    break;
  // update options based on message from options document
  case "addon_child":
    //setOptions(request.SBOptions);
    break;
  default:
    console.log("unhandled message from:" + sender.envType);
  }
  return
};

// Listen for messages from frame_script.js
browser.runtime.onMessage.addListener(handleMessage);
// Don't do anything until some tab starts playing sound
browser.tabs.onUpdated.addListener(handleMutedChange,{properties:["audible"]});