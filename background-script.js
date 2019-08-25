'use strict';
function handleMutedChange(tabId, changeInfo, tabInfo){
  if(changeInfo.audible){
    addScript({tabId:tabId});
    addScript({tabId:tabId,allFrames:true});
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
  // From content asking for tab status
  case "content_child":
    browser.tabs.sendMessage(sender.tab.id,request.progress/*,{frameId:-1}*/);
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

browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.onUpdated.addListener(handleMutedChange,{properties:["audible"]});